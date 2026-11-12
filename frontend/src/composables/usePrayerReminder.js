import { reactive, ref, watch } from "vue";
import { getPrayerMonth } from "../api/prayer";

const SETTINGS = "equran:reminder";
const CACHE = "equran:prayer-cache";
const LOC = "equran:prayer-location";
const PRAYERS = [
  ["subuh", "Subuh"],
  ["dzuhur", "Dzuhur"],
  ["ashar", "Ashar"],
  ["maghrib", "Maghrib"],
  ["isya", "Isya"],
];

export const supported =
  typeof window !== "undefined" && "Notification" in window;
export const permission = ref(
  supported ? Notification.permission : "unsupported",
);

function load(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}
function store(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    /* penyimpanan tidak tersedia */
  }
}

const pad = (n) => String(n).padStart(2, "0");
const dateKey = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addDays = (d, n) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

export const reminder = reactive({
  enabled: false,
  lead: 0,
  ...load(SETTINGS, {}),
});
if (reminder.enabled && permission.value !== "granted")
  reminder.enabled = false;

/* ---------- Cache jadwal (dipakai walau halaman Jadwal Sholat tidak dibuka) ---------- */
export function saveScheduleCache(
  provinsi,
  kabkota,
  year,
  month,
  jadwal,
  reschedule = true,
) {
  let c = load(CACHE, null);
  if (!c || c.provinsi !== provinsi || c.kabkota !== kabkota)
    c = { provinsi, kabkota, days: {} };
  for (const d of jadwal ?? []) {
    const row = {};
    for (const [k] of PRAYERS) row[k] = d[k];
    c.days[`${year}-${pad(month)}-${pad(d.tanggal)}`] = row;
  }
  const oldest = dateKey(addDays(new Date(), -1));
  for (const k of Object.keys(c.days)) if (k < oldest) delete c.days[k];
  store(CACHE, c);
  if (reschedule) schedule();
}

// Bila jadwal hari ini/besok belum ada di cache, ambil dari lokasi yang tersimpan
async function refreshCache() {
  const loc = load(LOC, null);
  if (!loc?.provinsi || !loc?.kabkota) return;
  const has = (dt) => {
    const c = load(CACHE, null);
    return !!(
      c &&
      c.provinsi === loc.provinsi &&
      c.kabkota === loc.kabkota &&
      c.days[dateKey(dt)]
    );
  };
  const now = new Date();
  for (const dt of [now, addDays(now, 1)]) {
    if (has(dt)) continue;
    try {
      const y = dt.getFullYear();
      const m = dt.getMonth() + 1;
      const data = await getPrayerMonth(loc.provinsi, loc.kabkota, y, m);
      saveScheduleCache(loc.provinsi, loc.kabkota, y, m, data.jadwal, false);
    } catch {
      return;
    }
  }
}

/* ---------- Notifikasi ---------- */
export async function show(title, opts = {}) {
  const options = { vibrate: [200, 100, 200], ...opts };
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg) {
      await reg.showNotification(title, options);
      return true;
    }
  } catch {
    /* lanjut ke Notification biasa */
  }
  try {
    new Notification(title, options);
    return true;
  } catch {
    return false;
  }
}

export const testNotification = () =>
  show("Pengingat sholat aktif", {
    body: "Seperti inilah notifikasi waktu sholat akan muncul.",
    tag: "sholat-test",
  });

function notify(label, hhmm, when, kabkota) {
  const lead = reminder.lead;
  show(
    lead > 0
      ? `${lead} menit lagi masuk ${label}`
      : `Waktu ${label} telah masuk`,
    {
      body: `${label} ${hhmm}${kabkota ? ` · ${kabkota}` : ""}`,
      tag: `sholat-${label}-${new Date(when).toDateString()}`,
      data: { url: "/jadwal-sholat" },
    },
  );
}

/* ---------- Penjadwalan ---------- */
let timers = [];
const clearTimers = () => {
  timers.forEach(clearTimeout);
  timers = [];
};

export async function schedule() {
  clearTimers();
  if (!supported || !reminder.enabled || permission.value !== "granted") return;
  await refreshCache();
  clearTimers();
  const c = load(CACHE, null);
  if (!c) return;
  const now = Date.now();
  const horizon = now + 36 * 3600 * 1000;
  for (const [day, row] of Object.entries(c.days)) {
    const [Y, M, D] = day.split("-").map(Number);
    for (const [key, label] of PRAYERS) {
      const hhmm = row[key];
      if (!hhmm) continue;
      const [h, mi] = hhmm.split(":").map(Number);
      const when = new Date(Y, M - 1, D, h, mi, 0, 0).getTime();
      const fire = when - reminder.lead * 60000;
      if (fire > now && fire < horizon)
        timers.push(
          setTimeout(() => notify(label, hhmm, when, c.kabkota), fire - now),
        );
    }
  }
}

export async function ensurePermission() {
  if (!supported) return false;
  permission.value =
    Notification.permission === "default"
      ? await Notification.requestPermission()
      : Notification.permission;
  return permission.value === "granted";
}

export async function setEnabled(on) {
  if (!on) {
    reminder.enabled = false;
    return;
  }
  if (!supported) return;
  permission.value =
    Notification.permission === "default"
      ? await Notification.requestPermission()
      : Notification.permission;
  reminder.enabled = permission.value === "granted";
}

watch(
  reminder,
  () => {
    store(SETTINGS, { enabled: reminder.enabled, lead: reminder.lead });
    schedule();
  },
  { deep: true },
);

let started = false;
export function startReminderEngine() {
  if (started || typeof window === "undefined") return;
  started = true;
  if ("serviceWorker" in navigator)
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  schedule();
  setInterval(schedule, 30 * 60 * 1000);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible") return;
    if (supported) permission.value = Notification.permission;
    if (reminder.enabled && permission.value !== "granted")
      reminder.enabled = false;
    schedule();
  });
}
