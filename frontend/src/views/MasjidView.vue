<script setup>
import { ref, computed, onMounted } from 'vue'
import { findNearbyMosques, getPreciseLocation, searchPlace, mapsLink, formatDistance } from '../api/masjid'

const radius = ref(2)
const filter = ref('semua') // semua | masjid | musholla
const loading = ref(false)
const error = ref('')
const items = ref([])
const searched = ref(false)

const origin = ref(null) // { lat, lon, accuracy, label }
const manual = ref(false) // true = titik diatur manual, tidak pakai GPS

const placeQuery = ref('')
const placeResults = ref([])
const placeBusy = ref(false)
const placeError = ref('')

const visible = computed(() =>
  items.value.filter((m) => filter.value === 'semua' || m.kind === filter.value).slice(0, 40),
)
const total = computed(() => items.value.length)
const lowAccuracy = computed(() => !manual.value && origin.value?.accuracy > 1000)

async function runSearch() {
  loading.value = true
  error.value = ''
  try {
    items.value = await findNearbyMosques(origin.value.lat, origin.value.lon, Number(radius.value))
    searched.value = true
  } catch (e) {
    items.value = []
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function useMyLocation() {
  loading.value = true
  error.value = ''
  manual.value = false
  try {
    origin.value = await getPreciseLocation()
  } catch (e) {
    loading.value = false
    items.value = []
    error.value = e.message
    return
  }
  await runSearch()
}

async function findPlace() {
  placeError.value = ''
  placeResults.value = []
  placeBusy.value = true
  try {
    placeResults.value = await searchPlace(placeQuery.value)
    if (!placeResults.value.length) placeError.value = 'Lokasi tidak ditemukan. Coba nama jalan, kelurahan, atau kota.'
  } catch (e) {
    placeError.value = e.message
  } finally {
    placeBusy.value = false
  }
}

async function pickPlace(p) {
  origin.value = p
  manual.value = true
  placeResults.value = []
  placeQuery.value = ''
  await runSearch()
}

function onRadius() {
  if (origin.value) runSearch()
}

onMounted(useMyLocation)
</script>

<template>
  <div class="masjid">
    <h1 class="title">Masjid Terdekat</h1>

    <section class="card controls">
      <div v-if="origin" class="origin">
        <span class="muted small">Titik pencarian</span>
        <strong class="olabel">{{ origin.label }}</strong>
        <span v-if="origin.accuracy != null" class="muted small">Akurasi ± {{ origin.accuracy }} m</span>
        <a
          class="small"
          :href="`https://www.google.com/maps/search/?api=1&query=${origin.lat},${origin.lon}`"
          target="_blank"
          rel="noopener"
          >Lihat titik ini di peta</a
        >
      </div>

      <p v-if="lowAccuracy" class="warn">
        Akurasi lokasi rendah (± {{ origin.accuracy }} m), jadi hasil bisa meleset. Ini sering terjadi di laptop/PC
        atau saat VPN aktif. Coba di HP dengan GPS menyala, matikan VPN, atau atur lokasi secara manual di bawah.
      </p>

      <label class="field">
        Radius pencarian
        <select v-model="radius" :disabled="loading" @change="onRadius">
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

      <button class="btn primary" :disabled="loading" @click="useMyLocation">
        {{ loading ? 'Mencari…' : '📍 Pakai lokasi saya' }}
      </button>

      <div class="manual">
        <label class="field">
          Atau atur lokasi manual
          <input v-model="placeQuery" type="text" placeholder="Nama jalan, kelurahan, atau kota" @keyup.enter="findPlace" />
        </label>
        <button class="btn" :disabled="placeBusy || placeQuery.trim().length < 3" @click="findPlace">
          {{ placeBusy ? 'Mencari…' : 'Cari lokasi' }}
        </button>
        <p v-if="placeError" class="warn">{{ placeError }}</p>
        <ul v-if="placeResults.length" class="places">
          <li v-for="p in placeResults" :key="`${p.lat},${p.lon}`">
            <button class="place" @click="pickPlace(p)">{{ p.label }}</button>
          </li>
        </ul>
      </div>
    </section>

    <p v-if="error" class="error">{{ error }}</p>
    <p v-else-if="loading" class="muted center">Mencari masjid di sekitar titik ini…</p>
    <p v-else-if="searched && !visible.length" class="muted center">
      Tidak ada hasil dalam radius {{ radius }} km. Coba perbesar radius atau atur lokasi manual.
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
      server Overpass dan Nominatim hanya untuk mencari masjid terdekat. Kalau ada masjid yang belum tercantum, Anda
      bisa menambahkannya di <a href="https://www.openstreetmap.org" target="_blank" rel="noopener">openstreetmap.org</a>.
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
.warn { margin: 0; padding: 10px 12px; border-radius: 10px; font-size: .85rem; color: var(--gold, #a8741a); background: var(--gold-soft, #f6ecd3); }

.card { margin-top: 14px; padding: 14px; border-radius: 14px; display: grid; gap: 12px; border: 1px solid var(--border, #e2e7e5); background: var(--surface, #f4f6f5); }
.origin { display: grid; gap: 2px; }
.olabel { overflow-wrap: anywhere; font-size: .95rem; }
.field { display: grid; gap: 4px; font-size: .85rem; color: var(--muted, #62716c); }
.field select { width: 100%; margin: 0; }
.field input {
  height: 46px; padding: 0 12px; font-size: 16px; border-radius: 10px; min-width: 0; box-sizing: border-box;
  border: 1px solid var(--border, #e2e7e5); background: var(--bg, #fff); color: var(--text, #17201e);
}
.field input:focus { outline: none; border-color: var(--primary, #0f766e); box-shadow: 0 0 0 3px var(--primary-soft, #dcefea); }
.chips { display: flex; gap: 6px; flex-wrap: wrap; }
.chip { min-height: 38px; padding: 0 14px; border-radius: 999px; cursor: pointer; font: inherit; border: 1px solid var(--border, #e2e7e5); background: var(--bg, #fff); color: var(--text, #17201e); }
.chip.on { background: var(--primary, #0f766e); border-color: var(--primary, #0f766e); color: var(--on-primary, #fff); }
.btn { min-height: 46px; padding: 0 16px; border-radius: 12px; cursor: pointer; font: inherit; border: 1px solid var(--border, #e2e7e5); background: var(--surface, #f4f6f5); color: var(--text, #17201e); }
.btn.primary { background: var(--primary, #0f766e); border-color: var(--primary, #0f766e); color: var(--on-primary, #fff); }
.btn:disabled { opacity: .6; cursor: default; }

.manual { display: grid; gap: 8px; padding-top: 4px; border-top: 1px solid var(--border, #e2e7e5); }
.places { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; }
.place { width: 100%; text-align: left; padding: 10px 12px; border-radius: 10px; cursor: pointer; font: inherit; font-size: .88rem; border: 1px solid var(--border, #e2e7e5); background: var(--bg, #fff); color: var(--text, #17201e); }
.place:hover { border-color: var(--primary, #0f766e); }

.list { list-style: none; margin: 14px 0 0; padding: 0; display: grid; gap: 8px; }
.item { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 14px; border: 1px solid var(--border, #e2e7e5); background: var(--surface, #f4f6f5); }
.info { display: grid; gap: 2px; min-width: 0; }
.info strong { overflow-wrap: anywhere; }
.dim { color: var(--muted, #62716c); font-weight: 500; }
.side { display: grid; justify-items: end; gap: 6px; flex: none; }
.dist { font-weight: 700; color: var(--primary, #0f766e); }
.go { padding: 6px 12px; border-radius: 999px; font-size: .85rem; text-decoration: none; background: var(--primary-soft, #dcefea); color: var(--primary, #0f766e); border: 1px solid var(--primary, #0f766e); }
</style>