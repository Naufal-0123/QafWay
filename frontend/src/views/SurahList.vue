<script setup>
import { ref, computed, onMounted } from 'vue'
import { getSurahs } from '../api/quran'
import SurahCard from '../components/SurahCard.vue'

const surahs = ref([])
const query = ref('')
const place = ref('')
const loading = ref(true)
const error = ref('')
const lastRead = ref(null)

onMounted(async () => {
  const saved = localStorage.getItem('quran_last_read')
  if (saved) {
    try {
      lastRead.value = JSON.parse(saved)
    } catch (e) {
      lastRead.value = null
    }
  }

  try {
    surahs.value = await getSurahs()
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})

const places = computed(() => [...new Set(surahs.value.map((s) => s.tempatTurun).filter(Boolean))])

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return surahs.value.filter(
    (s) =>
      (!place.value || s.tempatTurun === place.value) &&
      (!q ||
        s.namaLatin.toLowerCase().includes(q) ||
        s.arti.toLowerCase().includes(q) ||
        s.nama.includes(q) ||
        String(s.nomor) === q),
  )
})
</script>

<template>
  <h1>Daftar Surah</h1>

  <!-- Kartu Pintasan Terakhir Dibaca -->
  <div v-if="lastRead" class="card last-read-card">
    <div>
      <small class="muted">Terakhir Dibaca</small>
      <div><strong>Surah {{ lastRead.surahNama }}</strong> (Ayat {{ lastRead.nomorAyat }})</div>
    </div>
    <RouterLink :to="`/surah/${lastRead.surahNomor}?ayah=${lastRead.nomorAyat}`" class="btn primary">
      Lanjutkan →
    </RouterLink>
  </div>

  <div class="search">
    <input v-model="query" class="input" type="search" placeholder="Cari surah (nama, arti, atau nomor)" aria-label="Cari surah" />
    <button v-if="query" class="clear" aria-label="Hapus pencarian" @click="query = ''">✕</button>
  </div>

  <div v-if="places.length" class="chips" role="group" aria-label="Tempat turun">
    <button class="chip" :class="{ on: !place }" :aria-pressed="!place" @click="place = ''">Semua</button>
    <button
      v-for="p in places"
      :key="p"
      class="chip"
      :class="{ on: place === p }"
      :aria-pressed="place === p"
      @click="place = place === p ? '' : p"
    >{{ p }}</button>
  </div>

  <p v-if="error" class="error">{{ error }}</p>
  <div v-else-if="loading" class="grid" aria-busy="true">
    <div v-for="n in 8" :key="n" class="card skeleton"></div>
  </div>
  <p v-else-if="!filtered.length" class="muted">Surah tidak ditemukan. Coba kata kunci lain.</p>

  <div v-if="!loading && !error" class="grid">
    <SurahCard v-for="s in filtered" :key="s.nomor" :surah="s" />
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
</style>