<script setup>
import { computed, onMounted, ref } from "vue";
import { HADITS_POPULER } from "../data/haditsData.js";

const mode = ref("arbain");
const query = ref("");
const arbain = ref([]);
const loading = ref(false);
const error = ref("");
const selected = ref(null);

const API_ARBain = "https://api.myquran.com/v2/hadis/arbain/all";

function pick(obj, keys, fallback = "") {
  for (const key of keys) {
    const value = obj?.[key];

    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  return fallback;
}

function normalizeArbain(item, index) {
  const data =
    item?.data && !Array.isArray(item.data)
      ? item.data
      : item;

  return {
    id: `arbain-${pick(data, ["nomor", "no", "number", "id"], index + 1)}`,

    nomor: Number(
      pick(data, ["nomor", "no", "number", "id"], index + 1)
    ),

    judul: pick(
      data,
      ["judul", "title", "nama", "name"],
      `Hadits Arbain ke-${index + 1}`
    ),

    arab: pick(
      data,
      ["arab", "arabic", "teksArab", "text_ar", "hadis"],
      ""
    ),

    terjemah: pick(
      data,
      ["terjemah", "indonesia", "translation", "arti", "text_id"],
      ""
    ),

    sumber: pick(
      data,
      ["sumber", "referensi", "reference", "kitab"],
      "Hadits Arbain Nawawi"
    ),

    catatan: pick(
      data,
      ["keterangan", "penjelasan", "description", "syarah"],
      ""
    ),

    raw: data,
  };
}

async function loadArbain() {
  loading.value = true;
  error.value = "";

  try {
    const response = await fetch(API_ARBain, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API hadits merespons ${response.status}`);
    }

    const json = await response.json();

    if (json?.status === false) {
      throw new Error(json.message || "Data hadits tidak tersedia.");
    }

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
      throw new Error("Format data Arbain dari API belum dikenali.");
    }

    arbain.value = list
      .map(normalizeArbain)
      .sort((a, b) => a.nomor - b.nomor);
  } catch (err) {
    error.value = `${err.message}. Periksa koneksi internet atau coba lagi.`;
  } finally {
    loading.value = false;
  }
}

onMounted(loadArbain);

const currentList = computed(() => {
  return mode.value === "arbain"
    ? arbain.value
    : HADITS_POPULER;
});

const filtered = computed(() => {
  const q = query.value.trim().toLocaleLowerCase("id");

  if (!q) {
    return currentList.value;
  }

  return currentList.value.filter((h) =>
    `${h.nomor} ${h.judul} ${h.arab} ${h.terjemah} ${h.sumber} ${h.catatan}`
      .toLocaleLowerCase("id")
      .includes(q)
  );
});

function openHadits(h) {
  selected.value = h;
}

function closeHadits() {
  selected.value = null;
}

function move(delta) {
  if (!selected.value) return;

  const index = currentList.value.findIndex(
    (h) => h.id === selected.value.id
  );

  if (index < 0 || !currentList.value.length) return;

  const nextIndex =
    (index + delta + currentList.value.length) %
    currentList.value.length;

  selected.value = currentList.value[nextIndex];
}

function switchMode(value) {
  mode.value = value;
  query.value = "";
  selected.value = null;

  if (
    value === "arbain" &&
    !arbain.value.length &&
    !loading.value
  ) {
    loadArbain();
  }
}
</script>

<template>
  <section class="hadits-page">
    <h1>Hadits</h1>

    <p class="muted hadits-intro">
      Pelajari hadits Rasulullah ﷺ, baca teks, terjemahan,
      dan rujukannya.
    </p>

    <!-- KATEGORI -->
    <div
      class="hadits-tabs chips"
      role="group"
      aria-label="Kategori hadits"
    >
      <button
        class="chip"
        :class="{ on: mode === 'arbain' }"
        :aria-pressed="mode === 'arbain'"
        @click="switchMode('arbain')"
      >
        Arbain Nawawi (42)
      </button>

      <button
        class="chip"
        :class="{ on: mode === 'populer' }"
        :aria-pressed="mode === 'populer'"
        @click="switchMode('populer')"
      >
        Hadits Populer Shahih
      </button>
    </div>

    <!-- PENCARIAN -->
    <div class="search hadits-search">
      <input
        v-model="query"
        class="input"
        type="search"
        :placeholder="
          mode === 'arbain'
            ? 'Cari hadits Arbain...'
            : 'Cari hadits populer...'
        "
        aria-label="Cari hadits"
      />

      <button
        v-if="query"
        class="clear"
        aria-label="Hapus pencarian"
        @click="query = ''"
      >
        ✕
      </button>
    </div>

    <p class="muted hadits-count">
      {{
        loading
          ? "Memuat data..."
          : `Menampilkan ${filtered.length} hadits`
      }}
    </p>

    <!-- LOADING -->
    <div
      v-if="loading"
      class="card hadits-message"
    >
      Memuat 42 Hadits Arbain Nawawi…
    </div>

    <!-- ERROR -->
    <div
      v-else-if="error && mode === 'arbain'"
      class="card hadits-message"
    >
      <p>{{ error }}</p>

      <button
        class="btn primary"
        @click="loadArbain"
      >
        Coba lagi
      </button>
    </div>

    <!-- LIST HADITS -->
    <div
      v-else
      class="hadits-list"
    >
      <button
        v-for="h in filtered"
        :key="h.id"
        class="card surah-card hadits-card"
        type="button"
        @click="openHadits(h)"
      >
        <span class="num hadits-number">
          {{ h.nomor }}
        </span>

        <span class="meta hadits-meta">
          <strong class="hadits-title">
            {{ h.judul }}
          </strong>

          <small class="hadits-source">
            {{
              h.sumber ||
              (mode === "arbain"
                ? "Hadits Arbain Nawawi"
                : "Hadits Shahih")
            }}
          </small>
        </span>

        <span
          class="arab-name hadits-card-arab"
          dir="rtl"
          lang="ar"
        >
          {{
            h.arab
              ? h.arab.slice(0, 50) +
                (h.arab.length > 50 ? "…" : "")
              : "حديث"
          }}
        </span>
      </button>

      <div
        v-if="!filtered.length"
        class="card hadits-message"
      >
        Hadits tidak ditemukan. Coba kata kunci lain.
      </div>
    </div>

    <p class="hadits-note muted">
      Hadits populer ditampilkan beserta rujukan kitab.
      Untuk Arbain, data dimuat dari API MyQuran;
      koneksi internet diperlukan.
    </p>

    <!-- DETAIL HADITS -->
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
        <button
          class="hadits-close"
          type="button"
          aria-label="Tutup"
          @click="closeHadits"
        >
          ✕
        </button>

        <header class="hadits-detail-header">
          <span class="hadits-label">
            {{
              mode === "arbain"
                ? "Arbain Nawawi"
                : "Hadits Populer Shahih"
            }}
            · Hadits {{ selected.nomor }}
          </span>

          <h2>{{ selected.judul }}</h2>
        </header>

        <!-- ARAB -->
        <div
          class="hadits-arab"
          dir="rtl"
          lang="ar"
        >
          {{
            selected.arab ||
            "Teks Arab tidak tersedia dari sumber."
          }}
        </div>

        <!-- TERJEMAH -->
        <h3>Terjemahan</h3>

        <p class="hadits-translation">
          {{
            selected.terjemah ||
            "Terjemahan tidak tersedia dari sumber API."
          }}
        </p>

        <!-- PENJELASAN -->
        <template v-if="selected.catatan">
          <h3>Penjelasan singkat</h3>

          <p class="hadits-translation">
            {{ selected.catatan }}
          </p>
        </template>

        <!-- SUMBER -->
        <h3>Rujukan</h3>

        <p class="hadits-reference">
          {{
            selected.sumber ||
            "Arbain Nawawi"
          }}
        </p>

        <!-- NAVIGASI -->
        <div class="hadits-detail-actions">
          <button
            class="btn"
            type="button"
            @click="move(-1)"
          >
            ← Sebelumnya
          </button>

          <button
            class="btn primary"
            type="button"
            @click="closeHadits"
          >
            Tutup
          </button>

          <button
            class="btn"
            type="button"
            @click="move(1)"
          >
            Berikutnya →
          </button>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.hadits-page {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  min-width: 0;
}

.hadits-intro {
  margin: -.3rem 0 1rem;
  line-height: 1.6;
}

.hadits-tabs {
  margin: .7rem 0 1rem;
  display: flex;
  gap: .5rem;
  flex-wrap: wrap;
}

.hadits-search {
  position: relative;
  margin: 0 0 .5rem;
  min-width: 0;
}

.hadits-search .input {
  width: 100%;
  box-sizing: border-box;
  padding-right: 3rem;
}

.hadits-search .clear {
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
}

.hadits-count {
  font-size: .85rem;
  margin: .3rem 0 .8rem;
}

/* LIST CARD */
.hadits-list {
  display: grid;
  gap: .85rem;
  grid-template-columns:
    repeat(auto-fill, minmax(min(100%, 310px), 1fr));
  min-width: 0;
}

.hadits-card {
  width: 100%;
  min-width: 0;
  min-height: 125px;
  height: auto;
  box-sizing: border-box;
  text-align: left;
  font: inherit;
  cursor: pointer;

  /* Card diperbesar */
  padding: 1.15rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

/* Nomor */
.hadits-number {
  flex: 0 0 2.8rem;
  width: 2.8rem;
  height: 2.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Area judul dan sumber */
.hadits-meta {
  flex: 1 1 auto;
  min-width: 0;
  width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: .55rem;
}

/* JUDUL - TIDAK DIPOTONG */
.hadits-card .hadits-title {
  display: block;
  width: 100%;
  min-width: 0;

  font-size: 1rem;
  font-weight: 700;
  line-height: 1.65;

  white-space: normal;
  overflow: visible;
  text-overflow: clip;

  overflow-wrap: anywhere;
  word-break: normal;

  height: auto;
  max-height: none;

  -webkit-line-clamp: unset;
  line-clamp: unset;
  -webkit-box-orient: unset;
}

/* SUMBER */
.hadits-card .hadits-source {
  display: block;
  width: 100%;
  color: var(--muted);

  font-size: .78rem;
  line-height: 1.5;

  white-space: normal;
  overflow: visible;
  text-overflow: clip;
  overflow-wrap: anywhere;
}

/* TEKS ARAB DI CARD */
.hadits-card-arab {
  flex: 0 0 auto;
  width: auto;
  max-width: 25%;
  font-size: 1.3rem;
  line-height: 1.7;

  overflow: visible;
  white-space: normal;
  overflow-wrap: anywhere;

  text-align: right;
}

/* Hover */
.hadits-card:hover {
  border-color: var(--primary);
}

.hadits-card:active {
  transform: scale(.98);
}

.hadits-message {
  padding: 1rem;
  text-align: center;
}

.hadits-note {
  margin-top: 1rem;
  font-size: .8rem;
  line-height: 1.6;
}

/* MODAL */
.hadits-overlay {
  position: fixed;
  z-index: 70;
  inset: 0;
  background: rgba(0, 0, 0, .5);
  display: grid;
  place-items: center;
  padding: 12px;
  box-sizing: border-box;
  overflow: hidden;
}

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

.hadits-close {
  position: sticky;
  float: right;
  top: 0;
  z-index: 2;

  border: 0;
  border-radius: 50%;
  width: 40px;
  height: 40px;

  background: var(--primary-soft);
  color: var(--text);
  cursor: pointer;
}

.hadits-detail-header {
  padding: .2rem 2.6rem .7rem 0;
}

.hadits-label {
  color: var(--muted);
  font-size: .85rem;
}

.hadits-detail-header h2 {
  margin: .45rem 0;
  font-size: 1.3rem;
  line-height: 1.7;

  overflow-wrap: anywhere;
  word-break: normal;
}

.hadits-arab {
  font-size: clamp(1.6rem, 4vw, 2.2rem);
  line-height: 2.1;
  text-align: right;
  padding: 1rem;
  margin: .5rem 0 1.3rem;

  background: var(--primary-soft);
  border-radius: 14px;

  overflow-wrap: anywhere;
}

.hadits-detail h3 {
  font-size: 1rem;
  color: var(--primary);
  margin: 1.1rem 0 .5rem;
}

.hadits-translation,
.hadits-reference {
  line-height: 1.85;
  text-align: justify;
  text-justify: inter-word;

  overflow-wrap: anywhere;
  margin: .4rem 0;
}

.hadits-reference {
  padding: .8rem;
  border: 1px solid var(--border);
  border-radius: 12px;
}

.hadits-detail-actions {
  display: flex;
  gap: .5rem;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-top: 1.4rem;
}

.hadits-detail-actions .btn {
  flex: 1;
  min-width: 95px;
}

/* MOBILE */
@media (max-width: 480px) {
  .hadits-list {
    grid-template-columns: minmax(0, 1fr);
  }

  .hadits-card {
    min-height: 115px;
    gap: .7rem;
    padding: 1rem;
  }

  .hadits-card .num {
    width: 2.6rem;
    height: 2.6rem;
  }

  .hadits-meta {
    gap: .45rem;
  }

  .hadits-card .hadits-title {
    font-size: .98rem;
    line-height: 1.65;
  }

  .hadits-card .hadits-source {
    font-size: .75rem;
  }

  .hadits-card-arab {
    font-size: 1.05rem;
    max-width: 23%;
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

  .hadits-detail-actions {
    gap: .4rem;
  }

  .hadits-detail-actions .btn {
    font-size: .8rem;
    padding: .65rem .5rem;
  }
}

/* HP SANGAT KECIL */
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

  .hadits-card-arab {
    max-width: 20%;
    font-size: .95rem;
  }

  .hadits-card .hadits-title {
    font-size: .92rem;
  }
}
</style>