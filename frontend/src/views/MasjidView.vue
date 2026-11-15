<script setup>
import { ref, computed, onMounted } from 'vue'
import { getPosition } from '../api/geo'
import { findNearbyMosques, mapsLink, formatDistance } from '../api/masjid'

const radius = ref(2)
const filter = ref('semua') // semua | masjid | musholla
const loading = ref(false)
const error = ref('')
const items = ref([])
const searched = ref(false)

const visible = computed(() =>
  items.value.filter((m) => filter.value === 'semua' || m.kind === filter.value).slice(0, 40),
)
const total = computed(() => items.value.length)

async function search() {
  loading.value = true
  error.value = ''
  try {
    const c = await getPosition()
    items.value = await findNearbyMosques(c.latitude, c.longitude, Number(radius.value))
    searched.value = true
  } catch (e) {
    items.value = []
    error.value = e.message
  } finally {
    loading.value = false
  }
}

onMounted(search)
</script>

<template>
  <div class="masjid">
    <h1 class="title">Masjid Terdekat</h1>

    <section class="card controls">
      <label class="field">
        Radius pencarian
        <select v-model="radius" :disabled="loading" @change="search">
          <option :value="1">1 km</option>
          <option :value="2">2 km</option>
          <option :value="5">5 km</option>
        </select>
      </label>
      <div class="chips">
        <button v-for="f in ['semua', 'masjid', 'musholla']" :key="f" class="chip" :class="{ on: filter === f }" @click="filter = f">
          {{ f === 'semua' ? 'Semua' : f === 'masjid' ? 'Masjid' : 'Musholla' }}
        </button>
      </div>
      <button class="btn primary" :disabled="loading" @click="search">
        {{ loading ? 'Mencari…' : '📍 Cari ulang dari lokasi saya' }}
      </button>
    </section>

    <p v-if="error" class="error">{{ error }}</p>
    <p v-else-if="loading" class="muted center">Mencari masjid di sekitar Anda…</p>
    <p v-else-if="searched && !visible.length" class="muted center">
      Tidak ada hasil dalam radius {{ radius }} km. Coba perbesar radius pencarian.
    </p>

    <ul v-if="visible.length" class="list">
      <li v-for="m in visible" :key="m.id" class="item">
        <div class="info">
          <strong :class="{ dim: m.unnamed }">{{ m.name }}</strong>
          <span class="muted small">{{ m.kind === 'musholla' ? 'Musholla' : 'Masjid' }}<template v-if="m.address"> · {{ m.address }}</template></span>
        </div>
        <div class="side">
          <span class="dist">{{ formatDistance(m.km) }}</span>
          <a class="go" :href="mapsLink(m)" target="_blank" rel="noopener">Rute</a>
        </div>
      </li>
    </ul>
    <p v-if="searched && total > visible.length && filter === 'semua'" class="muted small center">
      Menampilkan {{ visible.length }} terdekat dari {{ total }} hasil.
    </p>

    <p class="muted note">
      Data dari OpenStreetMap contributors (ODbL), bisa belum lengkap atau kurang mutakhir. Lokasi Anda dikirim ke
      server Overpass hanya untuk mencari masjid terdekat. Kalau ada masjid yang belum tercantum, Anda bisa
      menambahkannya di <a href="https://www.openstreetmap.org" target="_blank" rel="noopener">openstreetmap.org</a>.
    </p>
  </div>
</template>

<style scoped>
.masjid { max-width: 900px; margin: 0 auto; }
.title { margin: 8px 0 12px; font-size: 1.5rem; }
.muted { color: var(--muted, #62716c); }
.small { font-size: .82rem; }
.center { text-align: center; }
.note { font-size: .8rem; margin-top: 18px; }
.error { color: var(--error, #b42318); font-size: .9rem; }

.card { margin-top: 14px; padding: 14px; border-radius: 14px; display: grid; gap: 12px; border: 1px solid var(--border, #e2e7e5); background: var(--surface, #f4f6f5); }
.field { display: grid; gap: 4px; font-size: .85rem; color: var(--muted, #62716c); }
.field select { width: 100%; margin: 0; }
.chips { display: flex; gap: 6px; flex-wrap: wrap; }
.chip { min-height: 38px; padding: 0 14px; border-radius: 999px; cursor: pointer; font: inherit; border: 1px solid var(--border, #e2e7e5); background: var(--bg, #fff); color: var(--text, #17201e); }
.chip.on { background: var(--primary, #0f766e); border-color: var(--primary, #0f766e); color: var(--on-primary, #fff); }
.btn { min-height: 46px; padding: 0 16px; border-radius: 12px; cursor: pointer; font: inherit; border: 1px solid var(--border, #e2e7e5); background: var(--surface, #f4f6f5); color: var(--text, #17201e); }
.btn.primary { background: var(--primary, #0f766e); border-color: var(--primary, #0f766e); color: var(--on-primary, #fff); }
.btn:disabled { opacity: .6; cursor: default; }

.list { list-style: none; margin: 14px 0 0; padding: 0; display: grid; gap: 8px; }
.item { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 14px; border: 1px solid var(--border, #e2e7e5); background: var(--surface, #f4f6f5); }
.info { display: grid; gap: 2px; min-width: 0; }
.info strong { overflow-wrap: anywhere; }
.dim { color: var(--muted, #62716c); font-weight: 500; }
.side { display: grid; justify-items: end; gap: 6px; flex: none; }
.dist { font-weight: 700; color: var(--primary, #0f766e); }
.go { padding: 6px 12px; border-radius: 999px; font-size: .85rem; text-decoration: none; background: var(--primary-soft, #dcefea); color: var(--primary, #0f766e); border: 1px solid var(--primary, #0f766e); }
</style>