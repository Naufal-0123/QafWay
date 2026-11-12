package handler

import "net/http"

func NewRouter(q *QuranHandler, hj *HijriHandler, pr *PrayerHandler, dh *DoaHandler, fh *FastingHandler, tj *TajwidHandler) http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /api/v1/health", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})

	mux.HandleFunc("GET /api/v1/surahs", q.List)
	mux.HandleFunc("GET /api/v1/surahs/{nomor}", q.Detail)
	mux.HandleFunc("GET /api/v1/surahs/{nomor}/tafsir", q.Tafsir)
	mux.HandleFunc("GET /api/v1/surahs/{nomor}/tajwid", tj.Surah)
	mux.HandleFunc("GET /api/v1/ayahs/daily", q.Daily)

	mux.HandleFunc("GET /api/v1/hijri/today", hj.Today)
	mux.HandleFunc("GET /api/v1/hijri/calendar", hj.Calendar)
	mux.HandleFunc("GET /api/v1/hijri/convert", hj.Convert)
	mux.HandleFunc("GET /api/v1/hijri/events", hj.Events)
	mux.HandleFunc("GET /api/v1/fasting/schedule", fh.Schedule)

	mux.HandleFunc("GET /api/v1/prayer/provinces", pr.Provinces)
	mux.HandleFunc("GET /api/v1/prayer/cities", pr.Cities)
	mux.HandleFunc("GET /api/v1/prayer/times", pr.Times)
	mux.HandleFunc("GET /api/v1/qibla", Qibla)

	mux.HandleFunc("GET /api/v1/doa", dh.List)
	mux.HandleFunc("GET /api/v1/doa/{id}", dh.Detail)

	return mux
}
