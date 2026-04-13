import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'
import { HardHat, Calendar, Package, BarChart3 } from 'lucide-react'

// Pages publiques — chargement immédiat (légères)
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'

// Pages lourdes — lazy loading
const Onboarding         = lazy(() => import('./pages/Onboarding'))
const Dashboard          = lazy(() => import('./pages/Dashboard'))
const Clients            = lazy(() => import('./pages/Clients'))
const ClientDetail       = lazy(() => import('./pages/ClientDetail'))
const Devis              = lazy(() => import('./pages/Devis'))
const DevisDetail        = lazy(() => import('./pages/DevisDetail'))
const DevisPersonnalisation = lazy(() => import('./pages/DevisPersonnalisation'))
const IvyVoice           = lazy(() => import('./pages/IvyVoice'))
const VisionDevis        = lazy(() => import('./pages/VisionDevis'))
const Relances           = lazy(() => import('./pages/Relances'))
const SettingsPage       = lazy(() => import('./pages/Settings'))
const Placeholder        = lazy(() => import('./pages/Placeholder'))

function PageLoader() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '28px', height: '28px', border: '2px solid var(--border-strong)', borderTopColor: 'var(--brand)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function NotFound() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', fontFamily: 'Inter, sans-serif' }}>
      <span style={{ fontSize: '64px', fontWeight: '700', color: 'var(--border-strong)', letterSpacing: '-3px' }}>404</span>
      <p style={{ fontSize: '15px', color: 'var(--text-muted)' }}>Cette page n'existe pas.</p>
      <a href="/" style={{ fontSize: '13px', color: 'var(--brand)', textDecoration: 'none', fontWeight: '500' }}>← Retour à l'accueil</a>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Routes publiques */}
            <Route path="/landing" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Onboarding */}
            <Route element={<ProtectedRoute requireOnboarding={false} />}>
              <Route path="/onboarding" element={<Onboarding />} />
            </Route>

            {/* Routes protégées */}
            <Route element={<ProtectedRoute requireOnboarding={true} />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/clients" element={<Clients />} />
                <Route path="/clients/:id" element={<ClientDetail />} />
                <Route path="/devis" element={<Devis />} />
                <Route path="/devis/personnaliser" element={<DevisPersonnalisation />} />
                <Route path="/devis/:id" element={<DevisDetail />} />
                <Route path="/chantiers" element={<Placeholder title="Chantiers" icon={HardHat} desc="Gestion des chantiers, planning, suivi d'avancement et alertes météo intelligentes." />} />
                <Route path="/calendrier" element={<Placeholder title="Calendrier" icon={Calendar} desc="Planning des chantiers, rendez-vous clients et reprogrammation automatique en cas de pluie." />} />
                <Route path="/stock" element={<Placeholder title="Stock & Matériaux" icon={Package} desc="Suivi des stocks, alertes de rupture et intégration avec les factures fournisseurs." />} />
                <Route path="/ivy-voice" element={<IvyVoice />} />
                <Route path="/vision-devis" element={<VisionDevis />} />
                <Route path="/relances" element={<Relances />} />
                <Route path="/analytics" element={<Placeholder title="Analytics" icon={BarChart3} desc="Tableau de bord financier, marges par chantier, rentabilité et tendances." />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}
