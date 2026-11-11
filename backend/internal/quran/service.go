package quran

import (
	"context"
	"encoding/json"
	"fmt"
	"strconv"
	"strings"
	"time"

	"equran/backend/internal/cache"
)

type Service struct {
	client *Client
	cache  *cache.Cache
	ttl    time.Duration
}

func NewService(c *Client, ch *cache.Cache, ttl time.Duration) *Service {
	return &Service{client: c, cache: ch, ttl: ttl}
}

// Surahs mengembalikan daftar surah; q memfilter nama, arti, atau nomor.
func (s *Service) Surahs(ctx context.Context, q string) ([]Surah, error) {
	const key = "surahs"
	var all []Surah
	if v, ok := s.cache.Get(key); ok {
		all = v.([]Surah)
	} else {
		list, err := s.client.ListSurah(ctx)
		if err != nil {
			return nil, err
		}
		s.cache.Set(key, list, s.ttl)
		all = list
	}

	q = strings.ToLower(strings.TrimSpace(q))
	if q == "" {
		return all, nil
	}
	out := make([]Surah, 0)
	for _, sr := range all {
		if strings.Contains(strings.ToLower(sr.NamaLatin), q) ||
			strings.Contains(strings.ToLower(sr.Arti), q) ||
			strings.Contains(sr.Nama, q) ||
			strconv.Itoa(sr.Nomor) == q {
			out = append(out, sr)
		}
	}
	return out, nil
}

func (s *Service) Surah(ctx context.Context, nomor int) (json.RawMessage, error) {
	key := fmt.Sprintf("surah:%d", nomor)
	if v, ok := s.cache.Get(key); ok {
		return v.(json.RawMessage), nil
	}
	raw, err := s.client.GetSurah(ctx, nomor)
	if err != nil {
		return nil, err
	}
	s.cache.Set(key, raw, s.ttl)
	return raw, nil
}