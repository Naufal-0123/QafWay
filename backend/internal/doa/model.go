package doa

type Doa struct {
	ID      int      `json:"id"`
	Nama    string   `json:"nama"`
	Grup    string   `json:"grup"`
	Ar      string   `json:"ar"`
	Tr      string   `json:"tr"`
	Idn     string   `json:"idn"`
	Tentang string   `json:"tentang"`
	Tag     []string `json:"tag"`
}

// Filter dipakai untuk menyaring daftar doa di backend.
type Filter struct {
	Grup  string
	Tag   string
	Query string
}
