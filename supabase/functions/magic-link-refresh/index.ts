// ════════════════════════════════════════════════════════════════════
// magic-link-refresh
//
//   POST { phone: "+919876543210" }
//
// For users who already completed onboarding (exist in users_in) but
// their 1-hr magic link expired. We:
//   1. Validate phone
//   2. Rate-limit (max 3 refreshes per phone per hour)
//   3. Check user exists in users_in (i.e., they finished Q1-Q5 before)
//   4. Generate new token, insert into magic_links
//   5. Send the fresh link to their WhatsApp
//
// Security model: anyone can REQUEST a refresh for a phone number, but
// the link is delivered via WhatsApp — only the actual phone owner sees
// it. Same model as "forgot password" emails. Rate limit prevents abuse.
//
// Called by login.html when it shows the "Link expired" state.
// ════════════════════════════════════════════════════════════════════

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import {
  sendText,
  isValidPhone,
  normalizePhone,
  generateMagicToken
} from "../_shared/meta-api.ts"

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') {
    return json({ error: 'POST only' }, 405)
  }

  try {
    const { phone, country: rawCountry } = await req.json()
    const country = rawCountry === 'us' ? 'us' : 'in'

    if (!phone || !isValidPhone(phone, country)) {
      return json({
        error: country === 'us'
          ? 'Please enter a valid US WhatsApp number.'
          : 'Please enter a valid Indian WhatsApp number.'
      }, 400)
    }
    const normalized = normalizePhone(phone, country)

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // ── Rate limit: max 3 refreshes per phone per hour ────────────
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count: recentLinks } = await admin
      .from('magic_links')
      .select('token', { count: 'exact', head: true })
      .eq('phone', normalized)
      .eq('purpose', 'login')
      .gte('created_at', oneHourAgo)

    if ((recentLinks ?? 0) >= 3) {
      return json({
        ok: false,
        reason: 'rate_limited',
        error: 'You already requested 3 links in the last hour. Try again later.'
      }, 429)
    }

    // ── Check user has completed onboarding ────────────────────────
    const { data: user } = await admin
      .from('users_in')
      .select('phone, biz_name')
      .eq('phone', normalized)
      .single()

    if (!user) {
      return json({
        ok: false,
        reason: 'no_account',
        error: 'No BizSco account found for this number. Please complete signup first.',
        signup_url: (Deno.env.get('PUBLIC_SITE_URL') || 'https://ramaraju11.github.io/finwise-platform') + '/whatsapp-start.html'
      }, 404)
    }

    // ── Find their session (for the foreign key reference) ────────
    const { data: session } = await admin
      .from('wa_sessions')
      .select('id')
      .eq('phone', normalized)
      .single()

    // ── Generate new token, save, send via WhatsApp ────────────────
    const token     = generateMagicToken()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString()

    await admin.from('magic_links').insert({
      token,
      phone:      normalized,
      session_id: session?.id || null,
      purpose:    'login',
      expires_at: expiresAt
    })

    const baseUrl = Deno.env.get('PUBLIC_SITE_URL') ||
                    'https://ramaraju11.github.io/finwise-platform'
    const link = `${baseUrl}/login.html?t=${token}`

    const sendResult = await sendText(normalized,
      `🔗 Hi ${user.biz_name}!\n\n` +
      `Here's your fresh BizSco dashboard link (valid for 1 hour):\n\n` +
      `${link}\n\n` +
      `_Tap to open. Reply *HELP* if you need help._`
    )

    if (!sendResult.ok) {
      // Don't fail outright — token is already saved, user could try
      // the LINK command in WhatsApp as a fallback. But surface the
      // delivery failure so the frontend can advise them.
      return json({
        ok: true,
        delivered: false,
        message: 'Link created but WhatsApp delivery had a hiccup. Try sending LINK to our WhatsApp number directly.',
        debug:    sendResult.error
      })
    }

    // Mask the phone for display ("+91 98XX X43210" style)
    const masked = normalized.replace(/(\+91)(\d{2})(\d+)(\d{4})/, '$1 $2XX X$4')

    return json({
      ok:        true,
      delivered: true,
      sent_to:   masked,
      message:   `We've sent a fresh link to ${masked} on WhatsApp.`
    })

  } catch (e) {
    console.error('[magic-link-refresh] error:', e)
    return json({ error: (e as Error).message }, 500)
  }
})

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' }
  })
}
