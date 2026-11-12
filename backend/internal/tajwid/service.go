package tajwid

import (
	"context"
	"fmt"
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

func (s *Service) Surah(ctx context.Context, nomor int) (*Surah, error) {
	key := fmt.Sprintf("tajwid:%d", nomor)
	if v, ok := s.cache.Get(key); ok {
		return v.(*Surah), nil
	}
	res, err := s.client.Surah(ctx, nomor)
	if err != nil {
		return nil, err
	}
	s.cache.Set(key, res, s.ttl)
	return res, nil
}
