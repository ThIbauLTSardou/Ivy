import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import TopBar from '../components/layout/TopBar'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import {
  ArrowLeft, Phone, Mail, MapPin, Building2, Edit2,
  Trash2, Save, X, Loader2, HardHat, FileText, Euro,
  AlertTriangle, Clock
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const CLIENT_TYPES = ['Particulier', 'Société', 'Copropriété']

export default function ClientDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [client, setClient] = useState(null)
  const [chantiers, setChantiers] = useState([])
  const [devis, setDevis] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({})

  useEffect(() => { if (user) fetchClient() }, [id, user?.id])

  async function fetchClient() {
    setLoading(true)
    const [{ data: clientData }, { data: chantiersData }, { data: devisData }] = await Promise.all([
      supabase.from('clients').select('*').eq('id', id).eq('user_id', user.id).single(),
      supabase.from('chantiers').select('*').eq('client_id', id).order('created_at', { ascending: false }),
      supabase.from('devis').select('*').eq('client_id', id).order('created_at', { ascending: false }),
    ])
    if (!clientData) { navigate('/clients'); return }
    setClient(clientData)
    setForm({
      name: clientData.name,
      type: clientData.type,
      email: clientData.email ?? '',
      phone: clientData.phone ?? '',
      ville: clientData.ville ?? '',
      status: clientData.status,
      notes: clientData.notes ?? '',
    })
    setChantiers(chantiersData ?? [])
    setDevis(devisData ?? [])
    setLoading(false)
  }

  function set(k, v) { setForm(p => ({ ...p, [k]: v })) }

  async function handleSave() {
    setSaving(true)
    setError(null)
    const { error } = await supabase.from('clients').update({
      name: form.name,
      type: form.type,
      email: form.email || null,
      phone: form.phone || null,
      ville: form.ville || null,
      status: form.status,
      notes: form.notes || null,
    }).eq('id', id)
    setSaving(false)
    if (error) { setError(error.message); return }
    setClient(prev => ({ ...prev, ...form }))
    setEditing(false)
  }

  async function handleDelete() {
    setDeleting(true)
    await supabase.from('clients').delete().eq('id', id)
    navigate('/clients')
  }

  const caTotal = devis.reduce((s, d) => s + (d.montant_ht ?? 0), 0)
  const devisAcceptes = devis.filter(d => d.statut === 'accepte').length

  const statusMap = {
    brouillon:  { label: 'Brouillon',  variant: 'default' },
    en_attente: { label: 'En attente', variant: 'warning' },
    accepte:    { label: 'Accepté',    variant: 'green' },
    refuse:     { label: 'Refusé',     variant: 'error' },
    facture:    { label: 'Facturé',    variant: 'info' },
  }
  const chantierStatusMap = {
    planifie: { label: 'Planifié', variant: 'info' },
    en_cours: { label: 'En cours', variant: 'green' },
    termine:  { label: 'Terminé',  variant: 'default' },
    annule:   { label: 'Annulé',   variant: 'error' },
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <TopBar title="Fiche client" />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: 'var(--text-muted)' }}>
          <Loader2 size={18} style={{ animation: 'spin 0.7s linear infinite' }} /> Chargement...
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <TopBar title={client.name} subtitle={client.type} />
      <main style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '960px', width: '100%' }}>

        {/* Header nav */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => navigate('/clients')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer', padding: 0 }}>
            <ArrowLeft size={15} /> Retour aux clients
          </button>
          <div style={{ display: 'flex', gap: '8px' }}>
            {editing ? (
              <>
                <Button variant="ghost" icon={X} onClick={() => { setEditing(false); setError(null) }}>Annuler</Button>
                <Button variant="primary" icon={saving ? Loader2 : Save} disabled={saving} onClick={handleSave}>
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </>
            ) : (
              <>
                <Button variant="secondary" icon={Edit2} onClick={() => setEditing(true)}>Modifier</Button>
                <Button variant="danger" icon={Trash2} onClick={() => setConfirmDelete(true)}>Supprimer</Button>
              </>
            )}
          </div>
        </div>

        {error && (
          <div style={{ background: '#ef444422', border: '1px solid #ef444444', borderRadius: 'var(--radius-sm)', color: 'var(--error)', fontSize: '13px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={14} /> {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px', alignItems: 'start' }}>

          {/* Left — fiche */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Infos principales */}
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'var(--brand-muted)', border: '1px solid var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '700', color: 'var(--brand)', flexShrink: 0 }}>
                  {client.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  {editing ? (
                    <input value={form.name} onChange={e => set('name', e.target.value)} style={{ ...inputStyle, fontSize: '18px', fontWeight: '600', marginBottom: '4px' }} />
                  ) : (
                    <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>{client.name}</h2>
                  )}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {editing ? (
                      <>
                        <select value={form.type} onChange={e => set('type', e.target.value)} style={{ ...inputStyle, padding: '3px 8px', fontSize: '12px' }}>
                          {CLIENT_TYPES.map(t => <option key={t}>{t}</option>)}
                        </select>
                        <select value={form.status} onChange={e => set('status', e.target.value)} style={{ ...inputStyle, padding: '3px 8px', fontSize: '12px' }}>
                          <option value="prospect">Prospect</option>
                          <option value="actif">Actif</option>
                        </select>
                      </>
                    ) : (
                      <>
                        <Badge variant="default">{client.type}</Badge>
                        <Badge variant={client.status === 'actif' ? 'green' : 'info'}>{client.status === 'actif' ? 'Actif' : 'Prospect'}</Badge>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <InfoField label="Email" icon={Mail} editing={editing} value={form.email} onChange={v => set('email', v)} display={client.email} placeholder="client@mail.fr" type="email" />
                <InfoField label="Téléphone" icon={Phone} editing={editing} value={form.phone} onChange={v => set('phone', v)} display={client.phone} placeholder="06 00 00 00 00" />
                <InfoField label="Ville" icon={MapPin} editing={editing} value={form.ville} onChange={v => set('ville', v)} display={client.ville} placeholder="Lyon" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}><Building2 size={12} /> Client depuis</span>
                  <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                    {new Date(client.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>

              {(editing || client.notes) && (
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Notes</label>
                  {editing ? (
                    <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} placeholder="Informations, préférences, contexte..." style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit', width: '100%' }} />
                  ) : (
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{client.notes}</p>
                  )}
                </div>
              )}
            </Card>

            {/* Devis */}
            <Card style={{ padding: 0 }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={14} style={{ color: 'var(--text-muted)' }} />
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>Devis</h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: 'auto' }}>{devis.length} document{devis.length !== 1 ? 's' : ''}</span>
              </div>
              {devis.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>Aucun devis pour ce client.</div>
              ) : (
                devis.map((d, i) => {
                  const sm = statusMap[d.statut] ?? statusMap.brouillon
                  return (
                    <div key={d.id} style={{ display: 'flex', alignItems: 'center', padding: '12px 20px', borderBottom: i < devis.length - 1 ? '1px solid var(--border)' : 'none', gap: '12px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', color: 'var(--brand)', marginBottom: '2px' }}>{d.reference}</div>
                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{d.objet}</div>
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{d.montant_ht?.toLocaleString('fr-FR')} €</div>
                      <Badge variant={sm.variant}>{sm.label}</Badge>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {new Date(d.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  )
                })
              )}
            </Card>

            {/* Chantiers */}
            <Card style={{ padding: 0 }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HardHat size={14} style={{ color: 'var(--text-muted)' }} />
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>Chantiers</h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: 'auto' }}>{chantiers.length} chantier{chantiers.length !== 1 ? 's' : ''}</span>
              </div>
              {chantiers.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>Aucun chantier pour ce client.</div>
              ) : (
                chantiers.map((c, i) => {
                  const cs = chantierStatusMap[c.status] ?? chantierStatusMap.planifie
                  return (
                    <div key={c.id} style={{ display: 'flex', alignItems: 'center', padding: '12px 20px', borderBottom: i < chantiers.length - 1 ? '1px solid var(--border)' : 'none', gap: '12px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '2px' }}>{c.name}</div>
                        {c.description && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{c.description}</div>}
                        <div style={{ marginTop: '6px', height: '3px', background: 'var(--surface-3)', borderRadius: '2px', maxWidth: '200px' }}>
                          <div style={{ height: '100%', width: `${c.progress}%`, background: c.progress > 70 ? 'var(--brand)' : 'var(--info)', borderRadius: '2px' }} />
                        </div>
                      </div>
                      {c.deadline && (
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={11} />
                          {new Date(c.deadline).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                      <Badge variant={cs.variant}>{cs.label}</Badge>
                    </div>
                  )
                })
              )}
            </Card>
          </div>

          {/* Right — stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: 'CA total', value: caTotal > 0 ? `${caTotal.toLocaleString('fr-FR')} €` : '—', icon: Euro, color: 'var(--brand)' },
              { label: 'Devis envoyés', value: devis.length, icon: FileText, color: 'var(--info)' },
              { label: 'Devis acceptés', value: devisAcceptes, icon: FileText, color: 'var(--success)' },
              { label: 'Chantiers', value: chantiers.length, icon: HardHat, color: 'var(--warning)' },
            ].map(s => (
              <Card key={s.label}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: s.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <s.icon size={16} style={{ color: s.color }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>{s.label}</div>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{s.value}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>

      {/* Confirm delete */}
      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, background: '#00000088', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: '12px', padding: '32px', width: '100%', maxWidth: '400px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#ef444422', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Trash2 size={18} style={{ color: 'var(--error)' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>Supprimer ce client ?</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Cette action est irréversible.</p>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.6 }}>
              Le client <strong style={{ color: 'var(--text-primary)' }}>{client.name}</strong> et toutes ses données associées seront supprimés définitivement.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setConfirmDelete(false)} style={{ flex: 1, padding: '9px', background: 'transparent', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', fontSize: '14px', cursor: 'pointer' }}>
                Annuler
              </button>
              <button onClick={handleDelete} disabled={deleting} style={{ flex: 1, padding: '9px', background: 'var(--error)', border: 'none', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                {deleting && <Loader2 size={14} style={{ animation: 'spin 0.7s linear infinite' }} />}
                {deleting ? 'Suppression...' : 'Supprimer définitivement'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function InfoField({ label, icon: Icon, editing, value, onChange, display, placeholder, type = 'text' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
        <Icon size={12} /> {label}
      </span>
      {editing ? (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={inputStyle} />
      ) : (
        <span style={{ fontSize: '14px', color: display ? 'var(--text-primary)' : 'var(--text-muted)' }}>
          {display ?? '—'}
        </span>
      )}
    </div>
  )
}

const inputStyle = {
  background: 'var(--surface-2)',
  border: '1px solid var(--border-strong)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--text-primary)',
  fontSize: '14px',
  padding: '7px 10px',
  width: '100%',
}
