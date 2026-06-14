import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Terminal, ExternalLink, X, ChevronRight, Ghost } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/Button/Button'
import { Badge } from '../../components/Badge/Badge'
import { MODULES } from '../registry'

const SESSION_KEY = 'portfolio_onboarded'

export function OnboardingModal() {
  const { isAuthenticated, user, isGuest } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  // Show once per browser session, after first successful login/signup
  useEffect(() => {
    if (isAuthenticated && !sessionStorage.getItem(SESSION_KEY)) {
      const t = setTimeout(() => setOpen(true), 400)
      return () => clearTimeout(t)
    }
  }, [isAuthenticated])

  function dismiss() {
    sessionStorage.setItem(SESSION_KEY, '1')
    setOpen(false)
  }

  function goToDashboard() {
    dismiss()
    navigate('/dashboard')
  }

  function openModule(mod) {
    dismiss()
    navigate(mod.dashboardPath)
  }

  if (!open) return null

  const name = user?.displayName || user?.username || 'there'
  const guest = isGuest?.()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={dismiss}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-2xl bg-[var(--bg)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden"
        style={{ boxShadow: '0 0 60px rgba(0,0,0,0.5)' }}
      >
        {/* Top accent bar */}
        <div className="h-0.5 w-full bg-gradient-to-r from-brand-500 via-purple-500 to-cyan-500" />

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-[var(--border)]">
          <div className="flex items-start justify-between">
            <div>
              {/* Live badge */}
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-[var(--border)] bg-[var(--bg-2)] mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="font-mono text-[9px] text-[var(--text-muted)] uppercase tracking-widest">
                  Live Project — Portfolio Hub
                </span>
              </div>

              <div className="flex items-center gap-2 mb-1">
                <Terminal size={16} className="text-brand-500" />
                <span className="font-mono font-bold text-sm text-[var(--text)]">
                  portfolio<span className="text-brand-500">.hub</span>
                </span>
              </div>

              <h2 className="text-xl font-bold text-[var(--text)] mt-2">
                Welcome, {name}!
              </h2>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                {guest
                  ? 'You have guest access — explore all 4 live engineering modules below.'
                  : 'You have full access to 4 live engineering modules. Pick one to explore.'}
              </p>
              {guest && (
                <div className="flex items-center gap-1.5 mt-2 text-[11px] font-mono text-amber-400">
                  <Ghost size={11} />
                  Guest session — auto-expires in 7 days
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Badge role={user?.role} label={user?.role} />
              <button
                onClick={dismiss}
                className="p-1.5 rounded-lg hover:bg-[var(--bg-2)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Module grid */}
        <div className="p-6">
          <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-4">
            4 Active Modules — click to open dashboard
          </p>
          <div className="grid grid-cols-2 gap-3">
            {MODULES.map(mod => (
              <button
                key={mod.slug}
                onClick={() => openModule(mod)}
                className="text-left p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-2)] hover:bg-[var(--bg)] transition-all group relative overflow-hidden"
                style={{ borderColor: `${mod.color}25` }}
              >
                {/* Subtle glow on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  style={{ background: `radial-gradient(ellipse at top left, ${mod.color}12, transparent 70%)` }}
                />
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl">{mod.emoji}</span>
                    <ExternalLink
                      size={12}
                      className="text-[var(--text-muted)] group-hover:text-[var(--text)] transition-colors"
                      style={{ color: mod.color }}
                    />
                  </div>
                  <p className="font-semibold text-xs text-[var(--text)] mb-1 leading-snug">{mod.shortName || mod.name}</p>
                  <p className="text-[10px] text-[var(--text-muted)] leading-snug">{mod.summary}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex items-center justify-between">
          <button
            onClick={dismiss}
            className="text-[11px] font-mono text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
          >
            Dismiss
          </button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={dismiss}>
              Stay Here
            </Button>
            <Button size="sm" icon={ChevronRight} iconPos="right" onClick={goToDashboard}>
              Explore All Modules
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
