import { useNavigate } from 'react-router-dom'
import { AlertTriangle, LogIn, Clock, MapPin } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { loadSnapshot } from '../../utils/sessionSnapshot'
import { Button } from '../../components/Button/Button'

// Derive the right login page from a pathname
// e.g. /telecom-optimizer/dashboard → /telecom-optimizer/login
// e.g. /dashboard → /login
function getLoginPath(pathname) {
  if (!pathname) return '/login'
  const match = pathname.match(/^\/(telecom-optimizer|vectorshift|banking-core|whatsapp-crm)/)
  return match ? `/${match[1]}/login` : '/login'
}

function friendlyPath(pathname) {
  if (!pathname || pathname === '/dashboard') return 'the dashboard'
  return pathname.replace('/', '').replace('/dashboard', ' dashboard').replace(/-/g, ' ')
}

export function SessionExpiredModal() {
  const { sessionExpired, dismissSessionExpired } = useAuth()
  const navigate = useNavigate()

  if (!sessionExpired) return null

  const snap      = loadSnapshot()
  const lastPath  = snap?.pathname
  const loginPath = getLoginPath(lastPath)

  function signInAgain() {
    dismissSessionExpired()
    navigate(loginPath)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Card */}
      <div className="relative w-full max-w-sm bg-[var(--bg)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden">
        {/* Red top bar */}
        <div className="h-0.5 w-full bg-gradient-to-r from-red-500 to-amber-500" />

        <div className="p-6">
          {/* Icon + title */}
          <div className="flex items-start gap-4 mb-5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <AlertTriangle size={18} className="text-amber-500" />
            </div>
            <div>
              <h2 className="font-bold text-[var(--text)] text-base">Session expired</h2>
              <p className="text-sm text-[var(--text-muted)] mt-0.5">
                You were signed out — your work is safe.
              </p>
            </div>
          </div>

          {/* Info rows */}
          <div className="space-y-2 mb-6">
            {lastPath && (
              <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-[var(--bg-2)] border border-[var(--border)]">
                <MapPin size={13} className="text-brand-500 shrink-0" />
                <div>
                  <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest mb-0.5">
                    You were at
                  </p>
                  <p className="text-xs font-mono text-[var(--text)] capitalize">
                    {friendlyPath(lastPath)}
                  </p>
                </div>
              </div>
            )}
            {snap?.scrollY > 100 && (
              <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-[var(--bg-2)] border border-[var(--border)]">
                <Clock size={13} className="text-green-500 shrink-0" />
                <p className="text-xs text-[var(--text-muted)]">
                  Scroll position saved — you'll be taken back to the same spot.
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button fullWidth icon={LogIn} onClick={signInAgain}>
              Sign In Again
            </Button>
            <button
              onClick={dismissSessionExpired}
              className="text-[11px] font-mono text-[var(--text-muted)] hover:text-[var(--text)] transition-colors py-1"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
