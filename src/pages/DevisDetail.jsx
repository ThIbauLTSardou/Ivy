import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useRefetchOnFocus } from '../hooks/useRefetchOnFocus'
import TopBar from '../components/layout/TopBar'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import {
  ArrowLeft, Plus, Trash2, Save, Send, Eye, EyeOff,
  Loader2, AlertTriangle, GripVertical, ChevronDown, Printer, BookOpen, X, Search, Mic, MicOff, CheckCircle2,
  Folder, FolderOpen, ChevronRight, Package, ChevronUp
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const TVA_OPTIONS = [0, 5.5, 10, 20]
const UNITE_OPTIONS = ['forfait', 'm²', 'm³', 'm', 'ml', 'h', 'jour', 'u', 'kg', 't', 'L']
const LIGNE_TYPES = [
  { value: 'ligne', label: 'Ligne de prestation' },
  { value: 'titre', label: 'Titre de section' },
  { value: 'texte', label: 'Texte libre' },
  { value: 'sous_total', label: 'Sous-total' },
]

const statusMap = {
  brouillon:  { label: 'Brouillon',  variant: 'default' },
  en_attente: { label: 'En attente', variant: 'warning' },
  accepte:    { label: 'Accepté',    variant: 'green' },
  refuse:     { label: 'Refusé',     variant: 'error' },
  facture:    { label: 'Facturé',    variant: 'info' },
}

function newLigne(ordre = 0) {
  return {
    _id: crypto.randomUUID(),
    type: 'ligne',
    designation: '',
    description: '',
    unite: 'forfait',
    quantite: 1,
    prix_unitaire_ht: 0,
    tva_taux: 20,
    remise_pct: 0,
    ordre,
  }
}

export default function DevisDetail() {
  const { id } = useParams()
  const isNew = id === 'nouveau'
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const printRef = useRef()
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])

  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [preview, setPreview] = useState(false)
  const [showPrestations, setShowPrestations] = useState(false)
  const theme = { color: profile?.devis_couleur ?? '#18a96b', modele: profile?.devis_modele ?? 'classique' }

  // Voice
  const [voiceState, setVoiceState] = useState('idle') // idle | recording | processing | done | error
  const [voiceTranscription, setVoiceTranscription] = useState('')
  const [voiceError, setVoiceError] = useState('')

  // Infos générales du devis
  const [form, setForm] = useState({
    client_id: '',
    client_nom: '',
    client_adresse: '',
    client_email: '',
    client_phone: '',
    objet: '',
    lieu_travaux: '',
    description_travaux: '',
    date_emission: new Date().toISOString().slice(0, 10),
    date_validite: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    delai_realisation: '',
    tva_taux: 20,
    remise_pct: 0,
    acompte_pct: 30,
    conditions_paiement: 'Acompte de 30% à la commande, solde à réception des travaux.',
    statut: 'brouillon',
  })
  const [lignes, setLignes] = useState([newLigne(0)])

  const fetchDevis = useCallback(async ({ silent = false } = {}) => {
    if (!user || isNew) return
    if (!silent) setLoading(true)
    const [{ data: devisData }, { data: lignesData }] = await Promise.all([
      supabase.from('devis').select('*').eq('id', id).eq('user_id', user.id).single(),
      supabase.from('devis_lignes').select('*').eq('devis_id', id).order('ordre'),
    ])
    if (!devisData) { navigate('/devis'); return }
    setForm({
      client_id: devisData.client_id ?? '',
      client_nom: devisData.client_nom ?? '',
      client_adresse: devisData.client_adresse ?? '',
      client_email: devisData.client_email ?? '',
      client_phone: devisData.client_phone ?? '',
      objet: devisData.objet ?? '',
      lieu_travaux: devisData.lieu_travaux ?? '',
      description_travaux: devisData.description_travaux ?? '',
      date_emission: devisData.date_emission ?? new Date().toISOString().slice(0, 10),
      date_validite: devisData.date_validite ?? '',
      delai_realisation: devisData.delai_realisation ?? '',
      tva_taux: devisData.tva_taux ?? 20,
      remise_pct: devisData.remise_pct ?? 0,
      acompte_pct: devisData.acompte_pct ?? 30,
      conditions_paiement: devisData.conditions_paiement ?? '',
      statut: devisData.statut ?? 'brouillon',
    })
    setLignes(
      (lignesData ?? []).map(l => ({ ...l, _id: l.id })).length > 0
        ? (lignesData ?? []).map(l => ({ ...l, _id: l.id }))
        : [newLigne(0)]
    )
    setLoading(false)
  }, [id, user?.id])

  useEffect(() => {
    if (!user) return
    supabase.from('clients').select('id, name, email, phone, ville').eq('user_id', user.id).order('name')
      .then(({ data }) => setClients(data ?? []))
    fetchDevis()
  }, [fetchDevis])

  useRefetchOnFocus(fetchDevis, { silent: true })

  function setF(k, v) { setForm(p => ({ ...p, [k]: v })) }

  function onClientChange(clientId) {
    const c = clients.find(c => c.id === clientId)
    setForm(p => ({
      ...p,
      client_id: clientId,
      client_nom: c?.name ?? '',
      client_email: c?.email ?? '',
      client_phone: c?.phone ?? '',
      client_adresse: c?.ville ?? '',
    }))
  }

  function updateLigne(idx, k, v) {
    setLignes(prev => prev.map((l, i) => i === idx ? { ...l, [k]: v } : l))
  }
  function addLigne(type = 'ligne') {
    setLignes(prev => [...prev, { ...newLigne(prev.length), type }])
  }
  function removeLigne(idx) {
    setLignes(prev => prev.filter((_, i) => i !== idx))
  }

  // Calculs financiers
  const totaux = (() => {
    let ht = 0
    lignes.forEach(l => {
      if (l.type !== 'ligne') return
      const qte = parseFloat(l.quantite) || 0
      const pu = parseFloat(l.prix_unitaire_ht) || 0
      const remise = parseFloat(l.remise_pct) || 0
      ht += qte * pu * (1 - remise / 100)
    })
    const remise_globale = ht * ((parseFloat(form.remise_pct) || 0) / 100)
    const ht_apres_remise = ht - remise_globale
    const tva = ht_apres_remise * ((parseFloat(form.tva_taux) || 0) / 100)
    const ttc = ht_apres_remise + tva
    const acompte = ttc * ((parseFloat(form.acompte_pct) || 0) / 100)
    return { ht, remise_globale, ht_apres_remise, tva, ttc, acompte }
  })()

  async function startRecording() {
    setVoiceError('')
    setVoiceTranscription('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      audioChunksRef.current = []
      recorder.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data) }
      recorder.onstop = () => { stream.getTracks().forEach(t => t.stop()); processVoice() }
      mediaRecorderRef.current = recorder
      recorder.start()
      setVoiceState('recording')
    } catch {
      setVoiceError("Microphone inaccessible. Vérifiez les permissions.")
      setVoiceState('error')
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
      setVoiceState('processing')
    }
  }

  async function processVoice() {
    try {
      // Charger prestations, groupes, liens ET clients pour les passer au LLM
      const [{ data: prestations }, { data: liensData }, { data: clientsData }] = await Promise.all([
        supabase.from('prestations').select('*').eq('user_id', user.id).order('designation'),
        supabase.from('groupe_prestations').select('*').eq('user_id', user.id).order('ordre'),
        supabase.from('clients').select('id, name, email, phone, ville').eq('user_id', user.id).order('name'),
      ])

      const allPrestations = prestations ?? []
      const groupes = allPrestations.filter(p => p.type === 'groupe')
      const items = allPrestations.filter(p => p.type === 'item')
      const liens = liensData ?? []

      // Construire la structure groupes avec leurs items pour le LLM
      const groupesAvecItems = groupes.map(g => ({
        id: g.id,
        designation: g.designation,
        items: liens
          .filter(l => l.groupe_id === g.id)
          .sort((a, b) => a.ordre - b.ordre)
          .map(l => items.find(i => i.id === l.item_id))
          .filter(Boolean),
      }))

      const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
      const fd = new FormData()
      fd.append('audio', blob, 'audio.webm')
      fd.append('prestations', JSON.stringify(items))
      fd.append('groupes', JSON.stringify(groupesAvecItems))
      fd.append('clients', JSON.stringify(clientsData ?? []))

      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(
        'https://ubsmlouxaedzxocmccfd.supabase.co/functions/v1/devis-voice',
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${session.access_token}` },
          body: fd,
        }
      )

      const result = await res.json()
      if (!res.ok || result.error) throw new Error(result.error ?? 'Erreur serveur')

      const { transcription, extracted } = result
      setVoiceTranscription(transcription)

      // Remplir les champs du formulaire
      setForm(prev => {
        const next = { ...prev }
        if (extracted.objet) next.objet = extracted.objet
        if (extracted.lieu_travaux) next.lieu_travaux = extracted.lieu_travaux
        if (extracted.description_travaux) next.description_travaux = extracted.description_travaux
        if (extracted.delai_realisation) next.delai_realisation = extracted.delai_realisation

        // Client : priorité au match bibliothèque
        if (extracted.client_id) {
          const match = (clientsData ?? []).find(c => c.id === extracted.client_id)
          if (match) {
            next.client_id = match.id
            next.client_nom = match.name
            next.client_email = match.email ?? ''
            next.client_phone = match.phone ?? ''
            next.client_adresse = match.ville ?? ''
          }
        } else {
          if (extracted.client_nom) next.client_nom = extracted.client_nom
          if (extracted.client_adresse) next.client_adresse = extracted.client_adresse
        }
        return next
      })

      // Ajouter les lignes extraites (prestations + groupes/titres)
      if (extracted.lignes?.length > 0) {
        // Reconstruire les groupes bibliothèque depuis les données locales
        // (on skippe les lignes que le LLM a générées pour un groupe bibliothèque,
        //  car on va les reconstruire proprement depuis groupesAvecItems)
        const nouvLignes = []
        let skipUntilNextTitre = false

        for (const l of extracted.lignes) {
          if (l.type === 'titre') {
            skipUntilNextTitre = false

            if (l.from_library_group && l.library_group_id) {
              // Trouver le groupe dans la bibliothèque locale
              const groupe = groupesAvecItems.find(g => g.id === l.library_group_id)
              if (groupe) {
                // Titre du groupe
                nouvLignes.push({
                  _id: crypto.randomUUID(),
                  type: 'titre',
                  designation: groupe.designation,
                  description: '', unite: 'forfait', quantite: 1,
                  prix_unitaire_ht: 0, tva_taux: 20, remise_pct: 0,
                })
                // Items du groupe depuis la bibliothèque
                groupe.items.forEach(item => {
                  nouvLignes.push({
                    _id: crypto.randomUUID(),
                    type: 'ligne',
                    designation: item.designation,
                    description: item.description ?? '',
                    unite: item.unite ?? 'forfait',
                    quantite: 1,
                    prix_unitaire_ht: item.prix_unitaire_ht ?? 0,
                    tva_taux: item.tva_taux ?? 20,
                    remise_pct: 0,
                  })
                })
                // Ignorer les lignes suivantes que le LLM a générées pour ce groupe
                skipUntilNextTitre = true
                continue
              }
            }

            // Groupe libre (pas dans la bibliothèque)
            nouvLignes.push({
              _id: crypto.randomUUID(),
              type: 'titre',
              designation: l.designation,
              description: '', unite: 'forfait', quantite: 1,
              prix_unitaire_ht: 0, tva_taux: 20, remise_pct: 0,
            })
          } else {
            if (skipUntilNextTitre) continue
            nouvLignes.push({
              _id: crypto.randomUUID(),
              type: 'ligne',
              designation: l.designation,
              description: l.description ?? '',
              unite: l.unite ?? 'forfait',
              quantite: l.quantite ?? 1,
              prix_unitaire_ht: l.prix_unitaire_ht ?? 0,
              tva_taux: l.tva_taux ?? 20,
              remise_pct: l.remise_pct ?? 0,
            })
          }
        }

        setLignes(prev => {
          const base = prev.filter(l => l.designation.trim() !== '')
          return [...base, ...nouvLignes]
        })
      }

      setVoiceState('done')
      setTimeout(() => setVoiceState('idle'), 4000)
    } catch (err) {
      setVoiceError(err.message)
      setVoiceState('error')
    }
  }

  async function handleSave(newStatut) {
    if (!user) return
    setSaving(true)
    setError(null)
    const statut = newStatut ?? form.statut

    const devisPayload = {
      user_id: user.id,
      client_id: form.client_id || null,
      client_nom: form.client_nom,
      client_adresse: form.client_adresse,
      client_email: form.client_email,
      client_phone: form.client_phone,
      objet: form.objet,
      lieu_travaux: form.lieu_travaux,
      description_travaux: form.description_travaux,
      date_emission: form.date_emission,
      date_validite: form.date_validite,
      delai_realisation: form.delai_realisation,
      tva_taux: parseFloat(form.tva_taux),
      remise_pct: parseFloat(form.remise_pct) || 0,
      montant_ht: round2(totaux.ht_apres_remise),
      montant_remise: round2(totaux.remise_globale),
      montant_tva: round2(totaux.tva),
      montant_ttc: round2(totaux.ttc),
      acompte_pct: parseFloat(form.acompte_pct) || 0,
      conditions_paiement: form.conditions_paiement,
      statut,
      sent_at: statut === 'en_attente' && form.statut !== 'en_attente' ? new Date().toISOString() : undefined,
    }

    let devisId = id
    if (isNew) {
      const { data, error: e } = await supabase.from('devis').insert(devisPayload).select('id').single()
      if (e) { setError(e.message); setSaving(false); return }
      devisId = data.id
    } else {
      const { error: e } = await supabase.from('devis').update(devisPayload).eq('id', id)
      if (e) { setError(e.message); setSaving(false); return }
      // Supprimer les anciennes lignes
      await supabase.from('devis_lignes').delete().eq('devis_id', id)
    }

    // Insérer les lignes
    const lignesPayload = lignes
      .filter(l => l.designation.trim())
      .map((l, i) => ({
        devis_id: devisId,
        user_id: user.id,
        ordre: i,
        type: l.type,
        designation: l.designation,
        description: l.description || null,
        unite: l.unite,
        quantite: parseFloat(l.quantite) || 1,
        prix_unitaire_ht: parseFloat(l.prix_unitaire_ht) || 0,
        tva_taux: parseFloat(l.tva_taux) || 20,
        remise_pct: parseFloat(l.remise_pct) || 0,
      }))

    if (lignesPayload.length > 0) {
      await supabase.from('devis_lignes').insert(lignesPayload)
    }

    setSaving(false)
    if (isNew) navigate(`/devis/${devisId}`)
    else if (newStatut) setF('statut', newStatut)
  }

  function handlePrint() {
    window.print()
  }

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <TopBar title="Devis" />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: 'var(--text-muted)' }}>
        <Loader2 size={18} style={{ animation: 'spin 0.7s linear infinite' }} /> Chargement...
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <TopBar title={isNew ? 'Nouveau devis' : `Devis ${form.objet || ''}`} subtitle={!isNew ? statusMap[form.statut]?.label : undefined} />

      <main className="devis-main" style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Header nav */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <button onClick={() => navigate('/devis')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer', padding: 0 }}>
            <ArrowLeft size={15} /> Retour aux devis
          </button>
          <div className="devis-header-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {/* Bouton vocal */}
            {!preview && (
              <button
                onClick={voiceState === 'recording' ? stopRecording : startRecording}
                disabled={voiceState === 'processing'}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '7px 12px',
                  background: voiceState === 'recording' ? '#ef4444' : voiceState === 'done' ? 'var(--brand)' : 'transparent',
                  border: `1px solid ${voiceState === 'recording' ? '#ef4444' : voiceState === 'done' ? 'var(--brand)' : 'var(--border-strong)'}`,
                  borderRadius: 'var(--radius-sm)',
                  color: voiceState === 'recording' || voiceState === 'done' ? '#000' : 'var(--text-secondary)',
                  fontSize: '13px', cursor: voiceState === 'processing' ? 'not-allowed' : 'pointer',
                  opacity: voiceState === 'processing' ? 0.6 : 1,
                  transition: 'all 0.2s',
                  animation: voiceState === 'recording' ? 'pulse 1.5s ease-in-out infinite' : 'none',
                }}
              >
                {voiceState === 'processing' ? <Loader2 size={14} style={{ animation: 'spin 0.7s linear infinite' }} /> :
                 voiceState === 'done' ? <CheckCircle2 size={14} /> :
                 voiceState === 'recording' ? <MicOff size={14} /> :
                 <Mic size={14} />}
                {voiceState === 'processing' ? 'Analyse...' :
                 voiceState === 'done' ? 'Appliqué !' :
                 voiceState === 'recording' ? 'Arrêter' :
                 'Dicter'}
              </button>
            )}
            <button onClick={() => setPreview(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px', background: 'transparent', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer' }}>
              {preview ? <EyeOff size={14} /> : <Eye size={14} />}
              {preview ? 'Éditer' : 'Aperçu'}
            </button>
            {preview && (
              <button onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px', background: 'transparent', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer' }}>
                <Printer size={14} /> Imprimer / PDF
              </button>
            )}
            <Button variant="secondary" icon={saving ? Loader2 : Save} disabled={saving} onClick={() => handleSave()}>
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
            {form.statut === 'brouillon' && (
              <Button variant="primary" icon={Send} disabled={saving} onClick={() => handleSave('en_attente')}>
                Envoyer au client
              </Button>
            )}
          </div>
        </div>

        {error && (
          <div style={{ background: '#ef444422', border: '1px solid #ef444444', borderRadius: 'var(--radius-sm)', color: 'var(--error)', fontSize: '13px', padding: '10px 14px', display: 'flex', gap: '8px' }}>
            <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: '1px' }} /> {error}
          </div>
        )}

        {/* Bandeau vocal */}
        {voiceState === 'recording' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: '#ef444411', border: '1px solid #ef444444', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 1s ease-in-out infinite', flexShrink: 0 }} />
            <span style={{ fontSize: '13px', color: '#ef4444', fontWeight: '500' }}>Enregistrement en cours... Parlez clairement, puis cliquez sur "Arrêter"</span>
          </div>
        )}
        {voiceState === 'processing' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: 'var(--brand-muted)', border: '1px solid #3ecf8e33', borderRadius: 'var(--radius-sm)' }}>
            <Loader2 size={14} style={{ color: 'var(--brand)', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
            <span style={{ fontSize: '13px', color: 'var(--brand)', fontWeight: '500' }}>Transcription et analyse en cours...</span>
          </div>
        )}
        {voiceState === 'done' && voiceTranscription && (
          <div style={{ padding: '12px 16px', background: 'var(--brand-muted)', border: '1px solid #3ecf8e33', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--brand)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Dictée reconnue</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>"{voiceTranscription}"</div>
          </div>
        )}
        {voiceState === 'error' && voiceError && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: '#ef444422', border: '1px solid #ef444444', borderRadius: 'var(--radius-sm)' }}>
            <AlertTriangle size={14} style={{ color: 'var(--error)', flexShrink: 0 }} />
            <span style={{ fontSize: '13px', color: 'var(--error)' }}>{voiceError}</span>
          </div>
        )}

        {preview ? (
          <>
            <DevisPreview form={form} lignes={lignes} totaux={totaux} profile={profile} printRef={printRef} theme={theme} />
          </>
        ) : (
          <DevisForm
            form={form} setF={setF} lignes={lignes} setLignes={setLignes}
            updateLigne={updateLigne} addLigne={addLigne} removeLigne={removeLigne}
            totaux={totaux} clients={clients} onClientChange={onClientChange}
            onOpenPrestations={() => setShowPrestations(true)}
          />
        )}
      </main>

      {showPrestations && (
        <PrestationsModal
          userId={user.id}
          onClose={() => setShowPrestations(false)}
          onAdd={(newLignes, groupe) => {
            setLignes(prev => {
              const base = prev.length
              const added = []
              if (groupe) {
                added.push({
                  _id: crypto.randomUUID(),
                  type: 'titre',
                  designation: groupe.designation,
                  description: '',
                  unite: 'forfait',
                  quantite: 1,
                  prix_unitaire_ht: 0,
                  tva_taux: 20,
                  remise_pct: 0,
                  ordre: base,
                })
              }
              newLignes.forEach((l, i) => {
                added.push({
                  _id: crypto.randomUUID(),
                  type: 'ligne',
                  designation: l.designation,
                  description: l.description ?? '',
                  unite: l.unite,
                  quantite: 1,
                  prix_unitaire_ht: l.prix_unitaire_ht,
                  tva_taux: l.tva_taux,
                  remise_pct: 0,
                  ordre: base + (groupe ? 1 : 0) + i,
                })
              })
              return [...prev, ...added]
            })
            setShowPrestations(false)
          }}
        />
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @media print {
          body > * { display: none !important; }
          #print-devis { display: block !important; }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  )
}

// ─── Formulaire d'édition ────────────────────────────────────────────────────

function DevisForm({ form, setF, lignes, setLignes, updateLigne, addLigne, removeLigne, totaux, clients, onClientChange, onOpenPrestations }) {
  const [showDetails, setShowDetails] = useState(false)

  // dragSrc : index de la ligne en cours de drag
  // dropZone : { afterIdx: number, inGroup: boolean } | null
  //   afterIdx = -1 → zone avant tout
  //   inGroup = true → on dépose DANS le groupe titre[afterIdx]
  const dragSrcRef = useRef(null)
  const [dragSrc, setDragSrc] = useState(null)
  const [dropZone, setDropZone] = useState(null)
  const dropZoneRef = useRef(null)

  function setDZ(val) { dropZoneRef.current = val; setDropZone(val) }
  function clearDrag() { dragSrcRef.current = null; setDragSrc(null); setDZ(null) }

  // ─── Déplacement : insère après afterIdx (hors groupe) ──────────────────
  function applyDrop(src, zone) {
    if (src === null || src === undefined || !zone) return
    const { afterIdx, inGroup } = zone

    setLignes(prev => {
      // Compter les lignes à déplacer (si titre → groupe entier)
      let count = 1
      if (prev[src]?.type === 'titre') {
        for (let i = src + 1; i < prev.length; i++) {
          if (prev[i].type === 'titre') break
          count++
        }
      }

      const next = [...prev]
      const moved = next.splice(src, count)

      if (inGroup) {
        // Insérer à la fin du groupe ciblé
        // Le titre est à afterIdx (après splice, recalculé)
        const titreIdx = afterIdx < src ? afterIdx : afterIdx - count
        let insertAt = titreIdx + 1
        for (let i = titreIdx + 1; i < next.length; i++) {
          if (next[i].type === 'titre') break
          insertAt = i + 1
        }
        insertAt = Math.max(0, Math.min(insertAt, next.length))
        next.splice(insertAt, 0, ...moved)
      } else {
        // Insérer après afterIdx
        let insertAt = afterIdx + 1
        if (src < afterIdx) insertAt -= count
        insertAt = Math.max(0, Math.min(insertAt, next.length))
        next.splice(insertAt, 0, ...moved)
      }

      return next
    })
  }

  // ─── Mobile : monter/descendre d'une position ───────────────────────────
  function moveLigneUp(idx) {
    if (idx === 0) return
    setLignes(prev => {
      const next = [...prev]
      ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
      return next
    })
  }
  function moveLigneDown(idx) {
    setLignes(prev => {
      if (idx >= prev.length - 1) return prev
      const next = [...prev]
      ;[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
      return next
    })
  }

  return (
    <div className="devis-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '16px', alignItems: 'start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* Bloc 1 — Essentiel */}
        <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* Ligne 1 : objet + client */}
          <div className="devis-top-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Field label="Objet du devis *">
              <input required value={form.objet} onChange={e => setF('objet', e.target.value)} placeholder="Ex : Rénovation salle de bain" style={inp} />
            </Field>
            <Field label="Client">
              {clients.length > 0 ? (
                <select value={form.client_id} onChange={e => onClientChange(e.target.value)} style={inp}>
                  <option value="">— Saisie manuelle —</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              ) : (
                <input value={form.client_nom} onChange={e => setF('client_nom', e.target.value)} placeholder="Nom du client" style={inp} />
              )}
            </Field>
          </div>

          {/* Si client sélectionné depuis la liste : afficher nom en lecture seule, sinon champs manuels */}
          {!form.client_id && (
            <div className="devis-client-manual-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              {clients.length > 0 && (
                <Field label="Nom / Raison sociale *">
                  <input value={form.client_nom} onChange={e => setF('client_nom', e.target.value)} placeholder="M. Dupont" style={inp} />
                </Field>
              )}
              <Field label="Email">
                <input type="email" value={form.client_email} onChange={e => setF('client_email', e.target.value)} placeholder="client@mail.fr" style={inp} />
              </Field>
              <Field label="Téléphone">
                <input value={form.client_phone} onChange={e => setF('client_phone', e.target.value)} placeholder="06 00 00 00 00" style={inp} />
              </Field>
            </div>
          )}

          {/* Ligne 2 : dates */}
          <div className="devis-dates-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
            <Field label="Date d'émission">
              <input type="date" value={form.date_emission} onChange={e => setF('date_emission', e.target.value)} style={inp} />
            </Field>
            <Field label="Date de validité">
              <input type="date" value={form.date_validite} onChange={e => setF('date_validite', e.target.value)} style={inp} />
            </Field>
            <Field label="Lieu des travaux">
              <input value={form.lieu_travaux} onChange={e => setF('lieu_travaux', e.target.value)} placeholder="Adresse du chantier" style={inp} />
            </Field>
            <Field label="Délai de réalisation">
              <input value={form.delai_realisation} onChange={e => setF('delai_realisation', e.target.value)} placeholder="Ex : 3 semaines" style={inp} />
            </Field>
          </div>

          {/* Détails optionnels */}
          <button
            onClick={() => setShowDetails(v => !v)}
            style={{ background: 'none', border: 'none', padding: 0, display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--text-muted)', cursor: 'pointer', width: 'fit-content' }}
          >
            {showDetails ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {showDetails ? 'Masquer les détails' : 'Ajouter une description, adresse client…'}
          </button>

          {showDetails && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '4px', borderTop: '1px solid var(--border)' }}>
              {form.client_id && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <Field label="Email client">
                    <input type="email" value={form.client_email} onChange={e => setF('client_email', e.target.value)} placeholder="client@mail.fr" style={inp} />
                  </Field>
                  <Field label="Téléphone client">
                    <input value={form.client_phone} onChange={e => setF('client_phone', e.target.value)} placeholder="06 00 00 00 00" style={inp} />
                  </Field>
                  <Field label="Adresse client">
                    <input value={form.client_adresse} onChange={e => setF('client_adresse', e.target.value)} placeholder="12 rue de la Paix, Paris" style={inp} />
                  </Field>
                </div>
              )}
              {!form.client_id && (
                <Field label="Adresse client">
                  <input value={form.client_adresse} onChange={e => setF('client_adresse', e.target.value)} placeholder="12 rue de la Paix, 75001 Paris" style={inp} />
                </Field>
              )}
              <Field label="Description des travaux">
                <textarea value={form.description_travaux} onChange={e => setF('description_travaux', e.target.value)} rows={2} placeholder="Description générale de la prestation..." style={{ ...inp, resize: 'vertical', fontFamily: 'inherit' }} />
              </Field>
              <Field label="Conditions de paiement">
                <textarea value={form.conditions_paiement} onChange={e => setF('conditions_paiement', e.target.value)} rows={2} style={{ ...inp, resize: 'vertical', fontFamily: 'inherit' }} />
              </Field>
            </div>
          )}
        </div>

        {/* Bloc 2 — Prestations */}
        <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>Prestations</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={onOpenPrestations} style={{ ...addBtn, color: 'var(--brand)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <BookOpen size={12} /> Bibliothèque
              </button>
              <button onClick={() => addLigne('ligne')} style={{ ...addBtn, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Plus size={12} /> Prestation
              </button>
              <button onClick={() => addLigne('titre')} style={{ ...addBtn, display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
                <Folder size={12} /> Groupe
              </button>
            </div>
          </div>

          <div style={{ padding: '0 8px' }}>
            {/* En-tête colonnes — masqué sur mobile */}
            <div className="devis-ligne-header-grid" style={{ display: 'grid', gridTemplateColumns: '24px 1fr 72px 80px 100px 72px 64px 52px', gap: '6px', padding: '8px 4px 6px', borderBottom: '1px solid var(--border)' }}>
              {[
                { label: '', cls: '' },
                { label: 'Désignation', cls: '' },
                { label: 'Unité', cls: 'devis-ligne-header-unite' },
                { label: 'Qté', cls: '' },
                { label: 'PU HT (€)', cls: 'devis-ligne-header-pu' },
                { label: 'TVA', cls: 'devis-ligne-header-tva' },
                { label: 'Total HT', cls: '' },
                { label: '', cls: '' },
              ].map(({ label, cls }, i) => (
                <span key={i} className={cls} style={{ fontSize: '11px', fontWeight: '500', color: 'var(--text-muted)', textAlign: i > 1 ? 'right' : 'left' }}>{label}</span>
              ))}
            </div>

            {/* Zone de drop tout en haut (avant le premier élément) */}
            <DropSlot
              active={dropZone?.afterIdx === -1 && !dropZone?.inGroup}
              onDragOver={e => { e.preventDefault(); e.stopPropagation(); if (dropZoneRef.current?.afterIdx === -1) return; setDZ({ afterIdx: -1, inGroup: false }) }}
              onDrop={e => { e.preventDefault(); e.stopPropagation(); applyDrop(dragSrcRef.current, { afterIdx: -1, inGroup: false }); clearDrag() }}
            />

            {lignes.map((l, idx) => {
              // Calculer si cette ligne est dans un groupe
              let inGroupe = false
              if (l.type === 'ligne') {
                for (let i = idx - 1; i >= 0; i--) {
                  if (lignes[i].type === 'titre') { inGroupe = true; break }
                  if (lignes[i].type !== 'ligne') break
                }
              }

              const isDragging = dragSrc === idx
              // Pour un titre : drop dessus = ajouter dans ce groupe
              const isGroupTarget = dropZone?.inGroup && dropZone?.afterIdx === idx && l.type === 'titre'
              const nextL = lignes[idx + 1]
              const isLastInGroup = inGroupe && (!nextL || nextL.type === 'titre')
              const slotActive = dropZone?.afterIdx === idx && !dropZone?.inGroup

              return (
                <div key={l._id}>
                  <LigneRow
                    ligne={l}
                    idx={idx}
                    onChange={updateLigne}
                    onRemove={removeLigne}
                    inGroupe={inGroupe}
                    isLastInGroup={isLastInGroup}
                    isDragging={isDragging}
                    isGroupTarget={isGroupTarget}
                    onMoveUp={() => moveLigneUp(idx)}
                    onMoveDown={() => moveLigneDown(idx)}
                    canMoveUp={idx > 0}
                    canMoveDown={idx < lignes.length - 1}
                    onDragStart={e => {
                      e.dataTransfer.setData('text/plain', String(idx))
                      e.dataTransfer.effectAllowed = 'move'
                      dragSrcRef.current = idx
                      setDragSrc(idx)
                    }}
                    onDragEnd={clearDrag}
                    // Sur un titre : survol = drop dans le groupe
                    onDragOver={e => {
                      e.preventDefault()
                      if (l.type === 'titre' && dragSrc !== null && lignes[dragSrc]?.type !== 'titre') {
                        if (dropZoneRef.current?.inGroup && dropZoneRef.current?.afterIdx === idx) return
                        setDZ({ afterIdx: idx, inGroup: true })
                      }
                      // Pour les autres lignes on laisse le DropSlot gérer
                    }}
                    onDragLeave={e => {
                      // Quitter un titre remet à null si c'était le group target
                      if (l.type === 'titre' && dropZoneRef.current?.inGroup && dropZoneRef.current?.afterIdx === idx) {
                        setDZ(null)
                      }
                    }}
                    onDrop={e => {
                      e.preventDefault()
                      if (l.type === 'titre' && dropZoneRef.current?.inGroup) {
                        applyDrop(dragSrcRef.current, dropZoneRef.current)
                        clearDrag()
                      }
                    }}
                  />

                  {/* DropSlot après chaque ligne */}
                  <DropSlot
                    active={slotActive}
                    label={
                      // Si on est après la dernière ligne d'un groupe, indiquer "hors groupe"
                      inGroupe && (!nextL || nextL.type === 'titre') ? 'Hors groupe' : null
                    }
                    onDragOver={e => {
                      e.preventDefault()
                      e.stopPropagation()
                      if (dropZoneRef.current?.afterIdx === idx && !dropZoneRef.current?.inGroup) return
                      setDZ({ afterIdx: idx, inGroup: false })
                    }}
                    onDrop={e => {
                      e.preventDefault()
                      e.stopPropagation()
                      applyDrop(dragSrcRef.current, { afterIdx: idx, inGroup: false })
                      clearDrag()
                    }}
                  />
                </div>
              )
            })}

            {lignes.length === 0 && (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)', fontSize: '13px' }}>
                Ajoutez des prestations ci-dessus ou importez depuis la bibliothèque.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Right — récapitulatif + conditions */}
      <div className="devis-recap-col" style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'sticky', top: '80px' }}>
        <Recap totaux={totaux} form={form} setF={setF} />
      </div>
    </div>
  )
}

// Zone de dépôt entre les lignes
function DropSlot({ active, label, onDragOver, onDrop }) {
  return (
    <div
      onDragOver={onDragOver}
      onDrop={onDrop}
      style={{
        height: active ? '32px' : '6px',
        margin: '0',
        borderRadius: '4px',
        background: active ? 'var(--brand-muted)' : 'transparent',
        border: active ? '2px dashed var(--brand)' : '2px dashed transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'height 0.12s ease, background 0.12s, border-color 0.12s',
        overflow: 'hidden',
        pointerEvents: 'all',
      }}
    >
      {active && label && (
        <span style={{ fontSize: '11px', color: 'var(--brand)', fontWeight: '500', pointerEvents: 'none' }}>
          {label}
        </span>
      )}
    </div>
  )
}

function LigneRow({ ligne, idx, onChange, onRemove, inGroupe, isLastInGroup, isDragging, isGroupTarget, onMoveUp, onMoveDown, canMoveUp, canMoveDown, onDragStart, onDragEnd, onDragOver, onDragLeave, onDrop }) {
  const isTitre = ligne.type === 'titre'

  const qte = parseFloat(ligne.quantite) || 0
  const pu = parseFloat(ligne.prix_unitaire_ht) || 0
  const remise = parseFloat(ligne.remise_pct) || 0
  const totalHT = qte * pu * (1 - remise / 100)

  const grip = (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      style={{ cursor: 'grab', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', flexShrink: 0, touchAction: 'none' }}
      title="Déplacer"
    >
      <GripVertical size={14} />
    </div>
  )

  const mobileControls = (
    <div className="ligne-mobile-controls" style={{ display: 'none', flexDirection: 'column', gap: '1px' }}>
      <button onClick={onMoveUp} disabled={!canMoveUp} style={{ ...delBtn, padding: '2px 3px', opacity: canMoveUp ? 1 : 0.3 }}><ChevronUp size={11} /></button>
      <button onClick={onMoveDown} disabled={!canMoveDown} style={{ ...delBtn, padding: '2px 3px', opacity: canMoveDown ? 1 : 0.3 }}><ChevronDown size={11} /></button>
    </div>
  )

  if (isTitre) return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '10px 8px', marginTop: '4px',
        background: isGroupTarget ? 'var(--brand-muted)' : 'var(--surface-2)',
        borderRadius: 'var(--radius-sm)',
        outline: isGroupTarget ? '2px solid var(--brand)' : '2px solid transparent',
        opacity: isDragging ? 0.35 : 1,
        transition: 'background 0.12s, outline 0.12s, opacity 0.15s',
      }}
    >
      {grip}
      <Folder size={13} style={{ color: isGroupTarget ? 'var(--brand)' : 'var(--text-muted)', flexShrink: 0, transition: 'color 0.12s' }} />
      <input
        value={ligne.designation}
        onChange={e => onChange(idx, 'designation', e.target.value)}
        placeholder="Nom du groupe (ex : Gros œuvre)"
        style={{ ...inp, flex: 1, fontWeight: '600', fontSize: '13px', color: 'var(--brand)', background: 'transparent', border: '1px solid transparent' }}
        onFocus={e => e.target.style.borderColor = 'var(--border-strong)'}
        onBlur={e => e.target.style.borderColor = 'transparent'}
      />
      {mobileControls}
      <button onClick={() => onRemove(idx)} style={delBtn}><Trash2 size={13} /></button>
    </div>
  )

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: '4px',
      padding: '7px 8px 7px 0',
      paddingLeft: inGroupe ? '12px' : '4px',
      borderBottom: isLastInGroup ? 'none' : '1px solid var(--border)',
      borderLeft: inGroupe ? '3px solid var(--brand)' : '3px solid transparent',
      borderBottomLeftRadius: isLastInGroup ? 'var(--radius-sm)' : '0',
      borderBottomRightRadius: isLastInGroup ? 'var(--radius-sm)' : '0',
      background: inGroupe ? 'color-mix(in srgb, var(--brand) 4%, var(--surface-1))' : 'transparent',
      opacity: isDragging ? 0.35 : 1,
      transition: 'opacity 0.15s',
    }}>
      <div className="devis-ligne-grid" style={{ display: 'grid', gridTemplateColumns: '24px 1fr 72px 80px 100px 72px 64px 52px', gap: '6px', alignItems: 'center' }}>
        {grip}
        <input value={ligne.designation} onChange={e => onChange(idx, 'designation', e.target.value)} placeholder="Désignation de la prestation" style={{ ...inp, fontSize: '13px' }} />
        <select className="devis-ligne-col-unite" value={ligne.unite} onChange={e => onChange(idx, 'unite', e.target.value)} style={{ ...inp, fontSize: '12px', padding: '6px 4px' }}>
          {UNITE_OPTIONS.map(u => <option key={u}>{u}</option>)}
        </select>
        <input type="number" min="0" step="0.001" value={ligne.quantite} onChange={e => onChange(idx, 'quantite', e.target.value)} style={{ ...inp, textAlign: 'right', fontSize: '13px' }} />
        <input className="devis-ligne-col-pu" type="number" min="0" step="0.01" value={ligne.prix_unitaire_ht} onChange={e => onChange(idx, 'prix_unitaire_ht', e.target.value)} style={{ ...inp, textAlign: 'right', fontSize: '13px' }} />
        <select className="devis-ligne-col-tva" value={ligne.tva_taux} onChange={e => onChange(idx, 'tva_taux', e.target.value)} style={{ ...inp, fontSize: '12px', padding: '6px 4px' }}>
          {TVA_OPTIONS.map(t => <option key={t} value={t}>{t}%</option>)}
        </select>
        <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', textAlign: 'right' }}>
          {fmt(totalHT)} €
        </span>
        <div style={{ display: 'flex', gap: '2px', alignItems: 'center', justifyContent: 'flex-end' }}>
          {mobileControls}
          <button onClick={() => onRemove(idx)} style={delBtn}><Trash2 size={13} /></button>
        </div>
      </div>
      <div style={{ paddingLeft: '30px' }}>
        <input value={ligne.description || ''} onChange={e => onChange(idx, 'description', e.target.value)} placeholder="Description complémentaire (optionnel)" style={{ ...inp, fontSize: '12px', color: 'var(--text-secondary)', background: 'transparent', border: '1px solid transparent' }}
          onFocus={e => e.target.style.borderColor = 'var(--border-strong)'}
          onBlur={e => e.target.style.borderColor = 'transparent'}
        />
      </div>
    </div>
  )
}

function Recap({ totaux, form, setF }) {
  const { ht, remise_globale, ht_apres_remise, tva, ttc, acompte } = totaux
  return (
    <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>Récapitulatif</span>
      </div>

      {/* Totaux */}
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <RecapLine label="Total HT" value={`${fmt(ht)} €`} />
        {remise_globale > 0 && <RecapLine label={`Remise (${form.remise_pct}%)`} value={`− ${fmt(remise_globale)} €`} color="var(--warning)" />}
        {remise_globale > 0 && <RecapLine label="HT après remise" value={`${fmt(ht_apres_remise)} €`} />}
        <RecapLine label={`TVA (${form.tva_taux}%)`} value={`${fmt(tva)} €`} />
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '8px', marginTop: '2px' }}>
          <RecapLine label="Total TTC" value={`${fmt(ttc)} €`} bold accent />
        </div>
        {parseFloat(form.acompte_pct) > 0 && (
          <div style={{ background: 'var(--brand-muted)', border: '1px solid #3ecf8e33', borderRadius: 'var(--radius-sm)', padding: '8px 12px', marginTop: '2px' }}>
            <RecapLine label={`Acompte (${form.acompte_pct}%)`} value={`${fmt(acompte)} €`} color="var(--brand)" bold />
          </div>
        )}
      </div>

      {/* Conditions */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Conditions</span>
        <Field label="TVA">
          <select value={form.tva_taux} onChange={e => setF('tva_taux', e.target.value)} style={{ ...inp, fontSize: '13px' }}>
            {TVA_OPTIONS.map(t => <option key={t} value={t}>{t}%{t === 5.5 ? ' — rénovation' : t === 10 ? ' — amélioration' : t === 20 ? ' — normal' : ' — exonéré'}</option>)}
          </select>
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <Field label="Remise (%)">
            <input type="number" min="0" max="100" step="0.5" value={form.remise_pct} onChange={e => setF('remise_pct', e.target.value)} style={{ ...inp, fontSize: '13px' }} />
          </Field>
          <Field label="Acompte (%)">
            <input type="number" min="0" max="100" step="5" value={form.acompte_pct} onChange={e => setF('acompte_pct', e.target.value)} style={{ ...inp, fontSize: '13px' }} />
          </Field>
        </div>
      </div>
    </div>
  )
}

function RecapLine({ label, value, bold, accent, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ fontSize: bold ? '16px' : '14px', fontWeight: bold ? '700' : '500', color: color ?? (accent ? 'var(--brand)' : 'var(--text-primary)') }}>{value}</span>
    </div>
  )
}

// ─── Aperçu / Impression ─────────────────────────────────────────────────────

function DevisPreview({ form, lignes, totaux, profile, theme = { color: '#18a96b', modele: 'classique' } }) {
  const { ht, remise_globale, ht_apres_remise, tva, ttc, acompte } = totaux
  const c = theme.color
  const modele = theme.modele

  // Styles variables selon le modèle
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
    borderTop: '1px solid #e5e5e5',
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
      if (l.type === 'texte') return (
        <tr key={l._id}>
          <td colSpan={6} style={{ padding: '8px 12px', color: '#666', fontStyle: 'italic', fontSize: '12px' }}>{l.designation}</td>
        </tr>
      )
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
            {remise > 0 && <div style={{ fontSize: '11px', color: '#d97706', paddingLeft: inGroupe ? '12px' : '0' }}>Remise : {remise}%</div>}
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
      <div style={{ fontSize: '22px', fontWeight: '800', color: isModerne ? '#fff' : '#111', letterSpacing: '-0.03em', marginBottom: '4px' }}>
        {profile?.company_name ?? 'Votre entreprise'}
      </div>
      {profile?.forme_juridique && <div style={{ fontSize: '12px', color: isModerne ? '#ffffffbb' : '#666' }}>{profile.forme_juridique}</div>}
      {profile?.adresse && <div style={{ fontSize: '12px', color: isModerne ? '#ffffffbb' : '#444', marginTop: '6px' }}>{profile.adresse}</div>}
      {(profile?.code_postal || profile?.ville) && <div style={{ fontSize: '12px', color: isModerne ? '#ffffffbb' : '#444' }}>{[profile.code_postal, profile.ville].filter(Boolean).join(' ')}</div>}
      {profile?.telephone && <div style={{ fontSize: '12px', color: isModerne ? '#ffffffbb' : '#444' }}>Tél : {profile.telephone}</div>}
      {profile?.email_pro && <div style={{ fontSize: '12px', color: isModerne ? '#fff' : c }}>{profile.email_pro}</div>}
      {profile?.siret && <div style={{ fontSize: '11px', color: isModerne ? '#ffffff88' : '#888', marginTop: '6px' }}>SIRET : {profile.siret}</div>}
      {profile?.tva_intracommunautaire && <div style={{ fontSize: '11px', color: isModerne ? '#ffffff88' : '#888' }}>N° TVA : {profile.tva_intracommunautaire}</div>}
    </div>
  )

  const infoDevis = (
    <div style={{ textAlign: 'right' }}>
      <div style={{ fontSize: '28px', fontWeight: '800', color: isModerne ? '#fff' : c, letterSpacing: '-0.03em' }}>DEVIS</div>
      <div style={{ fontSize: '13px', color: isModerne ? '#ffffffbb' : '#666', marginTop: '4px' }}>Date d'émission : <strong style={{ color: isModerne ? '#fff' : '#111' }}>{fmtDate(form.date_emission)}</strong></div>
      <div style={{ fontSize: '13px', color: isModerne ? '#ffffffbb' : '#666' }}>Valable jusqu'au : <strong style={{ color: isModerne ? '#fff' : '#111' }}>{fmtDate(form.date_validite)}</strong></div>
      {form.objet && <div style={{ marginTop: '10px', padding: '6px 10px', background: isModerne ? '#ffffff22' : '#f5f5f5', borderRadius: '4px', fontSize: '12px', color: isModerne ? '#fff' : '#444', maxWidth: '220px', marginLeft: 'auto' }}>{form.objet}</div>}
    </div>
  )

  return (
    <div id="print-devis" style={{
      background: '#fff', color: '#111', maxWidth: '820px', margin: '0 auto',
      padding: '48px', fontFamily: "'Inter', sans-serif", fontSize: '13px',
      lineHeight: '1.5', boxShadow: '0 4px 40px #0002', borderRadius: '4px',
    }}>

      {/* En-tête */}
      <div style={headerStyle}>
        {infoEntreprise}
        {infoDevis}
      </div>

      {/* Client + Chantier */}
      <div style={{ display: 'flex', gap: '40px', marginBottom: '32px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '11px', fontWeight: '600', color: isEpure ? c : '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Client</div>
          <div style={{ background: '#f9f9f9', border: isEpure ? `1px solid ${c}44` : '1px solid #e5e5e5', borderRadius: '4px', padding: '14px 16px' }}>
            <div style={{ fontWeight: '600', fontSize: '14px', color: '#111', marginBottom: '4px' }}>{form.client_nom || '—'}</div>
            {form.client_adresse && <div style={{ color: '#555' }}>{form.client_adresse}</div>}
            {form.client_phone && <div style={{ color: '#555' }}>Tél : {form.client_phone}</div>}
            {form.client_email && <div style={{ color: '#555' }}>{form.client_email}</div>}
          </div>
        </div>
        {(form.lieu_travaux || form.delai_realisation) && (
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '11px', fontWeight: '600', color: isEpure ? c : '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Chantier</div>
            <div style={{ background: '#f9f9f9', border: isEpure ? `1px solid ${c}44` : '1px solid #e5e5e5', borderRadius: '4px', padding: '14px 16px' }}>
              {form.lieu_travaux && <div><span style={{ color: '#888' }}>Adresse : </span><span style={{ color: '#111' }}>{form.lieu_travaux}</span></div>}
              {form.delai_realisation && <div><span style={{ color: '#888' }}>Délai : </span><span style={{ color: '#111' }}>{form.delai_realisation}</span></div>}
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      {form.description_travaux && (
        <div style={{ marginBottom: '24px', padding: '12px 16px', background: c + '0d', border: `1px solid ${c}33`, borderRadius: '4px', fontSize: '13px', color: '#333', lineHeight: 1.6 }}>
          {form.description_travaux}
        </div>
      )}

      {/* Tableau */}
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

      {/* Totaux */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '32px' }}>
        <div style={{ width: '280px' }}>
          <TotalLine label="Total HT" value={`${fmt(ht)} €`} />
          {remise_globale > 0 && <TotalLine label={`Remise (${form.remise_pct}%)`} value={`− ${fmt(remise_globale)} €`} color="#d97706" />}
          {remise_globale > 0 && <TotalLine label="HT après remise" value={`${fmt(ht_apres_remise)} €`} />}
          <TotalLine label={`TVA (${form.tva_taux}%)`} value={`${fmt(tva)} €`} />
          <div style={{ borderTop: `2px solid ${isEpure ? c : '#111'}`, marginTop: '6px', paddingTop: '8px' }}>
            <TotalLine label="TOTAL TTC" value={`${fmt(ttc)} €`} bold />
          </div>
          {parseFloat(form.acompte_pct) > 0 && (
            <div style={{ marginTop: '8px', padding: '8px 12px', background: c + '12', border: `1px solid ${c}44`, borderRadius: '4px' }}>
              <TotalLine label={`Acompte (${form.acompte_pct}%)`} value={`${fmt(acompte)} €`} color={c} bold />
            </div>
          )}
        </div>
      </div>

      {/* Conditions */}
      {form.conditions_paiement && (
        <div style={{ marginBottom: '24px', padding: '12px 16px', background: '#f9f9f9', border: '1px solid #e5e5e5', borderRadius: '4px' }}>
          <div style={{ fontSize: '11px', fontWeight: '600', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Conditions de paiement</div>
          <div style={{ fontSize: '12px', color: '#444' }}>{form.conditions_paiement}</div>
        </div>
      )}

      {/* Mentions légales */}
      <div style={{ marginTop: '32px', paddingTop: '20px', borderTop: '1px solid #e5e5e5' }}>
        <div style={{ fontSize: '10px', color: '#aaa', lineHeight: 1.7 }}>
          <strong style={{ color: '#888' }}>Mentions légales :</strong> Ce devis est valable {form.date_validite ? `jusqu'au ${fmtDate(form.date_validite)}` : "30 jours à compter de sa date d'émission"}. Toute commande implique l'acceptation sans réserve des présentes conditions. En cas d'annulation après acceptation, un acompte forfaitaire de {form.acompte_pct}% du montant TTC sera dû. Les travaux sont garantis selon la réglementation en vigueur. Assurance décennale souscrite auprès de {profile?.assurance_nom ?? '[Compagnie assurance]'}{profile?.assurance_numero ? ` — N° ${profile.assurance_numero}` : ''}.
          {profile?.capital_social && ` Capital social : ${fmt(profile.capital_social)} €.`}
          {profile?.rcs_ville && ` RCS ${profile.rcs_ville}.`}
        </div>
      </div>

      {/* Signature */}
      <div style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        <div style={{ border: '1px solid #e5e5e5', borderRadius: '4px', padding: '16px', minHeight: '80px' }}>
          <div style={{ fontSize: '11px', color: '#888', marginBottom: '6px' }}>Signature et cachet de l'entreprise</div>
          <div style={{ fontSize: '11px', color: '#bbb' }}>(bon pour accord)</div>
        </div>
        <div style={{ border: '1px solid #e5e5e5', borderRadius: '4px', padding: '16px', minHeight: '80px' }}>
          <div style={{ fontSize: '11px', color: '#888', marginBottom: '6px' }}>Signature du client — Précédée de la mention</div>
          <div style={{ fontSize: '11px', color: c, fontStyle: 'italic' }}>"Bon pour accord et exécution des travaux"</div>
        </div>
      </div>
    </div>
  )
}

function TotalLine({ label, value, bold, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: bold ? '14px' : '13px', fontWeight: bold ? '700' : '400' }}>
      <span style={{ color: '#555' }}>{label}</span>
      <span style={{ color: color ?? '#111' }}>{value}</span>
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function Section({ title, children, action }) {
  return (
    <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{title}</span>
        {action}
      </div>
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>{children}</div>
    </div>
  )
}

function Row2({ children }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>{children}</div>
}

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <label style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)' }}>{label}</label>
      {children}
    </div>
  )
}

function fmt(n) {
  return (Math.round((n || 0) * 100) / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function round2(n) { return Math.round((n || 0) * 100) / 100 }

const inp = {
  width: '100%', background: 'var(--surface-2)',
  border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-sm)',
  color: 'var(--text-primary)', fontSize: '14px', padding: '7px 10px',
}

const addBtn = {
  padding: '4px 10px', background: 'transparent',
  border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-sm)',
  fontSize: '12px', color: 'var(--brand)', cursor: 'pointer',
}

const delBtn = {
  padding: '4px', background: 'none', border: 'none',
  color: 'var(--text-muted)', cursor: 'pointer', borderRadius: '4px',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}

// ─── Modale bibliothèque de prestations ──────────────────────────────────────

function PrestationsModal({ userId, onClose, onAdd }) {
  const [items, setItems] = useState([])
  const [groupes, setGroupes] = useState([])
  const [liens, setLiens] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('items') // 'items' | 'groupes'
  const [expandedGroupes, setExpandedGroupes] = useState({})

  useEffect(() => {
    async function load() {
      const [{ data: prestData }, { data: liensData }] = await Promise.all([
        supabase.from('prestations').select('*').eq('user_id', userId).order('designation'),
        supabase.from('groupe_prestations').select('*').eq('user_id', userId).order('ordre'),
      ])
      const all = prestData ?? []
      setItems(all.filter(p => p.type === 'item'))
      setGroupes(all.filter(p => p.type === 'groupe'))
      setLiens(liensData ?? [])
      setLoading(false)
    }
    load()
  }, [userId])

  function getItemsOfGroupe(groupeId) {
    const itemIds = liens.filter(l => l.groupe_id === groupeId).map(l => l.item_id)
    return itemIds.map(id => items.find(i => i.id === id)).filter(Boolean)
  }

  function toggleGroupe(id) {
    setExpandedGroupes(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const filteredItems = items.filter(p =>
    p.designation.toLowerCase().includes(search.toLowerCase()) ||
    (p.description ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const filteredGroupes = groupes.filter(g =>
    g.designation.toLowerCase().includes(search.toLowerCase())
  )

  const tabStyle = (active) => ({
    padding: '6px 14px', borderRadius: '4px', border: 'none', fontSize: '13px', cursor: 'pointer',
    background: active ? 'var(--surface-1)' : 'transparent',
    color: active ? 'var(--text-primary)' : 'var(--text-muted)',
    fontWeight: active ? '500' : '400',
    boxShadow: active ? '0 1px 3px #0002' : 'none',
    transition: 'all 0.15s',
  })

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#00000088', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: '12px', width: '100%', maxWidth: '560px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={16} style={{ color: 'var(--brand)' }} />
            <h2 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>Ma bibliothèque</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
        </div>

        {/* Tabs + Search */}
        <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '2px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '6px', padding: '3px', flexShrink: 0 }}>
            <button style={tabStyle(tab === 'items')} onClick={() => setTab('items')}>
              <Package size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />Prestations
            </button>
            <button style={tabStyle(tab === 'groupes')} onClick={() => setTab('groupes')}>
              <Folder size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />Groupes
            </button>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '6px 10px' }}>
            <Search size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input
              autoFocus
              placeholder={tab === 'items' ? 'Rechercher une prestation...' : 'Rechercher un groupe...'}
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '13px', color: 'var(--text-primary)', width: '100%' }}
            />
          </div>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', gap: '8px', color: 'var(--text-muted)' }}>
              <Loader2 size={16} style={{ animation: 'spin 0.7s linear infinite' }} /> Chargement...
            </div>
          ) : tab === 'items' ? (
            filteredItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '13px' }}>
                {search ? 'Aucune prestation trouvée.' : 'Aucune prestation. Créez-en depuis "Mes prestations".'}
              </div>
            ) : filteredItems.map((p, i) => (
              <div
                key={p.id}
                onClick={() => onAdd([p])}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 20px', cursor: 'pointer', borderBottom: i < filteredItems.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 0.12s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>{p.designation}</div>
                  {p.description && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.description}</div>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0, marginLeft: '16px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{p.unite}</span>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{Number(p.prix_unitaire_ht).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>TVA {p.tva_taux}%</span>
                  <div style={{ padding: '3px 10px', background: 'var(--brand)', borderRadius: '4px', fontSize: '12px', fontWeight: '600', color: '#000' }}>+ Ajouter</div>
                </div>
              </div>
            ))
          ) : (
            filteredGroupes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '13px' }}>
                {search ? 'Aucun groupe trouvé.' : 'Aucun groupe. Créez-en depuis "Mes prestations".'}
              </div>
            ) : filteredGroupes.map((g, gi) => {
              const enfants = getItemsOfGroupe(g.id)
              const isOpen = expandedGroupes[g.id] ?? false
              return (
                <div key={g.id} style={{ borderBottom: gi < filteredGroupes.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  {/* Groupe header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 20px', background: 'var(--surface-2)' }}>
                    <button
                      onClick={() => toggleGroupe(g.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0', display: 'flex', alignItems: 'center' }}
                    >
                      {isOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                    </button>
                    {isOpen ? <FolderOpen size={14} style={{ color: 'var(--brand)', flexShrink: 0 }} /> : <Folder size={14} style={{ color: 'var(--brand)', flexShrink: 0 }} />}
                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', flex: 1 }}>{g.designation}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'var(--surface-3,var(--surface-2))', padding: '1px 7px', borderRadius: '10px' }}>{enfants.length} prestation{enfants.length !== 1 ? 's' : ''}</span>
                    {enfants.length > 0 && (
                      <button
                        onClick={() => onAdd(enfants, g)}
                        style={{ padding: '3px 10px', background: 'var(--brand)', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '600', color: '#000', cursor: 'pointer' }}
                      >
                        + Tout ajouter
                      </button>
                    )}
                  </div>
                  {/* Items du groupe */}
                  {isOpen && (
                    <div>
                      {enfants.length === 0 ? (
                        <div style={{ padding: '10px 20px', paddingLeft: '44px', fontSize: '12px', color: 'var(--text-muted)' }}>Aucune prestation dans ce groupe.</div>
                      ) : enfants.map((item, idx) => (
                        <div
                          key={item.id}
                          onClick={() => onAdd([item])}
                          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 20px', paddingLeft: '44px', borderTop: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.12s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>{item.designation}</div>
                            {item.description && <div style={{ fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.description}</div>}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.unite}</span>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{Number(item.prix_unitaire_ht).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
                            <div style={{ padding: '3px 10px', background: 'var(--brand)', borderRadius: '4px', fontSize: '12px', fontWeight: '600', color: '#000' }}>+ Ajouter</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
