package tajwid

// Segment adalah potongan teks Arab; Rule kosong berarti tanpa hukum tajwid khusus.
type Segment struct {
	Text string `json:"text"`
	Rule string `json:"rule,omitempty"`
}

type Verse struct {
	Ayah     int       `json:"ayah"`
	Segments []Segment `json:"segments"`
}

type Surah struct {
	Nomor     int     `json:"nomor"`
	RuleCount int     `json:"ruleCount"` // jumlah potongan yang bertanda hukum tajwid
	Verses    []Verse `json:"verses"`
}
