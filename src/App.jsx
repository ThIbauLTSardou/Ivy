import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import Clients from './pages/Clients'
import ClientDetail from './pages/ClientDetail'
import DevisDetail from './pages/DevisDetail'
import Devis from './pages/Devis'
import IvyVoice from './pages/IvyVoice'
import VisionDevis from './pages/VisionDevis'
import Relances from './pages/Relances'
import Placeholder from './pages/Placeholder'
import SettingsPage from './pages/Settings'
import DevisPersonnalisation from './pages/DevisPersonnalisation'
import { HardHat, Calendar, Package, BarChart3, Settings } from 'lucide-react'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Routes publiques */}
          <Route path="/landing" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Onboarding — protégé mais sans vérif onboarding pour éviter la boucle */}
          <Route element={<ProtectedRoute requireOnboarding={false} />}>
            <Route path="/onboarding" element={<Onboarding />} />
          </Route>

          {/* Routes protégées — redirige vers /onboarding si non complété */}
          <Route element={<ProtectedRoute requireOnboarding={true} />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/clients/:id" element={<ClientDetail />} />
              <Route path="/devis/:id" element={<DevisDetail />} />
              <Route path="/chantiers" element={<Placeholder title="Chantiers" icon={HardHat} desc="Gestion des chantiers, planning, suivi d'avancement et alertes météo intelligentes." />} />
              <Route path="/devis" element={<Devis />} />
              <Route path="/devis/personnaliser" element={<DevisPersonnalisation />} />
              <Route path="/calendrier" element={<Placeholder title="Calendrier" icon={Calendar} desc="Planning des chantiers, rendez-vous clients et reprogrammation automatique en cas de pluie." />} />
              <Route path="/stock" element={<Placeholder title="Stock & Matériaux" icon={Package} desc="Suivi des stocks, alertes de rupture et intégration avec les factures fournisseurs." />} />
              <Route path="/ivy-voice" element={<IvyVoice />} />
              <Route path="/vision-devis" element={<VisionDevis />} />
              <Route path="/relances" element={<Relances />} />
              <Route path="/analytics" element={<Placeholder title="Analytics" icon={BarChart3} desc="Tableau de bord financier, marges par chantier, rentabilité et tendances." />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
