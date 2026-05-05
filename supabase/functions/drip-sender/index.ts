import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_KEY  = Deno.env.get('RESEND_API_KEY') ?? ''
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const serviceKey  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const FROM_EMAIL  = 'FinWise <hello@finwise.app>'

/* ── Email content per day ── */
const EMAILS: Record<number, { subject: string; html: (name: string) => string }> = {

  1: {
    subject: 'Your FinWise trial is ready — 3 things to do first',
    html: (name) => `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#f4f6f9;padding:32px 0;margin:0">
<table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden">
  <tr><td style="background:#0f172a;padding:24px 32px">
    <div style="font-size:1.4rem;font-weight:900;color:#fff">💡 Fin<span style="color:#818cf8">Wise</span></div>
  </td></tr>
  <tr><td style="padding:32px">
    <h1 style="font-size:1.3rem;color:#1e293b;margin:0 0 12px">Welcome, ${name}! Your 7-day trial has started 🎉</h1>
    <p style="color:#475569;font-size:.9rem;line-height:1.6;margin:0 0 24px">
      You now have full Starter access — here are the 3 tools that will save you the most money this week:
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
      <tr><td style="background:#f8fafc;border-left:3px solid #2563eb;border-radius:6px;padding:14px;margin-bottom:10px">
        <div style="font-weight:800;color:#1e293b;margin-bottom:4px">🏦 Loan Safety Score</div>
        <div style="font-size:.82rem;color:#64748b">Will this loan hurt or help your business? Get a SAFE / RISKY / DANGEROUS verdict in 60 seconds.</div>
      </td></tr>
      <tr><td style="height:8px"></td></tr>
      <tr><td style="background:#f8fafc;border-left:3px solid #16a34a;border-radius:6px;padding:14px">
        <div style="font-weight:800;color:#1e293b;margin-bottom:4px">💸 Owner's Pay Optimizer</div>
        <div style="font-size:.82rem;color:#64748b">Find out exactly how much you can safely pay yourself without hurting your business.</div>
      </td></tr>
      <tr><td style="height:8px"></td></tr>
      <tr><td style="background:#f8fafc;border-left:3px solid #7c3aed;border-radius:6px;padding:14px">
        <div style="font-weight:800;color:#1e293b;margin-bottom:4px">✅ Loan Eligibility</div>
        <div style="font-size:.82rem;color:#64748b">See which lenders will approve you before you even apply. Save time and protect your credit score.</div>
      </td></tr>
    </table>
    <table cellpadding="0" cellspacing="0"><tr><td style="background:#2563eb;border-radius:8px">
      <a href="https://yoursite.com/dashboard.html" style="display:inline-block;padding:12px 28px;color:#fff;font-weight:800;text-decoration:none;font-size:.9rem">Open My Dashboard →</a>
    </td></tr></table>
    <p style="font-size:.75rem;color:#94a3b8;margin-top:24px">Your trial ends in 7 days. No charge until you choose to upgrade.</p>
  </td></tr>
  <tr><td style="background:#f8fafc;padding:16px 32px;text-align:center;font-size:.72rem;color:#94a3b8">
    © 2026 FinWise · You received this because you signed up for a free trial
  </td></tr>
</table></body></html>`
  },

  3: {
    subject: 'Day 3: Are you protecting your cash flow?',
    html: (name) => `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#f4f6f9;padding:32px 0;margin:0">
<table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden">
  <tr><td style="background:#0f172a;padding:24px 32px">
    <div style="font-size:1.4rem;font-weight:900;color:#fff">💡 Fin<span style="color:#818cf8">Wise</span></div>
  </td></tr>
  <tr><td style="padding:32px">
    <h1 style="font-size:1.3rem;color:#1e293b;margin:0 0 12px">Hey ${name}, 4 days left on your trial</h1>
    <p style="color:#475569;font-size:.9rem;line-height:1.6;margin:0 0 20px">
      Most small business owners don't know their cash runway — how many months they could survive if revenue dropped 30%. Do you?
    </p>
    <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:8px;padding:16px;margin-bottom:20px">
      <div style="font-weight:800;color:#92400e;margin-bottom:6px">⏱ 60-second check: Cash Runway</div>
      <div style="font-size:.84rem;color:#78350f;line-height:1.5">Enter your numbers and find out how long your business can survive a slow month. Then run the Stress Test to see what happens at 20%, 30%, 40% revenue drops.</div>
    </div>
    <p style="color:#475569;font-size:.88rem;line-height:1.6;margin:0 0 24px">
      <strong>Also unlocked in your trial:</strong> Business Health Score (A–F grade), Grant Finder (free money you may qualify for), and Owner's Pay Optimizer.
    </p>
    <table cellpadding="0" cellspacing="0" style="margin-bottom:16px"><tr><td style="background:#2563eb;border-radius:8px">
      <a href="https://yoursite.com/dashboard.html" style="display:inline-block;padding:12px 28px;color:#fff;font-weight:800;text-decoration:none;font-size:.9rem">Continue Using FinWise →</a>
    </td></tr></table>
    <p style="font-size:.82rem;color:#64748b">Upgrade to Starter ($9/mo) to keep all these tools after your trial ends.</p>
  </td></tr>
  <tr><td style="background:#f8fafc;padding:16px 32px;text-align:center;font-size:.72rem;color:#94a3b8">
    © 2026 FinWise · Unsubscribe
  </td></tr>
</table></body></html>`
  },

  7: {
    subject: '⚠️ Your FinWise trial ends today — lock in your plan',
    html: (name) => `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#f4f6f9;padding:32px 0;margin:0">
<table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden">
  <tr><td style="background:#dc2626;padding:24px 32px">
    <div style="font-size:1.4rem;font-weight:900;color:#fff">💡 Fin<span style="color:#fca5a5">Wise</span></div>
  </td></tr>
  <tr><td style="padding:32px">
    <h1 style="font-size:1.3rem;color:#1e293b;margin:0 0 12px">⚠️ ${name}, your trial ends today</h1>
    <p style="color:#475569;font-size:.9rem;line-height:1.6;margin:0 0 20px">
      After today, you'll lose access to these tools unless you upgrade:
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
      <tr>
        <td width="50%" style="padding-right:6px;padding-bottom:8px">
          <div style="background:#fef2f2;border-radius:6px;padding:10px 12px;font-size:.8rem;font-weight:700;color:#7f1d1d">✗ Loan Eligibility</div>
        </td>
        <td width="50%" style="padding-left:6px;padding-bottom:8px">
          <div style="background:#fef2f2;border-radius:6px;padding:10px 12px;font-size:.8rem;font-weight:700;color:#7f1d1d">✗ Owner's Pay</div>
        </td>
      </tr>
      <tr>
        <td style="padding-right:6px;padding-bottom:8px">
          <div style="background:#fef2f2;border-radius:6px;padding:10px 12px;font-size:.8rem;font-weight:700;color:#7f1d1d">✗ Business Health Score</div>
        </td>
        <td style="padding-left:6px;padding-bottom:8px">
          <div style="background:#fef2f2;border-radius:6px;padding:10px 12px;font-size:.8rem;font-weight:700;color:#7f1d1d">✗ Grant Finder</div>
        </td>
      </tr>
    </table>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin-bottom:24px">
      <div style="font-weight:800;color:#15803d;font-size:.95rem;margin-bottom:4px">Starter Plan — $9/month</div>
      <div style="font-size:.84rem;color:#166534">All 10 tools · Cancel any time · No contracts</div>
    </div>
    <table cellpadding="0" cellspacing="0"><tr><td style="background:#dc2626;border-radius:8px">
      <a href="https://yoursite.com/pricing.html" style="display:inline-block;padding:13px 32px;color:#fff;font-weight:800;text-decoration:none;font-size:.95rem">Upgrade Now — $9/mo →</a>
    </td></tr></table>
    <p style="font-size:.75rem;color:#94a3b8;margin-top:16px">You'll keep your business profile and all saved data regardless.</p>
  </td></tr>
  <tr><td style="background:#f8fafc;padding:16px 32px;text-align:center;font-size:.72rem;color:#94a3b8">
    © 2026 FinWise · Unsubscribe
  </td></tr>
</table></body></html>`
  }
}

async function sendEmail(to: string, name: string, day: number) {
  const tpl = EMAILS[day]
  if (!tpl) return

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from   : FROM_EMAIL,
      to     : [to],
      subject: tpl.subject,
      html   : tpl.html(name || 'there'),
    }),
  })
}

serve(async () => {
  const supabase = createClient(supabaseUrl, serviceKey)
  const now = new Date()
  const results: string[] = []

  for (const day of [1, 3, 7]) {
    /* Target: users whose trial started exactly `day` days ago */
    const dayStart = new Date(now.getTime() - day * 24 * 60 * 60 * 1000)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(dayStart)
    dayEnd.setHours(23, 59, 59, 999)

    const { data: users } = await supabase
      .from('profiles')
      .select('id, email, full_name, drip_sent, plan, trial_ends_at')
      .gte('created_at', dayStart.toISOString())
      .lte('created_at', dayEnd.toISOString())
      .not('trial_ends_at', 'is', null)

    for (const user of users || []) {
      /* Skip if already paid or already sent this day's email */
      if (user.plan !== 'free') continue
      const sent: number[] = user.drip_sent || []
      if (sent.includes(day)) continue

      await sendEmail(user.email, user.full_name || '', day)

      await supabase
        .from('profiles')
        .update({ drip_sent: [...sent, day] })
        .eq('id', user.id)

      results.push(`Day ${day} → ${user.email}`)
      console.log(`📧 Drip day ${day} sent to ${user.email}`)
    }
  }

  return new Response(JSON.stringify({ ok: true, sent: results }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
