<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Number, default: 0 },
  placeholder: { type: String, default: '0' },
})
const emit = defineEmits(['update:modelValue'])

const text = computed(() => (props.modelValue ? props.modelValue.toLocaleString('id-ID') : ''))

function onInput(e) {
  const digits = e.target.value.replace(/\D/g, '').slice(0, 15)
  const n = digits ? Number(digits) : 0
  emit('update:modelValue', n)
  e.target.value = n ? n.toLocaleString('id-ID') : ''
}
</script>

<template>
  <div class="money">
    <span class="rp">Rp</span>
    <input type="text" inputmode="numeric" autocomplete="off" :value="text" :placeholder="placeholder" @input="onInput" />
  </div>
</template>

<style scoped>
.money { position: relative; }
.rp {
  position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
  color: var(--muted, #62716c); font-size: .9rem; pointer-events: none;
}
input {
  width: 100%; height: 46px; padding: 0 12px 0 38px; font-size: 16px; border-radius: 10px; min-width: 0;
  border: 1px solid var(--border, #e2e7e5); background: var(--bg, #fff); color: var(--text, #17201e);
  box-sizing: border-box;
}
input:focus { outline: none; border-color: var(--primary, #0f766e); box-shadow: 0 0 0 3px var(--primary-soft, #dcefea); }
</style>