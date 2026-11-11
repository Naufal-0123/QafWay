package main

import (
	"log"
	"net/http"
	"time"

	_ "time/tzdata" // zona waktu tertanam, penting untuk Windows

	"equran/backend/internal/cache"
	"equran/backend/internal/config"
	"equran/backend/internal/handler"
	"equran/backend/internal/middleware"
	"equran/backend/internal/quran"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatal(err)
	}

	quranSvc := quran.NewService(quran.NewClient(cfg.EquranBaseURL), cache.New(), cfg.CacheTTL)

	router := handler.NewRouter(
		handler.NewQuranHandler(quranSvc),
		handler.NewHijriHandler(cfg.HijriOffset, cfg.Location),
	)
	app := middleware.Chain(router,
		middleware.Recover,
		middleware.Logger,
		middleware.CORS(cfg.CORSOrigin),
	)

	srv := &http.Server{
		Addr:              ":" + cfg.Port,
		Handler:           app,
		ReadHeaderTimeout: 5 * time.Second,
	}
	log.Printf("server jalan di http://localhost:%s", cfg.Port)
	log.Fatal(srv.ListenAndServe())
}