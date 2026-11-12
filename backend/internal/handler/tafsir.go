package handler

import (
	"errors"
	"log"
	"net/http"
	"strconv"

	"equran/backend/internal/quran"
)

func (h *QuranHandler) Tafsir(w http.ResponseWriter, r *http.Request) {
	n, err := strconv.Atoi(r.PathValue("nomor"))
	if err != nil || n < 1 || n > 114 {
		writeError(w, http.StatusBadRequest, "nomor surah harus 1-114")
		return
	}
	raw, err := h.svc.Tafsir(r.Context(), n)
	if errors.Is(err, quran.ErrNotFound) {
		writeError(w, http.StatusNotFound, "tafsir tidak ditemukan")
		return
	}
	if err != nil {
		log.Println("tafsir:", err)
		writeError(w, http.StatusBadGateway, "gagal mengambil tafsir")
		return
	}
	writeJSON(w, http.StatusOK, raw)
}
