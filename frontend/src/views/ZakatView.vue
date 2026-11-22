<script setup>
import { ref, reactive, computed, watch } from 'vue'
import MoneyInput from '../components/MoneyInput.vue'

/* ---------- Konstanta (ketentuan syariat / BAZNAS) ---------- */
const RATE = 0.025 // 2,5%
const NISAB_EMAS_GRAM = 85 // nisab emas
const NISAB_BERAS_KG = 524 // 653 kg gabah ≈ 524 kg beras (acuan BAZNAS untuk zakat penghasilan)
const FITRAH_KG = 2.5 // per jiwa (≈ 3,5 liter)

const rupiah = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
    Math.round(n || 0),
  )
const num = (v) => (Number.isFinite(Number(v)) && Number(v) > 0 ? Number(v) : 0)

/* ---------- Harga acuan (disimpan lokal, diisi pengguna) ---------- */
const STORE_KEY = 'qafway-zakat-prices'
const prices = reactive({ emas: 0, beras: 0 })
try {
  const saved = JSON.parse(localStorage.getItem(STORE_KEY) || '{}')
  prices.emas = num(saved.emas)
  prices.beras = num(saved.beras)
} catch {
  /* abaikan */
}
watch(
  prices,
  () => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({ emas: prices.emas, beras: prices.beras }))
    } catch {
      /* abaikan */
    }
  },
  { deep: true },
)

const tab = ref('maal')
const tabs = [
  { id: 'maal', label: 'Zakat Maal' },
  { id: 'penghasilan', label: 'Penghasilan' },
  { id: 'fitrah', label: 'Fitrah' },
]

/* ---------- Zakat Fitrah ---------- */
const fitrah = reactive({ jiwa: 1 })
const fitrahResult = computed(() => {
  const jiwa = Math.max(0, Math.floor(num(fitrah.jiwa)))
  const kg = jiwa * FITRAH_KG
  return { jiwa, kg, uang: kg * prices.beras, ready: prices.beras > 0 && jiwa > 0 }
})

/* ---------- Zakat Maal ---------- */
const maal = reactive({
  tunai: 0,
  emasGram: 0,
  investasi: 0,
  piutang: 0,
  usaha: 0,
  hutang: 0,
  haul: true,
})
const maalResult = computed(() => {
  const emasNilai = num(maal.emasGram) * prices.emas
  const bruto = maal.tunai + emasNilai + maal.investasi + maal.piutang + maal.usaha
  const neto = Math.max(0, bruto - maal.hutang)
  const nisab = NISAB_EMAS_GRAM * prices.emas
  const ready = prices.emas > 0
  const wajib = ready && maal.haul && neto >= nisab
  return { bruto, neto, nisab, ready, wajib, zakat: wajib ? neto * RATE : 0 }
})

/* ---------- Zakat Penghasilan ---------- */
const income = reactive({ gaji: 0, lain: 0, cicilan: 0, basis: 'emas' })
const incomeResult = computed(() => {
  const neto = Math.max(0, income.gaji + income.lain - income.cicilan)
  const nisabTahun = income.basis === 'emas' ? NISAB_EMAS_GRAM * prices.emas : NISAB_BERAS_KG * prices.beras
  const nisabBulan = nisabTahun / 12
  const ready = nisabTahun > 0
  const wajib = ready && neto >= nisabBulan
  return { neto, nisabTahun, nisabBulan, ready, wajib, zakat: wajib ? neto * RATE : 0 }
})
</script>

<template>
  <div class="zakat">
    <h1 class="title">Kalkulator Zakat</h1>

    <section class="card">
      <h2>Harga acuan</h2>
      <p class="muted small">Isi sesuai harga terbaru di daerah Anda. Tersimpan di perangkat ini.</p>
      <label class="field">
        Harga emas per gram
        <MoneyInput v-model="prices.emas" placeholder="contoh: harga emas hari ini" />
      </label>
      <label class="field">
        Harga beras per kg
        <MoneyInput v-model="prices.beras" placeholder="contoh: harga beras yang Anda konsumsi" />
      </label>
    </section>

    <div class="tabs" role="tablist">
      <button
        v-for="t in tabs"
        :key="t.id"
        role="tab"
        class="tab"
        :class="{ on: tab === t.id }"
        :aria-selected="tab === t.id"
        @click="tab = t.id"
      >
        {{ t.label }}
      </button>
    </div>

    <!-- ===== MAAL ===== -->
    <section v-if="tab === 'maal'" class="card">
      <p class="muted small">
        Wajib jika total harta bersih mencapai nisab ({{ NISAB_EMAS_GRAM }} gram emas) dan sudah dimiliki
        selama satu tahun (haul). Kadar 2,5%.
      </p>
      <label class="field">Uang tunai, tabungan, deposito<MoneyInput v-model="maal.tunai" /></label>
      <label class="field">
        Emas yang disimpan (gram)
        <input v-model.number="maal.emasGram" type="number" min="0" step="0.01" inputmode="decimal" placeholder="0" />
      </label>
      <label class="field">Saham, reksa dana, investasi lain<MoneyInput v-model="maal.investasi" /></label>
      <label class="field">Piutang yang pasti kembali<MoneyInput v-model="maal.piutang" /></label>
      <label class="field">Aset usaha / barang dagangan<MoneyInput v-model="maal.usaha" /></label>
      <label class="field">Hutang jatuh tempo (pengurang)<MoneyInput v-model="maal.hutang" /></label>
      <label class="check"><input v-model="maal.haul" type="checkbox" /> Harta sudah dimiliki 1 tahun (haul)</label>

      <div class="result" :class="{ ok: maalResult.wajib }">
        <div class="row"><span>Harta bersih</span><strong>{{ rupiah(maalResult.neto) }}</strong></div>
        <div class="row">
          <span>Nisab</span><strong>{{ maalResult.ready ? rupiah(maalResult.nisab) : '—' }}</strong>
        </div>
        <p v-if="!maalResult.ready" class="hint">Isi harga emas di atas untuk menghitung nisab.</p>
        <p v-else-if="!maal.haul" class="hint">Belum wajib: harta belum mencapai satu tahun.</p>
        <p v-else-if="!maalResult.wajib" class="hint">Belum wajib: harta belum mencapai nisab.</p>
        <template v-else>
          <p class="hint">Sudah wajib zakat. Zakat yang dikeluarkan:</p>
          <p class="big">{{ rupiah(maalResult.zakat) }}</p>
        </template>
      </div>
    </section>

    <!-- ===== PENGHASILAN ===== -->
    <section v-else-if="tab === 'penghasilan'" class="card">
      <p class="muted small">
        Dihitung dari penghasilan bulanan. Wajib jika penghasilan bersih sebulan mencapai nisab tahunan dibagi 12.
        Kadar 2,5%.
      </p>
      <label class="field">Gaji / penghasilan per bulan<MoneyInput v-model="income.gaji" /></label>
      <label class="field">Penghasilan lain per bulan (bonus, usaha sampingan)<MoneyInput v-model="income.lain" /></label>
      <label class="field">Cicilan hutang pokok per bulan (opsional)<MoneyInput v-model="income.cicilan" /></label>
      <label class="field">
        Dasar nisab
        <select v-model="income.basis">
          <option value="emas">Emas ({{ NISAB_EMAS_GRAM }} gram)</option>
          <option value="beras">Beras ({{ NISAB_BERAS_KG }} kg, acuan BAZNAS)</option>
        </select>
      </label>

      <div class="result" :class="{ ok: incomeResult.wajib }">
        <div class="row"><span>Penghasilan bersih / bulan</span><strong>{{ rupiah(incomeResult.neto) }}</strong></div>
        <div class="row">
          <span>Nisab / bulan</span
          ><strong>{{ incomeResult.ready ? rupiah(incomeResult.nisabBulan) : '—' }}</strong>
        </div>
        <p v-if="!incomeResult.ready" class="hint">
          Isi harga {{ income.basis === 'emas' ? 'emas' : 'beras' }} di atas untuk menghitung nisab.
        </p>
        <p v-else-if="!incomeResult.wajib" class="hint">Belum wajib: penghasilan belum mencapai nisab bulanan.</p>
        <template v-else>
          <p class="hint">Sudah wajib zakat. Zakat per bulan:</p>
          <p class="big">{{ rupiah(incomeResult.zakat) }}</p>
        </template>
      </div>
    </section>

    <!-- ===== FITRAH ===== -->
    <section v-else class="card">
      <p class="muted small">
        Zakat fitrah wajib bagi setiap jiwa: {{ FITRAH_KG }} kg beras (± 3,5 liter), ditunaikan sebelum sholat Idulfitri.
      </p>
      <label class="field">
        Jumlah jiwa
        <input v-model.number="fitrah.jiwa" type="number" min="1" step="1" inputmode="numeric" />
      </label>

      <div class="result" :class="{ ok: fitrahResult.ready }">
        <div class="row"><span>Dalam bentuk beras</span><strong>{{ fitrahResult.kg }} kg</strong></div>
        <p v-if="!fitrahResult.ready" class="hint">Isi harga beras di atas untuk melihat nilai uangnya.</p>
        <template v-else>
          <p class="hint">Jika dibayar dengan uang:</p>
          <p class="big">{{ rupiah(fitrahResult.uang) }}</p>
        </template>
      </div>
    </section>
  </div>
</template>

<style scoped>
.zakat { max-width: 900px; margin: 0 auto; }
.title { margin: 8px 0 12px; font-size: 1.5rem; }
h2 { font-size: 1.05rem; margin: 0 0 4px; }
.muted { color: var(--muted, #62716c); }
.small { font-size: .85rem; margin: 0; }
.note { font-size: .8rem; margin-top: 18px; }

.card {
  margin-top: 14px; padding: 14px; border-radius: 14px; display: grid; gap: 12px;
  border: 1px solid var(--border, #e2e7e5); background: var(--surface, #f4f6f5);
}
.field { display: grid; gap: 4px; font-size: .85rem; color: var(--muted, #62716c); min-width: 0; }
.field input[type='number'] {
  height: 46px; padding: 0 12px; font-size: 16px; border-radius: 10px; min-width: 0; box-sizing: border-box;
  border: 1px solid var(--border, #e2e7e5); background: var(--bg, #fff); color: var(--text, #17201e);
}
.field input[type='number']:focus { outline: none; border-color: var(--primary, #0f766e); box-shadow: 0 0 0 3px var(--primary-soft, #dcefea); }
.field select { width: 100%; margin: 0; }
.check { display: flex; align-items: center; gap: 8px; font-size: .9rem; }

.tabs { display: flex; gap: 6px; margin-top: 14px; overflow-x: auto; }
.tab {
  flex: 1 0 auto; min-height: 42px; padding: 0 14px; border-radius: 999px; cursor: pointer; font: inherit;
  border: 1px solid var(--border, #e2e7e5); background: var(--surface, #f4f6f5); color: var(--text, #17201e);
}
.tab.on { background: var(--primary, #0f766e); border-color: var(--primary, #0f766e); color: var(--on-primary, #fff); }

.result { padding: 14px; border-radius: 12px; background: var(--bg, #fff); border: 1px solid var(--border, #e2e7e5); }
.result.ok { background: var(--primary-soft, #dcefea); border-color: var(--primary, #0f766e); }
.row { display: flex; justify-content: space-between; gap: 10px; flex-wrap: wrap; padding: 4px 0; font-size: .92rem; }
.hint { margin: 8px 0 0; font-size: .88rem; color: var(--muted, #62716c); }
.big { margin: 2px 0 0; font-size: 1.7rem; font-weight: 700; color: var(--primary, #0f766e); }
</style>