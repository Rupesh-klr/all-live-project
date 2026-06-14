import { Terminal, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const SECTIONS = [
  {
    title: 'Authentication',
    items: [
      'Login with your username, email, or phone number.',
      'Passwords are AES-encrypted before transmission — ENCRY_MIDDLE_PROTECTION protocol.',
      'Sessions use a short-lived access token (15 min) + long-lived refresh token (30 days).',
      'Tokens are tracked server-side; logout immediately revokes the session.',
    ],
  },
  {
    title: 'Modules',
    items: [
      'Each project is an independent module loaded dynamically at startup.',
      'Modules can be activated/deactivated by adding/removing app.js in the module folder.',
      'All module APIs are at /api/<module-name>/v1/',
      'Swagger docs at /api-docs list all available endpoints per module.',
    ],
  },
  {
    title: 'Access Control',
    items: [
      'Roles: admin > manager > viewer > guest.',
      'Each module defines default users and their roles.',
      'Role-based route protection on both frontend and backend.',
      'Module-level access can be restricted per user.',
    ],
  },
  {
    title: 'Security',
    items: [
      'Bot and headless browser requests are blocked at the server.',
      'Global rate limiting: 200 requests per 15 minutes.',
      'Auth endpoint limit: 20 attempts per 15 minutes.',
      'CORS restricted to configured origins and subdomains.',
    ],
  },
]

export function Guide() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-[var(--bg)] p-6">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text)] mb-6 transition-colors">
          <ArrowLeft size={14} /> Back
        </button>
        <div className="flex items-center gap-2 mb-2">
          <Terminal size={20} className="text-brand-500" />
          <h1 className="text-2xl font-bold text-[var(--text)]">Platform Guide</h1>
        </div>
        <p className="text-sm text-[var(--text-muted)] mb-10">
          Everything you need to know about using the Portfolio Hub platform.
        </p>
        <div className="space-y-8">
          {SECTIONS.map(s => (
            <div key={s.title}>
              <h2 className="font-mono font-bold text-brand-500 text-sm uppercase tracking-widest mb-3">{s.title}</h2>
              <ul className="space-y-2">
                {s.items.map(item => (
                  <li key={item} className="flex items-start gap-2 text-sm text-[var(--text-muted)]">
                    <span className="text-brand-500 font-mono mt-0.5">›</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
