import { reactive, watch } from "vue";

const KEY = "equran:tilawah";

const pad = (n) => String(n).padStart(2, "0");
export const fmtDate = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const todayStr = () => fmtDate(new Date());

const parse = (s) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const daysBetween = (a, b) => Math.round((parse(b) - parse(a)) / 86400000);

function load() {
  const fresh = { target: { startDate: todayStr(), days: 30 }, logs: [] };
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "null");
    if (v && Array.isArray(v.logs)) {
      return {
        target: v.target?.startDate && v.target?.days ? v.target : fresh.target,
        logs: v.logs,
      };
    }
  } catch {
    /* abaikan */
  }
  return fresh;
}

export const tilawah = reactive(load());

watch(
  tilawah,
  (v) => {
    try {
      localStorage.setItem(KEY, JSON.stringify(v));
    } catch {
      /* penyimpanan tidak tersedia */
    }
  },
  { deep: true },
);

export function addLog({ surah, from, to }) {
  tilawah.logs.push({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    date: todayStr(),
    surah,
    from,
    to,
  });
}

export function removeLog(id) {
  const i = tilawah.logs.findIndex((l) => l.id === id);
  if (i >= 0) tilawah.logs.splice(i, 1);
}

// Mulai target baru dari hari ini
export function setTarget(days) {
  tilawah.target = { startDate: todayStr(), days };
}

// Jumlah ayat unik yang pernah dibaca (rentang yang tumpang tindih tidak dihitung dua kali)
export function coveredAyat(logs) {
  const bySurah = {};
  for (const l of logs) (bySurah[l.surah] ??= []).push([l.from, l.to]);
  let total = 0;
  for (const ranges of Object.values(bySurah)) {
    ranges.sort((a, b) => a[0] - b[0]);
    let [cs, ce] = ranges[0];
    for (const [s, e] of ranges.slice(1)) {
      if (s <= ce + 1) ce = Math.max(ce, e);
      else {
        total += ce - cs + 1;
        cs = s;
        ce = e;
      }
    }
    total += ce - cs + 1;
  }
  return total;
}

export function streakDays(logs) {
  const dates = new Set(logs.map((l) => l.date));
  let cursor = new Date();
  if (!dates.has(fmtDate(cursor))) cursor.setDate(cursor.getDate() - 1); // hari ini belum membaca tidak memutus streak
  let n = 0;
  while (dates.has(fmtDate(cursor))) {
    n++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return n;
}

export function computeStats(totalAyat) {
  const t = tilawah.target;
  const inTarget = tilawah.logs.filter((l) => l.date >= t.startDate);
  const covered = inTarget.length ? coveredAyat(inTarget) : 0;
  const remaining = Math.max(0, totalAyat - covered);
  const elapsed = Math.max(0, daysBetween(t.startDate, todayStr()));
  const daysLeft = Math.max(1, t.days - elapsed);
  const todayRead = tilawah.logs
    .filter((l) => l.date === todayStr())
    .reduce((n, l) => n + (l.to - l.from + 1), 0);
  return {
    covered,
    remaining,
    percent: totalAyat
      ? Math.min(100, Math.round((covered / totalAyat) * 1000) / 10)
      : 0,
    elapsed,
    daysLeft,
    perDay: remaining === 0 ? 0 : Math.ceil(remaining / daysLeft),
    todayRead,
    streak: streakDays(tilawah.logs),
    done: totalAyat > 0 && remaining === 0,
    overdue: elapsed >= t.days && remaining > 0,
  };
}
