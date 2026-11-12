package prayer

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

func (s *Service) Provinces(ctx context.Context) ([]string, error) {
	const key = "prayer:provinces"
	if v, ok := s.cache.Get(key); ok {
		return v.([]string), nil
	}
	list, err := s.client.Provinces(ctx)
	if err != nil {
		return nil, err
	}
	s.cache.Set(key, list, s.ttl)
	return list, nil
}

func (s *Service) Cities(ctx context.Context, provinsi string) ([]string, error) {
	key := "prayer:cities:" + provinsi
	if v, ok := s.cache.Get(key); ok {
		return v.([]string), nil
	}
	list, err := s.client.Cities(ctx, provinsi)
	if err != nil {
		return nil, err
	}
	s.cache.Set(key, list, s.ttl)
	return list, nil
}

func (s *Service) Month(ctx context.Context, provinsi, kabkota string, year, month int) (*Month, error) {
	key := fmt.Sprintf("prayer:month:%s|%s|%d|%d", provinsi, kabkota, year, month)
	if v, ok := s.cache.Get(key); ok {
		return v.(*Month), nil
	}
	m, err := s.client.Month(ctx, provinsi, kabkota, year, month)
	if err != nil {
		return nil, err
	}
	s.cache.Set(key, m, s.ttl)
	return m, nil
}

// Day mengambil satu hari dari jadwal bulanan (memakai cache bulan).
func (s *Service) Day(ctx context.Context, provinsi, kabkota string, date time.Time) (*Day, error) {
	m, err := s.Month(ctx, provinsi, kabkota, date.Year(), int(date.Month()))
	if err != nil {
		return nil, err
	}
	for i := range m.Jadwal {
		if m.Jadwal[i].Tanggal == date.Day() {
			return &m.Jadwal[i], nil
		}
	}
	return nil, ErrNotFound
}
