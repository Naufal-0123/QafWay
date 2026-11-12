package prayer

// Day adalah delapan waktu pada satu tanggal (format "HH:mm", waktu setempat wilayah).
type Day struct {
	Tanggal        int    `json:"tanggal"`
	TanggalLengkap string `json:"tanggalLengkap"`
	Hari           string `json:"hari"`
	Imsak          string `json:"imsak"`
	Subuh          string `json:"subuh"`
	Terbit         string `json:"terbit"`
	Dhuha          string `json:"dhuha"`
	Dzuhur         string `json:"dzuhur"`
	Ashar          string `json:"ashar"`
	Maghrib        string `json:"maghrib"`
	Isya           string `json:"isya"`
}

// Month adalah jadwal satu bulan untuk satu kabupaten/kota.
type Month struct {
	Provinsi  string `json:"provinsi"`
	Kabkota   string `json:"kabkota"`
	Tahun     int    `json:"tahun"`
	Bulan     int    `json:"bulan"`
	BulanNama string `json:"bulanNama"`
	Jadwal    []Day  `json:"jadwal"`
}
