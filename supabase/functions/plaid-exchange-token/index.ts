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
    if (!authHeader) return new Response(
      JSON.stringify({ error: 'Not authenticated' }),
      { status: 401, headers: { ...cors, 'Content-Type': 'application/json' } }
    )

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { ...cors, 'Content-Type': 'application/json' } }
    )

    const { public_token, institution_name } = await req.json()
    if (!public_token) return new Response(
      JSON.stringify({ error: 'public_token required' }),
      { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
    )

    // Exchange public token for access token (server-side only — never expose to browser)
    const exchangeRes = await fetch('https://sandbox.plaid.com/item/public_token/exchange', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id:    Deno.env.get('PLAID_CLIENT_ID'),
        secret:       Deno.env.get('PLAID_SECRET'),
        public_token,
      })
    })

    const exchangeData = await exchangeRes.json()
    if (!exchangeRes.ok) return new Response(
      JSON.stringify({ error: exchangeData.error_message || 'Exchange failed' }),
      { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
    )

    const { access_token, item_id } = exchangeData

    // Store access token in Supabase (never returned to browser)
    const serviceSupabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    await serviceSupabase.from('plaid_connections').upsert({
      user_id:          user.id,
      access_token,
      item_id,
      institution_name: institution_name || 'Unknown Bank',
      connected_at:     new Date().toISOString(),
    }, { onConflict: 'user_id' })

    return new Response(
      JSON.stringify({ ok: true, institution_name: institution_name || 'Unknown Bank' }),
      { headers: { ...cors, 'Content-Type': 'application/json' } }
    )

  } catch (e) {
    return new Response(
      JSON.stringify({ error: e.message }),
      { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } }
    )
  }
})
