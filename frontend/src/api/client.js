const BASE = '/api/v1'

// Semua respons backend berbentuk { data, error }
export async function get(path, params = {}) {
  const url = new URL(BASE + path, window.location.origin)
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v)
  }

  let res
  try {
    res = await fetch(url)
  } catch {
    throw new Error('Tidak dapat terhubung ke server. Pastikan backend Go berjalan.')
  }

  let body = null
  try {
    body = await res.json()
  } catch {
    /* body bukan JSON */
  }
  if (!res.ok || body?.error) {
    throw new Error(body?.error || `Permintaan gagal (${res.status})`)
  }
  return body.data
}