import { useState, useEffect, useCallback } from 'react'

/**
 * Persists form state to localStorage automatically.
 * Use it in place of useState for any form you want to survive
 * a session expiry or accidental page close.
 *
 * Usage:
 *   const [form, setForm, clearDraft] = useFormDraft('pipeline-create', { name: '', nodes: [] })
 *   // setForm works exactly like setState
 *   // Call clearDraft() on successful submit to wipe saved state
 */
export function useFormDraft(key, defaultValue = {}) {
  const storageKey = `form_draft_${key}`

  const [draft, setDraft] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      return saved ? JSON.parse(saved) : defaultValue
    } catch { return defaultValue }
  })

  // Auto-save with 600ms debounce so we don't write on every keystroke
  useEffect(() => {
    const t = setTimeout(() => {
      try { localStorage.setItem(storageKey, JSON.stringify(draft)) } catch {}
    }, 600)
    return () => clearTimeout(t)
  }, [draft, storageKey])

  const clearDraft = useCallback(() => {
    try { localStorage.removeItem(storageKey) } catch {}
    setDraft(defaultValue)
  }, [storageKey]) // eslint-disable-line react-hooks/exhaustive-deps

  return [draft, setDraft, clearDraft]
}
