<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { ASMAUL_HUSNA } from "../data/asmaulhusna";

const query = ref("");
const selectedNo = ref(null); // nomor nama yang dibuka di lembar detail
const copied = ref(false);

// Hapus tanda baca/harakat latin agar pencarian "rahman" menemukan "Ar-Rahmânu"
const plain = (s) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[ʿ'`-]/g, "")
    .toLowerCase();

const index = ASMAUL_HUSNA.map((n) => ({ no: n.no, hay: plain(`${n.latin} ${n.arti}`) }));

const filtered = computed(() => {
  const q = plain(query.value.trim());
  if (!q) return ASMAUL_HUSNA;
  const hits = new Set(
    index.filter((i) => i.hay.includes(q) || String(i.no) === q).map((i) => i.no),
  );
  return ASMAUL_HUSNA.filter((n) => hits.has(n.no));
});

// Nama hari ini: sama untuk semua pengguna pada tanggal yang sama
const dailyName = computed(() => {
  const d = new Date();
  const days = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
  return ASMAUL_HUSNA[days % ASMAUL_HUSNA.length];
});

const selected = computed(() => ASMAUL_HUSNA.find((n) => n.no === selectedNo.value) ?? null);

function open(no) {
  selectedNo.value = no;
  copied.value = false;
}
function close() {
  selectedNo.value = null;
}
function step(delta) {
  if (!selected.value) return;
  const total = ASMAUL_HUSNA.length;
  selectedNo.value = ((selected.value.no - 1 + delta + total) % total) + 1;
  copied.value = false;
}

async function copy() {
  const n = selected.value;
  if (!n) return;
  try {
    await navigator.clipboard.writeText(`${n.arab}\n${n.latin} (${n.no}/99): ${n.arti}`);
    copied.value = true;
    setTimeout(() => (copied.value = false), 1800);
  } catch {
    /* clipboard tidak tersedia */
  }
}

function onKey(e) {
  if (!selected.value) return;
  if (e.key === "Escape") close();
  else if (e.key === "ArrowLeft") step(-1);
  else if (e.key === "ArrowRight") step(1);
}
onMounted(() => window.addEventListener("keydown", onKey));
onBeforeUnmount(() => window.removeEventListener("keydown", onKey));
</script>

<template>
  <div class="asma">
    <h1>Asmaul Husna</h1>
    <p class="muted intro">99 nama Allah yang indah, lengkap dengan arti dalam bahasa Indonesia.</p>

    <button type="button" class="card daily" @click="open(dailyName.no)">
      <small class="muted">Nama hari ini</small>
      <span class="daily-ar" dir="rtl" lang="ar">{{ dailyName.arab }}</span>
      <strong>{{ dailyName.latin }}</strong>
      <span class="muted">{{ dailyName.arti }}</span>
    </button>

    <div class="search">
      <input
        v-model="query"
        class="input"
        type="search"
        placeholder="Cari nama atau arti (mis. rahman, pengampun, 99)"
        aria-label="Cari Asmaul Husna"
      />
      <button v-if="query" class="clear" aria-label="Hapus pencarian" @click="query = ''">✕</button>
    </div>

    <p v-if="!filtered.length" class="muted empty">Tidak ada nama yang cocok.</p>

    <div class="grid asma-grid">
      <button
        v-for="n in filtered"
        :key="n.no"
        type="button"
        class="card surah-card as-btn"
        :title="`${n.latin} · ${n.arti}`"
        @click="open(n.no)"
      >
        <span class="num">{{ n.no }}</span>
        <div class="meta">
          <strong>{{ n.latin }}</strong>
          <small>{{ n.arti }}</small>
        </div>
        <span class="arab-name" dir="rtl" lang="ar">{{ n.arab }}</span>
      </button>
    </div>


    <!-- Lembar detail -->
    <div v-if="selected" class="overlay" @click.self="close">
      <div class="sheet" role="dialog" aria-modal="true" :aria-label="`Asmaul Husna ${selected.latin}`">
        <button class="x" aria-label="Tutup" @click="close">✕</button>
        <span class="num big">{{ selected.no }}</span>
        <p class="sheet-ar" dir="rtl" lang="ar">{{ selected.arab }}</p>
        <h2>{{ selected.latin }}</h2>
        <p class="sheet-arti">{{ selected.arti }}</p>
        <div class="sheet-actions">
          <button class="btn" aria-label="Nama sebelumnya" @click="step(-1)">← Sebelumnya</button>
          <button class="btn primary" @click="copy">{{ copied ? "Tersalin ✓" : "Salin" }}</button>
          <button class="btn" aria-label="Nama berikutnya" @click="step(1)">Berikutnya →</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.intro { margin: -.4rem 0 .8rem; }
.note { font-size: .8rem; margin-top: 1.4rem; }
.empty { text-align: center; padding: 1rem 0; }

.daily {
  display: grid; gap: .15rem; width: 100%; text-align: center; cursor: pointer; font: inherit; color: inherit;
  background: var(--primary-soft); border-color: var(--primary);
}
.daily-ar { font-family: 'Amiri', 'Noto Naskh Arabic', 'Traditional Arabic', serif; font-size: 2.2rem; line-height: 1.6; color: var(--primary); }

/* Kartu nama memakai gaya kartu surah; di sini hanya agar tombol tampil seperti kartu */
.asma-grid { grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr)); }
.as-btn { width: 100%; text-align: left; font: inherit; color: inherit; cursor: pointer; }
.asma-grid .surah-card small { white-space: normal; overflow: visible; text-overflow: clip; }
.asma-grid .arab-name { font-size: 1.35rem; }

.overlay {
  position: fixed; inset: 0; z-index: 50; display: grid; place-items: end center;
  background: rgba(0, 0, 0, .45); padding: 0;
}
@media (min-width: 640px) { .overlay { place-items: center; padding: 1rem; } }
.sheet {
  position: relative; width: min(100%, 460px); text-align: center; display: grid; gap: .4rem; justify-items: center;
  background: var(--surface); color: var(--text); border: 1px solid var(--border);
  border-radius: 20px 20px 0 0; padding: 1.4rem 1.2rem calc(1.2rem + env(safe-area-inset-bottom, 0px));
}
@media (min-width: 640px) { .sheet { border-radius: 20px; } }
.x {
  position: absolute; top: .5rem; right: .5rem; width: 40px; height: 40px; border: 0; border-radius: 50%;
  background: transparent; color: var(--muted); cursor: pointer; font-size: 1rem;
}
.num.big { width: 3.4rem; height: 3.4rem; font-size: .95rem; }
.sheet-ar { margin: .2rem 0 0; font-size: 2.6rem; line-height: 1.7; color: var(--primary); font-family: 'Amiri', 'Noto Naskh Arabic', 'Traditional Arabic', serif; }
.sheet h2 { margin: 0; font-size: 1.3rem; }
.sheet-arti { margin: 0 0 .6rem; color: var(--muted); }
.sheet-actions { display: flex; gap: .5rem; flex-wrap: wrap; justify-content: center; }
</style>