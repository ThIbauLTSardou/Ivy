import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY')!
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    const { transcript } = await req.json()
    if (!transcript) return new Response(JSON.stringify({ error: 'transcript requis' }), { status: 400, headers: cors })

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
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
}`,
          },
          { role: 'user', content: `Mémo vocal : "${transcript}"` },
        ],
      }),
    })

    const data = await res.json()
    const raw = data.choices?.[0]?.message?.content ?? '{}'
    let analysis
    try { analysis = JSON.parse(raw) } catch { analysis = { tasks: [], stockAlerts: [], smsDraft: null, summary: transcript } }

    return new Response(JSON.stringify(analysis), { headers: { ...cors, 'Content-Type': 'application/json' } })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: cors })
  }
})
