import { useEffect, useState } from 'react'
import TopBar from '../components/layout/TopBar'
import StatCard from '../components/ui/StatCard'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import {
  Euro, HardHat, Users, FileText,
  AlertTriangle, Mic, Camera, Zap,
  CloudRain, CheckCircle2, Clock, ArrowRight
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function Dashboard() {
  const { user, profile } = useAuth()
  const [data, setData] = useState({
    chantiers: [], relances: [], clients: 0, devis: [],
    caTotal: 0, loading: true,
  })

  useEffect(() => {
    if (!user) return
    let cancelled = false
    async function fetchDashboard() {
      const [
        { data: chantiers },
        { data: relances },
        { count: clientsCount },
        { data: devis },
      ] = await Promise.all([
        supabase.from('chantiers').select('*, clients(name)').eq('user_id', user.id).in('status', ['en_cours', 'planifie']).order('deadline', { ascending: true }),
        supabase.from('relances').select('*, devis(reference, objet, montant_ht), clients(name)').eq('user_id', user.id).neq('status', 'sent').order('created_at', { ascending: false }).limit(5),
        supabase.from('clients').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('devis').select('montant_ht, statut, created_at').eq('user_id', user.id),
      ])
      if (cancelled) return
      const thisMonth = new Date()
      thisMonth.setDate(1); thisMonth.setHours(0, 0, 0, 0)
      const caTotal = (devis ?? [])
        .filter(d => d.statut === 'accepte' && new Date(d.created_at) >= thisMonth)
        .reduce((s, d) => s + (d.montant_ht ?? 0), 0)
      setData({
        chantiers: chantiers ?? [],
        relances: relances ?? [],
        clients: clientsCount ?? 0,
        devis: devis ?? [],
        caTotal,
        loading: false,
      })
    }
    fetchDashboard()
    return () => { cancelled = true }
  }, [user?.id])

  const enAttenteDevis = data.devis.filter(d => d.statut === 'en_attente').length
  const chantiersActifs = data.chantiers.filter(c => c.status === 'en_cours').length

  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const greeting = profile?.company_name ? `${profile.company_name}` : user?.email?.split('@')[0]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <TopBar title="Dashboard" subtitle={`Bonjour, ${greeting} — ${today}`} />
      <main style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          <StatCard label="CA ce mois" value={data.caTotal > 0 ? `${data.caTotal.toLocaleString('fr-FR')} €` : '—'} icon={Euro} accent />
          <StatCard label="Chantiers actifs" value={chantiersActifs} icon={HardHat} />
          <StatCard label="Devis en attente" value={enAttenteDevis} icon={FileText} />
          <StatCard label="Clients" value={data.clients} icon={Users} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '16px', flex: 1 }}>

          {/* Left */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Chantiers */}
            <Card style={{ padding: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <h2 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>Chantiers actifs</h2>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '1px' }}>{chantiersActifs} en cours</p>
                </div>
                <Button variant="secondary" size="sm" icon={ArrowRight}>Voir tous</Button>
              </div>
              {data.loading ? (
                <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>Chargement...</div>
              ) : data.chantiers.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center' }}>
                  <HardHat size={24} style={{ color: 'var(--text-muted)', margin: '0 auto 8px' }} />
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Aucun chantier en cours.</p>
                </div>
              ) : (
                data.chantiers.map((c, i) => <ChantierRow key={c.id} chantier={c} last={i === data.chantiers.length - 1} />)
              )}
            </Card>

            {/* Relances */}
            <Card style={{ padding: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h2 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>Relances intelligentes</h2>
                  <Badge variant="green">IA</Badge>
                </div>
                <Button variant="secondary" size="sm">Configurer</Button>
              </div>
              {data.loading ? (
                <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>Chargement...</div>
              ) : data.relances.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center' }}>
                  <Zap size={24} style={{ color: 'var(--text-muted)', margin: '0 auto 8px' }} />
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Aucune relance en attente.</p>
                </div>
              ) : (
                data.relances.map((r, i) => <RelanceRow key={r.id} relance={r} last={i === data.relances.length - 1} />)
              )}
            </Card>
          </div>

          {/* Right */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Ivy AI Actions */}
            <Card glow style={{ background: '#0f0f0f', border: '1px solid #3ecf8e33' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <div style={{ width: '24px', height: '24px', background: 'var(--brand)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: '#000' }}>I</div>
                <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>Actions Ivy IA</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <AIAction icon={Mic} label="Mémo vocal" desc="Dicter une note, tâche ou MAJ de chantier" color="var(--brand)" />
                <AIAction icon={Camera} label="Vision Devis" desc="Analyser une photo pour générer un devis" color="var(--info)" />
                <AIAction icon={Zap} label="Relance auto" desc="Lancer les relances intelligentes du jour" color="var(--warning)" />
                <AIAction icon={FileText} label="Scan facture" desc="Extraire les données d'une facture fournisseur" color="#a855f7" />
              </div>
            </Card>

            {/* Aperçu profil */}
            {profile?.company_name && (
              <Card>
                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Votre entreprise</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { label: 'Entreprise', value: profile.company_name },
                    { label: 'Domaine', value: profile.domain },
                    { label: 'Localisation', value: profile.location },
                    { label: "Rayon d'action", value: profile.work_radius_km ? `${profile.work_radius_km} km` : null },
                  ].filter(i => i.value).map(item => (
                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function ChantierRow({ chantier, last }) {
  const statusColors = { en_cours: 'green', planifie: 'info', termine: 'default', annule: 'error' }
  const statusLabels = { en_cours: 'En cours', planifie: 'Planifié', termine: 'Terminé', annule: 'Annulé' }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 20px', borderBottom: last ? 'none' : '1px solid var(--border)', transition: 'background 0.15s' }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{chantier.name}</span>
          {chantier.alert && <AlertTriangle size={12} style={{ color: 'var(--warning)', flexShrink: 0 }} />}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{chantier.clients?.name ?? '—'}</div>
        <div style={{ marginTop: '6px', height: '3px', background: 'var(--surface-3)', borderRadius: '2px' }}>
          <div style={{ height: '100%', width: `${chantier.progress}%`, background: chantier.progress > 70 ? 'var(--brand)' : 'var(--info)', borderRadius: '2px', transition: 'width 0.3s ease' }} />
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <Badge variant={statusColors[chantier.status]}>{statusLabels[chantier.status]}</Badge>
        {chantier.deadline && (
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            <Clock size={10} style={{ display: 'inline', marginRight: '3px' }} />
            {new Date(chantier.deadline).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
          </div>
        )}
      </div>
    </div>
  )
}

function RelanceRow({ relance, last }) {
  const urgencyMap = { urgent: 'error', pending: 'warning', new: 'info', paused: 'default' }
  const age = relance.devis?.sent_at
    ? Math.floor((Date.now() - new Date(relance.devis.sent_at)) / 86400000)
    : null
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', borderBottom: last ? 'none' : '1px solid var(--border)' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>{relance.clients?.name ?? '—'}</div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          {relance.devis?.montant_ht ? `${relance.devis.montant_ht.toLocaleString('fr-FR')} €` : '—'} · via {relance.canal}
        </div>
      </div>
      {age !== null && <Badge variant={urgencyMap[relance.status] ?? 'default'}>J+{age}</Badge>}
      <button style={{ padding: '5px 10px', background: 'var(--brand)', color: '#000', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
        Envoyer
      </button>
    </div>
  )
}

function AIAction({ icon: Icon, label, desc, color }) {
  return (
    <button style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.15s' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-3)'; e.currentTarget.style.borderColor = 'var(--border-strong)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.borderColor = 'var(--border)' }}
    >
      <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: color + '22', border: `1px solid ${color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={15} style={{ color }} />
      </div>
      <div>
        <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{label}</div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{desc}</div>
      </div>
    </button>
  )
}
