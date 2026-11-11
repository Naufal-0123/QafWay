<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { getSurah } from '../api/quran'
import AyahCard from '../components/AyahCard.vue'

const route = useRoute()
const surah = ref(null)
const loading = ref(true)
const error = ref('')

const qari = ref('01')
const showLatin = ref(true)
const showTranslation = ref(true)
const playingAyah = ref(null)
const isPlaying = ref(false)
const ayahQuery = ref('')
const ayahRefs = ref({})

const repeatMode = ref('off') // 'off' | 'one' | 'all'
const fontScale = ref(1)
const lastRead = ref(null)
const showTopBtn = ref(false)

const audio = new Audio()

const qariIds = computed(() => Object.keys(surah.value?.audioFull ?? {}).sort())
const description = computed(() => (surah.value?.deskripsi ?? '').replace(/<[^>]*>/g, ''))
const next = computed(() => surah.value?.suratSelanjutnya?.nomor ?? null)
const prev = computed(() => surah.value?.suratSebelumnya?.nomor ?? null)

const filteredAyat = computed(() => {
  const list = surah.value?.ayat ?? []
  const q = ayahQuery.value.trim().toLowerCase()
  
  if (isPlaying.value && playingAyah.value) {
    const currentIndex = list.findIndex((a) => a.nomorAyat === playingAyah.value)
    return list.slice(Math.max(0, currentIndex - 1))
  }

  if (!q) return list
  return list.filter(
    (a) =>
      a.teksIndonesia.toLowerCase().includes(q) ||
      a.teksLatin.toLowerCase().includes(q) ||
      String(a.nomorAyat) === q,
  )
})

function changeFontSize(delta) {
  const newScale = fontScale.value + delta
  if (newScale >= 0.8 && newScale <= 1.6) {
    fontScale.value = Number(newScale.toFixed(1))
  }
}

function toggleBookmark(ayah) {
  const mark = {
    surahNomor: surah.value.nomor,
    surahNama: surah.value.namaLatin,
    nomorAyat: ayah.nomorAyat
  }
  
  if (lastRead.value?.surahNomor === mark.surahNomor && lastRead.value?.nomorAyat === mark.nomorAyat) {
    lastRead.value = null
    localStorage.removeItem('quran_last_read')
  } else {
    lastRead.value = mark
    localStorage.setItem('quran_last_read', JSON.stringify(mark))
  }
}

function loadBookmark() {
  const saved = localStorage.getItem('quran_last_read')
  if (saved) {
    try {
      lastRead.value = JSON.parse(saved)
    } catch (e) {
      lastRead.value = null
    }
  }
}

function stop() {
  audio.pause()
  playingAyah.value = null
  isPlaying.value = false
}

async function scrollToAyah(nomorAyat) {
  await nextTick()
  setTimeout(() => {
    const componentInstance = ayahRefs.value[nomorAyat]
    const el = componentInstance?.$el || componentInstance
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.classList.add('highlight-target')
      setTimeout(() => {
        el.classList.remove('highlight-target')
      }, 2000)
    }
  }, 100)
}

function play(ayah) {
  const url = ayah.audio?.[qari.value] || ayah.audio?.['01']
  if (!url) return
  
  audio.src = url
  audio.play()
    .then(() => {
      isPlaying.value = true
      playingAyah.value = ayah.nomorAyat
      scrollToAyah(ayah.nomorAyat)
    })
    .catch(() => {
      playingAyah.value = null
      isPlaying.value = false
    })
}

function toggle(ayah) {
  if (playingAyah.value === ayah.nomorAyat && isPlaying.value) {
    audio.pause()
    isPlaying.value = false
  } else {
    play(ayah)
  }
}

function toggleFullAudio() {
  const list = surah.value?.ayat ?? []
  if (!list.length) return

  if (isPlaying.value) {
    audio.pause()
    isPlaying.value = false
  } else {
    const currentList = filteredAyat.value
    const targetAyah = currentList.length > 0 ? currentList[0] : list[0]
    play(targetAyah)
  }
}

function cycleRepeatMode() {
  if (repeatMode.value === 'off') repeatMode.value = 'one'
  else if (repeatMode.value === 'one') repeatMode.value = 'all'
  else repeatMode.value = 'off'
}

audio.addEventListener('ended', () => {
  const fullList = surah.value?.ayat ?? []
  const idx = fullList.findIndex((a) => a.nomorAyat === playingAyah.value)

  if (repeatMode.value === 'one' && playingAyah.value) {
    const currentAyah = fullList.find((a) => a.nomorAyat === playingAyah.value)
    if (currentAyah) play(currentAyah)
  } else if (idx >= 0 && idx < fullList.length - 1) {
    play(fullList[idx + 1])
  } else if (repeatMode.value === 'all' && fullList.length > 0) {
    play(fullList[0])
  } else {
    playingAyah.value = null
    isPlaying.value = false
  }
})

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function handleScroll() {
  showTopBtn.value = window.scrollY > 300
}

onMounted(() => {
  loadBookmark()
  window.addEventListener('scroll', handleScroll)
})

onBeforeUnmount(() => {
  stop()
  window.removeEventListener('scroll', handleScroll)
})

watch(
  () => [route.params.nomor, route.query.ayah],
  async ([nomor, targetAyahNum]) => {
    if (!nomor) return
    stop()
    loading.value = true
    error.value = ''
    ayahQuery.value = ''
    try {
      surah.value = await getSurah(nomor)
      if (targetAyahNum) {
        await scrollToAyah(Number(targetAyahNum))
      } else {
        window.scrollTo({ top: 0 })
      }
    } catch (e) {
      error.value = e.message
      surah.value = null
    } finally {
      loading.value = false
    }
  },
  { immediate: true },
)
</script>

<template>
  <RouterLink to="/" class="back">← Daftar surah</RouterLink>

  <div v-if="loading" aria-busy="true">
    <div class="card skeleton" style="height: 180px"></div>
    <div class="card skeleton" style="height: 120px"></div>
  </div>
  <p v-else-if="error" class="error">{{ error }}</p>

  <template v-else-if="surah">
    <section class="card hero">
      <p class="arab-title" dir="rtl" lang="ar">{{ surah.nama }}</p>
      <h1>{{ surah.namaLatin }}</h1>
      <p class="muted">{{ surah.arti }} · {{ surah.jumlahAyat }} ayat · {{ surah.tempatTurun }}</p>
      <p v-if="description" class="desc">{{ description }}</p>
    </section>

    <section class="toolbar">
      <label>
        Qari
        <select v-model="qari" @change="stop">
          <option v-for="id in qariIds" :key="id" :value="id">Qari {{ id }}</option>
        </select>
      </label>
      <button class="chip" :class="{ on: showLatin }" :aria-pressed="showLatin" @click="showLatin = !showLatin">Latin</button>
      <button class="chip" :class="{ on: showTranslation }" :aria-pressed="showTranslation" @click="showTranslation = !showTranslation">Terjemahan</button>
      
      <button class="chip" :class="{ on: repeatMode !== 'off' }" @click="cycleRepeatMode">
        🔁 {{ repeatMode === 'off' ? 'Repeat: Mati' : repeatMode === 'one' ? 'Repeat: 1 Ayat' : 'Repeat: Semua' }}
      </button>

      <div class="font-controls">
        <button class="chip" title="Kecilkan Teks Arab" @click="changeFontSize(-0.1)">A-</button>
        <button class="chip" title="Besarkan Teks Arab" @click="changeFontSize(0.1)">A+</button>
      </div>
    </section>

    <div class="search" style="margin-bottom: 1rem;">
      <input
        v-model="ayahQuery"
        class="input"
        type="search"
        placeholder="Cari ayat di surah ini (terjemahan, latin, atau nomor)..."
        aria-label="Cari ayat"
      />
      <button v-if="ayahQuery" class="clear" aria-label="Hapus pencarian ayat" @click="ayahQuery = ''">✕</button>
    </div>

    <div class="card" style="display: flex; align-items: center; justify-content: space-between; padding: 0.8rem 1.2rem; margin-bottom: 1rem;">
      <span>Putar Surah (Presisi per Ayat)</span>
      <button class="btn primary" @click="toggleFullAudio">
        {{ isPlaying ? '❚❚ Jeda Audio' : '▶ Putar Surah' }}
      </button>
    </div>

    <p v-if="!filteredAyat.length" class="muted" style="text-align: center; margin: 2rem 0;">
      Ayat tidak ditemukan dalam surah ini.
    </p>

    <AyahCard
      v-for="a in filteredAyat"
      :key="a.nomorAyat"
      :ref="(el) => { if (el) ayahRefs[a.nomorAyat] = el }"
      :ayah="a"
      :playing="playingAyah === a.nomorAyat && isPlaying"
      :show-latin="showLatin"
      :show-translation="showTranslation"
      :font-scale="fontScale"
      :is-bookmarked="lastRead?.surahNomor === surah.nomor && lastRead?.nomorAyat === a.nomorAyat"
      @toggle="toggle(a)"
      @bookmark="toggleBookmark(a)"
    />

    <nav class="pager">
      <RouterLink v-if="prev" :to="`/surah/${prev}`" class="btn">← Sebelumnya</RouterLink>
      <span v-else></span>
      <RouterLink v-if="next" :to="`/surah/${next}`" class="btn">Berikutnya →</RouterLink>
    </nav>

    <button
      v-if="showTopBtn"
      class="to-top-btn"
      aria-label="Kembali ke atas"
      @click="scrollToTop"
    >
      ↑
    </button>
  </template>
</template>

<style scoped>
.font-controls {
  display: flex;
  gap: 0.3rem;
  margin-left: auto;
}
</style>