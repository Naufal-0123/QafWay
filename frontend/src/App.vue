<script setup>
import { computed, watch, onMounted } from "vue";
import { RouterLink, RouterView, useRoute } from "vue-router";
import ScrollTopButton from "./components/ScrollTopButton.vue";
import { theme, THEMES } from "./composables/useTheme";
import { keepAwake } from "./composables/useWakeLock";
import { startReminderEngine } from "./composables/usePrayerReminder";

const route = useRoute();
// Tab "Quran" tetap aktif di halaman detail surah dan tafsir
const inQuran = computed(
  () => route.path === "/" || route.path.startsWith("/surah"),
);

// Layar tetap menyala saat membaca surah, tafsir, dan doa (termasuk saat audio diputar)
watch(
  () => route.path,
  (p) => keepAwake(/^\/(surah|doa)/.test(p)),
  { immediate: true },
);

onMounted(startReminderEngine);
</script>

<template>
  <header class="topbar">
    <div class="topbar-inner">
      <RouterLink to="/" class="brand">QafWay</RouterLink>
      <nav aria-label="Menu utama">
        <RouterLink to="/" :class="{ 'router-link-exact-active': inQuran }">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5z"/></svg>
          <span>Quran</span>
        </RouterLink>
        <RouterLink to="/doa">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-4.5-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.5-9 9-9 9z"/></svg>
          <span>Doa</span>
        </RouterLink>
         <RouterLink to="/jadwal-sholat">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
          <span>Waktu Sholat</span>
        </RouterLink>
        <RouterLink to="/menu">Lainnya</RouterLink>
      </nav>
      <select v-model="theme" class="theme-select" aria-label="Tema tampilan">
        <option v-for="t in THEMES" :key="t.value" :value="t.value">{{ t.label }}</option>
      </select>
    </div>
  </header>
  <main class="container">
    <RouterView />
  </main>
  <ScrollTopButton />
</template>