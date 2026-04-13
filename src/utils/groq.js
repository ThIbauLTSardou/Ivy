import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
})

/**
 * Transcrit un blob audio en texte via Whisper (Groq)
 * @param {Blob} audioBlob
 * @returns {Promise<string>}
 */
export async function transcribeAudio(audioBlob) {
  const file = new File([audioBlob], 'memo.webm', { type: audioBlob.type })

  const transcription = await groq.audio.transcriptions.create({
    file,
    model: 'whisper-large-v3-turbo',
    language: 'fr',
  })

  return transcription.text
}

/**
 * Analyse un texte de mémo vocal et extrait les actions structurées
 * @param {string} transcript
 * @returns {Promise<{tasks: Array, stockAlerts: Array, smsDraft: string|null}>}
 */
export async function analyzeVoiceMemo(transcript) {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    temperature: 0.2,
    messages: [
      {
        role: 'system',
        content: `Tu es Ivy, l'assistant IA d'un CRM pour artisans du BTP en France.
Analyse le mémo vocal d'un artisan et extrais les actions structurées.
Réponds UNIQUEMENT en JSON valide, sans markdown ni texte autour.

Format de réponse :
{
  "tasks": [{ "title": "string", "date": "string|null", "client": "string|null" }],
  "stockAlerts": [{ "item": "string", "qty": "number|null", "ref": "string|null" }],
  "smsDraft": "string|null",
  "summary": "string"
}

Règles :
- tasks : rendez-vous, retours chantier, choses à faire
- stockAlerts : matériaux manquants, commandes à passer
- smsDraft : si un client doit être prévenu, rédige un SMS professionnel et cordial
- summary : résumé court en 1 phrase`,
      },
      {
        role: 'user',
        content: `Mémo vocal : "${transcript}"`,
      },
    ],
  })

  const raw = completion.choices[0]?.message?.content ?? '{}'
  try {
    return JSON.parse(raw)
  } catch {
    return { tasks: [], stockAlerts: [], smsDraft: null, summary: transcript }
  }
}

/**
 * Génère une relance personnalisée selon le sentiment détecté
 * @param {object} params
 * @returns {Promise<string>}
 */
export async function generateRelance({ client, devis, montant, canal, sentiment, sentimentContext }) {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    temperature: 0.4,
    messages: [
      {
        role: 'system',
        content: `Tu es l'assistant IA d'un artisan du BTP. Rédige une relance ${canal} professionnelle, chaleureuse et adaptée au contexte.
Réponds UNIQUEMENT avec le texte du message, sans sujet d'email ni explication.`,
      },
      {
        role: 'user',
        content: `Client : ${client}
Devis : ${devis} (${montant})
Canal : ${canal}
Sentiment détecté : ${sentiment}
Contexte : ${sentimentContext || 'Aucun'}

Rédige la relance.`,
      },
    ],
  })

  return completion.choices[0]?.message?.content ?? ''
}
