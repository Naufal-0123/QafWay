package hijri

import "time"

var weekdays = [7]string{"Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"}

type Day struct {
	Gregorian string   `json:"gregorian"`
	Weekday   string   `json:"weekday"`
	Hijri     Date     `json:"hijri"`
	Events    []string `json:"events"`
}

// Month menyusun kalender satu bulan Masehi lengkap dengan tanggal Hijriyah.
func Month(year, month, offset int) []Day {
	first := time.Date(year, time.Month(month), 1, 0, 0, 0, 0, time.UTC)
	days := []Day{}
	for d := first; d.Month() == first.Month(); d = d.AddDate(0, 0, 1) {
		h := FromGregorian(d, offset)
		days = append(days, Day{
			Gregorian: d.Format("2006-01-02"),
			Weekday:   weekdays[d.Weekday()],
			Hijri:     h,
			Events:    EventsOn(h),
		})
	}
	return days
}

type EventDate struct {
	Name      string `json:"name"`
	Gregorian string `json:"gregorian"`
	Hijri     Date   `json:"hijri"`
}

// EventsInYear mencari tanggal hari besar yang jatuh pada satu tahun Masehi.
func EventsInYear(year, offset int) []EventDate {
	out := []EventDate{}
	start := time.Date(year, 1, 1, 0, 0, 0, 0, time.UTC)
	for d := start; d.Year() == year; d = d.AddDate(0, 0, 1) {
		h := FromGregorian(d, offset)
		for _, name := range EventsOn(h) {
			out = append(out, EventDate{Name: name, Gregorian: d.Format("2006-01-02"), Hijri: h})
		}
	}
	return out
}