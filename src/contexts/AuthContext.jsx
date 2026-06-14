import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../utils/api'
import { encryptPassword } from '../utils/encryption'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    const stored = localStorage.getItem('user')
    if (token && stored) {
      try { setUser(JSON.parse(stored)) } catch { /* corrupt — ignore */ }
    }
    setLoading(false)
  }, [])

  function saveSession({ accessToken, refreshToken, user: u }) {
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    localStorage.setItem('user', JSON.stringify(u))
    setUser(u)
    return u
  }

  const login = useCallback(async (identifier, password) => {
    const { data } = await api.post('/api/auth/v1/login', {
      identifier,
      password: encryptPassword(password),
    })
    return saveSession(data.data)
  }, [])

  // Register + auto-login — backend returns tokens on success
  const signup = useCallback(async ({ username, email, password, displayName }) => {
    const { data } = await api.post('/api/auth/v1/register', {
      username,
      email,
      displayName,
      password: encryptPassword(password),
    })
    return saveSession(data.data)
  }, [])

  // Create a temporary guest session — auto-deleted server-side after 7 days
  const guestLogin = useCallback(async () => {
    const { data } = await api.post('/api/auth/v1/guest')
    return saveSession(data.data)
  }, [])

  const logout = useCallback(async () => {
    try { await api.post('/api/auth/v1/logout') } catch { /* best-effort */ }
    localStorage.clear()
    setUser(null)
  }, [])

  const isAuthenticated = !!user
  const hasRole = (role) => user?.role === role
  const isGuest = () => user?.role === 'guest'
  const canAccess = (module) =>
    !user?.moduleAccess?.length || user.moduleAccess.includes(module)

  return (
    <AuthContext.Provider value={{
      user, loading,
      login, signup, guestLogin, logout,
      isAuthenticated, hasRole, isGuest, canAccess,
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
