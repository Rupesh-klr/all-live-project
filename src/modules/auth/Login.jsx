import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { User, Lock, Terminal, Sun, Moon, ChevronRight, UserPlus, Ghost } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { TextBox } from '../../components/TextBox/TextBox'
import { Button } from '../../components/Button/Button'
import { Badge } from '../../components/Badge/Badge'
import api from '../../utils/api'
import { loadSnapshot, clearSnapshot } from '../../utils/sessionSnapshot'

// ── Module banner item ────────────────────────────────────────────────────────
function BannerItem({ mod }) {
  return (
    <div className="flex items-start gap-3 mx-8 min-w-[260px] max-w-[300px] shrink-0">
      <div className="w-1 h-full min-h-[60px] rounded-full bg-brand-500/40 self-stretch" />
      <div>
        <div className="font-mono font-bold text-xs text-brand-500 uppercase tracking-widest mb-0.5">
          {mod.name}
        </div>
        <p className="text-[var(--text-muted)] text-[11px] leading-snug line-clamp-2">
          {mod.description}
        </p>
        <div className="flex flex-wrap gap-1 mt-1.5">
          {(mod.defaultUsers || []).map(u => (
            <div key={u.username} className="flex items-center gap-1">
              <Badge role={u.role} />
              <span className="font-mono text-[9px] text-[var(--text-muted)]">{u.username}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Scrolling banner ─────────────────────────────────────────────────────────
function ModulesBanner({ modules }) {
  if (!modules.length) return null
  const doubled = [...modules, ...modules] // seamless loop

  return (
    <div className="w-full overflow-hidden border-y border-[var(--border)] py-3 bg-[var(--bg-2)]">
      <div className="flex animate-[marquee_40s_linear_infinite] w-max hover:[animation-play-state:paused]">
        {doubled.map((mod, i) => <BannerItem key={`${mod.name}-${i}`} mod={mod} />)}
      </div>
    </div>
  )
}

// ── Login page ────────────────────────────────────────────────────────────────
export function Login({ defaultRedirect = '/dashboard' }) {
  const { login, guestLogin, isAuthenticated } = useAuth()
  const { toggle, isDark } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword]     = useState('')
  const [loading, setLoading]       = useState(false)
  const [guestLoading, setGuestLoading] = useState(false)
  const [modules, setModules]       = useState([])
  const [errors, setErrors]         = useState({})

  const from = location.state?.from?.pathname || defaultRedirect

  // If this is a module-scoped login page, guest goes back to that module's public page
  // e.g. defaultRedirect = '/telecom-optimizer/dashboard' → guestTarget = '/telecom-optimizer'
  // e.g. defaultRedirect = '/dashboard' (root) → guestTarget = '/dashboard'
  const guestTarget = defaultRedirect !== '/dashboard'
    ? defaultRedirect.replace('/dashboard', '') || '/dashboard'
    : '/dashboard'

  // Redirect if already logged in
  useEffect(() => { if (isAuthenticated) navigate(from, { replace: true }) }, [isAuthenticated])

  // Fetch active modules for the banner
  useEffect(() => {
    api.get('/api/modules')
      .then(r => setModules(r.data?.data?.modules || []))
      .catch(() => { /* banner is non-critical */ })
  }, [])

  function validate() {
    const e = {}
    if (!identifier.trim()) e.identifier = 'Username, email or phone is required'
    if (!password)           e.password   = 'Password is required'
    setErrors(e)
    return !Object.keys(e).length
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const u = await login(identifier.trim(), password)
      toast.success(`Welcome back, ${u.displayName || u.username}!`)

      // Determine where to send the user:
      // 1. AuthGuard redirect (location.state.from) — highest priority
      // 2. Saved snapshot from before session expired — restore that page
      // 3. defaultRedirect prop (module-specific or /dashboard)
      const snap = loadSnapshot()
      const target = location.state?.from?.pathname || snap?.pathname || from

      navigate(target, { replace: true })

      // Restore scroll position after the new page settles in the DOM
      if (snap?.scrollY && snap.pathname === target) {
        setTimeout(() => window.scrollTo({ top: snap.scrollY, behavior: 'instant' }), 150)
      }
      clearSnapshot()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleGuest() {
    setGuestLoading(true)
    try {
      await guestLogin()
      toast.success('Guest session started — your account expires in 7 days')
      navigate(guestTarget, { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not start guest session')
    } finally {
      setGuestLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)]">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <Terminal size={18} className="text-brand-500" />
          <span className="font-mono font-bold text-sm text-[var(--text)]">
            portfolio<span className="text-brand-500">.hub</span>
          </span>
        </div>
        <button
          onClick={toggle}
          className="p-2 rounded-lg hover:bg-[var(--bg-2)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </header>

      {/* Module banner */}
      <ModulesBanner modules={modules} />

      {/* Main */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Terminal-style header */}
          <div className="font-mono mb-6">
            <div className="text-[var(--text-muted)] text-xs mb-1">
              <span className="text-green-500">❯</span> portfolio.hub<span className="text-brand-500">~</span>
            </div>
            <h1 className="text-2xl font-bold text-[var(--text)]">Sign in</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Access any active module with one login
            </p>
          </div>

          <form onSubmit={handleSubmit} className="card p-6 space-y-4">
            <TextBox
              label="Username / Email / Phone"
              placeholder="Enter identifier"
              icon={User}
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              error={errors.identifier}
              autoFocus
              autoComplete="username"
            />
            <TextBox
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              value={password}
              onChange={e => setPassword(e.target.value)}
              error={errors.password}
              autoComplete="current-password"
            />

            <Button type="submit" fullWidth loading={loading} icon={ChevronRight} iconPos="right">
              Sign in
            </Button>

            {/* Divider */}
            <div className="flex items-center gap-2 pt-1">
              <div className="flex-1 h-px bg-[var(--border)]" />
              <span className="text-[10px] font-mono text-[var(--text-muted)]">or</span>
              <div className="flex-1 h-px bg-[var(--border)]" />
            </div>

            <Button
              type="button"
              variant="ghost"
              fullWidth
              loading={guestLoading}
              icon={Ghost}
              onClick={handleGuest}
            >
              Try as Guest
            </Button>
          </form>

          {/* Sign up link */}
          <div className="mt-4 flex items-center justify-center gap-1 text-[11px] text-[var(--text-muted)] font-mono">
            <span>No account?</span>
            <Link to="/signup" className="text-brand-500 hover:underline flex items-center gap-0.5">
              <UserPlus size={10} /> Create one
            </Link>
          </div>

          {/* Active modules list */}
          {modules.length > 0 && (
            <div className="mt-6">
              <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)] mb-3">
                Active modules ({modules.length})
              </p>
              <div className="space-y-1.5">
                {modules.map(mod => (
                  <div key={mod.name} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--bg-2)] border border-[var(--border)]">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                    <span className="font-mono text-xs text-[var(--text)]">{mod.name}</span>
                    <span className="text-[10px] text-[var(--text-muted)] flex-1 truncate">{mod.description}</span>
                    <div className="flex gap-1">
                      {(mod.tech || []).slice(0, 2).map(t => (
                        <span key={t} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-500 border border-brand-500/20">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-center text-[10px] text-[var(--text-muted)] mt-6 font-mono">
            © {new Date().getFullYear()} Portfolio Hub · All systems operational
          </p>
        </div>
      </main>
    </div>
  )
}
