package tajwid

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

var ErrNotFound = errors.New("surah tidak ditemukan")

// Client satu-satunya bagian yang berbicara ke UmmahAPI untuk data tajwid.
type Client struct {
	baseURL string
	http    *http.Client
}

func NewClient(baseURL string) *Client {
	return &Client{
		baseURL: strings.TrimRight(baseURL, "/"),
		http:    &http.Client{Timeout: 30 * time.Second},
	}
}

func (c *Client) Surah(ctx context.Context, nomor int) (*Surah, error) {
	url := fmt.Sprintf("%s/quran/surah/%d?script=tajweed&translation=indonesian", c.baseURL, nomor)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Accept", "application/json")

	resp, err := c.http.Do(req)
	if err != nil {
		return nil, fmt.Errorf("UmmahAPI tidak dapat dihubungi: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusNotFound {
		return nil, ErrNotFound
	}
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("UmmahAPI membalas status %d", resp.StatusCode)
	}

	var root map[string]any
	if err := json.NewDecoder(io.LimitReader(resp.Body, 32<<20)).Decode(&root); err != nil {
		return nil, fmt.Errorf("respons UmmahAPI tidak terbaca: %w", err)
	}
	return parseSurah(nomor, root)
}
