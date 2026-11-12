package fasting

import (
	"testing"
	"time"

	"equran/backend/internal/hijri"
)

func has(ks []Kind, key string) bool {
	for _, k := range ks {
		if k.Key == key {
			return true
		}
	}
	return false
}

func TestKindsFor(t *testing.T) {
	t.Run("Senin biasa", func(t *testing.T) {
		ks, forb := kindsFor(hijri.Date{Month: 5, Day: 2}, time.Monday)
		if forb || !has(ks, "senin") || len(ks) != 1 {
			t.Fatalf("hasil tidak sesuai: %+v %v", ks, forb)
		}
	})
	t.Run("Kamis tanggal 14 = Kamis + Ayyamul Bidh", func(t *testing.T) {
		ks, _ := kindsFor(hijri.Date{Month: 2, Day: 14}, time.Thursday)
		if !has(ks, "kamis") || !has(ks, "ayyamul-bidh") {
			t.Fatalf("hasil tidak sesuai: %+v", ks)
		}
	})
	t.Run("10 Muharram = Asyura", func(t *testing.T) {
		ks, _ := kindsFor(hijri.Date{Month: 1, Day: 10}, time.Tuesday)
		if !has(ks, "asyura") {
			t.Fatalf("hasil tidak sesuai: %+v", ks)
		}
	})
	t.Run("9 Muharram = Tasu'a", func(t *testing.T) {
		ks, _ := kindsFor(hijri.Date{Month: 1, Day: 9}, time.Tuesday)
		if !has(ks, "tasua") {
			t.Fatalf("hasil tidak sesuai: %+v", ks)
		}
	})
	t.Run("9 Dzulhijjah = Arafah", func(t *testing.T) {
		ks, _ := kindsFor(hijri.Date{Month: 12, Day: 9}, time.Wednesday)
		if !has(ks, "arafah") {
			t.Fatalf("hasil tidak sesuai: %+v", ks)
		}
	})
	t.Run("3 Syawal = Syawal", func(t *testing.T) {
		ks, _ := kindsFor(hijri.Date{Month: 10, Day: 3}, time.Tuesday)
		if !has(ks, "syawal") {
			t.Fatalf("hasil tidak sesuai: %+v", ks)
		}
	})
	t.Run("1 Syawal dilarang", func(t *testing.T) {
		ks, forb := kindsFor(hijri.Date{Month: 10, Day: 1}, time.Monday)
		if !forb || has(ks, "senin") {
			t.Fatalf("hasil tidak sesuai: %+v %v", ks, forb)
		}
	})
	t.Run("13 Dzulhijjah dilarang, bukan Ayyamul Bidh", func(t *testing.T) {
		ks, forb := kindsFor(hijri.Date{Month: 12, Day: 13}, time.Thursday)
		if !forb || has(ks, "ayyamul-bidh") || has(ks, "kamis") {
			t.Fatalf("hasil tidak sesuai: %+v %v", ks, forb)
		}
	})
	t.Run("Ramadhan = wajib saja", func(t *testing.T) {
		ks, forb := kindsFor(hijri.Date{Month: 9, Day: 14}, time.Monday)
		if forb || len(ks) != 1 || !has(ks, "ramadhan") {
			t.Fatalf("hasil tidak sesuai: %+v %v", ks, forb)
		}
	})
}

func TestSchedule(t *testing.T) {
	days := Schedule(2026, 11, 0)
	if len(days) != 30 {
		t.Fatalf("November harus 30 hari, dapat %d", len(days))
	}
	for _, d := range days {
		if d.Kinds == nil {
			t.Fatalf("Kinds tidak boleh nil (%s)", d.Gregorian)
		}
	}
}
