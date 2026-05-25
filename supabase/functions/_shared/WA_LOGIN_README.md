# India WhatsApp Login — Deployment Guide

This folder contains everything needed to run the India WhatsApp signup flow.
The frontend pages (`whatsapp-start.html`, `login.html`, `subscribe.html`) are
already deployed via GitHub Pages. This guide wires them to live backend.

## What you'll deploy

| Component | Type | Purpose |
|---|---|---|
| `wa_login.sql` | Migration | Creates `wa_sessions`, `magic_links`, `users_in` tables |
| `wa-start` | Edge Function | Browser POSTs phone → sends WhatsApp Q1 via Meta API |
| `wa-webhook` | Edge Function | Meta calls when user replies → Q&A state machine + magic link |
| `verify-token` | Edge Function | `login.html` calls to validate `?t=` and load profile |
| `razorpay-create-order` | Edge Function | `subscribe.html` calls to create a payment order |
| `razorpay-webhook` | Edge Function | Razorpay calls on payment events → updates user plan |

## Step 1 — Run the migration

```powershell
cd C:\Users\rama.raju\smallbiz\smallbiz-platform
supabase db push
```

This applies `supabase/migrations/wa_login.sql`. Verify in Supabase Studio:
the three tables should appear with RLS enabled and no policies (only
service_role can access them — by design).

## Step 2 — Set all secrets

Run these commands one by one (paste actual values where shown):

```powershell
# Meta WhatsApp
supabase secrets set META_PHONE_ID=YOUR_PHONE_NUMBER_ID
supabase secrets set META_WABA_ID=YOUR_WABA_ID
supabase secrets set META_ACCESS_TOKEN=EAA...your_permanent_token
supabase secrets set META_APP_SECRET=your_app_secret_for_webhook_signature
supabase secrets set META_WEBHOOK_VERIFY_TOKEN=a_random_string_you_invent

# Razorpay
supabase secrets set RAZORPAY_KEY_ID=rzp_live_or_test_xxxxx
supabase secrets set RAZORPAY_KEY_SECRET=your_secret_key
supabase secrets set RAZORPAY_WEBHOOK_SECRET=string_you_set_in_razorpay_dashboard

# Public site URL (for magic links sent on WhatsApp)
supabase secrets set PUBLIC_SITE_URL=https://ramaraju11.github.io/finwise-platform
```

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are auto-injected by Supabase
into every function — no need to set them manually.

## Step 3 — Deploy the functions

```powershell
supabase functions deploy wa-start
supabase functions deploy wa-webhook --no-verify-jwt
supabase functions deploy verify-token --no-verify-jwt
supabase functions deploy razorpay-create-order
supabase functions deploy razorpay-webhook --no-verify-jwt
```

**Why `--no-verify-jwt` on three of them?**

- `wa-webhook` — called by Meta servers (no Supabase JWT). We verify Meta's
  HMAC signature inside the function instead.
- `verify-token` — called by `login.html` on page load BEFORE the user is
  authenticated. Token in URL is the authentication mechanism.
- `razorpay-webhook` — called by Razorpay servers. We verify their HMAC.

`wa-start` and `razorpay-create-order` use the public Supabase anon key
on the frontend, which JWT verification accepts.

## Step 4 — Configure Meta webhook

In Meta Business Suite → WhatsApp Manager → your WABA → **Configuration → Webhooks**:

- **Callback URL**: `https://ugtfdtdbegdjqrdtplkg.supabase.co/functions/v1/wa-webhook`
- **Verify Token**: the same string you set as `META_WEBHOOK_VERIFY_TOKEN`
- **Click "Verify and Save"** — Meta will GET the URL with `hub.challenge`,
  our function echoes it back. If green checkmark appears, you're good.
- **Subscribe to fields**: `messages`, `message_status`

## Step 5 — Configure Razorpay webhook

In Razorpay Dashboard → **Settings → Webhooks → Add New Webhook**:

- **URL**: `https://ugtfdtdbegdjqrdtplkg.supabase.co/functions/v1/razorpay-webhook`
- **Secret**: same string you set as `RAZORPAY_WEBHOOK_SECRET`
- **Active events**: `payment.captured`, `payment.failed`, `subscription.cancelled`

## Step 6 — Wire up the frontend

Edit `whatsapp-start.html` line ~210 — replace the mock `setTimeout` with:

```javascript
fetch('https://ugtfdtdbegdjqrdtplkg.supabase.co/functions/v1/wa-start', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': 'YOUR_SUPABASE_ANON_KEY'
  },
  body: JSON.stringify({ phone: '+91' + phone })
})
.then(r => r.json())
.then(data => {
  if (data.ok) {
    // show confirmation card
  } else {
    err.textContent = data.error;
    err.classList.add('show');
    btn.disabled = false;
    btn.querySelector('span').textContent = 'Continue on WhatsApp';
  }
});
```

Same pattern for `login.html` (replace `mockVerify` with real `fetch` to
`verify-token`) and `subscribe.html` (replace `RAZORPAY_KEY_ID = ''` with
the real key and call `razorpay-create-order` to get an `order_id` before
opening Razorpay Checkout).

## Step 7 — Submit the Meta template

In Meta Business Manager → WhatsApp → Message Templates → Create Template:

- **Category**: `UTILITY`
- **Name**: `bizsco_welcome`
- **Language**: English
- **Body**:
  ```
  Hi {{1}}! 👋 Welcome to BizSco — India's free SMB financial platform.

  5 quick questions to personalize your dashboard:

  Q1/5: What's your business name?

  (Just type your reply 👇)
  ```
- **Sample value for {{1}}**: `there`
- **Submit** → typically approved in 1-24 hours.

## Step 8 — Test end-to-end

1. Visit `https://ramaraju11.github.io/finwise-platform/?cn=in`
2. Click **💚 Continue with WhatsApp**
3. Enter your own WhatsApp number → submit
4. You should receive the welcome message on WhatsApp
5. Reply with: business name → 2 (industry) → 3 (revenue) → 2 (worry: loan) → Hyderabad
6. After Q5, you'll receive a magic link
7. Tap the link → personalized dashboard loads
8. Click "Subscribe to Pro" → Razorpay test checkout opens
9. Use Razorpay test card `4111 1111 1111 1111`, CVV `123`, any future expiry
10. After payment, redirected back to login.html with active subscription

## Troubleshooting

- **Webhook verification fails**: confirm `META_APP_SECRET` is the App Secret
  from Meta (not the access token). They're different values.
- **wa-start returns 502**: usually means Meta rejected the template send.
  Likely causes: template not yet approved, phone number not on WhatsApp,
  or template parameter count mismatch.
- **Magic link arrives but login.html shows "Invalid"**: check that
  `PUBLIC_SITE_URL` env var has no trailing slash.
- **Razorpay webhook fires but plan doesn't update**: payment notes must
  include `phone`, `plan`, `billing`. The `razorpay-create-order` function
  passes these — if you bypass it, plans won't update.

## Architecture diagram

```
Browser (India user)                  Supabase Functions              External
─────────────────────                  ──────────────────              ────────
whatsapp-start.html  ─POST {phone}─→   wa-start  ──────send template─→ Meta API
                                          │
                                          ↓ insert
                                       wa_sessions
                                                                       ↑
WhatsApp app (user)  ←── Q1 ──────────────────────────────────────────┘
WhatsApp app (user)  ─── Q1 reply ─→  wa-webhook (Meta sig verified)
                                          │
                                          ↓ advance step, send Q2-Q5
                                          ↓ on Q5 done:
                                          ↓   - upsert users_in
                                          ↓   - insert magic_links token
                                          ↓   - send Q5 reply + magic link
WhatsApp app (user)  ← magic link ────────┘
                                                                              ↑
login.html (open URL) ─GET t=─→        verify-token  ←─── reads ──── magic_links
                     ← profile ─────       │
                                          ↓ returns user.profile
subscribe.html       ─POST {token,plan}→ razorpay-create-order ──→ Razorpay API
                     ← {order_id} ──        │                       │
                                                                    ↓
                                       Razorpay Checkout (browser opens)
                                                                    ↓
                                       razorpay-webhook ←──── HMAC signed POST
                                          ↓ update users_in.plan = active
```
