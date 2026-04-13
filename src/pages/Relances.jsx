import { useState, useEffect } from 'react'
import TopBar from '../components/layout/TopBar'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { Zap, MessageSquare, Mail, Clock, Brain, Send, Pause, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const statusConfig = {
  urgent:  { label: 'Urgent',    variant: 'error' },
  pending: { label: 'À relancer', variant: 'warning' },
  paused:  { label: 'En pause',  variant: 'default' },
  new:     { label: 'Récent',    variant: 'info' },
  sent:    { label: 'Envoyée',   variant: 'green' },
}

export default function Relances() {
  const { user } = useAuth()
  const [relances, setRelances] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  async function fetchRelances() {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('relances')
      .select('*, devis(reference, objet, montant_ht, sent_at), clients(name)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    const list = data ?? []
    setRelances(list)
    if (list.length > 0) setSelected(list[0])
    setLoading(false)
  }

  useEffect(() => {
    if (!user) return
    let cancelled = false
    async function load() {
      setLoading(true)
      const { data } = await supabase
        .from('relances')
        .select('*, devis(reference, objet, montant_ht, sent_at), clients(name)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (cancelled) return
      const list = data ?? []
      setRelances(list)
      if (list.length > 0) setSelected(list[0])
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [user?.id])

  async function markSent(id) {
    await supabase.from('relances').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('id', id)
    fetchRelances()
  }

  async function togglePause(relance) {
    const newStatus = relance.status === 'paused' ? 'pending' : 'paused'
    await supabase.from('relances').update({ status: newStatus }).eq('id', relance.id)
    fetchRelances()
  }

  // Computed stats
  const enAttente = relances.filter(r => r.status !== 'paused' && r.status !== 'sent')
  const sent = relances.filter(r => r.status === 'sent')
  const caPotentiel = enAttente.reduce((s, r) => s + (r.devis?.montant_ht ?? 0), 0)

  function age(r) {
    if (!r.devis?.sent_at) return null
    return Math.floor((Date.now() - new Date(r.devis.sent_at)) / 86400000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <TopBar title="Relances intelligentes" subtitle="Suivi et envoi personnalisé par IA" />
      <main style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          {[
            { label: 'À relancer', value: enAttente.length },
            { label: 'Envoyées', value: sent.length },
            { label: 'CA potentiel', value: caPotentiel > 0 ? `${(caPotentiel / 1000).toFixed(1)}k €` : '—' },
            { label: 'Total relances', value: relances.length },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--surface-1)', padding: '16px 20px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>{s.label}</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{s.value}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px', gap: '10px', color: 'var(--text-muted)' }}>
            <Loader2 size={18} style={{ animation: 'spin 0.7s linear infinite' }} /> Chargement...
          </div>
        ) : relances.length === 0 ? (
          <Card>
            <div style={{ textAlign: 'center', padding: '48px 24px' }}>
              <Zap size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
              <p style={{ fontSize: '15px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>Aucune relance</p>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Les relances apparaissent automatiquement quand un devis reste en attente.
              </p>
            </div>
          </Card>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '16px', flex: 1 }}>

            {/* List */}
            <Card style={{ padding: 0, alignSelf: 'start' }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>Devis à relancer</h3>
                <Badge variant="warning">{enAttente.length}</Badge>
              </div>
              {relances.map(r => {
                const sc = statusConfig[r.status] ?? statusConfig.pending
                const isSelected = selected?.id === r.id
                const j = age(r)
                return (
                  <div key={r.id} onClick={() => setSelected(r)} style={{
                    padding: '14px 16px', borderBottom: '1px solid var(--border)',
                    cursor: 'pointer',
                    background: isSelected ? 'var(--surface-2)' : 'transparent',
                    borderLeft: isSelected ? '2px solid var(--brand)' : '2px solid transparent',
                    transition: 'all 0.15s',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>{r.clients?.name ?? '—'}</span>
                      <Badge variant={sc.variant} size="sm">{sc.label}</Badge>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>{r.devis?.objet ?? '—'}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {r.canal === 'SMS' ? <MessageSquare size={11} style={{ display: 'inline', marginRight: '3px' }} /> : <Mail size={11} style={{ display: 'inline', marginRight: '3px' }} />}
                        {r.canal}{j !== null ? ` · J+${j}` : ''}
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>
                        {r.devis?.montant_ht ? `${r.devis.montant_ht.toLocaleString('fr-FR')} €` : '—'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </Card>

            {/* Detail */}
            {selected && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* Sentiment */}
                <Card>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <div style={{ width: '32px', height: '32px', background: 'var(--brand-muted)', border: '1px solid var(--brand)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Brain size={16} style={{ color: 'var(--brand)' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>Analyse de sentiment</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Détection : <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>{selected.sentiment_label ?? 'Pas de réponse'}</span>
                      </div>
                    </div>
                    <Badge
                      variant={selected.sentiment === 'positif' ? 'green' : selected.sentiment === 'hésitant' ? 'warning' : 'default'}
                      style={{ marginLeft: 'auto' }}
                    >
                      {selected.sentiment ?? 'neutre'}
                    </Badge>
                  </div>
                  {selected.ai_suggestion && (
                    <div style={{ padding: '12px 16px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      <span style={{ color: 'var(--brand)', fontWeight: '600', marginRight: '6px' }}>Stratégie Ivy :</span>
                      {selected.ai_suggestion}
                    </div>
                  )}
                </Card>

                {/* Draft */}
                {selected.draft ? (
                  <Card>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                      {selected.canal === 'SMS' ? <MessageSquare size={16} style={{ color: 'var(--info)' }} /> : <Mail size={16} style={{ color: 'var(--info)' }} />}
                      <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                        Brouillon {selected.canal} — {selected.clients?.name}
                      </h3>
                    </div>
                    <textarea
                      defaultValue={selected.draft}
                      rows={5}
                      style={{ width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '12px', color: 'var(--text-primary)', fontSize: '14px', lineHeight: 1.6, resize: 'vertical', outline: 'none', fontFamily: 'inherit', marginBottom: '16px' }}
                      onFocus={e => e.target.style.borderColor = 'var(--brand)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border)'}
                    />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Button variant="primary" icon={Send} onClick={() => markSent(selected.id)}>Envoyer maintenant</Button>
                      <Button variant="secondary" icon={Clock}>Planifier</Button>
                      <Button variant="ghost" icon={Pause} onClick={() => togglePause(selected)}>
                        {selected.status === 'paused' ? 'Reprendre' : 'Mettre en pause'}
                      </Button>
                    </div>
                  </Card>
                ) : (
                  <Card>
                    <div style={{ textAlign: 'center', padding: '24px 0' }}>
                      <Pause size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
                      <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '4px' }}>
                        {selected.status === 'paused' ? 'Relance en pause' : 'Aucun brouillon disponible'}
                      </p>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        {selected.status === 'paused' ? "Ivy reprendra la relance automatiquement." : "Ajoutez un brouillon pour pouvoir envoyer."}
                      </p>
                      {selected.status === 'paused' && (
                        <Button variant="secondary" size="sm" style={{ marginTop: '12px' }} onClick={() => togglePause(selected)}>
                          Reprendre la relance
                        </Button>
                      )}
                    </div>
                  </Card>
                )}

                {/* Timeline */}
                <Card>
                  <h3 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Historique</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                    {[
                      selected.sent_at && { date: new Date(selected.sent_at).toLocaleDateString('fr-FR'), action: 'Relance envoyée', note: `Via ${selected.canal}`, color: 'var(--brand)', future: false },
                      selected.devis?.sent_at && { date: new Date(selected.devis.sent_at).toLocaleDateString('fr-FR'), action: 'Devis envoyé', note: selected.devis.montant_ht ? `${selected.devis.montant_ht.toLocaleString('fr-FR')} €` : '', color: 'var(--info)', future: false },
                    ].filter(Boolean).map((ev, i, arr) => (
                      <div key={i} style={{ display: 'flex', gap: '12px', paddingBottom: i < arr.length - 1 ? '16px' : '0' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: ev.color, flexShrink: 0, marginTop: '4px' }} />
                          {i < arr.length - 1 && <div style={{ width: '1px', flex: 1, background: 'var(--border)', marginTop: '4px' }} />}
                        </div>
                        <div style={{ flex: 1, paddingBottom: '4px' }}>
                          <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>{ev.action}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{ev.date} · {ev.note}</div>
                        </div>
                      </div>
                    ))}
                    {!selected.sent_at && !selected.devis?.sent_at && (
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Aucun événement enregistré.</p>
                    )}
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}
      </main>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
