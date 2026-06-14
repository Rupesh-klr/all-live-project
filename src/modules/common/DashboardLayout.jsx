import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Terminal, Sun, Moon, LogOut, Bell, Menu, X,
  LayoutGrid, ExternalLink, ArrowLeft, Sparkles,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { Badge } from '../../components/Badge/Badge'
import { Tooltip } from '../../components/Tooltip/Tooltip'
import { APP_CONFIG } from '../../config/app.config'
import { MODULES, getModule } from '../registry'

// ── "Coming soon" notification bell ─────────────────────────────────────────────
function NotificationBell() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Tooltip content="Notifications">
        <button
          onClick={() => setOpen(o => !o)}
          className="relative p-2 rounded-lg hover:bg-[var(--bg-2)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
        >
          <Bell size={15} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-amber-500" />
        </button>
      </Tooltip>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-12 z-50 w-64 card p-0 overflow-hidden shadow-xl">
            <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2">
              <Bell size={13} className="text-brand-500" />
              <span className="font-mono text-xs font-bold text-[var(--text)]">Notifications</span>
            </div>
            <div className="px-4 py-8 text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-3">
                <Sparkles size={16} className="text-amber-500" />
              </div>
              <p className="text-sm font-semibold text-[var(--text)] mb-1">Coming soon</p>
              <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                Real-time alerts &amp; activity feed are on the way.
              </p>
            </div>
          </div>
        </>
      )}
    </>
  )
}

// ── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ activeSlug, open, onClose }) {
  const navigate = useNavigate()

  return (
    <>
      {/* Mobile backdrop */}
      {open && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />}

      <aside
        className={`fixed lg:sticky top-0 z-50 lg:z-0 h-screen w-60 shrink-0 border-r border-[var(--border)]
                    bg-[var(--bg)] flex flex-col transition-transform duration-200
                    ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand → hub */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-[var(--border)]">
          <Link to="/dashboard" className="flex items-center gap-2">
            <Terminal size={16} className="text-brand-500" />
            <span className="font-mono font-bold text-sm text-[var(--text)]">
              {APP_CONFIG.brandName.split('.')[0]}
              <span className="text-brand-500">.{APP_CONFIG.brandName.split('.')[1] || 'hub'}</span>
            </span>
          </Link>
          <button onClick={onClose} className="lg:hidden p-1 text-[var(--text-muted)] hover:text-[var(--text)]">
            <X size={16} />
          </button>
        </div>

        {/* Hub link */}
        <div className="px-3 pt-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium
                       text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-2)] transition-colors"
          >
            <LayoutGrid size={15} /> All Modules
          </button>
        </div>

        {/* Module nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-3">
          <p className="px-3 mb-2 font-mono text-[9px] uppercase tracking-widest text-[var(--text-muted)]">
            Modules ({MODULES.length})
          </p>
          <div className="space-y-1">
            {MODULES.map(mod => {
              const Icon = mod.icon
              const active = mod.slug === activeSlug
              const soon = mod.status === 'soon'
              return (
                <button
                  key={mod.slug}
                  onClick={() => !soon && navigate(mod.dashboardPath)}
                  disabled={soon}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors
                              ${active
                                ? 'bg-brand-500/10 text-[var(--text)]'
                                : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-2)]'}
                              ${soon ? 'opacity-60 cursor-not-allowed' : ''}`}
                  style={active ? { boxShadow: `inset 2px 0 0 ${mod.color}` } : undefined}
                >
                  <Icon size={15} style={{ color: active ? mod.color : undefined }} />
                  <span className="flex-1 text-left truncate">{mod.shortName || mod.name}</span>
                  {soon && (
                    <span className="font-mono text-[8px] uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      soon
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </nav>

        {/* Footer identity */}
        <div className="px-4 py-3 border-t border-[var(--border)]">
          <p className="font-mono text-[9px] text-[var(--text-muted)] leading-relaxed">
            {APP_CONFIG.developerName} · {APP_CONFIG.tagline}
          </p>
        </div>
      </aside>
    </>
  )
}

/**
 * DashboardLayout — shared chrome for every module dashboard.
 *
 * Props:
 *   slug      module slug (drives sidebar highlight + "Back to project" link)
 *   title     page title (string)
 *   subtitle  short description under the title
 *   actions   optional React node rendered on the right of the header
 *   children  page content
 */
export function DashboardLayout({ slug, title, subtitle, actions, children }) {
  const { user, logout } = useAuth()
  const { toggle, isDark } = useTheme()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const mod = getModule(slug)
  const Icon = mod?.icon

  return (
    <div className="min-h-screen flex bg-[var(--bg)]">
      <Sidebar activeSlug={slug} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 h-14 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-md">
          <div className="h-full px-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-[var(--bg-2)] text-[var(--text-muted)]"
              >
                <Menu size={16} />
              </button>

              {/* Top navigation buttons */}
              <button
                onClick={() => navigate('/dashboard')}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono
                           text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-2)] transition-colors"
              >
                <ArrowLeft size={12} /> Hub
              </button>
              {mod && (
                <button
                  onClick={() => navigate(mod.publicPath)}
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono
                             text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-2)] transition-colors"
                >
                  <ExternalLink size={12} /> Project page
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <div className="relative"><NotificationBell /></div>
              <Tooltip content={isDark ? 'Light mode' : 'Dark mode'}>
                <button onClick={toggle} className="p-2 rounded-lg hover:bg-[var(--bg-2)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
                  {isDark ? <Sun size={15} /> : <Moon size={15} />}
                </button>
              </Tooltip>
              <div className="hidden sm:flex items-center gap-2 pl-1">
                <span className="font-mono text-xs text-[var(--text-muted)]">{user?.username}</span>
                <Badge role={user?.role} />
              </div>
              <Tooltip content="Sign out">
                <button onClick={logout} className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-500 transition-colors">
                  <LogOut size={15} />
                </button>
              </Tooltip>
            </div>
          </div>
        </header>

        {/* Page header */}
        {(title || actions) && (
          <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-3">
              {Icon && (
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                     style={{ background: `${mod.color}15` }}>
                  <Icon size={20} style={{ color: mod.color }} />
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold text-[var(--text)]">{title}</h1>
                {subtitle && <p className="text-sm text-[var(--text-muted)] mt-0.5 max-w-2xl">{subtitle}</p>}
              </div>
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
        )}

        {/* Content */}
        <main className="flex-1 px-6 pb-10">{children}</main>
      </div>
    </div>
  )
}
