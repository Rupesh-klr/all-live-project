import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function Terms() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-[var(--bg)] p-6">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text)] mb-6 transition-colors">
          <ArrowLeft size={14} /> Back
        </button>
        <h1 className="text-2xl font-bold text-[var(--text)] mb-2">Terms of Service</h1>
        <p className="text-xs text-[var(--text-muted)] mb-8">Last updated: June 14, 2026</p>
        {[
          ['Acceptance', 'By accessing Portfolio Hub you agree to these terms. This platform is a portfolio demonstration environment, not a commercial product.'],
          ['Permitted Use', 'This platform may be used for evaluation, learning, and interview/demonstration purposes. Automated scraping, load testing, or malicious use is prohibited.'],
          ['No Warranty', 'The platform is provided "as is." We make no guarantees of uptime, data persistence, or fitness for production use.'],
          ['Intellectual Property', 'All code, design, and content is the property of the platform author. You may not reproduce, distribute, or commercialise it without permission.'],
          ['Termination', 'Accounts may be suspended for terms violations. Bot-like behavior, rate-limit abuse, or attempts to exploit the API will result in IP blocking.'],
          ['Changes', 'These terms may be updated at any time. Continued use after changes constitutes acceptance.'],
        ].map(([title, body]) => (
          <section key={title} className="mb-6">
            <h2 className="font-semibold text-[var(--text)] text-base mb-1">{title}</h2>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">{body}</p>
          </section>
        ))}
      </div>
    </div>
  )
}
