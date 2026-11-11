// Package hijri menghitung kalender Hijriyah (tabular/aritmetika).
// Hasilnya bisa berbeda 1 hari dari penetapan Kemenag; gunakan offset untuk koreksi.
package hijri

import "time"

var MonthNames = [12]string{
	"Muharram", "Safar", "Rabiul Awal", "Rabiul Akhir",
	"Jumadil Awal", "Jumadil Akhir", "Rajab", "Syaban",
	"Ramadhan", "Syawal", "Dzulqadah", "Dzulhijjah",
}

type Date struct {
	Year      int    `json:"year"`
	Month     int    `json:"month"`
	Day       int    `json:"day"`
	MonthName string `json:"monthName"`
}

const unixEpochJDN = 2440588

func jdnOf(t time.Time) int {
	d := time.Date(t.Year(), t.Month(), t.Day(), 0, 0, 0, 0, time.UTC)
	return int(d.Unix()/86400) + unixEpochJDN
}

// FromGregorian mengonversi tanggal Masehi ke Hijriyah. offset ditambahkan
// ke tanggal Masehi sebelum konversi (+1 memajukan tanggal Hijriyah).
func FromGregorian(t time.Time, offset int) Date {
	jd := jdnOf(t) + offset
	l := jd - 1948440 + 10632
	n := (l - 1) / 10631
	l = l - 10631*n + 354
	j := ((10985-l)/5316)*((50*l)/17719) + (l/5670)*((43*l)/15238)
	l = l - ((30-j)/15)*((17719*j)/50) - (j/16)*((15238*j)/43) + 29
	m := (24 * l) / 709
	d := l - (709*m)/24
	y := 30*n + j - 30
	return Date{Year: y, Month: m, Day: d, MonthName: MonthNames[m-1]}
}

// ToGregorian mengonversi tanggal Hijriyah ke Masehi (kebalikan FromGregorian).
func ToGregorian(y, m, d, offset int) time.Time {
	jd := (11*y+3)/30 + 354*y + 30*m - (m-1)/2 + d + 1948440 - 385 - offset
	return time.Unix(int64(jd-unixEpochJDN)*86400, 0).UTC()
}