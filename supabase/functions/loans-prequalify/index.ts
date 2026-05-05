import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Simulate lender decision engine (Lendio + Bluevine models)
// Replace with real API calls once partner credentials are obtained
function simulateLendioOffers(p: any): any[] {
  const offers: any[] = []
  // Table columns: monthly_revenue, expenses, emi (not monthly_expenses / monthly_emi)
  const dscr = p.emi > 0 ? (p.monthly_revenue - p.expenses) / p.emi : 99
  const netCashFlow = p.monthly_revenue - p.expenses - p.emi

  // Lendio Term Loan — needs revenue >= 5000/mo
  if (p.monthly_revenue >= 5000) {
    const hs = p.health_score || 50
    const maxLoan = Math.min(p.monthly_revenue * 10, 500000)
    const approval = Math.min(95, Math.round(40 + hs * 0.4 + (dscr > 1.25 ? 15 : 0)))
    offers.push({
      lender_name: 'Lendio',
      loan_type: 'Term Loan',
      amount: Math.round(maxLoan / 1000) * 1000,
      rate_min: hs >= 70 ? 8.5 : hs >= 50 ? 12.0 : 18.0,
      rate_max: hs >= 70 ? 14.0 : hs >= 50 ? 22.0 : 35.0,
      term_months: 36,
      monthly_payment: Math.round(maxLoan / 36 * 1.15),
      approval_probability: approval,
      offer_url: 'https://www.lendio.com/small-business-loans/',
      requirements: 'Min. $5K/month revenue, 1+ years in business',
    })
  }

  // Lendio SBA Loan — needs revenue >= 10000, 2+ years
  if (p.monthly_revenue >= 10000 && p.years_in_business >= 2) {
    const hs = p.health_score || 50
    const maxLoan = Math.min(p.monthly_revenue * 30, 5000000)
    const approval = Math.min(85, Math.round(30 + hs * 0.5))
    offers.push({
      lender_name: 'Lendio (SBA)',
      loan_type: 'SBA 7(a) Loan',
      amount: Math.round(maxLoan / 10000) * 10000,
      rate_min: 6.5,
      rate_max: 10.5,
      term_months: 120,
      monthly_payment: Math.round(maxLoan / 120 * 1.08),
      approval_probability: approval,
      offer_url: 'https://www.lendio.com/sba-loans/',
      requirements: 'Min. $10K/month revenue, 2+ years, good credit',
    })
  }

  // Lendio Line of Credit — needs revenue >= 3000
  if (p.monthly_revenue >= 3000) {
    const hs = p.health_score || 50
    const creditLine = Math.min(p.monthly_revenue * 6, 250000)
    const approval = Math.min(90, Math.round(35 + hs * 0.45))
    offers.push({
      lender_name: 'Lendio',
      loan_type: 'Business Line of Credit',
      amount: Math.round(creditLine / 1000) * 1000,
      rate_min: hs >= 70 ? 10.0 : 16.0,
      rate_max: hs >= 70 ? 18.0 : 28.0,
      term_months: 12,
      monthly_payment: Math.round(creditLine * 0.03),
      approval_probability: approval,
      offer_url: 'https://www.lendio.com/business-line-of-credit/',
      requirements: 'Min. $3K/month revenue, 6+ months in business',
    })
  }

  return offers
}

function simulateBluevineOffers(p: any): any[] {
  const offers: any[] = []

  // Bluevine Line of Credit — needs revenue >= 3000/mo
  if (p.monthly_revenue >= 3000) {
    const hs = p.health_score || 50
    const creditLine = Math.min(p.monthly_revenue * 5, 250000)
    const approval = Math.min(92, Math.round(40 + hs * 0.42))
    offers.push({
      lender_name: 'Bluevine',
      loan_type: 'Flex Line of Credit',
      amount: Math.round(creditLine / 1000) * 1000,
      rate_min: hs >= 70 ? 6.2 : hs >= 50 ? 9.8 : 14.5,
      rate_max: hs >= 70 ? 11.5 : hs >= 50 ? 17.0 : 24.0,
      term_months: 6,
      monthly_payment: Math.round(creditLine * 0.025),
      approval_probability: approval,
      offer_url: 'https://www.bluevine.com/business-line-of-credit/',
      requirements: 'Min. $3K/month revenue, personal credit 625+',
    })
  }

  // Bluevine Term Loan — needs revenue >= 6000
  if (p.monthly_revenue >= 6000) {
    const hs = p.health_score || 50
    const maxLoan = Math.min(p.monthly_revenue * 8, 250000)
    const approval = Math.min(88, Math.round(35 + hs * 0.44))
    offers.push({
      lender_name: 'Bluevine',
      loan_type: 'Term Loan',
      amount: Math.round(maxLoan / 1000) * 1000,
      rate_min: hs >= 70 ? 7.8 : 13.0,
      rate_max: hs >= 70 ? 14.5 : 26.0,
      term_months: 24,
      monthly_payment: Math.round(maxLoan / 24 * 1.12),
      approval_probability: approval,
      offer_url: 'https://www.bluevine.com/business-loans/',
      requirements: 'Min. $6K/month revenue, 2+ years in business',
    })
  }

  return offers
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

    // Load the loan profile (must call loans-build-profile first)
    const { data: lp } = await serviceSupabase.from('loan_profiles').select('*').eq('user_id', user.id).maybeSingle()
    if (!lp) return new Response(JSON.stringify({ error: 'No loan profile. Call loans-build-profile first.' }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } })

    // Generate offers from both lenders
    const lendioOffers = simulateLendioOffers(lp)
    const bluevineOffers = simulateBluevineOffers(lp)
    const allOffers = [...lendioOffers, ...bluevineOffers]

    // Sort by approval_probability descending
    allOffers.sort((a, b) => b.approval_probability - a.approval_probability)

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

    // Delete old offers and insert new ones — only insert columns that exist in the table
    await serviceSupabase.from('loan_offers').delete().eq('user_id', user.id)

    if (allOffers.length > 0) {
      const toInsert = allOffers.map(o => ({
        user_id: user.id,
        lender_name: o.lender_name,
        loan_type: o.loan_type,
        amount: o.amount,
        rate_min: o.rate_min,
        rate_max: o.rate_max,
        term_months: o.term_months,
        monthly_payment: o.monthly_payment,
        approval_probability: o.approval_probability,
        offer_url: o.offer_url,
        expires_at: expiresAt,
      }))
      const { error: insertErr } = await serviceSupabase.from('loan_offers').insert(toInsert)
      if (insertErr) return new Response(JSON.stringify({ error: 'Offer insert failed: ' + insertErr.message }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    return new Response(JSON.stringify({
      ok: true,
      offers_count: allOffers.length,
      offers: allOffers,
      profile_summary: {
        monthly_revenue: lp.monthly_revenue,
        health_score: lp.health_score,
        years_in_business: lp.years_in_business,
      }
    }), { headers: { ...cors, 'Content-Type': 'application/json' } })

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } })
  }
})
