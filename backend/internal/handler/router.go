package handler

import "net/http"

func NewRouter(q *QuranHandler, hj *HijriHandler) http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /api/v1/health", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})

	mux.HandleFunc("GET /api/v1/surahs", q.List)
	mux.HandleFunc("GET /api/v1/surahs/{nomor}", q.Detail)

	mux.HandleFunc("GET /api/v1/hijri/today", hj.Today)
	mux.HandleFunc("GET /api/v1/hijri/calendar", hj.Calendar)
	mux.HandleFunc("GET /api/v1/hijri/convert", hj.Convert)
	mux.HandleFunc("GET /api/v1/hijri/events", hj.Events)

	return mux
}