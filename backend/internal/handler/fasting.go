package handler

import (
	"net/http"
	"strconv"

	"equran/backend/internal/fasting"
)

type FastingHandler struct {
	offset int
}

func NewFastingHandler(offset int) *FastingHandler {
	return &FastingHandler{offset: offset}
}

func (h *FastingHandler) Schedule(w http.ResponseWriter, r *http.Request) {
	year, err1 := strconv.Atoi(r.URL.Query().Get("year"))
	month, err2 := strconv.Atoi(r.URL.Query().Get("month"))
	if err1 != nil || err2 != nil || year < 1 || year > 9999 || month < 1 || month > 12 {
		writeError(w, http.StatusBadRequest, "parameter year dan month (1-12) wajib diisi")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"year":   year,
		"month":  month,
		"offset": h.offset,
		"days":   fasting.Schedule(year, month, h.offset),
	})
}
