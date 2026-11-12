<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const menuItems = [
 
  {
    title: 'Kalender Hijriyah & Puasa Sunnah',
    desc: 'Tanggal dan hari besar',
    icon: '📅',
    path: '/kalender'
  },
  {
    title: 'Arah Kiblat',
    desc: 'Kompas ke Ka\'bah',
    icon: '🧭',
    path: '/kiblat'
  },
  {
    title: 'Dzikir Pagi & Petang',
    desc: 'Amalan harian penenang hati',
    icon: '📿',
    path: '/dzikir'
  },
  {
    title: 'Tracker Tilawah',
    desc: 'Target dan progres khatam',
    icon: '📖',
    path: '/tilawah'
  }
]
</script>

<template>
  <div class="lainnya-container">
    <h2>Lainnya</h2>
    <div class="grid-menu">
      <div 
        v-for="item in menuItems" 
        :key="item.title" 
        class="card menu-card" 
        @click="router.push(item.path)"
      >
        <span class="icon">{{ item.icon }}</span>
        <div class="menu-info">
          <h3>{{ item.title }}</h3>
          <p class="muted">{{ item.desc }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lainnya-container {
  max-width: 900px;
  margin: 0 auto;
}
.grid-menu {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr));
  gap: .8rem;
  margin-top: 1rem;
}
.menu-card {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.2rem;
  cursor: pointer;
  border-radius: 16px;
  border: 1px solid var(--border, #e2e7e5);
  background: var(--surface, #ffffff);
  min-width: 0;
  transition: border-color 0.2s ease, transform 0.2s ease;
}
.menu-card:active { transform: scale(.98); }
@media (hover: hover) {
  .menu-card:hover {
    border-color: var(--primary, #0f766e);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  }
}
.icon {
  font-size: 1.8rem;
  flex: none;
}
.menu-info { min-width: 0; }
.menu-info h3 {
  margin: 0 0 4px;
  font-size: 1rem;
  font-weight: 600;
}
.menu-info p {
  margin: 0;
  font-size: 0.85rem;
}
.muted {
  color: var(--muted, #62716c);
}
</style>