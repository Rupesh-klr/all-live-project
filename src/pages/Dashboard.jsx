import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Terminal, Sun, Moon, LogOut, ArrowUpRight, Activity,
  LayoutGrid, Cpu, Boxes, Github, Linkedin, Mail,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { Badge } from '../components/Badge/Badge'
import { Tooltip } from '../components/Tooltip/Tooltip'
import { APP_CONFIG, identityLine } from '../config/app.config'
import { MODULES } from '../modules/registry'

const SUBTABS_PER_MODULE = 5 // each live module ships a 5-tab dashboard

export function Dashboard() {
  const { user, logout } = useAuth()
  const { toggle, isDark } = useTheme()
  const navigate = useNavigate()

  const [brandHead, brandTail] = APP_CONFIG.brandName.split('.')

  // ── Live backend probe (status pill + real module count) ───────────────────
  // Plain fetch (not the axios `api`) so a down backend never fires an error toast.
  const [backend, setBackend] = useState({ live: false, count: null, checked: false })

  useEffect(() => {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), 4000)
    ;(async () => {
      try {
        const res = await fetch(`${APP_CONFIG.apiBaseUrl}/api/modules`, { signal: ctrl.signal })
        if (!res.ok) throw new Error('bad status')
        const json = await res.json()
        const count = Array.isArray(json?.data) ? json.data.length
                    : Array.isArray(json)       ? json.length
                    : null
        setBackend({ live: true, count, checked: true })
      } catch {
        setBackend({ live: false, count: null, checked: true })
      } finally {
        clearTimeout(t)
      }
    })()
    return () => { clearTimeout(t); ctrl.abort() }
  }, [])

  // ── Derived, honest stats ──────────────────────────────────────────────────
  const liveCount  = backend.count ?? MODULES.length
  const techCount  = useMemo(() => new Set(MODULES.flatMap(m => m.tech || [])).size, [])
  const viewCount  = MODULES.length * SUBTABS_PER_MODULE

  // Ambient glow blended from the actual module accent colors — the hub literally
  // glows in the colors of the projects it holds.
  const glow = useMemo(() => {
    const c = MODULES.map(m => m.color)
    const at = (i, fb) => c[i] || fb
    return [
      `radial-gradient(ellipse 65% 50% at 12% -8%, ${at(0, '#6366f1')}26 0%, transparent 60%)`,
      `radial-gradient(ellipse 60% 45% at 88% -6%, ${at(1, '#22c55e')}1f 0%, transparent 60%)`,
      `radial-gradient(ellipse 80% 55% at 50% 112%, ${at(2, '#8b5cf6')}1a 0%, transparent 62%)`,
    ].join(', ')
  }, [])

  const STATS = [
    { icon: Boxes,      label: 'Live Modules',    value: liveCount },
    { icon: LayoutGrid, label: 'Dashboard Views', value: viewCount },
    { icon: Cpu,        label: 'Technologies',    value: techCount },
    { icon: Activity,   label: 'API Status',      value: backend.checked ? (backend.live ? 'Live' : 'Offline') : '…',
      live: backend.live, status: true },
  ]

  return (
    <div className="min-h-screen bg-[var(--bg)] relative">
      {/* ── Ambient background: module-colored glow + dot grid ──────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{ background: glow }} />
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.35]"
        style={{
          backgroundImage: 'radial-gradient(circle, var(--border) 1px, transparent 1px)',
          backgroundSize: '34px 34px',
        }}
      />

      {/* ── Navbar ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal size={18} className="text-brand-500" />
            <span className="font-mono font-bold text-sm">
              {brandHead}<span className="text-brand-500">.{brandTail || 'hub'}</span>
            </span>
            <span
              className="hidden sm:inline-flex items-center gap-1.5 ml-2 px-2 py-0.5 rounded-full border border-[var(--border)] bg-[var(--bg-2)]/60"
              title={backend.live ? 'Backend reachable' : 'Backend not reachable'}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${backend.live ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--text-muted)]">
                {backend.checked ? (backend.live ? 'API live' : 'API offline') : 'checking'}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <span className="font-mono">{user?.username}</span>
              <Badge role={user?.role} />
            </div>
            <Tooltip content={isDark ? 'Light mode' : 'Dark mode'}>
              <button onClick={toggle} className="p-2 rounded-lg hover:bg-[var(--bg-2)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
                {isDark ? <Sun size={15} /> : <Moon size={15} />}
              </button>
            </Tooltip>
            <Tooltip content="Sign out">
              <button onClick={logout} className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-500 transition-colors">
                <LogOut size={15} />
              </button>
            </Tooltip>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 relative z-10">
        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <div className="mb-10 animate-fade-in">
          <p className="font-mono text-xs text-brand-500 mb-3">
            <span className="text-green-500">❯</span> Hello, {user?.displayName || user?.username}
          </p>
          <h1
            className="text-4xl md:text-5xl font-bold leading-tight mb-3"
            style={{
              backgroundImage: `linear-gradient(120deg, var(--text) 30%, ${MODULES[0]?.color || '#6366f1'})`,
              WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
            }}
          >
            Portfolio Hub
          </h1>
          <p className="text-[var(--text-muted)] text-sm max-w-2xl leading-relaxed mb-1">
            Production-grade projects demonstrating distributed systems, AI pipelines,
            real-time data, and enterprise architecture. Every dashboard is a live,
            interactive demo wired to a real backend — not a screenshot.
          </p>
          <p className="font-mono text-[11px] text-[var(--text-muted)]">
            <span className="text-brand-500">{APP_CONFIG.developerName}</span>
            {' · '}{APP_CONFIG.developerTitle}{' · '}{APP_CONFIG.tagline}
          </p>
        </div>

        {/* ── Stats bar ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {STATS.map(s => {
            const SIcon = s.icon
            return (
              <div key={s.label} className="card p-4 backdrop-blur-sm flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-brand-500/10">
                  <SIcon size={16} className="text-brand-500" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    {s.status && (
                      <span className={`w-1.5 h-1.5 rounded-full ${s.live ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
                    )}
                    <span className="text-lg font-mono font-bold text-[var(--text)] truncate">{s.value}</span>
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-mono">{s.label}</div>
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Module cards — folder-driven from the registry ─────────────────── */}
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-sm font-bold text-[var(--text)]">Projects</h2>
          <span className="font-mono text-[10px] text-[var(--text-muted)]">{MODULES.length} interactive demos</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {MODULES.map(mod => {
            const Icon = mod.icon
            const soon = mod.status === 'soon'
            return (
              <button
                key={mod.slug}
                onClick={() => !soon && navigate(mod.publicPath)}
                disabled={soon}
                className="group relative text-left rounded-xl border border-[var(--border)] bg-[var(--bg-2)]/70 backdrop-blur-sm
                           p-5 overflow-hidden transition-all duration-200 hover:-translate-y-1
                           disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
              >
                {/* accent top line + hover glow in the module color */}
                <span className="absolute inset-x-0 top-0 h-0.5 opacity-70" style={{ background: mod.color }} />
                <span
                  className="absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{ boxShadow: `0 12px 40px -12px ${mod.color}66`, border: `1px solid ${mod.color}40` }}
                />

                <div className="relative flex items-start justify-between mb-3">
                  <div className="p-2.5 rounded-xl" style={{ background: `${mod.color}18` }}>
                    <Icon size={22} style={{ color: mod.color }} />
                  </div>
                  {soon ? (
                    <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">soon</span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <span className="hidden group-hover:inline font-mono text-[9px] uppercase tracking-widest" style={{ color: mod.color }}>open</span>
                      <span className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest text-[var(--text-muted)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> live
                      </span>
                      <ArrowUpRight size={15} className="text-[var(--text-muted)] group-hover:text-[var(--text)] transition-colors" />
                    </span>
                  )}
                </div>

                <h3 className="relative font-semibold text-[var(--text)] text-base mb-1">{mod.name}</h3>
                <p className="relative text-xs text-[var(--text-muted)] mb-3 leading-relaxed">{mod.summary}</p>

                <div className="relative flex flex-wrap gap-1 mb-3">
                  {mod.tech.map(t => (
                    <span key={t} className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-[var(--bg)] border border-[var(--border)] text-[var(--text-muted)]">
                      {t}
                    </span>
                  ))}
                </div>

                <ul className="relative space-y-1">
                  {mod.highlights.map(h => (
                    <li key={h} className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)]">
                      <span className="w-1 h-1 rounded-full shrink-0" style={{ background: mod.color }} />
                      {h}
                    </li>
                  ))}
                </ul>

                <div className="relative mt-3 pt-3 border-t border-[var(--border)] flex items-center justify-between">
                  <span className="font-mono text-[9px] text-[var(--text-muted)]">{SUBTABS_PER_MODULE} dashboard tabs</span>
                  <span className="font-mono text-[9px]" style={{ color: mod.color }}>/{mod.slug}</span>
                </div>
              </button>
            )
          })}
        </div>

        {/* ── Footer ────────────────────────────────────────────────────────── */}
        <footer className="mt-14 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] font-mono">
            <a href="/guide"   className="hover:text-brand-500 transition-colors">Guide</a>
            <a href="/privacy" className="hover:text-brand-500 transition-colors">Privacy</a>
            <a href="/terms"   className="hover:text-brand-500 transition-colors">Terms</a>
          </div>

          <div className="flex items-center gap-3">
            {APP_CONFIG.githubUrl && (
              <Tooltip content="GitHub">
                <a href={APP_CONFIG.githubUrl} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-2)] transition-colors"><Github size={15} /></a>
              </Tooltip>
            )}
            {APP_CONFIG.linkedinUrl && (
              <Tooltip content="LinkedIn">
                <a href={APP_CONFIG.linkedinUrl} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-2)] transition-colors"><Linkedin size={15} /></a>
              </Tooltip>
            )}
            {APP_CONFIG.contactEmail && (
              <Tooltip content="Email">
                <a href={`mailto:${APP_CONFIG.contactEmail}`} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-2)] transition-colors"><Mail size={15} /></a>
              </Tooltip>
            )}
            <span className="font-mono text-[10px] text-[var(--text-muted)]">
              © {new Date().getFullYear()} · {identityLine()}
            </span>
          </div>
        </footer>
      </main>
    </div>
  )
}
