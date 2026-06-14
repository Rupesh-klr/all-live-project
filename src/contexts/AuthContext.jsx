import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../utils/api'
import { encryptPassword } from '../utils/encryption'
import { saveSnapshot, clearSnapshot } from '../utils/sessionSnapshot'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]                   = useState(null)
  const [loading, setLoading]             = useState(true)
  const [sessionExpired, setSessionExpired] = useState(false)

  // ── Restore session on mount ───────────────────────────────────────────────
  useEffect(() => {
    const token  = localStorage.getItem('accessToken')
    const stored = localStorage.getItem('user')
    if (token && stored) {
      try { setUser(JSON.parse(stored)) } catch { /* corrupt — ignore */ }
    }
    setLoading(false)
  }, [])

  // ── Cross-tab auth sync ────────────────────────────────────────────────────
  // The `storage` event fires in ALL other open tabs when localStorage changes.
  // This keeps every tab in sync when the user logs in or out in any one tab.
  useEffect(() => {
    function onStorage(e) {
      if (e.key !== 'accessToken') return
      if (e.newValue && !user) {
        // Another tab logged in — sync state into this tab silently
        try {
          const stored = localStorage.getItem('user')
          if (stored) {
            setUser(JSON.parse(stored))
            setSessionExpired(false)
          }
        } catch {}
      } else if (!e.newValue && user) {
        // Another tab logged out — expire this tab so user sees the modal
        saveSnapshot(window.location.pathname, window.scrollY)
        setUser(null)
        setSessionExpired(true)
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [user])

  // ── Token expired (API 401 after failed refresh) ───────────────────────────
  // api.js fires this event instead of hard-redirecting so we can show a modal
  // and preserve the user's position.
  useEffect(() => {
    function onExpired() {
      if (!user) return // already logged out — ignore duplicate fires
      saveSnapshot(window.location.pathname, window.scrollY)
      localStorage.clear()
      setUser(null)
      setSessionExpired(true)
    }
    window.addEventListener('auth:session-expired', onExpired)
    return () => window.removeEventListener('auth:session-expired', onExpired)
  }, [user])

  // ── Internal helper ────────────────────────────────────────────────────────
  function saveSession({ accessToken, refreshToken, user: u }) {
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    localStorage.setItem('user', JSON.stringify(u))
    setUser(u)
    setSessionExpired(false)
    return u
  }

  // ── Public actions ─────────────────────────────────────────────────────────
  const login = useCallback(async (identifier, password) => {
    const { data } = await api.post('/api/auth/v1/login', {
      identifier,
      password: encryptPassword(password),
    })
    return saveSession(data.data)
  }, [])

  const signup = useCallback(async ({ username, email, password, displayName }) => {
    const { data } = await api.post('/api/auth/v1/register', {
      username, email, displayName,
      password: encryptPassword(password),
    })
    return saveSession(data.data)
  }, [])

  const guestLogin = useCallback(async () => {
    const { data } = await api.post('/api/auth/v1/guest')
    return saveSession(data.data)
  }, [])

  const logout = useCallback(async () => {
    // Save position before clearing — user can return here after re-login
    saveSnapshot(window.location.pathname, window.scrollY)
    try { await api.post('/api/auth/v1/logout') } catch { /* best-effort */ }
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  const dismissSessionExpired = useCallback(() => setSessionExpired(false), [])

  const isAuthenticated = !!user
  const hasRole    = (role)   => user?.role === role
  const isGuest    = ()       => user?.role === 'guest'
  const canAccess  = (module) => !user?.moduleAccess?.length || user.moduleAccess.includes(module)

  return (
    <AuthContext.Provider value={{
      user, loading,
      login, signup, guestLogin, logout,
      isAuthenticated, hasRole, isGuest, canAccess,
      sessionExpired, dismissSessionExpired,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
