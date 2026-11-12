package tajwid

import (
	"regexp"
	"strings"
	"testing"
)

// Contoh markup nyata dari dokumentasi Quran.Foundation (Al-Fatihah:1),
// format yang sama dengan yang dijanjikan UmmahAPI untuk script=tajweed.
const sample = `بِسْمِ <tajweed class=ham_wasl>ٱ</tajweed>للَّهِ <tajweed class=ham_wasl>ٱ</tajweed><tajweed class=laam_shamsiyah>ل</tajweed>رَّحْمَ<tajweed class=madda_normal>ـٰ</tajweed>نِ <tajweed class=ham_wasl>ٱ</tajweed><tajweed class=laam_shamsiyah>ل</tajweed>رَّح<tajweed class=madda_permissible>ِي</tajweed>مِ <span class=end>١</span>`

func TestParseMarkup(t *testing.T) {
	segs := ParseMarkup(sample)

	var joined strings.Builder
	rules := map[string]bool{}
	for _, s := range segs {
		joined.WriteString(s.Text)
		if s.Rule != "" {
			rules[s.Rule] = true
		}
		if strings.ContainsAny(s.Text, "<>") {
			t.Fatalf("segmen masih mengandung tag: %q", s.Text)
		}
	}

	want := regexp.MustCompile(`<[^>]*>`).ReplaceAllString(strings.ReplaceAll(sample, "<span class=end>١</span>", ""), "")
	if joined.String() != want {
		t.Fatalf("teks berubah.\nsekarang: %q\nseharusnya: %q", joined.String(), want)
	}
	for _, r := range []string{"hamzat_wasl", "laam_shamsiyah", "madda_normal", "madda_permissible"} {
		if !rules[r] {
			t.Errorf("hukum %q tidak terbaca (ditemukan: %v)", r, rules)
		}
	}
}

func TestNormalize(t *testing.T) {
	cases := map[string]string{
		"ham_wasl":          "hamzat_wasl",
		"slnt":              "silent",
		"Qalaqah":           "qalqalah",
		"idgham_wo_ghunnah": "idgham_no_ghunnah",
		"ghunnah":           "ghunnah",
	}
	for in, want := range cases {
		if got := normalize(in); got != want {
			t.Errorf("normalize(%q) = %q, seharusnya %q", in, got, want)
		}
	}
}

// Menguji logika pembacaan untuk bentuk respons yang didukung (data.verses[] dengan verse_key atau nomor).
func TestParseSurahShapes(t *testing.T) {
	tagged := `<tajweed class=ghunnah>نّ</tajweed>ا`
	shapes := map[string]map[string]any{
		"data.verses + verse_key": {
			"success": true,
			"data": map[string]any{"verses": []any{
				map[string]any{"verse_key": "1:1", "arabic": tagged},
				map[string]any{"verse_key": "1:2", "arabic": tagged},
			}},
		},
		"data.ayahs + ayah": {
			"data": map[string]any{"ayahs": []any{
				map[string]any{"ayah": float64(1), "arabic": map[string]any{"uthmani": "x", "tajweed": tagged}},
			}},
		},
	}
	for name, root := range shapes {
		s, err := parseSurah(1, root)
		if err != nil {
			t.Fatalf("%s: %v", name, err)
		}
		if s.Verses[0].Ayah != 1 || s.RuleCount == 0 {
			t.Errorf("%s: hasil tidak sesuai: %+v", name, s)
		}
	}

	if _, err := parseSurah(1, map[string]any{"success": true, "data": map[string]any{"foo": 1}}); err == nil {
		t.Error("bentuk tak dikenal seharusnya menghasilkan error")
	}
}