# e-Quran

Aplikasi Al-Qur'an digital berbahasa Indonesia: baca surah, dengarkan murottal, dan lihat kalender Hijriyah.

- **Backend**: Go (hanya library bawaan)
- **Frontend**: Vue 3 + Vite + Vue Router
- **Tanpa login**: data pribadi (penanda terakhir dibaca, pengaturan tampilan) disimpan di browser pengguna.

## Fitur

### Sudah tersedia (V1)
- Daftar 114 surah dengan pencarian (nama, arti, nomor)
- Halaman surah: teks Arab, latin, terjemahan Indonesia
- Audio murottal per ayat dengan pilihan qari
- Kalender Hijriyah bulanan lengkap dengan hari besar Islam
- Mode terang/gelap mengikuti pengaturan perangkat

### Direncanakan
| Rilis | Fitur |
|-------|-------|
| V1 lanjutan | Jadwal sholat per kota |
| V2 | Tafsir, pengingat adzan, jadwal puasa sunnah |
| V3 | Penanda dan catatan ayat, tracker tilawah, pencarian ayat di seluruh Al-Qur'an, ayat harian |
| V4 | Arah kiblat, dzikir, doa harian, mode hafalan |
| V5 | Tajwid berwarna, kuis surah, asbabun nuzul |

## Struktur repo

```
.
├── docs/
│   └── openapi.yaml        # rencana kontrak API (sebagian belum diimplementasikan)
├── backend/
│   ├── cmd/server/         # titik masuk
│   └── internal/
│       ├── config/         # pembacaan environment variable
│       ├── cache/          # cache memori dengan TTL
│       ├── quran/          # client + service data surah (equran.id)
│       ├── hijri/          # konversi, kalender, hari besar
│       ├── handler/        # route dan handler HTTP
│       └── middleware/     # recover, logger, CORS
└── frontend/
    └── src/
        ├── api/            # pemanggil API backend
        ├── router/
        ├── views/          # halaman
        ├── components/
        └── assets/
```

## Menjalankan di lokal

Prasyarat: **Go 1.22+** dan **Node.js 20.19+** (atau 22.12+).

Backend:

```bash
cd backend
go test ./...
go run ./cmd/server
```

Frontend (terminal lain):

```bash
cd frontend
npm install
npm run dev
```

Buka http://localhost:5173. Vite meneruskan permintaan `/api` ke backend di `localhost:8080`.

## Konfigurasi backend

Dibaca dari environment variable (bukan dari file `.env`).

| Variabel | Bawaan | Keterangan |
|----------|--------|------------|
| `PORT` | `8080` | Port server |
| `EQURAN_BASE_URL` | `https://equran.id/api/v2` | Sumber data surah |
| `CORS_ORIGIN` | `http://localhost:5173` | Asal frontend yang diizinkan |
| `CACHE_TTL_HOURS` | `24` | Lama cache data surah |
| `TIMEZONE` | `Asia/Jakarta` | Zona waktu untuk "hari ini" |
| `HIJRI_OFFSET` | `0` | Koreksi tanggal Hijriyah (-2 sampai 2 hari) |

Contoh (PowerShell):

```powershell
$env:HIJRI_OFFSET="1"; go run ./cmd/server
```

Contoh (Linux/macOS):

```bash
HIJRI_OFFSET=1 go run ./cmd/server
```

## Endpoint yang sudah berjalan

Semua respons berbentuk `{ "data": ..., "error": ... }`.

| Method | Path | Keterangan |
|--------|------|------------|
| GET | `/api/v1/health` | Cek status server |
| GET | `/api/v1/surahs?q=` | Daftar surah, filter opsional |
| GET | `/api/v1/surahs/{nomor}` | Detail surah (ayat dan audio) |
| GET | `/api/v1/hijri/today` | Tanggal Hijriyah hari ini |
| GET | `/api/v1/hijri/calendar?year=&month=` | Kalender bulanan |
| GET | `/api/v1/hijri/convert?gregorian=` atau `?hijri=` | Konversi tanggal |
| GET | `/api/v1/hijri/events?year=` | Hari besar dalam satu tahun |

## Catatan kalender Hijriyah

Tanggal dihitung dengan metode tabular (aritmetika), sehingga bisa berbeda satu hari dari penetapan Kemenag. Gunakan `HIJRI_OFFSET` untuk koreksi.

## Sumber data

Teks, terjemahan, dan audio Al-Qur'an diambil dari API [equran.id](https://equran.id). Repo ini hanya berisi kode, bukan salinan datanya. Penggunaan data mengikuti ketentuan dari equran.id.

## Lisensi

Belum ditentukan.
