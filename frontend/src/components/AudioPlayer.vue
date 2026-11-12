<!-- AudioPlayer.vue -->
<script setup>
defineProps({ src: { type: String, default: "" } });
defineEmits(["timeupdate"]);
</script>

<template>
  <audio
    v-if="src"
    :src="src"
    controls
    preload="none"
    class="audio"
    @timeupdate="$emit('timeupdate', $event.target.currentTime)"
  ></audio>
  <p v-else class="muted">Audio tidak tersedia untuk qari ini.</p>
</template>
