package hijri

import (
	"testing"
	"time"
)

func TestRoundTrip(t *testing.T) {
	start := time.Date(2000, 1, 1, 0, 0, 0, 0, time.UTC)
	for i := 0; i < 365*60; i++ {
		d := start.AddDate(0, 0, i)
		for _, off := range []int{-1, 0, 1} {
			h := FromGregorian(d, off)
			if h.Month < 1 || h.Month > 12 || h.Day < 1 || h.Day > 30 {
				t.Fatalf("hijri tidak valid untuk %s: %+v", d.Format("2006-01-02"), h)
			}
			back := ToGregorian(h.Year, h.Month, h.Day, off)
			if !back.Equal(d) {
				t.Fatalf("round trip gagal %s -> %+v -> %s", d.Format("2006-01-02"), h, back.Format("2006-01-02"))
			}
		}
	}
}

func TestEpoch(t *testing.T) {
	h := FromGregorian(time.Date(622, 7, 19, 0, 0, 0, 0, time.UTC), 0)
	if h.Year != 1 || h.Month != 1 || h.Day != 1 {
		t.Fatalf("epoch salah: %+v", h)
	}
}