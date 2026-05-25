// ════════════════════════════════════════════════════════════════════
// verify-token
//   GET /verify-token?t=<token>
//
// Called by login.html on page load. Validates the magic link token
// and returns the user's profile + onboarding answers if valid.
//
// Token is valid if:
//   - exists in magic_links
//   - expires_at > now()
// We allow re-use within the hour (used_count++) — refreshing the
// login page shouldn't break the session.
// ════════════════════════════════════════════════════════════════════

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    const url = new URL(req.url)
    const token = url.searchParams.get('t')
    if (!token) return json({ valid: false, reason: 'missing_token' }, 400)

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // ── Look up the token ──────────────────────────────────────────
    const { data: link } = await admin
      .from('magic_links')
      .select('phone, expires_at, used_count')
      .eq('token', token)
      .single()

    if (!link) return json({ valid: false, reason: 'invalid' }, 200)

    const now = new Date()
    const expiresAt = new Date(link.expires_at)
    if (expiresAt <= now) {
      return json({ valid: false, reason: 'expired' }, 200)
    }

    // ── Fetch user profile (phone-keyed) ───────────────────────────
    const { data: user } = await admin
      .from('users_in')
      .select('*')
      .eq('phone', link.phone)
      .single()

    if (!user) {
      // Token is valid but onboarding never completed — point them back
      return json({ valid: false, reason: 'no_profile' }, 200)
    }

    // ── Mark used (allow re-use) ───────────────────────────────────
    await admin
      .from('magic_links')
      .update({
        used_at:    now.toISOString(),
        used_count: (link.used_count || 0) + 1
      })
      .eq('token', token)

    await admin
      .from('users_in')
      .update({ last_login_at: now.toISOString() })
      .eq('phone', link.phone)

    return json({
      valid: true,
      profile: {
        phone:          user.phone,
        biz_name:       user.biz_name,
        industry:       user.industry,
        industry_emoji: user.industry_emoji,
        revenue_band:   user.revenue_band,
        worry:          user.worry,
        worry_key:      user.worry_key,
        city:           user.city,
        plan:           user.plan,
        billing:        user.billing,
        subscription_status: user.subscription_status,
        current_period_end:  user.current_period_end,
        expires_at:     expiresAt.getTime()
      }
    })

  } catch (e) {
    console.error('[verify-token] error:', e)
    return json({ valid: false, reason: 'server_error' }, 500)
  }
})

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' }
  })
}
