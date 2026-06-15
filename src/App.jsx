import { Fragment } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthGuard } from './modules/auth/AuthGuard'
import { Login } from './modules/auth/Login'
import { Signup } from './modules/auth/Signup'

import { Guide }          from './pages/Guide'
import { PrivacyPolicy }  from './pages/PrivacyPolicy'
import { Terms }          from './pages/Terms'
import { Dashboard }      from './pages/Dashboard'
import { About }          from './pages/About'
import { OnboardingModal }    from './modules/common/OnboardingModal'
import { SessionExpiredModal } from './modules/common/SessionExpiredModal'
import { ScrollRestorer }      from './modules/common/ScrollRestorer'

// Folder-driven module list. Add/remove a module folder (or flip its `active`
// flag) and every route below appears/disappears automatically — no edits here.
import { MODULES } from './modules/registry'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              className: 'font-mono text-xs',
              style: { background: 'var(--bg-2)', color: 'var(--text)', border: '1px solid var(--border)' },
            }}
          />

          {/* Saves + restores scroll position on every route change */}
          <ScrollRestorer />
          {/* Shows once per session after first login/signup */}
          <OnboardingModal />
          {/* Session expired — cross-tab logout or 401 after failed refresh */}
          <SessionExpiredModal />

          <Routes>
            {/* ── Public auth pages ────────────────────────────── */}
            <Route path="/login"  element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* ── Public static pages ──────────────────────────── */}
            <Route path="/about"   element={<About />} />
            <Route path="/guide"   element={<Guide />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms"   element={<Terms />} />

            {/* ── Module routes — generated from the registry ───── */}
            {/* Per module: public landing, module-scoped login, protected dashboard */}
            {MODULES.map(m => {
              const PublicPage = m.PublicPage
              const ModuleDashboard = m.Dashboard
              return (
                <Fragment key={m.slug}>
                  <Route path={m.publicPath} element={<PublicPage />} />
                  <Route path={m.loginPath}  element={<Login defaultRedirect={m.dashboardPath} />} />
                  <Route
                    path={m.dashboardPath}
                    element={<AuthGuard requiredModule={m.slug}><ModuleDashboard /></AuthGuard>}
                  />
                </Fragment>
              )
            })}

            {/* ── Protected hub ─────────────────────────────────── */}
            <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />

            {/* ── Fallback ─────────────────────────────────────── */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center font-mono text-[var(--text-muted)]">
                404 — Page not found
              </div>
            } />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
