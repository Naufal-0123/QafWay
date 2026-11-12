package qibla

import (
	"math"
	"testing"
)

func near(a, b, tol float64) bool { return math.Abs(a-b) <= tol }

func TestCalculate(t *testing.T) {
	cases := []struct {
		name         string
		lat, lng     float64
		bearing, km  float64
		compassLabel string
	}{
		{"Jakarta", -6.2088, 106.8456, 295.15, 7920, "Barat Laut"},
		{"Bekasi", -6.2383, 106.9756, 295.13, 7934, "Barat Laut"},
		{"Makassar", -5.1477, 119.4327, 292.48, 9148, "Barat Laut"},
		{"London", 51.5074, -0.1278, 118.99, 4794, "Tenggara"},
	}
	for _, c := range cases {
		r := Calculate(c.lat, c.lng)
		if !near(r.Bearing, c.bearing, 0.2) {
			t.Errorf("%s: bearing %.2f, seharusnya %.2f", c.name, r.Bearing, c.bearing)
		}
		if !near(r.DistanceKm, c.km, 10) {
			t.Errorf("%s: jarak %.1f km, seharusnya %.0f km", c.name, r.DistanceKm, c.km)
		}
		if r.Compass != c.compassLabel {
			t.Errorf("%s: arah %q, seharusnya %q", c.name, r.Compass, c.compassLabel)
		}
	}
}
