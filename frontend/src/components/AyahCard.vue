<script setup>
import { ref } from 'vue'

const props = defineProps({
  ayah: { type: Object, required: true },
  playing: { type: Boolean, default: false },
  showLatin: { type: Boolean, default: true },
  showTranslation: { type: Boolean, default: true },
  isBookmarked: { type: Boolean, default: false },
  fontScale: { type: Number, default: 1 }
})

const emit = defineEmits(['toggle', 'bookmark'])
const copied = ref(false)

function copyAyah() {
  const textToCopy = `${props.ayah.teksArab}\n\n${props.ayah.teksLatin}\n"${props.ayah.teksIndonesia}" (Ayat ${props.ayah.nomorAyat})`
  navigator.clipboard.writeText(textToCopy).then(() => {
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  })
}
</script>

<template>
  <article class="card ayah" :class="{ active: playing }" @click="$emit('toggle')">
    <div class="ayah-head">
      <div class="head-left">
        <span class="num">{{ ayah.nomorAyat }}</span>
        <button
          class="btn icon-btn"
          :class="{ active: isBookmarked }"
          :aria-label="isBookmarked ? 'Ditandai' : 'Tandai terakhir dibaca'"
          @click.stop="$emit('bookmark')"
        >
          {{ isBookmarked ? '🔖 Ditandai' : '🔖 Tandai' }}
        </button>
        <button class="btn icon-btn" aria-label="Salin ayat" @click.stop="copyAyah">
          {{ copied ? '✓ Tersalin' : '📋 Salin' }}
        </button>
      </div>

      <button
        class="btn"
        :class="{ primary: playing }"
        :aria-label="(playing ? 'Jeda' : 'Putar') + ' ayat ' + ayah.nomorAyat"
        :aria-pressed="playing"
      >
        <span aria-hidden="true">{{ playing ? '❚❚' : '▶' }}</span>
        {{ playing ? 'Jeda' : 'Putar' }}
      </button>
    </div>

    <p 
      class="arab" 
      dir="rtl" 
      lang="ar" 
      :style="{ fontSize: `calc(clamp(1.6rem, 6.2vw, 2.1rem) * ${fontScale})` }"
    >
      {{ ayah.teksArab }}
    </p>

    <p v-if="showLatin" class="latin">{{ ayah.teksLatin }}</p>
    <p v-if="showTranslation" class="terjemah">{{ ayah.teksIndonesia }}</p>
  </article>
</template>

<style scoped>
.head-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.icon-btn {
  font-size: 0.85rem;
  padding: 0.2rem 0.6rem;
  min-height: 36px;
}
.icon-btn.active {
  background: var(--gold-soft);
  border-color: var(--gold);
  color: var(--gold);
  font-weight: 600;
}
</style>