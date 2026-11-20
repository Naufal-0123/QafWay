<script setup>
import { watch, onMounted } from "vue";
import { RouterView, useRoute } from "vue-router";
import DynamicIsland from "./components/DynamicIsland.vue";
import ScrollTopButton from "./components/ScrollTopButton.vue";
import { keepAwake } from "./composables/useWakeLock";
import { startReminderEngine } from "./composables/usePrayerReminder";

const route = useRoute();

// Layar tetap menyala saat membaca surah, tafsir, dan doa (termasuk saat audio diputar)
watch(
  () => route.path,
  (p) => keepAwake(/^\/(surah|doa)/.test(p)),
  { immediate: true },
);

onMounted(startReminderEngine);
</script>

<template>
  <a href="#main" class="skip-link">Lewati ke konten</a>
  <DynamicIsland />
  <main id="main" class="container" tabindex="-1">
    <RouterView v-slot="{ Component, route: r }">
      <!-- Kunci memakai nama route: berpindah antar surah tidak memuat ulang halaman -->
      <Transition name="page" mode="out-in">
        <div :key="r.name ?? r.path" class="page">
          <component :is="Component" />
        </div>
      </Transition>
    </RouterView>
  </main>
  <ScrollTopButton />
</template>