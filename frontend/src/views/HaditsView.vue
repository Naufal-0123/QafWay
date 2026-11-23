<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { HADITS_ARBAIN } from "../data/haditsData.js";

const query = ref("");
const arbain = ref(HADITS_ARBAIN.map((h) => ({ ...h })));
const loading = ref(false);
const error = ref("");
const selected = ref(null);

const API_ARBain = "https://api.myquran.com/v2/hadis/arbain/all";

/* =========================================
   HELPER
========================================= */

function pick(obj, keys, fallback = "") {
  for (const key of keys) {
    const value = obj?.[key];

    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      return value;
    }
  }

  return fallback;
}

/* =========================================
   NORMALISASI DATA API
========================================= */

function normalizeArbain(item, index) {
  const data =
    item?.data && !Array.isArray(item.data)
      ? item.data
      : item;

  const nomor = Number(
    pick(data, ["nomor", "no", "number", "id"], index + 1)
  );

  const local =
    HADITS_ARBAIN.find(
      (h) => Number(h.nomor) === nomor
    ) || {};

  return {
    ...local,

    id: local.id || `arbain-${nomor}`,
    nomor,

    judul:
      local.judul ||
      pick(
        data,
        ["judul", "title", "nama", "name"],
        `Hadits ${nomor}`
      ),

    perawi:
      local.perawi ||
      pick(
        data,
        ["perawi", "rawi", "narrator"],
        ""
      ),

    arab:
      pick(
        data,
        [
          "arab",
          "arabic",
          "teksArab",
          "text_ar",
          "hadis",
          "matn",
        ],
        ""
      ) || local.arab || "",

    terjemah:
      local.terjemah ||
      pick(
        data,
        [
          "terjemah",
          "indonesia",
          "translation",
          "arti",
          "text_id",
        ],
        ""
      ),

    sumber:
      local.sumber ||
      pick(
        data,
        ["sumber", "referensi", "reference", "kitab"],
        "Hadits Arbain Nawawi"
      ),

    catatan: local.catatan || "",
    url: local.url || "",
    raw: data,
  };
}

/* =========================================
   LOAD DATA ARBAIN
========================================= */

async function loadArbain() {
  loading.value = true;
  error.value = "";

  /* Tampilkan data lokal terlebih dahulu */
  arbain.value = HADITS_ARBAIN.map((h) => ({ ...h }));

  try {
    const response = await fetch(API_ARBain, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API merespons ${response.status}`);
    }

    const json = await response.json();

    const list = Array.isArray(json)
      ? json
      : Array.isArray(json?.data)
        ? json.data
        : Array.isArray(json?.data?.hadis)
          ? json.data.hadis
          : Array.isArray(json?.data?.hadits)
            ? json.data.hadits
            : [];

    if (!list.length) {
      throw new Error("Data API tidak ditemukan");
    }

    const apiMap = new Map();

    list.forEach((item, index) => {
      const normalized = normalizeArbain(item, index);

      apiMap.set(
        Number(normalized.nomor),
        normalized
      );
    });

    /* Gabungkan data lokal dengan API */
    arbain.value = HADITS_ARBAIN.map((local, index) => {
      const api = apiMap.get(Number(local.nomor));

      return {
        ...local,

        id: local.id || `arbain-${index + 1}`,
        nomor: Number(local.nomor),

        judul: local.judul || api?.judul || "",
        perawi: local.perawi || api?.perawi || "",

        arab: api?.arab || local.arab || "",

        terjemah:
          local.terjemah || api?.terjemah || "",

        sumber:
          local.sumber ||
          api?.sumber ||
          "Hadits Arbain Nawawi",

        catatan: local.catatan || api?.catatan || "",
        url: local.url || api?.url || "",
      };
    }).sort((a, b) => a.nomor - b.nomor);

  } catch (err) {
    /* Jika API gagal, data lokal tetap tersedia */
    arbain.value = HADITS_ARBAIN.map((h) => ({ ...h }));

    error.value =
      "Tidak dapat memperbarui data dari internet. Data lokal tetap ditampilkan.";
  } finally {
    loading.value = false;
  }
}

onMounted(loadArbain);

/* =========================================
   SEARCH
========================================= */

const filtered = computed(() => {
  const q = query.value
    .trim()
    .toLocaleLowerCase("id");

  if (!q) {
    return arbain.value;
  }

  return arbain.value.filter((h) => {
    const text = [
      h.nomor,
      h.judul,
      h.perawi,
      h.arab,
      h.terjemah,
      h.sumber,
      h.catatan,
    ]
      .join(" ")
      .toLocaleLowerCase("id");

    return text.includes(q);
  });
});

/* =========================================
   DETAIL HADITS
========================================= */

function openHadits(h) {
  selected.value = h;
  document.body.style.overflow = "hidden";
}

function closeHadits() {
  selected.value = null;
  document.body.style.overflow = "";
}

function move(delta) {
  if (!selected.value) return;

  const index = arbain.value.findIndex(
    (h) => h.id === selected.value.id
  );

  if (index === -1 || arbain.value.length === 0) {
    return;
  }

  const nextIndex =
    (index + delta + arbain.value.length) %
    arbain.value.length;

  selected.value = arbain.value[nextIndex];
}

function handleKeydown(event) {
  if (!selected.value) return;

  if (event.key === "Escape") {
    closeHadits();
  }

  if (event.key === "ArrowRight") {
    move(1);
  }

  if (event.key === "ArrowLeft") {
    move(-1);
  }
}

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
  document.body.style.overflow = "";
});
</script>

<template>
  <section class="hadits-page">

    <!-- =================================
         HEADER
    ================================== -->

    <header class="hadits-header">
      <h1>Hadits</h1>

      <p class="muted hadits-intro">
        Pelajari hadits Rasulullah ﷺ, baca teks Arab,
        terjemahan, dan penjelasannya.
      </p>
    </header>

    <!-- =================================
         SEARCH
    ================================== -->

    <div class="search hadits-search">
      <input
        v-model="query"
        class="input"
        type="search"
        placeholder="Cari hadits, judul, atau perawi..."
        aria-label="Cari hadits"
      />

      <button
        v-if="query"
        class="hadits-clear"
        type="button"
        aria-label="Hapus pencarian"
        @click="query = ''"
      >
        ✕
      </button>
    </div>

    <div class="hadits-info">
      <span class="muted">
        {{ filtered.length }} hadits
      </span>

      <span
        v-if="loading"
        class="hadits-loading muted"
      >
        Memuat...
      </span>
    </div>

    <p
      v-if="error"
      class="hadits-error muted"
    >
      {{ error }}
    </p>

    <!-- =================================
         CARD LIST

         CARD HANYA MENAMPILKAN:
         1. NOMOR
         2. JUDUL
         3. PERAWI

         ARAB DAN TERJEMAHAN TIDAK DITAMPILKAN
         DI CARD AWAL.
    ================================== -->

    <div class="hadits-list">

      <button
        v-for="h in filtered"
        :key="h.id"
        class="card surah-card hadits-card"
        type="button"
        @click="openHadits(h)"
      >

        <!-- NOMOR -->
        <span class="num hadits-number">
          {{ h.nomor }}
        </span>

        <!-- JUDUL + PERAWI -->
        <span class="meta hadits-meta">

          <strong class="hadits-title">
            {{ h.judul }}
          </strong>

          <small class="hadits-perawi">
            {{ h.perawi || "Perawi tidak tersedia" }}
          </small>

        </span>

      </button>

      <!-- KOSONG -->
      <div
        v-if="filtered.length === 0"
        class="card hadits-empty"
      >
        <p>
          Hadits tidak ditemukan.
        </p>

        <button
          class="btn"
          type="button"
          @click="query = ''"
        >
          Hapus pencarian
        </button>
      </div>

    </div>

    <!-- =================================
         MODAL DETAIL
    ================================== -->

    <div
      v-if="selected"
      class="hadits-overlay"
      @click.self="closeHadits"
    >

      <article
        class="hadits-detail"
        role="dialog"
        aria-modal="true"
        :aria-label="selected.judul"
      >

        <!-- TOMBOL TUTUP -->
        <button
          class="hadits-close"
          type="button"
          aria-label="Tutup"
          @click="closeHadits"
        >
          ✕
        </button>

        <!-- HEADER DETAIL -->
        <header class="hadits-detail-header">

          <span class="hadits-label">
            Arbain Nawawi · Hadits {{ selected.nomor }}
          </span>

          <h2>
            {{ selected.judul }}
          </h2>

          <p
            v-if="selected.perawi"
            class="hadits-detail-perawi muted"
          >
            Perawi:
            {{ selected.perawi }}
          </p>

        </header>

        <!-- =================================
             TEKS ARAB
        ================================== -->

        <div class="hadits-arab-box">

          <h3 class="hadits-section-title">
            Teks Hadits
          </h3>

          <div
            class="hadits-arab"
            dir="rtl"
            lang="ar"
          >
            {{
              selected.arab ||
              "Teks Arab belum tersedia."
            }}
          </div>

        </div>

        <!-- =================================
             TERJEMAHAN
        ================================== -->

        <section class="hadits-section">

          <h3 class="hadits-section-title">
            Terjemahan
          </h3>

          <p class="hadits-translation">
            {{
              selected.terjemah ||
              "Terjemahan belum tersedia dalam data."
            }}
          </p>

        </section>

        <!-- =================================
             CATATAN
        ================================== -->

        <section
          v-if="selected.catatan"
          class="hadits-section"
        >

          <h3 class="hadits-section-title">
            Penjelasan
          </h3>

          <p class="hadits-translation">
            {{ selected.catatan }}
          </p>

        </section>

        <!-- =================================
             RUJUKAN
        ================================== -->

        <section class="hadits-section">

          <h3 class="hadits-section-title">
            Rujukan
          </h3>

          <div class="hadits-reference">
            {{ selected.sumber || "Rujukan belum tersedia." }}
          </div>

          <a
            v-if="selected.url"
            class="hadits-source-link"
            :href="selected.url"
            target="_blank"
            rel="noopener noreferrer"
          >
            Baca sumber →
          </a>

        </section>

        <!-- =================================
             NAVIGASI
        ================================== -->

        <footer class="hadits-detail-actions">

          <button
            class="btn hadits-nav-btn"
            type="button"
            @click="move(-1)"
          >
            ← Sebelumnya
          </button>

          <button
            class="btn primary hadits-nav-btn"
            type="button"
            @click="closeHadits"
          >
            Tutup
          </button>

          <button
            class="btn hadits-nav-btn"
            type="button"
            @click="move(1)"
          >
            Berikutnya →
          </button>

        </footer>

      </article>

    </div>

  </section>
</template>

<style scoped>
/* =========================================
   PAGE
========================================= */

.hadits-page {
  width: 100%;
  max-width: 1100px;
  min-width: 0;
  margin: 0 auto;
}

.hadits-header {
  margin-bottom: 1rem;
}

.hadits-intro {
  margin: -.3rem 0 1rem;
  line-height: 1.7;
}

/* =========================================
   SEARCH
========================================= */

.hadits-search {
  position: relative;
  width: 100%;
  min-width: 0;
  margin-bottom: .6rem;
}

.hadits-search .input {
  width: 100%;
  box-sizing: border-box;
  padding-right: 3rem;
}

.hadits-clear {
  position: absolute;
  top: 50%;
  right: .35rem;
  transform: translateY(-50%);

  width: 42px;
  height: 42px;

  border: 0;
  background: transparent;
  color: var(--muted);

  cursor: pointer;
}

.hadits-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: .5rem;

  margin: .4rem 0 .9rem;
  font-size: .85rem;
}

.hadits-error {
  margin: .4rem 0 .8rem;
  font-size: .8rem;
  line-height: 1.6;
}

.hadits-loading {
  font-size: .8rem;
}

/* =========================================
   LIST GRID
========================================= */

.hadits-list {
  display: grid;

  grid-template-columns:
    repeat(
      auto-fill,
      minmax(min(100%, 310px), 1fr)
    );

  gap: .85rem;
  min-width: 0;
}

/* =========================================
   CARD

   Card hanya menampilkan nomor,
   judul dan perawi.
========================================= */

.hadits-card {
  width: 100%;
  min-width: 0;

  min-height: 105px;
  height: auto;

  padding: 1.15rem;

  box-sizing: border-box;

  display: flex;
  flex-direction: row;
  align-items: flex-start;

  gap: 1rem;

  text-align: left;
  font: inherit;

  cursor: pointer;
}

/* NOMOR */

.hadits-number {
  flex: 0 0 2.8rem;

  width: 2.8rem;
  height: 2.8rem;

  display: flex;
  align-items: center;
  justify-content: center;
}

/* AREA JUDUL DAN PERAWI */

.hadits-meta {
  flex: 1 1 auto;

  width: 0;
  min-width: 0;

  display: flex;
  flex-direction: column;
  align-items: flex-start;

  gap: .5rem;
}

/* =========================================
   JUDUL

   Override CSS global card surah.
   Judul tidak dipotong.
========================================= */

.hadits-card .meta strong.hadits-title {
  display: block !important;

  width: 100% !important;
  height: auto !important;
  max-height: none !important;

  font-size: 1rem;
  font-weight: 700;
  line-height: 1.65;

  white-space: normal !important;

  overflow: visible !important;
  text-overflow: clip !important;

  overflow-wrap: anywhere;
  word-break: normal;

  -webkit-line-clamp: unset !important;
  line-clamp: unset !important;
  -webkit-box-orient: unset !important;
}

/* =========================================
   PERAWI
========================================= */

.hadits-card .hadits-perawi {
  display: block !important;

  width: 100% !important;
  height: auto !important;
  max-height: none !important;

  color: var(--muted);

  font-size: .8rem;
  line-height: 1.6;

  white-space: normal !important;

  overflow: visible !important;
  text-overflow: clip !important;

  overflow-wrap: anywhere;
}

/* CARD HOVER */

.hadits-card:hover {
  border-color: var(--primary);
}

.hadits-card:active {
  transform: scale(.98);
}

/* EMPTY */

.hadits-empty {
  padding: 1.2rem;
  text-align: center;
}

/* =========================================
   OVERLAY
========================================= */

.hadits-overlay {
  position: fixed;
  z-index: 100;

  inset: 0;

  display: grid;
  place-items: center;

  padding: 12px;

  box-sizing: border-box;

  overflow: hidden;

  background: rgba(0, 0, 0, .5);
}

/* =========================================
   MODAL
========================================= */

.hadits-detail {
  position: relative;

  width: min(100%, 780px);

  height: min(94dvh, 100%);
  max-height: 94dvh;

  min-height: 0;

  overflow-y: auto;
  overflow-x: hidden;

  overscroll-behavior: contain;

  scrollbar-width: none;
  -ms-overflow-style: none;

  background: var(--surface);
  color: var(--text);

  border: 1px solid var(--border);
  border-radius: 22px;

  padding: 1.2rem;

  box-sizing: border-box;
}

.hadits-detail::-webkit-scrollbar {
  display: none;
}

.hadits-detail,
.hadits-detail * {
  min-width: 0;
  box-sizing: border-box;
}

/* =========================================
   CLOSE BUTTON
========================================= */

.hadits-close {
  position: sticky;

  float: right;

  top: 0;
  z-index: 5;

  width: 40px;
  height: 40px;

  border: 0;
  border-radius: 50%;

  background: var(--primary-soft);
  color: var(--text);

  cursor: pointer;
}

/* =========================================
   HEADER MODAL
========================================= */

.hadits-detail-header {
  padding: .2rem 2.6rem .8rem 0;
}

.hadits-label {
  color: var(--muted);
  font-size: .85rem;
  line-height: 1.6;
}

.hadits-detail-header h2 {
  margin: .5rem 0;

  font-size: 1.35rem;
  line-height: 1.7;

  white-space: normal;
  overflow-wrap: anywhere;
}

.hadits-detail-perawi {
  font-size: .85rem;
  line-height: 1.7;
}

/* =========================================
   SECTION TITLE
========================================= */

.hadits-section-title {
  margin: 1.1rem 0 .6rem;

  color: var(--primary);

  font-size: 1rem;
  font-weight: 700;
  line-height: 1.6;
}

/* =========================================
   ARABIC TEXT
========================================= */

.hadits-arab-box {
  width: 100%;
  min-width: 0;
}

.hadits-arab {
  width: 100%;

  padding: 1.1rem;

  margin: .5rem 0 1.3rem;

  background: var(--primary-soft);

  border-radius: 14px;

  font-size: clamp(1.6rem, 4vw, 2.2rem);
  line-height: 2.15;

  text-align: right;

  white-space: normal;
  overflow-wrap: anywhere;
  word-break: normal;
}

/* =========================================
   TRANSLATION

   RATA KANAN KIRI
========================================= */

.hadits-section {
  width: 100%;
  min-width: 0;
}

.hadits-translation {
  margin: .4rem 0;

  font-size: 1rem;
  line-height: 1.9;

  text-align: justify;
  text-justify: inter-word;

  white-space: normal;
  overflow-wrap: anywhere;
  word-break: normal;
}

/* =========================================
   REFERENCE
========================================= */

.hadits-reference {
  width: 100%;

  padding: .8rem;

  margin: .4rem 0;

  border: 1px solid var(--border);
  border-radius: 12px;

  font-size: .9rem;
  line-height: 1.7;

  overflow-wrap: anywhere;
}

.hadits-source-link {
  display: inline-block;

  margin-top: .6rem;

  color: var(--primary);

  font-size: .9rem;
  font-weight: 600;

  text-decoration: none;
}

.hadits-source-link:hover {
  text-decoration: underline;
}

/* =========================================
   NAVIGATION BUTTONS
========================================= */

.hadits-detail-actions {
  display: flex;

  flex-wrap: wrap;

  justify-content: space-between;

  gap: .5rem;

  margin-top: 1.5rem;
}

.hadits-nav-btn {
  flex: 1 1 0;
  min-width: 95px;
}

/* =========================================
   MOBILE
========================================= */

@media (max-width: 480px) {
  .hadits-list {
    grid-template-columns: minmax(0, 1fr);
  }

  .hadits-card {
    min-height: 100px;

    gap: .7rem;
    padding: 1rem;
  }

  .hadits-card .num {
    width: 2.6rem;
    height: 2.6rem;
  }

  .hadits-card .meta strong.hadits-title {
    font-size: .98rem;
    line-height: 1.65;
  }

  .hadits-card .hadits-perawi {
    font-size: .75rem;
  }

  .hadits-overlay {
    padding: 7px;
  }

  .hadits-detail {
    width: 100%;

    height: 96dvh;
    max-height: 96dvh;

    padding: .9rem;

    border-radius: 17px;
  }

  .hadits-detail-header h2 {
    font-size: 1.2rem;
  }

  .hadits-arab {
    padding: .85rem;

    font-size: 1.65rem;
    line-height: 2;
  }

  .hadits-translation {
    font-size: .95rem;
    line-height: 1.85;
  }

  .hadits-detail-actions {
    gap: .4rem;
  }

  .hadits-nav-btn {
    min-width: 0;

    padding: .65rem .45rem;

    font-size: .8rem;
  }
}

/* =========================================
   HP KECIL
========================================= */

@media (max-width: 360px) {
  .hadits-card {
    gap: .55rem;
    padding: .85rem;
  }

  .hadits-number {
    flex-basis: 2.35rem;

    width: 2.35rem;
    height: 2.35rem;
  }

  .hadits-card .meta strong.hadits-title {
    font-size: .92rem;
  }

  .hadits-card .hadits-perawi {
    font-size: .72rem;
  }

  .hadits-detail-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .hadits-detail-actions .hadits-nav-btn:nth-child(2) {
    grid-column: 1 / -1;
    grid-row: 1;
  }
}
</style>