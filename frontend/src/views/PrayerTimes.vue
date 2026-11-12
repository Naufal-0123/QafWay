<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { getProvinces, getCities, getPrayerMonth } from '../api/prayer'
import { getPosition, reverseGeocode, findProvince, findCity } from '../api/geo'
import {
  reminder,
  permission,
  supported as notifSupported,
  setEnabled,
  testNotification,
  saveScheduleCache,
} from '../composables/usePrayerReminder'

const STORAGE_KEY = 'equran:prayer-location'

const TIMES = [
  { key: 'imsak', label: 'Imsak', minor: true },
  { key: 'subuh', label: 'Subuh' },
  { key: 'terbit', label: 'Terbit', minor: true },
  { key: 'dhuha', label: 'Dhuha', minor: true },
  { key: 'dzuhur', label: 'Dzuhur' },
  { key: 'ashar', label: 'Ashar' },
  { key: 'maghrib', label: 'Maghrib' },
  { key: 'isya', label: 'Isya' },
]
const FARDU = TIMES.filter((t) => !t.minor)
const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

const loc = reactive({ provinsi: '', kabkota: '' })
const provinces = ref([])
const cities = ref([])
const loading = ref(false)
const error = ref('')

const now = ref(new Date())
let timer = null

// State untuk Popup Realtime Sholat
const activePopup = ref(null) // Menyimpan data sholat yang sedang masuk waktunya
let lastTriggeredMinute = '' // Mencegah popup muncul berulang kali di menit yang sama

// Jadwal yang sudah dimuat, kunci "tahun-bulan"
const months = reactive({})
const inflight = new Map()
const monthKey = (y, m) => `${y}-${m}`

const viewYear = ref(now.value.getFullYear())
const viewMonth = ref(now.value.getMonth() + 1)

function readSaved() {
  try {
    const v = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    if (v?.provinsi && v?.kabkota) return v
  } catch {
    /* abaikan */
  }
  return null
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ provinsi: loc.provinsi, kabkota: loc.kabkota }))
  } catch {
    /* penyimpanan tidak tersedia */
  }
}

function resetMonths() {
  for (const k of Object.keys(months)) delete months[k]
}

function ensureMonth(y, m) {
  if (months[monthKey(y, m)]) return Promise.resolve()
  const id = `${loc.provinsi}|${loc.kabkota}|${y}-${m}`
  if (inflight.has(id)) return inflight.get(id)
  const { provinsi, kabkota } = loc
  const p = getPrayerMonth(provinsi, kabkota, y, m)
    .then((data) => {
      if (provinsi === loc.provinsi && kabkota === loc.kabkota) {
        months[monthKey(y, m)] = data
        saveScheduleCache(provinsi, kabkota, y, m, data.jadwal)
      }
    })
    .finally(() => inflight.delete(id))
  inflight.set(id, p)
  return p
}

async function loadSchedule() {
  if (!loc.provinsi || !loc.kabkota) return
  loading.value = true
  error.value = ''
  try {
    const d = new Date()
    await ensureMonth(d.getFullYear(), d.getMonth() + 1)
    const tomorrow = addDays(d, 1)
    if (tomorrow.getMonth() !== d.getMonth()) {
      await ensureMonth(tomorrow.getFullYear(), tomorrow.getMonth() + 1)
    }
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function loadCities() {
  try {
    cities.value = await getCities(loc.provinsi)
  } catch (e) {
    error.value = e.message
  }
}

async function onProvince() {
  loc.kabkota = ''
  cities.value = []
  resetMonths()
  error.value = ''
  await loadCities()
}

async function onCity() {
  save()
  resetMonths()
  viewYear.value = new Date().getFullYear()
  viewMonth.value = new Date().getMonth() + 1
  await loadSchedule()
}

// Pengecekan Realtime untuk memunculkan Popup Sholat
function checkRealtimePrayerTrigger() {
  const t = today.value
  if (!t) return

  const currentHour = String(now.value.getHours()).padStart(2, '0')
  const currentMinute = String(now.value.getMinutes()).padStart(2, '0')
  const currentTimeStr = `${currentHour}:${currentMinute}`
  const dateKeyStr = `${now.value.toDateString()}-${currentTimeStr}`

  // Cek apakah waktu saat ini sama dengan salah satu jadwal sholat fardhu
  for (const f of FARDU) {
    const prayerTime = t[f.key] // format "HH:mm"
    
    // Hitung waktu dengan lead time (jika pengingat aktif)
    if (prayerTime === currentTimeStr && lastTriggeredMinute !== dateKeyStr) {
      lastTriggeredMinute = dateKeyStr
      activePopup.value = {
        label: f.label,
        time: prayerTime,
        message: `Telah masuk waktu sholat ${f.label} untuk wilayah ${loc.kabkota} dan sekitarnya. Mari segera menunaikan ibadah.`
      }
      break
    }
  }
}

onMounted(async () => {
  timer = setInterval(() => {
    now.value = new Date()
    checkRealtimePrayerTrigger() // Jalankan pengecekan setiap detik
  }, 1000)

  try {
    provinces.value = await getProvinces()
  } catch (e) {
    error.value = e.message
    return
  }
  const saved = readSaved()
  if (saved && provinces.value.includes(saved.provinsi)) {
    loc.provinsi = saved.provinsi
    await loadCities()
    if (cities.value.includes(saved.kabkota)) {
      loc.kabkota = saved.kabkota
      await loadSchedule()
    }
  }
})
onBeforeUnmount(() => clearInterval(timer))

/* ---------- Lokasi otomatis ---------- */
const locating = ref(false)
const geoMsg = ref('')

async function useMyLocation() {
  locating.value = true
  geoMsg.value = ''
  error.value = ''
  try {
    const { latitude, longitude } = await getPosition()
    const addr = await reverseGeocode(latitude, longitude)
    const prov = findProvince(addr, provinces.value)
    if (!prov) throw new Error('Wilayah Anda belum dikenali. Pilih provinsi dan kota secara manual.')
    loc.provinsi = prov
    loc.kabkota = ''
    cities.value = []
    resetMonths()
    await loadCities()
    const city = findCity(addr, cities.value)
    if (!city) {
      geoMsg.value = `Provinsi ${prov} terdeteksi, tetapi kotanya belum cocok. Pilih kabupaten/kota secara manual.`
      return
    }
    loc.kabkota = city
    await onCity()
    geoMsg.value = `Lokasi terdeteksi: ${city}, ${prov}.`
  } catch (e) {
    geoMsg.value = e.message
  } finally {
    locating.value = false
  }
}

/* ---------- Pengingat ---------- */
const toggleReminder = () => setEnabled(!reminder.enabled)
const reminderHint = computed(() => {
  if (!notifSupported) return 'Browser ini belum mendukung notifikasi.'
  if (permission.value === 'denied') return 'Notifikasi diblokir. Izinkan lewat pengaturan situs di browser.'
  if (reminder.enabled) return 'Aktif untuk Subuh, Dzuhur, Ashar, Maghrib, dan Isya.'
  return 'Dapatkan notifikasi saat waktu sholat tiba.'
})

/* ---------- Perhitungan waktu ---------- */
function addDays(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

function at(base, hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  const d = new Date(base)
  d.setHours(h, m, 0, 0)
  return d
}

function dayOf(date) {
  const m = months[monthKey(date.getFullYear(), date.getMonth() + 1)]
  return m?.jadwal.find((d) => d.tanggal === date.getDate()) ?? null
}

const today = computed(() => dayOf(now.value))
const tomorrowDay = computed(() => dayOf(addDays(now.value, 1)))

const todayKey = computed(() => `${now.value.getFullYear()}-${now.value.getMonth()}-${now.value.getDate()}`)
watch(todayKey, () => {
  if (loc.kabkota) loadSchedule()
})

const next = computed(() => {
  const t = today.value
  if (!t) return null
  const n = now.value
  for (const f of FARDU) {
    const when = at(n, t[f.key])
    if (when > n) return { key: f.key, label: f.label, time: t[f.key], when, tomorrow: false }
  }
  const tm = tomorrowDay.value
  if (!tm) return null
  return { key: 'subuh', label: 'Subuh', time: tm.subuh, when: at(addDays(n, 1), tm.subuh), tomorrow: true }
})

const countdown = computed(() => {
  if (!next.value) return ''
  let s = Math.max(0, Math.floor((next.value.when - now.value) / 1000))
  const h = Math.floor(s / 3600)
  s %= 3600
  const m = Math.floor(s / 60)
  s %= 60
  return [h, m, s].map((x) => String(x).padStart(2, '0')).join(':')
})

function isPassed(key) {
  const t = today.value
  return !!t && at(now.value, t[key]) <= now.value
}

const todayLabel = computed(() =>
  now.value.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
)

/* ---------- Jadwal sebulan ---------- */
const viewData = computed(() => months[monthKey(viewYear.value, viewMonth.value)] ?? null)

function shiftMonth(delta) {
  let m = viewMonth.value + delta
  let y = viewYear.value
  if (m < 1) { m = 12; y-- }
  if (m > 12) { m = 1; y++ }
  viewMonth.value = m
  viewYear.value = y
}

watch([viewYear, viewMonth], () => {
  if (!loc.kabkota) return
  ensureMonth(viewYear.value, viewMonth.value).catch((e) => (error.value = e.message))
})

function isTodayRow(d) {
  return (
    viewYear.value === now.value.getFullYear() &&
    viewMonth.value === now.value.getMonth() + 1 &&
    d.tanggal === now.value.getDate()
  )
}
</script>

<template>
  <div class="prayer">
    <h1>Jadwal Sholat</h1>

    <!-- Modal Popup Realtime Waktu Sholat -->
    <div v-if="activePopup" class="prayer-modal-overlay" role="dialog" aria-modal="true">
      <div class="prayer-modal-card">
        <div class="modal-icon">🕌</div>
        <span class="modal-badge">Waktu Sholat Tiba</span>
        <h2>{{ activePopup.label }}</h2>
        <p class="modal-time">Pukul {{ activePopup.time }} WIB</p>
        <p class="modal-desc">{{ activePopup.message }}</p>
        <button class="btn primary modal-close-btn" @click="activePopup = null">
          Tutup &amp; Lanjutkan
        </button>
      </div>
    </div>

    <div class="geo">
      <button class="btn" :disabled="locating" @click="useMyLocation">
        <span aria-hidden="true">📍</span> {{ locating ? 'Mencari lokasi…' : 'Gunakan lokasi saya' }}
      </button>
      <p v-if="geoMsg" class="geo-msg muted" aria-live="polite">{{ geoMsg }}</p>
    </div>

    <section class="picker">
      <label>
        <span>Provinsi</span>
        <select v-model="loc.provinsi" @change="onProvince">
          <option value="" disabled>Pilih provinsi</option>
          <option v-for="p in provinces" :key="p" :value="p">{{ p }}</option>
        </select>
      </label>
      <label>
        <span>Kabupaten / Kota</span>
        <select v-model="loc.kabkota" :disabled="!cities.length" @change="onCity">
          <option value="" disabled>Pilih kabupaten/kota</option>
          <option v-for="c in cities" :key="c" :value="c">{{ c }}</option>
        </select>
      </label>
    </section>

    <p v-if="error" class="error">{{ error }}</p>
    <p v-else-if="!loc.kabkota" class="muted center">Pilih wilayah untuk melihat jadwal sholat.</p>
    <p v-else-if="loading && !today" class="muted center">Memuat…</p>

    <template v-if="loc.kabkota && today">
      <section v-if="next" class="next-card">
        <span class="label">Sholat berikutnya</span>
        <strong class="next-name">
          {{ next.label }}<template v-if="next.tomorrow"> (besok)</template>
          <span class="next-time">{{ next.time }}</span>
        </strong>
        <span class="countdown">− {{ countdown }}</span>
      </section>

      <p class="date-label muted">{{ todayLabel }} · {{ loc.kabkota }}</p>

      <ul class="times">
        <li
          v-for="t in TIMES"
          :key="t.key"
          :class="{
            minor: t.minor,
            passed: isPassed(t.key),
            current: next && !next.tomorrow && next.key === t.key,
          }"
        >
          <span>{{ t.label }}</span>
          <strong>{{ today[t.key] }}</strong>
        </li>
      </ul>

      <section class="card reminder">
        <div class="reminder-row">
          <div>
            <strong>Pengingat sholat</strong><br />
            <small class="muted">{{ reminderHint }}</small>
          </div>
          <button
            class="switch"
            role="switch"
            :aria-checked="reminder.enabled"
            aria-label="Pengingat sholat"
            :disabled="!notifSupported || permission === 'denied'"
            @click="toggleReminder"
          ><span></span></button>
        </div>
        <div v-if="reminder.enabled" class="reminder-opts">
          <label>
            Ingatkan
            <select v-model.number="reminder.lead">
              <option :value="0">Tepat waktu</option>
              <option :value="5">5 menit sebelum</option>
              <option :value="10">10 menit sebelum</option>
              <option :value="15">15 menit sebelum</option>
            </select>
          </label>
          <!-- <button class="btn" @click="testNotification">Coba notifikasi</button> -->
        </div>
        <p v-if="reminder.enabled" class="muted reminder-note">
          Pengingat berjalan selama e-Quran terbuka (tab atau aplikasi terpasang). Jika aplikasi ditutup
          sepenuhnya oleh perangkat, notifikasi bisa tidak muncul.
        </p>
      </section>

      <details class="month">
        <summary>Jadwal sebulan</summary>
        <div class="month-nav">
          <button class="btn" aria-label="Bulan sebelumnya" @click="shiftMonth(-1)">‹</button>
          <strong>{{ MONTH_NAMES[viewMonth - 1] }} {{ viewYear }}</strong>
          <button class="btn" aria-label="Bulan berikutnya" @click="shiftMonth(1)">›</button>
        </div>
        <div v-if="viewData" class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Tgl</th>
                <th v-for="t in TIMES" :key="t.key">{{ t.label }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="d in viewData.jadwal" :key="d.tanggal" :class="{ row_today: isTodayRow(d) }">
                <td class="tgl">{{ d.tanggal }} <small>{{ d.hari.slice(0, 3) }}</small></td>
                <td v-for="t in TIMES" :key="t.key">{{ d[t.key] }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="muted center">Memuat…</p>
      </details>

      <p class="muted note">
        Waktu mengikuti zona waktu wilayah yang dipilih (data Bimas Islam Kemenag RI melalui equran.id).
        Hitung mundur memakai jam perangkat Anda.
      </p>
    </template>
  </div>
</template>

<style scoped>
.center { text-align: center; }
.picker { display: grid; gap: .7rem; }
.picker label { display: grid; gap: .3rem; font-size: .85rem; color: var(--muted); }
.picker select { width: 100%; margin: 0; }
.picker select:disabled { opacity: .5; }
@media (min-width: 640px) { .picker { grid-template-columns: 1fr 1fr; } }

.next-card { display: grid; gap: .15rem; margin-top: 1rem; padding: 1.2rem 1.3rem; border-radius: var(--radius); background: var(--hero); color: var(--on-hero); }
.next-card .label { font-size: .85rem; opacity: .8; }
.next-name { font-size: clamp(1.5rem, 7vw, 2rem); display: flex; align-items: baseline; gap: .6rem; flex-wrap: wrap; }
.next-time { font-weight: 500; opacity: .95; }
.countdown { font-size: 1.35rem; font-weight: 600; font-variant-numeric: tabular-nums; }
.date-label { margin: 1rem 0 .4rem; font-size: .9rem; }

.times { list-style: none; margin: 0; padding: 0; display: grid; gap: .4rem; }
.times li { display: flex; justify-content: space-between; align-items: center; min-height: 54px; padding: 0 1rem; border-radius: 14px; background: var(--surface); border: 1px solid var(--border); }
.times li strong { font-size: 1.15rem; font-variant-numeric: tabular-nums; }
.times li.minor { min-height: 44px; }
.times li.minor span, .times li.minor strong { font-size: .95rem; color: var(--muted); font-weight: 500; }
.times li.passed { opacity: .5; }
.times li.current { border-color: var(--primary); background: var(--primary-soft); opacity: 1; box-shadow: 0 0 0 1px var(--primary); }

.month { margin-top: 1.2rem; }
.month summary { cursor: pointer; min-height: 44px; display: flex; align-items: center; color: var(--primary); font-weight: 600; }
.month-nav { display: flex; align-items: center; justify-content: space-between; margin: .3rem 0 .6rem; }
.table-wrap { overflow-x: auto; border: 1px solid var(--border); border-radius: 14px; background: var(--surface); }
table { width: 100%; border-collapse: collapse; font-variant-numeric: tabular-nums; font-size: .85rem; }
th, td { padding: .5rem .65rem; text-align: center; white-space: nowrap; }
thead th { background: var(--surface); color: var(--muted); font-weight: 600; }
tbody tr + tr td { border-top: 1px solid var(--border); }
td.tgl, th:first-child { position: sticky; left: 0; background: var(--surface); }
td.tgl { text-align: left; font-weight: 600; }
td.tgl small { color: var(--muted); font-weight: 400; margin-left: .3rem; }
tr.row_today td { background: var(--primary-soft); }
.geo { margin: 0 0 .8rem; }
.geo-msg { margin: .5rem 0 0; font-size: .85rem; }
.reminder { margin: 1rem 0; }
.reminder-row { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.reminder-opts { display: flex; flex-wrap: wrap; align-items: center; gap: .6rem; margin-top: .8rem; }
.reminder-opts label { display: flex; align-items: center; font-size: .9rem; color: var(--muted); }
.reminder-note { font-size: .8rem; margin: .8rem 0 0; }

/* Styling untuk Modal Popup Realtime Sholat */
.prayer-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: grid;
  place-items: center;
  padding: 1rem;
  animation: fadeInModal 0.25s ease-out;
}
.prayer-modal-card {
  background: var(--surface, #ffffff);
  border: 1px solid var(--border, #e2e7e5);
  border-radius: 20px;
  padding: 2rem 1.5rem;
  width: 100%;
  max-width: 380px;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  display: grid;
  gap: 0.5rem;
  animation: scaleUpModal 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.modal-icon {
  font-size: 3rem;
  margin-bottom: -0.2rem;
}
.modal-badge {
  display: inline-block;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 700;
  color: var(--primary, #0f766e);
  background: var(--primary-soft, #dcf1ed);
  padding: 4px 12px;
  border-radius: 999px;
  justify-self: center;
}
.prayer-modal-card h2 {
  font-size: 1.8rem;
  margin: 0.2rem 0 0;
  color: var(--text, #17201e);
}
.modal-time {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--primary, #0f766e);
  margin: 0;
}
.modal-desc {
  font-size: 0.9rem;
  color: var(--muted, #62716c);
  line-height: 1.5;
  margin: 0.4rem 0 1rem;
}
.modal-close-btn {
  width: 100%;
  min-height: 44px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
}

@keyframes fadeInModal {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes scaleUpModal {
  from { opacity: 0; transform: scale(0.92); }
  to { opacity: 1; transform: scale(1); }
}
</style>