# India WhatsApp Login — Pending Items

_Last updated: 2026-06-03_
_Project ref: `ugtfdtdbegdjqrdtplkg` (SmallBiz Supabase)_

---

## 🐛 ISSUES FOUND DURING END-TO-END TEST (2026-06-03)

End-to-end WhatsApp flow validated working with US test phone +1 646 427 5578 on 2026-06-03. User noticed a few issues during the walkthrough — to be detailed and triaged here.

### Issue tracker

| # | Where | What | Severity | Status |
|---|---|---|---|---|
| 1 | _TBD_ | _User will document details after detailed test_ | _TBD_ | 🔍 To investigate |
| 2 | _TBD_ | _User will document details after detailed test_ | _TBD_ | 🔍 To investigate |
| _add rows as found_ | | | | |

**Action**: User to capture concrete details (screenshot, exact step, expected vs actual) for each issue. Then I prioritize and fix.

### Test reference (last successful flow)
- Web form: https://ramaraju11.github.io/finwise-platform/whatsapp-start.html
- Test phone (must be in Meta test recipients): +1 646 427 5578 (or any verified test number)
- Country dropdown: 🇺🇸 +1 for dev testing
- Expected: Q1 → Q5 in WhatsApp → magic link → personalized dashboard (no orange dev badge)

---

## ✅ DONE — already deployed & live

| Item | Where | Status |
|---|---|---|
| Frontend: `whatsapp-start.html`, `login.html`, `subscribe.html` | GitHub Pages | Pushed |
| India CTA toggle on `index.html` | GitHub Pages | Pushed |
| SQL migration: `wa_sessions`, `magic_links`, `users_in` (with RLS) | Production DB | Applied |
| Edge Function `verify-token` | Supabase | Deployed |
| Edge Function `razorpay-create-order` | Supabase | Deployed |
| Edge Function `razorpay-webhook` | Supabase | Deployed |
| `login.html` → real verify-token fetch | GitHub Pages | Live |
| `subscribe.html` → real razorpay-create-order fetch | GitHub Pages | Live |
| Seed SQL file `supabase/seed_test_user.sql` | Repo | Written, not yet run |
| Deployment guide `supabase/functions/_shared/WA_LOGIN_README.md` | Repo | Written |

---

## 🟡 ACTIONABLE NOW — no blockers, do anytime

### 1. Seed the test user (~30 sec)
- Open https://supabase.com/dashboard/project/ugtfdtdbegdjqrdtplkg/sql/new
- Paste contents of `supabase/seed_test_user.sql` → **Run**
- Confirm 2-row result appears

### 2. Test live `login.html` flow (~2 min)
After seeding, open:
```
https://ramaraju11.github.io/finwise-platform/login.html?t=test_token_priya_kirana
```
Should render Priya Kirana Store's dashboard (real data from DB, not mock).

Also test:
- `?t=mock_demo_user` → mock fallback works
- `?t=garbage123` → "Invalid link" from server
- `?t=` (no value) → "Missing login link"

### 3. Build Privacy + Terms pages (~15 min)
Razorpay KYC requires URLs. Also needed for public launch.
- `privacy.html` — data handling, WhatsApp use, GDPR/DPDP compliance
- `terms.html` — subscription terms, cancellation, refund policy

### 4. HELP/resume command in `wa-webhook` (~30 min)
Currently if a user drops off mid-Q3 and texts again, the webhook says "visit website to start over". Better: recognize "HELP" / "RESUME" / any reply → resend the current question. Small edit to `processWebhookPayload()`.

### 5. Magic link refresh function (~45 min)
New endpoint: POST `/magic-link-refresh` with `{phone}` → re-issues a fresh 1hr token for users who already completed onboarding. Avoids forcing them to re-answer 5 questions when link expires.

### 6. Mobile responsiveness audit (~30 min)
Open all 3 new pages on phone:
- `whatsapp-start.html` — does the phone input work cleanly on iOS Safari / Android Chrome?
- `login.html` — does the action grid stack properly on narrow screens?
- `subscribe.html` — does the 4-column pricing grid drop to 1 column at ≤560px?

### 7. Admin view for India signups (~2 hours)
New page `admin/india-users.html`:
- Lists `users_in` rows (most recent first)
- Shows drop-off in `wa_sessions` (who stopped at which question)
- Plan-conversion funnel chart
- Protected by Supabase Auth admin role

---

## 🔴 BLOCKED ON WABA — Meta WhatsApp Business Account approval

WABA does NOT exist yet (user has only the consumer WA Business app). Must be created from scratch.

### Setup path (1-3 days, Meta-driven):
1. Visit https://business.facebook.com/wa/manage/
2. Click "Get started" / "Add WhatsApp account"
3. Pick a phone number NOT currently on WhatsApp consumer app (if business number is on green WA Business app, back up chats + remove first)
4. Complete Meta Business Verification — needs:
   - Indian business registration (GST certificate OR Udyam OR Pvt Ltd CIN)
   - Business address proof
5. Wait 1-3 days for Meta to approve
6. Phone Number Verification (OTP, instant)
7. Display Name approval (1-2 hours)

### Once WABA is approved:
- [ ] Get **META_PHONE_ID** from WhatsApp Manager → Phone numbers
- [ ] Get **META_WABA_ID** from same page
- [ ] Get **META_APP_SECRET** from Meta App settings (for webhook signature verification)
- [ ] Generate **META_ACCESS_TOKEN** (System User, permanent, never-expire) with scopes:
  - `whatsapp_business_messaging`
  - `whatsapp_business_management`
- [ ] Submit `bizsco_welcome` template (UTILITY category, English + Hindi) — 24hr approval
- [ ] Run on terminal:
  ```powershell
  cd C:\Users\rama.raju\smallbiz\smallbiz-platform
  supabase secrets set META_PHONE_ID=<value>
  supabase secrets set META_WABA_ID=<value>
  supabase secrets set META_ACCESS_TOKEN=<value>
  supabase secrets set META_APP_SECRET=<value>
  supabase secrets set META_WEBHOOK_VERIFY_TOKEN=<choose-any-random-string>
  supabase secrets set PUBLIC_SITE_URL=https://ramaraju11.github.io/finwise-platform
  ```
- [ ] Deploy WhatsApp functions:
  ```powershell
  supabase functions deploy wa-start
  supabase functions deploy wa-webhook --no-verify-jwt
  ```
- [ ] Configure webhook in Meta Business Suite → WABA → Configuration → Webhooks:
  - Callback URL: `https://ugtfdtdbegdjqrdtplkg.supabase.co/functions/v1/wa-webhook`
  - Verify Token: same value as `META_WEBHOOK_VERIFY_TOKEN`
  - Subscribe to: `messages`, `message_status`
- [ ] End-to-end test: send your own WhatsApp number through `whatsapp-start.html` → answer Q1-Q5 → confirm magic link arrives → confirm `login.html` renders with real data
- [ ] Remove mock dev panel from `whatsapp-start.html` once verified

---

## 🔴 BLOCKED ON COMPANY REGISTRATION — H1B + Razorpay

User is on H1B visa, company not yet registered (neither US nor India).

### Open decision: Where to incorporate?

| Option | Pros | Cons |
|---|---|---|
| India Pvt Ltd / LLP (recommended for H1B) | Legal under H1B passive ownership; cheap (~₹15K); Razorpay India works | US customers see foreign-transaction badge; ~3% FX loss on USD |
| India entity now + US flip later | Future-proofs for VC funding | Complex tax (FEMA, transfer pricing); ~$5K legal cost for flip |
| No company yet — free tier only | Zero cost, zero legal risk | Can't accept paid subscriptions; no GST invoices |

### Recommended path: Free tier only for first 30 days
Validate product-market fit with 50+ users via WhatsApp before incorporating. Decide based on real signal, not assumptions.

### Action items if/when incorporating in India:
- [ ] Consult **US immigration attorney** (~$300/hour) — confirm passive ownership rules for H1B
- [ ] Consult **Indian CA** (~₹10-20K) — setup Pvt Ltd/LLP, PAN, GST, current account
- [ ] Sign up Razorpay India with company details (KYC: company PAN, GST cert, bank account)
- [ ] Get Razorpay test keys → set secrets:
  ```powershell
  supabase secrets set RAZORPAY_KEY_ID=rzp_test_<value>
  supabase secrets set RAZORPAY_KEY_SECRET=<value>
  supabase secrets set RAZORPAY_WEBHOOK_SECRET=<random-string>
  ```
- [ ] Configure Razorpay webhook in dashboard:
  - URL: `https://ugtfdtdbegdjqrdtplkg.supabase.co/functions/v1/razorpay-webhook`
  - Active events: `payment.captured`, `payment.failed`, `subscription.cancelled`
- [ ] Test with card `4111 1111 1111 1111` (Razorpay test card)
- [ ] Switch to Live keys once activated (separate KYC step)

---

## 🟢 EXTENSIONS — beyond original plan, nice-to-have

### Hindi localization
- Translate 5 questions in `_shared/questions.ts` to Hindi
- Submit Hindi version of `bizsco_welcome` template to Meta (separate approval)
- Localize `login.html` and `subscribe.html` using existing `country-switcher.js` `data-cn` pattern
- Detect language preference from user's first reply (Devanagari script triggers Hindi)

### GST invoice PDF generation
- New Edge Function `generate-gst-invoice` triggered after Razorpay capture
- Use Deno PDF library (e.g., `jspdf` via esm.sh)
- Email to user's WhatsApp-linked email (collect email as Q6, or in subscribe.html)
- Indian tax law requires GST invoice for B2C SaaS

### Drop-off analytics dashboard
- SQL view aggregating `wa_sessions` by `current_step`
- Shows conversion funnel: Q1 → Q5 → magic link clicked → subscribed
- Optimize wording of questions with highest drop-off

### Email/SMS fallback if WhatsApp delivery fails
- Detect Meta API send failure → send SMS OTP via Twilio India / MSG91 instead
- Useful for users whose WhatsApp number is wrong or expired

### Welcome email + onboarding drip
- Already have `drip-sender` function in Supabase — extend it to send India-specific tips
- "Day 3: Did you try the Grant Finder?", "Day 7: Your free Financial Checkup", etc.

### Regional language expansion
- Telugu (`_regional/india/promo5_telugu.html` already exists in repo)
- Tamil, Marathi, Bengali — for state-specific outreach

---

## 📅 SUGGESTED SEQUENCE

**This week (no blockers):**
1. Run `seed_test_user.sql` (~1 min)
2. Test live `login.html` with real backend (~2 min)
3. Write `privacy.html` + `terms.html` (~30 min)
4. Mobile audit + fix any issues (~1 hour)

**Next 1-3 days (Meta-driven async):**
5. Start WABA setup at https://business.facebook.com/wa/manage/
6. Once approved → submit Meta template (24hr async)
7. Once template approved → deploy `wa-start` + `wa-webhook` + set secrets
8. End-to-end WhatsApp test

**Decide separately (legal/business, no rush):**
9. Where to incorporate (India only? Both? Wait?)
10. Whether to register Razorpay now or stay free-tier

**Once revenue starts:**
11. GST invoice generation
12. Hindi version
13. Admin dashboard
14. Drip campaigns

---

## 🔑 CRITICAL FILES TO REMEMBER

| File | Purpose |
|---|---|
| `supabase/seed_test_user.sql` | Paste in Studio to create test user |
| `supabase/functions/_shared/WA_LOGIN_README.md` | Full deployment guide (8 steps) |
| `supabase/functions/_shared/questions.ts` | The 5 onboarding questions config |
| `supabase/functions/_shared/meta-api.ts` | Meta Cloud API wrapper |
| `supabase/migrations/20260525120000_wa_login.sql` | Schema (already applied) |
| `.claude/memory/project_india_whatsapp_login.md` | Memory snapshot for next sessions |

---

## 🚨 SECURITY REMINDERS

- GitHub Pages is public — **never commit** `META_ACCESS_TOKEN`, `RAZORPAY_KEY_SECRET`, `SUPABASE_SERVICE_ROLE_KEY` to any `.html` file
- All secrets live in Supabase Edge Function env vars (`supabase secrets set ...`)
- Safe to embed in HTML: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `RAZORPAY_KEY_ID`
- Webhook signature verification (`verifyWebhookSignature`) is critical — never disable it in prod
