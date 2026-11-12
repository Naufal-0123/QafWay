// Package fasting menyusun jadwal puasa sunnah dari kalender Hijriyah.
package fasting

import (
	"time"

	"equran/backend/internal/hijri"
)

var weekdays = [7]string{"Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"}

type Kind struct {
	Key   string `json:"key"`
	Label string `json:"label"`
}

type Day struct {
	Gregorian string     `json:"gregorian"`
	Weekday   string     `json:"weekday"`
	Hijri     hijri.Date `json:"hijri"`
	Kinds     []Kind     `json:"kinds"`
	Forbidden bool       `json:"forbidden"` // hari yang dilarang berpuasa
}

// kindsFor menentukan jenis puasa untuk satu hari. Hari yang dilarang berpuasa
// (Idul Fitri, Idul Adha, Hari Tasyriq) mengalahkan aturan lainnya.
func kindsFor(h hijri.Date, wd time.Weekday) ([]Kind, bool) {
	switch {
	case h.Month == 10 && h.Day == 1:
		return []Kind{{"dilarang-idulfitri", "Dilarang berpuasa (Idul Fitri)"}}, true
	case h.Month == 12 && h.Day == 10:
		return []Kind{{"dilarang-iduladha", "Dilarang berpuasa (Idul Adha)"}}, true
	case h.Month == 12 && h.Day >= 11 && h.Day <= 13:
		return []Kind{{"dilarang-tasyriq", "Dilarang berpuasa (Hari Tasyriq)"}}, true
	}
	if h.Month == 9 {
		return []Kind{{"ramadhan", "Puasa Ramadhan (wajib)"}}, false
	}

	kinds := []Kind{}
	if wd == time.Monday {
		kinds = append(kinds, Kind{"senin", "Puasa Senin"})
	}
	if wd == time.Thursday {
		kinds = append(kinds, Kind{"kamis", "Puasa Kamis"})
	}
	if h.Day >= 13 && h.Day <= 15 {
		kinds = append(kinds, Kind{"ayyamul-bidh", "Ayyamul Bidh"})
	}
	switch {
	case h.Month == 1 && h.Day == 9:
		kinds = append(kinds, Kind{"tasua", "Puasa Tasu'a"})
	case h.Month == 1 && h.Day == 10:
		kinds = append(kinds, Kind{"asyura", "Puasa Asyura"})
	case h.Month == 12 && h.Day == 9:
		kinds = append(kinds, Kind{"arafah", "Puasa Arafah"})
	case h.Month == 10 && h.Day >= 2 && h.Day <= 7:
		kinds = append(kinds, Kind{"syawal", "Puasa Syawal"})
	}
	return kinds, false
}

// Schedule mengembalikan seluruh hari dalam satu bulan Masehi beserta jenis puasanya.
func Schedule(year, month, offset int) []Day {
	first := time.Date(year, time.Month(month), 1, 0, 0, 0, 0, time.UTC)
	out := []Day{}
	for d := first; d.Month() == first.Month(); d = d.AddDate(0, 0, 1) {
		h := hijri.FromGregorian(d, offset)
		kinds, forbidden := kindsFor(h, d.Weekday())
		out = append(out, Day{
			Gregorian: d.Format("2006-01-02"),
			Weekday:   weekdays[d.Weekday()],
			Hijri:     h,
			Kinds:     kinds,
			Forbidden: forbidden,
		})
	}
	return out
}
