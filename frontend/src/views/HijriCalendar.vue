<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { getCalendar, getToday } from '../api/hijri'

const monthNames = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]
const weekdays = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

const now = new Date()
const year = ref(now.getFullYear())
const month = ref(now.getMonth() + 1)
const days = ref([])
const today = ref(null)
const selected = ref(null)
const loading = ref(true)
const error = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try {
    const data = await getCalendar(year.value, month.value)
    days.value = data.days
  } catch (e) {
    error.value = e.message
    days.value = []
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    today.value = await getToday()
  } catch {
    /* kartu hari ini bersifat tambahan */
  }
})
watch([year, month], load, { immediate: true })

function shift(delta) {
  let m = month.value + delta
  let y = year.value
  if (m < 1) { m = 12; y-- }
  if (m > 12) { m = 1; y++ }
  month.value = m
  year.value = y
  selected.value = null
}

function goToday() {
  const t = new Date()
  year.value = t.getFullYear()
  month.value = t.getMonth() + 1
  selected.value = today.value?.gregorian ?? null
}

// Kolom kosong sebelum tanggal 1 (minggu dimulai hari Minggu)
const blanks = computed(() => (days.value.length ? weekdays.indexOf(days.value[0].weekday) : 0))

const hijriRange = computed(() => {
  if (!days.value.length) return ''
  const a = days.value[0].hijri
  const b = days.value[days.value.length - 1].hijri
  const first = `${a.monthName} ${a.year} H`
  const last = `${b.monthName} ${b.year} H`
  return first === last ? first : `${first} – ${last}`
})

const events = computed(() => days.value.filter((d) => d.events.length))

// Hari yang dipilih; bila belum ada, pakai hari ini (jika ada di bulan tampil)
const active = computed(
  () =>
    days.value.find((d) => d.gregorian === selected.value) ??
    days.value.find((d) => today.value && d.gregorian === today.value.gregorian) ??
    null,
)
</script>

<template>
  <h1>Kalender Hijriyah</h1>

  <section v-if="today" class="card today">
    <div>
      <strong>Hari ini</strong><br />
      <span>
        {{ today.hijri.day }} {{ today.hijri.monthName }} {{ today.hijri.year }} H
        <small class="muted">({{ today.gregorian }})</small>
      </span>
    </div>
    <button class="btn primary" @click="goToday">Ke hari ini</button>
  </section>

  <div class="cal-head">
    <button class="btn" aria-label="Bulan sebelumnya" @click="shift(-1)">←</button>
    <div class="cal-title">
      <strong>{{ monthNames[month - 1] }} {{ year }}</strong>
      <small class="muted">{{ hijriRange }}</small>
    </div>
    <button class="btn" aria-label="Bulan berikutnya" @click="shift(1)">→</button>
  </div>

  <p v-if="error" class="error">{{ error }}</p>
  <p v-else-if="loading" class="muted" aria-busy="true">Memuat…</p>

  <div v-else class="cal-grid">
    <div v-for="w in weekdays" :key="w" class="cal-weekday">{{ w.slice(0, 3) }}</div>
    <div v-for="n in blanks" :key="'b' + n"></div>
    <button
      v-for="d in days"
      :key="d.gregorian"
      class="cal-day"
      :class="{
        event: d.events.length,
        today: today && d.gregorian === today.gregorian,
        selected: active && d.gregorian === active.gregorian,
      }"
      :aria-pressed="!!active && d.gregorian === active.gregorian"
      @click="selected = d.gregorian"
    >
      <span class="greg">{{ Number(d.gregorian.slice(8)) }}</span>
      <span class="hij">{{ d.hijri.day === 1 ? `1 ${d.hijri.monthName}` : d.hijri.day }}</span>
    </button>
  </div>

  <section v-if="active" class="card detail" aria-live="polite">
    <h3>{{ active.weekday }}, {{ Number(active.gregorian.slice(8)) }} {{ monthNames[month - 1] }} {{ year }}</h3>
    <p style="margin: 0">
      {{ active.hijri.day }} {{ active.hijri.monthName }} {{ active.hijri.year }} H
    </p>
    <p v-if="active.events.length" style="margin: .4rem 0 0"><strong>{{ active.events.join(', ') }}</strong></p>
    <p v-else class="muted" style="margin: .4rem 0 0">Tidak ada hari besar.</p>
  </section>

  <section v-if="events.length" class="card">
    <h3>Hari besar bulan ini</h3>
    <ul class="events">
      <li v-for="d in events" :key="d.gregorian">
        <button @click="selected = d.gregorian">
          <strong>{{ Number(d.gregorian.slice(8)) }} {{ monthNames[month - 1] }}</strong>
          — {{ d.events.join(', ') }}
          <small class="muted">({{ d.hijri.day }} {{ d.hijri.monthName }})</small>
        </button>
      </li>
    </ul>
  </section>

  <p class="muted note">
    Tanggal dihitung dengan metode tabular dan bisa berbeda satu hari dari penetapan Kemenag.
  </p>
</template>