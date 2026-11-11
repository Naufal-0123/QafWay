package config

import (
	"fmt"
	"os"
	"strconv"
	"time"
)

type Config struct {
	Port          string
	EquranBaseURL string
	CORSOrigin    string
	CacheTTL      time.Duration
	Location      *time.Location
	HijriOffset   int // hari yang ditambahkan ke tanggal Masehi sebelum konversi
}

func Load() (Config, error) {
	ttlHours, err := strconv.Atoi(getenv("CACHE_TTL_HOURS", "24"))
	if err != nil || ttlHours < 1 {
		return Config{}, fmt.Errorf("CACHE_TTL_HOURS tidak valid")
	}
	offset, err := strconv.Atoi(getenv("HIJRI_OFFSET", "0"))
	if err != nil || offset < -2 || offset > 2 {
		return Config{}, fmt.Errorf("HIJRI_OFFSET harus antara -2 dan 2")
	}
	loc, err := time.LoadLocation(getenv("TIMEZONE", "Asia/Jakarta"))
	if err != nil {
		return Config{}, fmt.Errorf("TIMEZONE tidak valid: %w", err)
	}
	return Config{
		Port:          getenv("PORT", "8080"),
		EquranBaseURL: getenv("EQURAN_BASE_URL", "https://equran.id/api/v2"),
		CORSOrigin:    getenv("CORS_ORIGIN", "http://localhost:5173"),
		CacheTTL:      time.Duration(ttlHours) * time.Hour,
		Location:      loc,
		HijriOffset:   offset,
	}, nil
}

func getenv(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}