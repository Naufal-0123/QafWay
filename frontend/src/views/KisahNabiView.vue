<script setup>
import { computed, ref } from 'vue'
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
    `${n.no} ${n.nama} ${n.ringkasan} ${n.referensi}`
      .toLocaleLowerCase('id')
      .includes(q)
  )
})

function open(no) {
  selectedNo.value = no
}

function close() {
  selectedNo.value = null
}

function step(delta) {
  if (!selected.value) return

  selectedNo.value =
    ((selected.value.no - 1 + delta + KISAH_NABI.length) %
      KISAH_NABI.length) + 1
}
</script>

<template>
  <section class="kisah-page">
    <h1>25 Nabi dan Rasul</h1>

    <p class="muted intro">
      Kenali kisah para nabi, teladani akhlaknya,
      dan baca rujukan ayat Al-Qur’an.
    </p>

    <!-- Pencarian -->
    <div class="kisah-search">
      <input
        v-model="query"
        class="input"
        type="search"
        placeholder="Cari nama nabi atau kata dalam kisah…"
        aria-label="Cari kisah nabi"
      />

      <button
        v-if="query"
        type="button"
        class="clear-search"
        aria-label="Hapus pencarian"
        @click="query = ''"
      >
        ✕
      </button>
    </div>

    <p class="muted count">
      Menampilkan {{ filtered.length }} dari 25 nabi
    </p>

    <!-- Daftar nabi -->
    <div class="kisah-list">
      <button
        v-for="n in filtered"
        :key="n.no"
        type="button"
        class="card kisah-card"
        @click="open(n.no)"
      >
        <span class="kisah-number">
          {{ String(n.no).padStart(2, '0') }}
        </span>

        <span class="kisah-content">
          <strong>{{ n.nama }}</strong>
          <small>{{ n.ringkasan }}</small>
        </span>

        <span class="kisah-arrow" aria-hidden="true">
          ›
        </span>
      </button>
    </div>

    <p class="note muted">
      Catatan: kisah disajikan sebagai ringkasan.
      Rujukan ayat dapat dibaca untuk memahami konteks lengkapnya.
      Rincian yang tidak disebutkan secara jelas dalam Al-Qur’an
      tidak dipastikan.
    </p>

    <!-- Detail cerita -->
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
        <button
          type="button"
          class="kisah-close"
          aria-label="Tutup"
          @click="close"
        >
          ✕
        </button>

        <div class="detail-top">
          <span class="kisah-number large">
            {{ String(selected.no).padStart(2, '0') }}
          </span>

          <span class="muted">
            Nabi ke-{{ selected.no }} dari 25
          </span>
        </div>

        <h2>{{ selected.nama }}</h2>

        <p class="detail-summary">
          {{ selected.ringkasan }}
        </p>

        <h3>Kisah</h3>

        <p class="story-text">
          {{ selected.kisah }}
        </p>

        <h3>Hikmah yang dapat dipetik</h3>

        <ul class="lessons">
          <li
            v-for="(lesson, i) in selected.hikmah"
            :key="i"
          >
            {{ lesson }}
          </li>
        </ul>

        <h3>Rujukan Al-Qur’an</h3>

        <p class="references">
          {{ selected.referensi }}
        </p>

        <!-- Navigasi cerita -->
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
.intro {
  margin: -.4rem 0 1rem;
}

.kisah-search {
  position: relative;
  margin: 1rem 0 .5rem;
}

.kisah-search input {
  padding-right: 3rem;
}

.clear-search {
  position: absolute;
  right: .45rem;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border: 0;
  border-radius: 50%;
  color: var(--muted);
  background: transparent;
  cursor: pointer;
}

.count {
  font-size: .85rem;
  margin: .3rem 0 .8rem;
}

.kisah-list {
  display: grid;
  gap: .65rem;
}

.kisah-card {
  display: flex;
  align-items: center;
  gap: .9rem;
  width: 100%;
  margin: 0;
  padding: 1rem;
  color: var(--text);
  text-align: left;
  font: inherit;
  cursor: pointer;
  transition: border-color .15s, transform .15s;
}

.kisah-card:hover {
  border-color: var(--primary);
}

.kisah-card:active {
  transform: scale(.99);
}

.kisah-number {
  display: grid;
  place-items: center;
  flex: 0 0 2.65rem;
  height: 2.65rem;
  border-radius: 13px;
  color: var(--primary);
  background: var(--primary-soft);
  font-weight: 700;
  font-size: .9rem;
}

.kisah-number.large {
  flex-basis: 3rem;
  height: 3rem;
  font-size: 1rem;
}

.kisah-content {
  min-width: 0;
  display: grid;
  gap: .2rem;
  flex: 1;
}

.kisah-content strong {
  font-size: .98rem;
}

.kisah-content small {
  font-size: .82rem;
  line-height: 1.5;
  color: var(--muted);
}

.kisah-arrow {
  color: var(--muted);
  font-size: 1.5rem;
}

.kisah-overlay {
  position: fixed;
  z-index: 60;
  inset: 0;
  background: rgba(0, 0, 0, .48);
  display: grid;
  place-items: end center;
  padding: 0;
}

.kisah-sheet {
  position: relative;
  background: var(--surface);
  color: var(--text);
  width: min(100%, 760px);
  max-height: 92dvh;
  overflow: auto;
  border: 1px solid var(--border);
  border-radius: 22px 22px 0 0;
  padding: 1.2rem 1.2rem
    calc(1.2rem + env(safe-area-inset-bottom, 0px));
}

@media (min-width: 700px) {
  .kisah-overlay {
    padding: 1rem;
    place-items: center;
  }

  .kisah-sheet {
    border-radius: 22px;
    max-height: 88dvh;
  }
}

.kisah-close {
  position: sticky;
  float: right;
  top: 0;
  z-index: 1;
  border: 0;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  background: var(--bg);
  color: var(--muted);
  cursor: pointer;
}

.detail-top {
  display: flex;
  align-items: center;
  gap: .7rem;
  margin: .2rem 0 .5rem;
}

.kisah-sheet h2 {
  margin: .3rem 0 .5rem;
  font-size: 1.45rem;
}

.kisah-sheet h3 {
  margin: 1.2rem 0 .4rem;
  font-size: 1rem;
  color: var(--primary);
}

.detail-summary {
  margin: 0;
  padding: .8rem;
  background: var(--primary-soft);
  border-radius: 14px;
}

.story-text {
  line-height: 1.85;
  white-space: pre-line;
}

.lessons {
  padding-left: 1.3rem;
  margin: .4rem 0;
}

.lessons li {
  margin: .45rem 0;
}

.references {
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: .8rem;
  margin: .3rem 0;
  font-size: .9rem;
}

.detail-actions {
  display: flex;
  justify-content: space-between;
  gap: .5rem;
  flex-wrap: wrap;
  margin-top: 1.3rem;
}

.detail-actions .btn {
  flex: 1;
  min-width: 100px;
}

.note {
  font-size: .8rem;
}
</style>