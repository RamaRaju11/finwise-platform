import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_KEY = Deno.env.get('RESEND_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

function fmt(n: number) {
  return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function healthGrade(score: number) {
  if (score >= 80) return { grade: 'A', color: '#16a34a', text: 'Excellent financial health' }
  if (score >= 65) return { grade: 'B', color: '#2563eb', text: 'Good financial position' }
  if (score >= 50) return { grade: 'C', color: '#d97706', text: 'Fair — some areas to improve' }
  if (score >= 35) return { grade: 'D', color: '#ea580c', text: 'Needs attention' }
  return { grade: 'F', color: '#dc2626', text: 'Critical — immediate review recommended' }
}

function calcScore(d: Record<string, number>) {
  let score = 50
  const rev = d.rev || 0, exp = d.exp || 0, emi = d.emi || 0, reserve = d.reserve || 0
  const net = rev - exp - emi
  const margin = rev > 0 ? (net / rev) * 100 : 0
  const burn = exp + emi
  const runway = burn > 0 ? reserve / burn : 0
  if (margin > 20) score += 15; else if (margin > 10) score += 8; else if (margin < 0) score -= 20
  if (runway > 6) score += 15; else if (runway > 3) score += 8; else if (runway < 1) score -= 15
  if (rev > 0 && emi / rev < 0.3) score += 10; else if (rev > 0 && emi / rev > 0.5) score -= 10
  return Math.max(0, Math.min(100, Math.round(score)))
}

// deno-lint-ignore no-explicit-any
function buildEmailHtml(portal: any, advisor: any) {
  const d = portal.shared_data || {}
  const wl = {
    brand: advisor?.wl_brand_name || 'FinWise',
    color: advisor?.wl_color || '#4f46e5',
    tagline: advisor?.wl_tagline || 'Financial Advisory Services',
    hide: advisor?.wl_hide_finwise || false,
  }
  const rev = d.rev || 0, exp = d.exp || 0, emi = d.emi || 0, reserve = d.reserve || 0
  const net = rev - exp - emi
  const burn = exp + emi
  const runway = burn > 0 ? Math.floor(reserve / burn) : 0
  const margin = rev > 0 ? Math.round((net / rev) * 100) : 0
  const now = new Date()
  const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  let sections = ''

  if (d.includeRevenue && rev > 0) {
    sections += `
    <tr><td style="padding:16px 24px 0">
      <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#94a3b8;margin:0 0 10px">Monthly Financial Summary</p>
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td width="33%" style="padding:10px;background:#f0f9ff;border-radius:8px;text-align:center">
          <div style="font-size:10px;color:#64748b;font-weight:700;text-transform:uppercase;margin-bottom:4px">Revenue</div>
          <div style="font-size:22px;font-weight:900;color:#2563eb">${fmt(rev)}</div>
        </td>
        <td width="4%"></td>
        <td width="33%" style="padding:10px;background:#fffbeb;border-radius:8px;text-align:center">
          <div style="font-size:10px;color:#64748b;font-weight:700;text-transform:uppercase;margin-bottom:4px">Expenses</div>
          <div style="font-size:22px;font-weight:900;color:#d97706">${fmt(exp + emi)}</div>
        </td>
        <td width="4%"></td>
        <td width="26%" style="padding:10px;background:${net >= 0 ? '#f0fdf4' : '#fff5f5'};border-radius:8px;text-align:center">
          <div style="font-size:10px;color:#64748b;font-weight:700;text-transform:uppercase;margin-bottom:4px">Net Profit</div>
          <div style="font-size:22px;font-weight:900;color:${net >= 0 ? '#16a34a' : '#dc2626'}">${fmt(net)}</div>
          <div style="font-size:10px;color:#94a3b8">${margin}% margin</div>
        </td>
      </tr></table>
    </td></tr>`
  }

  if (d.includeCashflow && reserve > 0) {
    const rwColor = runway >= 6 ? '#16a34a' : runway >= 3 ? '#d97706' : '#dc2626'
    const rwText = runway >= 6 ? 'Healthy runway' : runway >= 3 ? 'Moderate — monitor spending' : 'Low runway — action needed'
    sections += `
    <tr><td style="padding:16px 24px 0">
      <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#94a3b8;margin:0 0 10px">Cash Runway</p>
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td width="48%" style="padding:10px;background:#f8fafc;border-radius:8px;text-align:center;border:1px solid #e2e8f0">
          <div style="font-size:10px;color:#64748b;font-weight:700;text-transform:uppercase;margin-bottom:4px">Cash Reserve</div>
          <div style="font-size:22px;font-weight:900;color:#2563eb">${fmt(reserve)}</div>
        </td>
        <td width="4%"></td>
        <td width="48%" style="padding:10px;background:#f8fafc;border-radius:8px;text-align:center;border:1px solid #e2e8f0">
          <div style="font-size:10px;color:#64748b;font-weight:700;text-transform:uppercase;margin-bottom:4px">Runway</div>
          <div style="font-size:22px;font-weight:900;color:${rwColor}">${runway} months</div>
          <div style="font-size:10px;color:${rwColor};font-weight:700">${rwText}</div>
        </td>
      </tr></table>
    </td></tr>`
  }

  if (d.includeHealth && rev > 0) {
    const score = calcScore(d)
    const { grade, color, text } = healthGrade(score)
    sections += `
    <tr><td style="padding:16px 24px 0">
      <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#94a3b8;margin:0 0 10px">Business Health Score</p>
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td width="80px" style="text-align:center">
          <div style="font-size:52px;font-weight:900;color:${color};line-height:1">${grade}</div>
        </td>
        <td style="padding-left:16px">
          <div style="font-size:14px;font-weight:700;color:#1e293b">Score: ${score}/100</div>
          <div style="font-size:12px;color:#64748b;margin-top:4px">${text}</div>
        </td>
      </tr></table>
    </td></tr>`
  }

  const customMsg = portal.custom_message
    ? `<tr><td style="padding:16px 24px 0">
        <div style="background:#f0f9ff;border:1.5px solid #bae6fd;border-radius:8px;padding:14px 16px">
          <p style="font-size:11px;font-weight:700;color:#0369a1;text-transform:uppercase;letter-spacing:.06em;margin:0 0 6px">Note from ${portal.advisor_name || 'Your Advisor'}</p>
          <p style="font-size:13px;color:#0c4a6e;margin:0;line-height:1.6">${portal.custom_message}</p>
        </div>
      </td></tr>`
    : ''

  const portalBtn = `<tr><td style="padding:20px 24px;text-align:center">
    <a href="https://app.finwise.ai/client-view.html?token=${portal.token}"
       style="display:inline-block;padding:12px 28px;background:${wl.color};color:#fff;border-radius:8px;font-size:14px;font-weight:800;text-decoration:none">
      View Full Report →
    </a>
  </td></tr>`

  const footer = wl.hide
    ? ''
    : `<tr><td style="padding:16px 24px;text-align:center;border-top:1px solid #f1f5f9;margin-top:8px">
        <p style="font-size:11px;color:#94a3b8;margin:0">Powered by <strong style="color:#4f46e5">FinWise</strong> — Financial Platform for Small Businesses</p>
      </td></tr>`

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head><body style="margin:0;padding:20px;background:#f0f4ff;font-family:Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto">
  <tr><td style="background:${wl.color};padding:20px 24px;border-radius:10px 10px 0 0">
    <p style="margin:0;font-size:18px;font-weight:900;color:#fff">${wl.brand}</p>
    <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,.75)">${wl.tagline}</p>
  </td></tr>
  <tr><td style="background:#fff;border-radius:0 0 10px 10px;box-shadow:0 2px 8px rgba(0,0,0,.08)">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="padding:20px 24px 0">
        <p style="font-size:15px;font-weight:700;color:#1e293b;margin:0">Hi ${portal.client_name},</p>
        <p style="font-size:13px;color:#64748b;margin:6px 0 0">Your monthly financial report for <strong>${d.bizName || 'your business'}</strong> — ${monthName}</p>
      </td></tr>
      ${customMsg}
      ${sections}
      ${portalBtn}
      ${footer}
    </table>
  </td></tr>
</table>
</body></html>`
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*' } })

  const client = createClient(SUPABASE_URL, SERVICE_KEY)

  const { data: portals, error } = await client
    .from('client_portals')
    .select('*, profiles!advisor_id(*)')
    .eq('schedule_enabled', true)

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  if (!portals?.length) return new Response(JSON.stringify({ sent: 0, msg: 'No scheduled portals' }), { status: 200 })

  let sent = 0, failed = 0
  for (const portal of portals) {
    const advisor = portal.profiles
    const html = buildEmailHtml(portal, advisor)
    const brandName = advisor?.wl_brand_name || 'FinWise'

    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'reports@resend.dev',
          to: portal.client_email,
          subject: `Your ${new Date().toLocaleDateString('en-US',{month:'long'})} Financial Report — ${brandName}`,
          html
        })
      })
      if (res.ok) {
        await client.from('client_portals').update({ schedule_last_sent: new Date().toISOString() }).eq('id', portal.id)
        sent++
      } else {
        failed++
      }
    } catch {
      failed++
    }
  }

  return new Response(JSON.stringify({ sent, failed }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  })
})
