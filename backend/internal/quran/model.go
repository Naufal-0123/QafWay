package quran

type Surah struct {
	Nomor       int               `json:"nomor"`
	Nama        string            `json:"nama"`
	NamaLatin   string            `json:"namaLatin"`
	JumlahAyat  int               `json:"jumlahAyat"`
	TempatTurun string            `json:"tempatTurun"`
	Arti        string            `json:"arti"`
	Deskripsi   string            `json:"deskripsi"`
	AudioFull   map[string]string `json:"audioFull,omitempty"`
}