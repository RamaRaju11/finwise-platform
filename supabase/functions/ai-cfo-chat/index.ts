import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401, headers: { ...cors, 'Content-Type': 'application/json' } })

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authHeader } } })
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...cors, 'Content-Type': 'application/json' } })

    const body = await req.json()
    const { messages, system } = body

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'messages array required' }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!apiKey) return new Response(JSON.stringify({ error: 'AI not configured' }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } })

    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 800,
        system: system || 'You are an expert AI CFO advisor for small businesses.',
        messages: messages.slice(-12),
      }),
    })

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}))
      return new Response(JSON.stringify({ error: err.error?.message || `AI error ${resp.status}` }), { status: 502, headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    const data = await resp.json()
    const reply = data.content?.[0]?.text || 'Sorry, I could not generate a response.'

    return new Response(JSON.stringify({ ok: true, reply }), { headers: { ...cors, 'Content-Type': 'application/json' } })

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } })
  }
})
