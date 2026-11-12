// Package qibla menghitung arah dan jarak ke Ka'bah dari suatu koordinat.
package qibla

import "math"

const (
	kaabaLat      = 21.4225
	kaabaLng      = 39.8262
	earthRadiusKm = 6371.0
)

var compass = [8]string{"Utara", "Timur Laut", "Timur", "Tenggara", "Selatan", "Barat Daya", "Barat", "Barat Laut"}

type Result struct {
	Bearing    float64 `json:"bearing"` // derajat dari utara sejati, searah jarum jam
	Compass    string  `json:"compass"`
	DistanceKm float64 `json:"distanceKm"`
}

func rad(d float64) float64 { return d * math.Pi / 180 }
func round(v float64, places int) float64 {
	p := math.Pow(10, float64(places))
	return math.Round(v*p) / p
}

// Calculate memakai rumus bearing awal lingkaran besar dan haversine.
func Calculate(lat, lng float64) Result {
	p1, l1 := rad(lat), rad(lng)
	p2, l2 := rad(kaabaLat), rad(kaabaLng)
	dl := l2 - l1

	y := math.Sin(dl) * math.Cos(p2)
	x := math.Cos(p1)*math.Sin(p2) - math.Sin(p1)*math.Cos(p2)*math.Cos(dl)
	bearing := math.Mod(math.Atan2(y, x)*180/math.Pi+360, 360)

	a := math.Pow(math.Sin((p2-p1)/2), 2) + math.Cos(p1)*math.Cos(p2)*math.Pow(math.Sin(dl/2), 2)
	dist := 2 * earthRadiusKm * math.Asin(math.Sqrt(a))

	return Result{
		Bearing:    round(bearing, 2),
		Compass:    compass[int((bearing+22.5)/45)%8],
		DistanceKm: round(dist, 1),
	}
}
