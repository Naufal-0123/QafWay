package hijri

type Event struct {
	Month int
	Day   int
	Name  string
}

// Hari besar Islam yang tanggalnya tetap menurut kalender Hijriyah.
var Events = []Event{
	{1, 1, "Tahun Baru Hijriyah"},
	{1, 10, "Hari Asyura"},
	{3, 12, "Maulid Nabi Muhammad SAW"},
	{7, 27, "Isra Miraj"},
	{8, 15, "Nisfu Syaban"},
	{9, 1, "Awal Ramadhan"},
	{9, 17, "Nuzulul Quran"},
	{10, 1, "Idul Fitri"},
	{12, 9, "Hari Arafah"},
	{12, 10, "Idul Adha"},
}

func EventsOn(h Date) []string {
	out := []string{}
	for _, e := range Events {
		if e.Month == h.Month && e.Day == h.Day {
			out = append(out, e.Name)
		}
	}
	return out
}