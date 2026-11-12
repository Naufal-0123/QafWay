import { reactive, watch } from "vue";
import { getFastingMonth } from "../api/fasting";
import { computeStats } from "./useTilawah";
import {
  supported,
  permission,
  show,
  ensurePermission,
} from "./usePrayerReminder";

// Halaman yang dibuka saat notifikasi diketuk (ubah jika rute Anda berbeda)
const ROUTES = { fasting: "/kalender", tilawah: "/tilawah" };
const TOTAL_AYAT = 6236; // jumlah ayat Al-Qur'an, dipakai untuk menghitung target harian

const KEY = "equran:daily-reminders";

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? {};
  } catch {
    return {};
  }
}
const saved = load();

export const daily = reactive({
  fasting: { enabled: false, time: "19:00", ...saved.fasting },
  tilawah: { enabled: false, time: "19:30", ...saved.tilawah },
});
if (!supported || permission.value !== "granted") {
  daily.fasting.enabled = false;
  daily.tilawah.enabled = false;
}

const pad = (n) => String(n).padStart(2, "0");
const fmt = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addDays = (d, n) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
const at = (time, offsetDays) => {
  const [h, m] = time.split(":").map(Number);
  const d = addDays(new Date(), offsetDays);
  d.setHours(h, m, 0, 0);
  return d;
};

/* ---------- Data puasa (di-cache per bulan selama sesi) ---------- */
const fastingCache = new Map();
async function fastingOn(date) {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const k = `${y}-${m}`;
  if (!fastingCache.has(k))
    fastingCache.set(k, (await getFastingMonth(y, m)).days);
  return fastingCache.get(k).find((d) => d.gregorian === fmt(date)) ?? null;
}
// Sama dengan kartu "Puasa sunnah berikutnya": bukan hari terlarang dan bukan Ramadhan
const isSunnahDay = (d) =>
  d && !d.forbidden && d.kinds.some((k) => k.key !== "ramadhan");

/* ---------- Notifikasi ---------- */
function notifyFasting(d) {
  const labels = d.kinds
    .filter((k) => k.key !== "ramadhan")
    .map((k) => k.label)
    .join(" + ");
  show(`Besok puasa sunnah: ${labels}`, {
    body: `${d.weekday}, ${d.hijri.day} ${d.hijri.monthName}. Siapkan niat dan sahur.`,
    tag: `puasa-${d.gregorian}`,
    data: { url: ROUTES.fasting },
  });
}

function notifyTilawah() {
  let s;
  try {
    s = computeStats(TOTAL_AYAT);
  } catch {
    return;
  }
  if (s.done || s.todayRead >= s.perDay) return; // sudah khatam atau target hari ini tercapai
  const streak = s.streak > 0 ? ` Jaga ${s.streak} hari beruntunmu.` : "";
  show("Waktunya tilawah", {
    body: `Target hari ini ${s.perDay} ayat, baru ${s.todayRead}.${streak}`,
    tag: "tilawah-harian",
    data: { url: ROUTES.tilawah },
  });
}

/* ---------- Penjadwalan ---------- */
let timers = [];
let runId = 0;
const clearTimers = () => {
  timers.forEach(clearTimeout);
  timers = [];
};

export async function scheduleDaily() {
  const run = ++runId;
  clearTimers();
  if (!supported || permission.value !== "granted") return;
  const now = Date.now();
  const horizon = now + 36 * 3600 * 1000;
  const upcoming = (time) =>
    [0, 1]
      .map((o) => at(time, o))
      .filter((d) => d.getTime() > now && d.getTime() < horizon);

  if (daily.tilawah.enabled) {
    for (const fire of upcoming(daily.tilawah.time)) {
      timers.push(setTimeout(notifyTilawah, fire.getTime() - now));
    }
  }

  if (daily.fasting.enabled) {
    for (const fire of upcoming(daily.fasting.time)) {
      try {
        const d = await fastingOn(addDays(fire, 1)); // pengingat malam hari untuk puasa besok
        if (run !== runId) return; // ada penjadwalan yang lebih baru
        if (isSunnahDay(d))
          timers.push(setTimeout(() => notifyFasting(d), fire.getTime() - now));
      } catch {
        /* data puasa gagal dimuat; dicoba lagi pada penjadwalan berikutnya */
      }
    }
  }
}

export async function setDailyEnabled(kind, on) {
  if (!on) {
    daily[kind].enabled = false;
    return true;
  }
  const ok = await ensurePermission();
  daily[kind].enabled = ok;
  return ok;
}

watch(
  daily,
  () => {
    try {
      localStorage.setItem(KEY, JSON.stringify(daily));
    } catch {
      /* penyimpanan tidak tersedia */
    }
    scheduleDaily();
  },
  { deep: true },
);

let started = false;
export function startDailyReminders() {
  if (started || typeof window === "undefined") return;
  started = true;
  scheduleDaily();
  setInterval(scheduleDaily, 30 * 60 * 1000);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible") return;
    if (supported) permission.value = Notification.permission;
    if (permission.value !== "granted") {
      daily.fasting.enabled = false;
      daily.tilawah.enabled = false;
    }
    scheduleDaily();
  });
}
