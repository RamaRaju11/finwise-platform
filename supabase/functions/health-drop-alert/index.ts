import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function gradeLabel(s: number) { return s >= 85 ? 'A' : s >= 70 ? 'B' : s >= 52 ? 'C' : s >= 36 ? 'D' : 'F' }
function gradeColor(s: number) { return s >= 70 ? '#16a34a' : s >= 52 ? '#d97706' : '#dc2626' }

function buildDropEmail(bizName: string, prev: number, curr: number, drop: number, appUrl: string) {
  const grade = gradeLabel(curr)
  const color = gradeColor(curr)
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">

  <tr><td style="background:#0f172a;border-radius:12px 12px 0 0;padding:24px 32px">
    <span style="font-size:20px;font-weight:900;color:#fff">💡 Fin<span style="color:#a5b4fc">Wise</span></span>
  </td></tr>

  <tr><td style="background:#fff;padding:32px">
    <div style="background:#fee2e2;border:1.5px solid #fca5a5;border-radius:10px;padding:18px 22px;margin-bottom:24px;text-align:center">
      <div style="font-size:2rem;margin-bottom:6px">📉</div>
      <div style="font-size:1.1rem;font-weight:900;color:#991b1b">Health Score Dropped ${drop} Points</div>
      <div style="font-size:.88rem;color:#7f1d1d;margin-top:4px">${bizName || 'Your business'} needs attention</div>
    </div>

    <div style="display:flex;gap:16px;margin-bottom:24px;text-align:center">
      <div style="flex:1;background:#f8fafc;border-radius:8px;padding:14px">
        <div style="font-size:.72rem;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px">Previous Score</div>
        <div style="font-size:2rem;font-weight:900;color:#64748b">${prev}</div>
        <div style="font-size:.75rem;color:#94a3b8">Grade ${gradeLabel(prev)}</div>
      </div>
      <div style="flex:1;background:#fff5f5;border:2px solid #fca5a5;border-radius:8px;padding:14px">
        <div style="font-size:.72rem;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px">Current Score</div>
        <div style="font-size:2rem;font-weight:900;color:${color}">${curr}</div>
        <div style="font-size:.75rem;color:${color}">Grade ${grade}</div>
      </div>
    </div>

    <p style="color:#475569;font-size:.9rem;line-height:1.65;margin:0 0 20px">
      A drop of <strong>${drop} points</strong> may signal changes in your cash flow, debt load, or revenue stability. Early action prevents small problems from becoming big ones.
    </p>

    <div style="text-align:center;margin-bottom:24px">
      <a href="${appUrl}/checkup.html" style="display:inline-block;background:#2563eb;color:#fff;padding:14px 32px;border-radius:8px;font-size:.95rem;font-weight:800;text-decoration:none">Run a Full Checkup →</a>
    </div>

    <div style="background:#f8fafc;border-radius:8px;padding:16px 20px;margin-bottom:20px">
      <div style="font-size:.72rem;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em;margin-bottom:10px">Quick Actions</div>
      <a href="${appUrl}/modules/cashRunway.test.html" style="display:block;color:#2563eb;font-size:.88rem;text-decoration:none;padding:6px 0;border-bottom:1px solid #e2e8f0">💧 Check Cash Runway →</a>
      <a href="${appUrl}/whatif.html" style="display:block;color:#2563eb;font-size:.88rem;text-decoration:none;padding:6px 0;border-bottom:1px solid #e2e8f0">🔮 Model Recovery Scenarios →</a>
      <a href="${appUrl}/modules/loanRefinanceAnalyzer.test.html" style="display:block;color:#2563eb;font-size:.88rem;text-decoration:none;padding:6px 0">🔄 Refinance Options →</a>
    </div>
  </td></tr>

  <tr><td style="background:#f8fafc;border-radius:0 0 12px 12px;padding:16px 32px;text-align:center;border-top:1px solid #e2e8f0">
    <span style="font-size:12px;color:#94a3b8">FinWise · Free financial tools for small businesses</span>
  </td></tr>

</table>
</td></tr></table>
</body></html>`
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    const serviceSupabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    const body = await req.json().catch(() => ({}))
    const appUrl = body.app_url || 'https://your-site.github.io/smallbiz-platform'

    // Get all users with 2+ health score entries
    const { data: drops } = await serviceSupabase.rpc('get_health_drops', { min_drop: 10 })

    if (!drops || drops.length === 0) {
      return new Response(JSON.stringify({ ok: true, alerts_sent: 0 }), { headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    let sent = 0
    for (const row of drops) {
      const { user_id, prev_score, curr_score, drop_points, email, biz_profile } = row
      let biz: any = {}
      try { biz = JSON.parse(biz_profile || '{}') } catch(e) {}
      const bizName = biz.bizName || ''

      const today = new Date().toISOString().split('T')[0]

      // Check we haven't already sent a drop alert today for this user
      const { data: existingAlert } = await serviceSupabase.from('alerts').select('id').eq('user_id', user_id).eq('type', 'score_drop').gte('created_at', today).maybeSingle()
      if (existingAlert) continue

      // Send email
      const html = buildDropEmail(bizName, Math.round(prev_score), Math.round(curr_score), Math.round(drop_points), appUrl)
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}` },
        body: JSON.stringify({ from: 'FinWise <alerts@resend.dev>', to: [email], subject: `⚠️ Your health score dropped ${Math.round(drop_points)} points — action needed`, html })
      })

      if (resendRes.ok) {
        // Record alert so we don't re-send
        await serviceSupabase.from('alerts').insert({ user_id, type: 'score_drop', urgency: 'high', title: `Health score dropped ${Math.round(drop_points)} pts`, body: `Score fell from ${Math.round(prev_score)} to ${Math.round(curr_score)}` })
        sent++
      }
    }

    return new Response(JSON.stringify({ ok: true, alerts_sent: sent }), { headers: { ...cors, 'Content-Type': 'application/json' } })

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } })
  }
})
