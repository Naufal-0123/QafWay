import { ref, shallowRef } from "vue";
import { getSurahs, getSurah } from "../api/quran";

const DB = "equran-index";
const STORE = "kv";
const KEY = "ayat-v1";

// Samakan huruf: hapus tanda baca latin (ā → a), harakat Arab, dan bentuk hamzah
export const fold = (s) =>
  (s ?? "")
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g,
      "",
    )
    .toLowerCase();

const items = shallowRef([]);
const status = ref("idle"); // idle | loading | building | ready | error
const done = ref(0);
const total = ref(114);
const error = ref("");
let promise = null;

function openDB() {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE);
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}
async function idbGet() {
  try {
    const db = await openDB();
    return await new Promise((res) => {
      const q = db.transaction(STORE).objectStore(STORE).get(KEY);
      q.onsuccess = () => res(q.result ?? null);
      q.onerror = () => res(null);
    });
  } catch {
    return null;
  }
}
async function idbSet(v) {
  try {
    const db = await openDB();
    await new Promise((res, rej) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(v, KEY);
      tx.oncomplete = res;
      tx.onerror = () => rej(tx.error);
    });
  } catch {
    /* tanpa cache pun pencarian tetap berjalan */
  }
}

const prep = (it) => ({ ...it, h: `${fold(it.l)} ${fold(it.t)} ${it.r}` });

async function build() {
  const list = await getSurahs();
  total.value = list.length;
  done.value = 0;
  const out = [];
  let i = 0;
  async function worker() {
    while (i < list.length) {
      const sr = list[i++];
      const d = await getSurah(sr.nomor);
      for (const a of d.ayat ?? []) {
        out.push({
          s: sr.nomor,
          n: sr.namaLatin,
          a: a.nomorAyat,
          l: a.teksLatin ?? "",
          t: a.teksIndonesia ?? "",
          r: fold(a.teksArab),
        });
      }
      done.value++;
    }
  }
  await Promise.all(Array.from({ length: 5 }, worker));
  out.sort((x, y) => x.s - y.s || x.a - y.a);
  await idbSet({ v: 1, items: out });
  return out;
}

export function ensureIndex() {
  if (promise) return promise;
  status.value = "loading";
  error.value = "";
  promise = (async () => {
    const cached = await idbGet();
    if (cached?.items?.length) {
      items.value = cached.items.map(prep);
    } else {
      status.value = "building";
      items.value = (await build()).map(prep);
    }
    status.value = "ready";
  })().catch((e) => {
    status.value = "error";
    error.value = e.message || "Gagal menyiapkan pencarian.";
    promise = null;
  });
  return promise;
}

export function searchAyat(q, limit = 100) {
  const tokens = fold(q).trim().split(/\s+/).filter(Boolean);
  if (!tokens.length) return { list: [], total: 0, tokens };
  const hits = items.value.filter((it) =>
    tokens.every((t) => it.h.includes(t)),
  );
  return { list: hits.slice(0, limit), total: hits.length, tokens };
}

export const useAyahIndex = () => ({ status, done, total, error });
