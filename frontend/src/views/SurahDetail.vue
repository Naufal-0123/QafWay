<script setup>
import {
  ref,
  computed,
  watch,
  onMounted,
  onBeforeUnmount,
  nextTick,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import { getSurah } from "../api/quran";
import { getTajwid } from "../api/tajwid";
import AyahCard from "../components/AyahCard.vue";

const route = useRoute();
const router = useRouter();
const surah = ref(null);
const loading = ref(true);
const error = ref("");

const qari = ref("01");
const showLatin = ref(true);
const showTranslation = ref(true);
const playingAyah = ref(null);
const isPlaying = ref(false);
const ayahQuery = ref("");
const ayahRefs = ref({});

const repeatMode = ref("off"); // 'off' | 'one' | 'all'
const fontScale = ref(1);
const lastRead = ref(null);

const pendingNextSurah = ref(null);

// State Mode Tajwid Terintegrasi
const showTajwid = ref(false);
const tajwidLoading = ref(false);
const tajwidData = ref(null);
const selectedRule = ref("");

const RULES = [
  { key: 'ghunnah', label: 'Ghunnah', desc: 'Dengung pada nun atau mim bertasydid, ditahan sekitar 2 harakat.' },
  { key: 'ikhfa', label: 'Ikhfa', desc: 'Nun mati atau tanwin bertemu 15 huruf ikhfa, dibaca samar disertai dengung.' },
  { key: 'ikhfa_shafawi', label: 'Ikhfa Syafawi', desc: 'Mim mati bertemu huruf ba, dibaca samar disertai dengung.' },
  { key: 'iqlab', label: 'Iqlab', desc: 'Nun mati atau tanwin bertemu huruf ba, bunyinya diganti menjadi mim disertai dengung.' },
  { key: 'idgham_ghunnah', label: 'Idgham bighunnah', desc: 'Nun mati atau tanwin bertemu ya, nun, mim, atau wau; dilebur dengan dengung.' },
  { key: 'idgham_no_ghunnah', label: 'Idgham bilaghunnah', desc: 'Nun mati atau tanwin bertemu lam atau ra; dilebur tanpa dengung.' },
  { key: 'idgham_shafawi', label: 'Idgham Syafawi', desc: 'Mim mati bertemu mim; dilebur disertai dengung.' },
  { key: 'idgham_mutajanisayn', label: 'Idgham mutajanisain', desc: 'Dua huruf yang satu makhraj bertemu, huruf pertama sukun; dilebur.' },
  { key: 'idgham_mutaqaribayn', label: 'Idgham mutaqaribain', desc: 'Dua huruf yang berdekatan makhraj atau sifatnya bertemu; dilebur.' },
  { key: 'qalqalah', label: 'Qalqalah', desc: 'Pantulan bunyi pada huruf ق ط ب ج د ketika sukun.' },
  { key: 'madda_normal', label: 'Mad thabi\'i', desc: 'Mad asli, dipanjangkan 2 harakat.' },
  { key: 'madda_permissible', label: 'Mad ja\'iz', desc: 'Mad yang boleh dibaca 2, 4, atau 6 harakat.' },
  { key: 'madda_obligatory', label: 'Mad wajib muttasil', desc: 'Mad bertemu hamzah dalam satu kata, dipanjangkan 4 sampai 5 harakat.' },
  { key: 'madda_necessary', label: 'Mad lazim', desc: 'Mad bertemu sukun asli atau tasydid, wajib dipanjangkan 6 harakat.' },
  { key: 'hamzat_wasl', label: 'Hamzah wasal', desc: 'Hamzah yang tidak dibaca ketika bersambung dengan kata sebelumnya.' },
  { key: 'laam_shamsiyah', label: 'Lam syamsiyah', desc: 'Lam pada "al" tidak dibaca dan melebur ke huruf sesudahnya.' },
  { key: 'silent', label: 'Huruf tidak dibaca', desc: 'Huruf yang ditulis tetapi tidak dilafalkan.' },
];
const RULE_BY_KEY = Object.fromEntries(RULES.map((r) => [r.key, r]));

const audio = new Audio();

const qariNames = {
  "01": "Abdullah Al-Juhany",
  "02": "Abdul Muhsin Al-Qasim",
  "03": "Abdurrahman as-Sudais",
  "04": "Ibrahim Al-Dossari",
  "05": "Misyari Rasyid Al-Afasy",
  "06": "Yasser Al-Dosari",
};

const qariIds = computed(() =>
  Object.keys(surah.value?.audioFull ?? {}).sort(),
);
const description = computed(() =>
  (surah.value?.deskripsi ?? "").replace(/<[^>]*>/g, ""),
);
const next = computed(() => surah.value?.suratSelanjutnya?.nomor ?? null);
const prev = computed(() => surah.value?.suratSebelumnya?.nomor ?? null);

const filteredAyat = computed(() => {
  const list = surah.value?.ayat ?? [];
  const q = ayahQuery.value.trim().toLowerCase();

  if (isPlaying.value && playingAyah.value) {
    const currentIndex = list.findIndex(
      (a) => a.nomorAyat === playingAyah.value,
    );
    return list.slice(Math.max(0, currentIndex - 1));
  }

  if (!q) return list;
  return list.filter(
    (a) =>
      a.teksIndonesia.toLowerCase().includes(q) ||
      a.teksLatin.toLowerCase().includes(q) ||
      String(a.nomorAyat) === q,
  );
});

const tajwidByAyah = computed(() => {
  const map = {};
  for (const v of tajwidData.value?.verses ?? []) {
    map[v.ayah] = v.segments;
  }
  return map;
});

const presentRules = computed(() => {
  const seen = new Set();
  for (const v of tajwidData.value?.verses ?? []) {
    for (const s of v.segments) {
      if (s.rule) seen.add(s.rule);
    }
  }
  return RULES.filter((r) => seen.has(r.key));
});

const selectedRuleInfo = computed(() => RULE_BY_KEY[selectedRule.value] ?? null);
const pickRule = (key) => (selectedRule.value = selectedRule.value === key ? "" : key);
const colorOf = (rule) => (RULE_BY_KEY[rule] ? `var(--tj-${rule})` : undefined);

async function toggleTajwidMode() {
  showTajwid.value = !showTajwid.value;
  selectedRule.value = "";
  if (showTajwid.value && !tajwidData.value && surah.value) {
    tajwidLoading.value = true;
    try {
      tajwidData.value = await getTajwid(surah.value.nomor);
    } catch {
      tajwidData.value = null;
    } finally {
      tajwidLoading.value = false;
    }
  }
}

function changeFontSize(delta) {
  const newScale = fontScale.value + delta;
  if (newScale >= 0.8 && newScale <= 1.6) {
    fontScale.value = Number(newScale.toFixed(1));
  }
}

function toggleBookmark(ayah) {
  const mark = {
    surahNomor: surah.value.nomor,
    surahNama: surah.value.namaLatin,
    nomorAyat: ayah.nomorAyat,
  };

  if (
    lastRead.value?.surahNomor === mark.surahNomor &&
    lastRead.value?.nomorAyat === mark.nomorAyat
  ) {
    lastRead.value = null;
    localStorage.removeItem("quran_last_read");
  } else {
    lastRead.value = mark;
    localStorage.setItem("quran_last_read", JSON.stringify(mark));
  }
}

async function copyAyah(ayah) {
  const text = `${ayah.teksArab}\n\n${ayah.teksLatin}\n\n${ayah.teksIndonesia} (QS. ${surah.value.namaLatin}: ${ayah.nomorAyat})`;
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    /* abaikan */
  }
}

function loadBookmark() {
  const saved = localStorage.getItem("quran_last_read");
  if (saved) {
    try {
      lastRead.value = JSON.parse(saved);
    } catch {
      lastRead.value = null;
    }
  }
}

function stop() {
  audio.pause();
  playingAyah.value = null;
  isPlaying.value = false;
}

async function scrollToAyah(nomorAyat) {
  await nextTick();
  setTimeout(() => {
    const componentInstance = ayahRefs.value[nomorAyat];
    const el = componentInstance?.$el || componentInstance;
    if (el && typeof el.scrollIntoView === "function") {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("highlight-target");
      setTimeout(() => {
        el.classList.remove("highlight-target");
      }, 2000);
    }
  }, 100);
}

function play(ayah) {
  const url = ayah.audio?.[qari.value] || ayah.audio?.["01"];
  if (!url) return;

  audio.src = url;
  audio
    .play()
    .then(() => {
      isPlaying.value = true;
      playingAyah.value = ayah.nomorAyat;
      scrollToAyah(ayah.nomorAyat);
    })
    .catch(() => {
      playingAyah.value = null;
      isPlaying.value = false;
    });
}

function toggle(ayah) {
  if (playingAyah.value === ayah.nomorAyat && isPlaying.value) {
    audio.pause();
    isPlaying.value = false;
  } else {
    play(ayah);
  }
}

function toggleFullAudio() {
  const list = surah.value?.ayat ?? [];
  if (!list.length) return;

  if (isPlaying.value) {
    audio.pause();
    isPlaying.value = false;
  } else {
    const currentList = filteredAyat.value;
    const targetAyah = currentList.length > 0 ? currentList[0] : list[0];
    play(targetAyah);
  }
}

function cycleRepeatMode() {
  if (repeatMode.value === "off") repeatMode.value = "one";
  else if (repeatMode.value === "one") repeatMode.value = "all";
  else repeatMode.value = "off";
}

async function playNextSurah() {
  const nextNum = pendingNextSurah.value;
  if (!nextNum) return;

  try {
    loading.value = true;
    error.value = "";
    ayahQuery.value = "";

    const newSurahData = await getSurah(nextNum);
    surah.value = newSurahData;

    await router.push(`/surah/${nextNum}`);
    await nextTick();
    window.scrollTo({ top: 0 });

    const firstAyah = newSurahData?.ayat?.[0];
    if (firstAyah) {
      play(firstAyah);
    }
  } catch (e) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
}

audio.addEventListener("ended", async () => {
  const fullList = surah.value?.ayat ?? [];
  const idx = fullList.findIndex((a) => a.nomorAyat === playingAyah.value);

  if (repeatMode.value === "one" && playingAyah.value) {
    const currentAyah = fullList.find((a) => a.nomorAyat === playingAyah.value);
    if (currentAyah) play(currentAyah);
  } else if (idx >= 0 && idx < fullList.length - 1) {
    play(fullList[idx + 1]);
  } else if (repeatMode.value === "all" && fullList.length > 0) {
    play(fullList[0]);
  } else {
    const nextSurahNum = surah.value?.suratSelanjutnya?.nomor;
    if (nextSurahNum) {
      pendingNextSurah.value = nextSurahNum;
      await playNextSurah();
    } else {
      playingAyah.value = null;
      isPlaying.value = false;
    }
  }
});

onMounted(() => {
  loadBookmark();
});

onBeforeUnmount(() => {
  stop();
});

watch(
  () => [route.params.nomor, route.query.ayah],
  async ([nomor, targetAyahNum]) => {
    if (!nomor) return;
    stop();
    loading.value = true;
    error.value = "";
    ayahQuery.value = "";
    tajwidData.value = null;
    selectedRule.value = "";
    try {
      surah.value = await getSurah(nomor);
      if (showTajwid.value && surah.value) {
        tajwidLoading.value = true;
        tajwidData.value = await getTajwid(nomor).catch(() => null);
        tajwidLoading.value = false;
      }
    } catch (e) {
      error.value = e.message;
      surah.value = null;
    } finally {
      loading.value = false;
    }
    if (!surah.value) return;
    await nextTick();
    if (targetAyahNum) scrollToAyah(Number(targetAyahNum));
    else window.scrollTo({ top: 0 });
  },
  { immediate: true },
);
</script>

<template>
  <div class="surah-detail-page">
    <RouterLink to="/" class="btn back-btn">
      <span>←</span> Kembali ke Daftar Surah
    </RouterLink>

    <div v-if="loading" aria-busy="true">
      <div class="card skeleton" style="height: 180px"></div>
      <div class="card skeleton" style="height: 120px"></div>
    </div>
    <p v-else-if="error" class="error">{{ error }}</p>

    <template v-else-if="surah">
      <section class="card hero">
        <p class="arab-title" dir="rtl" lang="ar">{{ surah.nama }}</p>
        <h1>{{ surah.namaLatin }}</h1>
        <p class="muted">
          {{ surah.arti }} · {{ surah.jumlahAyat }} ayat · {{ surah.tempatTurun }}
        </p>
        <RouterLink
          :to="`/surah/${surah.nomor}/tafsir`"
          class="btn"
          style="margin-top: 0.5rem"
        >
          📖 Baca Tafsir
        </RouterLink>
        <p v-if="description" class="desc">{{ description }}</p>
      </section>

      <section class="toolbar">
        <label class="qari-label">
          <!-- <span>Qari</span> -->
          <select v-model="qari" @change="stop">
            <option v-for="id in qariIds" :key="id" :value="id">
              {{ qariNames[id] || `Qari ${id}` }}
            </option>
          </select>
        </label>
        <button
          class="chip"
          :class="{ on: showLatin }"
          :aria-pressed="showLatin"
          @click="showLatin = !showLatin"
        >
          Latin
        </button>
        <button
          class="chip"
          :class="{ on: showTranslation }"
          :aria-pressed="showTranslation"
          @click="showTranslation = !showTranslation"
        >
          Terjemahan
        </button>
        <button
          class="chip"
          :class="{ on: showTajwid }"
          :aria-pressed="showTajwid"
          @click="toggleTajwidMode"
        >
          🎨 Tajwid
        </button>

        <button
          class="chip"
          :class="{ on: repeatMode !== 'off' }"
          @click="cycleRepeatMode"
        >
          🔁
          {{
            repeatMode === "off"
              ? "Repeat: Mati"
              : repeatMode === "one"
                ? "Repeat: 1 Ayat"
                : "Repeat: Semua"
          }}
        </button>

        <div class="font-controls">
          <button
            class="chip"
            title="Kecilkan Teks Arab"
            @click="changeFontSize(-0.1)"
          >
            A-
          </button>
          <button
            class="chip"
            title="Besarkan Teks Arab"
            @click="changeFontSize(0.1)"
          >
            A+
          </button>
        </div>
      </section>

      <!-- Legenda & Keterangan Hukum Tajwid saat Mode Tajwid Aktif -->
      <section v-if="showTajwid" class="card tajwid-panel">
        <p v-if="tajwidLoading" class="muted" style="margin: 0; font-size: 0.9rem">
          Memuat penanda warna tajwid…
        </p>
        <template v-else-if="presentRules.length">
          <div class="legend" aria-label="Keterangan warna tajwid">
            <button
              v-for="r in presentRules"
              :key="r.key"
              class="chip"
              :class="{ on: selectedRule === r.key }"
              :aria-pressed="selectedRule === r.key"
              @click="pickRule(r.key)"
            >
              <i class="sw" :style="{ background: colorOf(r.key) }"></i>{{ r.label }}
            </button>
          </div>
          <div v-if="selectedRuleInfo" class="rule-info" aria-live="polite">
            <strong :style="{ color: colorOf(selectedRuleInfo.key) }">{{ selectedRuleInfo.label }}: </strong>
            <span>{{ selectedRuleInfo.desc }}</span>
          </div>
          <p v-else class="muted" style="margin: 0.4rem 0 0; font-size: 0.82rem">
            Ketuk huruf berwarna atau label hukum tajwid di atas untuk melihat penjelasan bacaannya.
          </p>
        </template>
        <p v-else class="muted" style="margin: 0; font-size: 0.88rem">
          Data warna tajwid tidak tersedia untuk surah ini.
        </p>
      </section>

      <div class="search" style="margin-bottom: 1rem">
        <input
          v-model="ayahQuery"
          class="input"
          type="search"
          placeholder="Cari ayat di surah ini (terjemahan, latin, atau nomor)..."
          aria-label="Cari ayat"
        />
        <button
          v-if="ayahQuery"
          class="clear"
          aria-label="Hapus pencarian ayat"
          @click="ayahQuery = ''"
        >
          ✕
        </button>
      </div>

      <div class="audio-banner card">
        <span>Putar Surah (Presisi per Ayat)</span>
        <button class="btn primary" @click="toggleFullAudio">
          {{ isPlaying ? "❚❚ Jeda Audio" : "▶ Putar Surah" }}
        </button>
      </div>

      <p
        v-if="!filteredAyat.length"
        class="muted"
        style="text-align: center; margin: 2rem 0"
      >
        Ayat tidak ditemukan dalam surah ini.
      </p>

      <!-- Render Mode Tajwid Berwarna dengan Tombol Ikon -->
      <template v-if="showTajwid && tajwidData && Object.keys(tajwidByAyah).length">
        <article
          v-for="a in filteredAyat"
          :key="a.nomorAyat"
          :ref="(el) => { if (el) ayahRefs[a.nomorAyat] = el; }"
          class="card ayah-card"
          :class="{ 'highlight-target': playingAyah === a.nomorAyat && isPlaying }"
        >
          <div class="ayah-head">
            <span class="badge" :class="{ bookmarked: lastRead?.surahNomor === surah.nomor && lastRead?.nomorAyat === a.nomorAyat }">
              {{ a.nomorAyat }}
            </span>
            <div class="actions">
              <button class="btn icon-btn" @click="toggleBookmark(a)" :title="lastRead?.surahNomor === surah.nomor && lastRead?.nomorAyat === a.nomorAyat ? 'Hapus penanda' : 'Tandai'">
                {{ lastRead?.surahNomor === surah.nomor && lastRead?.nomorAyat === a.nomorAyat ? "🔖" : "📑" }}
              </button>
              <button class="btn icon-btn" @click="copyAyah(a)" title="Salin ayat">
                📋
              </button>
              <button class="btn" @click="toggle(a)">
                {{ playingAyah === a.nomorAyat && isPlaying ? "❚❚ Jeda" : "▶ Putar" }}
              </button>
            </div>
          </div>

          <p
            class="arab"
            dir="rtl"
            lang="ar"
            :style="{ fontSize: `${fontScale * 2.2}rem` }"
          >
            <template v-if="tajwidByAyah[a.nomorAyat]">
              <span
                v-for="(s, idx) in tajwidByAyah[a.nomorAyat]"
                :key="idx"
                :class="{ tj: s.rule, dim: selectedRule && s.rule !== selectedRule }"
                :style="s.rule ? { color: colorOf(s.rule) } : null"
                :title="s.rule ? RULE_BY_KEY[s.rule]?.label : null"
                @click="s.rule && pickRule(s.rule)"
              >{{ s.text }}</span>
            </template>
            <template v-else>{{ a.teksArab }}</template>
          </p>

          <p v-if="showLatin" class="tr">{{ a.teksLatin }}</p>
          <p v-if="showTranslation" class="idn">{{ a.teksIndonesia }}</p>
        </article>
      </template>

      <!-- Render Komponen AyahCard Standar jika Mode Tajwid Mati -->
      <template v-else>
        <AyahCard
          v-for="a in filteredAyat"
          :key="a.nomorAyat"
          :ref="(el) => { if (el) ayahRefs[a.nomorAyat] = el; }"
          :ayah="a"
          :surah-nomor="surah.nomor"
          :playing="playingAyah === a.nomorAyat && isPlaying"
          :show-latin="showLatin"
          :show-translation="showTranslation"
          :font-scale="fontScale"
          :is-bookmarked="
            lastRead?.surahNomor === surah.nomor &&
            lastRead?.nomorAyat === a.nomorAyat
          "
          @toggle="toggle(a)"
          @bookmark="toggleBookmark(a)"
        />
      </template>

      <nav class="pager">
        <RouterLink v-if="prev" :to="`/surah/${prev}`" class="btn"
          >← Sebelumnya</RouterLink
        >
        <span v-else></span>
        <RouterLink v-if="next" :to="`/surah/${next}`" class="btn"
          >Berikutnya →</RouterLink
        >
      </nav>
    </template>
  </div>
</template>

<style scoped>
.surah-detail-page {
  --tj-hamzat_wasl: #8d9995;
  --tj-silent: #8d9995;
  --tj-laam_shamsiyah: #8d9995;
  --tj-madda_normal: #537fff;
  --tj-madda_permissible: #4050ff;
  --tj-madda_necessary: #000ebc;
  --tj-madda_obligatory: #2144c1;
  --tj-qalqalah: #dd0008;
  --tj-idgham_shafawi: #58b800;
  --tj-idgham_ghunnah: #169777;
  --tj-idgham_no_ghunnah: #169200;
  --tj-idgham_mutajanisayn: #8d9995;
  --tj-idgham_mutaqaribayn: #8d9995;
  --tj-ghunnah: #ff7e1e;
  --tj-ikhfa: #9400a8;
  --tj-ikhfa_shafawi: #d500b7;
  --tj-iqlab: #1ba8e0;
}

@media (prefers-color-scheme: dark) {
  .surah-detail-page {
    --tj-hamzat_wasl: #9aa8a3;
    --tj-silent: #9aa8a3;
    --tj-laam_shamsiyah: #9aa8a3;
    --tj-madda_normal: #7d9bff;
    --tj-madda_permissible: #8c97ff;
    --tj-madda_necessary: #a3acff;
    --tj-madda_obligatory: #7e9bff;
    --tj-qalqalah: #ff6b6b;
    --tj-idgham_shafawi: #7fd62b;
    --tj-idgham_ghunnah: #2ed1ac;
    --tj-idgham_no_ghunnah: #35cc22;
    --tj-idgham_mutajanisayn: #9aa8a3;
    --tj-idgham_mutaqaribayn: #9aa8a3;
    --tj-ghunnah: #ff9a4d;
    --tj-ikhfa: #d36bff;
    --tj-ikhfa_shafawi: #ff5fe0;
    --tj-iqlab: #4fc8ff;
  }
}

.font-controls {
  display: flex;
  gap: 0.3rem;
  margin-left: auto;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  align-items: center;
}

.toolbar label {
  display: inline-flex;
  align-items: center;
  font-size: 0.9rem;
  color: var(--muted);
}

/* Menggunakan komponen select global yang konsisten dengan halaman lain */
.toolbar select {
  margin-left: 0.4rem;
  width: 220px; /* Lebar tetap yang pas untuk nama-nama Qari */
  min-width: 220px;
}

.tajwid-panel {
  margin-bottom: 1rem;
  padding: 0.9rem 1rem;
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.sw {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 6px;
}

.rule-info {
  margin-top: 0.7rem;
  padding: 0.65rem 0.9rem;
  border-radius: 10px;
  background: var(--bg, #f4f6f5);
  font-size: 0.88rem;
  line-height: 1.5;
}

.audio-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.8rem 1.2rem;
  margin-bottom: 1rem;
  gap: 1rem;
}

.ayah-card {
  padding: 1rem 1.2rem;
  margin: 0.6rem 0;
}

.ayah-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.8rem;
  gap: 0.5rem;
}

.badge {
  display: inline-grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: var(--surface, #f4f6f5);
  border: 1px solid var(--border, #e2e7e5);
  font-weight: 700;
  font-size: 0.85rem;
  flex: none;
}

.badge.bookmarked {
  background: var(--primary, #0f766e);
  color: var(--on-primary, #fff);
  border-color: var(--primary, #0f766e);
}

.actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: flex-start;
}

.actions .btn {
  min-height: 36px;
  padding: 0 10px;
  font-size: 0.82rem;
  border-radius: 10px;
}

.actions .icon-btn {
  padding: 0 8px;
  font-size: 0.95rem;
  min-width: 36px;
}

.arab {
  font-family: var(--arab-font, 'Amiri', 'Noto Naskh Arabic', serif);
  text-align: right;
  line-height: 2.4;
  margin: 12px 0 16px;
}

.tj {
  cursor: pointer;
}

.dim {
  opacity: 0.28;
}

.tr {
  color: var(--primary, #0f766e);
  font-style: italic;
  margin: 6px 0;
  font-size: 0.95rem;
}

.idn {
  margin: 6px 0;
  line-height: 1.6;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.8rem 0 0.4rem;
  font-weight: 600;
  font-size: 0.9rem;
  padding: 0.4rem 1rem;
  border-radius: 999px;
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--text);
  transition: all 0.2s ease;
}

.back-btn:hover {
  border-color: var(--primary);
  background: var(--primary-soft);
  color: var(--primary);
}

@media (max-width: 480px) {
  .hero {
    padding: 1.2rem 0.8rem;
  }
  .audio-banner {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
  }
  .audio-banner .btn {
    width: 100%;
  }
  .actions {
    gap: 4px;
  }
  .actions .btn {
    padding: 0 8px;
    font-size: 0.78rem;
  }
}
</style>