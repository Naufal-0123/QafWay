package handler

import (
	"errors"
	"log"
	"net/http"
	"strconv"

	"equran/backend/internal/doa"
)

type DoaHandler struct {
	svc *doa.Service
}

func NewDoaHandler(svc *doa.Service) *DoaHandler {
	return &DoaHandler{svc: svc}
}

func (h *DoaHandler) List(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	list, err := h.svc.List(r.Context(), doa.Filter{
		Grup:  q.Get("grup"),
		Tag:   q.Get("tag"),
		Query: q.Get("q"),
	})
	if err != nil {
		log.Println("daftar doa:", err)
		writeError(w, http.StatusBadGateway, "gagal mengambil data doa")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"total": len(list),
		"items": list,
	})
}

func (h *DoaHandler) Detail(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil || id < 1 {
		writeError(w, http.StatusBadRequest, "id doa tidak valid")
		return
	}
	d, err := h.svc.Get(r.Context(), id)
	if errors.Is(err, doa.ErrNotFound) {
		writeError(w, http.StatusNotFound, "doa tidak ditemukan")
		return
	}
	if err != nil {
		log.Println("detail doa:", err)
		writeError(w, http.StatusBadGateway, "gagal mengambil data doa")
		return
	}
	writeJSON(w, http.StatusOK, d)
}
