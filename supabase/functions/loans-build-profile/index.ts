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

    // Accept direct values from request body (frontend localStorage fallback)
    const body = await req.json().catch(() => ({}))

    // Gather DB data in parallel
    const [{ data: financial }, { data: profile }, { data: score }] = await Promise.all([
      serviceSupabase.from('financial_data').select('*').eq('user_id', user.id).order('snapshot_date', { ascending: false }).limit(3),
      serviceSupabase.from('profiles').select('biz_profile').eq('id', user.id).maybeSingle(),
      serviceSupabase.from('health_scores').select('*').eq('user_id', user.id).order('score_date', { ascending: false }).limit(1).maybeSingle(),
    ])

    let biz: any = {}
    try { biz = JSON.parse(profile?.biz_profile || '{}') } catch(e) {}

    const latestFin = financial?.[0] || {}
    // Priority: body (localStorage passthrough) > biz_profile (Supabase) > financial_data (Plaid)
    const monthly_revenue = parseFloat(body.rev) || parseFloat(biz.rev) || parseFloat(latestFin.revenue) || 0
    const monthly_expenses = parseFloat(body.exp) || parseFloat(biz.exp) || parseFloat(latestFin.expenses) || 0
    const monthly_emi = parseFloat(body.emi) || parseFloat(biz.emi) || parseFloat(latestFin.emi) || 0
    const cash_reserve = parseFloat(body.cashReserve) || parseFloat(biz.cashReserve) || parseFloat(latestFin.cash_reserve) || 0
    const health_score = parseFloat(body.health_score) || score?.overall_score || 0

    // Avg revenue over up to 3 months for stability
    const revenues = (financial || []).map((r: any) => parseFloat(r.revenue) || 0).filter((v: number) => v > 0)
    const avg_revenue = revenues.length > 0
      ? Math.max(monthly_revenue, revenues.reduce((a: number, b: number) => a + b, 0) / revenues.length)
      : monthly_revenue

    // Column names match the loan_profiles table schema exactly
    const loanProfile = {
      user_id: user.id,
      monthly_revenue,
      expenses: monthly_expenses,
      emi: monthly_emi,
      cash_reserve,
      health_score: Math.round(health_score),
      business_name: biz.bizName || biz.business_name || '',
      industry: biz.industry || '',
      years_in_business: Number(biz.yearsInBusiness || biz.years || biz.years_in_business || 2),
      employees: Number(biz.employees || 1),
      state: biz.state || '',
    }

    // Upsert loan profile — check error explicitly
    const { error: upsertErr } = await serviceSupabase.from('loan_profiles').upsert(loanProfile, { onConflict: 'user_id' })
    if (upsertErr) return new Response(JSON.stringify({ error: 'DB upsert failed: ' + upsertErr.message }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } })

    return new Response(JSON.stringify({ ok: true, profile: loanProfile }), { headers: { ...cors, 'Content-Type': 'application/json' } })

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } })
  }
})
