package doa

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"
)

var ErrNotFound = errors.New("doa tidak ditemukan")

// Client satu-satunya bagian yang berbicara ke API Doa equran.id.
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
	Status string          `json:"status"`
	Data   json.RawMessage `json:"data"`
}

// List mengambil seluruh doa (sekitar 228 bacaan) dalam satu permintaan.
func (c *Client) List(ctx context.Context) ([]Doa, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, c.baseURL, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Accept", "application/json")
	resp, err := c.http.Do(req)
	if err != nil {
		return nil, fmt.Errorf("equran.id tidak dapat dihubungi: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("equran.id membalas status %d", resp.StatusCode)
	}
	var env envelope
	if err := json.NewDecoder(resp.Body).Decode(&env); err != nil {
		return nil, fmt.Errorf("respons equran.id tidak terbaca: %w", err)
	}
	if env.Status != "" && env.Status != "success" {
		return nil, fmt.Errorf("equran.id membalas status %q", env.Status)
	}
	var list []Doa
	if err := json.Unmarshal(env.Data, &list); err != nil {
		return nil, fmt.Errorf("format daftar doa tidak sesuai: %w", err)
	}
	return list, nil
}
