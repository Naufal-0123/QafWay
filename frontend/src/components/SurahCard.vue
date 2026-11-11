<script setup>
defineProps({ surah: { type: Object, required: true } })
</script>

<template>
  <RouterLink :to="`/surah/${surah.nomor}`" class="card surah-card">
    <span class="num">{{ surah.nomor }}</span>
    <div class="meta">
      <strong>{{ surah.namaLatin }}</strong>
      <small>{{ surah.arti }} · {{ surah.jumlahAyat }} ayat · {{ surah.tempatTurun }}</small>
    </div>
    <span class="arab-name" dir="rtl" lang="ar">{{ surah.nama }}</span>
  </RouterLink>
</template>