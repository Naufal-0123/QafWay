<script setup>
import { computed, onMounted, ref } from "vue";
import { HADITS_ARBAIN } from "../data/haditsData.js";

const mode = ref("arbain");
const query = ref("");
const arbain = ref([...HADITS_ARBAIN]);
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

/* Normalisasi data API, terjemahan tetap menggunakan data lokal */
function normalizeArbain(item, index) {
  const data =
    item?.data && !Array.isArray(item.data)
      ? item.data
      : item;

  const nomor = Number(
    pick(data, ["nomor", "no", "number"], index + 1)
  );

  const local =
    HADITS_ARBAIN.find((h) => Number(h.nomor) === nomor) || {};

  return {
    ...local,
    id: local.id || `arbain-${nomor}`,
    nomor,
    judul:
      local.judul ||
      pick(data, ["judul", "title", "nama", "name"], `Hadits ${nomor}`),

    arab:
      pick(
        data,
        ["arab", "arabic", "teksArab", "text_ar", "hadis"],
        ""
      ) || local.arab || "",

    /* Prioritaskan terjemahan lokal */
    terjemah:
      local.terjemah ||
      pick(
        data,
        ["terjemah", "indonesia", "translation", "arti", "text_id"],
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
    perawi: local.perawi || "",
    raw: data,
  };
}

async function loadArbain() {
  loading.value = true;
  error.value = "";

  /* Data lokal langsung tersedia meskipun API belum selesai */
  arbain.value = HADITS_ARBAIN.map((h) => ({ ...h }));

  try {
    const response = await fetch(API_ARBain, {
      headers: { Accept: "application/json" },
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
      apiMap.set(normalized.nomor, normalized);
    });

    /* Gabungkan Arab dari API dan isi lokal */
    arbain.value = HADITS_ARBAIN.map((local, index) => {
      const api = apiMap.get(Number(local.nomor));

      return {
        ...local,
        id: local.id || `arbain-${index + 1}`,
        nomor: Number(local.nomor),
        judul: local.judul,
        perawi: local.perawi || api?.perawi || "",
        arab: api?.arab || local.arab || "",
        terjemah: local.terjemah || api?.terjemah || "",
        sumber: local.sumber || api?.sumber || "Hadits Arbain Nawawi",
        catatan: local.catatan || api?.catatan || "",
      };
    }).sort((a, b) => a.nomor - b.nomor);

  } catch (err) {
    /* API gagal, data lokal tetap bisa digunakan */
    arbain.value = HADITS_ARBAIN.map((h) => ({ ...h }));

    error.value =
      "Teks Arab tambahan tidak dapat dimuat. Data lokal tetap ditampilkan.";
  } finally {
    loading.value = false;
  }
}

onMounted(loadArbain);

const currentList = computed(() =>
  mode.value === "arbain"
    ? arbain.value
    : HADITS_POPULER
);

const filtered = computed(() => {
  const q = query.value.trim().toLocaleLowerCase("id");

  if (!q) return currentList.value;

  return currentList.value.filter((h) =>
    [
      h.nomor,
      h.judul,
      h.arab,
      h.terjemah,
      h.sumber,
      h.perawi,
      h.catatan,
    ]
      .join(" ")
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

  if (index < 0 || currentList.value.length === 0) return;

  const next =
    (index + delta + currentList.value.length) %
    currentList.value.length;

  selected.value = currentList.value[next];
}

function switchMode(value) {
  mode.value = value;
  query.value = "";
  selected.value = null;
}
</script>

<template>
  <section class="hadits-page">
    <h1>Hadits</h1>

    <p class="muted hadits-intro">
      Pelajari hadits Rasulullah ﷺ, baca teks Arab,
      terjemahan, dan rujukannya.
    </p>

    <!-- KATEGORI -->
    <div class="hadits-tabs chips">
      <button
        class="chip"
        :class="{ on: mode === 'arbain' }"
        @click="switchMode('arbain')"
      >
        Arbain Nawawi (42)
      </button>

      <button
        class="chip"
        :class="{ on: mode === 'populer' }"
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
      Menampilkan {{ filtered.length }} hadits
    </p>

    <!-- STATUS -->
    <div
      v-if="loading && mode === 'arbain'"
      class="hadits-status muted"
    >
      Memperbarui teks Arab...
    </div>

    <div
      v-if="error && mode === 'arbain'"
      class="hadits-status muted"
    >
      {{ error }}
    </div>

    <!-- LIST -->
    <div class="hadits-list">
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
            {{ h.sumber || "Hadits" }}
          </small>
        </span>

        <span
          class="arab-name hadits-card-arab"
          dir="rtl"
          lang="ar"
        >
          {{ h.arab || "حديث" }}
        </span>
      </button>

      <div
        v-if="!filtered.length"
        class="card hadits-message"
      >
        Hadits tidak ditemukan.
      </div>
    </div>

    <!-- DETAIL -->
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
                : "Hadits Populer"
            }}
            · Hadits {{ selected.nomor }}
          </span>

          <h2>{{ selected.judul }}</h2>

          <p
            v-if="selected.perawi"
            class="hadits-perawi muted"
          >
            Perawi: {{ selected.perawi }}
          </p>
        </header>

        <!-- ARAB -->
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

        <!-- TERJEMAHAN -->
        <h3>Terjemahan</h3>

        <p class="hadits-translation">
          {{
            selected.terjemah ||
            "Terjemahan belum tersedia dalam data."
          }}
        </p>

        <!-- CATATAN -->
        <template v-if="selected.catatan">
          <h3>Penjelasan</h3>

          <p class="hadits-translation">
            {{ selected.catatan }}
          </p>
        </template>

        <!-- RUJUKAN -->
        <h3>Rujukan</h3>

        <p class="hadits-reference">
          {{ selected.sumber || "Rujukan belum tersedia." }}
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
  min-width: 0;
  margin: 0 auto;
}

.hadits-intro {
  margin: -.3rem 0 1rem;
  line-height: 1.7;
}

.hadits-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: .5rem;
  margin: .7rem 0 1rem;
}

.hadits-search {
  position: relative;
  min-width: 0;
  margin-bottom: .5rem;
}

.hadits-search .input {
  width: 100%;
  box-sizing: border-box;
  padding-right: 3rem;
}

.hadits-search .clear {
  position: absolute;
  top: 50%;
  right: .35rem;
  transform: translateY(-50%);
  min-width: 44px;
  min-height: 44px;
  border: 0;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
}

.hadits-count {
  margin: .3rem 0 .8rem;
  font-size: .85rem;
}

.hadits-status {
  margin: .5rem 0;
  font-size: .8rem;
}

/* CARD LIST */
.hadits-list {
  display: grid;
  grid-template-columns: repeat(
    auto-fill,
    minmax(min(100%, 310px), 1fr)
  );
  gap: .85rem;
  min-width: 0;
}

.hadits-card {
  width: 100%;
  min-width: 0;
  min-height: 125px;
  height: auto;
  padding: 1.15rem;
  box-sizing: border-box;

  display: flex;
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

/* AREA JUDUL */
.hadits-meta {
  flex: 1 1 auto;
  width: 0;
  min-width: 0;

  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: .5rem;
}

/* Override CSS global surah-card */
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

/* SUMBER */
.hadits-card .hadits-source {
  display: block !important;
  width: 100% !important;

  color: var(--muted);
  font-size: .78rem;
  line-height: 1.5;

  white-space: normal !important;
  overflow: visible !important;
  text-overflow: clip !important;
  overflow-wrap: anywhere;
}

/* ARAB CARD */
.hadits-card-arab {
  flex: 0 0 auto;
  max-width: 25%;
  font-size: 1.2rem;
  line-height: 1.7;
  text-align: right;

  white-space: normal;
  overflow: visible;
  overflow-wrap: anywhere;
}

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

/* MODAL */
.hadits-overlay {
  position: fixed;
  z-index: 70;
  inset: 0;

  display: grid;
  place-items: center;

  padding: 12px;
  box-sizing: border-box;
  overflow: hidden;

  background: rgba(0, 0, 0, .5);
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

  width: 40px;
  height: 40px;

  border: 0;
  border-radius: 50%;

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
  margin: .5rem 0;
  font-size: 1.35rem;
  line-height: 1.7;
  overflow-wrap: anywhere;
}

.hadits-perawi {
  font-size: .85rem;
}

.hadits-arab {
  padding: 1rem;
  margin: .5rem 0 1.3rem;

  background: var(--primary-soft);
  border-radius: 14px;

  font-size: clamp(1.6rem, 4vw, 2.2rem);
  line-height: 2.1;
  text-align: right;

  overflow-wrap: anywhere;
}

.hadits-detail h3 {
  margin: 1.1rem 0 .5rem;
  color: var(--primary);
  font-size: 1rem;
}

.hadits-translation,
.hadits-reference {
  margin: .4rem 0;
  line-height: 1.9;

  text-align: justify;
  text-justify: inter-word;
  overflow-wrap: anywhere;
}

.hadits-reference {
  padding: .8rem;
  border: 1px solid var(--border);
  border-radius: 12px;
}

.hadits-detail-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: .5rem;
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

  .hadits-card .meta strong.hadits-title {
    font-size: .98rem;
  }

  .hadits-card-arab {
    max-width: 23%;
    font-size: 1.05rem;
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
    padding: .65rem .5rem;
    font-size: .8rem;
  }
}

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

  .hadits-card .meta strong.hadits-title {
    font-size: .92rem;
  }
}
</style>