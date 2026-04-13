import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Mail, Lock, Loader2, AlertCircle, ArrowRight, CheckCircle2, FileText, Mic, TrendingUp } from 'lucide-react'
import AuthLayout from '../components/auth/AuthLayout'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) {
      setError('Email ou mot de passe incorrect.')
    } else {
      navigate('/')
    }
  }

  return (
    <AuthLayout
      title="Bon retour."
      subtitle="Connectez-vous pour accéder à votre espace."
      footer={<>Pas encore de compte ? <Link to="/register" style={linkStyle}>Créer un compte</Link></>}
    >
      {error && <ErrorBox message={error} />}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Field label="Email">
          <InputWrap icon={<Mail size={15} />}>
            <input
              type="email"
              placeholder="vous@exemple.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={inputStyle}
            />
          </InputWrap>
        </Field>

        <Field label="Mot de passe">
          <InputWrap icon={<Lock size={15} />}>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={inputStyle}
            />
          </InputWrap>
        </Field>

        <button type="submit" disabled={loading} style={{ ...submitBtn, opacity: loading ? 0.75 : 1 }}>
          {loading
            ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
            : <>Se connecter <ArrowRight size={15} /></>
          }
        </button>
      </form>
    </AuthLayout>
  )
}

/* ── Petits composants partagés ─────────────────────────────────────────── */

export function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
      <label style={{ fontSize: '12px', fontWeight: '500', color: '#888', letterSpacing: '0.03em' }}>{label}</label>
      {children}
    </div>
  )
}

export function InputWrap({ icon, children }) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <span style={{ position: 'absolute', left: '13px', color: '#555', pointerEvents: 'none', display: 'flex' }}>{icon}</span>
      {children}
    </div>
  )
}

export function ErrorBox({ message }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '9px', background: '#ef444412', border: '1px solid #ef444430', borderRadius: '8px', color: '#ef4444', fontSize: '13px', padding: '11px 14px', marginBottom: '4px' }}>
      <AlertCircle size={14} style={{ flexShrink: 0 }} />
      {message}
    </div>
  )
}

export const inputStyle = {
  width: '100%',
  background: '#141414',
  border: '1px solid #2a2a2a',
  borderRadius: '8px',
  color: '#ededed',
  fontSize: '14px',
  padding: '11px 13px 11px 38px',
  outline: 'none',
  transition: 'border-color 0.15s, box-shadow 0.15s',
  fontFamily: 'inherit',
}

export const submitBtn = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
  background: '#3ecf8e', color: '#0a0a0a', fontWeight: '600', fontSize: '14px',
  border: 'none', borderRadius: '8px', padding: '12px', marginTop: '4px',
  cursor: 'pointer', transition: 'opacity 0.15s', fontFamily: 'inherit',
  width: '100%',
}

export const linkStyle = {
  color: '#3ecf8e', fontWeight: '500', textDecoration: 'none',
}
