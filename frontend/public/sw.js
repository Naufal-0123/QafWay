// Service worker e-Quran: notifikasi pengingat + dukungan offline.
const VERSION = "v1"; // naikkan angka ini jika ingin memaksa cache lama dibuang
const STATIC_CACHE = `equran-static-${VERSION}`;
const API_CACHE = `equran-api-${VERSION}`;
const FONT_CACHE = `equran-fonts-${VERSION}`;
const KEEP = [STATIC_CACHE, API_CACHE, FONT_CACHE];

// Di localhost cache dimatikan agar hot reload Vite tidak terganggu.
// Ubah menjadi false jika ingin menguji mode offline di localhost.
const DISABLE_CACHE_ON_LOCALHOST = true;
const IS_LOCAL = ["localhost", "127.0.0.1"].includes(self.location.hostname);

const API_PREFIX = "/api/v1/";
const CONTENT_API = /^\/api\/v1\/(surahs|doa|tafsir)/; // data yang jarang berubah
const MAX_API_ENTRIES = 300;

/* ---------- Siklus hidup ---------- */
self.addEventListener("install", (e) => {
  // Simpan "kerangka" aplikasi (index.html) agar bisa dibuka tanpa internet
  e.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((c) => c.add("/"))
      .catch(() => {})
      .finally(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((n) => n.startsWith("equran-") && !KEEP.includes(n))
          .map((n) => caches.delete(n)),
      );
      await self.clients.claim();
    })(),
  );
});

/* ---------- Notifikasi ---------- */
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = e.notification.data?.url || "/";
  e.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(async (list) => {
        for (const c of list) {
          if ("focus" in c) {
            await c.focus();
            if ("navigate" in c) {
              try {
                await c.navigate(url);
              } catch {
                /* abaikan */
              }
            }
            return;
          }
        }
        return self.clients.openWindow(url);
      }),
  );
});

// Siap untuk Web Push dari server (opsional di masa depan)
self.addEventListener("push", (e) => {
  let p = {};
  try {
    p = e.data ? e.data.json() : {};
  } catch {
    p = { body: e.data?.text() };
  }
  e.waitUntil(
    self.registration.showNotification(p.title || "e-Quran", {
      body: p.body,
      tag: p.tag,
      data: { url: p.url || "/" },
      vibrate: [200, 100, 200],
    }),
  );
});

/* ---------- Offline ---------- */
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || req.headers.has("range")) return; // audio (range) tidak di-cache
  if (IS_LOCAL && DISABLE_CACHE_ON_LOCALHOST) return;

  const url = new URL(req.url);

  if (url.origin === self.location.origin) {
    if (url.pathname === "/sw.js") return;

    if (url.pathname.startsWith(API_PREFIX)) {
      e.respondWith(
        CONTENT_API.test(url.pathname)
          ? staleWhileRevalidate(e, API_CACHE)
          : networkFirst(req, API_CACHE, 5000),
      );
      return;
    }
    if (req.mode === "navigate") {
      e.respondWith(navigateWithFallback(req));
      return;
    }
    if (url.pathname.startsWith("/assets/")) {
      e.respondWith(cacheFirst(req, STATIC_CACHE)); // nama file ber-hash dari Vite
      return;
    }
    if (/\.(?:png|jpe?g|svg|webp|ico|woff2?)$/.test(url.pathname)) {
      e.respondWith(staleWhileRevalidate(e, STATIC_CACHE));
    }
    return;
  }

  if (
    url.hostname === "fonts.googleapis.com" ||
    url.hostname === "fonts.gstatic.com"
  ) {
    e.respondWith(staleWhileRevalidate(e, FONT_CACHE));
  }
});

async function store(cache, req, res) {
  if (!res || !(res.ok || res.type === "opaque")) return;
  await cache.put(req, res.clone());
}

// Hapus entri API terlama agar cache tidak membengkak
async function trimApi() {
  const cache = await caches.open(API_CACHE);
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - MAX_API_ENTRIES; i++)
    await cache.delete(keys[i]);
}

async function cacheFirst(req, name) {
  const cache = await caches.open(name);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  await store(cache, req, res);
  return res;
}

// Tampilkan dari cache dulu (cepat, bisa offline), perbarui diam-diam di belakang
async function staleWhileRevalidate(e, name) {
  const req = e.request;
  const cache = await caches.open(name);
  const hit = await cache.match(req);
  const update = fetch(req)
    .then(async (res) => {
      await store(cache, req, res);
      if (name === API_CACHE) await trimApi();
      return res;
    })
    .catch(() => null);
  if (hit) {
    e.waitUntil(update);
    return hit;
  }
  return (await update) || Response.error();
}

// Utamakan data terbaru; jika jaringan lambat (>timeout) atau gagal, pakai cache
async function networkFirst(req, name, timeoutMs) {
  const cache = await caches.open(name);
  const net = fetch(req).then(async (res) => {
    await store(cache, req, res);
    if (name === API_CACHE) await trimApi();
    return res;
  });
  net.catch(() => {}); // cegah error tak tertangani saat cache yang dipakai
  try {
    const first = await Promise.race([
      net,
      new Promise((resolve) => setTimeout(() => resolve(null), timeoutMs)),
    ]);
    if (first) return first;
    const hit = await cache.match(req);
    return hit || (await net);
  } catch {
    const hit = await cache.match(req);
    return hit || Response.error();
  }
}

async function navigateWithFallback(req) {
  const cache = await caches.open(STATIC_CACHE);
  try {
    const res = await fetch(req);
    if (
      res.ok &&
      (res.headers.get("content-type") || "").includes("text/html")
    ) {
      await cache.put("/", res.clone()); // jaga kerangka aplikasi tetap terbaru
    }
    return res;
  } catch {
    return (await cache.match("/")) || Response.error();
  }
}
