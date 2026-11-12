<script setup>
import { computed } from 'vue'
import { daily, setDailyEnabled } from '../composables/useDailyReminders'
import { supported, permission } from '../composables/usePrayerReminder'

const props = defineProps({
  kind: { type: String, required: true }, // 'fasting' | 'tilawah'
  title: { type: String, required: true },
  description: { type: String, default: '' },
})

const TIMES = {
  fasting: ['18:00', '19:00', '20:00', '21:00', '22:00'],
  tilawah: ['05:30', '12:30', '16:30', '19:30', '21:00'],
}

const cfg = computed(() => daily[props.kind])
const times = computed(() => TIMES[props.kind])
const hint = computed(() => {
  if (!supported) return 'Browser ini belum mendukung notifikasi.'
  if (permission.value === 'denied') return 'Notifikasi diblokir. Izinkan lewat pengaturan situs di browser.'
  return props.description
})
</script>

<template>
  <section class="card reminder-toggle">
    <div class="row">
      <div class="text">
        <strong>{{ title }}</strong>
        <small class="muted">{{ hint }}</small>
      </div>
      <button
        class="switch"
        role="switch"
        :aria-checked="cfg.enabled"
        :aria-label="title"
        :disabled="!supported || permission === 'denied'"
        @click="setDailyEnabled(kind, !cfg.enabled)"
      ><span></span></button>
    </div>

    <div v-if="cfg.enabled" class="opts">
      <label>
        Ingatkan pukul
        <select v-model="cfg.time">
          <option v-for="t in times" :key="t" :value="t">{{ t.replace(':', '.') }}</option>
        </select>
      </label>
      <small class="muted">Pengingat berjalan selama e-Quran terbuka (tab atau aplikasi terpasang).</small>
    </div>
  </section>
</template>

<style scoped>
.row { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.text { display: grid; min-width: 0; }
.opts { display: grid; gap: .5rem; margin-top: .8rem; }
.opts label { display: flex; align-items: center; flex-wrap: wrap; gap: .4rem; font-size: .9rem; color: var(--muted, #62716c); }
.opts select { margin: 0; }
</style>