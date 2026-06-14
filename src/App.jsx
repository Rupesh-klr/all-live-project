import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthGuard } from './modules/auth/AuthGuard'
import { Login } from './modules/auth/Login'
import { Signup } from './modules/auth/Signup'
import { TelecomDashboard } from './modules/telecom-optimizer/Dashboard'
import { VectorShiftDashboard } from './modules/vectorshift/Dashboard'
import { BankingDashboard } from './modules/banking-core/Dashboard'
import { WhatsAppDashboard } from './modules/whatsapp-crm/Dashboard'
import { Guide } from './pages/Guide'
import { PrivacyPolicy } from './pages/PrivacyPolicy'
import { Terms } from './pages/Terms'
import { Dashboard } from './pages/Dashboard'

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
          <Routes>
            {/* Public */}
            <Route path="/login"   element={<Login />} />
            <Route path="/signup"  element={<Signup />} />
            <Route path="/guide"   element={<Guide />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms"   element={<Terms />} />

            {/* Protected — all roles including guest can see dashboards */}
            <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
            <Route path="/telecom-optimizer" element={
              <AuthGuard requiredModule="telecom-optimizer"><TelecomDashboard /></AuthGuard>
            } />
            <Route path="/vectorshift" element={
              <AuthGuard requiredModule="vectorshift"><VectorShiftDashboard /></AuthGuard>
            } />
            <Route path="/banking-core" element={
              <AuthGuard requiredModule="banking-core"><BankingDashboard /></AuthGuard>
            } />
            <Route path="/whatsapp-crm" element={
              <AuthGuard requiredModule="whatsapp-crm"><WhatsAppDashboard /></AuthGuard>
            } />

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
