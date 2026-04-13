import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY')!
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    const form = await req.formData()
    const audio = form.get('audio') as File
    if (!audio) return new Response(JSON.stringify({ error: 'audio requis' }), { status: 400, headers: cors })

    const fd = new FormData()
    fd.append('file', audio, audio.name)
    fd.append('model', 'whisper-large-v3-turbo')
    fd.append('language', 'fr')

    const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${GROQ_API_KEY}` },
      body: fd,
    })

    const data = await res.json()
    return new Response(JSON.stringify({ text: data.text ?? '' }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: cors })
  }
})
