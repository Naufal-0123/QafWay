package handler

import (
	"errors"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"equran/backend/internal/prayer"
)

type PrayerHandler struct {
	svc *prayer.Service
	loc *time.Location
}

func NewPrayerHandler(svc *prayer.Service, loc *time.Location) *PrayerHandler {
	return &PrayerHandler{svc: svc, loc: loc}
}

func (h *PrayerHandler) fail(w http.ResponseWriter, what string, err error) {
	if errors.Is(err, prayer.ErrNotFound) {
		writeError(w, http.StatusNotFound, "jadwal tidak ditemukan; periksa nama wilayah, bulan, dan tahun")
		return
	}
	log.Println(what+":", err)
	writeError(w, http.StatusBadGateway, "gagal mengambil jadwal sholat")
}

func (h *PrayerHandler) Provinces(w http.ResponseWriter, r *http.Request) {
	list, err := h.svc.Provinces(r.Context())
	if err != nil {
		h.fail(w, "daftar provinsi", err)
		return
	}
	writeJSON(w, http.StatusOK, list)
}

func (h *PrayerHandler) Cities(w http.ResponseWriter, r *http.Request) {
	provinsi := strings.TrimSpace(r.URL.Query().Get("provinsi"))
	if provinsi == "" {
		writeError(w, http.StatusBadRequest, "parameter provinsi wajib diisi")
		return
	}
	list, err := h.svc.Cities(r.Context(), provinsi)
	if err != nil {
		h.fail(w, "daftar kabupaten/kota", err)
		return
	}
	writeJSON(w, http.StatusOK, list)
}

// Times mengembalikan jadwal satu bulan, atau satu hari jika date diisi.
func (h *PrayerHandler) Times(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	provinsi := strings.TrimSpace(q.Get("provinsi"))
	kabkota := strings.TrimSpace(q.Get("kabkota"))
	if provinsi == "" || kabkota == "" {
		writeError(w, http.StatusBadRequest, "parameter provinsi dan kabkota wajib diisi")
		return
	}

	if d := q.Get("date"); d != "" {
		date, err := time.Parse("2006-01-02", d)
		if err != nil {
			writeError(w, http.StatusBadRequest, "format date harus YYYY-MM-DD")
			return
		}
		day, err := h.svc.Day(r.Context(), provinsi, kabkota, date)
		if err != nil {
			h.fail(w, "jadwal harian", err)
			return
		}
		writeJSON(w, http.StatusOK, map[string]any{
			"provinsi": provinsi,
			"kabkota":  kabkota,
			"jadwal":   day,
		})
		return
	}

	now := time.Now().In(h.loc)
	year, month := now.Year(), int(now.Month())
	if v := q.Get("year"); v != "" {
		y, err := strconv.Atoi(v)
		if err != nil || y < 2000 || y > 2100 {
			writeError(w, http.StatusBadRequest, "year tidak valid")
			return
		}
		year = y
	}
	if v := q.Get("month"); v != "" {
		m, err := strconv.Atoi(v)
		if err != nil || m < 1 || m > 12 {
			writeError(w, http.StatusBadRequest, "month harus 1-12")
			return
		}
		month = m
	}

	m, err := h.svc.Month(r.Context(), provinsi, kabkota, year, month)
	if err != nil {
		h.fail(w, "jadwal bulanan", err)
		return
	}
	writeJSON(w, http.StatusOK, m)
}
