import { useState, useEffect, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  User, Mail, Lock, Terminal, Sun, Moon, ChevronRight, ArrowLeft,
  ShieldCheck, Zap, Boxes,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { TextBox } from '../../components/TextBox/TextBox'
import { Button } from '../../components/Button/Button'
import { APP_CONFIG } from '../../config/app.config'

const PERKS = [
  { icon: ShieldCheck, text: 'Bank-grade security — passwords AES-encrypted in transit, bcrypt-hashed at rest.' },
  { icon: Zap,         text: 'Instant access to every live module dashboard after sign-up.' },
  { icon: Boxes,       text: 'No setup, no install — explore real, interactive full-stack demos.' },
]

export function Signup() {
  const { signup, isAuthenticated } = useAuth()
  const { toggle, isDark } = useTheme()
  const navigate = useNavigate()

  const [form, setForm] = useState({ displayName: '', username: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors]   = useState({})

  useEffect(() => { if (isAuthenticated) navigate('/dashboard', { replace: true }) }, [isAuthenticated])

  const glow = useMemo(() => ([
    `radial-gradient(ellipse 60% 50% at 12% -8%, #6366f126 0%, transparent 60%)`,
    `radial-gradient(ellipse 55% 45% at 88% -6%, #8b5cf61c 0%, transparent 60%)`,
    `radial-gradient(ellipse 80% 55% at 50% 112%, #22c55e16 0%, transparent 62%)`,
  ].join(', ')), [])

  function set(field) {
    return e => {
      setForm(f => ({ ...f, [field]: e.target.value }))
      if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n })
    }
  }

  function validate() {
    const e = {}
    if (!form.displayName.trim()) e.displayName = 'Display name is required'
    if (!form.username.trim())    e.username    = 'Username is required'
    else if (!/^[a-z0-9_]{3,20}$/.test(form.username.toLowerCase()))
      e.username = 'Username: 3–20 chars, letters / numbers / underscore only'
    if (!form.email.trim())       e.email    = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password)           e.password = 'Password is required'
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters'
    if (!form.confirm)            e.confirm  = 'Please confirm your password'
    else if (form.confirm !== form.password) e.confirm = 'Passwords do not match'
    setErrors(e)
    return !Object.keys(e).length
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const user = await signup({
        username:    form.username.toLowerCase().trim(),
        email:       form.email.trim(),
        displayName: form.displayName.trim(),
        password:    form.password,
      })
      toast.success(`Welcome, ${user.displayName || user.username}! 🎉`)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed'
      if (msg.toLowerCase().includes('username')) setErrors(p => ({ ...p, username: msg }))
      else if (msg.toLowerCase().includes('email')) setErrors(p => ({ ...p, email: msg }))
      else toast.error(msg)
    } finally {
      setLoading(false)
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
        <button
          onClick={toggle}
          className="p-2 rounded-lg hover:bg-[var(--bg-2)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </header>

      {/* Main — split layout */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-10 items-center">

          {/* Left — value prop */}
          <div className="hidden lg:block">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-2)]/60 backdrop-blur-sm mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-widest">Free · No credit card</span>
            </div>
            <h2
              className="text-3xl font-bold leading-tight mb-3"
              style={{ backgroundImage: 'linear-gradient(120deg, var(--text) 35%, #6366f1)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}
            >
              Join the Portfolio Hub
            </h2>
            <p className="text-[var(--text-muted)] text-sm leading-relaxed mb-8 max-w-md">
              One account unlocks every live module — telecom routing, RAG pipelines,
              distributed banking, and a WhatsApp CRM. All interactive, all real.
            </p>

            <div className="space-y-3">
              {PERKS.map((p, i) => {
                const PIcon = p.icon
                return (
                  <div key={i} className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-brand-500/10">
                      <PIcon size={15} className="text-brand-500" />
                    </div>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed pt-1.5">{p.text}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right — sign-up card */}
          <div className="w-full max-w-sm mx-auto lg:mx-0">
            <div className="font-mono mb-6">
              <div className="text-[var(--text-muted)] text-xs mb-1">
                <span className="text-green-500">❯</span> portfolio.hub<span className="text-brand-500">~</span>
                <span className="text-[var(--text-muted)]"> / register</span>
              </div>
              <h1 className="text-2xl font-bold text-[var(--text)]">Create account</h1>
              <p className="text-sm text-[var(--text-muted)] mt-1">Access all portfolio modules after signing up</p>
            </div>

            <form onSubmit={handleSubmit} className="card p-6 space-y-4 backdrop-blur-sm">
              <TextBox label="Display Name" placeholder="e.g. John Doe" icon={User}
                value={form.displayName} onChange={set('displayName')} error={errors.displayName} autoFocus />
              <TextBox label="Username" placeholder="e.g. john_doe" icon={User}
                value={form.username} onChange={set('username')} error={errors.username}
                hint="3–20 chars — letters, numbers, underscore" autoComplete="username" />
              <TextBox label="Email" type="email" placeholder="you@example.com" icon={Mail}
                value={form.email} onChange={set('email')} error={errors.email} autoComplete="email" />
              <TextBox label="Password" type="password" placeholder="Min 6 characters" icon={Lock}
                value={form.password} onChange={set('password')} error={errors.password} autoComplete="new-password" />
              <TextBox label="Confirm Password" type="password" placeholder="Re-enter password" icon={Lock}
                value={form.confirm} onChange={set('confirm')} error={errors.confirm} autoComplete="new-password" />

              <Button type="submit" fullWidth loading={loading} icon={ChevronRight} iconPos="right">
                Create account
              </Button>
            </form>

            <div className="mt-5 flex items-center justify-center gap-1 text-[11px] text-[var(--text-muted)] font-mono">
              <span>Already have an account?</span>
              <Link to="/login" className="text-brand-500 hover:underline flex items-center gap-0.5">
                <ArrowLeft size={10} /> Sign in
              </Link>
            </div>

            <p className="text-center text-[10px] text-[var(--text-muted)] mt-4 font-mono">
              © {new Date().getFullYear()} {APP_CONFIG.brandName} · All systems operational
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
