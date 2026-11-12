<script setup>
import { ref } from 'vue'
import AyahShareModal from './AyahShareModal.vue'

const props = defineProps({
  ayah: { type: Object, required: true },
  surahNomor: { type: [Number, String], default: null },
  surahName: { type: String, default: '' },
  playing: { type: Boolean, default: false },
  showLatin: { type: Boolean, default: true },
  showTranslation: { type: Boolean, default: true },
  fontScale: { type: Number, default: 1 },
  isBookmarked: { type: Boolean, default: false },
  // Mode tajwid: potongan teks berwarna; null = teks Arab biasa
  segments: { type: Array, default: null },
  rules: { type: Object, default: () => ({}) },
  selectedRule: { type: String, default: '' },
})
const emit = defineEmits(['toggle', 'bookmark', 'pick-rule'])

const copied = ref(false)
const showShareModal = ref(false) // State untuk memunculkan modal share gambar

async function copy() {
  const a = props.ayah
  const ref_ = props.surahName ? ` (QS. ${props.surahName}: ${a.nomorAyat})` : ''
  try {
    await navigator.clipboard.writeText(`${a.teksArab}\n\n${a.teksLatin}\n\n${a.teksIndonesia}${ref_}`)
    copied.value = true
    setTimeout(() => (copied.value = false), 1500)
  } catch {
    /* clipboard tidak tersedia */
  }
}

// Ketuk huruf berwarna = pilih hukum tajwid (tidak memutar audio)
function onSegment(e, s) {
  if (!s.rule) return
  e.stopPropagation()
  emit('pick-rule', s.rule)
}
</script>

<template>
  <!-- Seluruh kartu bisa diketuk untuk memutar/menjeda ayat -->
  <article class="card ayah" :class="{ active: playing }" @click="emit('toggle')">
    <div class="ayah-head">
      <!-- Nomor ayat diposisikan ke kanan menggunakan flex-row-reverse -->
      <span class="num">{{ ayah.nomorAyat }}</span>
      
      <!-- Tombol aksi dikelompokkan di sebelah kiri -->
      <div class="ayah-actions">
        <RouterLink
          v-if="surahNomor"
          :to="`/surah/${surahNomor}/tafsir?ayat=${ayah.nomorAyat}`"
          class="btn icon-btn"
          data-label="Tafsir"
          aria-label="Baca tafsir ayat ini"
          @click.stop
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z"/><path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z"/></svg>
        </RouterLink>

        <!-- Tombol Bagikan sebagai Gambar -->
        <button
          class="btn icon-btn"
          data-label="Bagikan Gambar"
          aria-label="Bagikan ayat sebagai gambar"
          @click.stop="showShareModal = true"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
        </button>

        <button
          class="btn icon-btn"
          :class="{ on: isBookmarked }"
          :data-label="isBookmarked ? 'Hapus tanda' : 'Tandai'"
          :aria-pressed="isBookmarked"
          :aria-label="isBookmarked ? 'Hapus tanda terakhir dibaca' : 'Tandai terakhir dibaca'"
          @click.stop="emit('bookmark')"
        >
          <svg viewBox="0 0 24 24" :fill="isBookmarked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3h12v18l-6-4-6 4z"/></svg>
        </button>

        <button
          class="btn icon-btn"
          :class="{ flash: copied }"
          :data-label="copied ? 'Tersalin ✓' : 'Salin'"
          aria-label="Salin ayat"
          @click.stop="copy"
        >
          <svg v-if="!copied" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/></svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>
        </button>

        <button
          class="btn icon-btn"
          :class="{ primary: playing }"
          :data-label="playing ? 'Jeda' : 'Putar'"
          :aria-pressed="playing"
          :aria-label="(playing ? 'Jeda' : 'Putar') + ' ayat ' + ayah.nomorAyat"
        >
          <svg v-if="!playing" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>
          <svg v-else viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>
        </button>
      </div>
    </div>

    <p
      class="arab"
      dir="rtl"
      lang="ar"
      :style="{ fontSize: `calc(clamp(1.6rem, 6.2vw, 2.1rem) * ${fontScale})` }"
    >
      <template v-if="segments">
        <span
          v-for="(s, i) in segments"
          :key="i"
          :class="{ tj: s.rule, dim: selectedRule && s.rule !== selectedRule }"
          :style="s.rule && rules[s.rule] ? { color: `var(--tj-${s.rule})` } : null"
          :title="s.rule ? rules[s.rule]?.label : null"
          @click="onSegment($event, s)"
        >{{ s.text }}</span>
      </template>
      <template v-else>{{ ayah.teksArab }}</template>
    </p>
    <p v-if="showLatin" class="latin">{{ ayah.teksLatin }}</p>
    <p v-if="showTranslation" class="terjemah">{{ ayah.teksIndonesia }}</p>

    <!-- Modal Bagikan Gambar -->
    <AyahShareModal 
      v-if="showShareModal" 
      :ayah="ayah" 
      :surah-name="surahName" 
      @close="showShareModal = false" 
    />
  </article>
</template>

<style scoped>
.ayah-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: row-reverse; /* Memastikan nomor di kanan dan tombol aksi di kiri */
  margin-bottom: .8rem;
  gap: .5rem;
}

.ayah-actions { 
  display: flex;
  gap: .35rem; 
  justify-content: flex-start;
}

/* Tombol ikon bulat; label muncul sebagai tooltip saat di-hover / fokus keyboard */
.icon-btn { position: relative; width: 44px; height: 44px; padding: 0; border-radius: 50%; }
.icon-btn svg { width: 20px; height: 20px; }
.icon-btn::after {
  content: attr(data-label);
  position: absolute; bottom: calc(100% + 8px); left: 50%;
  transform: translate(-50%, 4px);
  padding: .25rem .6rem; border-radius: 8px;
  background: var(--text); color: var(--bg);
  font-size: .75rem; font-weight: 600; line-height: 1.4; white-space: nowrap;
  opacity: 0; pointer-events: none; z-index: 5;
  transition: opacity .15s, transform .15s;
}
@media (hover: hover) {
  .icon-btn:hover::after { opacity: 1; transform: translate(-50%, 0); }
}
.icon-btn:focus-visible::after,
.icon-btn.flash::after { opacity: 1; transform: translate(-50%, 0); }

/* Huruf tajwid */
.tj { cursor: pointer; }
.dim { opacity: .28; }
</style>