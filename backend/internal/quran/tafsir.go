package quran

import (
	"context"
	"encoding/json"
	"fmt"
)

// GetTafsir mengembalikan JSON asli tafsir satu surah dari equran.id.
func (c *Client) GetTafsir(ctx context.Context, nomor int) (json.RawMessage, error) {
	return c.get(ctx, fmt.Sprintf("/tafsir/%d", nomor))
}

func (s *Service) Tafsir(ctx context.Context, nomor int) (json.RawMessage, error) {
	key := fmt.Sprintf("tafsir:%d", nomor)
	if v, ok := s.cache.Get(key); ok {
		return v.(json.RawMessage), nil
	}
	raw, err := s.client.GetTafsir(ctx, nomor)
	if err != nil {
		return nil, err
	}
	s.cache.Set(key, raw, s.ttl)
	return raw, nil
}
