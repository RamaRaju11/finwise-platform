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

    const plaidResponse = await fetch('https://sandbox.plaid.com/link/token/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: Deno.env.get('PLAID_CLIENT_ID'),
        secret:    Deno.env.get('PLAID_SECRET'),
        client_name: 'FinWise',
        country_codes: ['US'],
        language: 'en',
        user: { client_user_id: user.id },
        products: ['transactions'],
      })
    })

    const plaidData = await plaidResponse.json()

    if (!plaidResponse.ok) return new Response(
      JSON.stringify({ error: plaidData.error_message || 'Plaid error' }),
      { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
    )

    return new Response(
      JSON.stringify({ link_token: plaidData.link_token }),
      { headers: { ...cors, 'Content-Type': 'application/json' } }
    )

  } catch (e) {
    return new Response(
      JSON.stringify({ error: e.message }),
      { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } }
    )
  }
})
