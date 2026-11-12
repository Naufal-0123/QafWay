🕌 QafWay — Muslim Super App (PWA)

QafWay adalah aplikasi web progresif (Progressive Web App) berdesain minimalis, cepat, dan mobile-first yang dirancang khusus untuk mendampingi ibadah harian umat Muslim di Indonesia. Dibangun menggunakan arsitektur modern Go pada sisi backend dan Vue.js pada sisi frontend.

✨ Fitur Unggulan

📖 Al-Qur'an Digital & Tajwid

Daftar 114 Surah Lengkap: Pencarian cepat berdasarkan nama latin, arti, maupun nomor surah, serta filter berdasarkan tempat turun (Makkiyah/Madaniyah).

Mode Tajwid Berwarna Interaktif: Penanda hukum bacaan tajwid berbasis warna langsung pada teks Arab. Ketuk huruf berwarna untuk melihat nama dan penjelasan hukum tajwidnya.

Tafsir Kemenag RI: Akses langsung ke tafsir per ayat dengan fitur pencarian dan pengaturan ukuran teks (font scaling).

Murottal Per Ayat & Multi-Qari: Pilihan berbagai Qari ternama dengan fitur auto-scroll, mode pengulangan (Repeat 1 Ayat / Semua / Lanjut Surah Otomatis).

Penanda Terakhir Dibaca (Bookmark): Simpan progres bacaan terakhir secara lokal agar mudah dilanjutkan kapan saja.

Bagikan Ayat sebagai Gambar (Quote Card Generator): Ubah ayat dan terjemahannya menjadi kartu gambar estetik dengan pilihan tema (Emerald, Dark Minimal, Classic Light) yang siap dibagikan ke WhatsApp atau Instagram Stories.

🕰️ Jadwal Sholat & Arah Kiblat

Jadwal Sholat Akurat: Data jadwal sholat resmi (Bimas Islam Kemenag RI) untuk seluruh kabupaten/kota di Indonesia dengan deteksi lokasi otomatis (Geolocation).

Hitung Mundur & Notifikasi Realtime: Penghitung waktu mundur menuju waktu sholat berikutnya beserta popup pengingat otomatis saat waktu sholat tiba.

Kompas Arah Kiblat: Penentu arah kiblat presisi dari lokasi pengguna menggunakan sensor magnetometer perangkat maupun input koordinat manual.

📅 Kalender Hijriyah & Puasa Sunnah

Kalender Terpadu: Menampilkan konversi tanggal Masehi ke Hijriyah beserta daftar hari besar Islam.

Jadwal & Pengingat Puasa Sunnah: Dilengkapi informasi puasa sunnah terdekat (Senin-Kamis, Ayyamul Bidh, Tasu'a, Asyura, Arafah, Syawal, hingga hari yang diharamkan berpuasa) beserta pengingat malam sebelum puasa.

📿 Dzikir, Doa & Tracker Ibadah

Dzikir Pagi & Petang: Tab khusus bacaan dzikir harian lengkap dengan teks Arab, latin, terjemahan, dan tombol salin cepat.

Kumpulan Doa Harian: Direktori doa sehari-hari dengan fitur pencarian kata kunci.

Tracker Tilawah: Pencatat target dan progres khatam Al-Qur'an harian.

🛠️ Teknologi yang Digunakan

Frontend: Vue 3 (Composition API), Vue Router, Vite, PWA (Service Worker & Web App Manifest)

Backend: Go (Golang) REST API

Utilitas: html-to-image (Konversi kartu ayat ke PNG)

Sumber Data:

equran.id — Data Al-Qur'an, audio Qari, Tafsir Kemenag, dan Jadwal Sholat.

UmmahAPI — Data segmentasi hukum Tajwid.

🚀 Cara Menjalankan Proyek Secara Lokal

Prasyarat

Go (versi 1.20 atau lebih baru)

Node.js (versi 18 atau lebih baru) & npm

1. Clone Repositori

git clone https://github.com/Naufal-0123/QafWay.git
cd QafWay


2. Menjalankan Backend (Go)

Masuk ke direktori backend (sesuaikan nama folder jika berbeda) dan jalankan server:

cd backend
go mod tidy
go run main.go


3. Menjalankan Frontend (Vue.js)

Buka terminal baru, masuk ke direktori frontend, instal dependensi, lalu jalankan server pengembangan:

cd frontend
npm install
npm run dev


Aplikasi dapat diakses melalui browser di alamat http://localhost:5173.

📱 Instalasi sebagai Aplikasi (PWA)

QafWay mendukung instalasi langsung ke layar utama perangkat Android, iOS, maupun Desktop:

Buka aplikasi melalui browser (Chrome/Safari/Edge).

Pilih menu "Tambahkan ke Layar Utama" (Add to Home Screen) atau ikon Install pada bilah alamat browser.

Aplikasi dapat dijalankan layaknya aplikasi native dengan akses yang lebih cepat.

📝 Catatan

Tanggal Hijriyah pada kalender dihitung menggunakan metode tabular dan dapat berbeda satu hari dari penetapan resmi pemerintah. Selalu ikuti pengumuman resmi Kemenag RI untuk awal Ramadhan, Syawal, dan Dzulhijjah.

📄 Lisensi

Proyek ini dikembangkan untuk tujuan edukasi dan kemaslahatan umat. Silakan digunakan dan dikembangkan lebih lanjut dengan tetap mencantumkan atribusi sumber data yang digunakan.
