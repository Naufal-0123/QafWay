package doa

import (
	"context"
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

func (s *Service) all(ctx context.Context) ([]Doa, error) {
	const key = "doa:all"
	if v, ok := s.cache.Get(key); ok {
		return v.([]Doa), nil
	}
	list, err := s.client.List(ctx)
	if err != nil {
		return nil, err
	}
	s.cache.Set(key, list, s.ttl)
	return list, nil
}

// List menyaring doa berdasarkan grup, tag, dan kata kunci (semua opsional).
func (s *Service) List(ctx context.Context, f Filter) ([]Doa, error) {
	all, err := s.all(ctx)
	if err != nil {
		return nil, err
	}
	grup := strings.ToLower(strings.TrimSpace(f.Grup))
	tag := strings.ToLower(strings.TrimSpace(f.Tag))
	q := strings.ToLower(strings.TrimSpace(f.Query))

	out := make([]Doa, 0, len(all))
	for _, d := range all {
		if grup != "" && strings.ToLower(d.Grup) != grup {
			continue
		}
		if tag != "" && !hasTag(d.Tag, tag) {
			continue
		}
		if q != "" && !matches(d, q) {
			continue
		}
		out = append(out, d)
	}
	return out, nil
}

func (s *Service) Get(ctx context.Context, id int) (*Doa, error) {
	all, err := s.all(ctx)
	if err != nil {
		return nil, err
	}
	for i := range all {
		if all[i].ID == id {
			return &all[i], nil
		}
	}
	return nil, ErrNotFound
}

func hasTag(tags []string, want string) bool {
	for _, t := range tags {
		if strings.ToLower(t) == want {
			return true
		}
	}
	return false
}

func matches(d Doa, q string) bool {
	hay := strings.ToLower(strings.Join([]string{d.Nama, d.Idn, d.Tr, strings.Join(d.Tag, " ")}, " "))
	return strings.Contains(hay, q)
}
