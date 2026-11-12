package quran

import (
	"context"
	"encoding/json"
	"fmt"
	"time"
)

type Ayah struct {
	NomorAyat     int               `json:"nomorAyat"`
	TeksArab      string            `json:"teksArab"`
	TeksLatin     string            `json:"teksLatin"`
	TeksIndonesia string            `json:"teksIndonesia"`
	Audio         map[string]string `json:"audio,omitempty"`
}

type SurahRef struct {
	Nomor      int    `json:"nomor"`
	Nama       string `json:"nama"`
	NamaLatin  string `json:"namaLatin"`
	Arti       string `json:"arti"`
	JumlahAyat int    `json:"jumlahAyat"`
}

type Daily struct {
	Date  string   `json:"date"`
	Surah SurahRef `json:"surah"`
	Ayah  Ayah     `json:"ayah"`
}

// Daily memilih satu ayat dari seluruh Al-Qur'an secara deterministik berdasarkan
// tanggal, sehingga semua pengguna mendapat ayat yang sama pada hari yang sama.
func (s *Service) Daily(ctx context.Context, date time.Time) (*Daily, error) {
	list, err := s.Surahs(ctx, "")
	if err != nil {
		return nil, err
	}
	total := 0
	for _, sr := range list {
		total += sr.JumlahAyat
	}
	if total == 0 {
		return nil, fmt.Errorf("daftar surah kosong")
	}

	days := time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, time.UTC).Unix() / 86400
	idx := int((uint64(days) * 2654435761) % uint64(total))

	var chosen Surah
	for _, sr := range list {
		if idx < sr.JumlahAyat {
			chosen = sr
			break
		}
		idx -= sr.JumlahAyat
	}
	if chosen.Nomor == 0 {
		return nil, fmt.Errorf("gagal menentukan ayat harian")
	}

	raw, err := s.Surah(ctx, chosen.Nomor)
	if err != nil {
		return nil, err
	}
	var detail struct {
		Ayat []Ayah `json:"ayat"`
	}
	if err := json.Unmarshal(raw, &detail); err != nil {
		return nil, fmt.Errorf("format detail surah tidak sesuai: %w", err)
	}

	var ayah *Ayah
	for i := range detail.Ayat {
		if detail.Ayat[i].NomorAyat == idx+1 {
			ayah = &detail.Ayat[i]
			break
		}
	}
	if ayah == nil && idx < len(detail.Ayat) {
		ayah = &detail.Ayat[idx]
	}
	if ayah == nil {
		return nil, fmt.Errorf("ayat tidak ditemukan")
	}

	return &Daily{
		Date: date.Format("2006-01-02"),
		Surah: SurahRef{
			Nomor:      chosen.Nomor,
			Nama:       chosen.Nama,
			NamaLatin:  chosen.NamaLatin,
			Arti:       chosen.Arti,
			JumlahAyat: chosen.JumlahAyat,
		},
		Ayah: *ayah,
	}, nil
}
