import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Mail, Lock, Loader2, CheckCircle2, ArrowRight } from 'lucide-react'
import AuthLayout from '../components/auth/AuthLayout'
import { Field, InputWrap, ErrorBox, inputStyle, submitBtn, linkStyle } from './Login'

export default function Register() {
  const { signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas.'); return }
    if (password.length < 6) { setError('Le mot de passe doit contenir au moins 6 caractères.'); return }
    setLoading(true)
    const { error } = await signUp(email, password)
    setLoading(false)
    if (error) { setError(error.message) } else { setSuccess(true) }
  }

  if (success) {
    return (
      <AuthLayout title="" subtitle="">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '24px 0', textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#3ecf8e15', border: '1px solid #3ecf8e33', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={28} color="#3ecf8e" />
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#ededed', marginBottom: '8px', letterSpacing: '-0.5px' }}>Compte créé !</h2>
            <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.75' }}>
              Un email de confirmation a été envoyé à<br />
              <strong style={{ color: '#aaa' }}>{email}</strong>
            </p>
          </div>
          <Link to="/login" style={{ ...submitBtn, textDecoration: 'none', marginTop: '8px' }}>
            Aller à la connexion <ArrowRight size={15} />
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Créez votre compte."
      subtitle="Gratuit · Sans carte bancaire · Accès immédiat."
      footer={<>Déjà un compte ? <Link to="/login" style={linkStyle}>Se connecter</Link></>}
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
              placeholder="Minimum 6 caractères"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={inputStyle}
            />
          </InputWrap>
        </Field>

        <Field label="Confirmer le mot de passe">
          <InputWrap icon={<Lock size={15} />}>
            <input
              type="password"
              placeholder="••••••••"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              style={inputStyle}
            />
          </InputWrap>
        </Field>

        <button type="submit" disabled={loading} style={{ ...submitBtn, opacity: loading ? 0.75 : 1 }}>
          {loading
            ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
            : <>Créer mon compte <ArrowRight size={15} /></>
          }
        </button>

        <p style={{ fontSize: '11px', color: '#444', textAlign: 'center', lineHeight: '1.6' }}>
          En créant un compte, vous acceptez nos{' '}
          <Link to="/landing" style={{ color: '#555', textDecoration: 'underline' }}>conditions d'utilisation</Link>
          {' '}et notre{' '}
          <Link to="/landing" style={{ color: '#555', textDecoration: 'underline' }}>politique de confidentialité</Link>.
        </p>
      </form>
    </AuthLayout>
  )
}
