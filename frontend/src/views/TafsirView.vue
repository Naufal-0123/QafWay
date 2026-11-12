<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { getTafsir } from '../api/tafsir'

const SCALE_KEY = 'equran:tafsir-scale'
const route = useRoute()
const data = ref(null)
const loading = ref(true)
const error = ref('')
const query = ref('')

// Ukuran teks (rem), diingat antar kunjungan
function readScale() {
  try {
    const v = Number(localStorage.getItem(SCALE_KEY))
    if (v >= 0.9 && v <= 1.6) return v
  } catch {
    /* abaikan */
  }
  return 1.05
}
const scale = ref(readScale())
function changeSize(delta) {
  const v = Number((scale.value + delta).toFixed(2))
  if (v < 0.9 || v > 1.6) return
  scale.value = v
  try {
    localStorage.setItem(SCALE_KEY, String(v))
  } catch {
    /* penyimpanan tidak tersedia */
  }
}

const items = computed(() => data.value?.tafsir ?? [])
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return items.value
  return items.value.filter((t) => String(t.ayat) === q || (t.teks ?? '').toLowerCase().includes(q))
})

// Pecah per paragraf supaya jarak antarparagraf terlihat
const paras = (t) => (t.teks ?? '').split(/\n+/).map((p) => p.trim()).filter(Boolean)
const isTarget = (t) => String(route.query.ayat ?? '') === String(t.ayat)

watch(
  () => [route.params.nomor, route.query.ayat],
  async ([nomor, ayat]) => {
    if (!nomor) return
    loading.value = true
    error.value = ''
    query.value = ''
    try {
      data.value = await getTafsir(nomor)
    } catch (e) {
      error.value = e.message
      data.value = null
    } finally {
      loading.value = false
    }
    // /surah/2/tafsir?ayat=255 menggulir ke ayat tersebut (setelah daftar tampil)
    if (data.value && ayat) {
      await nextTick()
      document.getElementById(`tafsir-${ayat}`)?.scrollIntoView({ block: 'start' })
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="tafsir">
    <header class="bar">
      <RouterLink :to="`/surah/${route.params.nomor}`" class="back" aria-label="Kembali ke surah">←</RouterLink>
      <div class="bar-title">
        <strong>Tafsir {{ data?.namaLatin ?? '' }}</strong>
        <small v-if="data" class="muted">{{ data.arti }} · {{ data.jumlahAyat }} ayat</small>
      </div>
      <div class="size" role="group" aria-label="Ukuran teks">
        <button class="btn" aria-label="Kecilkan teks" :disabled="scale <= 0.9" @click="changeSize(-0.1)">A−</button>
        <button class="btn" aria-label="Besarkan teks" :disabled="scale >= 1.6" @click="changeSize(0.1)">A+</button>
      </div>
    </header>

    <div v-if="loading" aria-busy="true">
      <div class="card skeleton" style="height: 160px"></div>
      <div class="card skeleton" style="height: 160px"></div>
    </div>
    <p v-else-if="error" class="error">{{ error }}</p>

    <template v-else-if="data">
      <div class="search-wrap">
        <input v-model="query" class="input" type="search" placeholder="Cari nomor ayat atau kata…" aria-label="Cari tafsir" />
        <button v-if="query" class="clear" aria-label="Hapus pencarian" @click="query = ''">✕</button>
      </div>
      <p v-if="!filtered.length" class="muted center">Tidak ada yang cocok.</p>

      <article
        v-for="t in filtered"
        :id="`tafsir-${t.ayat}`"
        :key="t.ayat"
        class="card item"
        :class="{ target: isTarget(t) }"
      >
        <div class="item-head">
          <span class="num">{{ t.ayat }}</span>
          <strong class="item-label">Ayat {{ t.ayat }}</strong>
          <RouterLink :to="`/surah/${route.params.nomor}?ayah=${t.ayat}`" class="btn">Baca ayat</RouterLink>
        </div>
        <div class="teks" lang="id" :style="{ fontSize: scale + 'rem' }">
          <p v-for="(p, i) in paras(t)" :key="i">{{ p }}</p>
        </div>
      </article>

      <p class="muted note">Tafsir bersumber dari Kementerian Agama RI melalui equran.id.</p>
    </template>
  </div>
</template>

<style scoped>
.center { text-align: center; margin: 2rem 0; }
.bar { display: flex; align-items: center; gap: .6rem; padding: .6rem 0; border-bottom: 1px solid var(--border); }
.back { width: 44px; height: 44px; flex: none; display: grid; place-items: center; font-size: 1.3rem; border-radius: 50%; border: 1px solid var(--border); background: var(--surface); color: var(--text); }
.back:hover { border-color: var(--primary); background: var(--primary-soft); }
.bar-title { display: flex; flex-direction: column; line-height: 1.3; min-width: 0; flex: 1; }
.size { display: flex; gap: .3rem; flex: none; }
.size .btn { padding: .3rem .7rem; }
.size .btn:disabled { opacity: .4; cursor: default; }
.search-wrap { position: relative; margin: .9rem 0 .4rem; }
.search-wrap .input { padding-right: 3rem; }

.item { padding: 1rem 1.1rem 1.3rem; margin: .8rem 0; scroll-margin-top: 70px; }
.item.target { border-color: var(--gold); box-shadow: 0 0 0 2px var(--gold); }
.item-head { display: flex; align-items: center; gap: .7rem; padding-bottom: .8rem; margin-bottom: .9rem; border-bottom: 1px solid var(--border); }
.item-label { flex: 1; }
.teks { max-width: 68ch; margin: 0 auto; }
.teks p { margin: 0 0 1em; line-height: 1.85; }
.teks p:last-child { margin-bottom: 0; }
</style>