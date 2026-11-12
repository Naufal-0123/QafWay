<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { getSurahs } from '../api/quran'
import ReminderToggle from '../components/ReminderToggle.vue'
import { tilawah, addLog, removeLog, setTarget, computeStats } from '../composables/useTilawah'

const surahs = ref([])
const loadError = ref('')

onMounted(async () => {
  try {
    surahs.value = await getSurahs()
  } catch (e) {
    loadError.value = e.message
  }
})

const totalAyat = computed(() => surahs.value.reduce((n, s) => n + s.jumlahAyat, 0))
const stats = computed(() => computeStats(totalAyat.value))
const byNo = computed(() => Object.fromEntries(surahs.value.map((s) => [s.nomor, s])))

/* ---------- Form catat bacaan ---------- */
const surahNo = ref(1)
const from = ref(1)
const to = ref(1)
const formError = ref('')

const maxAyat = computed(() => byNo.value[surahNo.value]?.jumlahAyat ?? 1)

watch(
  [surahNo, surahs],
  () => {
    from.value = 1
    to.value = maxAyat.value
  },
  { immediate: true },
)

function save() {
  formError.value = ''
  const f = Number(from.value)
  const t = Number(to.value)
  if (!Number.isInteger(f) || !Number.isInteger(t) || f < 1 || t > maxAyat.value || f > t) {
    formError.value = `Rentang ayat tidak valid. Surah ini memiliki ${maxAyat.value} ayat.`
    return
  }
  addLog({ surah: Number(surahNo.value), from: f, to: t })
  to.value = maxAyat.value
  from.value = 1
}

/* ---------- Target ---------- */
const targetDays = ref(tilawah.target.days)
function changeTarget() {
  if (confirm('Mulai target baru dari hari ini? Progres target saat ini akan dihitung ulang dari nol.')) {
    setTarget(Number(targetDays.value))
  } else {
    targetDays.value = tilawah.target.days
  }
}

const history = computed(() => [...tilawah.logs].reverse().slice(0, 30))
const label = (l) => `${byNo.value[l.surah]?.namaLatin ?? `Surah ${l.surah}`} ${l.from}–${l.to}`
const dateLabel = (s) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<template>
  <div class="tilawah">
    <h1 class="title">Tracker Tilawah</h1>
    <p v-if="loadError" class="error">{{ loadError }}</p>

    <section class="progress" :class="{ done: stats.done }">
      <div class="top">
        <span class="label">{{ stats.done ? 'Khatam 🎉' : `Target khatam ${tilawah.target.days} hari` }}</span>
        <strong class="pct">{{ stats.percent }}%</strong>
      </div>
      <div class="bar" role="progressbar" :aria-valuenow="stats.percent" aria-valuemin="0" aria-valuemax="100">
        <span :style="{ width: stats.percent + '%' }"></span>
      </div>
      <p class="sub">{{ stats.covered.toLocaleString('id-ID') }} dari {{ totalAyat.toLocaleString('id-ID') }} ayat</p>
    </section>

    <section class="stats">
      <div class="stat">
        <strong>{{ stats.todayRead }}</strong>
        <small>ayat hari ini</small>
      </div>
      <div class="stat">
        <strong>{{ stats.done ? '–' : stats.perDay }}</strong>
        <small>target per hari</small>
      </div>
      <div class="stat">
        <strong>{{ stats.streak }}</strong>
        <small>hari beruntun</small>
      </div>
      <div class="stat">
        <strong>{{ stats.done ? '–' : stats.daysLeft }}</strong>
        <small>hari tersisa</small>
      </div>
    </section>
    <p v-if="stats.overdue" class="warn">Batas waktu target sudah lewat. Lanjutkan membaca atau mulai target baru.</p>

    <section class="card">
      <h2>Catat bacaan</h2>
      <label class="field">
        <span>Surah</span>
        <select v-model.number="surahNo">
          <option v-for="s in surahs" :key="s.nomor" :value="s.nomor">{{ s.nomor }}. {{ s.namaLatin }} ({{ s.jumlahAyat }} ayat)</option>
        </select>
      </label>
      <div class="range">
        <label class="field"><span>Dari ayat</span><input v-model.number="from" type="number" min="1" :max="maxAyat" inputmode="numeric" /></label>
        <label class="field"><span>Sampai ayat</span><input v-model.number="to" type="number" min="1" :max="maxAyat" inputmode="numeric" /></label>
      </div>
      <p v-if="formError" class="error">{{ formError }}</p>
      <button class="btn primary" :disabled="!surahs.length" @click="save">Simpan bacaan</button>
    </section>

    <section class="card">
      <h2>Target khatam</h2>
      <label class="field inline">
        <span>Selesai dalam</span>
        <select v-model.number="targetDays" @change="changeTarget">
          <option :value="30">30 hari</option>
          <option :value="60">60 hari</option>
          <option :value="90">90 hari</option>
          <option :value="180">180 hari</option>
        </select>
      </label>
      <small class="muted">Dimulai {{ dateLabel(tilawah.target.startDate) }}. Mengubah target memulai hitungan baru dari hari ini.</small>
    </section>

    <ReminderToggle
      kind="tilawah"
      title="Pengingat tilawah harian"
      description="Hanya dikirim jika target hari ini belum tercapai."
    />

    <section v-if="history.length">
      <h2 class="h2">Riwayat</h2>
      <ul class="history">
        <li v-for="l in history" :key="l.id">
          <div>
            <strong>{{ label(l) }}</strong>
            <small class="muted">{{ dateLabel(l.date) }} · {{ l.to - l.from + 1 }} ayat</small>
          </div>
          <button class="del" :aria-label="`Hapus ${label(l)}`" @click="removeLog(l.id)">Hapus</button>
        </li>
      </ul>
    </section>
    <p v-else class="muted center">Belum ada bacaan tercatat.</p>

    <p class="muted note">Data tersimpan di browser perangkat ini saja dan hilang jika data situs dibersihkan.</p>
  </div>
</template>

<style scoped>
.title { margin: 8px 0 12px; font-size: 1.5rem; }
.h2, h2 { font-size: 1.05rem; margin: 0 0 8px; }
.h2 { margin-top: 18px; }
.muted { color: var(--muted, #62716c); }
.error { color: var(--error, #b42318); font-size: .9rem; }
.warn { color: var(--error, #b42318); font-size: .9rem; margin: 8px 0 0; }
.center { text-align: center; }
.note { font-size: .8rem; margin-top: 18px; }

.progress { padding: 18px; border-radius: 16px; background: var(--primary, #0f766e); color: var(--on-primary, #fff); }
.top { display: flex; justify-content: space-between; align-items: baseline; }
.label { font-size: .85rem; opacity: .9; }
.pct { font-size: 1.8rem; }
.bar { height: 10px; border-radius: 999px; background: rgba(255, 255, 255, .25); overflow: hidden; margin: 8px 0; }
.bar span { display: block; height: 100%; background: #fff; border-radius: 999px; transition: width .3s; }
.sub { margin: 0; font-size: .9rem; opacity: .92; }

.stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 10px; }
.stat { display: grid; place-items: center; padding: 10px 4px; border-radius: 12px; background: var(--surface, #f4f6f5); text-align: center; }
.stat strong { font-size: 1.3rem; line-height: 1.2; }
.stat small { color: var(--muted, #62716c); font-size: .72rem; }

.card { margin-top: 14px; padding: 14px; border-radius: 14px; border: 1px solid var(--border, #e2e7e5); background: var(--surface, #f4f6f5); display: grid; gap: 10px; }
.field { display: grid; gap: 4px; font-size: .85rem; color: var(--muted, #62716c); }
.field.inline { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.range { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.field select { width: 100%; margin: 0; }
.field.inline select { width: auto; }
.field input {
  height: 46px; padding: 0 12px; font-size: 16px; border-radius: 10px; min-width: 0;
  border: 1px solid var(--border, #e2e7e5); background: var(--bg, #fff); color: var(--text, #17201e);
}
.btn { min-height: 46px; padding: 0 16px; border-radius: 12px; cursor: pointer; font: inherit; border: 1px solid var(--border, #e2e7e5); background: var(--surface, #f4f6f5); color: var(--text, #17201e); }
.btn.primary { background: var(--primary, #0f766e); border-color: var(--primary, #0f766e); color: var(--on-primary, #fff); }
.btn:disabled { opacity: .6; }

.history { list-style: none; margin: 0; padding: 0; }
.history li { display: flex; justify-content: space-between; align-items: center; gap: 10px; padding: 10px 2px; border-bottom: 1px solid var(--border, #e2e7e5); }
.history li div { display: grid; }
.del { min-height: 40px; padding: 0 12px; border-radius: 10px; border: 1px solid var(--border, #e2e7e5); background: transparent; color: var(--error, #b42318); cursor: pointer; font: inherit; }
.field, .range > *, .stat { min-width: 0; }
.field.inline { flex-wrap: wrap; }
.history li > div { min-width: 0; }
@media (max-width: 420px) {
  .range { grid-template-columns: 1fr; }
  .stats { grid-template-columns: repeat(2, 1fr); }
  .pct { font-size: 1.5rem; }
  .progress { padding: 14px; }
}
</style>