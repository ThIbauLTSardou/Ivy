import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import {
  Building2, Globe, MapPin, Radius, Users, Briefcase,
  ArrowRight, ArrowLeft, Loader2, Sparkles, CheckCircle2
} from 'lucide-react'

const COMPANY_SIZES = [
  { value: 'auto_entrepreneur', label: 'Auto-entrepreneur', desc: '1 personne' },
  { value: 'micro_entreprise', label: 'Micro-entreprise', desc: '< 10 salariés' },
  { value: 'tpe', label: 'TPE', desc: '< 20 salariés' },
  { value: 'pme', label: 'PME', desc: '< 250 salariés' },
  { value: 'eti', label: 'ETI', desc: '< 5 000 salariés' },
  { value: 'grande_entreprise', label: 'Grande entreprise', desc: '5 000+ salariés' },
]

const RADIUS_OPTIONS = [
  { value: 10, label: '10 km' },
  { value: 25, label: '25 km' },
  { value: 50, label: '50 km' },
  { value: 100, label: '100 km' },
  { value: 200, label: '200 km' },
  { value: 500, label: 'National' },
]

const STEPS = [
  { id: 1, label: 'Votre entreprise' },
  { id: 2, label: 'Localisation' },
  { id: 3, label: 'Équipe' },
]

export default function Onboarding() {
  const { user, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [form, setForm] = useState({
    company_name: '',
    domain: '',
    location: '',
    work_radius_km: null,
    employee_count: '',
    company_size: null,
  })

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function canNext() {
    if (step === 1) return form.company_name.trim() && form.domain.trim()
    if (step === 2) return form.location.trim() && form.work_radius_km
    if (step === 3) return form.company_size
    return false
  }

  async function handleFinish() {
    setError(null)
    setLoading(true)
    const { error } = await supabase
      .from('profiles')
      .update({
        company_name: form.company_name.trim(),
        domain: form.domain.trim(),
        location: form.location.trim(),
        work_radius_km: form.work_radius_km,
        employee_count: form.employee_count ? parseInt(form.employee_count) : null,
        company_size: form.company_size,
        onboarding_completed: true,
      })
      .eq('id', user.id)
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    await refreshProfile()
    navigate('/')
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        {/* Header */}
        <div style={s.header}>
          <div style={s.logoRow}>
            <span style={s.logoText}>ivy</span>
            <span style={s.logoDot}>.</span>
          </div>
          <div style={s.badge}>
            <Sparkles size={12} />
            Configuration initiale
          </div>
        </div>

        <h1 style={s.title}>Personnalisez votre espace</h1>
        <p style={s.subtitle}>
          Ces informations permettent à Ivy d'adapter ses recommandations, ses devis automatiques
          et ses alertes à votre activité réelle.
        </p>

        {/* Info banner */}
        <div style={s.infoBanner}>
          <CheckCircle2 size={14} style={{ color: 'var(--brand)', flexShrink: 0, marginTop: '1px' }} />
          <span>
            Ces données sont <strong>indispensables</strong> pour que l'IA génère des devis adaptés
            à votre zone, votre taille et votre domaine d'activité.
          </span>
        </div>

        {/* Steps indicator */}
        <div style={s.stepsRow}>
          {STEPS.map((st, i) => (
            <div key={st.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                ...s.stepDot,
                background: step > st.id ? 'var(--brand)' : step === st.id ? 'var(--brand)' : 'var(--surface-3)',
                color: step >= st.id ? '#000' : 'var(--text-muted)',
              }}>
                {step > st.id ? <CheckCircle2 size={12} /> : st.id}
              </div>
              <span style={{
                fontSize: '12px',
                fontWeight: step === st.id ? '600' : '400',
                color: step === st.id ? 'var(--text-primary)' : 'var(--text-muted)',
              }}>{st.label}</span>
              {i < STEPS.length - 1 && (
                <div style={{
                  width: '32px', height: '1px',
                  background: step > st.id ? 'var(--brand)' : 'var(--border)',
                  margin: '0 4px',
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div style={s.stepContent}>
          {step === 1 && (
            <div style={s.fields}>
              <Field
                label="Nom de l'entreprise"
                icon={Building2}
                required
              >
                <input
                  placeholder="Ex : Bâtisseurs du Nord SARL"
                  value={form.company_name}
                  onChange={e => set('company_name', e.target.value)}
                  style={s.input}
                />
              </Field>
              <Field
                label="Domaine d'activité"
                icon={Globe}
                hint="Maçonnerie, électricité, plomberie, paysagisme..."
                required
              >
                <input
                  placeholder="Ex : Maçonnerie générale, rénovation"
                  value={form.domain}
                  onChange={e => set('domain', e.target.value)}
                  style={s.input}
                />
              </Field>
            </div>
          )}

          {step === 2 && (
            <div style={s.fields}>
              <Field
                label="Localisation principale"
                icon={MapPin}
                hint="Ville ou département où vous êtes basé"
                required
              >
                <input
                  placeholder="Ex : Lyon, 69"
                  value={form.location}
                  onChange={e => set('location', e.target.value)}
                  style={s.input}
                />
              </Field>
              <Field
                label="Rayon d'intervention"
                icon={Radius}
                hint="Zone géographique maximale dans laquelle vous travaillez"
                required
              >
                <div style={s.optionsGrid}>
                  {RADIUS_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => set('work_radius_km', opt.value)}
                      style={{
                        ...s.optionBtn,
                        ...(form.work_radius_km === opt.value ? s.optionBtnActive : {}),
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </Field>
            </div>
          )}

          {step === 3 && (
            <div style={s.fields}>
              <Field
                label="Taille de l'entreprise"
                icon={Briefcase}
                required
              >
                <div style={s.sizeGrid}>
                  {COMPANY_SIZES.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => set('company_size', opt.value)}
                      style={{
                        ...s.sizeBtn,
                        ...(form.company_size === opt.value ? s.sizeBtnActive : {}),
                      }}
                    >
                      <span style={{ fontWeight: '600', fontSize: '13px' }}>{opt.label}</span>
                      <span style={{ fontSize: '11px', color: form.company_size === opt.value ? '#00000088' : 'var(--text-muted)' }}>{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </Field>
              <Field
                label="Nombre d'employés"
                icon={Users}
                hint="Optionnel — permet d'affiner les suggestions"
              >
                <input
                  type="number"
                  min="1"
                  placeholder="Ex : 5"
                  value={form.employee_count}
                  onChange={e => set('employee_count', e.target.value)}
                  style={s.input}
                />
              </Field>
            </div>
          )}
        </div>

        {error && (
          <div style={s.errorBox}>{error}</div>
        )}

        {/* Navigation */}
        <div style={s.nav}>
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              style={s.btnSecondary}
            >
              <ArrowLeft size={15} /> Retour
            </button>
          ) : <div />}

          {step < 3 ? (
            <button
              type="button"
              disabled={!canNext()}
              onClick={() => setStep(step + 1)}
              style={{ ...s.btnPrimary, opacity: canNext() ? 1 : 0.4, cursor: canNext() ? 'pointer' : 'not-allowed' }}
            >
              Continuer <ArrowRight size={15} />
            </button>
          ) : (
            <button
              type="button"
              disabled={!canNext() || loading}
              onClick={handleFinish}
              style={{ ...s.btnPrimary, opacity: (canNext() && !loading) ? 1 : 0.4, cursor: (canNext() && !loading) ? 'pointer' : 'not-allowed' }}
            >
              {loading ? <Loader2 size={15} style={{ animation: 'spin 0.7s linear infinite' }} /> : <CheckCircle2 size={15} />}
              {loading ? 'Enregistrement...' : 'Lancer Ivy'}
            </button>
          )}
        </div>

        <p style={s.stepCounter}>{step} / {STEPS.length}</p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input:focus { outline: none; border-color: var(--brand) !important; box-shadow: 0 0 0 3px var(--brand-muted); }
      `}</style>
    </div>
  )
}

function Field({ label, icon: Icon, hint, required, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Icon size={13} style={{ color: 'var(--brand)' }} />
        <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>
          {label}
          {required && <span style={{ color: 'var(--brand)', marginLeft: '3px' }}>*</span>}
        </label>
      </div>
      {hint && <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '-2px' }}>{hint}</p>}
      {children}
    </div>
  )
}

const s = {
  page: {
    minHeight: '100vh',
    background: 'var(--background)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  },
  card: {
    background: 'var(--surface-1)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '40px',
    width: '100%',
    maxWidth: '520px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
  },
  logoRow: { display: 'flex', alignItems: 'baseline' },
  logoText: { fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.5px' },
  logoDot: { fontSize: '22px', fontWeight: '700', color: 'var(--brand)' },
  badge: {
    display: 'flex', alignItems: 'center', gap: '5px',
    background: 'var(--brand-muted)', color: 'var(--brand)',
    fontSize: '11px', fontWeight: '600',
    padding: '4px 8px', borderRadius: '20px',
    border: '1px solid #3ecf8e44',
  },
  title: {
    fontSize: '20px', fontWeight: '600',
    color: 'var(--text-primary)', marginBottom: '6px',
  },
  subtitle: {
    fontSize: '14px', color: 'var(--text-secondary)',
    lineHeight: '1.6', marginBottom: '16px',
  },
  infoBanner: {
    display: 'flex', gap: '10px', alignItems: 'flex-start',
    background: 'var(--brand-muted)',
    border: '1px solid #3ecf8e33',
    borderRadius: 'var(--radius-sm)',
    padding: '10px 14px',
    fontSize: '13px', color: 'var(--text-secondary)',
    marginBottom: '28px',
    lineHeight: '1.5',
  },
  stepsRow: {
    display: 'flex', alignItems: 'center', gap: '4px',
    marginBottom: '28px',
  },
  stepDot: {
    width: '22px', height: '22px',
    borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '11px', fontWeight: '700',
    flexShrink: 0,
  },
  stepContent: { minHeight: '200px' },
  fields: { display: 'flex', flexDirection: 'column', gap: '20px' },
  input: {
    width: '100%',
    background: 'var(--surface-2)',
    border: '1px solid var(--border-strong)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-primary)',
    fontSize: '14px',
    padding: '9px 12px',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  },
  optionsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px',
  },
  optionBtn: {
    padding: '8px', borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-strong)',
    background: 'var(--surface-2)',
    color: 'var(--text-secondary)',
    fontSize: '13px', fontWeight: '500',
    cursor: 'pointer', transition: 'all 0.15s',
  },
  optionBtnActive: {
    background: 'var(--brand)', color: '#000',
    borderColor: 'var(--brand)',
  },
  sizeGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px',
  },
  sizeBtn: {
    padding: '10px 12px', borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-strong)',
    background: 'var(--surface-2)',
    color: 'var(--text-primary)',
    display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px',
    cursor: 'pointer', transition: 'all 0.15s',
    textAlign: 'left',
  },
  sizeBtnActive: {
    background: 'var(--brand)', color: '#000',
    borderColor: 'var(--brand)',
  },
  errorBox: {
    marginTop: '16px',
    background: '#ef444422', border: '1px solid #ef444444',
    borderRadius: 'var(--radius-sm)', color: 'var(--error)',
    fontSize: '13px', padding: '10px 12px',
  },
  nav: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginTop: '32px',
  },
  btnPrimary: {
    display: 'flex', alignItems: 'center', gap: '6px',
    background: 'var(--brand)', color: '#000',
    fontWeight: '600', fontSize: '14px',
    border: 'none', borderRadius: 'var(--radius-sm)',
    padding: '9px 18px', transition: 'background 0.15s',
  },
  btnSecondary: {
    display: 'flex', alignItems: 'center', gap: '6px',
    background: 'transparent', color: 'var(--text-secondary)',
    fontWeight: '500', fontSize: '14px',
    border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-sm)',
    padding: '9px 14px', cursor: 'pointer', transition: 'all 0.15s',
  },
  stepCounter: {
    textAlign: 'center', fontSize: '12px',
    color: 'var(--text-muted)', marginTop: '16px',
  },
}
