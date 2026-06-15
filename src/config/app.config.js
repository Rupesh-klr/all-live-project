/**
 * Global application identity & configuration.
 *
 * Everything here is driven by environment variables (Vite `import.meta.env.VITE_*`)
 * so nothing about the portfolio owner is hard-coded into components. Change the
 * values in `.env` and the whole UI updates — brand, developer name, tagline, etc.
 *
 * This is what replaced the old hard-coded "6-year engineering standards" line.
 */
const env = import.meta.env

export const APP_CONFIG = {
  // Brand / product
  brandName:  env.VITE_BRAND_NAME  || 'portfolio.hub',

  // Developer identity
  developerName:  env.VITE_DEVELOPER_NAME  || 'Rupesh',
  developerTitle: env.VITE_DEVELOPER_TITLE || 'Full-Stack Engineer',

  // Positioning line shown in footers / hero. Keep it capability-focused —
  // no fixed "N years" claim, so it never goes stale.
  tagline:    env.VITE_PORTFOLIO_TAGLINE    || 'Production-grade engineering',

  // Optional extra (e.g. "6+ years", "Open to work"). Empty by default.
  experience: env.VITE_PORTFOLIO_EXPERIENCE || '',

  // Location (optional — shown on the About/résumé page)
  location:   env.VITE_DEVELOPER_LOCATION || '',

  // Links
  apiBaseUrl:   env.VITE_API_BASE_URL || 'http://localhost:5000',
  contactEmail: env.VITE_CONTACT_EMAIL || '',
  githubUrl:    env.VITE_GITHUB_URL || '',
  linkedinUrl:  env.VITE_LINKEDIN_URL || '',
  resumeUrl:    env.VITE_RESUME_URL || '',
}

/**
 * Identity line: "Rupesh · Production-grade engineering"
 * (developer name + tagline combined). Experience appended only if set.
 */
export function identityLine() {
  const parts = [APP_CONFIG.developerName, APP_CONFIG.tagline].filter(Boolean)
  let line = parts.join(' · ')
  if (APP_CONFIG.experience) line += ` · ${APP_CONFIG.experience}`
  return line
}

/**
 * Full footer line: "© 2026 portfolio.hub — Rupesh · Production-grade engineering"
 */
export function footerLine() {
  return `© ${new Date().getFullYear()} ${APP_CONFIG.brandName} — ${identityLine()}`
}
