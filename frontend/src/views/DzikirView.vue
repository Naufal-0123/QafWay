<script setup>
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { DZIKIR, DZIKIR_SUMBER } from '../data/dzikir'

/* ---------- Tab ---------- */
const TABS = [
  { key: 'pagi', label: '☀️ Dzikir Pagi', waktu: 'Dibaca sejak Subuh hingga menjelang Zhuhur (utamanya sebelum matahari terbit).' },
  { key: 'petang', label: '🌙 Dzikir Petang', waktu: 'Dibaca di sore hari hingga pertengahan malam.' },
]
// Sebelum pukul 15.00 buka dzikir pagi, setelahnya dzikir petang
const tab = ref(new Date().getHours() < 15 ? 'pagi' : 'petang')
const items = computed(() => DZIKIR[tab.value])
const waktu = computed(() => TABS.find((t) => t.key === tab.value).waktu)

/* ---------- Kemajuan hari ini (disimpan di perangkat, otomatis ulang tiap hari) ---------- */
const STORE = 'qafway:dzikir:progress'
const pad = (n) => String(n).padStart(2, '0')
const today = () => {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
const progress = reactive({ date: today(), pagi: {}, petang: {} })
try {
  const s = JSON.parse(localStorage.getItem(STORE) || 'null')
  if (s && s.date === today()) {
    progress.pagi = s.pagi ?? {}
    progress.petang = s.petang ?? {}
  }
} catch {
  /* abaikan */
}
watch(
  progress,
  () => {
    try {
      localStorage.setItem(STORE, JSON.stringify({ date: progress.date, pagi: progress.pagi, petang: progress.petang }))
    } catch {
      /* abaikan */
    }
  },
  { deep: true },
)

const countOf = (d) => progress[tab.value][d.id] ?? 0
const isDone = (d) => countOf(d) >= d.jumlah
const total = computed(() => items.value.length)
const doneCount = computed(() => items.value.filter(isDone).length)
const pct = computed(() => Math.round((doneCount.value / total.value) * 100))
const allDone = computed(() => doneCount.value === total.value)

/* ---------- Ukuran huruf Arab ---------- */
const SCALE_KEY = 'qafway:dzikir:scale'
const scale = ref(1)
try {
  const v = parseFloat(localStorage.getItem(SCALE_KEY))
  if (v >= 0.8 && v <= 1.6) scale.value = v
} catch {
  /* abaikan */
}
function bump(delta) {
  scale.value = Math.min(1.6, Math.max(0.8, +(scale.value + delta).toFixed(2)))
  try {
    localStorage.setItem(SCALE_KEY, String(scale.value))
  } catch {
    /* abaikan */
  }
}

/* ---------- Interaksi ---------- */
const openId = ref(null)
const copied = ref(null)
watch(tab, () => (openId.value = null))
const toggle = (id) => (openId.value = openId.value === id ? null : id)

function buzz(p) {
  try {
    navigator.vibrate?.(p)
  } catch {
    /* abaikan */
  }
}

function tap(d) {
  if (isDone(d)) return
  addCount(d, 1)
}
function addCount(d, n) {
  const next = Math.min(d.jumlah, countOf(d) + n)
  progress[tab.value][d.id] = next
  buzz(8)
  if (next >= d.jumlah) finish(d)
}
function undo(d) {
  const c = countOf(d)
  if (c > 0) progress[tab.value][d.id] = c - 1
}
function markDone(d) {
  progress[tab.value][d.id] = d.jumlah
  finish(d)
}
function resetItem(d) {
  delete progress[tab.value][d.id]
}
function resetAll() {
  if (!doneCount.value && !Object.keys(progress[tab.value]).length) return
  if (window.confirm(`Atur ulang semua hitungan dzikir ${tab.value} hari ini?`)) progress[tab.value] = {}
}

// Selesai satu bacaan: getar, lalu buka bacaan berikutnya yang belum selesai
function finish(d) {
  buzz([20, 40, 20])
  const idx = items.value.findIndex((x) => x.id === d.id)
  const next = items.value.slice(idx + 1).find((x) => !isDone(x)) ?? items.value.find((x) => !isDone(x))
  setTimeout(async () => {
    openId.value = next ? next.id : null
    await nextTick()
    if (next) document.getElementById(`dz-${next.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, 500)
}

async function copyDzikir(d) {
  const text = [d.judul, d.pembuka?.join('\n'), d.arab.join('\n'), d.arti, `(Dibaca ${d.jumlahLabel ?? d.jumlah + 'x'})`]
    .filter(Boolean)
    .join('\n\n')
  try {
    await navigator.clipboard.writeText(text)
    copied.value = d.id
    setTimeout(() => (copied.value = null), 1800)
  } catch {
    /* clipboard tidak tersedia */
  }
}
</script>

<template>
  <div class="dzikir-container" :style="{ '--ar-scale': scale }">
    <div class="header-section">
      <h1 class="title">Dzikir Pagi &amp; Petang</h1>
      <p class="subtitle muted">Amalan harian penenang hati, pagi dan petang.</p>
    </div>

    <div class="tabs-card" role="tablist">
      <button
        v-for="t in TABS"
        :key="t.key"
        class="tab-btn"
        :class="{ on: tab === t.key }"
        role="tab"
        :aria-selected="tab === t.key"
        @click="tab = t.key"
      >
        {{ t.label }}
      </button>
    </div>

    <p class="waktu muted">{{ waktu }}</p>

    <!-- Kemajuan -->
    <div class="progress-card card">
      <div class="progress-top">
        <span class="progress-text" aria-live="polite">
          <strong>{{ doneCount }}</strong> / {{ total }} bacaan selesai
        </span>
        <span class="tools">
          <button class="tool" aria-label="Perkecil huruf Arab" @click="bump(-0.1)">A−</button>
          <button class="tool" aria-label="Perbesar huruf Arab" @click="bump(0.1)">A+</button>
          <button class="tool reset" aria-label="Atur ulang hitungan hari ini" @click="resetAll">↺</button>
        </span>
      </div>
      <div class="bar" role="progressbar" :aria-valuenow="pct" aria-valuemin="0" aria-valuemax="100">
        <span class="fill" :style="{ width: pct + '%' }"></span>
      </div>
    </div>

    <div v-if="allDone" class="card done-card">
      <span class="done-icon" aria-hidden="true">🤲</span>
      <div>
        <strong>Alhamdulillah, dzikir {{ tab }} hari ini selesai.</strong>
        <p class="muted">Semoga Allah menerima amalan kita.</p>
      </div>
    </div>

    <!-- Daftar dzikir -->
    <article
      v-for="d in items"
      :id="`dz-${d.id}`"
      :key="`${tab}-${d.id}`"
      class="card dzikir-card"
      :class="{ active: openId === d.id, done: isDone(d) }"
    >
      <button class="head" :aria-expanded="openId === d.id" @click="toggle(d.id)">
        <span class="num">{{ d.id }}</span>
        <span class="nama">{{ d.judul }}</span>
        <span v-if="isDone(d)" class="badge ok" aria-label="Selesai">✓</span>
        <span v-else-if="countOf(d) > 0" class="badge part">{{ countOf(d) }}/{{ d.jumlah }}</span>
        <span v-else class="badge">{{ d.jumlah }}×</span>
        <span class="chev" :class="{ up: openId === d.id }" aria-hidden="true">⌄</span>
      </button>

      <div v-if="openId === d.id" class="body">
        <p v-for="(p, i) in d.pembuka" :key="'p' + i" class="pembuka" dir="rtl" lang="ar">{{ p }}</p>
        <p v-for="(a, i) in d.arab" :key="i" class="ar" dir="rtl" lang="ar">{{ a }}</p>
        <p class="idn">{{ d.arti }}</p>
        <p class="kali muted">Dibaca {{ d.jumlahLabel ?? d.jumlah + 'x' }}</p>

        <!-- Penghitung -->
        <div class="counter">
          <button class="c-side" :disabled="countOf(d) === 0" aria-label="Kurangi satu hitungan" @click="undo(d)">−</button>
          <button
            class="c-main"
            :class="{ finished: isDone(d) }"
            :aria-label="`Hitung. Sekarang ${countOf(d)} dari ${d.jumlah}`"
            @click="tap(d)"
          >
            <span class="c-num">{{ countOf(d) }}<small> / {{ d.jumlah }}</small></span>
            <span class="c-hint">{{ isDone(d) ? 'Selesai ✓' : 'Ketuk untuk menghitung' }}</span>
          </button>
          <button class="c-side" :disabled="countOf(d) === 0" aria-label="Ulangi dari awal" @click="resetItem(d)">↺</button>
        </div>
        <div class="quick">
          <button v-if="d.jumlah >= 10 && !isDone(d)" class="btn q" @click="addCount(d, 10)">+10</button>
          <button v-if="!isDone(d)" class="btn q" @click="markDone(d)">✓ Tandai selesai</button>
        </div>

        <div class="card-actions">
          <button class="btn copy-btn" @click="copyDzikir(d)">
            {{ copied === d.id ? '✓ Berhasil Disalin' : '📋 Salin Dzikir' }}
          </button>
        </div>
      </div>
    </article>
  </div>
</template>

<style scoped>
.dzikir-container {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  max-width: 800px;
  margin: 0 auto;
}
.title { margin: 4px 0 2px; font-size: 1.6rem; font-weight: 700; }
.subtitle { font-size: 0.9rem; margin: 0; }
.muted { color: var(--muted, #62716c); }
.waktu { margin: -0.2rem 0 0; font-size: 0.85rem; }

.tabs-card {
  display: flex; gap: 8px; padding: 6px;
  background: var(--surface, #f4f6f5);
  border: 1px solid var(--border, #e2e7e5);
  border-radius: 16px;
}
.tab-btn {
  flex: 1; min-height: 44px; padding: 0 12px; border-radius: 12px; cursor: pointer;
  font: inherit; font-weight: 600; font-size: 0.92rem; border: none; background: transparent;
  color: var(--text, #17201e); transition: background 0.2s, color 0.2s, box-shadow 0.2s;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; touch-action: manipulation;
}
.tab-btn:hover { background: var(--primary-soft, #dcf1ed); color: var(--primary, #0f766e); }
.tab-btn.on { background: var(--primary, #0f766e); color: var(--on-primary, #fff); box-shadow: 0 4px 12px rgba(15, 118, 110, 0.2); }

/* Kemajuan */
.progress-card { margin: 0; padding: 12px 14px; display: grid; gap: 10px; }
.progress-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.progress-text { font-size: 0.9rem; }
.tools { display: inline-flex; gap: 6px; }
.tool {
  min-width: 40px; min-height: 36px; padding: 0 10px; border-radius: 10px; cursor: pointer;
  font: inherit; font-size: 0.85rem; font-weight: 600; touch-action: manipulation;
  border: 1px solid var(--border, #e2e7e5); background: var(--bg, #fff); color: var(--text, #17201e);
  transition: transform 0.12s, border-color 0.2s;
}
.tool:active { transform: scale(0.94); }
.tool.reset { font-size: 1rem; }
.bar { height: 8px; border-radius: 999px; background: var(--primary-soft, #dcf1ed); overflow: hidden; }
.fill {
  display: block; height: 100%; border-radius: inherit; background: var(--primary, #0f766e);
  transition: width 0.5s cubic-bezier(0.2, 0.7, 0.2, 1);
}

.done-card {
  margin: 0; display: flex; align-items: center; gap: 12px; padding: 14px 16px;
  border-color: var(--primary, #0f766e); background: var(--primary-soft, #dcf1ed);
}
.done-card p { margin: 2px 0 0; font-size: 0.88rem; }
.done-icon { font-size: 1.8rem; }

/* Kartu dzikir */
.dzikir-card {
  padding: 0; border: 1px solid var(--border, #e2e7e5); border-radius: 16px; margin: 0;
  transition: border-color 0.2s, background-color 0.3s; overflow: hidden;
  background: var(--surface, #ffffff); scroll-margin-top: 5rem;
}
.dzikir-card.active { border-color: var(--primary, #0f766e); }
.dzikir-card.done { border-color: var(--primary, #0f766e); }
.dzikir-card.done .nama { color: var(--muted, #62716c); }
.head {
  width: 100%; min-height: 60px; display: grid; grid-template-columns: 2.8rem 1fr auto auto;
  gap: 10px; align-items: center; padding: 10px 14px; border: 0; background: transparent;
  cursor: pointer; text-align: left; font: inherit; color: inherit; touch-action: manipulation;
}
.head:hover { background: var(--primary-soft, #dcf1ed); }
.nama { font-weight: 600; font-size: 1rem; line-height: 1.3; min-width: 0; overflow-wrap: anywhere; }
.badge {
  min-width: 38px; padding: 3px 9px; border-radius: 999px; text-align: center; font-size: 0.78rem; font-weight: 700;
  color: var(--muted, #62716c); background: var(--bg, #f4f6f5); border: 1px solid var(--border, #e2e7e5);
  font-variant-numeric: tabular-nums;
}
.badge.part { color: var(--primary, #0f766e); border-color: var(--primary, #0f766e); background: var(--primary-soft, #dcf1ed); }
.badge.ok { color: var(--on-primary, #fff); background: var(--primary, #0f766e); border-color: var(--primary, #0f766e); }
.chev { font-size: 1.2rem; color: var(--muted, #62716c); transition: transform 0.25s; }
.chev.up { transform: rotate(180deg); }

.body { padding: 4px 18px 18px; border-top: 1px solid var(--border, #e2e7e5); }
.pembuka {
  margin: 12px 0 0; text-align: center; color: var(--muted, #62716c);
  font-size: calc(1.2rem * var(--ar-scale, 1)); line-height: 2.1;
  font-family: var(--arab-font, 'Amiri', 'Noto Naskh Arabic', serif);
}
.ar {
  font-size: calc(clamp(1.6rem, 5vw, 2rem) * var(--ar-scale, 1)); line-height: 2.4; margin: 10px 0 4px;
  text-align: right; font-family: var(--arab-font, 'Amiri', 'Noto Naskh Arabic', serif);
}
.idn { margin: 14px 0 6px; font-size: 0.98rem; line-height: 1.65; }
.kali { margin: 0 0 12px; font-size: 0.82rem; font-weight: 600; }

/* Penghitung */
.counter { display: grid; grid-template-columns: 52px 1fr 52px; gap: 10px; align-items: stretch; margin-top: 6px; }
.c-side {
  min-height: 64px; border-radius: 16px; cursor: pointer; font: inherit; font-size: 1.4rem; touch-action: manipulation;
  border: 1px solid var(--border, #e2e7e5); background: var(--bg, #fff); color: var(--text, #17201e);
  transition: transform 0.12s, opacity 0.2s;
}
.c-side:active:not(:disabled) { transform: scale(0.94); }
.c-side:disabled { opacity: 0.4; cursor: default; }
.c-main {
  min-height: 64px; border-radius: 16px; cursor: pointer; font: inherit; touch-action: manipulation;
  display: grid; place-content: center; gap: 2px; text-align: center; border: 0;
  background: var(--primary, #0f766e); color: var(--on-primary, #fff);
  box-shadow: 0 6px 16px var(--glow, rgba(15, 118, 110, 0.18));
  transition: transform 0.12s, background-color 0.3s;
  -webkit-tap-highlight-color: transparent; user-select: none;
}
.c-main:active { transform: scale(0.98); }
.c-main.finished { background: var(--primary-soft, #dcf1ed); color: var(--primary, #0f766e); box-shadow: none; cursor: default; }
.c-num { font-size: 1.7rem; font-weight: 700; line-height: 1.1; font-variant-numeric: tabular-nums; }
.c-num small { font-size: 0.95rem; font-weight: 500; opacity: 0.8; }
.c-hint { font-size: 0.75rem; opacity: 0.85; }
.quick { display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap; }
.btn.q { min-height: 38px; padding: 0 14px; border-radius: 10px; font-size: 0.85rem; }

.card-actions { display: flex; justify-content: flex-end; margin-top: 14px; border-top: 1px dashed var(--border, #e2e7e5); padding-top: 12px; }
.copy-btn { font-size: 0.85rem; min-height: 38px; padding: 0 14px; border-radius: 10px; }

.sumber { margin: 0.4rem 0 0; font-size: 0.78rem; line-height: 1.6; }
.sumber a { color: var(--primary, #0f766e); }

@media (max-width: 400px) {
  .title { font-size: 1.4rem; }
  .tab-btn { padding: 0 8px; font-size: 0.85rem; }
  .head { grid-template-columns: 2.8rem 1fr auto auto; gap: 8px; padding: 10px 12px; }
  .body { padding: 4px 14px 16px; }
  .counter { grid-template-columns: 46px 1fr 46px; gap: 8px; }
}
</style>