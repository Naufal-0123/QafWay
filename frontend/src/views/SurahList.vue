<script setup>
import { ref, computed, onMounted } from "vue";
import { getSurahs } from "../api/quran";
import SurahCard from "../components/SurahCard.vue";
import { buildJuzList, juzOf } from "../data/juz";

const surahs = ref([]);
const query = ref("");
const place = ref("");
const loading = ref(true);
const error = ref("");
const lastRead = ref(null);

// Mode tampilan: "surah" atau "juz" (diingat di perangkat)
const MODE_KEY = "qafway_list_mode";
const mode = ref("surah");
try {
  if (localStorage.getItem(MODE_KEY) === "juz") mode.value = "juz";
} catch (e) {
  /* abaikan */
}
function setMode(m) {
  if (m !== mode.value) query.value = ""; // kata kunci tidak relevan antar mode
  mode.value = m;
  try {
    localStorage.setItem(MODE_KEY, m);
  } catch (e) {
    /* abaikan */
  }
}

onMounted(async () => {
  const saved = localStorage.getItem("quran_last_read");
  if (saved) {
    try {
      lastRead.value = JSON.parse(saved);
    } catch (e) {
      lastRead.value = null;
    }
  }

  try {
    surahs.value = await getSurahs();
  } catch (e) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
});

const places = computed(() => [
  ...new Set(surahs.value.map((s) => s.tempatTurun).filter(Boolean)),
]);

const juzList = computed(() => buildJuzList(surahs.value));
const lastReadJuz = computed(() =>
  lastRead.value
    ? juzOf(Number(lastRead.value.surahNomor), Number(lastRead.value.nomorAyat))
    : null,
);

// Ringkas rentang: "Al-Baqarah 142 – Al-Baqarah 252" menjadi "Al-Baqarah 142–252"
function juzRange(j) {
  const a = /^(.*) (\d+)$/.exec(j.from);
  const b = /^(.*) (\d+)$/.exec(j.to);
  if (a && b && a[1] === b[1]) return `${a[1]} ${a[2]}–${b[2]}`;
  return `${j.from} – ${j.to}`;
}

const filteredJuz = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return juzList.value;
  return juzList.value.filter(
    (j) =>
      String(j.juz) === q ||
      `juz ${j.juz}` === q ||
      j.nama.toLowerCase().includes(q) ||
      j.from.toLowerCase().includes(q) ||
      j.to.toLowerCase().includes(q),
  );
});

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  return surahs.value.filter(
    (s) =>
      (!place.value || s.tempatTurun === place.value) &&
      (!q ||
        s.namaLatin.toLowerCase().includes(q) ||
        s.arti.toLowerCase().includes(q) ||
        s.nama.includes(q) ||
        String(s.nomor) === q),
  );
});
</script>

<template>
  <h1>Daftar Surah</h1>

  <!-- Kartu Pintasan Terakhir Dibaca -->
  <div v-if="lastRead" class="card last-read-card">
    <div>
      <small class="muted">Terakhir Dibaca</small>
      <div>
        <strong>Surah {{ lastRead.surahNama }}</strong> (Ayat
        {{ lastRead.nomorAyat }}<template v-if="lastReadJuz">, Juz {{ lastReadJuz }}</template>)
      </div>
    </div>
    <RouterLink
      :to="`/surah/${lastRead.surahNomor}?ayah=${lastRead.nomorAyat}`"
      class="btn primary"
    >
      Lanjutkan →
    </RouterLink>
  </div>

  <div class="search">
    <input
      v-model="query"
      class="input"
      type="search"
      :placeholder="mode === 'juz' ? 'Cari juz (nomor, nama juz, atau nama surah)' : 'Cari surah (nama, arti, atau nomor)'"
      :aria-label="mode === 'juz' ? 'Cari juz' : 'Cari surah'"
    />
    <button
      v-if="query"
      class="clear"
      aria-label="Hapus pencarian"
      @click="query = ''"
    >
      ✕
    </button>
  </div>

  <div class="filters">
    <div class="chips" role="group" aria-label="Tampilan daftar">
      <button
        class="chip"
        :class="{ on: mode === 'surah' }"
        :aria-pressed="mode === 'surah'"
        @click="setMode('surah')"
      >
        Surah
      </button>
      <button
        class="chip"
        :class="{ on: mode === 'juz' }"
        :aria-pressed="mode === 'juz'"
        @click="setMode('juz')"
      >
        Juz
      </button>
    </div>

    <span v-if="mode === 'surah' && places.length" class="sep" aria-hidden="true"></span>
    <div
      v-if="mode === 'surah' && places.length"
      class="chips"
      role="group"
      aria-label="Tempat turun"
    >
      <button
        class="chip"
        :class="{ on: !place }"
        :aria-pressed="!place"
        @click="place = ''"
      >
        Semua
      </button>
      <button
        v-for="p in places"
        :key="p"
        class="chip"
        :class="{ on: place === p }"
        :aria-pressed="place === p"
        @click="place = place === p ? '' : p"
      >
        {{ p }}
      </button>
    </div>
  </div>

  <p v-if="error" class="error">{{ error }}</p>
  <div v-else-if="loading" class="grid" aria-busy="true">
    <div v-for="n in 8" :key="n" class="card skeleton"></div>
  </div>
  <p v-else-if="mode === 'surah' && !filtered.length" class="muted">
    Surah tidak ditemukan. Coba kata kunci lain.
  </p>

  <div v-if="!loading && !error && mode === 'surah'" class="grid">
    <SurahCard v-for="s in filtered" :key="s.nomor" :surah="s" />
  </div>

  <p v-if="!loading && !error && mode === 'juz' && !filteredJuz.length" class="muted">
    Juz tidak ditemukan. Coba nomor juz atau nama surah.
  </p>

  <div v-if="!loading && !error && mode === 'juz'" class="grid juz-grid">
    <RouterLink
      v-for="j in filteredJuz"
      :key="j.juz"
      :to="`/surah/${j.surah}?ayah=${j.ayat}`"
      class="card surah-card"
      :class="{ current: j.juz === lastReadJuz }"
      :title="`Juz ${j.juz} · ${j.nama} · ${j.from} – ${j.to}`"
    >
      <span class="num">{{ j.juz }}</span>
      <div class="meta">
        <strong>Juz {{ j.juz }}</strong>
        <small>{{ j.nama }}</small>
        <small>{{ juzRange(j) }}</small>
      </div>
    </RouterLink>
  </div>
</template>

<style scoped>
.last-read-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--primary-soft);
  border-color: var(--primary);
  margin-bottom: 1.2rem;
}
.filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.2rem 0.7rem;
  margin: 0.8rem 0 0.4rem;
}
.filters .chips {
  padding: 0.2rem 0;
  margin: 0;
  overflow: visible;
}
.sep {
  width: 1px;
  height: 22px;
  background: var(--border);
}
@media (max-width: 480px) {
  .sep { display: none; }
}
/* Kartu juz memakai gaya kartu surah; ini hanya penanda juz yang sedang dibaca */
.surah-card.current { border-color: var(--primary); background: var(--primary-soft); }
/* Daftar juz: kartu lebih lebar agar rentang surah terbaca penuh (2 kolom di desktop, 1 di HP) */
.grid.juz-grid { grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr)); }
.juz-grid .surah-card small { white-space: normal; overflow: visible; text-overflow: clip; }
</style>