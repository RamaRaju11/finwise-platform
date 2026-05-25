// ════════════════════════════════════════════════════════════════════
// razorpay-webhook
//
// Razorpay calls this on every payment event. We verify the HMAC
// signature using RAZORPAY_WEBHOOK_SECRET, then update users_in.plan
// when payment.captured fires.
//
// Configure in Razorpay Dashboard → Settings → Webhooks:
//   URL:     https://<project-ref>.supabase.co/functions/v1/razorpay-webhook
//   Secret:  <same as RAZORPAY_WEBHOOK_SECRET env var>
//   Events:  payment.captured, payment.failed, subscription.activated,
//            subscription.cancelled
// ════════════════════════════════════════════════════════════════════

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  const rawBody  = await req.text()
  const signature = req.headers.get('x-razorpay-signature')
  if (!await verifyRazorpaySignature(rawBody, signature)) {
    console.warn('[razorpay-webhook] signature verification failed')
    return new Response('Forbidden', { status: 403 })
  }

  let payload: any
  try { payload = JSON.parse(rawBody) }
  catch { return new Response('Bad JSON', { status: 400 }) }

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  try {
    const event = payload.event as string
    const payment = payload.payload?.payment?.entity
    const subscription = payload.payload?.subscription?.entity

    if (event === 'payment.captured' && payment) {
      const phone   = payment.notes?.phone
      const plan    = payment.notes?.plan
      const billing = payment.notes?.billing
      if (!phone || !plan) {
        console.warn('[razorpay-webhook] payment.captured missing notes', payment.id)
        return ok()
      }

      const periodEnd = new Date()
      if (billing === 'annual') periodEnd.setFullYear(periodEnd.getFullYear() + 1)
      else                      periodEnd.setMonth(periodEnd.getMonth() + 1)

      await admin.from('users_in').update({
        plan,
        billing:             billing || 'monthly',
        subscription_status: 'active',
        current_period_end:  periodEnd.toISOString(),
        razorpay_customer_id: payment.customer_id || null
      }).eq('phone', phone)

      console.log(`[razorpay-webhook] ${phone} → plan=${plan} billing=${billing}`)
    }

    if (event === 'payment.failed' && payment) {
      console.warn(`[razorpay-webhook] payment.failed for ${payment.notes?.phone}: ${payment.error_description}`)
      // TODO: optionally send a WhatsApp message to the user
    }

    if (event === 'subscription.cancelled' && subscription) {
      const phone = subscription.notes?.phone
      if (phone) {
        await admin.from('users_in').update({
          subscription_status: 'cancelled'
        }).eq('phone', phone)
      }
    }

  } catch (e) {
    console.error('[razorpay-webhook] processing error:', e)
    // still return 200 — Razorpay retries on non-2xx
  }

  return ok()
})

function ok(): Response {
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}

async function verifyRazorpaySignature(
  rawBody: string,
  signatureHeader: string | null
): Promise<boolean> {
  if (!signatureHeader) return false
  const secret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET')
  if (!secret) {
    console.error('RAZORPAY_WEBHOOK_SECRET not set')
    return false
  }

  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(rawBody))
  const hex = Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0')).join('')

  if (hex.length !== signatureHeader.length) return false
  let diff = 0
  for (let i = 0; i < hex.length; i++) diff |= hex.charCodeAt(i) ^ signatureHeader.charCodeAt(i)
  return diff === 0
}
