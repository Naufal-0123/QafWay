// Awal setiap juz (mushaf standar 30 juz): nomor surah dan nomor ayat.
// Data statis, tidak perlu API.
export const JUZ = [
  { juz: 1, surah: 1, ayat: 1, nama: "Alif Lam Mim" },
  { juz: 2, surah: 2, ayat: 142, nama: "Sayaqul" },
  { juz: 3, surah: 2, ayat: 253, nama: "Tilkar Rusul" },
  { juz: 4, surah: 3, ayat: 93, nama: "Lan Tanalu" },
  { juz: 5, surah: 4, ayat: 24, nama: "Wal Muhsanat" },
  { juz: 6, surah: 4, ayat: 148, nama: "La Yuhibbullah" },
  { juz: 7, surah: 5, ayat: 82, nama: "Wa Idza Samiu" },
  { juz: 8, surah: 6, ayat: 111, nama: "Wa Lau Annana" },
  { juz: 9, surah: 7, ayat: 88, nama: "Qalal Mala'" },
  { juz: 10, surah: 8, ayat: 41, nama: "Wa A'lamu" },
  { juz: 11, surah: 9, ayat: 93, nama: "Ya'taziruna" },
  { juz: 12, surah: 11, ayat: 6, nama: "Wa Ma Min Dabbah" },
  { juz: 13, surah: 12, ayat: 53, nama: "Wa Ma Ubarri'u" },
  { juz: 14, surah: 15, ayat: 1, nama: "Rubama" },
  { juz: 15, surah: 17, ayat: 1, nama: "Subhanalladzi" },
  { juz: 16, surah: 18, ayat: 75, nama: "Qala Alam" },
  { juz: 17, surah: 21, ayat: 1, nama: "Iqtaraba" },
  { juz: 18, surah: 23, ayat: 1, nama: "Qad Aflaha" },
  { juz: 19, surah: 25, ayat: 21, nama: "Wa Qalalladzina" },
  { juz: 20, surah: 27, ayat: 56, nama: "A'man Khalaqa" },
  { juz: 21, surah: 29, ayat: 46, nama: "Utlu Ma Uhiya" },
  { juz: 22, surah: 33, ayat: 31, nama: "Wa Man Yaqnut" },
  { juz: 23, surah: 36, ayat: 28, nama: "Wa Mali" },
  { juz: 24, surah: 39, ayat: 32, nama: "Faman Azlamu" },
  { juz: 25, surah: 41, ayat: 47, nama: "Ilayhi Yuraddu" },
  { juz: 26, surah: 46, ayat: 1, nama: "Ha Mim" },
  { juz: 27, surah: 51, ayat: 31, nama: "Qala Fama Khatbukum" },
  { juz: 28, surah: 58, ayat: 1, nama: "Qad Sami'allah" },
  { juz: 29, surah: 67, ayat: 1, nama: "Tabarakalladzi" },
  { juz: 30, surah: 78, ayat: 1, nama: "Amma" },
];

// Juz tempat sebuah ayat berada (untuk label di kartu "Terakhir dibaca").
export function juzOf(surah, ayat) {
  let found = 1;
  for (const j of JUZ) {
    if (j.surah < surah || (j.surah === surah && j.ayat <= ayat)) found = j.juz;
    else break;
  }
  return found;
}

// Ayat terakhir tiap juz = satu ayat sebelum awal juz berikutnya.
// `surahs` = daftar dari API (butuh nomor, namaLatin, jumlahAyat).
export function buildJuzList(surahs) {
  const byNo = Object.fromEntries(surahs.map((s) => [s.nomor, s]));
  const nameOf = (n) => byNo[n]?.namaLatin ?? `Surah ${n}`;
  return JUZ.map((j, i) => {
    const next = JUZ[i + 1];
    let endSurah = 114;
    let endAyat = byNo[114]?.jumlahAyat ?? 6;
    if (next) {
      if (next.ayat > 1) {
        endSurah = next.surah;
        endAyat = next.ayat - 1;
      } else {
        endSurah = next.surah - 1;
        endAyat = byNo[endSurah]?.jumlahAyat ?? 1;
      }
    }
    return {
      ...j,
      from: `${nameOf(j.surah)} ${j.ayat}`,
      to: `${nameOf(endSurah)} ${endAyat}`,
    };
  });
}