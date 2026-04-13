import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import TopBar from '../components/layout/TopBar'
import Button from '../components/ui/Button'
import { Save, Loader2 } from 'lucide-react'

const COULEURS = ['#18a96b', '#2563eb', '#dc2626', '#7c3aed', '#ea580c', '#0891b2', '#111111']

const MODELES = [
  {
    id: 'classique',
    label: 'Classique',
    desc: 'En-tête avec ligne de séparation colorée',
  },
  {
    id: 'moderne',
    label: 'Moderne',
    desc: 'Bandeau de couleur plein en haut de page',
  },
  {
    id: 'epure',
    label: 'Épuré',
    desc: 'Accent discret sur la bordure gauche',
  },
]

function ModelPreview({ modele, color }) {
  const c = color

  if (modele === 'classique') return (
    <div style={{ background: '#fff', borderRadius: '4px', padding: '12px', fontSize: '9px', color: '#111', lineHeight: 1.4, fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: `2px solid ${c}`, marginBottom: '8px' }}>
        <div>
          <div style={{ fontWeight: '800', fontSize: '11px' }}>Mon Entreprise</div>
          <div style={{ color: '#666', marginTop: '2px' }}>12 rue de la Paix, Paris</div>
          <div style={{ color: c }}>contact@entreprise.fr</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: '800', fontSize: '14px', color: c }}>DEVIS</div>
          <div style={{ color: '#666' }}>01/04/2026</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <div style={{ flex: 1, background: '#f9f9f9', border: '1px solid #e5e5e5', borderRadius: '3px', padding: '6px' }}>
          <div style={{ color: '#888', textTransform: 'uppercase', fontSize: '8px', marginBottom: '3px' }}>Client</div>
          <div style={{ fontWeight: '600' }}>M. Dupont</div>
        </div>
      </div>
      <div style={{ background: '#111', color: '#fff', padding: '4px 6px', borderRadius: '2px 2px 0 0' }}>
        <span style={{ fontSize: '8px', fontWeight: '600', textTransform: 'uppercase' }}>Désignation</span>
      </div>
      <div style={{ border: '1px solid #eee', borderTop: 'none', padding: '4px 6px' }}>
        <div style={{ fontWeight: '700', color: c, marginBottom: '2px' }}>Maçonnerie</div>
        <div style={{ color: '#555' }}>Mur porteur</div>
      </div>
    </div>
  )

  if (modele === 'moderne') return (
    <div style={{ background: '#fff', borderRadius: '4px', overflow: 'hidden', fontSize: '9px', color: '#111', lineHeight: 1.4, fontFamily: 'Inter, sans-serif' }}>
      <div style={{ background: c, padding: '12px', display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div>
          <div style={{ fontWeight: '800', fontSize: '11px', color: '#fff' }}>Mon Entreprise</div>
          <div style={{ color: '#ffffffbb', marginTop: '2px' }}>12 rue de la Paix, Paris</div>
          <div style={{ color: '#fff' }}>contact@entreprise.fr</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: '800', fontSize: '14px', color: '#fff' }}>DEVIS</div>
          <div style={{ color: '#ffffffbb' }}>01/04/2026</div>
        </div>
      </div>
      <div style={{ padding: '0 12px' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <div style={{ flex: 1, background: '#f9f9f9', border: '1px solid #e5e5e5', borderRadius: '3px', padding: '6px' }}>
            <div style={{ color: '#888', textTransform: 'uppercase', fontSize: '8px', marginBottom: '3px' }}>Client</div>
            <div style={{ fontWeight: '600' }}>M. Dupont</div>
          </div>
        </div>
        <div style={{ background: c, color: '#fff', padding: '4px 6px', borderRadius: '2px 2px 0 0' }}>
          <span style={{ fontSize: '8px', fontWeight: '600', textTransform: 'uppercase' }}>Désignation</span>
        </div>
        <div style={{ border: '1px solid #eee', borderTop: 'none', padding: '4px 6px' }}>
          <div style={{ fontWeight: '700', color: c, background: c + '12', paddingLeft: '4px', borderLeft: `3px solid ${c}`, marginBottom: '2px' }}>Maçonnerie</div>
          <div style={{ color: '#555' }}>Mur porteur</div>
        </div>
      </div>
    </div>
  )

  // épuré
  return (
    <div style={{ background: '#fff', borderRadius: '4px', padding: '12px', fontSize: '9px', color: '#111', lineHeight: 1.4, fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderLeft: `4px solid ${c}`, paddingLeft: '8px' }}>
        <div>
          <div style={{ fontWeight: '800', fontSize: '11px' }}>Mon Entreprise</div>
          <div style={{ color: '#666', marginTop: '2px' }}>12 rue de la Paix, Paris</div>
          <div style={{ color: c }}>contact@entreprise.fr</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: '800', fontSize: '14px', color: c }}>DEVIS</div>
          <div style={{ color: '#666' }}>01/04/2026</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <div style={{ flex: 1, background: '#f9f9f9', border: `1px solid ${c}44`, borderRadius: '3px', padding: '6px' }}>
          <div style={{ color: c, textTransform: 'uppercase', fontSize: '8px', marginBottom: '3px' }}>Client</div>
          <div style={{ fontWeight: '600' }}>M. Dupont</div>
        </div>
      </div>
      <div style={{ background: '#f5f5f5', padding: '4px 6px', borderRadius: '2px 2px 0 0' }}>
        <span style={{ fontSize: '8px', fontWeight: '600', textTransform: 'uppercase', color: '#555' }}>Désignation</span>
      </div>
      <div style={{ border: '1px solid #eee', borderTop: 'none', padding: '4px 6px', borderBottom: `2px solid ${c}` }}>
        <div style={{ fontWeight: '700', color: c, marginBottom: '2px' }}>Maçonnerie</div>
        <div style={{ color: '#555' }}>Mur porteur</div>
      </div>
    </div>
  )
}

export default function Settings() {
  const { profile, user, refreshProfile } = useAuth()
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
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <TopBar title="Paramètres" />
      <main style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '860px' }}>

        {/* Section modèle de devis */}
        <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>Apparence des devis</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>Ces réglages s'appliquent à tous vos devis.</div>
          </div>

          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Choix modèle */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '12px' }}>Modèle</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {MODELES.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setModele(m.id)}
                    style={{
                      background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left',
                      outline: modele === m.id ? `2px solid ${couleur}` : '2px solid transparent',
                      borderRadius: '8px', overflow: 'hidden', transition: 'outline 0.15s',
                    }}
                  >
                    {/* Prévisualisation */}
                    <div style={{ background: 'var(--surface-2)', padding: '12px', borderRadius: '6px 6px 0 0' }}>
                      <ModelPreview modele={m.id} color={couleur} />
                    </div>
                    {/* Label */}
                    <div style={{
                      padding: '10px 12px',
                      background: modele === m.id ? couleur + '14' : 'var(--surface-2)',
                      borderTop: `1px solid ${modele === m.id ? couleur + '44' : 'var(--border)'}`,
                    }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: modele === m.id ? couleur : 'var(--text-primary)' }}>{m.label}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{m.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Choix couleur */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '12px' }}>Couleur principale</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                {COULEURS.map(c => (
                  <button key={c} onClick={() => setCouleur(c)} style={{
                    width: '28px', height: '28px', borderRadius: '50%', background: c,
                    border: 'none', cursor: 'pointer',
                    outline: couleur === c ? `3px solid ${c}` : '3px solid transparent',
                    outlineOffset: '3px', transition: 'outline 0.15s',
                  }} />
                ))}
                {/* Couleur libre */}
                <label style={{ position: 'relative', width: '28px', height: '28px', cursor: 'pointer' }} title="Couleur personnalisée">
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'conic-gradient(red, yellow, green, cyan, blue, magenta, red)', border: '1px solid var(--border)' }} />
                  <input type="color" value={couleur} onChange={e => setCouleur(e.target.value)} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
                </label>
                {/* Couleur actuelle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '8px', padding: '6px 12px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: couleur, flexShrink: 0 }} />
                  <span style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{couleur}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant={saved ? 'secondary' : 'primary'} icon={saving ? Loader2 : Save} onClick={handleSave} disabled={saving}>
              {saving ? 'Enregistrement…' : saved ? 'Enregistré ✓' : 'Enregistrer'}
            </Button>
          </div>
        </div>

      </main>
    </div>
  )
}
