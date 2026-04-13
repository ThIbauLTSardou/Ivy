import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY')!
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    const { client, devis, montant, canal, sentiment, sentimentContext } = await req.json()

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
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
            content: `Client : ${client}\nDevis : ${devis} (${montant})\nCanal : ${canal}\nSentiment détecté : ${sentiment}\nContexte : ${sentimentContext || 'Aucun'}\n\nRédige la relance.`,
          },
        ],
      }),
    })

    const data = await res.json()
    const text = data.choices?.[0]?.message?.content ?? ''
    return new Response(JSON.stringify({ text }), { headers: { ...cors, 'Content-Type': 'application/json' } })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: cors })
  }
})
