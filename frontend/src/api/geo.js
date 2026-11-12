// Deteksi lokasi (izin browser) lalu cocokkan ke daftar provinsi/kota dari backend.
const strip = (s) =>
  (s ?? "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
const clean = (s) =>
  strip(s)
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const PROV_ALIAS = {
  "daerah khusus ibukota jakarta": "dki jakarta",
  "jakarta capital region": "dki jakarta",
  jakarta: "dki jakarta",
  "daerah istimewa yogyakarta": "di yogyakarta",
  "special region of yogyakarta": "di yogyakarta",
  yogyakarta: "di yogyakarta",
};
const provCore = (s) => {
  const v = clean(s).replace(/^provinsi /, "");
  return PROV_ALIAS[v] ?? v;
};
const cityCore = (s) =>
  clean(s).replace(
    /^(kabupaten|kab|kota administrasi|kota adm|kota|city of|city|regency) /,
    "",
  );
const cityType = (s) =>
  /^\s*(kota|city)/i.test(s)
    ? "kota"
    : /^\s*(kab|regency)/i.test(s)
      ? "kab"
      : "";

export function getPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation)
      return reject(new Error("Browser ini tidak mendukung deteksi lokasi."));
    navigator.geolocation.getCurrentPosition(
      (p) => resolve(p.coords),
      (e) =>
        reject(
          new Error(
            e.code === 1
              ? "Izin lokasi ditolak. Aktifkan lewat pengaturan situs, atau pilih wilayah secara manual."
              : e.code === 3
                ? "Pencarian lokasi terlalu lama. Coba lagi."
                : "Lokasi tidak tersedia. Pilih wilayah secara manual.",
          ),
        ),
      { timeout: 12000, maximumAge: 600000 },
    );
  });
}

// Koordinat dikirim ke OpenStreetMap Nominatim untuk diubah menjadi nama wilayah
export async function reverseGeocode(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=10&addressdetails=1&accept-language=id&lat=${lat}&lon=${lon}`;
  let res;
  try {
    res = await fetch(url);
  } catch {
    throw new Error(
      "Tidak dapat mengenali nama wilayah. Periksa koneksi internet Anda.",
    );
  }
  if (!res.ok)
    throw new Error("Gagal mengenali nama wilayah dari lokasi Anda.");
  return (await res.json()).address ?? {};
}

export function findProvince(addr, provinces) {
  const want = provCore(addr.state ?? addr.region ?? "");
  if (!want) return null;
  return (
    provinces.find((p) => provCore(p) === want) ??
    provinces.find(
      (p) => provCore(p).includes(want) || want.includes(provCore(p)),
    ) ??
    null
  );
}

export function findCity(addr, cities) {
  const cands = [
    ["kota", addr.city],
    ["kab", addr.county],
    ["kab", addr.regency],
    ["", addr.municipality],
    ["", addr.town],
    ["", addr.state_district],
  ].filter(([, v]) => v);
  let best = null;
  let bestScore = 0;
  for (const c of cities) {
    const core = cityCore(c);
    const type = cityType(c);
    for (const [pref, v] of cands) {
      if (cityCore(v) !== core) continue;
      const score = 2 + (pref && pref === type ? 1 : 0);
      if (score > bestScore) {
        best = c;
        bestScore = score;
      }
    }
  }
  return best;
}
