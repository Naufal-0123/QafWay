<script setup>
import { ref, onMounted } from 'vue'
import { getDailyAyah } from '../api/daily'

const data = ref(null)
const copied = ref(false)

function localDate() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

onMounted(async () => {
  try {
    data.value = await getDailyAyah(localDate())
  } catch {
    /* kartu ini tambahan; jika gagal, cukup tidak ditampilkan */
  }
})

async function copy() {
  const d = data.value
  if (!d) return
  const text = [d.ayah.teksArab, d.ayah.teksIndonesia, `(QS ${d.surah.namaLatin}: ${d.ayah.nomorAyat})`].join('\n\n')
  try {
    await navigator.clipboard.writeText(text)
    copied.value = true
    setTimeout(() => (copied.value = false), 1800)
  } catch {
    /* clipboard tidak tersedia */
  }
}
</script>

<template>
  <section v-if="data" class="daily">
    <span class="label">Ayat hari ini</span>
    <p class="ar" dir="rtl" lang="ar">{{ data.ayah.teksArab }}</p>
    <p class="idn">{{ data.ayah.teksIndonesia }}</p>
    <p class="ref">QS {{ data.surah.namaLatin }}: {{ data.ayah.nomorAyat }}</p>
    <div class="actions">
      <RouterLink :to="`/surah/${data.surah.nomor}?ayah=${data.ayah.nomorAyat}`" class="act">Baca di surah</RouterLink>
      <button class="act" @click="copy">{{ copied ? 'Tersalin ✓' : 'Salin' }}</button>
    </div>
  </section>
</template>

<style scoped>
.daily {
  margin: 8px 0 14px; padding: 18px; border-radius: 16px;
  background: var(--primary, #0f766e); color: var(--on-primary, #fff);
}
.label { font-size: .8rem; opacity: .85; text-transform: uppercase; letter-spacing: .04em; }
.ar { font-size: 1.7rem; line-height: 2.2; margin: 8px 0 4px; font-family: var(--arab-font, 'Amiri', 'Noto Naskh Arabic', 'Geeza Pro', serif); }
.idn { margin: 4px 0; font-size: .95rem; line-height: 1.6; opacity: .95; }
.ref { margin: 6px 0 0; font-size: .85rem; opacity: .85; }
.actions { display: flex; gap: 8px; margin-top: 12px; }
.act {
  min-height: 40px; padding: 0 14px; border-radius: 10px; display: inline-flex; align-items: center;
  border: 1px solid rgba(255, 255, 255, .5); background: transparent; color: inherit; font: inherit;
  text-decoration: none; cursor: pointer;
}
</style>