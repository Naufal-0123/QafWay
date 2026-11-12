package tajwid

import (
	"fmt"
	"html"
	"regexp"
	"sort"
	"strconv"
	"strings"
)

var (
	tagRe   = regexp.MustCompile(`<[^>]*>`)
	classRe = regexp.MustCompile(`class=["']?([^"'\s>]+)`)
)

// Nama kelas dari sumber data dinormalkan ke satu nama baku.
var aliases = map[string]string{
	"ham_wasl":               "hamzat_wasl",
	"hamza_wasl":             "hamzat_wasl",
	"slnt":                   "silent",
	"lam_shamsiyah":          "laam_shamsiyah",
	"laam_shamsiyyah":        "laam_shamsiyah",
	"lam_shamsiyyah":         "laam_shamsiyah",
	"qalaqah":                "qalqalah",
	"idgham_wo_ghunnah":      "idgham_no_ghunnah",
	"idgham_without_ghunnah": "idgham_no_ghunnah",
	"idgham_mutajaanisain":   "idgham_mutajanisayn",
	"idgham_mutajanisain":    "idgham_mutajanisayn",
	"idgham_mutaqaaribain":   "idgham_mutaqaribayn",
	"idgham_mutaqaribain":    "idgham_mutaqaribayn",
}

func normalize(class string) string {
	c := strings.ToLower(strings.TrimSpace(class))
	if v, ok := aliases[c]; ok {
		return v
	}
	return c
}

func classOf(tag string) string {
	m := classRe.FindStringSubmatch(tag)
	if len(m) < 2 {
		return ""
	}
	return m[1]
}

// ParseMarkup mengubah teks bertag <tajweed class=...> menjadi potongan aman.
// Tag lain dibuang, dan penanda nomor ayat (<span class=end>) tidak disertakan.
func ParseMarkup(s string) []Segment {
	var segs []Segment
	rule := ""
	skip := false
	pos := 0

	emit := func(text string) {
		if skip || text == "" {
			return
		}
		text = html.UnescapeString(text)
		if n := len(segs); n > 0 && segs[n-1].Rule == rule {
			segs[n-1].Text += text
			return
		}
		segs = append(segs, Segment{Text: text, Rule: rule})
	}

	for _, loc := range tagRe.FindAllStringIndex(s, -1) {
		if loc[0] > pos {
			emit(s[pos:loc[0]])
		}
		tag := s[loc[0]:loc[1]]
		pos = loc[1]
		switch {
		case strings.HasPrefix(tag, "<tajweed"):
			rule = normalize(classOf(tag))
		case tag == "</tajweed>":
			rule = ""
		case strings.HasPrefix(tag, "<span"):
			if classOf(tag) == "end" {
				skip = true
			}
		case tag == "</span>":
			skip = false
		}
	}
	if pos < len(s) {
		emit(s[pos:])
	}
	return segs
}

/* ---------- Membaca respons UmmahAPI (bentuk toleran) ---------- */

func keysOf(m map[string]any) string {
	ks := make([]string, 0, len(m))
	for k := range m {
		ks = append(ks, k)
	}
	sort.Strings(ks)
	return strings.Join(ks, ", ")
}

func toInt(v any) (int, bool) {
	switch t := v.(type) {
	case float64:
		return int(t), true
	case string:
		n, err := strconv.Atoi(t)
		return n, err == nil
	}
	return 0, false
}

func findVerses(root map[string]any) ([]any, bool) {
	candidates := []map[string]any{root}
	if d, ok := root["data"].(map[string]any); ok {
		candidates = append(candidates, d)
		if s, ok := d["surah"].(map[string]any); ok {
			candidates = append(candidates, s)
		}
	}
	for _, m := range candidates {
		for _, k := range []string{"verses", "ayahs", "ayat"} {
			if arr, ok := m[k].([]any); ok && len(arr) > 0 {
				return arr, true
			}
		}
	}
	return nil, false
}

func verseNumber(m map[string]any, index int) int {
	if key, ok := m["verse_key"].(string); ok {
		if parts := strings.Split(key, ":"); len(parts) == 2 {
			if n, err := strconv.Atoi(parts[1]); err == nil {
				return n
			}
		}
	}
	for _, k := range []string{"ayah", "verse_number", "ayah_number", "number", "numberInSurah"} {
		if n, ok := toInt(m[k]); ok {
			return n
		}
	}
	return index + 1
}

// verseText memilih teks yang mengandung tag tajwid; jika tidak ada, teks pertama yang terisi.
func verseText(m map[string]any) string {
	var texts []string
	for _, k := range []string{"arabic", "text_uthmani_tajweed", "tajweed", "text"} {
		switch t := m[k].(type) {
		case string:
			if t != "" {
				texts = append(texts, t)
			}
		case map[string]any:
			if s, ok := t["tajweed"].(string); ok && s != "" {
				texts = append(texts, s)
			}
		}
	}
	for _, t := range texts {
		if strings.Contains(t, "<tajweed") {
			return t
		}
	}
	if len(texts) > 0 {
		return texts[0]
	}
	return ""
}

func parseSurah(nomor int, root map[string]any) (*Surah, error) {
	if ok, has := root["success"].(bool); has && !ok {
		return nil, fmt.Errorf("UmmahAPI melaporkan kegagalan: %v", root["error"])
	}
	arr, ok := findVerses(root)
	if !ok {
		data, _ := root["data"].(map[string]any)
		return nil, fmt.Errorf("daftar ayat tidak ditemukan di respons UmmahAPI (kunci atas: %s; kunci data: %s)", keysOf(root), keysOf(data))
	}

	out := &Surah{Nomor: nomor, Verses: make([]Verse, 0, len(arr))}
	for i, item := range arr {
		m, ok := item.(map[string]any)
		if !ok {
			continue
		}
		segs := ParseMarkup(verseText(m))
		if len(segs) == 0 {
			continue
		}
		for _, s := range segs {
			if s.Rule != "" {
				out.RuleCount++
			}
		}
		out.Verses = append(out.Verses, Verse{Ayah: verseNumber(m, i), Segments: segs})
	}
	if len(out.Verses) == 0 {
		return nil, fmt.Errorf("tidak ada teks ayat yang terbaca dari respons UmmahAPI")
	}
	return out, nil
}
