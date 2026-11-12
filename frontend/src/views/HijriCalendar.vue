<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { getCalendar, getToday } from "../api/hijri";
import { getFastingMonth } from "../api/fasting";
import ReminderToggle from "../components/ReminderToggle.vue";

const monthNames = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];
const weekdays = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

const now = new Date();
const year = ref(now.getFullYear());
const month = ref(now.getMonth() + 1);
const days = ref([]);
const fastingDays = ref([]);
const today = ref(null);
const selected = ref(null);
const loading = ref(true);
const error = ref("");

// State penampung bulan tambahan untuk kalkulasi "puasa sunnah berikutnya"
const allFastingMonths = ref({});

const pad = (n) => String(n).padStart(2, '0')
const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const todayStr = fmt(now)

async function load() {
  loading.value = true;
  error.value = "";
  try {
    const [calData, fastingData] = await Promise.all([
      getCalendar(year.value, month.value),
      getFastingMonth(year.value, month.value).catch(() => ({ days: [] }))
    ]);
    
    days.value = calData.days;
    fastingDays.value = fastingData.days || [];
    allFastingMonths.value[`${year.value}-${month.value}`] = fastingData.days || [];

    // Muat juga bulan depan secara senyap (silent) untuk akurasi info puasa terdekat
    const nextM = month.value === 12 ? 1 : month.value + 1;
    const nextY = month.value === 12 ? year.value + 1 : year.value;
    if (!allFastingMonths.value[`${nextY}-${nextM}`]) {
      getFastingMonth(nextY, nextM).then(res => {
        allFastingMonths.value[`${nextY}-${nextM}`] = res.days || [];
      }).catch(() => {});
    }
  } catch (e) {
    error.value = e.message;
    days.value = [];
    fastingDays.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  try {
    today.value = await getToday();
  } catch {
    /* kartu hari ini bersifat tambahan */
  }
});
watch([year, month], load, { immediate: true });

function shift(delta) {
  let m = month.value + delta;
  let y = year.value;
  if (m < 1) {
    m = 12;
    y--;
  }
  if (m > 12) {
    m = 1;
    y++;
  }
  month.value = m;
  year.value = y;
  selected.value = null;
}

function goToday() {
  const t = new Date();
  year.value = t.getFullYear();
  month.value = t.getMonth() + 1;
  selected.value = today.value?.gregorian ?? null;
}

const blanks = computed(() =>
  days.value.length ? weekdays.indexOf(days.value[0].weekday) : 0,
);

const hijriRange = computed(() => {
  if (!days.value.length) return "";
  const a = days.value[0].hijri;
  const b = days.value[days.value.length - 1].hijri;
  const first = `${a.monthName} ${a.year} H`;
  const last = `${b.monthName} ${b.year} H`;
  return first === last ? first : `${first} – ${last}`;
});

const events = computed(() => days.value.filter((d) => d.events.length));

function getFastingInfo(gregorianDateStr) {
  const found = fastingDays.value.find((f) => f.gregorian === gregorianDateStr);
  if (!found || !found.kinds || !found.kinds.length) return null;
  return found;
}

const active = computed(
  () =>
    days.value.find((d) => d.gregorian === selected.value) ??
    days.value.find(
      (d) => today.value && d.gregorian === today.value.gregorian,
    ) ??
    null,
);

const activeFasting = computed(() => {
  if (!active.value) return null;
  return getFastingInfo(active.value.gregorian);
});

// Logika Puasa Sunnah Terdekat
const nextFasting = computed(() => {
  const all = Object.values(allFastingMonths.value).flat().sort((a, b) => a.gregorian.localeCompare(b.gregorian))
  return (
    all.find(
      (d) =>
        d.gregorian >= todayStr &&
        !d.forbidden &&
        d.kinds.some((k) => k.key !== 'ramadhan'),
    ) ?? null
  )
})

function daysUntil(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const target = new Date(y, m - 1, d)
  const base = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.round((target - base) / 86400000)
}

const nextLabel = computed(() => {
  if (!nextFasting.value) return ''
  const n = daysUntil(nextFasting.value.gregorian)
  if (n === 0) return 'Hari ini'
  if (n === 1) return 'Besok'
  return `${n} hari lagi`
})

const dayNum = (d) => Number(d.gregorian.slice(8))
</script>

<template>
  <h1>Kalender Hijriyah &amp; Puasa Sunnah</h1>

  <!-- Kartu Puasa Sunnah Berikutnya (Dipindah dari FastingView) -->
  <section v-if="nextFasting" class="next-card">
    <span class="label">Puasa sunnah berikutnya · {{ nextLabel }}</span>
    <strong class="next-name">{{ nextFasting.kinds.filter((k) => k.key !== 'ramadhan').map((k) => k.label).join(' + ') }}</strong>
    <span class="next-date">{{ nextFasting.weekday }}, {{ dayNum(nextFasting) }} {{ monthNames[Number(nextFasting.gregorian.slice(5, 7)) - 1] }} · {{ nextFasting.hijri.day }} {{ nextFasting.hijri.monthName }} {{ nextFasting.hijri.year }} H</span>
  </section>

  <!-- Tombol Pengingat Puasa Sunnah -->
  <ReminderToggle
    kind="fasting"
    title="Pengingat puasa sunnah"
    description="Notifikasi malam sebelum hari puasa sunnah."
  />

  <section v-if="today" class="card today">
    <div>
      <strong>Hari ini</strong><br />
      <span>
        {{ today.hijri.day }} {{ today.hijri.monthName }}
        {{ today.hijri.year }} H
        <small class="muted">({{ today.gregorian }})</small>
      </span>
    </div>
    <button class="btn primary" @click="goToday">Ke hari ini</button>
  </section>

  <div class="cal-head">
    <button class="btn" aria-label="Bulan sebelumnya" @click="shift(-1)">
      ←
    </button>
    <div class="cal-title">
      <strong>{{ monthNames[month - 1] }} {{ year }}</strong>
      <small class="muted">{{ hijriRange }}</small>
    </div>
    <button class="btn" aria-label="Bulan berikutnya" @click="shift(1)">
      →
    </button>
  </div>

  <p v-if="error" class="error">{{ error }}</p>
  <p v-else-if="loading" class="muted" aria-busy="true">Memuat…</p>

  <div v-else class="cal-grid">
    <div v-for="w in weekdays" :key="w" class="cal-weekday">
      {{ w.slice(0, 3) }}
    </div>
    <div v-for="n in blanks" :key="'b' + n"></div>
    <button
      v-for="d in days"
      :key="d.gregorian"
      class="cal-day"
      :class="{
        event: d.events.length,
        'has-fasting': getFastingInfo(d.gregorian),
        today: today && d.gregorian === today.gregorian,
        selected: active && d.gregorian === active.gregorian,
      }"
      :aria-pressed="!!active && d.gregorian === active.gregorian"
      @click="selected = d.gregorian"
    >
      <span class="greg">{{ Number(d.gregorian.slice(8)) }}</span>
      <span class="hij">
        {{ d.hijri.day === 1 ? `1 ${d.hijri.monthName}` : d.hijri.day }}
      </span>
      <span v-if="getFastingInfo(d.gregorian)" class="fasting-dash" title="Jadwal puasa sunnah"></span>
    </button>
  </div>

  <!-- Detail Tanggal Terpilih -->
  <section v-if="active" class="card detail" aria-live="polite">
    <h3>
      {{ active.weekday }}, {{ Number(active.gregorian.slice(8)) }}
      {{ monthNames[month - 1] }} {{ year }}
    </h3>
    <p style="margin: 0">
      {{ active.hijri.day }} {{ active.hijri.monthName }}
      {{ active.hijri.year }} H
    </p>

    <!-- Informasi Puasa di Tanggal Ini -->
    <div v-if="activeFasting" class="active-fasting-info">
      <div class="fasting-chips">
        <span 
          v-for="k in activeFasting.kinds" 
          :key="k.key" 
          class="f-chip"
          :class="{ bad: k.key.startsWith('dilarang'), wajib: k.key === 'ramadhan' }"
        >
          {{ k.label }}
        </span>
      </div>
    </div>

    <p v-if="active.events.length" style="margin: 0.4rem 0 0">
      <strong>{{ active.events.join(", ") }}</strong>
    </p>
    <p v-else-if="!activeFasting" class="muted" style="margin: 0.4rem 0 0">Tidak ada hari besar atau puasa khusus.</p>
  </section>

  <section v-if="events.length" class="card">
    <h3>Hari besar bulan ini</h3>
    <ul class="events">
      <li v-for="d in events" :key="d.gregorian">
        <button @click="selected = d.gregorian">
          <strong
            >{{ Number(d.gregorian.slice(8)) }}
            {{ monthNames[month - 1] }}</strong
          >
          — {{ d.events.join(", ") }}
          <small class="muted"
            >({{ d.hijri.day }} {{ d.hijri.monthName }})</small
          >
        </button>
      </li>
    </ul>
  </section>

  <!-- Panduan Keterangan Jenis Puasa (Dipindah dari FastingView) -->
  <details class="guide">
    <summary>Keterangan jenis puasa</summary>
    <ul>
      <li><strong>Senin dan Kamis</strong>: setiap pekan.</li>
      <li><strong>Ayyamul Bidh</strong>: tanggal 13, 14, 15 setiap bulan Hijriyah.</li>
      <li><strong>Tasu'a dan Asyura</strong>: 9 dan 10 Muharram.</li>
      <li><strong>Arafah</strong>: 9 Dzulhijjah (bagi yang tidak berhaji).</li>
      <li><strong>Syawal</strong>: enam hari di bulan Syawal; di sini ditandai tanggal 2-7 Syawal, tetapi boleh hari lain dalam Syawal.</li>
      <li><strong>Dilarang</strong>: 1 Syawal, 10 Dzulhijjah, dan Hari Tasyriq (11-13 Dzulhijjah).</li>
    </ul>
  </details>

  <p class="muted note">
    Tanggal dihitung dengan metode tabular dan bisa berbeda satu hari dari
    penetapan Kemenag.
  </p>
</template>

<style scoped>
.cal-day {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  min-height: 56px;
  padding: 6px 2px;
  background: var(--surface, #f4f6f5);
  border: 1px solid var(--border, #e2e7e5);
  border-radius: 12px;
  cursor: pointer;
  font: inherit;
  color: inherit;
  transition: all 0.2s;
}
.cal-day:hover {
  border-color: var(--primary, #0f766e);
}
.cal-day.today {
  border-color: var(--primary, #0f766e);
  font-weight: bold;
}
.cal-day.selected {
  background: var(--primary, #0f766e) !important;
  color: var(--on-primary, #fff) !important;
}
.cal-day.selected .muted,
.cal-day.selected .hij {
  color: rgba(255, 255, 255, 0.9);
}

/* Styling Kartu Puasa Sunnah Berikutnya */
.next-card {
  display: grid; gap: 2px; padding: 18px; border-radius: 16px;
  background: var(--primary, #0f766e); color: var(--on-primary, #fff);
  margin-bottom: 1rem;
}
.next-card .label { font-size: .8rem; opacity: .85; text-transform: uppercase; letter-spacing: .04em; }
.next-name { font-size: 1.35rem; line-height: 1.3; }
.next-date { opacity: .92; font-size: .95rem; }

/* Garis penanda puasa berbentuk pill rapi di bawah teks */
.fasting-dash {
  width: 12px;
  height: 2px;
  background-color: var(--primary, #0f766e);
  border-radius: 999px;
  opacity: 0.85;
}
.cal-day.selected .fasting-dash {
  background-color: #fff;
  opacity: 1;
}

/* Styling Chip Puasa di Bagian Detail */
.active-fasting-info {
  margin-top: 0.6rem;
  padding-top: 0.6rem;
  border-top: 1px dashed var(--border, #e2e7e5);
}
.fasting-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.f-chip {
  font-size: 0.78rem;
  padding: 3px 10px;
  border-radius: 999px;
  background: var(--primary-soft, #dcf1ed);
  color: var(--primary, #0f766e);
  font-weight: 600;
}
.f-chip.wajib {
  background: var(--primary, #0f766e);
  color: var(--on-primary, #fff);
}
.f-chip.bad {
  background: rgba(180, 35, 24, 0.12);
  color: var(--error, #b42318);
}

/* Styling Panduan Keterangan Jenis Puasa */
.guide { margin: 1.5rem 0 1rem; }
.guide summary { cursor: pointer; min-height: 44px; display: flex; align-items: center; color: var(--primary, #0f766e); font-weight: 600; }
.guide ul { margin: 4px 0 0; padding-left: 1.1rem; font-size: .9rem; line-height: 1.6; color: var(--muted, #62716c); }
</style>