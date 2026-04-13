import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  FileText, Users, Mic, Zap, ArrowRight, Star,
  TrendingUp, Clock, Shield, CheckCircle2, ChevronDown,
  BarChart3, BookOpen, Send, Package, Building2, HardHat, Briefcase,
  Play,
} from 'lucide-react'

const G = '#3ecf8e'
const G2 = '#3ecf8e22'
const G3 = '#3ecf8e44'

export default function Landing() {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to="/" replace />

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#ededed', fontFamily: 'Inter, -apple-system, sans-serif' }}>

      {/* ─────────────────────────────────────────────
          NAV
      ───────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 48px', height: '64px',
        background: 'rgba(10,10,10,0.8)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid #1a1a1a',
      }}>
        <Logo size={22} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <a href="#features" style={navLink}>Fonctionnalités</a>
          <a href="#pricing" style={navLink}>Tarifs</a>
          <a href="#faq" style={navLink}>FAQ</a>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Link to="/login" style={navLink}>Se connecter</Link>
          <Link to="/register" style={primaryBtn}>Commencer gratuitement →</Link>
        </div>
      </nav>

      {/* ─────────────────────────────────────────────
          1. HERO
      ───────────────────────────────────────────── */}
      <section style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '120px 24px 80px', textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Glow */}
        <div style={{ position: 'absolute', top: '35%', left: '50%', transform: 'translate(-50%,-50%)', width: '800px', height: '500px', background: `radial-gradient(ellipse, ${G}0d 0%, transparent 65%)`, pointerEvents: 'none' }} />

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: G2, border: `1px solid ${G3}`, borderRadius: '20px', padding: '5px 14px', marginBottom: '28px', fontSize: '12px', color: G, fontWeight: '500', letterSpacing: '0.02em' }}>
          <Zap size={11} fill={G} /> Conçu pour les artisans du bâtiment
        </div>

        <h1 style={{ fontSize: 'clamp(40px, 6.5vw, 78px)', fontWeight: '700', lineHeight: '1.05', letterSpacing: '-3px', marginBottom: '22px', maxWidth: '820px' }}>
          Vos devis professionnels,{' '}
          <span style={{ color: G }}>générés en 2 minutes.</span>
        </h1>

        <p style={{ fontSize: 'clamp(15px, 1.8vw, 18px)', color: '#888', maxWidth: '500px', lineHeight: '1.75', marginBottom: '44px' }}>
          ivy est l'outil de gestion conçu pour les artisans — devis, facturation, clients et bibliothèque de prestations. Tout ce dont vous avez besoin, rien de superflu.
        </p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '20px' }}>
          <Link to="/register" style={{ ...primaryBtn, fontSize: '15px', padding: '14px 30px' }}>
            Commencer gratuitement
            <ArrowRight size={16} style={{ marginLeft: '8px' }} />
          </Link>
          <a href="#features" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', color: '#ededed', fontWeight: '500', fontSize: '15px', padding: '14px 24px', borderRadius: '8px', border: '1px solid #2a2a2a', textDecoration: 'none' }}>
            <Play size={14} fill="#ededed" />
            Voir la démo
          </a>
        </div>
        <p style={{ fontSize: '12px', color: '#444' }}>Gratuit · Sans carte bancaire · Accès immédiat</p>

        {/* Dashboard mockup */}
        <div style={{ marginTop: '72px', width: '100%', maxWidth: '900px', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: '-1px', borderRadius: '14px', background: `linear-gradient(180deg, ${G}33 0%, transparent 60%)`, zIndex: 0 }} />
          <div style={{ position: 'relative', zIndex: 1, background: '#111', border: '1px solid #222', borderRadius: '12px', overflow: 'hidden' }}>
            {/* Barre de fenêtre */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '12px 16px', borderBottom: '1px solid #1e1e1e', background: '#0d0d0d' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#333' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#333' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#333' }} />
              <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                <div style={{ background: '#1a1a1a', borderRadius: '5px', padding: '3px 14px', fontSize: '11px', color: '#555' }}>app.ivy.fr</div>
              </div>
            </div>
            {/* Contenu mockup */}
            <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', minHeight: '380px' }}>
              {/* Sidebar */}
              <div style={{ background: '#0d0d0d', borderRight: '1px solid #1e1e1e', padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ padding: '8px 10px', marginBottom: '8px' }}><Logo size={16} /></div>
                {[['Dashboard', true], ['Devis', false], ['Clients', false], ['Bibliothèque', false]].map(([label, active]) => (
                  <div key={label} style={{ padding: '8px 10px', borderRadius: '6px', fontSize: '12px', background: active ? G2 : 'transparent', color: active ? G : '#555', fontWeight: active ? '500' : '400' }}>{label}</div>
                ))}
              </div>
              {/* Main */}
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px' }}>
                  {[['CA du mois', '12 840 €', '+18%'], ['Devis en attente', '7', '3 urgents'], ['Taux d\'acceptation', '74%', '+6pts']].map(([label, val, sub]) => (
                    <div key={label} style={{ background: '#161616', border: '1px solid #222', borderRadius: '8px', padding: '14px' }}>
                      <div style={{ fontSize: '10px', color: '#555', marginBottom: '6px' }}>{label}</div>
                      <div style={{ fontSize: '20px', fontWeight: '700', color: '#ededed', letterSpacing: '-0.5px' }}>{val}</div>
                      <div style={{ fontSize: '10px', color: G, marginTop: '2px' }}>{sub}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: '#161616', border: '1px solid #222', borderRadius: '8px', padding: '14px', flex: 1 }}>
                  <div style={{ fontSize: '11px', color: '#555', marginBottom: '10px' }}>Devis récents</div>
                  {[['DEV-042', 'M. Dupont', 'Rénovation salle de bain', '3 200 €', 'Accepté'], ['DEV-041', 'Mme Martin', 'Pose carrelage', '1 840 €', 'En attente'], ['DEV-040', 'SCI Belmont', 'Gros œuvre', '18 600 €', 'Brouillon']].map(([ref, client, obj, mt, st]) => (
                    <div key={ref} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid #1a1a1a', fontSize: '11px' }}>
                      <span style={{ color: '#444', width: '52px' }}>{ref}</span>
                      <span style={{ color: '#888', flex: 1 }}>{client}</span>
                      <span style={{ color: '#666', flex: 2 }}>{obj}</span>
                      <span style={{ color: '#ededed', fontWeight: '600' }}>{mt}</span>
                      <span style={{ background: st === 'Accepté' ? G2 : st === 'En attente' ? '#f59e0b22' : '#2a2a2a', color: st === 'Accepté' ? G : st === 'En attente' ? '#f59e0b' : '#666', padding: '2px 8px', borderRadius: '4px', fontSize: '10px' }}>{st}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          2. VALUE PROPS
      ───────────────────────────────────────────── */}
      <section style={{ padding: '100px 24px', borderTop: '1px solid #161616' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <p style={{ fontSize: '12px', color: G, fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '14px' }}>Pourquoi ivy ?</p>
            <h2 style={h2}>Arrêtez de perdre du temps<br />sur la paperasse.</h2>
            <p style={sub}>Vous êtes artisan, pas comptable. ivy s'occupe de l'administratif pour que vous vous concentriez sur votre métier.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1px', background: '#1a1a1a', border: '1px solid #1a1a1a', borderRadius: '12px', overflow: 'hidden' }}>
            {valueProps.map((v, i) => (
              <div key={i} style={{ background: '#0d0d0d', padding: '36px 28px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: G2, border: `1px solid ${G3}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <v.icon size={20} color={G} />
                </div>
                <div style={{ fontSize: '17px', fontWeight: '600', color: '#ededed', letterSpacing: '-0.3px' }}>{v.title}</div>
                <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.75' }}>{v.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          3. FONCTIONNALITÉS — alternance texte/visuel
      ───────────────────────────────────────────── */}
      <section id="features" style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: '1040px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '120px' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: G, fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '14px' }}>Fonctionnalités</p>
            <h2 style={h2}>Du terrain à la facture,<br />tout est connecté.</h2>
          </div>

          {productFeatures.map((f, i) => (
            <FeatureSplit key={i} feature={f} reverse={i % 2 === 1} />
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          4. CAS D'USAGE / PERSONAS
      ───────────────────────────────────────────── */}
      <section style={{ padding: '100px 24px', borderTop: '1px solid #161616' }}>
        <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <p style={{ fontSize: '12px', color: G, fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '14px' }}>Pour qui ?</p>
            <h2 style={h2}>Fait pour tous les artisans.</h2>
            <p style={sub}>Que vous soyez seul ou en équipe, ivy s'adapte à votre activité.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {personas.map((p, i) => (
              <div key={i} style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: '16px', transition: 'border-color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = G3}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#1e1e1e'}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <p.icon size={22} color="#555" />
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#ededed', marginBottom: '8px' }}>{p.title}</div>
                  <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.7' }}>{p.desc}</div>
                </div>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: 0, listStyle: 'none' }}>
                  {p.points.map((pt, j) => (
                    <li key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: '#777' }}>
                      <CheckCircle2 size={13} color={G} style={{ flexShrink: 0, marginTop: '1px' }} />
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          5. SOCIAL PROOF
      ───────────────────────────────────────────── */}
      <section style={{ padding: '100px 24px', borderTop: '1px solid #161616', background: '#080808' }}>
        <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
          {/* Chiffres */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2px', marginBottom: '80px', background: '#1a1a1a', border: '1px solid #1a1a1a', borderRadius: '12px', overflow: 'hidden' }}>
            {stats.map((s, i) => (
              <div key={i} style={{ background: '#0d0d0d', padding: '36px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: '700', color: G, letterSpacing: '-2px', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: '12px', color: '#555', marginTop: '8px' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Témoignages */}
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={h2}>Ils ont gagné du temps.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {testimonials.map((t, i) => (
              <div key={i} style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '3px' }}>
                  {[...Array(5)].map((_, j) => <Star key={j} size={13} fill={G} color={G} />)}
                </div>
                <p style={{ fontSize: '14px', color: '#bbb', lineHeight: '1.75', flex: 1 }}>"{t.quote}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '12px', borderTop: '1px solid #1e1e1e' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: `linear-gradient(135deg, ${G}44, #1a1a1a)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: G }}>{t.name[0]}</div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#ededed' }}>{t.name}</div>
                    <div style={{ fontSize: '11px', color: '#555' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          6. PRICING
      ───────────────────────────────────────────── */}
      <section id="pricing" style={{ padding: '100px 24px', borderTop: '1px solid #161616' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <p style={{ fontSize: '12px', color: G, fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '14px' }}>Tarifs</p>
            <h2 style={h2}>Simple et transparent.</h2>
            <p style={sub}>Commencez gratuitement. Passez à la version complète quand vous êtes prêt.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <PricingCard
              plan="Gratuit"
              price="0 €"
              period="/mois"
              desc="Pour découvrir ivy et gérer vos premiers devis."
              features={['Jusqu\'à 5 devis/mois', 'Gestion clients (10 max)', 'Bibliothèque de prestations', 'Export PDF']}
              cta="Commencer gratuitement"
              ctaLink="/register"
              featured={false}
            />
            <PricingCard
              plan="Pro"
              price="29 €"
              period="/mois"
              desc="Pour les artisans actifs qui veulent aller vite."
              features={['Devis illimités', 'Clients illimités', 'Dictée vocale IA', 'Relances automatiques', 'Analytics & rapports', 'Support prioritaire']}
              cta="Démarrer l'essai gratuit"
              ctaLink="/register"
              featured={true}
            />
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          7. FAQ
      ───────────────────────────────────────────── */}
      <section id="faq" style={{ padding: '100px 24px', borderTop: '1px solid #161616', background: '#080808' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <p style={{ fontSize: '12px', color: G, fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '14px' }}>FAQ</p>
            <h2 style={h2}>Questions fréquentes.</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {faq.map((item, i) => (
              <FaqItem key={i} {...item} />
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          8. CTA FINAL
      ───────────────────────────────────────────── */}
      <section style={{ padding: '120px 24px', borderTop: '1px solid #161616', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '600px', height: '300px', background: `radial-gradient(ellipse, ${G}0d 0%, transparent 70%)`, pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: '620px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: '700', letterSpacing: '-2px', lineHeight: '1.1', marginBottom: '20px' }}>
            Prêt à gagner<br />
            <span style={{ color: G }}>2 heures par semaine ?</span>
          </h2>
          <p style={{ fontSize: '16px', color: '#666', marginBottom: '40px', lineHeight: '1.7' }}>
            Rejoignez les artisans qui ont déjà simplifié leur gestion avec ivy.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={{ ...primaryBtn, fontSize: '16px', padding: '15px 36px' }}>
              Créer mon compte gratuitement
              <ArrowRight size={17} style={{ marginLeft: '8px' }} />
            </Link>
          </div>
          <p style={{ marginTop: '16px', fontSize: '12px', color: '#444' }}>Aucune carte bancaire requise · Annulation à tout moment</p>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          9. FOOTER
      ───────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid #161616', padding: '48px 24px' }}>
        <div style={{ maxWidth: '1040px', margin: '0 auto', display: 'grid', gridTemplateColumns: '200px 1fr 1fr 1fr', gap: '40px' }}>
          <div>
            <Logo size={20} />
            <p style={{ fontSize: '12px', color: '#444', marginTop: '12px', lineHeight: '1.7' }}>L'outil de gestion conçu pour les artisans du bâtiment.</p>
          </div>
          <FooterCol title="Produit" links={[['Fonctionnalités', '#features'], ['Tarifs', '#pricing'], ['Démo', '/register']]} />
          <FooterCol title="Compte" links={[['Se connecter', '/login'], ['Créer un compte', '/register'], ['Mot de passe oublié', '/login']]} />
          <FooterCol title="Légal" links={[['Mentions légales', '/login'], ['Politique de confidentialité', '/login'], ['CGU', '/login']]} />
        </div>
        <div style={{ maxWidth: '1040px', margin: '40px auto 0', paddingTop: '24px', borderTop: '1px solid #161616', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <p style={{ fontSize: '12px', color: '#333' }}>© 2025 ivy. Tous droits réservés.</p>
          <p style={{ fontSize: '12px', color: '#333' }}>Fait avec soin pour les artisans 🛠️</p>
        </div>
      </footer>

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @media (max-width: 768px) {
          .landing-split { grid-template-columns: 1fr !important; }
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
          nav > div:nth-child(2) { display: none !important; }
        }
        @media (max-width: 500px) {
          nav { padding: 0 20px !important; }
        }
      `}</style>
    </div>
  )
}

/* ── Composants ─────────────────────────────────────────────────────────── */

function Logo({ size = 20 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', textDecoration: 'none' }}>
      <span style={{ fontSize: size, fontWeight: '700', color: '#ededed', letterSpacing: '-0.5px' }}>ivy</span>
      <span style={{ fontSize: size, fontWeight: '700', color: G }}>.</span>
    </div>
  )
}

function FeatureSplit({ feature: f, reverse }) {
  return (
    <div className="landing-split" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'center', direction: reverse ? 'rtl' : 'ltr' }}>
      <div style={{ direction: 'ltr' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: G2, border: `1px solid ${G3}`, borderRadius: '20px', padding: '4px 12px', marginBottom: '20px', fontSize: '11px', color: G, fontWeight: '500' }}>
          <f.icon size={11} /> {f.tag}
        </div>
        <h3 style={{ fontSize: 'clamp(22px, 2.5vw, 30px)', fontWeight: '700', letterSpacing: '-1px', color: '#ededed', marginBottom: '16px', lineHeight: '1.2' }}>{f.title}</h3>
        <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.8', marginBottom: '24px' }}>{f.desc}</p>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', listStyle: 'none', padding: 0 }}>
          {f.points.map((pt, i) => (
            <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', color: '#999' }}>
              <CheckCircle2 size={15} color={G} style={{ flexShrink: 0, marginTop: '1px' }} />
              {pt}
            </li>
          ))}
        </ul>
      </div>
      <div style={{ direction: 'ltr' }}>
        <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '24px', minHeight: '240px', display: 'flex', flexDirection: 'column', gap: '10px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${G}88, transparent)` }} />
          <div style={{ fontSize: '11px', color: '#444', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{f.mockupTitle}</div>
          {f.mockup}
        </div>
      </div>
    </div>
  )
}

function PricingCard({ plan, price, period, desc, features, cta, ctaLink, featured }) {
  return (
    <div style={{ background: featured ? '#111' : '#0d0d0d', border: `1px solid ${featured ? G3 : '#1e1e1e'}`, borderRadius: '12px', padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', overflow: 'hidden' }}>
      {featured && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${G}, transparent)` }} />}
      {featured && <div style={{ position: 'absolute', top: '14px', right: '16px', background: G2, border: `1px solid ${G3}`, borderRadius: '20px', padding: '2px 10px', fontSize: '10px', color: G, fontWeight: '600' }}>Recommandé</div>}
      <div>
        <div style={{ fontSize: '13px', fontWeight: '600', color: featured ? G : '#666', marginBottom: '12px' }}>{plan}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
          <span style={{ fontSize: '40px', fontWeight: '700', color: '#ededed', letterSpacing: '-2px' }}>{price}</span>
          <span style={{ fontSize: '13px', color: '#555' }}>{period}</span>
        </div>
        <p style={{ fontSize: '13px', color: '#555', marginTop: '8px' }}>{desc}</p>
      </div>
      <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', listStyle: 'none', padding: 0, flex: 1 }}>
        {features.map((f, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '9px', fontSize: '13px', color: '#888' }}>
            <CheckCircle2 size={14} color={G} />
            {f}
          </li>
        ))}
      </ul>
      <Link to={ctaLink} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: featured ? G : 'transparent', color: featured ? '#0a0a0a' : '#ededed', fontWeight: '600', fontSize: '13px', padding: '12px', borderRadius: '7px', border: featured ? 'none' : '1px solid #2a2a2a', textDecoration: 'none', transition: 'opacity 0.15s' }}>
        {cta}
      </Link>
    </div>
  )
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '8px', overflow: 'hidden' }}>
      <button onClick={() => setOpen(v => !v)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', background: 'none', border: 'none', color: '#ededed', fontSize: '14px', fontWeight: '500', cursor: 'pointer', textAlign: 'left', gap: '12px' }}>
        {q}
        <ChevronDown size={16} color="#555" style={{ flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>
      {open && <div style={{ padding: '0 20px 18px', fontSize: '13px', color: '#777', lineHeight: '1.75', borderTop: '1px solid #1a1a1a', paddingTop: '16px' }}>{a}</div>}
    </div>
  )
}

function FooterCol({ title, links }) {
  return (
    <div>
      <div style={{ fontSize: '12px', fontWeight: '600', color: '#ededed', marginBottom: '16px', letterSpacing: '0.05em' }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {links.map(([label, href], i) => (
          <Link key={i} to={href} style={{ fontSize: '13px', color: '#555', textDecoration: 'none', transition: 'color 0.15s' }}
            onMouseEnter={e => e.target.style.color = '#999'}
            onMouseLeave={e => e.target.style.color = '#555'}
          >{label}</Link>
        ))}
      </div>
    </div>
  )
}

/* ── Styles partagés ──────────────────────────────────────────────────────── */

const h2 = { fontSize: 'clamp(26px, 3.5vw, 42px)', fontWeight: '700', letterSpacing: '-1.5px', marginBottom: '16px', lineHeight: '1.1' }
const sub = { fontSize: '15px', color: '#666', maxWidth: '460px', margin: '0 auto', lineHeight: '1.75' }
const navLink = { color: '#888', fontSize: '13px', fontWeight: '500', textDecoration: 'none', transition: 'color 0.15s' }
const primaryBtn = { display: 'inline-flex', alignItems: 'center', background: G, color: '#0a0a0a', fontWeight: '600', fontSize: '13px', padding: '10px 20px', borderRadius: '7px', textDecoration: 'none', transition: 'opacity 0.15s', border: 'none', cursor: 'pointer' }

/* ── Data ─────────────────────────────────────────────────────────────────── */

const valueProps = [
  { icon: Clock, title: 'Devis en 2 minutes', desc: 'Fini les heures passées sur Word ou Excel. Générez un devis professionnel, chiffré et mis en page, en quelques clics.' },
  { icon: Mic, title: 'Dictée vocale IA', desc: 'Sur le chantier, dictez vos prestations à la voix. ivy transcrit, structure et construit le devis pour vous.' },
  { icon: TrendingUp, title: 'Suivi commercial', desc: 'Tableau de bord en temps réel : CA du mois, devis en attente, taux d\'acceptation et relances automatiques.' },
  { icon: BookOpen, title: 'Bibliothèque de prestations', desc: 'Enregistrez vos tarifs une fois, réutilisez-les en un clic. Vos groupes de prestations toujours disponibles.' },
]

const productFeatures = [
  {
    icon: FileText,
    tag: 'Devis & Facturation',
    title: 'Des devis qui donnent envie de signer.',
    desc: 'Créez des devis structurés avec groupes de prestations, TVA par ligne, remises et acompte. Choisissez parmi plusieurs modèles visuels.',
    points: ['Groupes de prestations avec sous-totaux', 'Modèles personnalisables (couleur, logo)', 'Export PDF haute qualité', 'Envoi par email en un clic'],
    mockupTitle: 'Aperçu devis',
    mockup: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ background: '#1a1a1a', borderRadius: '6px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><div style={{ fontSize: '10px', color: '#555', marginBottom: '2px' }}>GROUPE — Gros œuvre</div><div style={{ fontSize: '12px', color: '#888' }}>3 prestations</div></div>
          <div style={{ fontSize: '13px', fontWeight: '700', color: G }}>8 400 €</div>
        </div>
        {[['Maçonnerie', '1 200 €'], ['Terrassement', '3 600 €'], ['Coffrage', '3 600 €']].map(([l, v]) => (
          <div key={l} style={{ paddingLeft: '12px', borderLeft: `2px solid ${G}44`, display: 'flex', justifyContent: 'space-between', padding: '7px 10px 7px 14px', fontSize: '12px' }}>
            <span style={{ color: '#777' }}>{l}</span><span style={{ color: '#aaa', fontWeight: '600' }}>{v}</span>
          </div>
        ))}
        <div style={{ marginTop: '4px', display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: G2, borderRadius: '6px' }}>
          <span style={{ fontSize: '12px', fontWeight: '600', color: G }}>Total HT</span>
          <span style={{ fontSize: '14px', fontWeight: '700', color: G }}>12 640 €</span>
        </div>
      </div>
    ),
  },
  {
    icon: Mic,
    tag: 'Dictée vocale',
    title: 'Créez un devis en parlant.',
    desc: 'Sur le chantier, les mains dans la masse, ouvrez ivy et dictez vos prestations. L\'IA structure tout automatiquement.',
    points: ['Transcription en temps réel (Whisper AI)', 'Détection des groupes, quantités, prix', 'Import depuis votre bibliothèque à la voix', 'Fonctionne hors connexion (mode offline bientôt)'],
    mockupTitle: 'Transcription en cours',
    mockup: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: '#1a1a1a', borderRadius: '8px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: G2, border: `1px solid ${G3}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Mic size={14} color={G} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '11px', color: '#555', marginBottom: '4px' }}>Transcription</div>
            <div style={{ fontSize: '12px', color: '#aaa', fontStyle: 'italic' }}>"Pose de carrelage 80m² à 35 euros du mètre..."</div>
          </div>
        </div>
        {[['Pose de carrelage', '80 m²', '2 800 €'], ['Fourniture carrelage', '80 m²', '1 440 €'], ['Joint et colle', '1 forfait', '180 €']].map(([l, q, v]) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: '#161616', borderRadius: '6px', fontSize: '12px' }}>
            <CheckCircle2 size={13} color={G} />
            <span style={{ color: '#888', flex: 1 }}>{l}</span>
            <span style={{ color: '#555' }}>{q}</span>
            <span style={{ color: '#aaa', fontWeight: '600' }}>{v}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: Users,
    tag: 'Gestion clients',
    title: 'Votre carnet d\'adresses, enfin intelligent.',
    desc: 'Centralisez tous vos clients, leur historique de devis, leur chiffre d\'affaires et les relances en cours. Tout au même endroit.',
    points: ['Fiche client complète avec historique', 'Montant total et nombre de devis', 'Relances automatiques pour les impayés', 'Import depuis vos contacts'],
    mockupTitle: 'Fiche client',
    mockup: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#1a1a1a', borderRadius: '8px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: `linear-gradient(135deg, ${G}44, #1a1a1a)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '700', color: G, flexShrink: 0 }}>D</div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#ededed' }}>M. Dupont</div>
            <div style={{ fontSize: '11px', color: '#555' }}>dupont@mail.fr · 06 12 34 56 78</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          {[['CA total', '42 800 €'], ['Devis', '8'], ['Acceptés', '6'], ['En attente', '2']].map(([l, v]) => (
            <div key={l} style={{ background: '#161616', borderRadius: '6px', padding: '10px 12px' }}>
              <div style={{ fontSize: '10px', color: '#555', marginBottom: '3px' }}>{l}</div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#ededed' }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
]

const personas = [
  {
    icon: HardHat,
    title: 'Artisan indépendant',
    desc: 'Vous êtes seul et chaque heure compte. ivy vous fait gagner 2 à 3h par semaine sur l\'administratif.',
    points: ['Devis rapides entre deux chantiers', 'Dictée vocale sur le terrain', 'Relances automatiques'],
  },
  {
    icon: Building2,
    title: 'PME du bâtiment',
    desc: 'Une équipe, plusieurs chantiers simultanés. ivy vous aide à garder le fil sur tous les projets.',
    points: ['Tableau de bord multi-chantiers', 'Bibliothèque partagée de prestations', 'Suivi des devis par commercial'],
  },
  {
    icon: Briefcase,
    title: 'Rénovation tous corps d\'état',
    desc: 'Plomberie, électricité, maçonnerie — vous intervenez sur tout. ivy adapte vos devis à chaque métier.',
    points: ['Groupes de prestations par lot', 'TVA par prestation (5.5%, 10%, 20%)', 'Sous-totaux par lot de travaux'],
  },
]

const stats = [
  { value: '2 min', label: 'pour générer un devis complet' },
  { value: '3h', label: 'économisées par semaine en moyenne' },
  { value: '100%', label: 'conforme aux obligations légales' },
  { value: '0 €', label: 'pour commencer aujourd\'hui' },
]

const testimonials = [
  { quote: 'Avant je passais deux heures sur chaque devis sur Word. Maintenant c\'est dix minutes, et le résultat est bien plus pro.', name: 'Thomas G.', role: 'Électricien indépendant' },
  { quote: 'La dictée vocale c\'est dingue. Je parle sur le chantier et le devis est prêt quand je rentre. Mes clients sont bluffés.', name: 'Karim B.', role: 'Plombier-chauffagiste' },
  { quote: 'J\'avais peur que ce soit compliqué. En fait j\'ai créé mon premier devis en moins de cinq minutes le jour de mon inscription.', name: 'Sophie M.', role: 'Peintre en bâtiment' },
]

const faq = [
  { q: 'Est-ce que mes devis sont conformes légalement ?', a: 'Oui. ivy génère des devis conformes aux obligations légales françaises : mentions obligatoires, TVA applicable, numérotation, durée de validité. Vous êtes toujours en règle.' },
  { q: 'Comment fonctionne la dictée vocale ?', a: 'Appuyez sur le micro, dictez vos prestations naturellement ("pose de carrelage 80 mètres carrés à 35 euros du mètre"). ivy utilise l\'IA pour transcrire, structurer et créer les lignes de devis automatiquement.' },
  { q: 'Puis-je importer mes prestations existantes ?', a: 'Oui, vous pouvez créer votre bibliothèque de prestations dans ivy et les réutiliser en un clic sur chaque nouveau devis. Vous pouvez aussi les regrouper par lots (maçonnerie, finitions, etc.).' },
  { q: 'Mes données sont-elles sécurisées ?', a: 'Vos données sont hébergées en Europe, chiffrées en transit et au repos. Elles ne sont jamais partagées ou vendues. Vous restez propriétaire de vos données à tout moment.' },
  { q: 'Peut-on essayer avant de payer ?', a: 'Absolument. Le plan gratuit est sans limite de durée. Vous pouvez créer jusqu\'à 5 devis par mois sans carte bancaire. L\'upgrade vers Pro se fait en un clic quand vous êtes prêt.' },
]
