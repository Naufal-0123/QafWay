
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

/* ---------- Sensor kompas ---------- */

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

  // iPhone / Safari: heading dari kompas magnetik
  if (
    typeof e.webkitCompassHeading === 'number' &&
    Number.isFinite(e.webkitCompassHeading)
  ) {
    newHeading = normalizeAngle(e.webkitCompassHeading)
    sensorMode.value = 'Kompas magnetik'
  }

  // Android / browser yang mendukung absolute orientation
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

  // Fallback jika browser tidak memberikan absolute
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
  sensorAccuracy.value = ''

  if (sensorMode.value.includes('terbatas')) {
    sensorAccuracy.value =
      'Sensor tidak memberikan arah absolut. Arah mungkin kurang akurat.'
  }

  // Sensor berhasil mengirim data
  if (sensorTimeout) {
    clearTimeout(sensorTimeout)
    sensorTimeout = null
  }

  sensorMsg.value = 'Kompas aktif. Putar HP secara perlahan.'
}

function handleOrientationError() {
  heading.value = null
  sensorMsg.value =
    'Sensor tidak memberikan data arah. Pastikan perangkat memiliki sensor kompas dan izin sensor aktif.'
}

async function startCompass() {
  sensorMsg.value = ''
  sensorAccuracy.value = ''
  heading.value = null

  try {
    if (!window.isSecureContext) {
      throw new Error(
        'Kompas membutuhkan koneksi HTTPS atau localhost.'
      )
    }

    if (typeof DeviceOrientationEvent === 'undefined') {
      throw new Error(
        'Sensor orientasi tidak tersedia di browser ini.'
      )
    }

    // iOS 13+ memerlukan izin yang diminta lewat interaksi tombol
    if (
      typeof DeviceOrientationEvent.requestPermission === 'function'
    ) {
      const permission =
        await DeviceOrientationEvent.requestPermission()

      if (permission !== 'granted') {
        throw new Error(
          'Izin sensor ditolak. Izinkan akses Motion & Orientation.'
        )
      }
    }

    // Bersihkan listener lama agar tidak dobel
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

    // Jika 5 detik tidak ada data, tampilkan pesan
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

/* ---------- Lokasi dan perhitungan kiblat ---------- */

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
    error.value =
      'Browser ini tidak mendukung penentuan lokasi. Isi koordinat secara manual.'
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
          ? 'Izin lokasi ditolak. Izinkan lokasi di pengaturan situs, atau isi koordinat manual.'
          : 'Lokasi tidak dapat ditentukan. Coba lagi atau isi koordinat manual.'
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 60000,
    },
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
      'Koordinat tidak valid. Lintang -90 sampai 90, bujur -180 sampai 180.'
    return
  }

  lookup(lat, lng)
}

/* ---------- Arah kompas ---------- */

// Putar dial mengikuti arah hadap HP
const dial = computed(() =>
  heading.value === null ? 0 : -heading.value
)

// Selisih arah HP terhadap arah kiblat
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

  if (degree <= 3) return 'Sudah menghadap kiblat'

  return `Putar ${degree}° ke ${diff.value > 0 ? 'kanan' : 'kiri'}`
})
</script>

<template>
  <div class="qibla">
    <h1 class="title">Arah Kiblat</h1>

    <section class="actions">
      <button
        class="btn primary"
        :disabled="loading"
        @click="useMyLocation"
      >
        <span aria-hidden="true">📍</span>
        {{ loading ? 'Mencari lokasi…' : 'Gunakan lokasi saya' }}
      </button>

      <button
        class="btn"
        @click="manual = !manual"
      >
        {{ manual ? 'Tutup input manual' : 'Isi koordinat manual' }}
      </button>
    </section>

    <form
      v-if="manual"
      class="manual"
      @submit.prevent="submitManual"
    >
      <label>
        Lintang
        <input
          v-model="latInput"
          inputmode="decimal"
          placeholder="-6.2088"
        />
      </label>

      <label>
        Bujur
        <input
          v-model="lngInput"
          inputmode="decimal"
          placeholder="106.8456"
        />
      </label>

      <button
        class="btn primary"
        type="submit"
      >
        Hitung
      </button>
    </form>

    <p
      v-if="error"
      class="error"
    >
      {{ error }}
    </p>

    <template v-if="result">
      <!-- Informasi arah kiblat -->
      <section class="result">
        <span class="label">Arah kiblat dari utara</span>

        <strong class="deg">
          {{ result.bearing.toFixed(1) }}°
        </strong>

        <span class="dir">
          {{ result.compass }}
        </span>

        <small class="muted">
          Jarak ke Ka'bah ±
          {{ Math.round(result.distanceKm).toLocaleString('id-ID') }} km
        </small>
      </section>

      <!-- Kompas -->
      <section class="compass-container">
        <svg
          viewBox="0 0 220 220"
          class="compass"
          role="img"
          :aria-label="`Kompas kiblat ${result.bearing.toFixed(0)} derajat`"
        >
          <circle
            cx="110"
            cy="110"
            r="100"
            class="ring"
          />

          <!-- Dial berputar mengikuti heading perangkat -->
          <g
            class="dial"
            :style="{ transform: `rotate(${dial}deg)` }"
          >
            <text
              x="110"
              y="32"
              class="cardinal n"
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

            <!-- Arah kiblat relatif terhadap arah HP -->
            <g
              class="qgroup"
              :style="{ transform: `rotate(${result.bearing}deg)` }"
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

          <!-- Penanda bagian atas HP -->
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

        <!-- Heading digital -->
        <div
          v-if="compassOn"
          class="heading-display"
        >
          <span class="heading-label">Arah HP</span>
          <strong>{{ headingLabel }}</strong>
        </div>
      </section>

      <!-- Status arah -->
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

      <!-- Tombol sensor -->
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

      <!-- Pesan sensor -->
      <div
        v-if="sensorMsg"
        class="sensor-message"
        :class="{ warning: heading === null && compassOn }"
      >
        <span class="sensor-icon">
          {{ heading === null ? '⚠️' : '🧭' }}
        </span>

        <span>{{ sensorMsg }}</span>
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
        Sumber: {{ sensorMode }}
      </p>

      <p
        v-if="!compassOn"
        class="muted center small"
      >
        Aktifkan sensor kompas agar gambar bergerak mengikuti rotasi HP.
        Pastikan HP dalam posisi mendatar.
      </p>
    </template>

    <p class="muted note">
      Arah dihitung dari koordinat Anda ke Ka'bah
      (21.4225°N, 39.8262°E) terhadap utara sejati.
      Sensor kompas HP dapat meleset beberapa derajat.
      Jauhkan perangkat dari benda logam dan magnet,
      lalu cocokkan dengan petunjuk arah saf masjid jika memungkinkan.
    </p>
  </div>
</template>

<style scoped>
.title {
  margin: 8px 0 12px;
  font-size: 1.5rem;
}

.muted {
  color: var(--muted, #62716c);
}

.error {
  color: var(--error, #b42318);
}

.center {
  text-align: center;
}

.small {
  font-size: .82rem;
}

.note {
  font-size: .8rem;
  margin-top: 18px;
  line-height: 1.6;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
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
}

.btn.primary {
  background: var(--primary, #0f766e);
  border-color: var(--primary, #0f766e);
  color: var(--on-primary, #fff);
}

.btn:disabled {
  opacity: .6;
  cursor: default;
}

.manual {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 8px;
  align-items: end;
  margin: 12px 0;
}

.manual label {
  display: grid;
  gap: 4px;
  font-size: .85rem;
  color: var(--muted, #62716c);
}

.manual input {
  height: 46px;
  padding: 0 12px;
  font-size: 16px;
  border-radius: 10px;
  border: 1px solid var(--border, #e2e7e5);
  background: var(--surface, #f4f6f5);
  color: var(--text, #17201e);
  min-width: 0;
}

.result {
  display: grid;
  justify-items: center;
  gap: 3px;
  margin: 18px 0 4px;
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

/* Kompas */
.compass-container {
  position: relative;
  width: min(86vw, 320px);
  margin: 8px auto;
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

.cardinal.n {
  fill: var(--error, #b42318);
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

/* Angka heading */
.heading-display {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: -8px;
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

/* Status arah kiblat */
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

/* Kontrol sensor */
.compass-controls {
  display: flex;
  justify-content: center;
  margin: 12px 0;
}

.compass-button {
  min-width: min(100%, 280px);
  font-weight: 600;
}

/* Informasi sensor */
.sensor-message {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 8px;
  margin: 12px auto;
  padding: 10px 14px;
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

.sensor-icon {
  flex-shrink: 0;
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

/* Mobile */
@media (max-width: 480px) {
  .manual {
    grid-template-columns: 1fr 1fr;
  }

  .manual button {
    grid-column: 1 / -1;
  }

  .actions .btn {
    flex: 1;
  }

  .compass-container {
    width: min(82vw, 300px);
  }
}
</style>
