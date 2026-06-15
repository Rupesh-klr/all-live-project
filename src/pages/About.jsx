import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Terminal, Sun, Moon, ArrowLeft, ArrowUpRight, Download, Mail,
  Github, Linkedin, MapPin, Code2, Server, Cloud, Database, Brain,
  Layers, CheckCircle2, Sparkles,
} from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/Button/Button'
import { APP_CONFIG, identityLine } from '../config/app.config'
import { MODULES } from '../modules/registry'

/**
 * Resume / portfolio "About" page — the human story behind the live projects.
 * Identity is env-driven (APP_CONFIG); skills are curated; projects come from the
 * module registry so this page never drifts from what's actually shipped.
 */

const SKILLS = [
  { icon: Code2,    title: 'Frontend',        items: ['React 18', 'Next.js', 'Vite', 'Tailwind CSS', 'TypeScript', 'React Router', 'Ionic'] },
  { icon: Server,   title: 'Backend',         items: ['Node.js', 'Express', 'Spring Boot', 'Java', 'REST APIs', 'JWT / OAuth2', 'WebSockets'] },
  { icon: Cloud,    title: 'Cloud & DevOps',  items: ['AWS (EC2, ALB, S3)', 'CloudFront', 'Route 53', 'Docker', 'CI/CD', 'Nginx', 'Linux'] },
  { icon: Database, title: 'Data',            items: ['MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Mongoose', 'Indexing & Pagination'] },
  { icon: Brain,    title: 'AI & Algorithms', items: ['RAG pipelines', 'Vector search', 'Graph algorithms', 'Dijkstra / A*', 'LLM integration'] },
  { icon: Layers,   title: 'Architecture',    items: ['Microservices', 'Event-driven', 'Idempotency', 'Rate limiting', 'Module-driven design'] },
]

const STRENGTHS = [
  'Designs systems that stay readable as they scale — folder-driven modules, one auth layer, zero copy-paste between features.',
  'Ships end-to-end: database schema → secured API → polished, interactive UI — not just one slice.',
  'Treats security as a first-class concern: AES-in-transit, bcrypt-at-rest, token revocation, layered middleware.',
  'Writes algorithms, not wrappers: real Dijkstra/A*, Yen’s k-shortest-paths, keyword-overlap RAG with scored retrieval.',
]

export function About() {
  const { toggle, isDark } = useTheme()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const techCount = useMemo(() => new Set(SKILLS.flatMap(s => s.items)).size, [])
  const accent = MODULES[0]?.color || '#6366f1'

  const glow = useMemo(() => {
    const c = MODULES.map(m => m.color)
    const at = (i, fb) => c[i] || fb
    return [
      `radial-gradient(ellipse 60% 50% at 10% -8%, ${at(0, '#6366f1')}26 0%, transparent 60%)`,
      `radial-gradient(ellipse 55% 45% at 90% -6%, ${at(1, '#22c55e')}1e 0%, transparent 60%)`,
      `radial-gradient(ellipse 80% 55% at 50% 112%, ${at(3, '#8b5cf6')}18 0%, transparent 62%)`,
    ].join(', ')
  }, [])

  return (
    <div className="min-h-screen bg-[var(--bg)] relative">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{ background: glow }} />
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.35]"
        style={{ backgroundImage: 'radial-gradient(circle, var(--border) 1px, transparent 1px)', backgroundSize: '34px 34px' }}
      />

      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-1.5 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors text-xs font-mono">
              <ArrowLeft size={12} /> {isAuthenticated ? 'Hub' : 'Home'}
            </Link>
            <div className="w-px h-4 bg-[var(--border)]" />
            <div className="flex items-center gap-2">
              <Terminal size={14} className="text-brand-500" />
              <span className="font-mono font-bold text-sm text-[var(--text)]">
                {APP_CONFIG.brandName.split('.')[0]}<span className="text-brand-500">.{APP_CONFIG.brandName.split('.')[1] || 'hub'}</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggle} className="p-2 rounded-lg hover:bg-[var(--bg-2)] text-[var(--text-muted)] transition-colors">
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            {APP_CONFIG.resumeUrl && (
              <a href={APP_CONFIG.resumeUrl} target="_blank" rel="noreferrer">
                <Button size="sm" icon={Download}>Résumé</Button>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-16 pb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-2)]/60 backdrop-blur-sm mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-widest">
            {APP_CONFIG.experience || 'Open to opportunities'}
          </span>
        </div>

        <h1
          className="text-4xl md:text-6xl font-bold leading-tight mb-3"
          style={{ backgroundImage: `linear-gradient(120deg, var(--text) 35%, ${accent})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}
        >
          {APP_CONFIG.developerName}
        </h1>
        <p className="text-lg text-[var(--text)] font-semibold mb-2">{APP_CONFIG.developerTitle}</p>
        <p className="text-[var(--text-muted)] text-sm max-w-2xl leading-relaxed mb-6">
          {APP_CONFIG.tagline}. I build full-stack products end to end — secured APIs, real
          algorithms, and interactive UIs — then ship them live. Everything on this site is a
          working demo wired to a real backend, not a mockup.
        </p>

        <div className="flex flex-wrap items-center gap-3 mb-2">
          <Button icon={ArrowUpRight} iconPos="right" onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}>
            View Live Projects
          </Button>
          {APP_CONFIG.contactEmail && (
            <a href={`mailto:${APP_CONFIG.contactEmail}`}>
              <Button variant="ghost" icon={Mail}>Get in touch</Button>
            </a>
          )}
          {APP_CONFIG.resumeUrl && (
            <a href={APP_CONFIG.resumeUrl} target="_blank" rel="noreferrer">
              <Button variant="outline" icon={Download}>Download Résumé</Button>
            </a>
          )}
        </div>

        {(APP_CONFIG.location || APP_CONFIG.githubUrl || APP_CONFIG.linkedinUrl) && (
          <div className="flex flex-wrap items-center gap-4 mt-5 text-xs text-[var(--text-muted)] font-mono">
            {APP_CONFIG.location && <span className="flex items-center gap-1.5"><MapPin size={12} />{APP_CONFIG.location}</span>}
            {APP_CONFIG.githubUrl && <a href={APP_CONFIG.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-[var(--text)] transition-colors"><Github size={12} />GitHub</a>}
            {APP_CONFIG.linkedinUrl && <a href={APP_CONFIG.linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-[var(--text)] transition-colors"><Linkedin size={12} />LinkedIn</a>}
          </div>
        )}
      </section>

      {/* Stats */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: MODULES.length, label: 'Live Projects' },
            { value: MODULES.length * 5, label: 'Interactive Views' },
            { value: techCount + '+', label: 'Technologies' },
            { value: '100%', label: 'Real, Not Mocked' },
          ].map(s => (
            <div key={s.label} className="card p-5 text-center backdrop-blur-sm">
              <div className="text-2xl font-mono font-bold mb-1" style={{ color: accent }}>{s.value}</div>
              <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-widest font-mono">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-12">
        <p className="font-mono text-[10px] uppercase tracking-widest text-brand-500 mb-3">Technical Skills</p>
        <h2 className="text-2xl font-bold text-[var(--text)] mb-8">The stack I work across</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SKILLS.map(group => {
            const GIcon = group.icon
            return (
              <div key={group.title} className="card p-5 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-brand-500/10">
                    <GIcon size={15} className="text-brand-500" />
                  </div>
                  <span className="text-sm font-bold text-[var(--text)]">{group.title}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {group.items.map(it => (
                    <span key={it} className="font-mono text-[10px] px-2 py-0.5 rounded bg-[var(--bg)] border border-[var(--border)] text-[var(--text-muted)]">
                      {it}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* What I bring */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-12">
        <p className="font-mono text-[10px] uppercase tracking-widest text-brand-500 mb-3">How I work</p>
        <h2 className="text-2xl font-bold text-[var(--text)] mb-8">What I bring to a team</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {STRENGTHS.map((s, i) => (
            <div key={i} className="card p-5 flex gap-3 backdrop-blur-sm">
              <CheckCircle2 size={18} className="shrink-0 mt-0.5" style={{ color: accent }} />
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">{s}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured projects */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-12">
        <p className="font-mono text-[10px] uppercase tracking-widest text-brand-500 mb-3">Featured Work</p>
        <h2 className="text-2xl font-bold text-[var(--text)] mb-8">Live, interactive projects</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {MODULES.map(mod => {
            const Icon = mod.icon
            return (
              <button
                key={mod.slug}
                onClick={() => navigate(mod.publicPath)}
                className="group card p-5 text-left backdrop-blur-sm hover:-translate-y-1 transition-all duration-200"
                style={{ borderColor: `${mod.color}25` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2.5 rounded-xl" style={{ background: `${mod.color}18` }}>
                    <Icon size={20} style={{ color: mod.color }} />
                  </div>
                  <ArrowUpRight size={15} className="text-[var(--text-muted)] group-hover:text-[var(--text)] transition-colors" />
                </div>
                <h3 className="font-semibold text-[var(--text)] text-sm mb-1">{mod.name}</h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-3">{mod.summary}</p>
                <div className="flex flex-wrap gap-1">
                  {mod.tech.map(t => (
                    <span key={t} className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-[var(--bg)] border border-[var(--border)] text-[var(--text-muted)]">{t}</span>
                  ))}
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-16">
        <div className="card p-8 text-center backdrop-blur-sm" style={{ borderColor: `${accent}25` }}>
          <Sparkles size={22} className="mx-auto mb-3" style={{ color: accent }} />
          <h2 className="text-2xl font-bold text-[var(--text)] mb-2">Let’s build something</h2>
          <p className="text-[var(--text-muted)] text-sm mb-6 max-w-md mx-auto">
            Open to full-stack, backend, and platform roles. The fastest way to evaluate me is to
            click into a project and use it.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button icon={ArrowUpRight} iconPos="right" onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}>
              Explore the projects
            </Button>
            {APP_CONFIG.contactEmail && (
              <a href={`mailto:${APP_CONFIG.contactEmail}`}>
                <Button variant="ghost" icon={Mail}>{APP_CONFIG.contactEmail}</Button>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 px-6 border-t border-[var(--border)] bg-[var(--bg)]/70 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] font-mono">
            <Link to="/" className="hover:text-brand-500 transition-colors">Hub</Link>
            <Link to="/guide" className="hover:text-brand-500 transition-colors">Guide</Link>
            <Link to="/privacy" className="hover:text-brand-500 transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-brand-500 transition-colors">Terms</Link>
          </div>
          <p className="text-[10px] text-[var(--text-muted)] font-mono">© {new Date().getFullYear()} · {identityLine()}</p>
        </div>
      </footer>
    </div>
  )
}
