import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import TopBar from '../components/layout/TopBar'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { Users, Plus, Search, Phone, Mail, MapPin, HardHat, Euro, ChevronRight, Loader2, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const CLIENT_TYPES = ['Particulier', 'Société', 'Copropriété']

export default function Clients() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('Tous')
  const [showModal, setShowModal] = useState(false)

  async function reloadClients() {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('clients')
      .select('*, devis(id, montant_ht), chantiers(id)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setClients(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    if (!user) return
    let cancelled = false
    async function fetchClients() {
      setLoading(true)
      const { data } = await supabase
        .from('clients')
        .select('*, devis(id, montant_ht), chantiers(id)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (cancelled) return
      setClients(data ?? [])
      setLoading(false)
    }
    fetchClients()
    return () => { cancelled = true }
  }, [user?.id])

  const filtered = clients.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'Tous' ||
      (filter === 'Actifs' && c.status === 'actif') ||
      (filter === 'Prospects' && c.status === 'prospect')
    return matchSearch && matchFilter
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <TopBar title="Clients" subtitle={`${clients.length} contact${clients.length !== 1 ? 's' : ''}`} />
      <main style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'var(--surface-2)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', padding: '8px 12px',
            flex: 1, maxWidth: '360px',
          }}>
            <Search size={14} style={{ color: 'var(--text-muted)' }} />
            <input
              placeholder="Rechercher un client..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '14px', color: 'var(--text-primary)', width: '100%' }}
            />
          </div>
          {['Tous', 'Actifs', 'Prospects'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '7px 14px',
              background: filter === f ? 'var(--surface-2)' : 'transparent',
              border: `1px solid ${filter === f ? 'var(--border-strong)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-sm)', fontSize: '13px',
              color: filter === f ? 'var(--text-primary)' : 'var(--text-secondary)',
              cursor: 'pointer',
            }}>{f}</button>
          ))}
          <Button variant="primary" icon={Plus} style={{ marginLeft: 'auto' }} onClick={() => setShowModal(true)}>
            Nouveau client
          </Button>
        </div>

        <Card style={{ padding: 0 }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px', gap: '10px', color: 'var(--text-muted)' }}>
              <Loader2 size={18} style={{ animation: 'spin 0.7s linear infinite' }} /> Chargement...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 24px' }}>
              <Users size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
              <p style={{ fontSize: '15px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>
                {search || filter !== 'Tous' ? 'Aucun résultat' : 'Aucun client encore'}
              </p>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                {search || filter !== 'Tous' ? 'Modifiez vos filtres.' : 'Ajoutez votre premier client pour commencer.'}
              </p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Client', 'Type', 'Localisation', 'Contact', 'Chantiers', 'CA total', 'Statut', ''].map((h, i) => (
                    <th key={i} style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '500', color: 'var(--text-muted)', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => {
                  const ca = (c.devis ?? []).reduce((s, d) => s + (d.montant_ht ?? 0), 0)
                  const nbChantiers = (c.chantiers ?? []).length
                  return (
                    <tr key={c.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 0.15s', cursor: 'pointer' }}
                      onClick={() => navigate(`/clients/${c.id}`)}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'var(--brand-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '600', color: 'var(--brand)', flexShrink: 0 }}>
                            {c.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>{c.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}><Badge variant="default" size="sm">{c.type}</Badge></td>
                      <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {c.ville ? <><MapPin size={12} style={{ display: 'inline', marginRight: '4px', color: 'var(--text-muted)' }} />{c.ville}</> : '—'}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {c.phone && <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}><Phone size={11} style={{ display: 'inline', marginRight: '4px' }} />{c.phone}</div>}
                        {c.email && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}><Mail size={11} style={{ display: 'inline', marginRight: '4px' }} />{c.email}</div>}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center' }}>
                        <HardHat size={12} style={{ display: 'inline', marginRight: '4px', color: 'var(--text-muted)' }} />{nbChantiers}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                        {ca > 0 ? <><Euro size={12} style={{ display: 'inline', marginRight: '2px', color: 'var(--text-muted)' }} />{ca.toLocaleString('fr-FR')} €</> : '—'}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <Badge variant={c.status === 'actif' ? 'green' : 'info'}>{c.status === 'actif' ? 'Actif' : 'Prospect'}</Badge>
                      </td>
                      <td style={{ padding: '14px 16px' }}><ChevronRight size={14} style={{ color: 'var(--text-muted)' }} /></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </Card>
      </main>

      {showModal && <ClientModal onClose={() => setShowModal(false)} onSaved={reloadClients} userId={user.id} />}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function ClientModal({ onClose, onSaved, userId }) {
  const [form, setForm] = useState({ name: '', type: 'Particulier', email: '', phone: '', ville: '', status: 'prospect' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function set(k, v) { setForm(p => ({ ...p, [k]: v })) }

  async function handleSave(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await supabase.from('clients').insert({ ...form, user_id: userId })
    setLoading(false)
    if (error) { setError(error.message); return }
    onSaved()
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#00000088', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: '12px', padding: '32px', width: '100%', maxWidth: '440px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>Nouveau client</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
        </div>
        {error && <div style={{ background: '#ef444422', border: '1px solid #ef444444', borderRadius: 'var(--radius-sm)', color: 'var(--error)', fontSize: '13px', padding: '10px 12px', marginBottom: '16px' }}>{error}</div>}
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Field label="Nom *">
            <input required value={form.name} onChange={e => set('name', e.target.value)} placeholder="M. Dupont" style={inputStyle} />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Field label="Type">
              <select value={form.type} onChange={e => set('type', e.target.value)} style={inputStyle}>
                {CLIENT_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Statut">
              <select value={form.status} onChange={e => set('status', e.target.value)} style={inputStyle}>
                <option value="prospect">Prospect</option>
                <option value="actif">Actif</option>
              </select>
            </Field>
          </div>
          <Field label="Email">
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="client@mail.fr" style={inputStyle} />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Field label="Téléphone">
              <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="06 00 00 00 00" style={inputStyle} />
            </Field>
            <Field label="Ville">
              <input value={form.ville} onChange={e => set('ville', e.target.value)} placeholder="Lyon" style={inputStyle} />
            </Field>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '9px', background: 'transparent', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', fontSize: '14px', cursor: 'pointer' }}>Annuler</button>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: '9px', background: 'var(--brand)', border: 'none', borderRadius: 'var(--radius-sm)', color: '#000', fontSize: '14px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              {loading && <Loader2 size={14} style={{ animation: 'spin 0.7s linear infinite' }} />}
              {loading ? 'Enregistrement...' : 'Créer le client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <label style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)' }}>{label}</label>
      {children}
    </div>
  )
}

const inputStyle = {
  width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border-strong)',
  borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '14px', padding: '8px 10px',
}
