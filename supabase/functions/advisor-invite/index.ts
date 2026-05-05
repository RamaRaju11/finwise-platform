import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function buildInviteEmail(advisorName: string, clientName: string, inviteUrl: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">

  <tr><td style="background:#0f172a;border-radius:12px 12px 0 0;padding:24px 32px">
    <span style="font-size:20px;font-weight:900;color:#fff">💡 Fin<span style="color:#a5b4fc">Wise</span></span>
  </td></tr>

  <tr><td style="background:#fff;padding:32px">
    <h2 style="margin:0 0 12px;color:#0f172a;font-size:1.2rem">You've been invited to FinWise</h2>
    <p style="color:#475569;font-size:.9rem;line-height:1.6;margin:0 0 20px">
      <strong>${advisorName}</strong> has invited ${clientName ? '<strong>' + clientName + '</strong>' : 'you'} to connect on FinWise — a free financial health platform for small businesses.
    </p>
    <p style="color:#475569;font-size:.9rem;line-height:1.6;margin:0 0 24px">
      Your advisor will help you track your business health score, identify funding opportunities, and build a stronger financial foundation.
    </p>
    <div style="text-align:center;margin-bottom:24px">
      <a href="${inviteUrl}" style="display:inline-block;background:#6366f1;color:#fff;padding:14px 32px;border-radius:8px;font-size:.95rem;font-weight:800;text-decoration:none">Accept Invitation →</a>
    </div>
    <p style="color:#94a3b8;font-size:.75rem;text-align:center">
      Button not working? Copy this link: <br/>${inviteUrl}
    </p>
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
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401, headers: { ...cors, 'Content-Type': 'application/json' } })

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authHeader } } })
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...cors, 'Content-Type': 'application/json' } })

    const serviceSupabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    const body = await req.json().catch(() => ({}))
    const { client_id, base_url } = body

    if (!client_id) return new Response(JSON.stringify({ error: 'client_id required' }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } })

    // Get the invite record
    const { data: invite } = await serviceSupabase.from('advisor_clients').select('*').eq('id', client_id).eq('advisor_id', user.id).maybeSingle()
    if (!invite) return new Response(JSON.stringify({ error: 'Client not found' }), { status: 404, headers: { ...cors, 'Content-Type': 'application/json' } })

    // Get advisor name from profile
    const { data: profile } = await serviceSupabase.from('profiles').select('biz_profile').eq('id', user.id).maybeSingle()
    let advisorName = user.email || 'Your advisor'
    try {
      const biz = JSON.parse(profile?.biz_profile || '{}')
      if (biz.bizName) advisorName = biz.bizName
    } catch(e) {}

    const appBase = base_url || 'http://localhost:8080'
    const inviteUrl = `${appBase}/accept-invite.html?token=${invite.invite_token}`
    const html = buildInviteEmail(advisorName, invite.client_name, inviteUrl)

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}` },
      body: JSON.stringify({
        from: 'FinWise <onboarding@resend.dev>',
        to: [invite.client_email],
        subject: `${advisorName} invited you to FinWise`,
        html,
      })
    })

    const resendData = await resendRes.json()
    if (!resendRes.ok) return new Response(JSON.stringify({ error: resendData.message || 'Email failed' }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } })

    return new Response(JSON.stringify({ ok: true, email_id: resendData.id, invite_url: inviteUrl }), { headers: { ...cors, 'Content-Type': 'application/json' } })

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } })
  }
})
