package handler

import (
	"math"
	"net/http"
	"strconv"

	"equran/backend/internal/qibla"
)

// Qibla mengembalikan arah dan jarak ke Ka'bah dari koordinat lat dan lng.
func Qibla(w http.ResponseWriter, r *http.Request) {
	lat, err1 := strconv.ParseFloat(r.URL.Query().Get("lat"), 64)
	lng, err2 := strconv.ParseFloat(r.URL.Query().Get("lng"), 64)
	if err1 != nil || err2 != nil ||
		math.IsNaN(lat) || math.IsNaN(lng) || math.IsInf(lat, 0) || math.IsInf(lng, 0) ||
		lat < -90 || lat > 90 || lng < -180 || lng > 180 {
		writeError(w, http.StatusBadRequest, "parameter lat (-90..90) dan lng (-180..180) wajib diisi")
		return
	}
	writeJSON(w, http.StatusOK, qibla.Calculate(lat, lng))
}
