import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function scoreColor(s: number){ return s >= 70 ? '#16a34a' : s >= 45 ? '#d97706' : '#dc2626' }
function scoreLabel(s: number){ return s >= 70 ? 'Healthy' : s >= 45 ? 'Caution' : 'At Risk' }

function buildEmail(biz: any, score: any, priorities: any[], unsubToken: string) {
  const s = Math.round(score?.overall_score || 0)
  const rev = score?.dimension_data?.revenue || 0
  const exp = score?.dimension_data?.expenses || 0
  const net = rev - exp
  const runway = score?.dimension_data?.runway || 0

  const priRows = (priorities || []).slice(0, 3).map((p: any) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f1f5f9">
        <strong style="color:#0f172a;font-size:14px">${p.title}</strong><br/>
        <span style="color:#64748b;font-size:13px">${p.description}</span>
      </td>
    </tr>`).join('')

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">

  <!-- Header -->
  <tr><td style="background:#0f172a;border-radius:12px 12px 0 0;padding:24px 32px">
    <span style="font-size:20px;font-weight:900;color:#fff">💡 Fin<span style="color:#a5b4fc">Wise</span></span>
    <span style="float:right;font-size:12px;color:#64748b;margin-top:4px">Weekly Digest</span>
  </td></tr>

  <!-- Score banner -->
  <tr><td style="background:#1e293b;padding:20px 32px;text-align:center">
    <div style="font-size:48px;font-weight:900;color:${scoreColor(s)}">${s}</div>
    <div style="font-size:12px;color:#94a3b8;margin-top:2px">Health Score — <strong style="color:${scoreColor(s)}">${scoreLabel(s)}</strong></div>
  </td></tr>

  <!-- Metrics -->
  <tr><td style="background:#fff;padding:24px 32px">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="text-align:center;padding:0 8px">
          <div style="font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px">Revenue</div>
          <div style="font-size:22px;font-weight:900;color:#0f172a">$${Math.round(rev).toLocaleString()}</div>
        </td>
        <td style="text-align:center;padding:0 8px;border-left:1px solid #f1f5f9;border-right:1px solid #f1f5f9">
          <div style="font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px">Expenses</div>
          <div style="font-size:22px;font-weight:900;color:#0f172a">$${Math.round(exp).toLocaleString()}</div>
        </td>
        <td style="text-align:center;padding:0 8px">
          <div style="font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px">Net</div>
          <div style="font-size:22px;font-weight:900;color:${net >= 0 ? '#16a34a' : '#dc2626'}">${net >= 0 ? '+' : ''}$${Math.round(net).toLocaleString()}</div>
        </td>
      </tr>
    </table>
    ${runway > 0 ? `<div style="margin-top:16px;background:#f8fafc;border-radius:8px;padding:12px 16px;font-size:13px;color:#475569">⏱ <strong>Cash Runway:</strong> ${Math.round(runway * 10) / 10} months</div>` : ''}
  </td></tr>

  <!-- Priorities -->
  ${priRows ? `<tr><td style="background:#fff;padding:0 32px 24px">
    <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:#94a3b8;margin-bottom:12px">This Week's Priorities</div>
    <table width="100%" cellpadding="0" cellspacing="0">${priRows}</table>
  </td></tr>` : ''}

  <!-- CTA -->
  <tr><td style="background:#fff;padding:0 32px 28px;text-align:center">
    <a href="http://localhost:8080/dashboard.html" style="display:inline-block;background:#6366f1;color:#fff;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:800;text-decoration:none">View Full Dashboard →</a>
  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#f8fafc;border-radius:0 0 12px 12px;padding:16px 32px;text-align:center;border-top:1px solid #e2e8f0">
    <span style="font-size:12px;color:#94a3b8">FinWise Weekly Digest · Sent every Monday</span><br/>
    <a href="https://ugtfdtdbegdjqrdtplkg.supabase.co/functions/v1/email-unsubscribe?token=${unsubToken}" style="font-size:11px;color:#94a3b8">Unsubscribe</a>
  </td></tr>

</table>
</td></tr></table>
</body></html>`
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

    const { data: prefs } = await serviceSupabase.from('email_preferences').select('*').eq('user_id', user.id).maybeSingle()
    if (prefs?.unsubscribed) return new Response(JSON.stringify({ ok: false, reason: 'unsubscribed' }), { headers: { ...cors, 'Content-Type': 'application/json' } })

    const { data: score } = await serviceSupabase.from('health_scores').select('*').eq('user_id', user.id).order('score_date', { ascending: false }).limit(1).maybeSingle()
    const { data: priorities } = await serviceSupabase.from('daily_priorities').select('*').eq('user_id', user.id).order('priority_date', { ascending: false }).order('priority_rank').limit(3)
    const { data: profile } = await serviceSupabase.from('profiles').select('biz_profile').eq('id', user.id).maybeSingle()

    let biz: any = {}
    try { biz = JSON.parse(profile?.biz_profile || '{}') } catch(e) {}

    const body2 = await req.json().catch(() => ({}))
    const toEmail = body2.test_email || user.email
    if (!toEmail) return new Response(JSON.stringify({ error: 'No email found' }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } })

    const unsubToken = btoa(user.id).replace(/[^a-zA-Z0-9]/g, '').slice(0, 32)
    const html = buildEmail(biz, score, priorities || [], unsubToken)

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}` },
      body: JSON.stringify({
        from: 'FinWise Weekly <onboarding@resend.dev>',
        to: [toEmail],
        subject: `Your FinWise Weekly: Score ${Math.round(score?.overall_score || 0)}/100 — ${score?.overall_score >= 70 ? 'Healthy' : score?.overall_score >= 45 ? 'Caution' : 'At Risk'}`,
        html,
      })
    })

    const resendData = await resendRes.json()
    if (!resendRes.ok) return new Response(JSON.stringify({ error: resendData.message || 'Email send failed' }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } })

    return new Response(JSON.stringify({ ok: true, email_id: resendData.id, sent_to: toEmail }), { headers: { ...cors, 'Content-Type': 'application/json' } })

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } })
  }
})
