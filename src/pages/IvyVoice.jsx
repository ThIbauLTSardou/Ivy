import { useState, useRef } from 'react'
import TopBar from '../components/layout/TopBar'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { transcribeAudio, analyzeVoiceMemo } from '../utils/groq'
import { Mic, MicOff, CheckCircle2, Calendar, Package, MessageSquare, Loader2, AlertTriangle } from 'lucide-react'

const history = [
  { date: "Aujourd'hui 08:14", text: 'Chantier Villa Capucin : coulage béton terminé, séchage 48h', actions: 2 },
  { date: 'Hier 17:32', text: "Ajoute 10 sacs de ciment et 2 heures de main d'œuvre au devis Villa Capucin", actions: 1 },
  { date: 'Hier 09:05', text: 'RDV client reporté chez Dupont, prévenir pour jeudi matin', actions: 2 },
]

function buildActions(analysis) {
  const result = []
  for (const task of analysis.tasks ?? []) {
    result.push({
      type: 'task',
      icon: Calendar,
      color: 'var(--brand)',
      title: 'Tâche créée',
      desc: [task.title, task.date, task.client].filter(Boolean).join(' — '),
      done: false,
    })
  }
  for (const stock of analysis.stockAlerts ?? []) {
    result.push({
      type: 'stock',
      icon: Package,
      color: 'var(--warning)',
      title: 'Alerte stock',
      desc: [stock.item, stock.qty ? `× ${stock.qty}` : null, stock.ref].filter(Boolean).join(' · '),
      done: false,
    })
  }
  if (analysis.smsDraft) {
    result.push({
      type: 'sms',
      icon: MessageSquare,
      color: 'var(--info)',
      title: 'Brouillon SMS client',
      desc: `"${analysis.smsDraft}"`,
      done: false,
    })
  }
  return result
}

export default function IvyVoice() {
  const [phase, setPhase] = useState('idle') // idle | recording | processing | done | error
  const [transcript, setTranscript] = useState('')
  const [actions, setActions] = useState([])
  const [error, setError] = useState(null)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])

  const startRecording = async () => {
    setError(null)
    setPhase('recording')
    chunksRef.current = []

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mediaRecorder = new MediaRecorder(stream)
    mediaRecorderRef.current = mediaRecorder

    mediaRecorder.ondataavailable = e => {
      if (e.data.size > 0) chunksRef.current.push(e.data)
    }

    mediaRecorder.onstop = async () => {
      stream.getTracks().forEach(t => t.stop())
      setPhase('processing')
      try {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const text = await transcribeAudio(blob)
        setTranscript(text)
        const analysis = await analyzeVoiceMemo(text)
        setActions(buildActions(analysis))
        setPhase('done')
      } catch (err) {
        console.error(err)
        setError(err.message ?? 'Erreur lors du traitement')
        setPhase('error')
      }
    }

    mediaRecorder.start()
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
  }

  const handleMicClick = () => {
    if (phase === 'idle' || phase === 'error') {
      startRecording()
    } else if (phase === 'recording') {
      stopRecording()
    } else if (phase === 'done') {
      setPhase('idle')
      setTranscript('')
      setActions([])
    }
  }

  const confirmAction = (i) => {
    setActions(prev => prev.map((a, idx) => idx === i ? { ...a, done: true } : a))
  }

  const micColor = phase === 'recording' ? 'var(--error)' : phase === 'done' ? 'var(--brand)' : 'var(--surface-2)'
  const micBorder = phase === 'recording' ? 'var(--error)' : phase === 'done' ? 'var(--brand)' : 'var(--border-strong)'
  const micGlow = phase === 'recording' ? '0 0 30px #ef444433' : phase === 'done' ? '0 0 30px var(--brand-muted)' : 'none'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <TopBar title="Ivy Voice" subtitle="Le cerveau de chantier sans mains" />
      <main style={{ flex: 1, padding: '24px', display: 'grid', gridTemplateColumns: '1fr 360px', gap: '20px', alignItems: 'start' }}>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Card glow={phase === 'done'} style={{ textAlign: 'center', padding: '40px 24px' }}>
            <Badge variant="green" style={{ marginBottom: '20px' }}>Intelligence vocale · Whisper v3</Badge>
            <h2 style={{ fontSize: '20px', fontWeight: '600', letterSpacing: '-0.02em', marginBottom: '8px' }}>
              Parlez naturellement
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 32px' }}>
              Dictez vos mémos, mises à jour chantier, ou commandes de devis. Ivy transcrit et crée les actions automatiquement.
            </p>

            {/* Mic button */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
              <button
                onClick={handleMicClick}
                style={{
                  width: '80px', height: '80px', borderRadius: '50%',
                  background: micColor,
                  border: `2px solid ${micBorder}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: micGlow,
                }}
              >
                {phase === 'processing'
                  ? <Loader2 size={28} style={{ color: 'var(--brand)', animation: 'spin 1s linear infinite' }} />
                  : phase === 'recording'
                  ? <MicOff size={28} style={{ color: '#fff' }} />
                  : phase === 'done'
                  ? <CheckCircle2 size={28} style={{ color: '#000' }} />
                  : <Mic size={28} style={{ color: 'var(--text-secondary)' }} />
                }
              </button>
            </div>

            {/* Status */}
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              {phase === 'idle' && 'Appuyez pour commencer la dictée'}
              {phase === 'recording' && <span style={{ color: 'var(--error)', fontWeight: '500' }}>Enregistrement... Appuyez pour arrêter</span>}
              {phase === 'processing' && <span style={{ color: 'var(--brand)' }}>Transcription Whisper + analyse IA...</span>}
              {phase === 'done' && <span style={{ color: 'var(--brand)', fontWeight: '500' }}>Traitement terminé · {actions.length} action{actions.length > 1 ? 's' : ''} créée{actions.length > 1 ? 's' : ''}</span>}
              {phase === 'error' && <span style={{ color: 'var(--error)' }}>Erreur — appuyez pour réessayer</span>}
            </div>

            {/* Wave animation */}
            {phase === 'recording' && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginTop: '16px', height: '30px', alignItems: 'center' }}>
                {[...Array(16)].map((_, i) => (
                  <div key={i} style={{
                    width: '3px',
                    background: 'var(--error)',
                    borderRadius: '2px',
                    height: `${8 + (i % 5) * 5}px`,
                    opacity: 0.7,
                    animation: `pulse ${0.4 + (i % 3) * 0.2}s ease-in-out infinite alternate`,
                  }} />
                ))}
              </div>
            )}

            {/* Error detail */}
            {phase === 'error' && error && (
              <div style={{
                marginTop: '16px',
                padding: '10px 14px',
                background: '#ef444415',
                border: '1px solid #ef444433',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12px',
                color: 'var(--error)',
                display: 'flex',
                gap: '8px',
                alignItems: 'flex-start',
                textAlign: 'left',
              }}>
                <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: '1px' }} />
                {error}
              </div>
            )}
          </Card>

          {/* Transcription */}
          {(phase === 'processing' || phase === 'done') && transcript && (
            <Card>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontFamily: 'var(--font-mono)' }}>
                TRANSCRIPTION WHISPER
              </div>
              <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.7, fontStyle: 'italic' }}>
                "{transcript}"
              </p>
            </Card>
          )}

          {/* AI Actions */}
          {phase === 'done' && actions.length > 0 && (
            <Card style={{ padding: 0 }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>Actions détectées par Ivy</h3>
                <Badge variant="green">{actions.length} action{actions.length > 1 ? 's' : ''}</Badge>
              </div>
              {actions.map((action, i) => {
                const Icon = action.icon
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'flex-start', gap: '14px',
                    padding: '16px 20px',
                    borderBottom: i < actions.length - 1 ? '1px solid var(--border)' : 'none',
                    opacity: action.done ? 0.5 : 1,
                    transition: 'opacity 0.2s',
                  }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '6px',
                      background: action.color + '22',
                      border: `1px solid ${action.color}44`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Icon size={16} style={{ color: action.color }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '3px' }}>
                        {action.title}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{action.desc}</div>
                    </div>
                    <button
                      onClick={() => confirmAction(i)}
                      disabled={action.done}
                      style={{
                        padding: '5px 12px',
                        background: action.done ? 'var(--surface-2)' : 'var(--brand)',
                        color: action.done ? 'var(--text-muted)' : '#000',
                        border: 'none', borderRadius: '4px',
                        fontSize: '12px', fontWeight: '600',
                        cursor: action.done ? 'default' : 'pointer',
                        flexShrink: 0,
                      }}
                    >
                      {action.done ? '✓ Fait' : 'Confirmer'}
                    </button>
                  </div>
                )
              })}
            </Card>
          )}

          {phase === 'done' && actions.length === 0 && (
            <Card>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>
                Aucune action détectée dans ce mémo.
              </p>
            </Card>
          )}
        </div>

        {/* History */}
        <Card style={{ padding: 0 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>Historique des mémos</h3>
          </div>
          <div>
            {history.map((h, i) => (
              <div key={i} style={{
                padding: '14px 20px',
                borderBottom: i < history.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{h.date}</span>
                  <Badge variant="default" size="sm">{h.actions} actions</Badge>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, fontStyle: 'italic' }}>
                  "{h.text}"
                </p>
              </div>
            ))}
          </div>
        </Card>
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { from { transform: scaleY(0.6); } to { transform: scaleY(1); } }
      `}</style>
    </div>
  )
}
