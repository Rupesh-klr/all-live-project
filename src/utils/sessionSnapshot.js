const KEY = 'session_snapshot'
const MAX_AGE_MS = 24 * 60 * 60 * 1000 // discard snapshots older than 24h

export function saveSnapshot(pathname, scrollY = 0) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ pathname, scrollY, ts: Date.now() }))
  } catch {}
}

export function loadSnapshot() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const snap = JSON.parse(raw)
    if (Date.now() - snap.ts > MAX_AGE_MS) {
      localStorage.removeItem(KEY)
      return null
    }
    return snap
  } catch { return null }
}

export function clearSnapshot() {
  try { localStorage.removeItem(KEY) } catch {}
}
