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

    // Track application click
    if (action === 'apply' && req.method === 'POST') {
      const body = await req.json().catch(() => ({}))
      const { lender_name, loan_type, amount } = body
      await serviceSupabase.from('loan_applications').insert({
        user_id: user.id,
        lender_name,
        loan_type,
        amount,
        status: 'clicked',
        applied_at: new Date().toISOString(),
        commission_rate: lender_name.startsWith('Bluevine') ? 0.015 : 0.01,
        commission_amount: Math.round(amount * (lender_name.startsWith('Bluevine') ? 0.015 : 0.01)),
      })
      return new Response(JSON.stringify({ ok: true }), { headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    // Get current offers + loan profile
    const reqMap: Record<string, string> = {
      'Lendio|Term Loan': 'Min. $5K/month revenue, 1+ years in business',
      'Lendio (SBA)|SBA 7(a) Loan': 'Min. $10K/month revenue, 2+ years, good credit',
      'Lendio|Business Line of Credit': 'Min. $3K/month revenue, 6+ months in business',
      'Bluevine|Flex Line of Credit': 'Min. $3K/month revenue, personal credit 625+',
      'Bluevine|Term Loan': 'Min. $6K/month revenue, 2+ years in business',
    }

    const [{ data: rawOffers }, { data: lp }, { data: applications }] = await Promise.all([
      serviceSupabase.from('loan_offers').select('*').eq('user_id', user.id).order('approval_probability', { ascending: false }),
      serviceSupabase.from('loan_profiles').select('*').eq('user_id', user.id).maybeSingle(),
      serviceSupabase.from('loan_applications').select('*').eq('user_id', user.id).order('applied_at', { ascending: false }).limit(10),
    ])

    const offers = (rawOffers || []).map((o: any) => ({
      ...o,
      requirements: reqMap[`${o.lender_name}|${o.loan_type}`] || '',
    }))

    return new Response(JSON.stringify({
      ok: true,
      offers,
      profile: lp || null,
      applications: applications || [],
    }), { headers: { ...cors, 'Content-Type': 'application/json' } })

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } })
  }
})
