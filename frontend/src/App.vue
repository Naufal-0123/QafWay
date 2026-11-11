<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header class="topbar">
    <div class="container topbar-inner">
      <RouterLink to="/" class="brand">e-Quran</RouterLink>
      <nav>
        <RouterLink to="/">Al-Qur'an</RouterLink>
        <RouterLink to="/kalender">Kalender Hijriyah</RouterLink>
      </nav>
    </div>
  </header>
  <main class="container">
    <RouterView />
  </main>
</template>