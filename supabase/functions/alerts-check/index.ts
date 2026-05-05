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

    const { data: scores } = await serviceSupabase.from('health_scores').select('*').eq('user_id', user.id).order('score_date', { ascending: false }).limit(2)
    const { data: profile } = await serviceSupabase.from('profiles').select('biz_profile').eq('id', user.id).maybeSingle()

    let biz: any = {}
    try { biz = JSON.parse(profile?.biz_profile || '{}') } catch(e) {}

    const latest = scores?.[0]
    const prev   = scores?.[1]
    const newAlerts: any[] = []

    if (latest) {
      const d = latest.dimension_data || {}
      const runway = d.runway || 0
      const revenue = d.revenue || 0
      const prevRevenue = prev?.dimension_data?.revenue || 0

      // Cash runway alerts
      if (runway < 1.5 && runway > 0) {
        newAlerts.push({ type: 'runway_critical', urgency: 'urgent', title: '🚨 Cash runway critically low', body: `You have ${Math.round(runway * 10) / 10} months of runway left. Immediate action required to avoid running out of cash.`, action_url: 'modules/cashRunway.test.html' })
      } else if (runway < 3 && runway > 0) {
        newAlerts.push({ type: 'runway_warning', urgency: 'high', title: '⚠️ Cash runway below 3 months', body: `Your runway is ${Math.round(runway * 10) / 10} months. Recommended minimum is 6 months. Start building cash reserves now.`, action_url: 'modules/cashRunway.test.html' })
      }

      // Revenue drop alert
      if (prevRevenue > 0 && revenue > 0) {
        const drop = ((prevRevenue - revenue) / prevRevenue) * 100
        if (drop > 15) {
          newAlerts.push({ type: 'revenue_drop', urgency: 'high', title: '📉 Revenue dropped ' + Math.round(drop) + '%', body: `Revenue fell from $${Math.round(prevRevenue).toLocaleString()} to $${Math.round(revenue).toLocaleString()} — a ${Math.round(drop)}% drop. Review your top revenue sources.`, action_url: 'modules/forecastPro.test.html' })
        }
      }

      // Health score milestones
      const score = latest.overall_score
      const prevScore = prev?.overall_score || 0
      if (prevScore < 50 && score >= 50) newAlerts.push({ type: 'score_milestone', urgency: 'low', title: '🎉 Health score crossed 50!', body: `Your business health score is now ${score}/100. You\'re past the halfway mark — keep building momentum.`, action_url: 'dashboard.html' })
      if (prevScore < 70 && score >= 70) newAlerts.push({ type: 'score_milestone', urgency: 'low', title: '🏆 Health score reached 70 — Healthy!', body: `Your score hit ${score}/100. This puts you in the healthy range and improves your loan eligibility significantly.`, action_url: 'modules/loanEligibility.test.html' })
      if (prevScore < 85 && score >= 85) newAlerts.push({ type: 'score_milestone', urgency: 'low', title: '⭐ Excellent! Score above 85', body: `Outstanding score of ${score}/100. You qualify for the best loan rates and terms available.`, action_url: 'modules/lenderMarketplace.html' })
    }

    // Insert only new alert types not already created today
    const today = new Date().toISOString().split('T')[0]
    const { data: existingToday } = await serviceSupabase.from('alerts').select('type').eq('user_id', user.id).gte('created_at', today)
    const existingTypes = (existingToday || []).map((a: any) => a.type)

    const toInsert = newAlerts.filter(a => !existingTypes.includes(a.type)).map(a => ({ ...a, user_id: user.id }))
    if (toInsert.length > 0) {
      await serviceSupabase.from('alerts').insert(toInsert)
    }

    return new Response(JSON.stringify({ ok: true, alerts_created: toInsert.length }), { headers: { ...cors, 'Content-Type': 'application/json' } })

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } })
  }
})
