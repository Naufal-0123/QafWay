// Cari masjid/musholla terdekat lewat Overpass API (data OpenStreetMap, gratis tanpa API key).
// Koordinat pengguna dikirim langsung dari browser ke server Overpass.
const ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];
const CACHE_TTL = 10 * 60 * 1000; // 10 menit
const SMALL_PRAYER_HALL =
  /\b(musholla|mushola|mushalla|musala|mushallah|langgar|surau)\b/i;

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(lat2 - lat1);
  const dLon = rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function buildQuery(lat, lon, radiusM) {
  const f = `["amenity"="place_of_worship"]["religion"="muslim"](around:${radiusM},${lat},${lon})`;
  return `[out:json][timeout:20];(node${f};way${f};relation${f};);out center tags 200;`;
}

function addressOf(t) {
  const parts = [
    [t["addr:street"], t["addr:housenumber"]].filter(Boolean).join(" "),
    t["addr:suburb"] || t["addr:village"],
    t["addr:city"] || t["addr:subdistrict"],
  ].filter(Boolean);
  return parts.join(", ");
}

function normalize(el, lat, lon) {
  const t = el.tags ?? {};
  const eLat = el.lat ?? el.center?.lat;
  const eLon = el.lon ?? el.center?.lon;
  if (eLat == null || eLon == null) return null;
  const name = t.name || t["name:id"] || "";
  return {
    id: `${el.type}/${el.id}`,
    name: name || "Tempat ibadah tanpa nama",
    unnamed: !name,
    kind: SMALL_PRAYER_HALL.test(name) ? "musholla" : "masjid",
    address: addressOf(t),
    lat: eLat,
    lon: eLon,
    km: haversineKm(lat, lon, eLat, eLon),
  };
}

function readCache(key) {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const { at, data } = JSON.parse(raw);
    return Date.now() - at < CACHE_TTL ? data : null;
  } catch {
    return null;
  }
}
function writeCache(key, data) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ at: Date.now(), data }));
  } catch {
    /* abaikan */
  }
}

async function fetchOverpass(query) {
  let lastErr;
  for (const base of ENDPOINTS) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 22000);
    try {
      const res = await fetch(`${base}?data=${encodeURIComponent(query)}`, {
        signal: ctrl.signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      lastErr = e;
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastErr ?? new Error("gagal");
}

export async function findNearbyMosques(lat, lon, radiusKm = 2) {
  const key = `qafway-masjid:${lat.toFixed(3)},${lon.toFixed(3)},${radiusKm}`;
  const cached = readCache(key);
  if (cached) return cached;

  let json;
  try {
    json = await fetchOverpass(buildQuery(lat, lon, radiusKm * 1000));
  } catch {
    throw new Error(
      "Gagal mengambil data masjid. Periksa koneksi internet lalu coba lagi.",
    );
  }

  const seen = new Set();
  const list = (json.elements ?? [])
    .map((el) => normalize(el, lat, lon))
    .filter((m) => m && !seen.has(m.id) && seen.add(m.id))
    .sort((a, b) => a.km - b.km);

  writeCache(key, list);
  return list;
}

export const mapsLink = (m) =>
  `https://www.google.com/maps/dir/?api=1&destination=${m.lat},${m.lon}`;

export function formatDistance(km) {
  return km < 1 ? `${Math.round(km * 100) * 10} m` : `${km.toFixed(1)} km`;
}
