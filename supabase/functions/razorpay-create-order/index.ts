// ════════════════════════════════════════════════════════════════════
// razorpay-create-order
//   POST { token: "<magic link token>", plan: "starter|pro|advisor", billing: "monthly|annual" }
//
// Verifies the user owns a valid magic link, then creates a Razorpay
// Order server-side using the secret key. Returns order_id which the
// browser uses to open Razorpay Checkout.
//
// Env vars:
//   RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
// ════════════════════════════════════════════════════════════════════

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Pricing — must match subscribe.html
const PRICING: Record<string, { monthly: number; annual: number }> = {
  starter: { monthly: 499,  annual: 399 * 12 },   // ₹4,788/yr
  pro:     { monthly: 1499, annual: 1199 * 12 },  // ₹14,388/yr
  advisor: { monthly: 3999, annual: 3199 * 12 }   // ₹38,388/yr
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST')    return json({ error: 'POST only' }, 405)

  try {
    const { token, plan, billing } = await req.json()

    if (!token || !plan || !billing) {
      return json({ error: 'Missing token, plan, or billing' }, 400)
    }
    if (!PRICING[plan]) return json({ error: 'Invalid plan' }, 400)
    if (billing !== 'monthly' && billing !== 'annual') {
      return json({ error: 'billing must be monthly or annual' }, 400)
    }

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // ── Verify the magic link is still valid ───────────────────────
    const { data: link } = await admin
      .from('magic_links').select('phone, expires_at').eq('token', token).single()

    if (!link)                                     return json({ error: 'Invalid token' }, 401)
    if (new Date(link.expires_at) <= new Date())   return json({ error: 'Token expired' }, 401)

    // ── Compute amount (paise — Razorpay expects integer paise) ────
    const rupees = PRICING[plan][billing as 'monthly' | 'annual']
    const paise  = rupees * 100

    // ── Create Razorpay order ──────────────────────────────────────
    const rzpKeyId     = Deno.env.get('RAZORPAY_KEY_ID')!
    const rzpKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')!
    const auth = btoa(`${rzpKeyId}:${rzpKeySecret}`)

    const orderRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type':  'application/json'
      },
      body: JSON.stringify({
        amount:   paise,
        currency: 'INR',
        receipt:  `bz_${plan}_${Date.now()}`,
        notes:    { phone: link.phone, plan, billing }
      })
    })
    const order = await orderRes.json()
    if (!orderRes.ok) {
      console.error('[razorpay-create-order] Razorpay error:', order)
      return json({ error: 'Razorpay error', detail: order }, 502)
    }

    return json({
      ok:        true,
      order_id:  order.id,
      amount:    paise,
      currency:  'INR',
      key_id:    rzpKeyId,
      plan,
      billing,
      phone:     link.phone
    })

  } catch (e) {
    console.error('[razorpay-create-order] error:', e)
    return json({ error: (e as Error).message }, 500)
  }
})

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' }
  })
}
