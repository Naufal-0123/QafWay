package prayer

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

var ErrNotFound = errors.New("jadwal tidak ditemukan")

// Client satu-satunya bagian yang berbicara ke API jadwal shalat equran.id.
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

// Bentuk asli dari equran.id (snake_case).
type upstreamDay struct {
	Tanggal        int    `json:"tanggal"`
	TanggalLengkap string `json:"tanggal_lengkap"`
	Hari           string `json:"hari"`
	Imsak          string `json:"imsak"`
	Subuh          string `json:"subuh"`
	Terbit         string `json:"terbit"`
	Dhuha          string `json:"dhuha"`
	Dzuhur         string `json:"dzuhur"`
	Ashar          string `json:"ashar"`
	Maghrib        string `json:"maghrib"`
	Isya           string `json:"isya"`
}

type upstreamMonth struct {
	Provinsi  string        `json:"provinsi"`
	Kabkota   string        `json:"kabkota"`
	Bulan     int           `json:"bulan"`
	Tahun     int           `json:"tahun"`
	BulanNama string        `json:"bulan_nama"`
	Jadwal    []upstreamDay `json:"jadwal"`
}

func (c *Client) do(ctx context.Context, method, path string, body any) (json.RawMessage, error) {
	var reader io.Reader
	if body != nil {
		b, err := json.Marshal(body)
		if err != nil {
			return nil, err
		}
		reader = bytes.NewReader(b)
	}
	req, err := http.NewRequestWithContext(ctx, method, c.baseURL+path, reader)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Accept", "application/json")
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}

	resp, err := c.http.Do(req)
	if err != nil {
		return nil, fmt.Errorf("equran.id tidak dapat dihubungi: %w", err)
	}
	defer resp.Body.Close()

	var env envelope
	decodeErr := json.NewDecoder(resp.Body).Decode(&env)

	switch {
	case resp.StatusCode == http.StatusBadRequest || resp.StatusCode == http.StatusNotFound,
		env.Code == http.StatusBadRequest || env.Code == http.StatusNotFound:
		return nil, ErrNotFound
	case resp.StatusCode != http.StatusOK:
		return nil, fmt.Errorf("equran.id membalas status %d", resp.StatusCode)
	case decodeErr != nil:
		return nil, fmt.Errorf("respons equran.id tidak terbaca: %w", decodeErr)
	}
	return env.Data, nil
}

func (c *Client) Provinces(ctx context.Context) ([]string, error) {
	data, err := c.do(ctx, http.MethodGet, "/shalat/provinsi", nil)
	if err != nil {
		return nil, err
	}
	var list []string
	if err := json.Unmarshal(data, &list); err != nil {
		return nil, fmt.Errorf("format daftar provinsi tidak sesuai: %w", err)
	}
	return list, nil
}

func (c *Client) Cities(ctx context.Context, provinsi string) ([]string, error) {
	data, err := c.do(ctx, http.MethodPost, "/shalat/kabkota", map[string]string{"provinsi": provinsi})
	if err != nil {
		return nil, err
	}
	var list []string
	if err := json.Unmarshal(data, &list); err != nil {
		return nil, fmt.Errorf("format daftar kabupaten/kota tidak sesuai: %w", err)
	}
	return list, nil
}

func (c *Client) Month(ctx context.Context, provinsi, kabkota string, year, month int) (*Month, error) {
	data, err := c.do(ctx, http.MethodPost, "/shalat", map[string]any{
		"provinsi": provinsi,
		"kabkota":  kabkota,
		"bulan":    month,
		"tahun":    year,
	})
	if err != nil {
		return nil, err
	}
	var up upstreamMonth
	if err := json.Unmarshal(data, &up); err != nil {
		return nil, fmt.Errorf("format jadwal tidak sesuai: %w", err)
	}
	if len(up.Jadwal) == 0 {
		return nil, ErrNotFound
	}

	out := &Month{
		Provinsi:  up.Provinsi,
		Kabkota:   up.Kabkota,
		Tahun:     up.Tahun,
		Bulan:     up.Bulan,
		BulanNama: up.BulanNama,
		Jadwal:    make([]Day, 0, len(up.Jadwal)),
	}
	if out.Tahun == 0 {
		out.Tahun = year
	}
	if out.Bulan == 0 {
		out.Bulan = month
	}
	for _, d := range up.Jadwal {
		out.Jadwal = append(out.Jadwal, Day{
			Tanggal:        d.Tanggal,
			TanggalLengkap: d.TanggalLengkap,
			Hari:           d.Hari,
			Imsak:          d.Imsak,
			Subuh:          d.Subuh,
			Terbit:         d.Terbit,
			Dhuha:          d.Dhuha,
			Dzuhur:         d.Dzuhur,
			Ashar:          d.Ashar,
			Maghrib:        d.Maghrib,
			Isya:           d.Isya,
		})
	}
	return out, nil
}
