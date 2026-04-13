import { useState } from 'react'
import TopBar from '../components/layout/TopBar'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { Camera, Upload, Scan, CheckCircle2, Plus, Trash2, Euro, Loader2 } from 'lucide-react'

const detectedItems = [
  { id: 1, label: 'Câble électrique 2.5mm² (rouleau)', qty: 2, unit: 'rouleau', price: 45.90, included: true },
  { id: 2, label: 'Tableau électrique 12 modules', qty: 1, unit: 'pièce', price: 89.00, included: true },
  { id: 3, label: 'Disjoncteur 20A', qty: 4, unit: 'pièce', price: 12.50, included: true },
  { id: 4, label: 'Gaine ICTA 3/4 50m', qty: 1, unit: 'rouleau', price: 32.00, included: true },
  { id: 5, label: 'Boîte de dérivation IP40', qty: 6, unit: 'pièce', price: 4.20, included: false },
  { id: 6, label: 'Presse-étoupe M20', qty: 10, unit: 'pièce', price: 1.80, included: false },
]

export default function VisionDevis() {
  const [phase, setPhase] = useState('idle') // idle | uploading | scanning | done
  const [items, setItems] = useState(detectedItems.map(i => ({ ...i })))
  const [dragging, setDragging] = useState(false)

  const handleUpload = () => {
    setPhase('uploading')
    setTimeout(() => setPhase('scanning'), 1000)
    setTimeout(() => setPhase('done'), 3000)
  }

  const toggleItem = (id) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, included: !i.included } : i))
  }

  const included = items.filter(i => i.included)
  const totalHT = included.reduce((sum, i) => sum + i.qty * i.price, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <TopBar title="Vision Devis" subtitle="Analyse une photo et génère un devis" />
      <main style={{ flex: 1, padding: '24px', display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px', alignItems: 'start' }}>

        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Upload zone */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <Camera size={18} style={{ color: 'var(--brand)' }} />
              <h2 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>Photo du chantier</h2>
              <Badge variant="green">Vision IA</Badge>
            </div>

            {phase === 'idle' ? (
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => { e.preventDefault(); setDragging(false); handleUpload() }}
                style={{
                  border: `2px dashed ${dragging ? 'var(--brand)' : 'var(--border-strong)'}`,
                  borderRadius: 'var(--radius)',
                  padding: '48px 24px',
                  textAlign: 'center',
                  background: dragging ? 'var(--brand-muted)' : 'var(--surface-2)',
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                }}
                onClick={handleUpload}
              >
                <Upload size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
                <p style={{ fontSize: '15px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Glissez une photo ou cliquez
                </p>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Tableau électrique, mur dégradé, plomberie — Ivy détecte les composants
                </p>
                <Button variant="secondary" size="sm" style={{ marginTop: '16px' }}>
                  Choisir une photo
                </Button>
              </div>
            ) : phase === 'uploading' || phase === 'scanning' ? (
              <div style={{
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: '48px 24px',
                textAlign: 'center',
                background: 'var(--surface-2)',
              }}>
                <Loader2 size={32} style={{ color: 'var(--brand)', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
                <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>
                  {phase === 'uploading' ? 'Chargement de la photo...' : 'Analyse IA en cours...'}
                </p>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  {phase === 'scanning' && 'Détection des composants, estimation des quantités...'}
                </p>
              </div>
            ) : (
              <div style={{
                position: 'relative',
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                overflow: 'hidden',
                aspectRatio: '16/9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {/* Fake image placeholder */}
                <div style={{
                  width: '100%', height: '100%',
                  background: 'linear-gradient(135deg, #1c1c1c 0%, #2a2a2a 50%, #1c1c1c 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Camera size={48} style={{ color: 'var(--surface-3)' }} />
                </div>
                {/* Detection overlays */}
                {[
                  { top: '20%', left: '15%', label: 'Tableau élec' },
                  { top: '55%', left: '60%', label: 'Câblage' },
                  { top: '35%', left: '70%', label: 'Disj. ×4' },
                ].map((box, i) => (
                  <div key={i} style={{
                    position: 'absolute',
                    top: box.top,
                    left: box.left,
                    border: '2px solid var(--brand)',
                    borderRadius: '4px',
                    padding: '2px 6px',
                    background: 'var(--brand-muted)',
                    backdropFilter: 'blur(4px)',
                  }}>
                    <span style={{ fontSize: '11px', color: 'var(--brand)', fontWeight: '600', fontFamily: 'var(--font-mono)' }}>
                      {box.label}
                    </span>
                  </div>
                ))}
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                }}>
                  <Badge variant="green">
                    <CheckCircle2 size={12} /> {items.length} composants détectés
                  </Badge>
                </div>
              </div>
            )}
          </Card>

          {/* Detected items */}
          {phase === 'done' && (
            <Card style={{ padding: 0 }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Scan size={16} style={{ color: 'var(--brand)' }} />
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>Matériaux détectés</h3>
                <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text-muted)' }}>
                  {included.length}/{items.length} sélectionnés
                </span>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['', 'Matériau', 'Qté', 'Prix unit.', 'Total HT', ''].map((h, i) => (
                      <th key={i} style={{ padding: '10px 16px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500', textAlign: i < 2 ? 'left' : 'right' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id} style={{
                      borderBottom: '1px solid var(--border)',
                      opacity: item.included ? 1 : 0.4,
                      transition: 'opacity 0.2s',
                    }}>
                      <td style={{ padding: '10px 16px', width: '32px' }}>
                        <input
                          type="checkbox"
                          checked={item.included}
                          onChange={() => toggleItem(item.id)}
                          style={{ accentColor: 'var(--brand)', cursor: 'pointer' }}
                        />
                      </td>
                      <td style={{ padding: '10px 8px', fontSize: '13px', color: 'var(--text-primary)' }}>{item.label}</td>
                      <td style={{ padding: '10px 16px', fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'right' }}>{item.qty} {item.unit}</td>
                      <td style={{ padding: '10px 16px', fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'right' }}>{item.price.toFixed(2)} €</td>
                      <td style={{ padding: '10px 16px', fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)', textAlign: 'right' }}>
                        {(item.qty * item.price).toFixed(2)} €
                      </td>
                      <td style={{ padding: '10px 16px', width: '32px' }}>
                        <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}>
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </div>

        {/* Right: Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <Euro size={16} style={{ color: 'var(--brand)' }} />
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>Récapitulatif devis</h3>
            </div>
            {phase === 'done' ? (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                  <SummaryLine label="Matériaux HT" value={`${totalHT.toFixed(2)} €`} />
                  <SummaryLine label="Main d'œuvre (est.)" value="320.00 €" />
                  <SummaryLine label="Marge (30%)" value={`${(totalHT * 0.3).toFixed(2)} €`} highlight />
                  <div style={{ height: '1px', background: 'var(--border)' }} />
                  <SummaryLine label="Total HT" value={`${(totalHT + 320).toFixed(2)} €`} bold />
                  <SummaryLine label="TVA 20%" value={`${((totalHT + 320) * 0.2).toFixed(2)} €`} />
                  <SummaryLine label="Total TTC" value={`${((totalHT + 320) * 1.2).toFixed(2)} €`} bold large />
                </div>
                <Button variant="primary" style={{ width: '100%', justifyContent: 'center' }}>
                  Créer le devis
                </Button>
                <Button variant="secondary" style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}>
                  Modifier les lignes
                </Button>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Uploadez une photo pour générer automatiquement une liste de matériaux
                </p>
              </div>
            )}
          </Card>

          <Card>
            <h3 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Comment ça marche
            </h3>
            {[
              { n: '1', text: 'Prenez une photo du chantier ou du composant à évaluer' },
              { n: '2', text: 'Ivy analyse l\'image et détecte les matériaux visibles' },
              { n: '3', text: 'Vérifiez et ajustez la liste générée automatiquement' },
              { n: '4', text: 'Générez le devis en un clic, avec les prix de votre catalogue' },
            ].map(step => (
              <div key={step.n} style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '20px', height: '20px', borderRadius: '50%',
                  background: 'var(--brand-muted)', border: '1px solid var(--brand)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: '700', color: 'var(--brand)',
                  flexShrink: 0,
                }}>{step.n}</div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{step.text}</p>
              </div>
            ))}
          </Card>
        </div>
      </main>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function SummaryLine({ label, value, bold, large, highlight }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{
        fontSize: large ? '18px' : '14px',
        fontWeight: bold ? '700' : '400',
        color: highlight ? 'var(--brand)' : bold ? 'var(--text-primary)' : 'var(--text-secondary)',
      }}>{value}</span>
    </div>
  )
}
