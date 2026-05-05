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

    const serviceSupabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    const url = new URL(req.url)
    const action = url.searchParams.get('action')

    // Accept invite by token (client side — no advisor auth needed, token is the proof)
    if (action === 'accept') {
      const { token } = await req.json().catch(() => ({}))
      if (!token) return new Response(JSON.stringify({ error: 'No token' }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } })

      const { data: invite } = await serviceSupabase.from('advisor_clients').select('*').eq('invite_token', token).maybeSingle()
      if (!invite) return new Response(JSON.stringify({ error: 'Invalid or expired invite' }), { status: 404, headers: { ...cors, 'Content-Type': 'application/json' } })
      if (invite.status === 'active') return new Response(JSON.stringify({ ok: true, already_accepted: true }), { headers: { ...cors, 'Content-Type': 'application/json' } })

      await serviceSupabase.from('advisor_clients').update({
        client_id: user.id,
        status: 'active',
        accepted_at: new Date().toISOString(),
      }).eq('invite_token', token)

      return new Response(JSON.stringify({ ok: true, advisor_id: invite.advisor_id }), { headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    // Add new client (advisor action)
    if (req.method === 'POST' && !action) {
      const { client_email, client_name, notes } = await req.json().catch(() => ({}))
      if (!client_email) return new Response(JSON.stringify({ error: 'client_email required' }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } })

      // Check not already invited
      const { data: existing } = await serviceSupabase.from('advisor_clients').select('id,status').eq('advisor_id', user.id).eq('client_email', client_email).maybeSingle()
      if (existing) return new Response(JSON.stringify({ ok: false, reason: 'already_invited', status: existing.status }), { headers: { ...cors, 'Content-Type': 'application/json' } })

      const { data: newClient, error: insertErr } = await serviceSupabase.from('advisor_clients').insert({
        advisor_id: user.id,
        client_email,
        client_name: client_name || '',
        notes: notes || '',
        status: 'pending',
      }).select().maybeSingle()

      if (insertErr) return new Response(JSON.stringify({ error: insertErr.message }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } })

      return new Response(JSON.stringify({ ok: true, client: newClient }), { headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    // Remove client
    if (action === 'remove') {
      const { id } = await req.json().catch(() => ({}))
      await serviceSupabase.from('advisor_clients').delete().eq('id', id).eq('advisor_id', user.id)
      return new Response(JSON.stringify({ ok: true }), { headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    // Update notes
    if (action === 'notes') {
      const { id, notes } = await req.json().catch(() => ({}))
      await serviceSupabase.from('advisor_clients').update({ notes }).eq('id', id).eq('advisor_id', user.id)
      return new Response(JSON.stringify({ ok: true }), { headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    // GET: list all clients with their latest data
    const { data: clients } = await serviceSupabase.from('advisor_clients').select('*').eq('advisor_id', user.id).order('created_at', { ascending: false })

    // For each active client, fetch their latest health score + loan profile
    const enriched = await Promise.all((clients || []).map(async (c: any) => {
      if (!c.client_id) return { ...c, health_score: null, loan_profile: null }
      const [{ data: score }, { data: lp }] = await Promise.all([
        serviceSupabase.from('health_scores').select('overall_score,score_date,dimension_data').eq('user_id', c.client_id).order('score_date', { ascending: false }).limit(1).maybeSingle(),
        serviceSupabase.from('loan_profiles').select('monthly_revenue,health_score,industry,business_name').eq('user_id', c.client_id).maybeSingle(),
      ])
      return { ...c, health_score: score, loan_profile: lp }
    }))

    return new Response(JSON.stringify({ ok: true, clients: enriched }), { headers: { ...cors, 'Content-Type': 'application/json' } })

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } })
  }
})
