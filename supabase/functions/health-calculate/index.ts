import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function scoreRange(value: number, thresholds: number[], scores: number[]): number {
  for (let i = 0; i < thresholds.length; i++) {
    if (value >= thresholds[i]) return scores[i]
  }
  return scores[scores.length - 1]
}

function calcHealthScore(data: {
  revenue: number, expenses: number, emi: number, reserve: number,
  prevRevenue?: number, prevPrevRevenue?: number
}) {
  const { revenue, expenses, emi, reserve, prevRevenue, prevPrevRevenue } = data
  const net = revenue - expenses

  // 1. Cash Flow (25%) — net margin %
  const margin = revenue > 0 ? (net / revenue) * 100 : (net < 0 ? -100 : 0)
  const cashFlowScore = scoreRange(margin, [20, 10, 0, -10], [100, 75, 50, 25, 0])

  // 2. Liquidity (20%) — runway months
  const monthlyBurn = expenses - revenue
  const runway = monthlyBurn > 0 && reserve > 0 ? reserve / monthlyBurn : (net >= 0 ? 99 : 0)
  const liquidityScore = scoreRange(runway, [6, 3, 1.5, 0.5], [100, 75, 50, 25, 0])

  // 3. Debt Burden (20%) — EMI as % of revenue
  const debtRatio = revenue > 0 ? (emi / revenue) * 100 : (emi > 0 ? 100 : 0)
  const debtScore = scoreRange(-debtRatio, [-10, -20, -30, -40], [100, 75, 50, 25, 0])

  // 4. Revenue Stability (15%) — month-over-month change
  let stabilityScore = 60
  if (prevRevenue && prevRevenue > 0 && revenue > 0) {
    const change = Math.abs((revenue - prevRevenue) / prevRevenue) * 100
    stabilityScore = scoreRange(-change, [-5, -15, -30, -50], [100, 75, 50, 25, 0])
  }

  // 5. Credit Health (10%) — placeholder until credit bureau integrated
  const creditScore = 55

  // 6. Growth Trajectory (10%) — 3-month trend
  let growthScore = 55
  if (prevRevenue && prevPrevRevenue && prevPrevRevenue > 0) {
    const trend = ((revenue - prevPrevRevenue) / prevPrevRevenue) * 100
    growthScore = scoreRange(trend, [10, 3, 0, -5], [100, 75, 55, 35, 0])
  }

  const overall = Math.round(
    cashFlowScore    * 0.25 +
    liquidityScore   * 0.20 +
    debtScore        * 0.20 +
    stabilityScore   * 0.15 +
    creditScore      * 0.10 +
    growthScore      * 0.10
  )

  return {
    overall_score:           Math.min(100, Math.max(0, overall)),
    cash_flow_score:         cashFlowScore,
    liquidity_score:         liquidityScore,
    debt_burden_score:       debtScore,
    revenue_stability_score: stabilityScore,
    credit_health_score:     creditScore,
    growth_score:            growthScore,
    dimension_data: { margin, runway, debtRatio, net, revenue, expenses, emi, reserve }
  }
}

function generatePriorities(scores: ReturnType<typeof calcHealthScore>, userId: string) {
  const today = new Date().toISOString().split('T')[0]
  const { dimension_data: d } = scores
  const items: any[] = []

  if (scores.cash_flow_score < 50) {
    items.push({ urgency: d.net < 0 ? 'high' : 'medium', title: 'Improve your cash flow', description: `Your net is $${Math.round(d.net).toLocaleString()}/month. Cut the highest expense category or find one new revenue source this week.`, action_url: 'modules/breakEven.test.html' })
  }
  if (scores.liquidity_score < 50) {
    items.push({ urgency: d.runway < 1.5 ? 'urgent' : 'high', title: 'Cash runway is low', description: `You have ~${d.runway < 1 ? 'less than 1' : Math.round(d.runway)} month${d.runway >= 2 ? 's' : ''} of runway. Review your cash reserve and reduce non-essential spend immediately.`, action_url: 'modules/cashRunway.test.html' })
  }
  if (scores.debt_burden_score < 50) {
    items.push({ urgency: 'medium', title: 'Debt burden is high', description: `Loan repayments are ${Math.round(d.debtRatio)}% of your revenue. Consider refinancing or consolidating to reduce monthly payments.`, action_url: 'modules/loanRefinanceAnalyzer.test.html' })
  }
  if (scores.overall_score >= 70) {
    items.push({ urgency: 'low', title: 'Good financial health — consider growth', description: `Your score is ${scores.overall_score}/100. This is a good time to plan for growth — explore grants or investment opportunities.`, action_url: 'modules/grantFinder.test.html' })
  }
  if (items.length === 0) {
    items.push({ urgency: 'low', title: 'Review your financial goals', description: 'Set a savings or revenue target for this quarter to stay on track.', action_url: 'modules/goalTracker.test.html' })
  }

  return items.slice(0, 3).map((item, i) => ({
    user_id:       userId,
    priority_date: today,
    priority_rank: i + 1,
    ...item
  }))
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

    // Get latest financial data
    const { data: fin } = await serviceSupabase.from('financial_data').select('*').eq('user_id', user.id).order('snapshot_date', { ascending: false }).limit(3)
    const { data: profile } = await serviceSupabase.from('profiles').select('biz_profile').eq('id', user.id).maybeSingle()

    let biz: any = {}
    try { biz = JSON.parse(profile?.biz_profile || '{}') } catch(e) {}

    const latest   = fin?.[0]
    const prev     = fin?.[1]
    const prevPrev = fin?.[2]

    const revenue  = latest?.revenue  || parseFloat(biz.rev)  || 0
    const expenses = latest?.expenses || parseFloat(biz.exp)  || 0
    const emi      = latest?.emi      || parseFloat(biz.emi)  || 0
    const reserve  = parseFloat(biz.reserve) || 0

    const scores = calcHealthScore({ revenue, expenses, emi, reserve, prevRevenue: prev?.revenue, prevPrevRevenue: prevPrev?.revenue })
    const today  = new Date().toISOString().split('T')[0]

    await serviceSupabase.from('health_scores').upsert({ user_id: user.id, score_date: today, ...scores }, { onConflict: 'user_id,score_date' })

    const priorities = generatePriorities(scores, user.id)
    await serviceSupabase.from('daily_priorities').upsert(priorities, { onConflict: 'user_id,priority_date,priority_rank' })

    return new Response(JSON.stringify({ ok: true, score: scores.overall_score, scores, priorities }), { headers: { ...cors, 'Content-Type': 'application/json' } })

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } })
  }
})
