<script setup>
import { computed, ref, watch, onBeforeUnmount } from 'vue'
import { KISAH_NABI } from '../data/kisahNabi'

const query = ref('')
const selectedNo = ref(null)

const selected = computed(() =>
  KISAH_NABI.find((n) => n.no === selectedNo.value) || null
)

const filtered = computed(() => {
  const q = query.value.trim().toLocaleLowerCase('id')

  if (!q) return KISAH_NABI

  return KISAH_NABI.filter((n) =>
    `${n.no} ${n.nama} ${n.ringkasan} ${n.kisah} ${n.referensi}`
      .toLocaleLowerCase('id')
      .includes(q)
  )
})

const arabicNames = {
  1: 'آدم',
  2: 'إدريس',
  3: 'نوح',
  4: 'هود',
  5: 'صالح',
  6: 'إبراهيم',
  7: 'لوط',
  8: 'إسماعيل',
  9: 'إسحاق',
  10: 'يعقوب',
  11: 'يوسف',
  12: 'أيوب',
  13: 'شعيب',
  14: 'موسى',
  15: 'هارون',
  16: 'ذو الكفل',
  17: 'داود',
  18: 'سليمان',
  19: 'إلياس',
  20: 'اليسع',
  21: 'يونس',
  22: 'زكريا',
  23: 'يحيى',
  24: 'عيسى',
  25: 'محمد'
}

/*
 * URL ilustrasi statis.
 * Gambar berupa lanskap dan suasana,
 * bukan penggambaran nabi.
 */
const landscapeImages = [
  'photo-1509316785289-025f5b846b35',
  'photo-1470770841072-f978cf4d019e',
  'photo-1500530855697-b586d89ba3ee',
  'photo-1501785888041-af3ef285b470',
  'photo-1464822759023-fed622ff2c3b',
  'photo-1472396961693-142e6e269027',
  'photo-1519681393784-d120267933ba',
  'photo-1470252649378-9c29740c9fa8'
]

function illustrationUrl(n, width = 1200, height = 800) {
  const photo =
    landscapeImages[(Number(n.no) - 1) % landscapeImages.length]

  return `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=${width}&h=${height}&q=82`
}

function open(no) {
  selectedNo.value = no
}

function close() {
  selectedNo.value = null
}

function step(delta) {
  if (!selected.value) return

  const index = KISAH_NABI.findIndex(
    (n) => n.no === selectedNo.value
  )

  const nextIndex =
    (index + delta + KISAH_NABI.length) % KISAH_NABI.length

  selectedNo.value = KISAH_NABI[nextIndex].no
}

/* Mengunci scroll halaman saat modal dibuka */
let previousBodyOverflow = ''

watch(
  () => selectedNo.value !== null,
  (isOpen) => {
    if (isOpen) {
      previousBodyOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = previousBodyOverflow
    }
  }
)

onBeforeUnmount(() => {
  document.body.style.overflow = previousBodyOverflow
})
</script>

<template>
  <section class="kisah-page">

    <!-- HEADER -->
    <header class="kisah-header">
      <h1>25 Nabi dan Rasul</h1>

      <p class="muted intro">
        Kenali kisah para nabi, teladani akhlaknya,
        dan baca rujukan ayat Al-Qur’an.
      </p>
    </header>

    <!-- SEARCH -->
    <div class="kisah-search search">
      <input
        v-model="query"
        class="input"
        type="search"
        placeholder="Cari nama nabi atau kata dalam kisah..."
        aria-label="Cari kisah nabi"
      />

      <button
        v-if="query"
        type="button"
        class="clear"
        aria-label="Hapus pencarian"
        @click="query = ''"
      >
        ✕
      </button>
    </div>

    <p class="muted count">
      Menampilkan {{ filtered.length }} dari 25 nabi
    </p>

    <!-- CARD LIST -->
    <div class="kisah-grid">
      <button
        v-for="n in filtered"
        :key="n.no"
        type="button"
        class="card surah-card kisah-card"
        @click="open(n.no)"
      >
        <!-- BINTANG NOMOR -->
        <span class="num">
          {{ n.no }}
        </span>

        <!-- NAMA DAN RINGKASAN -->
        <span class="meta">
          <strong>{{ n.nama }}</strong>
          <small>{{ n.ringkasan }}</small>
        </span>

        <!-- NAMA ARAB -->
        <span
          class="arab-name kisah-arab"
          dir="rtl"
          lang="ar"
        >
          {{ arabicNames[n.no] || 'نبي' }}
        </span>
      </button>
    </div>

    <!-- EMPTY SEARCH -->
    <div
      v-if="filtered.length === 0"
      class="empty-state muted"
    >
      <p>Nama atau kisah nabi tidak ditemukan.</p>

      <button
        class="btn"
        type="button"
        @click="query = ''"
      >
        Reset pencarian
      </button>
    </div>

    <!-- CATATAN -->
    <p class="note muted">
      Kisah disajikan berdasarkan keterangan Al-Qur’an.
      Rincian yang tidak memiliki dasar kuat tidak dipastikan.
      Ilustrasi hanya menggambarkan suasana, bukan sosok nabi.
    </p>

    <!-- MODAL DETAIL -->
    <div
      v-if="selected"
      class="kisah-overlay"
      @click.self="close"
    >
      <article
        class="kisah-sheet"
        role="dialog"
        aria-modal="true"
        :aria-label="`Kisah ${selected.nama}`"
      >

        <!-- TOMBOL TUTUP -->
        <button
          type="button"
          class="kisah-close"
          aria-label="Tutup"
          @click="close"
        >
          ✕
        </button>

        <!-- HERO IMAGE -->
        <div class="kisah-hero">
          <img
            :src="illustrationUrl(selected)"
            :alt="`Ilustrasi suasana kisah ${selected.nama}`"
            loading="lazy"
          />

          <div class="hero-overlay">
            <span class="hero-label">
              Kisah Nabi ke-{{ selected.no }} dari 25
            </span>

            <h2>{{ selected.nama }}</h2>
          </div>
        </div>

        <!-- NOMOR -->
        <div class="detail-top">
          <span class="num">
            {{ selected.no }}
          </span>

          <span class="muted">
            Nabi ke-{{ selected.no }} dari 25
          </span>
        </div>

        <!-- RINGKASAN -->
        <div class="detail-summary">
          {{ selected.ringkasan }}
        </div>

        <!-- KISAH -->
        <h3 class="section-title">
          📖 Kisah
        </h3>

        <div class="story-text">
          {{ selected.kisah }}
        </div>

        <!-- HIKMAH -->
        <h3 class="section-title">
          ✨ Hikmah yang dapat dipetik
        </h3>

        <ul class="lessons">
          <li
            v-for="(lesson, i) in selected.hikmah"
            :key="i"
          >
            {{ lesson }}
          </li>
        </ul>

        <!-- REFERENSI -->
        <h3 class="section-title">
          📚 Rujukan Al-Qur’an
        </h3>

        <div class="references">
          {{ selected.referensi }}
        </div>

        <!-- NAVIGASI -->
        <div class="detail-actions">
          <button
            type="button"
            class="btn"
            @click="step(-1)"
          >
            ← Sebelumnya
          </button>

          <button
            type="button"
            class="btn primary"
            @click="close"
          >
            Tutup
          </button>

          <button
            type="button"
            class="btn"
            @click="step(1)"
          >
            Berikutnya →
          </button>
        </div>

      </article>
    </div>

  </section>
</template>

<style scoped>

/* =========================================
   PAGE
========================================= */

.kisah-page {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  min-width: 0;
  box-sizing: border-box;
}

.kisah-header h1 {
  margin-bottom: .4rem;
}

.intro {
  margin: -.3rem 0 1rem;
  line-height: 1.6;
}

/* =========================================
   SEARCH
========================================= */

.kisah-search {
  position: relative;
  margin: 1rem 0 .5rem;
  min-width: 0;
}

.kisah-search .input {
  width: 100%;
  box-sizing: border-box;
  padding-right: 3rem;
}

.kisah-search .clear {
  position: absolute;
  right: .35rem;
  top: 50%;
  transform: translateY(-50%);

  border: 0;
  background: none;

  min-width: 44px;
  min-height: 44px;

  font-size: 1.1rem;
  color: var(--muted);
  cursor: pointer;
  border-radius: 50%;
}

.count {
  font-size: .85rem;
  margin: .3rem 0 .8rem;
}

/* =========================================
   CARD GRID
========================================= */

.kisah-grid {
  display: grid;
  gap: .7rem;

  grid-template-columns:
    repeat(auto-fill, minmax(min(100%, 270px), 1fr));

  margin-top: .8rem;
  min-width: 0;
}

/* Card mengikuti Surah Card */
.kisah-card {
  width: 100%;
  min-width: 0;
  box-sizing: border-box;

  text-align: left;
  font: inherit;
  cursor: pointer;
}

.kisah-card .meta {
  min-width: 0;
}

.kisah-card .meta strong,
.kisah-card .meta small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.kisah-card .meta small {
  color: var(--muted);
}

/* Nama Arab */
.kisah-arab {
  flex: none;
  font-size: 1.5rem;
  line-height: 1.4;
}

/* Hover */
.kisah-card:hover {
  border-color: var(--primary);
}

.kisah-card:active {
  transform: scale(.98);
}

/* =========================================
   EMPTY STATE
========================================= */

.empty-state {
  text-align: center;
  padding: 1.5rem 1rem;
}

/* =========================================
   NOTE
========================================= */

.note {
  font-size: .8rem;
  line-height: 1.6;
  margin-top: 1rem;
}

/* =========================================
   OVERLAY
========================================= */

.kisah-overlay {
  position: fixed;
  z-index: 60;
  inset: 0;

  background: rgba(0, 0, 0, .5);

  display: grid;
  place-items: center;

  padding: 12px;
  box-sizing: border-box;

  overflow: hidden;
}

/* =========================================
   MODAL
========================================= */

.kisah-sheet {
  position: relative;

  background: var(--surface);
  color: var(--text);

  width: min(100%, 800px);
  height: min(94dvh, 100%);
  max-height: 94dvh;
  min-height: 0;

  box-sizing: border-box;

  overflow-y: auto;
  overflow-x: hidden;

  overscroll-behavior: contain;

  /* Sembunyikan scrollbar */
  scrollbar-width: none;
  -ms-overflow-style: none;

  border: 1px solid var(--border);
  border-radius: 22px;

  padding: 0 1.15rem 1.2rem;
}

.kisah-sheet::-webkit-scrollbar {
  display: none;
}

/* Mencegah overflow elemen */
.kisah-sheet,
.kisah-sheet * {
  min-width: 0;
  box-sizing: border-box;
}

/* =========================================
   CLOSE BUTTON
========================================= */

.kisah-close {
  position: absolute;
  top: .8rem;
  right: .8rem;
  z-index: 5;

  border: 0;
  border-radius: 50%;

  width: 40px;
  height: 40px;

  background: rgba(255, 255, 255, .9);
  color: #514735;

  cursor: pointer;
  font-size: 1rem;
}

/* =========================================
   HERO IMAGE
========================================= */

.kisah-hero {
  position: relative;

  width: calc(100% + 2.3rem);
  max-width: none;

  margin-left: -1.15rem;

  height: clamp(170px, 30vh, 260px);

  overflow: hidden;

  border-radius: 21px 21px 0 0;

  background: var(--primary-soft);
}

.kisah-hero img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-overlay {
  position: absolute;
  inset: 0;

  display: flex;
  flex-direction: column;
  justify-content: flex-end;

  padding: 1.2rem;

  color: white;

  background: linear-gradient(
    to top,
    rgba(0, 0, 0, .65),
    transparent 75%
  );
}

.hero-label {
  font-size: .8rem;
  opacity: .9;
}

.hero-overlay h2 {
  margin: .3rem 0 0;
  font-size: 1.7rem;
}

/* =========================================
   DETAIL TOP
========================================= */

.detail-top {
  display: flex;
  align-items: center;
  gap: .7rem;
  margin: 1rem 0;
}

.detail-top .num {
  width: 2.8rem;
  height: 2.8rem;
}

/* =========================================
   SUMMARY
========================================= */

.detail-summary {
  margin: 0;
  padding: .9rem;

  background: var(--primary-soft);
  border-radius: 14px;

  line-height: 1.7;

  text-align: justify;
  text-justify: inter-word;

  overflow-wrap: anywhere;
}

/* =========================================
   SECTION TITLE
========================================= */

.section-title {
  margin: 1.4rem 0 .6rem;
  font-size: 1rem;
  color: var(--primary);
}

/* =========================================
   STORY
========================================= */

.story-text {
  line-height: 1.9;
  font-size: .97rem;

  white-space: pre-line;

  text-align: justify;
  text-justify: inter-word;

  overflow-wrap: anywhere;
  word-break: normal;
  hyphens: auto;
}

/* =========================================
   LESSONS
========================================= */

.lessons {
  padding-left: 1.3rem;
  margin: .4rem 0;
  line-height: 1.7;
}

.lessons li {
  margin: .5rem 0;

  text-align: justify;
  text-justify: inter-word;

  overflow-wrap: anywhere;
}

/* =========================================
   REFERENCES
========================================= */

.references {
  border: 1px solid var(--border);
  border-radius: 12px;

  padding: .9rem;
  margin: .3rem 0;

  font-size: .9rem;
  line-height: 1.7;

  text-align: justify;
  text-justify: inter-word;

  overflow-wrap: anywhere;
}

/* =========================================
   DETAIL BUTTONS
========================================= */

.detail-actions {
  display: flex;
  justify-content: space-between;
  gap: .5rem;
  flex-wrap: wrap;

  margin-top: 1.3rem;
}

.detail-actions .btn {
  flex: 1;
  min-width: 95px;
}

/* =========================================
   MOBILE
========================================= */

@media (max-width: 480px) {

  .kisah-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .kisah-card {
    gap: .65rem;
    padding: .85rem;
  }

  .kisah-card .num {
    width: 2.5rem;
    height: 2.5rem;
  }

  .kisah-arab {
    font-size: 1.25rem;
  }

  .kisah-overlay {
    padding: 7px;
  }

  .kisah-sheet {
    width: 100%;
    height: 96dvh;
    max-height: 96dvh;

    padding: 0 .85rem .9rem;

    border-radius: 17px;
  }

  .kisah-hero {
    width: calc(100% + 1.7rem);
    margin-left: -.85rem;

    height: 190px;

    border-radius: 16px 16px 0 0;
  }

  .hero-overlay h2 {
    font-size: 1.4rem;
  }

  .story-text {
    font-size: .94rem;
    line-height: 1.85;
  }

  .detail-actions {
    gap: .4rem;
  }

  .detail-actions .btn {
    font-size: .8rem;
    padding: .65rem .5rem;
  }
}

</style>