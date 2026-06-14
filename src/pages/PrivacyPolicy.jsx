import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function PrivacyPolicy() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-[var(--bg)] p-6">
      <div className="max-w-3xl mx-auto prose prose-sm dark:prose-invert">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text)] mb-6 transition-colors">
          <ArrowLeft size={14} /> Back
        </button>
        <h1 className="text-2xl font-bold text-[var(--text)] mb-2">Privacy Policy</h1>
        <p className="text-xs text-[var(--text-muted)] mb-8">Last updated: June 14, 2026</p>
        {[
          ['Data Collected', 'We collect username, email, phone number, and password hash during registration. Passwords are never stored in plaintext — bcrypt is used with a 12-round salt. Raw passwords are never accessible to developers or admins.'],
          ['Data Usage', 'Collected data is used solely for authentication and module access control. We do not sell, share, or expose personal data to third parties.'],
          ['Session Tokens', 'Session tokens are stored in the browser localStorage. Access tokens expire in 15 minutes; refresh tokens in 30 days. Logout immediately revokes all tokens server-side.'],
          ['Encryption', 'All data in transit is encrypted via TLS. Sensitive form fields use an additional AES-256 client-side encryption layer (ENCRY_MIDDLE_PROTECTION protocol) before transmission.'],
          ['Logs', 'Server logs are retained for 30 days. Log access requires a 24-character access key not exposed to the frontend. Logs do not contain passwords or tokens.'],
          ['Contact', 'For privacy concerns, contact: support@yourdomain.com'],
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
