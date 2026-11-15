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

  <div class="chips mode" role="group" aria-label="Tampilan daftar">
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

  <div v-if="mode === 'surah'" class="search">
    <input
      v-model="query"
      class="input"
      type="search"
      placeholder="Cari surah (nama, arti, atau nomor)"
      aria-label="Cari surah"
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

  <div v-if="!loading && !error && mode === 'juz'" class="grid">
    <RouterLink
      v-for="j in juzList"
      :key="j.juz"
      :to="`/surah/${j.surah}?ayah=${j.ayat}`"
      class="card juz-card"
      :class="{ current: j.juz === lastReadJuz }"
    >
      <span class="juz-no">{{ j.juz }}</span>
      <span class="juz-info">
        <strong>Juz {{ j.juz }}</strong>
        <small class="muted">{{ j.nama }}</small>
        <small class="muted">{{ j.from }} – {{ j.to }}</small>
      </span>
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
.mode { margin-bottom: 0.8rem; }
.juz-card {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  margin: 0;
  text-decoration: none;
  color: inherit;
  min-width: 0;
  transition: border-color 0.2s ease, transform 0.2s ease;
}
.juz-card:active { transform: scale(0.98); }
@media (hover: hover) {
  .juz-card:hover { border-color: var(--primary); }
}
.juz-card.current { border-color: var(--primary); background: var(--primary-soft); }
.juz-no {
  flex: none;
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  font-weight: 700;
  color: var(--primary);
  background: var(--primary-soft);
  border: 1px solid var(--primary);
}
.juz-card.current .juz-no { background: var(--primary); color: var(--on-primary); }
.juz-info { display: grid; gap: 1px; min-width: 0; }
.juz-info small { overflow-wrap: anywhere; font-size: 0.78rem; }
</style>