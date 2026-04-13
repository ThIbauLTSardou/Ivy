import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRefetchOnFocus } from '../hooks/useRefetchOnFocus'
import TopBar from '../components/layout/TopBar'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import {
  FileText, Plus, Eye, Send, MoreHorizontal, Loader2,
  BookOpen, Pencil, Trash2, X, Package, ChevronDown, ChevronRight,
  FolderPlus, Folder, FolderOpen, Link2, Unlink, Paintbrush
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const statusMap = {
  brouillon:  { label: 'Brouillon',  variant: 'default' },
  en_attente: { label: 'En attente', variant: 'warning' },
  accepte:    { label: 'Accepté',    variant: 'green' },
  refuse:     { label: 'Refusé',     variant: 'error' },
  facture:    { label: 'Facturé',    variant: 'info' },
}

const FILTERS = ['Tous', 'En attente', 'Acceptés', 'Refusés']
const TVA_OPTIONS = [0, 5.5, 10, 20]
const UNITE_OPTIONS = ['forfait', 'm²', 'm³', 'm', 'ml', 'h', 'jour', 'u', 'kg', 't', 'L']

export default function Devis() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('devis')

  // Devis
  const [devis, setDevis] = useState([])
  const [loadingDevis, setLoadingDevis] = useState(true)
  const [filter, setFilter] = useState('Tous')

  // Bibliothèque
  const [groupes, setGroupes] = useState([])   // type='groupe'
  const [items, setItems] = useState([])        // type='item'
  const [liens, setLiens] = useState([])        // groupe_prestations
  const [loadingPrestations, setLoadingPrestations] = useState(true)
  const [expandedGroupes, setExpandedGroupes] = useState({})
  const [modal, setModal] = useState(null)
  const [draggingItemId, setDraggingItemId] = useState(null)
  const [dragOverGroupeId, setDragOverGroupeId] = useState(null)

  const fetchDevis = useCallback(async ({ silent = false } = {}) => {
    if (!user) return
    if (!silent) setLoadingDevis(true)
    const { data } = await supabase.from('devis').select('*, clients(name)')
      .eq('user_id', user.id).order('created_at', { ascending: false })
    setDevis(data ?? [])
    setLoadingDevis(false)
  }, [user?.id])

  const fetchBiblio = useCallback(async ({ silent = false } = {}) => {
    if (!user) return
    if (!silent) setLoadingPrestations(true)
    const [{ data: prestData }, { data: liensData }] = await Promise.all([
      supabase.from('prestations').select('*').eq('user_id', user.id).order('designation'),
      supabase.from('groupe_prestations').select('*').eq('user_id', user.id).order('ordre'),
    ])
    const all = prestData ?? []
    setGroupes(all.filter(p => p.type === 'groupe'))
    setItems(all.filter(p => p.type === 'item'))
    setLiens(liensData ?? [])
    setLoadingPrestations(false)
  }, [user?.id])

  useEffect(() => { fetchDevis() }, [fetchDevis])
  useEffect(() => { fetchBiblio() }, [fetchBiblio])
  useRefetchOnFocus(fetchDevis, { silent: true })
  useRefetchOnFocus(fetchBiblio, { silent: true })

  const reloadBiblio = fetchBiblio

  async function deletePrestation(id) {
    await supabase.from('prestations').delete().eq('id', id)
    reloadBiblio()
  }

  async function removeLienFromGroupe(groupeId, itemId) {
    await supabase.from('groupe_prestations')
      .delete().eq('groupe_id', groupeId).eq('item_id', itemId)
    reloadBiblio()
  }

  async function addItemToGroupe(groupeId, itemId) {
    const dejaPresent = liens.some(l => l.groupe_id === groupeId && l.item_id === itemId)
    if (dejaPresent) return
    await supabase.from('groupe_prestations').insert({ user_id: user.id, groupe_id: groupeId, item_id: itemId, ordre: 0 })
    reloadBiblio()
  }

  function toggleGroupe(id) {
    setExpandedGroupes(prev => ({ ...prev, [id]: !prev[id] }))
  }

  function getItemsOfGroupe(groupeId) {
    const itemIds = liens.filter(l => l.groupe_id === groupeId).map(l => l.item_id)
    return itemIds.map(id => items.find(i => i.id === id)).filter(Boolean)
  }

  const filtered = devis.filter(d => {
    if (filter === 'Tous') return true
    if (filter === 'En attente') return d.statut === 'en_attente'
    if (filter === 'Acceptés') return d.statut === 'accepte'
    if (filter === 'Refusés') return d.statut === 'refuse'
    return true
  })

  const enAttente = devis.filter(d => d.statut === 'en_attente')
  const caPotentiel = enAttente.reduce((s, d) => s + (d.montant_ht ?? 0), 0)
  const acceptes = devis.filter(d => d.statut === 'accepte')
  const total = devis.filter(d => d.statut !== 'brouillon').length
  const tauxAcceptation = total > 0 ? Math.round((acceptes.length / total) * 100) : 0

  function ageLabel(d) {
    if (!d.sent_at) return null
    return Math.floor((Date.now() - new Date(d.sent_at)) / 86400000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <TopBar title="Devis" subtitle={`${devis.length} document${devis.length !== 1 ? 's' : ''}`} />
      <main className="devis-main" style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Stats */}
        <div className="devis-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          {[
            { label: 'En attente', value: enAttente.length, color: 'var(--warning)' },
            { label: 'Acceptés ce mois', value: acceptes.length, color: 'var(--brand)' },
            { label: 'CA potentiel', value: caPotentiel > 0 ? `${(caPotentiel / 1000).toFixed(1)}k €` : '—', color: 'var(--text-primary)' },
            { label: "Taux d'acceptation", value: total > 0 ? `${tauxAcceptation}%` : '—', color: 'var(--brand)' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--surface-1)', padding: '16px 20px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>{s.label}</div>
              <div style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '-0.02em', color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="devis-tabs-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '2px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '3px' }}>
            {[{ key: 'devis', label: 'Devis', icon: FileText }, { key: 'prestations', label: 'Mes prestations', icon: BookOpen }].map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setTab(key)} style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '4px', border: 'none',
                background: tab === key ? 'var(--surface-1)' : 'transparent',
                color: tab === key ? 'var(--text-primary)' : 'var(--text-muted)',
                fontSize: '13px', fontWeight: tab === key ? '500' : '400',
                cursor: 'pointer', boxShadow: tab === key ? '0 1px 3px #0002' : 'none', transition: 'all 0.15s',
              }}>
                <Icon size={13} />{label}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => navigate('/devis/personnaliser')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', fontSize: '13px', cursor: 'pointer', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}>
              <Paintbrush size={13} />Personnaliser
            </button>
            {tab === 'devis' ? (
              <Button variant="primary" icon={Plus} onClick={() => navigate('/devis/nouveau')}>Nouveau devis</Button>
            ) : (
              <>
                <Button variant="secondary" icon={FolderPlus} onClick={() => setModal({ mode: 'groupe' })}>Nouveau groupe</Button>
                <Button variant="primary" icon={Plus} onClick={() => setModal({ mode: 'item' })}>Nouvelle prestation</Button>
              </>
            )}
          </div>
        </div>

        {/* Tab Devis */}
        {tab === 'devis' && (
          <>
            <div className="devis-filters" style={{ display: 'flex', gap: '6px' }}>
              {FILTERS.map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  padding: '5px 12px', background: filter === f ? 'var(--surface-2)' : 'transparent',
                  border: `1px solid ${filter === f ? 'var(--border-strong)' : 'var(--border)'}`,
                  borderRadius: '4px', fontSize: '13px',
                  color: filter === f ? 'var(--text-primary)' : 'var(--text-secondary)', cursor: 'pointer',
                }}>{f}</button>
              ))}
            </div>
            <Card style={{ padding: 0 }}>
              {loadingDevis ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px', gap: '10px', color: 'var(--text-muted)' }}>
                  <Loader2 size={18} style={{ animation: 'spin 0.7s linear infinite' }} /> Chargement...
                </div>
              ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 24px' }}>
                  <FileText size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
                  <p style={{ fontSize: '15px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>{filter !== 'Tous' ? 'Aucun résultat' : 'Aucun devis encore'}</p>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{filter !== 'Tous' ? 'Modifiez le filtre.' : 'Créez votre premier devis.'}</p>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {[
                        { label: 'Référence', cls: '' },
                        { label: 'Client', cls: '' },
                        { label: 'Objet', cls: 'devis-table-col-objet' },
                        { label: 'Montant HT', cls: 'devis-table-col-montant' },
                        { label: 'Date', cls: 'devis-table-col-date' },
                        { label: 'Ancienneté', cls: 'devis-table-col-anciennete' },
                        { label: 'Statut', cls: '' },
                        { label: 'Actions', cls: '' },
                      ].map(({ label, cls }) => (
                        <th key={label} className={cls} style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '500', color: 'var(--text-muted)', textAlign: 'left' }}>{label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((d, i) => {
                      const sm = statusMap[d.statut] ?? statusMap.brouillon
                      const age = ageLabel(d)
                      return (
                        <tr key={d.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none', cursor: 'pointer', transition: 'background 0.15s' }}
                          onClick={() => navigate(`/devis/${d.id}`)}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <td style={{ padding: '14px 16px' }}><span style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', color: 'var(--brand)' }}>{d.reference}</span></td>
                          <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>{d.clients?.name ?? '—'}</td>
                          <td className="devis-table-col-objet" style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--text-secondary)' }}>{d.objet}</td>
                          <td className="devis-table-col-montant" style={{ padding: '14px 16px', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{d.montant_ht?.toLocaleString('fr-FR')} €</td>
                          <td className="devis-table-col-date" style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--text-muted)' }}>{new Date(d.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</td>
                          <td className="devis-table-col-anciennete" style={{ padding: '14px 16px' }}>
                            {age === null ? <span style={{ fontSize: '12px', color: 'var(--brand)' }}>Brouillon</span>
                              : age > 7 && d.statut === 'en_attente' ? <span style={{ fontSize: '12px', color: 'var(--error)', fontWeight: '500' }}>J+{age}</span>
                              : age > 0 ? <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>J+{age}</span>
                              : <span style={{ fontSize: '12px', color: 'var(--brand)' }}>Nouveau</span>}
                          </td>
                          <td style={{ padding: '14px 16px' }}><Badge variant={sm.variant}>{sm.label}</Badge></td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button style={{ padding: '4px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><Eye size={14} /></button>
                              <button style={{ padding: '4px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><Send size={14} /></button>
                              <button style={{ padding: '4px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><MoreHorizontal size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </Card>
          </>
        )}

        {/* Tab Prestations — deux colonnes */}
        {tab === 'prestations' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'start' }}>

            {/* Colonne gauche : Items (racine) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>Prestations</h3>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Faites glisser dans un groupe pour les associer</p>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'var(--surface-2)', padding: '2px 8px', borderRadius: '10px', border: '1px solid var(--border)' }}>{items.length}</span>
              </div>
              <Card style={{ padding: 0 }}>
                {loadingPrestations ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', gap: '8px', color: 'var(--text-muted)' }}>
                    <Loader2 size={16} style={{ animation: 'spin 0.7s linear infinite' }} />
                  </div>
                ) : items.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 16px' }}>
                    <Package size={24} style={{ color: 'var(--text-muted)', margin: '0 auto 8px' }} />
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>Aucune prestation</p>
                    <Button variant="secondary" size="sm" icon={Plus} onClick={() => setModal({ mode: 'item' })}>Créer</Button>
                  </div>
                ) : (
                  <div>
                    {items.map((item, idx) => (
                      <div key={item.id}
                        draggable
                        onDragStart={e => { e.dataTransfer.setData('itemId', item.id); setDraggingItemId(item.id) }}
                        onDragEnd={() => { setDraggingItemId(null); setDragOverGroupeId(null) }}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderBottom: idx < items.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 0.12s', cursor: 'grab' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.designation}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>
                            {item.unite} · {Number(item.prix_unitaire_ht).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} € HT · TVA {item.tva_taux}%
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
                          <button onClick={() => setModal({ mode: 'edit-item', data: item })} style={iconBtn}><Pencil size={12} /></button>
                          <button onClick={() => deletePrestation(item.id)} style={{ ...iconBtn, color: 'var(--error)' }}><Trash2 size={12} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Colonne droite : Groupes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>Groupes</h3>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Regroupez vos prestations par catégorie</p>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'var(--surface-2)', padding: '2px 8px', borderRadius: '10px', border: '1px solid var(--border)' }}>{groupes.length}</span>
              </div>

              {loadingPrestations ? null : groupes.length === 0 ? (
                <Card>
                  <div style={{ textAlign: 'center', padding: '24px 16px' }}>
                    <Folder size={24} style={{ color: 'var(--text-muted)', margin: '0 auto 8px' }} />
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>Aucun groupe</p>
                    <Button variant="secondary" size="sm" icon={FolderPlus} onClick={() => setModal({ mode: 'groupe' })}>Créer un groupe</Button>
                  </div>
                </Card>
              ) : (
                groupes.map(groupe => {
                  const enfants = getItemsOfGroupe(groupe.id)
                  const isOpen = expandedGroupes[groupe.id] ?? true
                  return (
                    <Card key={groupe.id} style={{ padding: 0, outline: dragOverGroupeId === groupe.id ? '2px solid var(--brand)' : 'none', transition: 'outline 0.1s' }}
                      onDragOver={e => { e.preventDefault(); setDragOverGroupeId(groupe.id) }}
                      onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) setDragOverGroupeId(null) }}
                      onDrop={e => { e.preventDefault(); const itemId = e.dataTransfer.getData('itemId'); if (itemId) addItemToGroupe(groupe.id, itemId); setDragOverGroupeId(null); setDraggingItemId(null) }}
                    >
                      {/* Header groupe */}
                      <div
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 14px', borderBottom: isOpen && enfants.length > 0 ? '1px solid var(--border)' : 'none', cursor: 'pointer', background: dragOverGroupeId === groupe.id ? 'var(--brand-muted)' : 'var(--surface-2)', transition: 'background 0.1s' }}
                        onClick={() => toggleGroupe(groupe.id)}
                      >
                        {isOpen ? <ChevronDown size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} /> : <ChevronRight size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />}
                        {isOpen ? <FolderOpen size={14} style={{ color: 'var(--brand)', flexShrink: 0 }} /> : <Folder size={14} style={{ color: 'var(--brand)', flexShrink: 0 }} />}
                        <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', flex: 1 }}>{groupe.designation}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'var(--surface-3)', padding: '1px 7px', borderRadius: '10px' }}>{enfants.length}</span>
                        <div style={{ display: 'flex', gap: '2px' }} onClick={e => e.stopPropagation()}>
                          <button onClick={() => setModal({ mode: 'add-to-groupe', groupeId: groupe.id })} style={iconBtn} title="Ajouter des prestations"><Link2 size={12} /></button>
                          <button onClick={() => setModal({ mode: 'edit-groupe', data: groupe })} style={iconBtn}><Pencil size={12} /></button>
                          <button onClick={() => deletePrestation(groupe.id)} style={{ ...iconBtn, color: 'var(--error)' }}><Trash2 size={12} /></button>
                        </div>
                      </div>

                      {/* Items du groupe */}
                      {isOpen && (
                        <div>
                          {enfants.length === 0 ? (
                            <div style={{ padding: '12px 14px', fontSize: '12px', color: dragOverGroupeId === groupe.id ? 'var(--brand)' : 'var(--text-muted)', textAlign: 'center', transition: 'color 0.1s' }}>
                              {dragOverGroupeId === groupe.id ? 'Déposer ici' : <>Glissez une prestation ici ou cliquez sur <Link2 size={11} style={{ display: 'inline', verticalAlign: 'middle' }} /></>}
                            </div>
                          ) : enfants.map((item, idx) => (
                            <div key={item.id}
                              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 14px', paddingLeft: '36px', borderBottom: idx < enfants.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 0.12s' }}
                              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.designation}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>
                                  {item.unite} · {Number(item.prix_unitaire_ht).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} € HT
                                </div>
                              </div>
                              <button
                                onClick={() => removeLienFromGroupe(groupe.id, item.id)}
                                style={{ ...iconBtn, color: 'var(--text-muted)' }}
                                title="Retirer du groupe"
                              ><Unlink size={12} /></button>
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>
                  )
                })
              )}
            </div>
          </div>
        )}
      </main>

      {modal?.mode === 'groupe' && (
        <GroupeModal userId={user.id} items={items} onClose={() => setModal(null)} onSaved={() => { setModal(null); reloadBiblio() }} />
      )}
      {modal?.mode === 'edit-groupe' && (
        <GroupeModal userId={user.id} groupe={modal.data} items={items} onClose={() => setModal(null)} onSaved={() => { setModal(null); reloadBiblio() }} />
      )}
      {(modal?.mode === 'item' || modal?.mode === 'edit-item') && (
        <ItemModal userId={user.id} item={modal.data}
          onClose={() => setModal(null)} onSaved={() => { setModal(null); reloadBiblio() }} />
      )}
      {modal?.mode === 'add-to-groupe' && (
        <AddToGroupeModal
          userId={user.id}
          groupeId={modal.groupeId}
          items={items}
          liens={liens}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); reloadBiblio() }}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// ─── Modale : ajouter des items dans un groupe ───────────────────────────────

function AddToGroupeModal({ userId, groupeId, items, liens, onClose, onSaved }) {
  const dejaDans = new Set(liens.filter(l => l.groupe_id === groupeId).map(l => l.item_id))
  const [selected, setSelected] = useState(new Set())
  const [loading, setLoading] = useState(false)

  function toggle(id) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function handleSave() {
    if (selected.size === 0) { onClose(); return }
    setLoading(true)
    const payload = [...selected].map((itemId, i) => ({
      user_id: userId, groupe_id: groupeId, item_id: itemId, ordre: i,
    }))
    await supabase.from('groupe_prestations').upsert(payload, { onConflict: 'groupe_id,item_id' })
    setLoading(false)
    onSaved()
  }

  const disponibles = items.filter(i => !dejaDans.has(i.id))

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#00000088', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: '12px', width: '100%', maxWidth: '440px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link2 size={15} style={{ color: 'var(--brand)' }} />
            <h2 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>Ajouter des prestations</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {disponibles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '13px' }}>
              Toutes les prestations sont déjà dans ce groupe.
            </div>
          ) : disponibles.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => toggle(item.id)}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', borderBottom: idx < disponibles.length - 1 ? '1px solid var(--border)' : 'none', cursor: 'pointer', background: selected.has(item.id) ? 'var(--brand-muted)' : 'transparent', transition: 'background 0.12s' }}
            >
              <div style={{ width: '16px', height: '16px', borderRadius: '4px', border: `2px solid ${selected.has(item.id) ? 'var(--brand)' : 'var(--border-strong)'}`, background: selected.has(item.id) ? 'var(--brand)' : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.12s' }}>
                {selected.has(item.id) && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>{item.designation}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.unite} · {Number(item.prix_unitaire_ht).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} € HT · TVA {item.tva_taux}%</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px' }}>
          <button onClick={onClose} style={cancelBtn}>Annuler</button>
          <button onClick={handleSave} disabled={loading || selected.size === 0} style={{ ...submitBtn, opacity: selected.size === 0 ? 0.5 : 1 }}>
            {loading && <Loader2 size={13} style={{ animation: 'spin 0.7s linear infinite' }} />}
            Ajouter {selected.size > 0 ? `(${selected.size})` : ''}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Modale groupe ────────────────────────────────────────────────────────────

function GroupeModal({ userId, groupe, items, onClose, onSaved }) {
  const [designation, setDesignation] = useState(groupe?.designation ?? '')
  const [selected, setSelected] = useState(new Set())
  const [loading, setLoading] = useState(false)

  function toggleItem(id) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!designation.trim()) return
    setLoading(true)
    if (groupe) {
      await supabase.from('prestations').update({ designation: designation.trim() }).eq('id', groupe.id)
    } else {
      const { data: newGroupe } = await supabase
        .from('prestations')
        .insert({ user_id: userId, type: 'groupe', designation: designation.trim(), unite: 'forfait', prix_unitaire_ht: 0, tva_taux: 20 })
        .select()
        .single()
      if (newGroupe && selected.size > 0) {
        const payload = [...selected].map((itemId, i) => ({
          user_id: userId, groupe_id: newGroupe.id, item_id: itemId, ordre: i,
        }))
        await supabase.from('groupe_prestations').insert(payload)
      }
    }
    setLoading(false)
    onSaved()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#00000088', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: '12px', width: '100%', maxWidth: '460px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Folder size={16} style={{ color: 'var(--brand)' }} />
            <h2 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>{groupe ? 'Modifier le groupe' : 'Nouveau groupe'}</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
        </div>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Field label="Nom du groupe *">
              <input autoFocus required value={designation} onChange={e => setDesignation(e.target.value)} placeholder="Ex : Électricité, Plomberie..." style={inp} />
            </Field>
          </div>

          {/* Sélection des prestations (création uniquement) */}
          {!groupe && items && items.length > 0 && (
            <>
              <div style={{ padding: '0 24px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)' }}>Prestations à inclure</span>
                {selected.size > 0 && <span style={{ fontSize: '11px', color: 'var(--brand)' }}>{selected.size} sélectionnée{selected.size > 1 ? 's' : ''}</span>}
              </div>
              <div style={{ flex: 1, overflowY: 'auto', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 20px', borderBottom: idx < items.length - 1 ? '1px solid var(--border)' : 'none', cursor: 'pointer', background: selected.has(item.id) ? 'var(--brand-muted,#ffd70011)' : 'transparent', transition: 'background 0.12s' }}
                  >
                    <div style={{ width: '16px', height: '16px', borderRadius: '4px', border: `2px solid ${selected.has(item.id) ? 'var(--brand)' : 'var(--border-strong)'}`, background: selected.has(item.id) ? 'var(--brand)' : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.12s' }}>
                      {selected.has(item.id) && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.designation}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>{item.unite} · {Number(item.prix_unitaire_ht).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} € HT · TVA {item.tva_taux}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <div style={{ padding: '16px 20px', display: 'flex', gap: '10px' }}>
            <button type="button" onClick={onClose} style={cancelBtn}>Annuler</button>
            <button type="submit" disabled={loading} style={submitBtn}>
              {loading && <Loader2 size={13} style={{ animation: 'spin 0.7s linear infinite' }} />}
              {groupe ? 'Modifier' : 'Créer le groupe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Modale item ──────────────────────────────────────────────────────────────

function ItemModal({ userId, item, onClose, onSaved }) {
  const [form, setForm] = useState({
    designation: item?.designation ?? '',
    description: item?.description ?? '',
    unite: item?.unite ?? 'forfait',
    prix_unitaire_ht: item?.prix_unitaire_ht ?? '',
    tva_taux: item?.tva_taux ?? 20,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function set(k, v) { setForm(p => ({ ...p, [k]: v })) }

  async function handleSave(evt) {
    evt.preventDefault()
    if (!form.designation.trim()) { setError('La désignation est obligatoire.'); return }
    setError(null)
    setLoading(true)
    const payload = {
      user_id: userId, type: 'item',
      designation: form.designation.trim(),
      description: form.description.trim() || null,
      unite: form.unite,
      prix_unitaire_ht: parseFloat(form.prix_unitaire_ht) || 0,
      tva_taux: parseFloat(form.tva_taux) || 20,
    }
    const { error: e } = item
      ? await supabase.from('prestations').update(payload).eq('id', item.id)
      : await supabase.from('prestations').insert(payload)
    setLoading(false)
    if (e) { setError(e.message); return }
    onSaved()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#00000088', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: '12px', padding: '28px', width: '100%', maxWidth: '480px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>{item ? 'Modifier la prestation' : 'Nouvelle prestation'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
        </div>
        {error && <div style={{ background: '#ef444422', border: '1px solid #ef444444', borderRadius: 'var(--radius-sm)', color: 'var(--error)', fontSize: '13px', padding: '10px 12px', marginBottom: '14px' }}>{error}</div>}
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Field label="Désignation *">
            <input autoFocus required value={form.designation} onChange={e => set('designation', e.target.value)} placeholder="Ex : Ampoule LED E27" style={inp} />
          </Field>
          <Field label="Description">
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2} placeholder="Détails complémentaires (optionnel)" style={{ ...inp, resize: 'vertical', fontFamily: 'inherit' }} />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <Field label="Unité">
              <select value={form.unite} onChange={e => set('unite', e.target.value)} style={inp}>
                {UNITE_OPTIONS.map(u => <option key={u}>{u}</option>)}
              </select>
            </Field>
            <Field label="Prix HT (€)">
              <input type="number" min="0" step="0.01" value={form.prix_unitaire_ht} onChange={e => set('prix_unitaire_ht', e.target.value)} placeholder="0.00" style={inp} />
            </Field>
            <Field label="TVA (%)">
              <select value={form.tva_taux} onChange={e => set('tva_taux', e.target.value)} style={inp}>
                {TVA_OPTIONS.map(t => <option key={t} value={t}>{t}%</option>)}
              </select>
            </Field>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button type="button" onClick={onClose} style={cancelBtn}>Annuler</button>
            <button type="submit" disabled={loading} style={submitBtn}>
              {loading && <Loader2 size={13} style={{ animation: 'spin 0.7s linear infinite' }} />}
              {item ? 'Modifier' : 'Créer'}
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

const inp = {
  width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border-strong)',
  borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '14px', padding: '8px 10px',
  outline: 'none', boxSizing: 'border-box',
}
const iconBtn = {
  padding: '4px', background: 'none', border: 'none', color: 'var(--text-muted)',
  cursor: 'pointer', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center',
}
const cancelBtn = {
  flex: 1, padding: '9px', background: 'transparent', border: '1px solid var(--border-strong)',
  borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', fontSize: '14px', cursor: 'pointer',
}
const submitBtn = {
  flex: 1, padding: '9px', background: 'var(--brand)', border: 'none', borderRadius: 'var(--radius-sm)',
  color: '#000', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
}
