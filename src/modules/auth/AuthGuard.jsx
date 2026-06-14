import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

/** Protects any route — redirects to /login if not authenticated */
export function AuthGuard({ children, requiredRole, requiredModule }) {
  const { isAuthenticated, loading, hasRole, canAccess } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center font-mono text-sm text-[var(--text-muted)]">
        403 — Insufficient role
      </div>
    )
  }

  if (requiredModule && !canAccess(requiredModule)) {
    return (
      <div className="min-h-screen flex items-center justify-center font-mono text-sm text-[var(--text-muted)]">
        403 — Module access denied
      </div>
    )
  }

  return children
}
