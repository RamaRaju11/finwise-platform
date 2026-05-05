import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14'

/* ── Plan map: Stripe amount (cents) → plan + expiry days ── */
const PLAN_MAP: Record<number, { plan: string; days: number }> = {
    900: { plan: 'starter', days: 31  },   // $9/mo
   2900: { plan: 'pro',     days: 31  },   // $29/mo
   7900: { plan: 'advisor', days: 31  },   // $79/mo
   8400: { plan: 'starter', days: 365 },   // $84/yr
  27600: { plan: 'pro',     days: 365 },   // $276/yr
  75600: { plan: 'advisor', days: 365 },   // $756/yr
}

serve(async (req) => {
  /* Only accept POST */
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const stripeSecret  = Deno.env.get('STRIPE_SECRET_KEY') ?? ''
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''
  const supabaseUrl   = Deno.env.get('SUPABASE_URL') ?? ''
  const serviceKey    = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

  const stripe = new Stripe(stripeSecret, {
    apiVersion: '2023-10-16',
    httpClient: Stripe.createFetchHttpClient(),
  })

  const supabase = createClient(supabaseUrl, serviceKey)

  /* ── Verify Stripe signature ── */
  const sig  = req.headers.get('stripe-signature') ?? ''
  const body = await req.text()

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret)
  } catch (err) {
    console.error('Webhook signature failed:', err.message)
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  console.log('Stripe event received:', event.type)

  /* ── Handle checkout completed → upgrade plan ── */
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const email    = session.customer_details?.email
    const amount   = session.amount_total ?? 0
    const mapping  = PLAN_MAP[amount]
    const custId   = typeof session.customer === 'string' ? session.customer : null

    console.log(`Checkout complete: email=${email}, amount=${amount}, mapping=${JSON.stringify(mapping)}`)

    if (!email || !mapping) {
      console.error('Could not map payment to a plan', { email, amount })
      return new Response('Unrecognised plan amount', { status: 200 })
    }

    const { plan, days } = mapping

    /* Find profile by email */
    const { data: profile, error: findErr } = await supabase
      .from('profiles')
      .select('id, referred_by, referral_credited')
      .eq('email', email)
      .single()

    if (findErr || !profile) {
      console.error('User not found for email:', email)
      return new Response('User not found', { status: 200 })
    }

    /* Upgrade plan */
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()

    const { error: updateErr } = await supabase
      .from('profiles')
      .update({
        plan,
        stripe_customer_id: custId,
        plan_expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id)

    if (updateErr) {
      console.error('Failed to update profile:', updateErr)
      return new Response('DB update failed', { status: 500 })
    }

    console.log(`✅ Upgraded ${email} → ${plan} (expires ${expiresAt}, ${days}d)`)

    /* ── Credit referrer if this is their first payment ── */
    if (profile.referred_by && !profile.referral_credited) {
      const refCode = profile.referred_by  // first 8 chars of referrer UUID

      const { data: referrer } = await supabase
        .from('profiles')
        .select('id, referral_credits')
        .like('id', refCode + '%')
        .single()

      if (referrer) {
        const newCredits = (referrer.referral_credits || 0) + 1

        await supabase
          .from('profiles')
          .update({ referral_credits: newCredits, updated_at: new Date().toISOString() })
          .eq('id', referrer.id)

        /* Mark this user as credited so referrer isn't double-credited */
        await supabase
          .from('profiles')
          .update({ referral_credited: true })
          .eq('id', profile.id)

        console.log(`🎁 Credited referrer ${referrer.id} → ${newCredits} months (referred ${email})`)
      }
    }
  }

  /* ── Handle subscription renewed/updated → extend expiry ── */
  if (event.type === 'customer.subscription.updated') {
    const sub    = event.data.object as Stripe.Subscription
    const custId = typeof sub.customer === 'string' ? sub.customer : null
    if (custId && sub.status === 'active') {
      const periodEnd = new Date((sub.current_period_end ?? 0) * 1000).toISOString()
      await supabase
        .from('profiles')
        .update({ plan_expires_at: periodEnd, updated_at: new Date().toISOString() })
        .eq('stripe_customer_id', custId)
      console.log(`🔄 Subscription renewed for ${custId}, expires ${periodEnd}`)
    }
  }

  /* ── Handle subscription cancelled → downgrade to free ── */
  if (event.type === 'customer.subscription.deleted') {
    const sub      = event.data.object as Stripe.Subscription
    const custId   = typeof sub.customer === 'string' ? sub.customer : null

    if (custId) {
      await supabase
        .from('profiles')
        .update({ plan: 'free', updated_at: new Date().toISOString() })
        .eq('stripe_customer_id', custId)

      console.log(`⬇️ Downgraded customer ${custId} → free (subscription cancelled)`)
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
