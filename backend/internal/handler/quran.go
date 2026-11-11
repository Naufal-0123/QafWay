package handler

import (
	"errors"
	"log"
	"net/http"
	"strconv"

	"equran/backend/internal/quran"
)

type QuranHandler struct {
	svc *quran.Service
}

func NewQuranHandler(svc *quran.Service) *QuranHandler {
	return &QuranHandler{svc: svc}
}

func (h *QuranHandler) List(w http.ResponseWriter, r *http.Request) {
	list, err := h.svc.Surahs(r.Context(), r.URL.Query().Get("q"))
	if err != nil {
		log.Println("list surah:", err)
		writeError(w, http.StatusBadGateway, "gagal mengambil data surah")
		return
	}
	writeJSON(w, http.StatusOK, list)
}

func (h *QuranHandler) Detail(w http.ResponseWriter, r *http.Request) {
	n, err := strconv.Atoi(r.PathValue("nomor"))
	if err != nil || n < 1 || n > 114 {
		writeError(w, http.StatusBadRequest, "nomor surah harus 1-114")
		return
	}
	raw, err := h.svc.Surah(r.Context(), n)
	if errors.Is(err, quran.ErrNotFound) {
		writeError(w, http.StatusNotFound, "surah tidak ditemukan")
		return
	}
	if err != nil {
		log.Println("detail surah:", err)
		writeError(w, http.StatusBadGateway, "gagal mengambil data surah")
		return
	}
	writeJSON(w, http.StatusOK, raw)
}