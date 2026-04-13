import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import Button from '../components/ui/Button'

const COULEURS = ['#18a96b', '#2563eb', '#dc2626', '#7c3aed', '#ea580c', '#0891b2', '#111111']

const MODELES = [
  { id: 'classique', label: 'Classique', desc: 'En-tête avec ligne de séparation colorée' },
  { id: 'moderne',   label: 'Moderne',   desc: 'Bandeau de couleur plein en haut de page' },
  { id: 'epure',     label: 'Épuré',     desc: 'Accent discret sur la bordure gauche' },
]

// ─── Données de vitrine ───────────────────────────────────────────────────────

const VITRINE_PROFILE = {
  company_name: 'BTP Dupont & Fils',
  forme_juridique: 'SARL',
  adresse: '12 rue des Artisans',
  code_postal: '75011',
  ville: 'Paris',
  telephone: '01 23 45 67 89',
  email_pro: 'contact@btpdupont.fr',
  siret: '123 456 789 00012',
}

const VITRINE_FORM = {
  date_emission: '2026-04-11',
  date_validite: '2026-05-11',
  objet: 'Rénovation salle de bain',
  client_nom: 'M. et Mme Martin',
  client_adresse: '8 avenue des Fleurs, 75006 Paris',
  lieu_travaux: '8 avenue des Fleurs, Paris',
  delai_realisation: '3 semaines',
  tva_taux: 10,
  remise_pct: 0,
  acompte_pct: 30,
  conditions_paiement: '30% à la commande, solde à réception des travaux.',
}

const VITRINE_LIGNES = [
  { _id: '1', type: 'titre',  designation: 'Démolition & préparation' },
  { _id: '2', type: 'ligne',  designation: 'Dépose carrelage existant', unite: 'm²', quantite: 12, prix_unitaire_ht: 25, remise_pct: 0, tva_taux: 10 },
  { _id: '3', type: 'ligne',  designation: 'Évacuation gravats', unite: 'forfait', quantite: 1, prix_unitaire_ht: 180, remise_pct: 0, tva_taux: 10 },
  { _id: '4', type: 'titre',  designation: 'Carrelage & faïence' },
  { _id: '5', type: 'ligne',  designation: 'Fourniture et pose carrelage sol', description: 'Format 60×60, grès cérame', unite: 'm²', quantite: 12, prix_unitaire_ht: 65, remise_pct: 0, tva_taux: 10 },
  { _id: '6', type: 'ligne',  designation: 'Fourniture et pose faïence murale', unite: 'm²', quantite: 18, prix_unitaire_ht: 55, remise_pct: 0, tva_taux: 10 },
  { _id: '7', type: 'titre',  designation: 'Plomberie' },
  { _id: '8', type: 'ligne',  designation: 'Remplacement robinetterie', unite: 'u', quantite: 2, prix_unitaire_ht: 220, remise_pct: 0, tva_taux: 10 },
]

// ─── Utilitaires ──────────────────────────────────────────────────────────────

function fmt(n) {
  return Number(n).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fmtDate(d) {
  if (!d) return '—'
  const [y, m, j] = d.split('-')
  return `${j}/${m}/${y}`
}

function calcTotaux(lignes, form) {
  const ht = lignes.filter(l => l.type === 'ligne').reduce((s, l) => {
    const q = parseFloat(l.quantite) || 0
    const p = parseFloat(l.prix_unitaire_ht) || 0
    const r = parseFloat(l.remise_pct) || 0
    return s + q * p * (1 - r / 100)
  }, 0)
  const remise_pct = parseFloat(form.remise_pct) || 0
  const remise_globale = ht * remise_pct / 100
  const ht_apres_remise = ht - remise_globale
  const tva_taux = parseFloat(form.tva_taux) || 0
  const tva = ht_apres_remise * tva_taux / 100
  const ttc = ht_apres_remise + tva
  const acompte_pct = parseFloat(form.acompte_pct) || 0
  const acompte = ttc * acompte_pct / 100
  return { ht, remise_globale, ht_apres_remise, tva, ttc, acompte }
}

// ─── Preview (version vitrine) ────────────────────────────────────────────────

function TotalLine({ label, value, bold, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '12px', color: color ?? '#555' }}>
      <span style={{ fontWeight: bold ? '700' : '400', color: bold ? '#111' : undefined }}>{label}</span>
      <span style={{ fontWeight: bold ? '700' : '500', color: bold ? '#111' : undefined }}>{value}</span>
    </div>
  )
}

function DevisPreviewVitrine({ theme }) {
  const form = VITRINE_FORM
  const profile = VITRINE_PROFILE
  const lignes = VITRINE_LIGNES
  const totaux = calcTotaux(lignes, form)
  const { ht, remise_globale, ht_apres_remise, tva, ttc, acompte } = totaux
  const c = theme.color
  const modele = theme.modele
  const isModerne = modele === 'moderne'
  const isEpure   = modele === 'epure'

  const headerStyle = isModerne
    ? { background: c, padding: '40px 48px', margin: '-48px -48px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }
    : isEpure
    ? { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', paddingBottom: '24px', borderLeft: `4px solid ${c}`, paddingLeft: '16px' }
    : { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', paddingBottom: '24px', borderBottom: `2px solid ${c}` }

  const theadStyle = isEpure
    ? { background: '#f5f5f5', color: '#111' }
    : isModerne
    ? { background: c, color: '#fff' }
    : { background: '#111', color: '#fff' }

  const titreGroupeStyle = {
    padding: isModerne ? '10px 12px 4px' : '12px 12px 4px',
    fontWeight: '700', fontSize: '13px', color: c,
    background: isModerne ? c + '12' : 'transparent',
    borderLeft: isModerne ? `3px solid ${c}` : 'none',
  }

  const ligneRows = (() => {
    const visible = lignes.filter(l => l.designation)
    let inGroupe = false
    return visible.map((l, i) => {
      if (l.type === 'titre') {
        inGroupe = true
        return (
          <tr key={l._id}>
            <td colSpan={6} style={{ ...titreGroupeStyle, borderTop: i > 0 ? '1px solid #e5e5e5' : 'none' }}>
              {l.designation}
            </td>
          </tr>
        )
      }
      const qte = parseFloat(l.quantite) || 0
      const pu = parseFloat(l.prix_unitaire_ht) || 0
      const remise = parseFloat(l.remise_pct) || 0
      const total = qte * pu * (1 - remise / 100)
      const rowBg = isEpure ? '#fff' : (i % 2 === 0 ? '#fafafa' : '#fff')
      return (
        <tr key={l._id} style={{ background: rowBg, borderTop: '1px solid #eee' }}>
          <td style={{ padding: '10px 12px' }}>
            <div style={{ fontWeight: '500', color: '#111', paddingLeft: inGroupe ? '12px' : '0' }}>{l.designation}</div>
            {l.description && <div style={{ fontSize: '11px', color: '#777', marginTop: '2px', paddingLeft: inGroupe ? '12px' : '0' }}>{l.description}</div>}
          </td>
          <td style={{ padding: '10px 12px', textAlign: 'right', color: '#555' }}>{l.unite}</td>
          <td style={{ padding: '10px 12px', textAlign: 'right', color: '#555' }}>{l.quantite}</td>
          <td style={{ padding: '10px 12px', textAlign: 'right', color: '#555' }}>{fmt(pu)} €</td>
          <td style={{ padding: '10px 12px', textAlign: 'right', color: '#555' }}>{l.tva_taux}%</td>
          <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '600', color: '#111' }}>{fmt(total)} €</td>
        </tr>
      )
    })
  })()

  const infoEntreprise = (
    <div>
      <div style={{ fontSize: '22px', fontWeight: '800', color: isModerne ? '#fff' : '#111', letterSpacing: '-0.03em', marginBottom: '4px' }}>{profile.company_name}</div>
      <div style={{ fontSize: '12px', color: isModerne ? '#ffffffbb' : '#666' }}>{profile.forme_juridique}</div>
      <div style={{ fontSize: '12px', color: isModerne ? '#ffffffbb' : '#444', marginTop: '6px' }}>{profile.adresse}</div>
      <div style={{ fontSize: '12px', color: isModerne ? '#ffffffbb' : '#444' }}>{profile.code_postal} {profile.ville}</div>
      <div style={{ fontSize: '12px', color: isModerne ? '#ffffffbb' : '#444' }}>Tél : {profile.telephone}</div>
      <div style={{ fontSize: '12px', color: isModerne ? '#fff' : c }}>{profile.email_pro}</div>
      <div style={{ fontSize: '11px', color: isModerne ? '#ffffff88' : '#888', marginTop: '6px' }}>SIRET : {profile.siret}</div>
    </div>
  )

  const infoDevis = (
    <div style={{ textAlign: 'right' }}>
      <div style={{ fontSize: '28px', fontWeight: '800', color: isModerne ? '#fff' : c, letterSpacing: '-0.03em' }}>DEVIS</div>
      <div style={{ fontSize: '13px', color: isModerne ? '#ffffffbb' : '#666', marginTop: '4px' }}>Date d'émission : <strong style={{ color: isModerne ? '#fff' : '#111' }}>{fmtDate(form.date_emission)}</strong></div>
      <div style={{ fontSize: '13px', color: isModerne ? '#ffffffbb' : '#666' }}>Valable jusqu'au : <strong style={{ color: isModerne ? '#fff' : '#111' }}>{fmtDate(form.date_validite)}</strong></div>
      <div style={{ marginTop: '10px', padding: '6px 10px', background: isModerne ? '#ffffff22' : '#f5f5f5', borderRadius: '4px', fontSize: '12px', color: isModerne ? '#fff' : '#444', maxWidth: '220px', marginLeft: 'auto' }}>{form.objet}</div>
    </div>
  )

  return (
    <div style={{
      background: '#fff', color: '#111', maxWidth: '820px', width: '100%',
      padding: '48px', fontFamily: "'Inter', sans-serif", fontSize: '13px',
      lineHeight: '1.5', boxShadow: '0 4px 40px #0002', borderRadius: '4px',
    }}>
      <div style={headerStyle}>
        {infoEntreprise}
        {infoDevis}
      </div>

      <div style={{ display: 'flex', gap: '40px', marginBottom: '32px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '11px', fontWeight: '600', color: isEpure ? c : '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Client</div>
          <div style={{ background: '#f9f9f9', border: isEpure ? `1px solid ${c}44` : '1px solid #e5e5e5', borderRadius: '4px', padding: '14px 16px' }}>
            <div style={{ fontWeight: '600', fontSize: '14px', color: '#111', marginBottom: '4px' }}>{form.client_nom}</div>
            <div style={{ color: '#555' }}>{form.client_adresse}</div>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '11px', fontWeight: '600', color: isEpure ? c : '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Chantier</div>
          <div style={{ background: '#f9f9f9', border: isEpure ? `1px solid ${c}44` : '1px solid #e5e5e5', borderRadius: '4px', padding: '14px 16px' }}>
            <div><span style={{ color: '#888' }}>Adresse : </span><span style={{ color: '#111' }}>{form.lieu_travaux}</span></div>
            <div><span style={{ color: '#888' }}>Délai : </span><span style={{ color: '#111' }}>{form.delai_realisation}</span></div>
          </div>
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
        <thead>
          <tr style={theadStyle}>
            {['Désignation', 'Unité', 'Qté', 'PU HT', 'TVA', 'Total HT'].map((h, i) => (
              <th key={h} style={{ padding: '10px 12px', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: i > 0 ? 'right' : 'left', color: isEpure ? '#555' : 'inherit' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{ligneRows}</tbody>
      </table>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '32px' }}>
        <div style={{ width: '280px' }}>
          <TotalLine label="Total HT" value={`${fmt(ht)} €`} />
          <TotalLine label={`TVA (${form.tva_taux}%)`} value={`${fmt(tva)} €`} />
          <div style={{ borderTop: `2px solid ${isEpure ? c : '#111'}`, marginTop: '6px', paddingTop: '8px' }}>
            <TotalLine label="TOTAL TTC" value={`${fmt(ttc)} €`} bold />
          </div>
          <div style={{ marginTop: '8px', padding: '8px 12px', background: c + '12', border: `1px solid ${c}44`, borderRadius: '4px' }}>
            <TotalLine label={`Acompte (${form.acompte_pct}%)`} value={`${fmt(acompte)} €`} color={c} bold />
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '24px', padding: '12px 16px', background: '#f9f9f9', border: '1px solid #e5e5e5', borderRadius: '4px' }}>
        <div style={{ fontSize: '11px', fontWeight: '600', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Conditions de paiement</div>
        <div style={{ fontSize: '12px', color: '#444' }}>{form.conditions_paiement}</div>
      </div>

      <div style={{ marginTop: '32px', paddingTop: '20px', borderTop: '1px solid #e5e5e5' }}>
        <div style={{ fontSize: '10px', color: '#aaa', lineHeight: 1.7 }}>
          <strong style={{ color: '#888' }}>Mentions légales :</strong> Ce devis est valable jusqu'au {fmtDate(form.date_validite)}. Toute commande implique l'acceptation sans réserve des présentes conditions. En cas d'annulation après acceptation, un acompte forfaitaire de {form.acompte_pct}% du montant TTC sera dû. Les travaux sont garantis selon la réglementation en vigueur.
        </div>
      </div>

      <div style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        <div style={{ border: '1px solid #e5e5e5', borderRadius: '4px', padding: '16px', minHeight: '80px' }}>
          <div style={{ fontSize: '11px', color: '#888', marginBottom: '6px' }}>Signature et cachet de l'entreprise</div>
          <div style={{ fontSize: '11px', color: '#bbb' }}>(bon pour accord)</div>
        </div>
        <div style={{ border: '1px solid #e5e5e5', borderRadius: '4px', padding: '16px', minHeight: '80px' }}>
          <div style={{ fontSize: '11px', color: '#888', marginBottom: '6px' }}>Signature du client</div>
          <div style={{ fontSize: '11px', color: c, fontStyle: 'italic' }}>"Bon pour accord et exécution des travaux"</div>
        </div>
      </div>
    </div>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function DevisPersonnalisation() {
  const navigate = useNavigate()
  const { user, profile, refreshProfile } = useAuth()
  const [couleur, setCouleur] = useState(profile?.devis_couleur ?? '#18a96b')
  const [modele, setModele] = useState(profile?.devis_modele ?? 'classique')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setSaving(true)
    await supabase.from('profiles').update({ devis_couleur: couleur, devis_modele: modele }).eq('id', user.id)
    await refreshProfile()
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="devis-perso-layout" style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>

      {/* ── Sidebar gauche ── */}
      <div className="devis-perso-sidebar" style={{
        width: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column',
        background: 'var(--surface-1)', borderRight: '1px solid var(--border)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={() => navigate('/devis')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', display: 'flex', borderRadius: '4px' }}>
            <ArrowLeft size={16} />
          </button>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>Personnaliser</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>Apparence de vos devis</div>
          </div>
        </div>

        {/* Contenu scrollable */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '28px' }}>

          {/* Modèle */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>Modèle</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {MODELES.map(m => (
                <button key={m.id} onClick={() => setModele(m.id)} style={{
                  width: '100%', textAlign: 'left', padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                  border: `1px solid ${modele === m.id ? couleur : 'var(--border)'}`,
                  background: modele === m.id ? couleur + '14' : 'var(--surface-2)',
                  transition: 'all 0.15s',
                }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: modele === m.id ? couleur : 'var(--text-primary)' }}>{m.label}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{m.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Couleur */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>Couleur principale</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
              {COULEURS.map(c => (
                <button key={c} onClick={() => setCouleur(c)} style={{
                  width: '28px', height: '28px', borderRadius: '50%', background: c,
                  border: 'none', cursor: 'pointer', flexShrink: 0,
                  outline: couleur === c ? `3px solid ${c}` : '3px solid transparent',
                  outlineOffset: '3px', transition: 'outline 0.15s',
                }} />
              ))}
              <label style={{ position: 'relative', width: '28px', height: '28px', cursor: 'pointer', flexShrink: 0 }} title="Couleur personnalisée">
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'conic-gradient(red, yellow, green, cyan, blue, magenta, red)', border: '1px solid var(--border)' }} />
                <input type="color" value={couleur} onChange={e => setCouleur(e.target.value)} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
              </label>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', padding: '6px 10px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', width: 'fit-content' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: couleur, flexShrink: 0 }} />
              <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{couleur}</span>
            </div>
          </div>

        </div>

        {/* Footer avec bouton save */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
          <Button variant={saved ? 'secondary' : 'primary'} icon={saving ? Loader2 : Save} onClick={handleSave} disabled={saving} style={{ width: '100%' }}>
            {saving ? 'Enregistrement…' : saved ? 'Enregistré ✓' : 'Enregistrer'}
          </Button>
        </div>
      </div>

      {/* ── Zone preview ── */}
      <div className="devis-perso-preview" style={{ flex: 1, overflowY: 'auto', background: 'var(--surface-2)', padding: '40px' }}>
        <DevisPreviewVitrine theme={{ color: couleur, modele }} />
      </div>

    </div>
  )
}
