// Menjaga layar tetap menyala selama membaca / memutar audio.
let sentinel = null;
let wanted = false;

async function acquire() {
  if (
    !wanted ||
    sentinel ||
    !("wakeLock" in navigator) ||
    document.visibilityState !== "visible"
  )
    return;
  try {
    const s = await navigator.wakeLock.request("screen");
    sentinel = s;
    s.addEventListener("release", () => {
      if (sentinel === s) sentinel = null;
    });
    if (!wanted) release();
  } catch {
    /* ditolak, mis. mode hemat baterai */
  }
}

function release() {
  const s = sentinel;
  sentinel = null;
  s?.release().catch(() => {});
}

export function keepAwake(on) {
  wanted = on;
  if (on) acquire();
  else release();
}

// Browser melepas wake lock saat tab disembunyikan; ambil lagi saat kembali
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") acquire();
});
