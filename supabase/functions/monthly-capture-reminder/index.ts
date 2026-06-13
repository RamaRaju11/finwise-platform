// ════════════════════════════════════════════════════════════════════
// monthly-capture-reminder
//
// Runs on a cron schedule (intended: 3rd of each month at 10:00 IST).
// For each user who:
//   1. Has an email on file
//   2. Has opted in to email reminders (default: yes)
//   3. Does NOT yet have a health_scores row for last calendar month
// ...send a friendly nudge email asking them to log their numbers.
//
// Idempotent: writes a row to public.alerts with type='monthly_reminder'
// to prevent double-sending in the same month.
//
// Trigger options:
//   A) Supabase pg_cron — schedule via supabase/migrations
//   B) External cron (Vercel/Cloudflare/cron-job.org) → POST to this URL
//
// Env vars required:
//   RESEND_API_KEY        — same as health-drop-alert
//   PUBLIC_SITE_URL       — e.g. https://ramaraju11.github.io/finwise-platform
// ════════════════════════════════════════════════════════════════════

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function monthLabel(ym: string) {
  const [y, m] = ym.split('-').map(Number)
  const d = new Date(y, m - 1, 1)
  return d.toLocaleString('en-US', { month: 'long', year: 'numeric' })
}

function lastMonthKey(): string {
  const d = new Date()
  d.setDate(1)
  d.setMonth(d.getMonth() - 1)
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0')
}

function buildReminderEmail(bizName: string, missingMonth: string, appUrl: string): string {
  const monthName = monthLabel(missingMonth)
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">

  <tr><td style="background:#0f172a;border-radius:12px 12px 0 0;padding:24px 32px">
    <span style="font-size:20px;font-weight:900;color:#fff">📊 Biz<span style="color:#a5b4fc">Sco</span></span>
  </td></tr>

  <tr><td style="background:#fff;padding:32px">
    <div style="background:#eff6ff;border:1.5px solid #bfdbfe;border-radius:10px;padding:18px 22px;margin-bottom:24px">
      <div style="font-size:1.6rem;margin-bottom:4px">⏰</div>
      <div style="font-size:1.15rem;font-weight:900;color:#1e3a8a;margin-bottom:4px">Your ${monthName} numbers are ready</div>
      <div style="font-size:.88rem;color:#475569">60 seconds to log them — keeps your trend accurate.</div>
    </div>

    <p style="font-size:.95rem;color:#334155;line-height:1.6;margin-bottom:20px">
      Hi${bizName ? ' ' + bizName : ''},
    </p>
    <p style="font-size:.95rem;color:#334155;line-height:1.6;margin-bottom:20px">
      It's a new month — and your ${monthName} books are likely closed. A quick BizSco update keeps your <strong>health score trend</strong>, <strong>loan readiness</strong>, and <strong>cash runway</strong> accurate.
    </p>

    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:18px 22px;margin-bottom:24px">
      <div style="font-size:.78rem;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px">Just 4 numbers from your ${monthName} P&L</div>
      <ul style="font-size:.92rem;color:#334155;line-height:1.7;padding-left:20px;margin:0">
        <li>Monthly Revenue</li>
        <li>Monthly Expenses</li>
        <li>Monthly EMI / loan payments</li>
        <li>Cash Reserve</li>
      </ul>
    </div>

    <div style="text-align:center;margin-bottom:24px">
      <a href="${appUrl}/modules/businessHealthScore.test.html" style="display:inline-block;background:#4f46e5;color:#fff;font-weight:800;font-size:.95rem;padding:14px 28px;border-radius:8px;text-decoration:none">Log ${monthName} numbers →</a>
    </div>

    <p style="font-size:.82rem;color:#94a3b8;text-align:center;line-height:1.5;margin-bottom:0">
      Don't want monthly reminders? <a href="${appUrl}/dashboard.html?settings=alerts" style="color:#64748b">Manage reminders</a>
    </p>
  </td></tr>

  <tr><td style="background:#f8fafc;border-radius:0 0 12px 12px;padding:18px 32px;border-top:1px solid #e2e8f0;font-size:.74rem;color:#94a3b8;text-align:center">
    BizSco · The free financial dashboard for small business owners
  </td></tr>

</table>
</td></tr></table>
</body></html>`
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    const serviceSupabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const appUrl = Deno.env.get('PUBLIC_SITE_URL') || 'https://ramaraju11.github.io/finwise-platform'
    const missingMonth = lastMonthKey()
    const today = new Date().toISOString().split('T')[0]

    // Find users we should remind:
    //   - have an email on file
    //   - have NOT already received a monthly_reminder alert this calendar month
    //   - do NOT have a health_scores entry where score_date falls in last month
    //
    // We do a wide query of profiles + emails, then filter in JS for clarity.
    const { data: users, error: usersErr } = await serviceSupabase
      .from('profiles')
      .select('id, biz_profile, email')
      .not('email', 'is', null)

    if (usersErr) throw new Error('profiles query failed: ' + usersErr.message)
    if (!users || users.length === 0) {
      return json({ ok: true, sent: 0, message: 'no eligible users with email' })
    }

    let sent = 0
    let skipped_already_logged = 0
    let skipped_already_reminded = 0

    for (const u of users) {
      const { id: userId, biz_profile, email } = u as any

      // Skip if we already sent a reminder for this missingMonth
      const monthStart = missingMonth + '-01'
      const { data: existingAlert } = await serviceSupabase
        .from('alerts').select('id')
        .eq('user_id', userId)
        .eq('type', 'monthly_reminder')
        .gte('created_at', monthStart)
        .maybeSingle()
      if (existingAlert) { skipped_already_reminded++; continue }

      // Skip if user already logged a score for that month
      const lastDayOfMonth = new Date(
        parseInt(missingMonth.split('-')[0]),
        parseInt(missingMonth.split('-')[1]),
        0
      ).toISOString().split('T')[0]
      const { data: existingScore } = await serviceSupabase
        .from('health_scores').select('score_date')
        .eq('user_id', userId)
        .gte('score_date', missingMonth + '-01')
        .lte('score_date', lastDayOfMonth)
        .limit(1)
      if (existingScore && existingScore.length > 0) { skipped_already_logged++; continue }

      // Build + send email
      let biz: any = {}
      try { biz = JSON.parse(biz_profile || '{}') } catch (_e) {}
      const bizName = (biz.bizName || biz.businessName || '').trim()

      const html = buildReminderEmail(bizName, missingMonth, appUrl)
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`
        },
        body: JSON.stringify({
          from: 'BizSco <reminders@resend.dev>',
          to: [email],
          subject: `Your ${monthLabel(missingMonth)} numbers are ready — 60 sec to log them`,
          html
        })
      })

      if (resendRes.ok) {
        await serviceSupabase.from('alerts').insert({
          user_id: userId,
          type: 'monthly_reminder',
          urgency: 'low',
          title: `Reminder: log ${monthLabel(missingMonth)} numbers`,
          body: `Sent monthly capture reminder for ${missingMonth}`
        })
        sent++
      } else {
        console.warn('[monthly-capture-reminder] Resend send failed for', email, await resendRes.text())
      }
    }

    return json({ ok: true, missingMonth, sent, skipped_already_logged, skipped_already_reminded, total_users: users.length, ran_at: today })

  } catch (e) {
    console.error('[monthly-capture-reminder] error:', e)
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...cors, 'Content-Type': 'application/json' }
    })
  }
})

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' }
  })
}
