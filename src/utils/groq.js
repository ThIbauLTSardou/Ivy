const BASE = import.meta.env.VITE_SUPABASE_URL

/**
 * Transcrit un blob audio en texte via l'edge function ivy-voice
 * La clé Groq/Whisper reste côté serveur
 */
export async function transcribeAudio(audioBlob) {
  const fd = new FormData()
  fd.append('audio', new File([audioBlob], 'memo.webm', { type: audioBlob.type }))

  const res = await fetch(`${BASE}/functions/v1/ivy-voice-transcribe`, {
    method: 'POST',
    body: fd,
  })
  if (!res.ok) throw new Error('Erreur transcription')
  const { text } = await res.json()
  return text
}

/**
 * Analyse un mémo vocal via l'edge function ivy-voice
 */
export async function analyzeVoiceMemo(transcript) {
  const res = await fetch(`${BASE}/functions/v1/ivy-voice`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcript }),
  })
  if (!res.ok) return { tasks: [], stockAlerts: [], smsDraft: null, summary: transcript }
  return res.json()
}

/**
 * Génère une relance via l'edge function ivy-relance
 */
export async function generateRelance({ client, devis, montant, canal, sentiment, sentimentContext }) {
  const res = await fetch(`${BASE}/functions/v1/ivy-relance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client, devis, montant, canal, sentiment, sentimentContext }),
  })
  if (!res.ok) return ''
  const { text } = await res.json()
  return text
}
