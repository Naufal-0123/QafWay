<script setup>
import { ref } from 'vue'
import { toPng } from 'html-to-image'

const props = defineProps({
  ayah: { type: Object, required: true },
  surahName: { type: String, required: true }
})
const emit = defineEmits(['close'])

const cardRef = ref(null)
const exporting = ref(false)
const themeStyle = ref('dark') // 'dark' | 'light' | 'emerald'

async function generateImageBlob() {
  if (!cardRef.value) return null
  try {
    // Render elemen kartu menjadi URL gambar PNG
    const dataUrl = await toPng(cardRef.value, { cacheBust: true, quality: 0.95 })
    const res = await fetch(dataUrl)
    return await res.blob()
  } catch (err) {
    console.error('Gagal merender gambar:', err)
    return null
  }
}

async function downloadImage() {
  if (!cardRef.value) return
  exporting.value = true
  try {
    const dataUrl = await toPng(cardRef.value, { cacheBust: true, quality: 0.95 })
    const link = document.createElement('a')
    link.download = `Ayah-${props.surahName}-${props.ayah.nomorAyat}.png`
    link.href = dataUrl
    link.click()
  } catch (err) {
    console.error('Gagal mendownload gambar:', err)
    alert('Gagal membuat gambar. Pastikan pustaka html-to-image sudah terinstal (npm install html-to-image).')
  } finally {
    exporting.value = false
  }
}

async function shareImage() {
  exporting.value = true
  try {
    const blob = await generateImageBlob()
    if (!blob) throw new Error('Gagal menghasilkan file gambar')

    const file = new File([blob], `Ayah-${props.surahName}-${props.ayah.nomorAyat}.png`, { type: 'image/png' })

    // Cek apakah perangkat mendukung Web Share API untuk file gambar
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: `QS. ${props.surahName} Ayat ${props.ayah.nomorAyat}`,
        text: `${props.ayah.teksArab}\n\n"${props.ayah.teksIndonesia}" (QS. ${props.surahName}: ${props.ayah.nomorAyat})`,
        files: [file]
      })
    } else {
      // Fallback: Jika browser/perangkat tidak mendukung share file, otomatis jalankan download
      downloadImage()
    }
  } catch (err) {
    console.log('Share dibatalkan atau tidak didukung:', err)
    // Fallback otomatis ke download jika terjadi error pada navigator.share
    downloadImage()
  } finally {
    exporting.value = false
  }
}
</script>

<template>
  <div class="modal-overlay" @click.stop @click.self="emit('close')">
    <div class="modal-card" @click.stop>
      <div class="modal-header">
        <h3>Bagikan Ayat</h3>
        <button class="btn-close" @click="emit('close')">✕</button>
      </div>

      <!-- Pilihan Tema Kartu -->
      <div class="theme-picker">
        <button class="chip" :class="{ on: themeStyle === 'emerald' }" @click.stop="themeStyle = 'emerald'">Emerald</button>
        <button class="chip" :class="{ on: themeStyle === 'dark' }" @click.stop="themeStyle = 'dark'">Dark Minimal</button>
        <button class="chip" :class="{ on: themeStyle === 'light' }" @click.stop="themeStyle = 'light'">Classic Light</button>
      </div>

      <!-- Area Kartu yang Akan Diexport Menjadi Gambar -->
      <div class="preview-container">
        <div ref="cardRef" class="quote-card" :class="themeStyle">
          <div class="card-top">
            <span class="app-brand">QafWay App</span>
            <span class="surah-badge">QS. {{ surahName }}: {{ ayah.nomorAyat }}</span>
          </div>
          
          <div class="card-body">
            <p class="q-arab" dir="rtl" lang="ar">{{ ayah.teksArab }}</p>
            <p class="q-translation">"{{ ayah.teksIndonesia }}"</p>
          </div>

          <div class="card-footer">
            <span>Barakallahu fiikum</span>
          </div>
        </div>
      </div>

      <!-- Tombol Aksi -->
      <div class="modal-actions">
        <button class="btn" @click.stop="downloadImage" :disabled="exporting">
          📥 {{ exporting ? 'Memproses...' : 'Download Gambar' }}
        </button>
        <button class="btn primary" @click.stop="shareImage" :disabled="exporting">
          📤 {{ exporting ? 'Memproses...' : 'Bagikan ke WhatsApp / IG' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0; z-index: 2000;
  background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(4px);
  display: grid; place-items: center; padding: 1rem;
}
.modal-card {
  background: var(--surface, #fff); border-radius: 20px;
  width: 100%; max-width: 440px; padding: 1.2rem;
  display: grid; gap: 1rem; box-shadow: 0 15px 35px rgba(0,0,0,0.2);
}
.modal-header {
  display: flex; justify-content: space-between; align-items: center;
}
.modal-header h3 { margin: 0; font-size: 1.1rem; }
.btn-close { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: var(--muted); }

.theme-picker { display: flex; gap: 6px; justify-content: center; }

/* Desain Kartu Estetik */
.preview-container { width: 100%; display: flex; justify-content: center; overflow-x: auto; padding: 4px 0; }
.quote-card {
  width: 360px; min-height: 420px; padding: 2rem 1.5rem;
  border-radius: 16px; display: flex; flex-direction: column; justify-content: space-between;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1); font-family: 'Plus Jakarta Sans', sans-serif;
}
/* Variasi Tema Kartu */
.quote-card.emerald { background: linear-gradient(135deg, #0a4d45 0%, #0f766e 100%); color: #fff; }
.quote-card.dark { background: #151e1b; color: #e6eeeb; border: 1px solid #25332f; }
.quote-card.light { background: #faf3e0; color: #3a2e1c; border: 1px solid #e0d3b6; }

.card-top { display: flex; justify-content: space-between; font-size: 0.75rem; opacity: 0.85; text-transform: uppercase; letter-spacing: 0.05em; }
.card-body { text-align: center; margin: 1.5rem 0; }
.q-arab { font-family: 'Amiri', serif; font-size: 1.8rem; line-height: 2.3; margin: 0 0 1.2rem; text-align: right; }
.q-translation { font-size: 0.95rem; line-height: 1.6; font-style: italic; opacity: 0.95; }
.card-footer { text-align: center; font-size: 0.75rem; opacity: 0.7; border-top: 1px solid rgba(255,255,255,0.15); padding-top: 0.8rem; }

.modal-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
@media (max-width: 400px) { .modal-actions { grid-template-columns: 1fr; } }
</style>