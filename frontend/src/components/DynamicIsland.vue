<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount, h } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { theme, THEMES } from "../composables/useTheme";

/* ---------- Ikon (garis, ringan, tanpa dependensi) ---------- */
const ICONS = {
  book: ["M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5z", "M8 7h8"],
  heart: ["M12 21s-7-4.5-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.5-9 9-9 9z"],
  clock: ["M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z", "M12 7v5l3 2"],
  grid: ["M4 4h6.5v6.5H4z", "M13.5 4H20v6.5h-6.5z", "M4 13.5h6.5V20H4z", "M13.5 13.5H20V20h-6.5z"],
  calendar: ["M4 6h16v14H4z", "M4 10h16", "M8 3v4", "M16 3v4"],
  compass: ["M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z", "M15.5 8.5l-2 5-5 2 2-5z"],
  spark: ["M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z", "M18.5 16.5v3", "M17 18h3"],
  read: ["M2 5h7a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H2z", "M22 5h-7a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h8z"],
  coin: ["M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z", "M14.5 9.2c-.5-.8-1.4-1.2-2.5-1.2-1.5 0-2.5.8-2.5 1.9 0 2.6 5 1.3 5 4 0 1.1-1 1.9-2.5 1.9-1.1 0-2-.4-2.5-1.2", "M12 6.5V8", "M12 16v1.5"],
  sun: ["M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z", "M12 2v2", "M12 20v2", "M4.9 4.9l1.4 1.4", "M17.7 17.7l1.4 1.4", "M2 12h2", "M20 12h2", "M4.9 19.1l1.4-1.4", "M17.7 6.3l1.4-1.4"],
  moon: ["M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"],
  auto: ["M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z", "!M12 3a9 9 0 0 1 0 18z"],
  cup: ["M5 8h12v6a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5z", "M17 10h1.5a2.5 2.5 0 0 1 0 5H17", "M9 3v2", "M13 3v2"],
  chev: ["M6 9l6 6 6-6"],
};
const THEME_ICON = { auto: "auto", light: "sun", dark: "moon", sepia: "cup" };

// Komponen fungsional kecil: <Ico n="book" />
const Ico = (props) =>
  h(
    "svg",
    {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": 2,
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "aria-hidden": "true",
      focusable: "false",
    },
    (ICONS[props.n] ?? []).map((d, i) =>
      d.startsWith("!")
        ? h("path", { key: i, d: d.slice(1), fill: "currentColor", stroke: "none" })
        : h("path", { key: i, d }),
    ),
  );
Ico.props = ["n"];

/* ---------- Navigasi ---------- */
const NAV = [
  { to: "/", label: "Quran", full: "Quran", icon: "book" },
  { to: "/doa", label: "Doa", full: "Doa", icon: "heart" },
  { to: "/jadwal-sholat", label: "Sholat", full: "Waktu Sholat", icon: "clock" },
  { to: "/menu", label: "Lainnya", full: "Lainnya", icon: "grid" },
];

const PAGES = [
  { test: (p) => p === "/" || p.startsWith("/surah"), label: "Quran", icon: "book", tab: 0 },
  { test: (p) => p.startsWith("/doa"), label: "Doa", icon: "heart", tab: 1 },
  { test: (p) => p.startsWith("/jadwal-sholat"), label: "Waktu Sholat", icon: "clock", tab: 2 },
  { test: (p) => p.startsWith("/menu"), label: "Lainnya", icon: "grid", tab: 3 },
  { test: (p) => p.startsWith("/kalender"), label: "Kalender", icon: "calendar", tab: 3 },
  { test: (p) => p.startsWith("/kiblat"), label: "Kiblat", icon: "compass", tab: 3 },
  { test: (p) => p.startsWith("/dzikir"), label: "Dzikir", icon: "spark", tab: 3 },
  { test: (p) => p.startsWith("/tilawah"), label: "Tilawah", icon: "read", tab: 3 },
  { test: (p) => p.startsWith("/zakat"), label: "Zakat", icon: "coin", tab: 3 },
];

const route = useRoute();
const page = computed(
  () => PAGES.find((x) => x.test(route.path)) ?? { label: "QafWay", icon: "book", tab: -1 },
);

/* ---------- Sholat berikutnya (dibaca dari cache jadwal di perangkat) ---------- */
const CACHE_KEY = "equran:prayer-cache";
const PRAYERS = [
  ["subuh", "Subuh"],
  ["dzuhur", "Dzuhur"],
  ["ashar", "Ashar"],
  ["maghrib", "Maghrib"],
  ["isya", "Isya"],
];
const pad = (n) => String(n).padStart(2, "0");
const dateKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
function readCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY));
  } catch {
    return null;
  }
}

const now = ref(Date.now());
const cache = ref(readCache());

const next = computed(() => {
  const days = cache.value?.days;
  if (!days) return null;
  const base = new Date(now.value);
  for (let i = 0; i < 2; i++) {
    const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i);
    const row = days[dateKey(d)];
    if (!row) continue;
    for (const [k, label] of PRAYERS) {
      const t = row[k];
      if (!t) continue;
      const [hh, mm] = t.split(":").map(Number);
      const when = new Date(d.getFullYear(), d.getMonth(), d.getDate(), hh, mm).getTime();
      if (when > now.value) return { label, time: t, left: when - now.value };
    }
  }
  return null;
});
const soon = computed(() => !!next.value && next.value.left <= 15 * 60000);
function fmtLeft(ms) {
  const s = Math.ceil(ms / 1000);
  if (ms <= 15 * 60000) return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
  const hh = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  return hh > 0 ? `${hh}j ${mm}m` : `${mm} mnt`;
}
const leftText = computed(() => (next.value ? fmtLeft(next.value.left) : ""));
const chipText = computed(() =>
  next.value ? `${next.value.label} ${soon.value ? leftText.value : next.value.time}` : "",
);

let tick;
const refreshCache = () => (cache.value = readCache());

/* ---------- Buka / tutup ---------- */
const open = ref(false);
const compact = ref(false);
const headEl = ref(null);
const innerEl = ref(null);
const panelEl = ref(null);
let openedBy = "click";

function setOpen(v, by = "click") {
  if (v === open.value) return;
  open.value = v;
  if (v) {
    openedBy = by;
    compact.value = false;
    refreshCache();
    now.value = Date.now();
    try {
      navigator.vibrate?.(8); // getar halus di Android
    } catch {
      /* abaikan */
    }
  }
}
const close = () => setOpen(false);

function onToggle(e) {
  if (open.value) {
    // Dibuka lewat hover (mouse) lalu diklik: biarkan terbuka
    if (openedBy === "hover" && e.detail > 0) {
      openedBy = "click";
      return;
    }
    close();
  } else {
    setOpen(true, "click");
    // Dibuka dengan keyboard: pindahkan fokus ke menu pertama
    if (e.detail === 0) nextTick(() => panelEl.value?.querySelector("a,button")?.focus());
  }
}

let hoverT;
function onEnter(e) {
  if (e.pointerType !== "mouse") return;
  clearTimeout(hoverT);
  hoverT = setTimeout(() => setOpen(true, "hover"), 140);
}
function onLeave(e) {
  if (e.pointerType !== "mouse") return;
  clearTimeout(hoverT);
  if (open.value && openedBy === "hover") hoverT = setTimeout(close, 300);
}

function onKey(e) {
  if (e.key === "Escape" && open.value) {
    close();
    headEl.value?.focus();
  }
}

watch(
  () => route.fullPath,
  () => {
    close();
    compact.value = false;
    refreshCache();
  },
);

/* ---------- Mengecil saat menggulir ke bawah ---------- */
let lastY = 0;
let ticking = false;
function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    const y = window.scrollY;
    const dy = y - lastY;
    if (!open.value) {
      if (y < 80) compact.value = false;
      else if (dy > 8) compact.value = true;
      else if (dy < -8) compact.value = false;
    }
    if (Math.abs(dy) > 8) lastY = y;
    ticking = false;
  });
}

/* ---------- Lebar pil mengikuti isinya (agar bisa dianimasikan) ---------- */
const cw = ref(0);
function measure() {
  if (open.value || !innerEl.value) return;
  const w = Math.ceil(innerEl.value.getBoundingClientRect().width);
  if (w && w !== cw.value) cw.value = w;
}
let ro;
watch([() => page.value.label, chipText, compact], () => nextTick(measure));
watch(open, (v) => {
  if (!v) nextTick(measure);
});

/* ---------- Tema ---------- */
function syncThemeColor() {
  nextTick(() => {
    const bg = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim();
    let m = document.querySelector('meta[name="theme-color"]');
    if (!m) {
      m = document.createElement("meta");
      m.name = "theme-color";
      document.head.appendChild(m);
    }
    if (bg) m.content = bg;
  });
}
function setTheme(v) {
  if (v === theme.value) return;
  const el = document.documentElement;
  el.classList.add("theme-fade"); // transisi warna halus
  theme.value = v;
  setTimeout(() => el.classList.remove("theme-fade"), 450);
}
watch(theme, syncThemeColor);

let mq;
onMounted(() => {
  measure();
  if ("ResizeObserver" in window && innerEl.value) {
    ro = new ResizeObserver(measure);
    ro.observe(innerEl.value);
  }
  document.fonts?.ready?.then(measure);
  lastY = window.scrollY;
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("keydown", onKey);
  window.addEventListener("resize", measure, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      now.value = Date.now();
      refreshCache();
    }
  });
  tick = setInterval(() => {
    if (!document.hidden) now.value = Date.now();
  }, 1000);
  window.addEventListener("storage", refreshCache);
  mq = window.matchMedia?.("(prefers-color-scheme: dark)");
  mq?.addEventListener?.("change", syncThemeColor);
  syncThemeColor();
});
onBeforeUnmount(() => {
  clearInterval(tick);
  clearTimeout(hoverT);
  ro?.disconnect();
  window.removeEventListener("scroll", onScroll);
  window.removeEventListener("keydown", onKey);
  window.removeEventListener("resize", measure);
  window.removeEventListener("storage", refreshCache);
  mq?.removeEventListener?.("change", syncThemeColor);
});
</script>

<template>
  <Transition name="scrim">
    <div v-if="open" class="island-scrim" aria-hidden="true" @pointerdown.prevent="close"></div>
  </Transition>

  <div class="island-wrap">
    <div
      class="island"
      :class="{ open, compact: compact && !open, soon }"
      :style="cw ? { '--cw': cw + 'px' } : null"
      @pointerenter="onEnter"
      @pointerleave="onLeave"
    >
      <button
        ref="headEl"
        type="button"
        class="head"
        :aria-expanded="open"
        aria-controls="island-panel"
        :aria-label="`Menu navigasi. Halaman: ${page.label}`"
        @click="onToggle"
      >
        <span ref="innerEl" class="head-in">
          <Ico :n="page.icon" class="ic" />
          <span class="lbl">{{ page.label }}</span>
          <span v-if="next" class="nchip" :class="{ soon }" aria-hidden="true">
            <i class="dot"></i>{{ chipText }}
          </span>
          <Ico n="chev" class="chev" />
        </span>
      </button>

      <div id="island-panel" ref="panelEl" class="panel" :inert="open ? null : ''">
        <div class="panel-inner">
          <div class="panel-body">
            <div class="cap stg" style="--d: 0">QafWay</div>

            <nav class="tabs" aria-label="Menu utama" :style="{ '--i': Math.max(page.tab, 0) }">
              <span v-if="page.tab >= 0" class="hl" aria-hidden="true"></span>
              <RouterLink
                v-for="(n, i) in NAV"
                :key="n.to"
                :to="n.to"
                class="tab stg"
                :class="{ on: page.tab === i }"
                :style="{ '--d': i + 1 }"
                :aria-label="n.full"
                :aria-current="page.tab === i ? 'page' : null"
              >
                <Ico :n="n.icon" />
                <span>{{ n.label }}</span>
              </RouterLink>
            </nav>

            <RouterLink
              v-if="next"
              to="/jadwal-sholat"
              class="live stg"
              :class="{ soon }"
              style="--d: 5"
            >
              <i class="dot"></i>
              <span class="live-text">
                <small>Sholat berikutnya</small>
                <strong>{{ next.label }} · {{ next.time }}</strong>
              </span>
              <span class="left">{{ leftText }}</span>
            </RouterLink>

            <div class="themes stg" style="--d: 6" role="group" aria-label="Tema tampilan">
              <button
                v-for="t in THEMES"
                :key="t.value"
                type="button"
                class="tbtn"
                :class="{ on: theme === t.value }"
                :aria-pressed="theme === t.value"
                @click="setTheme(t.value)"
              >
                <Ico :n="THEME_ICON[t.value]" />
                <span>{{ t.label }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.island-wrap {
  position: fixed;
  top: calc(env(safe-area-inset-top, 0px) + 10px);
  left: 0;
  right: 0;
  z-index: 50;
  display: flex;
  justify-content: center;
  pointer-events: none;
}
.island-scrim {
  position: fixed;
  inset: 0;
  z-index: 40;
  background: rgba(6, 12, 10, 0.4);
  -webkit-backdrop-filter: blur(3px);
  backdrop-filter: blur(3px);
}
.scrim-enter-active,
.scrim-leave-active {
  transition: opacity 0.3s ease;
}
.scrim-enter-from,
.scrim-leave-to {
  opacity: 0;
}

/* ---------- Pil ---------- */
.island {
  --avail: calc(100vw - 24px - env(safe-area-inset-left, 0px) - env(safe-area-inset-right, 0px));
  pointer-events: auto;
  width: var(--cw, max-content);
  min-width: 44px;
  max-width: var(--avail);
  background: var(--island-bg);
  color: var(--island-fg);
  border-radius: 22px;
  overflow: hidden;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.08),
    0 8px 24px rgba(0, 0, 0, 0.28);
  transition:
    width 0.55s var(--spring),
    border-radius 0.55s var(--spring),
    box-shadow 0.3s ease;
  will-change: width;
}
.island.open {
  width: min(400px, var(--avail));
  border-radius: 30px;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.1),
    0 18px 48px rgba(0, 0, 0, 0.4);
}

.head {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 44px;
  margin: 0;
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-user-select: none;
  user-select: none;
}
.head:focus-visible {
  outline: 2px solid var(--island-accent);
  outline-offset: -3px;
  border-radius: inherit;
}
.head-in {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: max-content;
  height: 44px;
  padding: 0 14px;
  white-space: nowrap;
}
.island.open .head-in {
  width: 100%;
  padding: 0 16px 0 14px;
}
.ic {
  width: 20px;
  height: 20px;
  flex: none;
  color: var(--island-accent);
}
.lbl {
  font-size: 0.88rem;
  font-weight: 600;
  max-width: 9.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
}
.nchip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px 3px 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  font-size: 0.75rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.nchip.soon {
  background: rgba(79, 209, 192, 0.2);
  color: #c9f5ef;
}
.chev {
  display: none;
  width: 18px;
  height: 18px;
  margin-left: auto;
  opacity: 0.6;
  transition: transform 0.4s var(--spring);
}
.island.open .chev {
  display: block;
  transform: rotate(180deg);
}
.island.open .nchip {
  margin-left: auto;
}
.island.open .nchip + .chev {
  margin-left: 4px;
}

/* Titik status */
.dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--island-accent);
  flex: none;
}
.soon .dot {
  animation: pulse 1.4s ease-in-out infinite;
}
@keyframes pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(79, 209, 192, 0.6);
  }
  50% {
    box-shadow: 0 0 0 5px rgba(79, 209, 192, 0);
  }
}

/* Mode ringkas saat menggulir: hanya ikon */
.island.compact .lbl,
.island.compact .nchip {
  display: none;
}
.island.compact .head-in {
  padding: 0 12px;
}
@media (max-width: 359px) {
  .island:not(.open) .nchip {
    display: none;
  }
}

/* ---------- Panel ---------- */
.panel {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.55s var(--spring);
}
.island.open .panel {
  grid-template-rows: 1fr;
}
.panel-inner {
  min-height: 0;
  overflow: hidden;
  visibility: hidden;
  transition: visibility 0s 0.55s;
}
.island.open .panel-inner {
  visibility: visible;
  transition-delay: 0s;
}
.panel-body {
  display: grid;
  gap: 10px;
  padding: 2px 12px 14px;
}
.cap {
  padding-left: 4px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--island-accent);
  opacity: 0.9;
}

/* Isi panel muncul berurutan */
.stg {
  opacity: 0;
  transform: translateY(10px) scale(0.96);
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.island.open .stg {
  opacity: 1;
  transform: none;
  transition:
    opacity 0.3s ease calc(var(--d, 0) * 40ms + 90ms),
    transform 0.5s var(--spring) calc(var(--d, 0) * 40ms + 90ms);
}

/* Tab */
.tabs {
  position: relative;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}
.hl {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 25%;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.11);
  transform: translateX(calc(var(--i, 0) * 100%));
  transition: transform 0.5s var(--spring);
}
.tab {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-height: 64px;
  padding: 8px 2px;
  border-radius: 18px;
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.72rem;
  font-weight: 600;
  text-decoration: none;
  touch-action: manipulation;
}
.tab svg {
  width: 22px;
  height: 22px;
}
.tab.on {
  color: var(--island-accent);
}
.island.open .tab:active {
  transform: scale(0.94);
  transition-delay: 0s;
}
@media (hover: hover) {
  .tab:hover:not(.on) {
    color: #fff;
  }
}

/* Kartu sholat berikutnya */
.live {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 14px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.07);
  color: inherit;
  text-decoration: none;
}
.live.soon {
  background: rgba(79, 209, 192, 0.14);
}
.live-text {
  display: grid;
  line-height: 1.25;
  min-width: 0;
}
.live-text small {
  font-size: 0.7rem;
  opacity: 0.65;
}
.live-text strong {
  font-size: 0.95rem;
}
.left {
  margin-left: auto;
  font-size: 0.92rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--island-accent);
}

/* Pilihan tema */
.themes {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 4px;
  padding: 4px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.07);
}
.tbtn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  min-height: 52px;
  padding: 4px 2px;
  border: 0;
  border-radius: 14px;
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  font: inherit;
  font-size: 0.68rem;
  font-weight: 600;
  cursor: pointer;
  touch-action: manipulation;
  transition:
    background 0.2s ease,
    color 0.2s ease;
}
.tbtn svg {
  width: 18px;
  height: 18px;
}
.tbtn.on {
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
}
.tbtn:focus-visible,
.tab:focus-visible,
.live:focus-visible {
  outline: 2px solid var(--island-accent);
  outline-offset: -2px;
}
</style>