<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import { getQibla } from '../api/qibla'

const result = ref(null)
const coords = ref(null)
const loading = ref(false)
const error = ref('')
const manual = ref(false)
const latInput = ref('')
const lngInput = ref('')

const heading = ref(null) // arah hadap perangkat (derajat dari utara)
const compassOn = ref(false)
const sensorMsg = ref('')

async function lookup(lat, lng) {
  loading.value = true
  error.value = ''
  try {
    result.value = await getQibla(lat, lng)
    coords.value = { lat, lng }
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

function useMyLocation() {
  if (!navigator.geolocation) {
    error.value = 'Browser ini tidak mendukung penentuan lokasi. Isi koordinat secara manual.'
    manual.value = true
    return
  }
  loading.value = true
  error.value = ''
  navigator.geolocation.getCurrentPosition(
    (pos) => lookup(pos.coords.latitude, pos.coords.longitude),
    (err) => {
      loading.value = false
      error.value =
        err.code === 1
          ? 'Izin lokasi ditolak. Izinkan lokasi di pengaturan situs, atau isi koordinat manual.'
          : 'Lokasi tidak dapat ditentukan. Coba lagi atau isi koordinat manual.'
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
  )
}

function submitManual() {
  const lat = Number(String(latInput.value).replace(',', '.'))
  const lng = Number(String(lngInput.value).replace(',', '.'))
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    error.value = 'Koordinat tidak valid. Lintang -90 sampai 90, bujur -180 sampai 180.'
    return
  }
  lookup(lat, lng)
}

/* ---------- Kompas perangkat ---------- */
function onOrientation(e) {
  if (typeof e.webkitCompassHeading === 'number') {
    heading.value = e.webkitCompassHeading // iOS
  } else if ((e.absolute === true || e.type === 'deviceorientationabsolute') && typeof e.alpha === 'number') {
    heading.value = (360 - e.alpha + 360) % 360 // Android (perangkat diletakkan datar)
  }
}

async function startCompass() {
  sensorMsg.value = ''
  try {
    if (typeof DeviceOrientationEvent === 'undefined') throw new Error('Sensor arah tidak tersedia di perangkat ini.')
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      const r = await DeviceOrientationEvent.requestPermission()
      if (r !== 'granted') throw new Error('Izin sensor ditolak.')
      window.addEventListener('deviceorientation', onOrientation, true)
    } else {
      window.addEventListener('deviceorientationabsolute', onOrientation, true)
      window.addEventListener('deviceorientation', onOrientation, true)
    }
    compassOn.value = true
    sensorMsg.value = 'Letakkan perangkat mendatar dan jauhkan dari logam atau magnet.'
  } catch (e) {
    sensorMsg.value = `${e.message} Kompas butuh HTTPS (atau localhost) dan sensor magnetometer.`
  }
}

function stopCompass() {
  window.removeEventListener('deviceorientationabsolute', onOrientation, true)
  window.removeEventListener('deviceorientation', onOrientation, true)
  compassOn.value = false
  heading.value = null
}
onBeforeUnmount(stopCompass)

const dial = computed(() => (heading.value === null ? 0 : -heading.value))
const diff = computed(() => {
  if (heading.value === null || !result.value) return null
  return ((result.value.bearing - heading.value + 540) % 360) - 180
})
const aligned = computed(() => diff.value !== null && Math.abs(diff.value) <= 3)
</script>

<template>
  <div class="qibla">
    <h1 class="title">Arah Kiblat</h1>

    <section class="actions">
      <button class="btn primary" :disabled="loading" @click="useMyLocation">
        <span aria-hidden="true">📍</span> {{ loading ? 'Mencari lokasi…' : 'Gunakan lokasi saya' }}
      </button>
      <button class="btn" @click="manual = !manual">{{ manual ? 'Tutup input manual' : 'Isi koordinat manual' }}</button>
    </section>

    <form v-if="manual" class="manual" @submit.prevent="submitManual">
      <label>Lintang<input v-model="latInput" inputmode="decimal" placeholder="-6.2088" /></label>
      <label>Bujur<input v-model="lngInput" inputmode="decimal" placeholder="106.8456" /></label>
      <button class="btn" type="submit">Hitung</button>
    </form>

    <p v-if="error" class="error">{{ error }}</p>

    <template v-if="result">
      <section class="result">
        <span class="label">Arah kiblat</span>
        <strong class="deg">{{ result.bearing.toFixed(1) }}°</strong>
        <span class="dir">{{ result.compass }} dari utara</span>
        <small class="muted">Jarak ke Ka'bah ± {{ Math.round(result.distanceKm).toLocaleString('id-ID') }} km</small>
      </section>

      <svg viewBox="0 0 220 220" class="compass" role="img" :aria-label="`Kompas kiblat ${result.bearing.toFixed(0)} derajat`">
        <circle cx="110" cy="110" r="100" class="ring" />
        <g class="dial" :style="{ transform: `rotate(${dial}deg)` }">
          <text x="110" y="32" class="cardinal n">U</text>
          <text x="190" y="115" class="cardinal">T</text>
          <text x="110" y="199" class="cardinal">S</text>
          <text x="30" y="115" class="cardinal">B</text>
          <g class="qgroup" :style="{ transform: `rotate(${result.bearing}deg)` }">
            <line x1="110" y1="110" x2="110" y2="48" class="qline" :class="{ ok: aligned }" />
            <text x="110" y="44" class="kaaba">🕋</text>
          </g>
        </g>
        <polygon points="110,4 103,18 117,18" class="pointer" :class="{ ok: aligned }" />
        <circle cx="110" cy="110" r="4" class="hub" />
      </svg>

      <p v-if="aligned" class="ok-msg">Sejajar dengan arah kiblat ✓</p>
      <p v-else-if="diff !== null" class="muted center">Putar perangkat {{ Math.abs(Math.round(diff)) }}° ke {{ diff > 0 ? 'kanan' : 'kiri' }}.</p>

      <div class="center">
        <button v-if="!compassOn" class="btn" @click="startCompass">Aktifkan kompas perangkat</button>
        <button v-else class="btn" @click="stopCompass">Matikan kompas</button>
      </div>
      <p v-if="sensorMsg" class="muted center small">{{ sensorMsg }}</p>
      <p v-if="!compassOn" class="muted center small">
        Tanpa kompas, gambar di atas menunjukkan arah kiblat dengan utara di bagian atas.
      </p>
    </template>

    <p class="muted note">
      Arah dihitung dari koordinat Anda ke Ka'bah (21.4225°N, 39.8262°E) terhadap utara sejati. Sensor kompas HP bisa
      meleset beberapa derajat; cocokkan dengan petunjuk lain (misalnya arah saf masjid) bila memungkinkan.
    </p>
  </div>
</template>

<style scoped>
.title { margin: 8px 0 12px; font-size: 1.5rem; }
.muted { color: var(--muted, #62716c); }
.error { color: var(--error, #b42318); }
.center { text-align: center; }
.small { font-size: .82rem; }
.note { font-size: .8rem; margin-top: 18px; }

.actions { display: flex; flex-wrap: wrap; gap: 8px; }
.btn {
  min-height: 46px; padding: 0 16px; border-radius: 12px; cursor: pointer; font: inherit;
  border: 1px solid var(--border, #e2e7e5); background: var(--surface, #f4f6f5); color: var(--text, #17201e);
}
.btn.primary { background: var(--primary, #0f766e); border-color: var(--primary, #0f766e); color: var(--on-primary, #fff); }
.btn:disabled { opacity: .6; cursor: default; }

.manual { display: grid; grid-template-columns: 1fr 1fr auto; gap: 8px; align-items: end; margin: 12px 0; }
.manual label { display: grid; gap: 4px; font-size: .85rem; color: var(--muted, #62716c); }
.manual input {
  height: 46px; padding: 0 12px; font-size: 16px; border-radius: 10px;
  border: 1px solid var(--border, #e2e7e5); background: var(--surface, #f4f6f5); color: var(--text, #17201e); min-width: 0;
}

.result { display: grid; justify-items: center; gap: 2px; margin: 18px 0 4px; }
.result .label { font-size: .8rem; color: var(--muted, #62716c); text-transform: uppercase; letter-spacing: .04em; }
.deg { font-size: 3rem; line-height: 1.1; color: var(--primary, #0f766e); font-variant-numeric: tabular-nums; }
.dir { font-weight: 600; }

.compass { display: block; width: min(86vw, 320px); margin: 8px auto; }
.ring { fill: var(--surface, #f4f6f5); stroke: var(--border, #cfd6d3); stroke-width: 2; }
.dial, .qgroup { transform-origin: 110px 110px; transition: transform .15s linear; }
.cardinal { font-size: 14px; font-weight: 600; fill: var(--muted, #62716c); text-anchor: middle; dominant-baseline: middle; }
.cardinal.n { fill: var(--error, #b42318); }
.qline { stroke: var(--primary, #0f766e); stroke-width: 3; stroke-linecap: round; }
.qline.ok { stroke: #16a34a; }
.kaaba { font-size: 22px; text-anchor: middle; }
.pointer { fill: var(--text, #17201e); }
.pointer.ok { fill: #16a34a; }
.hub { fill: var(--text, #17201e); }
.ok-msg { text-align: center; color: #16a34a; font-weight: 700; margin: 4px 0; }
</style>