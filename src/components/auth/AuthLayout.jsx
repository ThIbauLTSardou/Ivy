import { Link } from 'react-router-dom'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'

export default function AuthLayout({ title, subtitle, children, footer }) {
  const { theme, toggle } = useTheme()

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '100vh', background: 'var(--background)', fontFamily: 'Inter, -apple-system, sans-serif' }}>

      {/* ── Panneau gauche — Branding ── */}
      <div style={{
        background: 'var(--surface-1)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '48px 56px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Glows décoratifs */}
        <div style={{ position: 'absolute', bottom: '-100px', left: '-100px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, var(--brand-muted) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, var(--brand-muted) 0%, transparent 65%)', pointerEvents: 'none' }} />

        {/* Logo */}
        <Link to="/landing" style={{ display: 'inline-flex', alignItems: 'baseline', textDecoration: 'none' }}>
          <span style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>ivy</span>
          <span style={{ fontSize: '22px', fontWeight: '700', color: 'var(--brand)' }}>.</span>
        </Link>

        {/* Accroche */}
        <div>
          <h2 style={{ fontSize: 'clamp(28px, 3vw, 42px)', fontWeight: '700', letterSpacing: '-2px', lineHeight: '1.1', color: 'var(--text-primary)', marginBottom: '16px' }}>
            Gérez votre activité.<br />
            <span style={{ color: 'var(--brand)' }}>Pas la paperasse.</span>
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.75', maxWidth: '340px' }}>
            L'outil de gestion conçu pour les artisans du bâtiment.
          </p>
        </div>

        {/* Version */}
        <p style={{ fontSize: '12px', color: 'var(--text-disabled)' }}>ivy · v1.0</p>
      </div>

      {/* ── Panneau droit — Formulaire ── */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 40px', position: 'relative' }}>

        {/* Toggle thème */}
        <button onClick={toggle} style={{ position: 'absolute', top: '24px', right: '24px', width: '36px', height: '36px', borderRadius: '8px', background: 'var(--surface-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)', transition: 'background 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-3)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-2)'}
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Logo mobile */}
        <div style={{ position: 'absolute', top: '28px', left: '32px' }}>
          <Link to="/landing" className="auth-mobile-logo" style={{ display: 'none', alignItems: 'baseline', textDecoration: 'none' }}>
            <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>ivy</span>
            <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--brand)' }}>.</span>
          </Link>
        </div>

        <div style={{ width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {(title || subtitle) && (
            <div>
              {title && <h1 style={{ fontSize: 'clamp(22px, 2.5vw, 28px)', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-1px', marginBottom: '6px' }}>{title}</h1>}
              {subtitle && <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{subtitle}</p>}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {children}
          </div>

          {footer && (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center' }}>
              {footer}
            </p>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input:focus {
          border-color: var(--brand) !important;
          box-shadow: 0 0 0 3px var(--brand-muted) !important;
          outline: none !important;
        }
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
          div[style*="border-right: 1px solid var(--border)"] { display: none !important; }
          .auth-mobile-logo { display: inline-flex !important; }
        }
      `}</style>
    </div>
  )
}
