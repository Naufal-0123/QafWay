package handler

import (
	"log"
	"net/http"
	"time"
)

// Daily mengembalikan ayat harian. Parameter date (YYYY-MM-DD) opsional;
// tanpa itu dipakai tanggal hari ini menurut WIB.
func (h *QuranHandler) Daily(w http.ResponseWriter, r *http.Request) {
	date := time.Now().In(time.FixedZone("WIB", 7*3600))
	if v := r.URL.Query().Get("date"); v != "" {
		d, err := time.Parse("2006-01-02", v)
		if err != nil {
			writeError(w, http.StatusBadRequest, "format date harus YYYY-MM-DD")
			return
		}
		date = d
	}
	res, err := h.svc.Daily(r.Context(), date)
	if err != nil {
		log.Println("ayat harian:", err)
		writeError(w, http.StatusBadGateway, "gagal mengambil ayat harian")
		return
	}
	writeJSON(w, http.StatusOK, res)
}
