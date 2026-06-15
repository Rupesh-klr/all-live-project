import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import {
  User, Lock, Terminal, Sun, Moon, ChevronRight, UserPlus, Ghost,
  ShieldCheck, Zap, Boxes, ArrowUpRight,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { TextBox } from '../../components/TextBox/TextBox'
import { Button } from '../../components/Button/Button'
import { Badge } from '../../components/Badge/Badge'
import api from '../../utils/api'
import { loadSnapshot, clearSnapshot } from '../../utils/sessionSnapshot'
import { APP_CONFIG } from '../../config/app.config'

// ── Module banner item (scrolling marquee) ────────────────────────────────────
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

function ModulesBanner({ modules }) {
  if (!modules.length) return null
  const doubled = [...modules, ...modules] // seamless loop
  return (
    <div className="relative z-10 w-full overflow-hidden border-y border-[var(--border)] py-3 bg-[var(--bg-2)]/70 backdrop-blur-sm">
      <div className="flex animate-[marquee_40s_linear_infinite] w-max hover:[animation-play-state:paused]">
        {doubled.map((mod, i) => <BannerItem key={`${mod.name}-${i}`} mod={mod} />)}
      </div>
    </div>
  )
}

const WHY = [
  { icon: ShieldCheck, text: 'One login, every module — AES-in-transit, JWT with active revocation.' },
  { icon: Zap,         text: 'Each dashboard is a live, interactive demo wired to a real backend.' },
  { icon: Boxes,       text: 'Folder-driven architecture — modules plug in and out with one flag.' },
]

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

  // Module-scoped login → guest returns to that module's public page.
  const guestTarget = defaultRedirect !== '/dashboard'
    ? defaultRedirect.replace('/dashboard', '') || '/dashboard'
    : '/dashboard'

  useEffect(() => { if (isAuthenticated) navigate(from, { replace: true }) }, [isAuthenticated])

  useEffect(() => {
    api.get('/api/modules')
      .then(r => setModules(r.data?.data?.modules || []))
      .catch(() => { /* banner is non-critical */ })
  }, [])

  // Ambient glow blended from module accent colors (falls back to brand).
  const glow = useMemo(() => ([
    `radial-gradient(ellipse 60% 50% at 12% -8%, #6366f126 0%, transparent 60%)`,
    `radial-gradient(ellipse 55% 45% at 88% -6%, #22c55e1c 0%, transparent 60%)`,
    `radial-gradient(ellipse 80% 55% at 50% 112%, #8b5cf618 0%, transparent 62%)`,
  ].join(', ')), [])

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

      const snap = loadSnapshot()
      const target = location.state?.from?.pathname || snap?.pathname || from
      navigate(target, { replace: true })

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
    <div className="min-h-screen flex flex-col bg-[var(--bg)] relative">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{ background: glow }} />
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.35]"
        style={{ backgroundImage: 'radial-gradient(circle, var(--border) 1px, transparent 1px)', backgroundSize: '34px 34px' }}
      />

      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between px-6 py-3 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Terminal size={18} className="text-brand-500" />
          <span className="font-mono font-bold text-sm text-[var(--text)]">
            {APP_CONFIG.brandName.split('.')[0]}<span className="text-brand-500">.{APP_CONFIG.brandName.split('.')[1] || 'hub'}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/about" className="font-mono text-xs text-[var(--text-muted)] hover:text-brand-500 transition-colors mr-1">About</Link>
          <button
            onClick={toggle}
            className="p-2 rounded-lg hover:bg-[var(--bg-2)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header>

      {/* Module banner */}
      <ModulesBanner modules={modules} />

      {/* Main — split layout */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-10 items-center">

          {/* Left — value prop (hidden on small screens) */}
          <div className="hidden lg:block">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-2)]/60 backdrop-blur-sm mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-widest">
                {modules.length ? `${modules.length} modules live` : 'Portfolio Hub'}
              </span>
            </div>
            <h2
              className="text-3xl font-bold leading-tight mb-3"
              style={{ backgroundImage: 'linear-gradient(120deg, var(--text) 35%, #6366f1)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}
            >
              {APP_CONFIG.developerName}’s Portfolio Hub
            </h2>
            <p className="text-[var(--text-muted)] text-sm leading-relaxed mb-8 max-w-md">
              {APP_CONFIG.developerTitle} · {APP_CONFIG.tagline}. Sign in to explore every
              project as a live, working application.
            </p>

            <div className="space-y-3 mb-8">
              {WHY.map((w, i) => {
                const WIcon = w.icon
                return (
                  <div key={i} className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-brand-500/10">
                      <WIcon size={15} className="text-brand-500" />
                    </div>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed pt-1.5">{w.text}</p>
                  </div>
                )
              })}
            </div>

            <Link to="/about" className="inline-flex items-center gap-1.5 font-mono text-xs text-brand-500 hover:underline">
              Meet the developer <ArrowUpRight size={13} />
            </Link>
          </div>

          {/* Right — sign-in card */}
          <div className="w-full max-w-sm mx-auto lg:mx-0">
            <div className="font-mono mb-6">
              <div className="text-[var(--text-muted)] text-xs mb-1">
                <span className="text-green-500">❯</span> portfolio.hub<span className="text-brand-500">~</span>
              </div>
              <h1 className="text-2xl font-bold text-[var(--text)]">Sign in</h1>
              <p className="text-sm text-[var(--text-muted)] mt-1">Access any active module with one login</p>
            </div>

            <form onSubmit={handleSubmit} className="card p-6 space-y-4 backdrop-blur-sm">
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

              <div className="flex items-center gap-2 pt-1">
                <div className="flex-1 h-px bg-[var(--border)]" />
                <span className="text-[10px] font-mono text-[var(--text-muted)]">or</span>
                <div className="flex-1 h-px bg-[var(--border)]" />
              </div>

              <Button type="button" variant="ghost" fullWidth loading={guestLoading} icon={Ghost} onClick={handleGuest}>
                Try as Guest
              </Button>
            </form>

            <div className="mt-4 flex items-center justify-center gap-1 text-[11px] text-[var(--text-muted)] font-mono">
              <span>No account?</span>
              <Link to="/signup" className="text-brand-500 hover:underline flex items-center gap-0.5">
                <UserPlus size={10} /> Create one
              </Link>
            </div>

            {/* Active modules list (mobile-friendly, shown under the form) */}
            {modules.length > 0 && (
              <div className="mt-6 lg:hidden">
                <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)] mb-3">
                  Active modules ({modules.length})
                </p>
                <div className="space-y-1.5">
                  {modules.map(mod => (
                    <div key={mod.name} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--bg-2)] border border-[var(--border)]">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                      <span className="font-mono text-xs text-[var(--text)]">{mod.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-center text-[10px] text-[var(--text-muted)] mt-6 font-mono">
              © {new Date().getFullYear()} {APP_CONFIG.brandName} · All systems operational
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
