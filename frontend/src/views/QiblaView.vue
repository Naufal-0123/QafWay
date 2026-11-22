
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

/* =========================
   SENSOR KOMPAS HP
========================= */

const heading = ref(null)
const compassOn = ref(false)
const sensorMsg = ref('')
const sensorAccuracy = ref('')
const sensorMode = ref('')

let sensorTimeout = null

function getScreenAngle() {
  return Number(
    window.screen.orientation?.angle ??
    window.orientation ??
    0
  )
}

function normalizeAngle(value) {
  return ((value % 360) + 360) % 360
}

function onOrientation(e) {
  let newHeading = null

  // iPhone / Safari
  if (
    typeof e.webkitCompassHeading === 'number' &&
    Number.isFinite(e.webkitCompassHeading)
  ) {
    newHeading = normalizeAngle(e.webkitCompassHeading)
    sensorMode.value = 'Kompas magnetik'
  }

  // Android absolute orientation
  else if (
    typeof e.alpha === 'number' &&
    Number.isFinite(e.alpha) &&
    e.absolute === true
  ) {
    newHeading = normalizeAngle(
      360 - e.alpha + getScreenAngle()
    )
    sensorMode.value = 'Sensor orientasi'
  }

  // Fallback browser
  else if (
    typeof e.alpha === 'number' &&
    Number.isFinite(e.alpha)
  ) {
    newHeading = normalizeAngle(
      360 - e.alpha + getScreenAngle()
    )
    sensorMode.value = 'Sensor orientasi (akurasi terbatas)'
  }

  if (newHeading === null) return

  heading.value = newHeading

  if (sensorMode.value.includes('terbatas')) {
    sensorAccuracy.value =
      'Sensor tidak memberikan arah absolut. Hasil mungkin kurang akurat.'
  } else {
    sensorAccuracy.value = ''
  }

  if (sensorTimeout) {
    clearTimeout(sensorTimeout)
    sensorTimeout = null
  }

  sensorMsg.value = 'Kompas aktif. Putar HP secara perlahan.'
}

function handleOrientationError() {
  heading.value = null

  sensorMsg.value =
    'Sensor tidak memberikan data arah. Pastikan perangkat mendukung sensor kompas.'
}

async function startCompass() {
  sensorMsg.value = ''
  sensorAccuracy.value = ''
  heading.value = null

  try {
    if (!window.isSecureContext) {
      throw new Error(
        'Kompas membutuhkan koneksi HTTPS.'
      )
    }

    if (typeof DeviceOrientationEvent === 'undefined') {
      throw new Error(
        'Sensor orientasi tidak tersedia di browser ini.'
      )
    }

    // iOS membutuhkan permintaan izin
    if (
      typeof DeviceOrientationEvent.requestPermission === 'function'
    ) {
      const permission =
        await DeviceOrientationEvent.requestPermission()

      if (permission !== 'granted') {
        throw new Error(
          'Izin sensor ditolak. Aktifkan izin Motion & Orientation.'
        )
      }
    }

    stopCompass(false)

    window.addEventListener(
      'deviceorientation',
      onOrientation,
      true
    )

    window.addEventListener(
      'deviceorientationabsolute',
      onOrientation,
      true
    )

    compassOn.value = true
    sensorMsg.value = 'Menunggu data sensor kompas…'

    sensorTimeout = setTimeout(() => {
      if (heading.value === null) {
        handleOrientationError()
      }
    }, 5000)

  } catch (e) {
    compassOn.value = false
    sensorMsg.value = e.message
  }
}

function stopCompass(updateMessage = true) {
  window.removeEventListener(
    'deviceorientation',
    onOrientation,
    true
  )

  window.removeEventListener(
    'deviceorientationabsolute',
    onOrientation,
    true
  )

  if (sensorTimeout) {
    clearTimeout(sensorTimeout)
    sensorTimeout = null
  }

  compassOn.value = false
  heading.value = null
  sensorMode.value = ''
  sensorAccuracy.value = ''

  if (updateMessage) {
    sensorMsg.value = 'Kompas dimatikan.'
  }
}

onBeforeUnmount(() => stopCompass(false))

/* =========================
   LOKASI
========================= */

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
  manual.value = false

  if (!navigator.geolocation) {
    error.value =
      'Browser tidak mendukung lokasi. Silakan isi koordinat manual.'
    manual.value = true
    return
  }

  loading.value = true
  error.value = ''

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      lookup(
        pos.coords.latitude,
        pos.coords.longitude
      )
    },
    (err) => {
      loading.value = false

      error.value =
        err.code === 1
          ? 'Izin lokasi ditolak. Anda dapat menggunakan koordinat manual.'
          : 'Lokasi tidak dapat ditentukan. Silakan coba lagi atau masukkan koordinat manual.'
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 60000,
    }
  )
}

function submitManual() {
  const lat = Number(
    String(latInput.value).replace(',', '.')
  )

  const lng = Number(
    String(lngInput.value).replace(',', '.')
  )

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    error.value =
      'Koordinat tidak valid. Lintang harus -90 sampai 90 dan bujur -180 sampai 180.'
    return
  }

  lookup(lat, lng)
}

/* =========================
   PERHITUNGAN ARAH KOMPAS
========================= */

const dial = computed(() =>
  heading.value === null ? 0 : -heading.value
)

const diff = computed(() => {
  if (heading.value === null || !result.value) {
    return null
  }

  return (
    ((result.value.bearing - heading.value + 540) % 360) - 180
  )
})

const aligned = computed(
  () => diff.value !== null && Math.abs(diff.value) <= 3
)

const headingLabel = computed(() => {
  if (heading.value === null) return '--°'

  return `${heading.value.toFixed(0)}°`
})

const turnLabel = computed(() => {
  if (diff.value === null) return ''

  const degree = Math.abs(Math.round(diff.value))

  if (degree <= 3) {
    return 'Sudah menghadap kiblat'
  }

  return `Putar ${degree}° ke ${diff.value > 0 ? 'kanan' : 'kiri'}`
})
</script>

<template>
  <div class="qibla">

    <h1 class="title">Arah Kiblat</h1>

    <!-- LOKASI -->
    <section class="location-section">

      <button
        class="btn primary location-button"
        :disabled="loading"
        @click="useMyLocation"
      >
        <span>📍</span>

        {{
          loading
            ? 'Mencari lokasi…'
            : 'Gunakan lokasi saya'
        }}
      </button>

      <!-- INPUT MANUAL COLLAPSIBLE -->
      <button
        class="btn manual-toggle"
        @click="manual = !manual"
      >
        <span>⌖</span>

        {{
          manual
            ? 'Tutup koordinat manual'
            : 'Isi koordinat manual'
        }}

        <span class="arrow" :class="{ open: manual }">
          ▾
        </span>
      </button>

      <div
        v-if="manual"
        class="manual-panel"
      >
        <p class="manual-description">
          Masukkan koordinat lokasi yang ingin dihitung arah kiblatnya.
        </p>

        <form
          class="manual-form"
          @submit.prevent="submitManual"
        >
          <label>
            <span>Lintang (Latitude)</span>

            <input
              v-model="latInput"
              type="text"
              inputmode="decimal"
              placeholder="-6.2088"
            />
          </label>

          <label>
            <span>Bujur (Longitude)</span>

            <input
              v-model="lngInput"
              type="text"
              inputmode="decimal"
              placeholder="106.8456"
            />
          </label>

          <button
            type="submit"
            class="btn primary calculate-button"
            :disabled="loading"
          >
            {{ loading ? 'Menghitung…' : 'Hitung arah kiblat' }}
          </button>
        </form>

        <button
          class="example-button"
          @click="
            latInput = '-6.2088';
            lngInput = '106.8456'
          "
        >
          Isi contoh Jakarta
        </button>
      </div>

    </section>

    <!-- ERROR -->
    <p
      v-if="error"
      class="error"
    >
      {{ error }}
    </p>

    <!-- HASIL -->
    <template v-if="result">

      <section class="result">

        <span class="label">
          Arah kiblat dari utara
        </span>

        <strong class="deg">
          {{ result.bearing.toFixed(1) }}°
        </strong>

        <span class="dir">
          {{ result.compass }}
        </span>

        <small class="muted">
          Jarak ke Ka'bah ±
          {{ Math.round(result.distanceKm).toLocaleString('id-ID') }}
          km
        </small>

      </section>

      <!-- KOMPAS -->
      <section class="compass-container">

        <svg
          viewBox="0 0 220 220"
          class="compass"
          role="img"
          aria-label="Kompas arah kiblat"
        >

          <circle
            cx="110"
            cy="110"
            r="100"
            class="ring"
          />

          <!-- DIAL -->
          <g
            class="dial"
            :style="{
              transform: `rotate(${dial}deg)`
            }"
          >

            <text
              x="110"
              y="32"
              class="cardinal north"
            >
              U
            </text>

            <text
              x="190"
              y="115"
              class="cardinal"
            >
              T
            </text>

            <text
              x="110"
              y="199"
              class="cardinal"
            >
              S
            </text>

            <text
              x="30"
              y="115"
              class="cardinal"
            >
              B
            </text>

            <!-- ARAH KA'BAH -->
            <g
              class="qgroup"
              :style="{
                transform: `rotate(${result.bearing}deg)`
              }"
            >

              <line
                x1="110"
                y1="110"
                x2="110"
                y2="48"
                class="qline"
                :class="{ ok: aligned }"
              />

              <text
                x="110"
                y="44"
                class="kaaba"
              >
                🕋
              </text>

            </g>

          </g>

          <!-- PENANDA ARAH ATAS HP -->
          <polygon
            points="110,4 103,18 117,18"
            class="pointer"
            :class="{ ok: aligned }"
          />

          <circle
            cx="110"
            cy="110"
            r="5"
            class="hub"
          />

        </svg>

        <!-- HEADING HP -->
        <div
          v-if="compassOn"
          class="heading-display"
        >
          <span class="heading-label">
            Arah HP
          </span>

          <strong>
            {{ headingLabel }}
          </strong>
        </div>

      </section>

      <!-- STATUS ARAH -->
      <div
        v-if="compassOn && heading !== null"
        class="direction-status"
        :class="{ aligned }"
      >

        <span class="status-indicator"></span>

        <strong>
          {{ turnLabel }}
        </strong>

      </div>

      <p
        v-else-if="diff !== null"
        class="muted center"
      >
        {{ turnLabel }} untuk menghadap kiblat.
      </p>

      <!-- AKTIFKAN KOMPAS -->
      <div class="compass-controls">

        <button
          v-if="!compassOn"
          class="btn primary compass-button"
          @click="startCompass"
        >
          🧭 Aktifkan kompas HP
        </button>

        <button
          v-else
          class="btn compass-button"
          @click="stopCompass"
        >
          Matikan kompas
        </button>

      </div>

      <!-- PESAN SENSOR -->
      <div
        v-if="sensorMsg"
        class="sensor-message"
        :class="{
          warning: heading === null && compassOn
        }"
      >

        <span>
          {{ heading === null ? '⚠️' : '🧭' }}
        </span>

        {{ sensorMsg }}

      </div>

      <p
        v-if="sensorAccuracy"
        class="accuracy-warning"
      >
        {{ sensorAccuracy }}
      </p>

      <p
        v-if="compassOn && heading !== null"
        class="sensor-mode muted center small"
      >
        Sumber sensor: {{ sensorMode }}
      </p>

      <p
        v-if="!compassOn"
        class="muted center small"
      >
        Aktifkan sensor kompas agar kompas bergerak mengikuti rotasi HP.
        Letakkan HP secara mendatar.
      </p>

    </template>

    <!-- INFO -->
    <p class="muted note">
      Arah dihitung dari koordinat Anda menuju Ka'bah
      (21.4225°N, 39.8262°E) terhadap utara sejati.
      Sensor kompas HP dapat meleset beberapa derajat.
      Jauhkan perangkat dari benda logam atau magnet.
    </p>

  </div>
</template>

<style scoped>

.qibla {
  width: 100%;
}

/* JUDUL */

.title {
  margin: 8px 0 16px;
  font-size: 1.5rem;
}

/* LOKASI */

.location-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.btn {
  min-height: 46px;
  padding: 0 16px;
  border-radius: 12px;
  cursor: pointer;
  font: inherit;
  border: 1px solid var(--border, #e2e7e5);
  background: var(--surface, #f4f6f5);
  color: var(--text, #17201e);
  transition: .2s ease;
}

.btn:active {
  transform: scale(.98);
}

.btn:disabled {
  opacity: .6;
  cursor: not-allowed;
}

.btn.primary {
  background: var(--primary, #0f766e);
  border-color: var(--primary, #0f766e);
  color: var(--on-primary, #fff);
}

.location-button {
  width: 100%;
  font-weight: 600;
}

.manual-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
}

.arrow {
  transition: transform .2s ease;
}

.arrow.open {
  transform: rotate(180deg);
}

/* PANEL INPUT MANUAL */

.manual-panel {
  padding: 16px;
  border-radius: 16px;
  border: 1px solid var(--border, #e2e7e5);
  background: var(--surface, #f4f6f5);
  animation: slideDown .2s ease;
}

.manual-description {
  margin: 0 0 12px;
  font-size: .85rem;
  color: var(--muted, #62716c);
  line-height: 1.5;
}

.manual-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.manual-form label {
  display: grid;
  gap: 6px;
}

.manual-form label span {
  font-size: .8rem;
  color: var(--muted, #62716c);
}

.manual-form input {
  width: 100%;
  box-sizing: border-box;
  height: 46px;
  padding: 0 12px;
  font-size: 16px;
  border-radius: 10px;
  border: 1px solid var(--border, #e2e7e5);
  background: var(--background, #fff);
  color: var(--text, #17201e);
}

.calculate-button {
  grid-column: 1 / -1;
  width: 100%;
  font-weight: 600;
}

.example-button {
  margin-top: 10px;
  border: none;
  background: none;
  color: var(--primary, #0f766e);
  cursor: pointer;
  font-size: .85rem;
  padding: 4px 0;
}

/* ERROR */

.error {
  color: var(--error, #b42318);
  padding: 10px 12px;
  border-radius: 10px;
  background: #fee2e2;
  font-size: .9rem;
  margin: 12px 0;
}

/* HASIL ARAH */

.result {
  display: grid;
  justify-items: center;
  gap: 4px;
  margin: 22px 0 8px;
}

.result .label {
  font-size: .8rem;
  color: var(--muted, #62716c);
  text-transform: uppercase;
  letter-spacing: .04em;
}

.deg {
  font-size: 3rem;
  line-height: 1.1;
  color: var(--primary, #0f766e);
  font-variant-numeric: tabular-nums;
}

.dir {
  font-weight: 600;
}

.muted {
  color: var(--muted, #62716c);
}

.center {
  text-align: center;
}

.small {
  font-size: .82rem;
}

/* KOMPAS */

.compass-container {
  position: relative;
  width: min(86vw, 320px);
  margin: 12px auto;
}

.compass {
  display: block;
  width: 100%;
}

.ring {
  fill: var(--surface, #f4f6f5);
  stroke: var(--border, #cfd6d3);
  stroke-width: 2;
}

.dial,
.qgroup {
  transform-origin: 110px 110px;
  transition: transform .12s linear;
}

.cardinal {
  font-size: 14px;
  font-weight: 600;
  fill: var(--muted, #62716c);
  text-anchor: middle;
  dominant-baseline: middle;
}

.cardinal.north {
  fill: #dc2626;
}

.qline {
  stroke: var(--primary, #0f766e);
  stroke-width: 4;
  stroke-linecap: round;
}

.qline.ok {
  stroke: #16a34a;
}

.kaaba {
  font-size: 22px;
  text-anchor: middle;
}

.pointer {
  fill: var(--text, #17201e);
  transition: fill .2s ease;
}

.pointer.ok {
  fill: #16a34a;
}

.hub {
  fill: var(--text, #17201e);
}

/* ANGKA HEADING */

.heading-display {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: -6px;
}

.heading-label {
  font-size: .8rem;
  color: var(--muted, #62716c);
}

.heading-display strong {
  font-size: 1.1rem;
  color: var(--primary, #0f766e);
  font-variant-numeric: tabular-nums;
}

/* STATUS */

.direction-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 12px auto;
  padding: 12px;
  border-radius: 12px;
  background: var(--primary-soft, #e3f1ec);
  color: var(--primary, #0f766e);
  text-align: center;
}

.direction-status.aligned {
  background: #dcfce7;
  color: #166534;
}

.status-indicator {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: currentColor;
  flex-shrink: 0;
}

/* SENSOR */

.compass-controls {
  display: flex;
  justify-content: center;
  margin: 14px 0;
}

.compass-button {
  min-width: min(100%, 280px);
  font-weight: 600;
}

.sensor-message {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 8px;
  margin: 12px auto;
  padding: 12px;
  border-radius: 12px;
  background: var(--primary-soft, #e3f1ec);
  color: var(--primary, #0f766e);
  font-size: .85rem;
  line-height: 1.5;
  text-align: center;
}

.sensor-message.warning {
  background: #fff3cd;
  color: #856404;
}

.accuracy-warning {
  text-align: center;
  font-size: .82rem;
  color: #a16207;
  margin: 8px 0;
}

.sensor-mode {
  margin: 4px 0;
}

/* CATATAN */

.note {
  font-size: .8rem;
  margin-top: 18px;
  line-height: 1.6;
}

/* ANIMASI */

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* MOBILE */

@media (max-width: 480px) {

  .manual-form {
    grid-template-columns: 1fr;
  }

  .calculate-button {
    grid-column: auto;
  }

  .compass-container {
    width: min(82vw, 300px);
  }

}

</style>
