import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Terminal, Sun, Moon, ChevronRight, ExternalLink,
  Copy, Check, LogIn, UserPlus, ArrowLeft, LogOut,
} from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/Button/Button'
import { Badge } from '../../components/Badge/Badge'
import { footerLine } from '../../config/app.config'

const TEST_CREDS = [
  {
    email:       'admin@gmail.com',
    password:    'admin@123',
    role:        'admin',
    label:       'Administrator',
    description: 'Full access — all features unlocked',
  },
  {
    email:       'viewer@portfolio.hub',
    password:    'viewer@123',
    role:        'viewer',
    label:       'Viewer',
    description: 'Read-only — great for exploring UI',
  },
]

function CopyBtn({ text }) {
  const [done, setDone] = useState(false)
  function copy() {
    navigator.clipboard.writeText(text)
    setDone(true)
    setTimeout(() => setDone(false), 1800)
  }
  return (
    <button
      onClick={copy}
      className="p-1.5 rounded hover:bg-[var(--bg)] text-[var(--text-muted)] hover:text-brand-500 transition-colors"
      title="Copy"
    >
      {done ? <Check size={11} className="text-green-500" /> : <Copy size={11} />}
    </button>
  )
}

function Section({ id, children, alt = false }) {
  return (
    <section
      id={id}
      className={`py-16 px-6 border-b border-[var(--border)] relative z-10 backdrop-blur-sm ${
        alt
          ? 'bg-[var(--bg-2)]/70'
          : 'bg-[var(--bg)]/50'
      }`}
    >
      <div className="max-w-5xl mx-auto">{children}</div>
    </section>
  )
}

function SectionLabel({ children }) {
  return (
    <p className="font-mono text-[10px] uppercase tracking-widest text-brand-500 mb-3">
      {children}
    </p>
  )
}

export function ModulePublicPage({ config }) {
  const { toggle, isDark } = useTheme()
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

  const Icon = config.icon
  const loginPath = `/${config.slug}/login`

  async function handleLogout() {
    await logout()
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] relative">

      {/* ── Decorative background glow (glass effect base) ──────────────────── */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(ellipse 90% 55% at 50% -10%, ${config.color}20 0%, transparent 65%)`,
        }}
      />
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle, ${config.color}08 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />

      {/* ── Navbar ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-1.5 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors text-xs font-mono"
            >
              <ArrowLeft size={12} /> All Projects
            </Link>
            <div className="w-px h-4 bg-[var(--border)]" />
            <div className="flex items-center gap-2">
              <Terminal size={14} className="text-brand-500" />
              <span className="font-mono font-bold text-sm text-[var(--text)]">
                portfolio<span className="text-brand-500">.hub</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              className="p-2 rounded-lg hover:bg-[var(--bg-2)] text-[var(--text-muted)] transition-colors"
            >
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
            </button>

            {isAuthenticated ? (
              <>
                <span className="hidden sm:block font-mono text-xs text-[var(--text-muted)]">
                  {user?.displayName || user?.username}
                </span>
                <Badge role={user?.role} label={user?.role} />
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg hover:bg-[var(--bg-2)] text-[var(--text-muted)] hover:text-red-400 transition-colors"
                  title="Logout"
                >
                  <LogOut size={14} />
                </button>
                <Button
                  size="sm"
                  icon={ExternalLink}
                  iconPos="right"
                  onClick={() => navigate(config.dashboardPath)}
                >
                  Open Dashboard
                </Button>
              </>
            ) : (
              <>
                <Link to={loginPath}>
                  <Button size="sm" variant="ghost" icon={LogIn}>Sign In</Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm" icon={UserPlus}>Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Section 1: Hero ─────────────────────────────────────────────────── */}
      <Section id="hero">
        <div className="flex flex-col md:flex-row md:items-center gap-10">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-2)]/60 backdrop-blur-sm mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-widest">
                Live Project — Portfolio Hub
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-[var(--text)] leading-tight mb-4">
              {config.name}
            </h1>
            <p className="text-[var(--text-muted)] text-base leading-relaxed mb-8 max-w-xl">
              {config.tagline}
            </p>

            <div className="flex flex-wrap gap-3">
              <Button
                icon={ExternalLink} iconPos="right"
                onClick={() => navigate(isAuthenticated ? config.dashboardPath : loginPath)}
              >
                {isAuthenticated ? 'Open Dashboard' : 'Try Live Demo'}
              </Button>
              {!isAuthenticated && (
                <Link to="/signup">
                  <Button variant="ghost" icon={UserPlus}>Create Account</Button>
                </Link>
              )}
              <a href="#try-it">
                <Button variant="outline">View Credentials</Button>
              </a>
            </div>
          </div>

          <div className="shrink-0">
            <div
              className="w-36 h-36 md:w-44 md:h-44 rounded-2xl flex flex-col items-center justify-center gap-3 shadow-xl backdrop-blur-sm"
              style={{
                background: `${config.color}12`,
                border: `1px solid ${config.color}30`,
                boxShadow: `0 0 40px ${config.color}18`,
              }}
            >
              <Icon size={52} style={{ color: config.color }} />
              <span className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-widest px-3 text-center">
                {config.slug}
              </span>
            </div>
          </div>
        </div>

        {config.stats?.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mt-14">
            {config.stats.map(s => (
              <div
                key={s.label}
                className="card p-5 text-center backdrop-blur-sm"
                style={{ borderColor: `${config.color}20` }}
              >
                <div className="text-2xl font-mono font-bold mb-1" style={{ color: config.color }}>
                  {s.value}
                </div>
                <div className="text-[11px] text-[var(--text-muted)]">{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* ── Section 2: About ────────────────────────────────────────────────── */}
      <Section id="about" alt>
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div>
            <SectionLabel>About this project</SectionLabel>
            <h2 className="text-2xl font-bold text-[var(--text)] mb-5">What is {config.name}?</h2>
            <p className="text-[var(--text-muted)] text-sm leading-relaxed mb-4">
              {config.about.description}
            </p>
            <p className="text-[var(--text-muted)] text-sm leading-relaxed">
              {config.about.impact}
            </p>
          </div>
          <div className="space-y-3">
            {config.about.points.map(p => {
              const PIcon = p.icon
              return (
                <div
                  key={p.title}
                  className="flex gap-3 p-4 rounded-xl bg-[var(--bg)]/60 border border-[var(--border)] backdrop-blur-sm"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${config.color}15` }}
                  >
                    <PIcon size={15} style={{ color: config.color }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--text)] mb-0.5">{p.title}</p>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">{p.detail}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </Section>

      {/* ── Section 3: Tech Stack ───────────────────────────────────────────── */}
      <Section id="tech">
        <SectionLabel>Architecture &amp; Stack</SectionLabel>
        <h2 className="text-2xl font-bold text-[var(--text)] mb-8">Built with production-grade tools</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {config.tech.map(t => (
            <div
              key={t.name}
              className="card p-5 text-center backdrop-blur-sm hover:scale-[1.02] transition-transform"
              style={{ borderColor: `${config.color}15` }}
            >
              <div className="text-3xl mb-3">{t.emoji}</div>
              <div className="font-semibold text-sm text-[var(--text)] mb-1">{t.name}</div>
              <div className="text-[10px] text-[var(--text-muted)] leading-snug">{t.role}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Section 4: Features ─────────────────────────────────────────────── */}
      <Section id="features" alt>
        <SectionLabel>Key Features</SectionLabel>
        <h2 className="text-2xl font-bold text-[var(--text)] mb-8">What this system does</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {config.features.map(f => {
            const FIcon = f.icon
            return (
              <div
                key={f.title}
                className="card p-5 flex gap-4 backdrop-blur-sm hover:border-[var(--border)] transition-colors"
                style={{ borderColor: `${config.color}15` }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${config.color}15` }}
                >
                  <FIcon size={18} style={{ color: config.color }} />
                </div>
                <div>
                  <p className="font-semibold text-sm text-[var(--text)] mb-1">{f.title}</p>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">{f.detail}</p>
                </div>
              </div>
            )
          })}
        </div>
      </Section>

      {/* ── Section 5: Try It ───────────────────────────────────────────────── */}
      <Section id="try-it">
        <div className="max-w-2xl mx-auto text-center">
          <SectionLabel>Quick Access</SectionLabel>
          <h2 className="text-2xl font-bold text-[var(--text)] mb-2">Try the live dashboard now</h2>
          <p className="text-[var(--text-muted)] text-sm mb-10">
            Copy a credential below, sign in, and explore the full working dashboard. No setup needed.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 mb-8 text-left">
            {TEST_CREDS.map(cred => (
              <div
                key={cred.email}
                className="card p-5 backdrop-blur-sm"
                style={{ borderColor: `${config.color}20` }}
              >
                <div className="flex items-center justify-between mb-1">
                  <Badge role={cred.role} label={cred.label} />
                </div>
                <p className="text-[10px] text-[var(--text-muted)] mb-4 font-mono">{cred.description}</p>

                <div className="flex items-center justify-between bg-[var(--bg-2)]/80 rounded-lg px-3 py-2 mb-2">
                  <span className="font-mono text-xs text-[var(--text)] truncate">{cred.email}</span>
                  <CopyBtn text={cred.email} />
                </div>
                <div className="flex items-center justify-between bg-[var(--bg-2)]/80 rounded-lg px-3 py-2 mb-4">
                  <span className="font-mono text-xs text-[var(--text)]">{cred.password}</span>
                  <CopyBtn text={cred.password} />
                </div>

                <Link
                  to={loginPath}
                  className="flex items-center justify-center gap-1.5 text-[11px] font-mono text-brand-500 hover:underline"
                >
                  <LogIn size={11} /> Sign in as {cred.role} →
                </Link>
              </div>
            ))}
          </div>

          <Button
            size="lg"
            icon={ChevronRight} iconPos="right"
            onClick={() => navigate(isAuthenticated ? config.dashboardPath : loginPath)}
          >
            {isAuthenticated ? 'Open Dashboard' : 'Go to Login & Try It'}
          </Button>
        </div>
      </Section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="py-8 px-6 border-t border-[var(--border)] relative z-10 bg-[var(--bg)]/70 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] font-mono">
            <Link to="/" className="hover:text-brand-500 transition-colors">← All Projects</Link>
            <Link to="/guide" className="hover:text-brand-500 transition-colors">Guide</Link>
            <Link to="/privacy" className="hover:text-brand-500 transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-brand-500 transition-colors">Terms</Link>
          </div>
          <p className="text-[10px] text-[var(--text-muted)] font-mono">
            {footerLine()}
          </p>
        </div>
      </footer>
    </div>
  )
}
