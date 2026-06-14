import { useNavigate } from 'react-router-dom'
import { Terminal, Sun, Moon, LogOut, ExternalLink } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { Badge } from '../components/Badge/Badge'
import { Tooltip } from '../components/Tooltip/Tooltip'
import { APP_CONFIG } from '../config/app.config'
import { MODULES } from '../modules/registry'

export function Dashboard() {
  const { user, logout } = useAuth()
  const { toggle, isDark } = useTheme()
  const navigate = useNavigate()

  const [brandHead, brandTail] = APP_CONFIG.brandName.split('.')

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal size={18} className="text-brand-500" />
            <span className="font-mono font-bold text-sm">
              {brandHead}<span className="text-brand-500">.{brandTail || 'hub'}</span>
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

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Hero */}
        <div className="mb-10">
          <p className="font-mono text-xs text-brand-500 mb-2">
            <span className="text-green-500">❯</span> Hello, {user?.displayName || user?.username}
          </p>
          <h1 className="text-3xl font-bold text-[var(--text)] mb-2">Portfolio Hub</h1>
          <p className="text-[var(--text-muted)] text-sm max-w-lg">
            Production-grade projects demonstrating distributed systems, AI pipelines,
            real-time data, and enterprise architecture — {APP_CONFIG.tagline}.
          </p>
        </div>

        {/* Module cards — folder-driven from the registry */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {MODULES.map(mod => {
            const Icon = mod.icon
            const soon = mod.status === 'soon'
            return (
              <button
                key={mod.slug}
                onClick={() => !soon && navigate(mod.publicPath)}
                disabled={soon}
                className="card p-5 text-left group hover:border-brand-500/50 hover:shadow-lg
                           hover:shadow-brand-500/5 transition-all duration-200 hover:-translate-y-0.5
                           disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 rounded-lg" style={{ background: `${mod.color}18` }}>
                    <Icon size={20} style={{ color: mod.color }} />
                  </div>
                  {soon
                    ? <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">soon</span>
                    : <ExternalLink size={14} className="text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />}
                </div>

                <h2 className="font-semibold text-[var(--text)] text-sm mb-1">{mod.name}</h2>
                <p className="text-xs text-[var(--text-muted)] mb-3 leading-relaxed">{mod.summary}</p>

                <div className="flex flex-wrap gap-1 mb-3">
                  {mod.tech.map(t => (
                    <span key={t} className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-[var(--bg)] border border-[var(--border)] text-[var(--text-muted)]">
                      {t}
                    </span>
                  ))}
                </div>

                <ul className="space-y-1">
                  {mod.highlights.map(h => (
                    <li key={h} className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)]">
                      <span className="w-1 h-1 rounded-full shrink-0" style={{ background: mod.color }} />
                      {h}
                    </li>
                  ))}
                </ul>
              </button>
            )
          })}
        </div>

        {/* Footer links */}
        <div className="mt-12 flex items-center gap-4 text-xs text-[var(--text-muted)] font-mono">
          <a href="/guide"   className="hover:text-brand-500 transition-colors">Guide</a>
          <a href="/privacy" className="hover:text-brand-500 transition-colors">Privacy</a>
          <a href="/terms"   className="hover:text-brand-500 transition-colors">Terms</a>
        </div>
      </main>
    </div>
  )
}
