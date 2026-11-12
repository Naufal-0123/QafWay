<script setup>
import { ref, watch } from 'vue'
import { getDoaList } from '../api/doa'

const TABS = [
  { key: 'pagi', label: '☀️ Dzikir Pagi', match: ['pagi'] },
  { key: 'petang', label: '🌙 Dzikir Petang', match: ['petang', 'sore'] },
]

const tab = ref('pagi')
const allDoa = ref([])
const items = ref([])
const loading = ref(false)
const error = ref('')
const openId = ref(null)
const copied = ref(null)

async function loadData() {
  if (allDoa.value.length > 0) return
  loading.value = true
  error.value = ''
  try {
    const res = await getDoaList()
    allDoa.value = res.data ?? res.items ?? []
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

function filterTab(key) {
  const t = TABS.find((x) => x.key === key)
  if (!t) return
  
  items.value = allDoa.value.filter((d) => {
    const hay = [
      d.nama, 
      d.grup, 
      d.idn, 
      d.tentang, 
      ...(d.tag ?? [])
    ].join(' ').toLowerCase()

    return t.match.some((keyword) => hay.includes(keyword))
  })
}

watch(tab, async (k) => {
  openId.value = null
  await loadData()
  filterTab(k)
}, { immediate: true })

const toggle = (id) => (openId.value = openId.value === id ? null : id)

async function copyDzikir(d) {
  const text = [d.nama, d.ar, d.tr, d.idn].filter(Boolean).join('\n\n')
  try {
    await navigator.clipboard.writeText(text)
    copied.value = d.id
    setTimeout(() => (copied.value = null), 1800)
  } catch {
    /* clipboard tidak tersedia */
  }
}
</script>

<template>
  <div class="dzikir-container">
    <div class="header-section">
      <h1 class="title">Dzikir &amp; Wirid</h1>
      <p class="subtitle muted">Amalan harian penenang hati, pagi dan petang.</p>
    </div>

    <!-- Tab Navigasi Khusus Dzikir Pagi & Petang -->
    <div class="tabs-card">
      <button
        v-for="t in TABS"
        :key="t.key"
        class="tab-btn"
        :class="{ on: tab === t.key }"
        role="tab"
        :aria-selected="tab === t.key"
        @click="tab = t.key"
      >
        {{ t.label }}
      </button>
    </div>

    <!-- Daftar Dzikir -->
    <div v-if="loading" class="state-box">
      <p class="muted center">Memuat bacaan dzikir…</p>
    </div>
    <div v-else-if="error" class="state-box">
      <p class="error center">{{ error }}</p>
    </div>
    <div v-else-if="!items.length" class="card empty-card">
      <span class="empty-icon">📖</span>
      <h3>Belum Ada Data</h3>
      <p class="muted">
        Data dzikir untuk kategori "{{ tab }}" tidak ditemukan. Anda bisa menemukan kumpulan doa lengkap melalui menu Doa harian.
      </p>
      <RouterLink to="/doa" class="btn primary" style="margin-top: 1rem;">Buka Halaman Doa →</RouterLink>
    </div>
    
    <template v-else>
      <p class="muted count" aria-live="polite">Menampilkan {{ items.length }} bacaan dzikir</p>

      <article v-for="d in items" :key="d.id" class="card dzikir-card" :class="{ active: openId === d.id }">
        <button class="head" :aria-expanded="openId === d.id" @click="toggle(d.id)">
          <span class="num">{{ d.id }}</span>
          <span class="nama">{{ d.nama }}</span>
          <span class="chev" :class="{ up: openId === d.id }" aria-hidden="true">⌄</span>
        </button>
        
        <div v-if="openId === d.id" class="body">
          <p class="ar" dir="rtl" lang="ar">{{ d.ar }}</p>
          <p v-if="d.tr" class="tr">{{ d.tr }}</p>
          <p v-if="d.idn" class="idn">{{ d.idn }}</p>
          <p v-if="d.tentang" class="tentang muted">{{ d.tentang }}</p>
          
          <div class="card-actions">
            <button class="btn copy-btn" @click="copyDzikir(d)">
              {{ copied === d.id ? '✓ Berhasil Disalin' : '📋 Salin Dzikir' }}
            </button>
          </div>
        </div>
      </article>
    </template>
  </div>
</template>

<style scoped>
.dzikir-container {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  max-width: 800px;
  margin: 0 auto;
}
.header-section {
  margin-bottom: 0.2rem;
}
.title { 
  margin: 4px 0 2px; 
  font-size: 1.6rem; 
  font-weight: 700;
}
.subtitle {
  font-size: 0.9rem;
  margin: 0;
}
.muted { color: var(--muted, #62716c); }
.error { color: var(--error, #b42318); }
.center { text-align: center; }

.count { 
  margin: 4px 0 8px; 
  font-size: 0.85rem; 
  font-weight: 500;
}

.tabs-card { 
  display: flex; 
  gap: 8px; 
  padding: 6px; 
  background: var(--surface, #f4f6f5);
  border: 1px solid var(--border, #e2e7e5);
  border-radius: 16px;
}
.tab-btn {
  flex: 1; 
  min-height: 44px; 
  padding: 0 16px; 
  border-radius: 12px; 
  cursor: pointer; 
  font: inherit; 
  font-weight: 600;
  font-size: 0.92rem;
  border: none; 
  background: transparent; 
  color: var(--text, #17201e);
  transition: all 0.2s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tab-btn:hover {
  background: var(--primary-soft, #dcf1ed);
  color: var(--primary, #0f766e);
}
.tab-btn.on { 
  background: var(--primary, #0f766e); 
  color: var(--on-primary, #fff); 
  box-shadow: 0 4px 12px rgba(15, 118, 110, 0.2);
}

.dzikir-card { 
  border: 1px solid var(--border, #e2e7e5);
  border-radius: 16px;
  margin: 8px 0;
  transition: border-color 0.2s;
  overflow: hidden;
  background: var(--surface, #ffffff);
}
.dzikir-card.active {
  border-color: var(--primary, #0f766e);
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.head {
  width: 100%; 
  min-height: 60px; 
  display: grid; 
  grid-template-columns: 42px 1fr auto; 
  gap: 12px; 
  align-items: center;
  padding: 10px 14px; 
  border: 0; 
  background: transparent; 
  cursor: pointer; 
  text-align: left; 
  font: inherit; 
  color: inherit;
}
.head:hover {
  background: var(--primary-soft, #dcf1ed);
}
.num {
  display: inline-grid; 
  place-items: center; 
  width: 36px; 
  height: 36px; 
  border-radius: 12px;
  background: var(--primary-soft, #dcf1ed); 
  color: var(--primary, #0f766e); 
  font-weight: 700; 
  font-size: 0.85rem;
}
.nama { 
  font-weight: 600; 
  font-size: 1rem;
}
.chev { 
  font-size: 1.2rem; 
  color: var(--muted, #62716c); 
  transition: transform 0.2s; 
}
.chev.up { transform: rotate(180deg); }

.body { 
  padding: 4px 18px 20px 18px; 
  border-top: 1px solid var(--border, #e2e7e5);
  background: var(--surface, #ffffff);
}
.ar { 
  font-size: clamp(1.6rem, 5vw, 2rem); 
  line-height: 2.4; 
  margin: 12px 0 16px; 
  text-align: right;
  font-family: var(--arab-font, 'Amiri', 'Noto Naskh Arabic', serif); 
}
.tr { 
  color: var(--primary, #0f766e); 
  font-style: italic; 
  margin: 8px 0; 
  font-size: 0.95rem;
}
.idn { 
  margin: 10px 0; 
  font-size: 0.98rem;
  line-height: 1.6;
}
.tentang { 
  font-size: 0.88rem; 
  margin: 12px 0; 
  padding: 10px 12px;
  background: var(--bg, #f4f6f5);
  border-radius: 10px;
  white-space: pre-line; 
}

.card-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 14px;
  border-top: 1px dashed var(--border, #e2e7e5);
  padding-top: 12px;
}
.copy-btn {
  font-size: 0.85rem;
  min-height: 38px;
  padding: 0 14px;
  border-radius: 10px;
}

.empty-card {
  text-align: center;
  padding: 3rem 1.5rem;
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}
.empty-icon {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}
.state-box {
  padding: 3rem 0;
}
@media (max-width: 400px) {
  .title { font-size: 1.4rem; }
  .tab-btn { padding: 0 8px; font-size: .85rem; }
  .head { grid-template-columns: 36px 1fr auto; gap: 10px; padding: 10px 12px; }
  .body { padding: 4px 14px 18px; }
}
</style>