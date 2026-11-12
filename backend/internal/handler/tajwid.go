package handler

import (
	"errors"
	"log"
	"net/http"
	"strconv"

	"equran/backend/internal/tajwid"
)

type TajwidHandler struct {
	svc *tajwid.Service
}

func NewTajwidHandler(svc *tajwid.Service) *TajwidHandler {
	return &TajwidHandler{svc: svc}
}

func (h *TajwidHandler) Surah(w http.ResponseWriter, r *http.Request) {
	n, err := strconv.Atoi(r.PathValue("nomor"))
	if err != nil || n < 1 || n > 114 {
		writeError(w, http.StatusBadRequest, "nomor surah harus 1-114")
		return
	}
	res, err := h.svc.Surah(r.Context(), n)
	if errors.Is(err, tajwid.ErrNotFound) {
		writeError(w, http.StatusNotFound, "surah tidak ditemukan")
		return
	}
	if err != nil {
		log.Println("tajwid:", err)
		writeError(w, http.StatusBadGateway, "gagal mengambil data tajwid")
		return
	}
	writeJSON(w, http.StatusOK, res)
}
