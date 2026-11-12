<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

// Muncul hanya saat halaman digulir, hilang setelah berhenti
const show = ref(false)
let timer = null

function onScroll() {
  clearTimeout(timer)
  if (window.scrollY <= 300) {
    show.value = false
    return
  }
  show.value = true
  timer = setTimeout(() => (show.value = false), 1800)
}

function toTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  clearTimeout(timer)
})
</script>

<template>
  <button
    class="to-top-btn"
    :class="{ show }"
    :aria-hidden="!show"
    :tabindex="show ? 0 : -1"
    aria-label="Kembali ke atas"
    @click="toTop"
  >↑</button>
</template>