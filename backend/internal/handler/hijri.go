package handler

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"equran/backend/internal/hijri"
)

type HijriHandler struct {
	offset int
	loc    *time.Location
}

func NewHijriHandler(offset int, loc *time.Location) *HijriHandler {
	return &HijriHandler{offset: offset, loc: loc}
}

func (h *HijriHandler) Today(w http.ResponseWriter, r *http.Request) {
	now := time.Now().In(h.loc)
	writeJSON(w, http.StatusOK, map[string]any{
		"gregorian": now.Format("2006-01-02"),
		"hijri":     hijri.FromGregorian(now, h.offset),
		"offset":    h.offset,
	})
}

func (h *HijriHandler) Calendar(w http.ResponseWriter, r *http.Request) {
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
		"days":   hijri.Month(year, month, h.offset),
	})
}

func (h *HijriHandler) Convert(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	if g := q.Get("gregorian"); g != "" {
		t, err := time.Parse("2006-01-02", g)
		if err != nil {
			writeError(w, http.StatusBadRequest, "format gregorian harus YYYY-MM-DD")
			return
		}
		writeJSON(w, http.StatusOK, map[string]any{
			"gregorian": t.Format("2006-01-02"),
			"hijri":     hijri.FromGregorian(t, h.offset),
		})
		return
	}
	if hj := q.Get("hijri"); hj != "" {
		var y, m, d int
		if n, err := fmt.Sscanf(hj, "%d-%d-%d", &y, &m, &d); err != nil || n != 3 ||
			y < 1 || y > 9999 || m < 1 || m > 12 || d < 1 || d > 30 {
			writeError(w, http.StatusBadRequest, "format hijri harus YYYY-MM-DD (bulan 1-12, hari 1-30)")
			return
		}
		writeJSON(w, http.StatusOK, map[string]any{
			"hijri":     hijri.Date{Year: y, Month: m, Day: d, MonthName: hijri.MonthNames[m-1]},
			"gregorian": hijri.ToGregorian(y, m, d, h.offset).Format("2006-01-02"),
		})
		return
	}
	writeError(w, http.StatusBadRequest, "isi parameter gregorian atau hijri")
}

func (h *HijriHandler) Events(w http.ResponseWriter, r *http.Request) {
	year := time.Now().In(h.loc).Year()
	if v := r.URL.Query().Get("year"); v != "" {
		y, err := strconv.Atoi(v)
		if err != nil || y < 1 || y > 9999 {
			writeError(w, http.StatusBadRequest, "year tidak valid")
			return
		}
		year = y
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"year":   year,
		"events": hijri.EventsInYear(year, h.offset),
	})
}