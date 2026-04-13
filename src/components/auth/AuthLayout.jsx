import { Link } from 'react-router-dom'
import { CheckCircle2, FileText, Mic, TrendingUp, Star } from 'lucide-react'

const G = '#3ecf8e'

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '100vh', background: '#0a0a0a', fontFamily: 'Inter, -apple-system, sans-serif' }}>

      {/* ── Panneau gauche — Branding ── */}
      <div style={{
        background: '#0d0d0d',
        borderRight: '1px solid #1a1a1a',
        display: 'flex', flexDirection: 'column',
        padding: '48px 56px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Glow décoratif */}
        <div style={{ position: 'absolute', bottom: '-80px', left: '-80px', width: '400px', height: '400px', borderRadius: '50%', background: `radial-gradient(circle, ${G}0a 0%, transparent 65%)`, pointerEvents: 'none' }} />

        {/* Logo */}
        <Link to="/landing" style={{ display: 'inline-flex', alignItems: 'baseline', textDecoration: 'none', marginBottom: 'auto' }}>
          <span style={{ fontSize: '22px', fontWeight: '700', color: '#ededed', letterSpacing: '-0.5px' }}>ivy</span>
          <span style={{ fontSize: '22px', fontWeight: '700', color: G }}>.</span>
        </Link>

        {/* Accroche centrale */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '40px', padding: '48px 0' }}>
          <div>
            <p style={{ fontSize: '11px', color: G, fontWeight: '600', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '16px' }}>Pour les artisans du bâtiment</p>
            <h2 style={{ fontSize: 'clamp(24px, 2.5vw, 34px)', fontWeight: '700', letterSpacing: '-1.5px', lineHeight: '1.15', color: '#ededed', marginBottom: '14px' }}>
              Gérez votre activité.<br />
              <span style={{ color: G }}>Pas la paperasse.</span>
            </h2>
            <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.75' }}>
              Devis, clients, facturation et dictée vocale — tout ce dont vous avez besoin, rien de superflu.
            </p>
          </div>

          {/* Points clés */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { icon: FileText, text: 'Devis professionnels en 2 minutes' },
              { icon: Mic, text: 'Dictée vocale IA sur le chantier' },
              { icon: TrendingUp, text: 'Tableau de bord et suivi en temps réel' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${G}12`, border: `1px solid ${G}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={14} color={G} />
                </div>
                <span style={{ fontSize: '13px', color: '#888' }}>{text}</span>
              </div>
            ))}
          </div>

          {/* Témoignage */}
          <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '10px', padding: '20px 22px' }}>
            <div style={{ display: 'flex', gap: '3px', marginBottom: '10px' }}>
              {[...Array(5)].map((_, i) => <Star key={i} size={12} fill={G} color={G} />)}
            </div>
            <p style={{ fontSize: '13px', color: '#777', lineHeight: '1.7', marginBottom: '14px' }}>
              "Avant je passais deux heures sur chaque devis. Maintenant c'est dix minutes, et le résultat est bien plus professionnel."
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: `linear-gradient(135deg, ${G}44, #1a1a1a)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: G }}>T</div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#aaa' }}>Thomas G.</div>
                <div style={{ fontSize: '11px', color: '#444' }}>Électricien indépendant</div>
              </div>
            </div>
          </div>
        </div>

        {/* Badge bas */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={13} color={G} />
          <span style={{ fontSize: '12px', color: '#444' }}>Gratuit · Sans carte bancaire · Accès immédiat</span>
        </div>
      </div>

      {/* ── Panneau droit — Formulaire ── */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 40px', position: 'relative' }}>

        {/* Lien retour mobile (le logo gauche est caché) */}
        <div style={{ position: 'absolute', top: '28px', left: '32px' }}>
          <Link to="/landing" className="auth-mobile-logo" style={{ display: 'none', alignItems: 'baseline', textDecoration: 'none' }}>
            <span style={{ fontSize: '18px', fontWeight: '700', color: '#ededed', letterSpacing: '-0.5px' }}>ivy</span>
            <span style={{ fontSize: '18px', fontWeight: '700', color: G }}>.</span>
          </Link>
        </div>

        <div style={{ width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '28px' }}>

          {/* Titre */}
          {(title || subtitle) && (
            <div>
              {title && <h1 style={{ fontSize: 'clamp(22px, 2.5vw, 28px)', fontWeight: '700', color: '#ededed', letterSpacing: '-1px', marginBottom: '6px' }}>{title}</h1>}
              {subtitle && <p style={{ fontSize: '13px', color: '#555' }}>{subtitle}</p>}
            </div>
          )}

          {/* Slot formulaire */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <p style={{ fontSize: '13px', color: '#555', textAlign: 'center' }}>
              {footer}
            </p>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        input:focus {
          border-color: ${G} !important;
          box-shadow: 0 0 0 3px ${G}18 !important;
          outline: none !important;
        }

        @media (max-width: 768px) {
          /* Split → colonne unique, panneau gauche caché */
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
          div[style*="border-right: 1px solid"] {
            display: none !important;
          }
          .auth-mobile-logo {
            display: inline-flex !important;
          }
        }
      `}</style>
    </div>
  )
}
