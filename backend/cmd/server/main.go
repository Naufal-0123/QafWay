package main

import (
	"log"
	"net/http"
	"time"

	_ "time/tzdata" // zona waktu tertanam, penting untuk Windows

	"equran/backend/internal/cache"
	"equran/backend/internal/config"
	"equran/backend/internal/doa"
	"equran/backend/internal/handler"
	"equran/backend/internal/middleware"
	"equran/backend/internal/prayer"
	"equran/backend/internal/quran"
	"equran/backend/internal/tajwid"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatal(err)
	}

	store := cache.New()
	quranSvc := quran.NewService(quran.NewClient(cfg.EquranBaseURL), store, cfg.CacheTTL)
	prayerSvc := prayer.NewService(prayer.NewClient(cfg.EquranBaseURL), store, cfg.CacheTTL)
	doaSvc := doa.NewService(doa.NewClient(cfg.DoaBaseURL), store, cfg.CacheTTL)
	tajwidSvc := tajwid.NewService(tajwid.NewClient(cfg.UmmahBaseURL), store, cfg.CacheTTL)

	router := handler.NewRouter(
		handler.NewQuranHandler(quranSvc),
		handler.NewHijriHandler(cfg.HijriOffset, cfg.Location),
		handler.NewPrayerHandler(prayerSvc, cfg.Location),
		handler.NewDoaHandler(doaSvc),
		handler.NewFastingHandler(cfg.HijriOffset),
		handler.NewTajwidHandler(tajwidSvc),
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
