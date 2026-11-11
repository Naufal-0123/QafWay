package quran

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"
)

var ErrNotFound = errors.New("data tidak ditemukan")

// Client satu-satunya bagian yang berbicara ke equran.id.
type Client struct {
	baseURL string
	http    *http.Client
}

func NewClient(baseURL string) *Client {
	return &Client{
		baseURL: strings.TrimRight(baseURL, "/"),
		http:    &http.Client{Timeout: 15 * time.Second},
	}
}

type envelope struct {
	Code    int             `json:"code"`
	Message string          `json:"message"`
	Data    json.RawMessage `json:"data"`
}

func (c *Client) get(ctx context.Context, path string) (json.RawMessage, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, c.baseURL+path, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Accept", "application/json")
	resp, err := c.http.Do(req)
	if err != nil {
		return nil, fmt.Errorf("equran.id tidak dapat dihubungi: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusNotFound {
		return nil, ErrNotFound
	}
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("equran.id membalas status %d", resp.StatusCode)
	}
	var env envelope
	if err := json.NewDecoder(resp.Body).Decode(&env); err != nil {
		return nil, fmt.Errorf("respons equran.id tidak terbaca: %w", err)
	}
	if env.Code == http.StatusNotFound {
		return nil, ErrNotFound
	}
	return env.Data, nil
}

func (c *Client) ListSurah(ctx context.Context) ([]Surah, error) {
	data, err := c.get(ctx, "/surat")
	if err != nil {
		return nil, err
	}
	var list []Surah
	if err := json.Unmarshal(data, &list); err != nil {
		return nil, fmt.Errorf("format daftar surat tidak sesuai: %w", err)
	}
	return list, nil
}

// GetSurah mengembalikan JSON asli detail surat (ayat + audio) tanpa diubah.
func (c *Client) GetSurah(ctx context.Context, nomor int) (json.RawMessage, error) {
	return c.get(ctx, fmt.Sprintf("/surat/%d", nomor))
}