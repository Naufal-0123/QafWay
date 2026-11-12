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
	DoaBaseURL    string
	UmmahBaseURL  string
	CORSOrigin    string
	CacheTTL      time.Duration
	Location      *time.Location
	HijriOffset   int // hari yang ditambahkan ke tanggal Masehi sebelum konversi

	// Web Push (opsional; aktif jika ketiganya diisi)
	VAPIDPublicKey  string
	VAPIDPrivateKey string
	VAPIDSubject    string
	PushStorePath   string
}

func (c Config) PushEnabled() bool {
	return c.VAPIDPublicKey != "" && c.VAPIDPrivateKey != "" && c.VAPIDSubject != ""
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

	cfg := Config{
		Port:            getenv("PORT", "8080"),
		EquranBaseURL:   getenv("EQURAN_BASE_URL", "https://equran.id/api/v2"),
		DoaBaseURL:      getenv("DOA_BASE_URL", "https://equran.id/api/doa"),
		UmmahBaseURL:    getenv("UMMAH_BASE_URL", "https://ummahapi.com/api"),
		CORSOrigin:      getenv("CORS_ORIGIN", "http://localhost:5173"),
		CacheTTL:        time.Duration(ttlHours) * time.Hour,
		Location:        loc,
		HijriOffset:     offset,
		VAPIDPublicKey:  os.Getenv("VAPID_PUBLIC_KEY"),
		VAPIDPrivateKey: os.Getenv("VAPID_PRIVATE_KEY"),
		VAPIDSubject:    os.Getenv("VAPID_SUBJECT"),
		PushStorePath:   getenv("PUSH_STORE_PATH", "data/push-subscriptions.json"),
	}

	set := 0
	for _, v := range []string{cfg.VAPIDPublicKey, cfg.VAPIDPrivateKey, cfg.VAPIDSubject} {
		if v != "" {
			set++
		}
	}
	if set != 0 && set != 3 {
		return Config{}, fmt.Errorf("VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, dan VAPID_SUBJECT harus diisi semuanya")
	}
	return cfg, nil
}

func getenv(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}
