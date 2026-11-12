<script setup>
import { ref, computed, onMounted } from 'vue'
import { getDoaList } from '../api/doa'

const items = ref([])
const loading = ref(true)
const error = ref('')
const query = ref('')
const group = ref('')
const openId = ref(null)

onMounted(async () => {
  try {
    const data = await getDoaList()
    items.value = data.items ?? []
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})

const groupOf = (d) => d.grup || 'Lainnya'

const groups = computed(() => [...new Set(items.value.map(groupOf))].sort((a, b) => a.localeCompare(b, 'id')))

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return items.value.filter((d) => {
    if (group.value && groupOf(d) !== group.value) return false
    if (!q) return true
    const hay = [d.nama, d.idn, d.tr, ...(d.tag ?? [])].join(' ').toLowerCase()
    return hay.includes(q)
  })
})

const toggle = (id) => (openId.value = openId.value === id ? null : id)

const copied = ref(null)
async function copy(d) {
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
  <div class="doa">
    <h1>Doa &amp; Dzikir</h1>

    <!-- Bagian Filter & Pencarian yang Disempurnakan -->
    <div class="filters">
      <input 
        v-model="query" 
        class="input search-input" 
        type="search" 
        placeholder="Cari doa atau dzikir…" 
        aria-label="Cari doa" 
        autocomplete="off" 
      />

      <!-- <select v-if="groups.length" v-model="group" class="filter-select" aria-label="Kategori doa">
        <option value="">Semua kategori</option>
        <option v-for="g in groups" :key="g" :value="g">{{ g }}</option>
      </select> -->
    </div>

    <p v-if="loading" class="muted center">Memuat…</p>
    <p v-else-if="error" class="error center">{{ error }}</p>
    <p v-else class="muted count" aria-live="polite">{{ filtered.length }} bacaan ditemukan</p>

    <article v-for="d in filtered" :key="d.id" class="card doa-card">
      <button class="head" :aria-expanded="openId === d.id" @click="toggle(d.id)">
        <span class="num">{{ d.id }}</span>
        <span class="nama">{{ d.nama }}</span>
        <span class="chev" :class="{ up: openId === d.id }" aria-hidden="true"></span>
      </button>

      <div v-if="openId === d.id" class="body">
        <p class="ar" dir="rtl" lang="ar">{{ d.ar }}</p>
        <p v-if="d.tr" class="tr">{{ d.tr }}</p>
        <p v-if="d.idn" class="idn">{{ d.idn }}</p>
        <p v-if="d.tentang" class="tentang muted">{{ d.tentang }}</p>
        <button class="btn primary-btn" @click="copy(d)">{{ copied === d.id ? 'Tersalin ✓' : 'Salin doa' }}</button>
        <div v-if="d.tag?.length" class="tags">
          <span v-for="t in d.tag" :key="t" class="tag">{{ t }}</span>
        </div>
      </div>
    </article>

    <p v-if="!loading && !error && !filtered.length" class="muted center">Doa tidak ditemukan.</p>
  </div>
</template>

<style scoped>
.center { text-align: center; }

/* Perbaikan Tata Letak Filter & Search agar Sejajar dan Nyaman */
.filters { 
  display: grid; 
  gap: .8rem; 
  margin-bottom: .6rem; 
}

.search-input {
  width: 100%;
}

.filter-select { 
  width: 100%; 
  margin: 0; 
}

@media (min-width: 640px) { 
  .filters { 
    grid-template-columns: 1fr auto; 
    align-items: center; 
  } 
  .filter-select {
    min-width: 200px;
  }
}

.count { 
  margin: .6rem 0 1rem; 
  font-size: .85rem; 
}

.card.doa-card { 
  padding: 0; 
  margin: .6rem 0; 
  overflow: hidden; 
  transition: border-color 0.2s ease;
}

.card.doa-card:hover {
  border-color: var(--primary);
}

.head {
  width: 100%; 
  min-height: 60px; 
  display: grid; 
  grid-template-columns: auto 1fr auto; 
  gap: .8rem; 
  align-items: center;
  padding: .8rem 1rem; 
  border: 0; 
  background: transparent; 
  cursor: pointer; 
  text-align: left; 
  font: inherit; 
  color: inherit;
}

.head:hover { 
  background: var(--primary-soft); 
}

.nama { 
  font-weight: 600; 
  line-height: 1.4; 
}

.chev { 
  width: .55rem; 
  height: .55rem; 
  margin: 0 .3rem .15rem 0; 
  border-right: 2px solid var(--muted); 
  border-bottom: 2px solid var(--muted); 
  transform: rotate(45deg); 
  transition: transform .2s ease; 
}

.chev.up { 
  transform: rotate(-135deg); 
  margin: .15rem .3rem 0 0; 
}

.body { 
  padding: .4rem 1.2rem 1.4rem; 
  border-top: 1px solid var(--border);
  background: var(--surface);
}

.ar { 
  font-size: clamp(1.7rem, 6.5vw, 2.1rem); 
  line-height: 2.4; 
  margin: .6rem 0 .8rem; 
  font-family: var(--arab-font); 
  text-align: right;
}

.tr { 
  color: var(--primary); 
  font-style: italic; 
  margin: .4rem 0; 
  font-size: .95rem;
}

.idn { 
  margin: .6rem 0; 
  line-height: 1.6;
}

.tentang { 
  font-size: .88rem; 
  margin: .8rem 0; 
  white-space: pre-line; 
  line-height: 1.5;
}

.primary-btn {
  margin-top: .4rem;
}

.tags { 
  display: flex; 
  flex-wrap: wrap; 
  gap: .4rem; 
  margin-top: 1rem; 
}

.tag { 
  font-size: .75rem; 
  padding: .15rem .75rem; 
  border-radius: 999px; 
  background: var(--gold-soft); 
  color: var(--gold); 
  font-weight: 500;
}
</style>