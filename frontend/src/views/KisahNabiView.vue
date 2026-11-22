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
    `${n.no} ${n.nama} ${n.ringkasan} ${n.kisah} ${n.referensi}`
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

  const index = KISAH_NABI.findIndex(
    (n) => n.no === selectedNo.value
  )

  const nextIndex =
    (index + delta + KISAH_NABI.length) % KISAH_NABI.length

  selectedNo.value = KISAH_NABI[nextIndex].no
}

/*
|--------------------------------------------------------------------------
| Ilustrasi Nabi
|--------------------------------------------------------------------------
| Menggunakan URL generator gambar online.
| Tidak perlu mengunduh atau menyimpan gambar.
| Ilustrasi dibuat tanpa menampilkan sosok nabi.
*/

const illustrationPrompts = {
  1: 'beautiful lush heavenly garden, flowing rivers, glowing soft light, symbolic first human creation story, no people',
  2: 'ancient peaceful landscape, beautiful mountains, sunrise, scroll and writing tools, wisdom and knowledge, no people',
  3: 'huge wooden ark on a mountain after a great flood, dramatic clouds clearing, water reflections, no people',
  4: 'ancient desert city of Aad, huge sandstone architecture, dramatic desert wind and clouds, no people',
  5: 'ancient Thamud rocky city, carved stone houses, desert landscape, camel standing peacefully, no people',
  6: 'ancient desert landscape, Kaaba construction with stone blocks, mountains, warm sunrise, no people',
  7: 'ancient city near the Dead Sea, abandoned stone buildings, dramatic desert landscape, no people',
  8: 'desert valley near Mecca, Zamzam water spring, ancient stone Kaaba, desert mountains, no people',
  9: 'beautiful ancient Canaan landscape, green hills, olive trees, peaceful sunrise, no people',
  10: 'ancient countryside with olive groves, desert hills, peaceful landscape, warm sunset, no people',
  11: 'ancient Egyptian palace, grain storage silos, wheat fields, golden sunlight, no people',
  12: 'quiet ancient village, green plants growing after rain, healing water spring, peaceful nature, no people',
  13: 'ancient Midian marketplace, stone buildings, balance scales, baskets of grain, no people',
  14: 'ancient Egypt, parted sea with towering walls of water, path across the sea, dramatic cinematic scene, no people',
  15: 'ancient Egypt desert landscape, mountain and glowing sunrise, scroll, peaceful atmosphere, no people',
  16: 'ancient desert kingdom, peaceful mountain landscape, beautiful sunrise, symbolic patience, no people',
  17: 'ancient Jerusalem, iron being shaped into armor, green mountains and birds, no people',
  18: 'ancient palace of Solomon, magnificent architecture, birds, distant mountains, symbolic wisdom, no people',
  19: 'ancient city of Nineveh, beautiful stone architecture, ship near coast, dramatic cloudy sky, no people',
  20: 'ancient desert landscape, burning bush glowing on a mountain, night sky, symbolic divine calling, no people',
  21: 'ancient desert palace, staffs on stone floor, glowing light, symbolic miracles, no people',
  22: 'ancient desert city, caravan, sandstone architecture, peaceful landscape, no people',
  23: 'ancient desert landscape, cave entrance, starry sky, symbolic revelation, no people',
  24: 'ancient city of Medina, palm trees, mosque architecture, bright peaceful sky, no people',
  25: 'ancient Mecca, Kaaba, mountains, sunrise, peaceful sacred atmosphere, no people'
}

function illustrationUrl(n, width = 1000, height = 700) {
  const prompt = [
    'Islamic historical storybook illustration,',
    'soft elegant watercolor and digital painting,',
    'warm cream and sage green palette,',
    'beautiful detailed scenery, cinematic lighting,',
    'respectful Islamic educational illustration,',
    'no prophets depicted, no human faces, no human figures,',
    illustrationPrompts[n.no] || 'beautiful ancient landscape'
  ].join(' ')

  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&seed=${n.no * 137}&nologo=true`
}

// Gambar cadangan apabila URL ilustrasi gagal dimuat
const fallbackImage =
  'https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=1000&q=80'

function onImageError(event) {
  const img = event.target

  if (img.dataset.fallback === 'true') return

  img.dataset.fallback = 'true'
  img.src = fallbackImage
}
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
    <div class="kisah-search">
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

    <!-- LIST NABI -->
    <div class="kisah-list">

      <button
        v-for="n in filtered"
        :key="n.no"
        type="button"
        class="card kisah-card"
        @click="open(n.no)"
      >

        <!-- BINTANG PENOMORAN -->
        <span class="kisah-star">
          <span>{{ n.no }}</span>
        </span>

        <!-- CONTENT -->
        <span class="kisah-content">
          <strong>{{ n.nama }}</strong>
          <small>{{ n.ringkasan }}</small>
        </span>

        <!-- THUMBNAIL ILUSTRASI -->
        <span class="kisah-thumbnail">
          <img
            :src="illustrationUrl(n, 400, 300)"
            :alt="`Ilustrasi kisah ${n.nama}`"
            loading="lazy"
            @error="onImageError"
          />
        </span>

        <span class="kisah-arrow" aria-hidden="true">
          ›
        </span>
      </button>

      <!-- EMPTY SEARCH -->
      <div v-if="filtered.length === 0" class="empty-state">
        <div class="empty-icon">🔎</div>
        <p>Nama atau kisah nabi tidak ditemukan.</p>
        <button
          class="btn"
          type="button"
          @click="query = ''"
        >
          Reset pencarian
        </button>
      </div>
    </div>

    <!-- CATATAN -->
    <p class="note muted">
      Kisah disajikan berdasarkan keterangan Al-Qur’an.
      Rincian yang tidak memiliki dasar kuat tidak dipastikan.
      Ilustrasi merupakan gambaran suasana, bukan penggambaran nabi.
    </p>

    <!-- DETAIL MODAL -->
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

        <!-- CLOSE BUTTON -->
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
            :src="illustrationUrl(selected, 1200, 800)"
            :alt="`Ilustrasi kisah ${selected.nama}`"
            @error="onImageError"
          />

          <div class="hero-overlay">
            <span class="hero-label">
              Kisah Nabi ke-{{ selected.no }} dari 25
            </span>

            <h2>{{ selected.nama }}</h2>
          </div>
        </div>

        <!-- DETAIL NUMBER -->
        <div class="detail-top">
          <span class="kisah-star large">
            <span>{{ selected.no }}</span>
          </span>

          <span class="muted">
            Nabi ke-{{ selected.no }} dari 25
          </span>
        </div>

        <!-- SUMMARY -->
        <div class="detail-summary">
          {{ selected.ringkasan }}
        </div>

        <!-- STORY -->
        <h3 class="section-title">
          📖 Kisah
        </h3>

        <div class="story-text">
          {{ selected.kisah }}
        </div>

        <!-- LESSONS -->
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

        <!-- REFERENCES -->
        <h3 class="section-title">
          📚 Rujukan Al-Qur’an
        </h3>

        <div class="references">
          {{ selected.referensi }}
        </div>

        <!-- NAVIGATION -->
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

/* =========================
   PAGE
========================= */

.kisah-page {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
}

.kisah-header h1 {
  margin-bottom: .4rem;
}

.intro {
  margin: -.3rem 0 1rem;
  line-height: 1.6;
}

/* =========================
   SEARCH
========================= */

.kisah-search {
  position: relative;
  margin: 1rem 0 .5rem;
}

.kisah-search input {
  width: 100%;
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

/* =========================
   LIST
========================= */

.kisah-list {
  display: grid;
  gap: .65rem;
}

.kisah-card {
  display: flex;
  align-items: center;
  gap: .8rem;
  width: 100%;
  margin: 0;
  padding: .8rem;
  color: var(--text);
  text-align: left;
  font: inherit;
  cursor: pointer;
  transition: border-color .15s, transform .15s;
  overflow: hidden;
}

.kisah-card:hover {
  border-color: var(--primary);
}

.kisah-card:active {
  transform: scale(.99);
}

/* =========================
   STAR NUMBER
   Mengikuti bentuk nomor
   halaman daftar surat
========================= */

.kisah-star {
  display: grid;
  place-items: center;
  position: relative;
  flex: 0 0 2.7rem;
  width: 2.7rem;
  height: 2.7rem;

  color: var(--primary);
  background: var(--primary-soft);

  font-weight: 700;
  font-size: .82rem;

  clip-path: polygon(
    50% 0%,
    61% 26%,
    85% 14%,
    75% 39%,
    100% 50%,
    75% 61%,
    85% 86%,
    61% 74%,
    50% 100%,
    39% 74%,
    15% 86%,
    25% 61%,
    0% 50%,
    25% 39%,
    15% 14%,
    39% 26%
  );
}

.kisah-star span {
  position: relative;
  z-index: 1;
}

.kisah-star.large {
  flex-basis: 3.2rem;
  width: 3.2rem;
  height: 3.2rem;
  font-size: 1rem;
}

/* =========================
   CARD CONTENT
========================= */

.kisah-content {
  min-width: 0;
  display: grid;
  gap: .25rem;
  flex: 1;
}

.kisah-content strong {
  font-size: .95rem;
}

.kisah-content small {
  font-size: .8rem;
  line-height: 1.5;
  color: var(--muted);

  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* =========================
   CARD IMAGE
========================= */

.kisah-thumbnail {
  flex: 0 0 74px;
  width: 74px;
  height: 58px;
  overflow: hidden;
  border-radius: 10px;
  background: var(--primary-soft);
}

.kisah-thumbnail img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.kisah-arrow {
  color: var(--muted);
  font-size: 1.4rem;
}

/* =========================
   EMPTY STATE
========================= */

.empty-state {
  text-align: center;
  padding: 2rem 1rem;
  color: var(--muted);
}

.empty-icon {
  font-size: 2rem;
  margin-bottom: .5rem;
}

/* =========================
   NOTE
========================= */

.note {
  font-size: .8rem;
  line-height: 1.6;
  margin-top: 1rem;
}

/* =========================
   MODAL
========================= */

.kisah-overlay {
  position: fixed;
  z-index: 60;
  inset: 0;

  background: rgba(0, 0, 0, .5);

  display: grid;
  place-items: end center;

  padding: 0;
}

.kisah-sheet {
  position: relative;

  background: var(--surface);
  color: var(--text);

  width: min(100%, 800px);
  max-height: 94dvh;

  overflow-y: auto;

  border: 1px solid var(--border);
  border-radius: 22px 22px 0 0;

  padding: 0 1.15rem 1.2rem;
}

/* DESKTOP */

@media (min-width: 700px) {
  .kisah-overlay {
    padding: 1rem;
    place-items: center;
  }

  .kisah-sheet {
    border-radius: 22px;
    max-height: 90dvh;
  }
}

/* =========================
   CLOSE
========================= */

.kisah-close {
  position: absolute;
  top: .8rem;
  right: .8rem;
  z-index: 5;

  border: 0;
  border-radius: 50%;

  width: 40px;
  height: 40px;

  background: rgba(255, 255, 255, .88);
  color: #514735;

  cursor: pointer;
  font-size: 1rem;
}

/* =========================
   HERO IMAGE
========================= */

.kisah-hero {
  position: relative;
  width: calc(100% + 2.3rem);
  margin-left: -1.15rem;
  height: 240px;

  overflow: hidden;
  border-radius: 22px 22px 0 0;
  background: var(--primary-soft);
}

.kisah-hero img {
  width: 100%;
  height: 100%;
  display: block;
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

/* =========================
   DETAIL TOP
========================= */

.detail-top {
  display: flex;
  align-items: center;
  gap: .7rem;
  margin: 1rem 0;
}

/* =========================
   SUMMARY
========================= */

.detail-summary {
  margin: 0;
  padding: .9rem;

  background: var(--primary-soft);
  border-radius: 14px;

  line-height: 1.7;
}

/* =========================
   STORY
========================= */

.section-title {
  margin: 1.4rem 0 .6rem;
  font-size: 1rem;
  color: var(--primary);
}

.story-text {
  line-height: 1.9;
  font-size: .97rem;
  white-space: pre-line;
}

/* =========================
   LESSONS
========================= */

.lessons {
  padding-left: 1.3rem;
  margin: .4rem 0;
  line-height: 1.7;
}

.lessons li {
  margin: .5rem 0;
}

/* =========================
   REFERENCES
========================= */

.references {
  border: 1px solid var(--border);
  border-radius: 12px;

  padding: .9rem;
  margin: .3rem 0;

  font-size: .9rem;
  line-height: 1.7;
}

/* =========================
   BUTTONS
========================= */

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

/* =========================
   MOBILE
========================= */

@media (max-width: 480px) {
  .kisah-card {
    gap: .6rem;
    padding: .7rem;
  }

  .kisah-star {
    flex-basis: 2.4rem;
    width: 2.4rem;
    height: 2.4rem;
    font-size: .75rem;
  }

  .kisah-thumbnail {
    flex-basis: 60px;
    width: 60px;
    height: 50px;
  }

  .kisah-content strong {
    font-size: .9rem;
  }

  .kisah-content small {
    font-size: .75rem;
  }

  .kisah-hero {
    height: 200px;
  }

  .hero-overlay h2 {
    font-size: 1.4rem;
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