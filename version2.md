# FinWise v2 — Implementation Guide

> **How to use this file:**  
> Work through one phase at a time. Each phase has a pre-flight checklist — confirm every item before building anything. Tell me when you are ready and I will guide you through each step live in the conversation.

---

## Current Stack (What We Already Have)

| Component | Technology | Status |
|---|---|---|
| Frontend | Static HTML + CSS + Vanilla JS | ✅ Live |
| Auth | Supabase Auth | ✅ Live |
| Payments | Stripe | ✅ Live |
| Profile storage | Supabase `profiles` table + localStorage | ✅ Live |
| Service worker | `sw.js` (PWA foundation) | ✅ Exists |
| Hosting | File system / static server | ✅ Live |

---

## The 7 Phases

| # | Phase | Depends on | Core outcome |
|---|---|---|---|
| 1 | Backend API + Real Database | Nothing | Everything else is possible |
| 2 | Plaid Bank Connection | Phase 1 | Manual entry eliminated |
| 3 | Daily Health Engine | Phases 1 + 2 | Platform becomes an advisor |
| 4 | Alerts + Weekly Digest | Phases 1 + 3 | Ongoing user relationship |
| 5 | Live Loan Pre-Qualification | Phases 1 + 2 | Core revenue engine |
| 6 | Mobile PWA | Phase 1 | Reaches mobile users |
| 7 | Advisor Network + White-Label | Phases 1 + 3 | B2B revenue layer |

---

---

# PHASE 1 — Backend API + Real Database

> **Why first:** Every other phase needs server-side logic, a real database, and secure API calls. This is the foundation. Nothing else is possible without it.

## What we are building

- New Supabase database tables for financial data (not just auth profiles)
- Supabase Edge Functions — serverless functions that run your business logic securely
- A secure API layer that the existing HTML frontend calls instead of directly touching localStorage

## Technology decision: Why Supabase Edge Functions

You already have Supabase for auth. Edge Functions are JavaScript/TypeScript serverless functions that run on Supabase's servers. No separate Node.js server to host or manage. Same platform, same dashboard. This is the right choice for where you are now.

## Pre-flight checklist

Before we write a single line of code, confirm all of these:

- [ ] **1.1** You have access to the Supabase dashboard for the project at `ugtfdtdbegdjqrdtplkg.supabase.co`
- [ ] **1.2** You know the Supabase service role key (NOT the publishable key — the secret one from Project Settings → API)
- [ ] **1.3** You have Node.js installed — run `node -v` in a terminal. If not installed, install from nodejs.org
- [ ] **1.4** You have the Supabase CLI installed — run `supabase -v`. If not, install with `npm install -g supabase`
- [ ] **1.5** You understand that Edge Functions run on Supabase's servers, not your machine — your HTML pages call them via `fetch()`

## What we will build in Phase 1

### 1-A: New database tables

```
profiles          (already exists — we extend it)
financial_data    (monthly snapshots per user)
transactions      (individual bank transactions — used in Phase 2)
health_scores     (daily score history per user)
alerts            (generated alerts per user)
loan_applications (loan inquiries and results)
```

### 1-B: Edge Functions

```
GET  /health-check          → test the API is running
POST /profile/save          → save business profile (replaces localStorage-only)
GET  /profile/get           → fetch profile for current user
POST /financial/snapshot    → save a financial snapshot
GET  /financial/summary     → get latest financials for a user
```

### 1-C: Frontend changes

Update `fnavSaveProfile()` in `nav.js` to POST to the Edge Function instead of (or in addition to) localStorage. Keep localStorage as a cache — the Edge Function is the source of truth.

## Steps (we do these together)

```
Step 1.1  → Create database tables in Supabase dashboard
Step 1.2  → Set up Supabase CLI locally
Step 1.3  → Create first Edge Function: health-check
Step 1.4  → Create profile/save and profile/get functions
Step 1.5  → Update nav.js to call the API on profile save
Step 1.6  → Test: save profile → verify data appears in Supabase table
Step 1.7  → Update fwAuth restore logic to pull from API, not just biz_profile column
```

## Verify Phase 1 is done

- [ ] Supabase tables exist and have correct schema
- [ ] Edge Function URL responds to a fetch() call from the browser
- [ ] Saving profile in nav.js modal writes to Supabase database table (visible in dashboard)
- [ ] Refreshing on a different browser retrieves the same profile via API
- [ ] localStorage still works as a fast local cache

## ✋ STOP — confirm before proceeding to Phase 2

**Tell me:** Phase 1 complete. Ready for Phase 2.

---

---

# PHASE 2 — Plaid Bank Connection

> **Why second:** Real bank data makes every existing tool accurate. Revenue, expenses, cash balance — all live from actual transactions. This single change delivers more value than adding 20 new tools.

## What we are building

- Plaid Link — the bank connection UI that users click to connect their account
- A Supabase Edge Function that exchanges the Plaid token securely (credentials never touch the browser)
- Transaction import — pulling 90 days of transactions, categorising them, storing in Supabase
- Auto-fill update — revenue and expenses now come from Plaid data, not manual entry
- Nightly sync — a scheduled function updates transactions every night

## Technology decision: Why Plaid

Plaid is the industry standard for bank connections — used by 8,000+ apps. It has a free development tier for testing with up to 100 users. Production pricing is per-connected-account. They have clear docs and a JavaScript SDK that works in a browser.

## Pre-flight checklist

- [ ] **2.1** You have a Plaid account — sign up free at dashboard.plaid.com
- [ ] **2.2** You have your Plaid Client ID and Sandbox Secret from the Plaid dashboard
- [ ] **2.3** Phase 1 is fully complete and verified (API is running, database tables exist)
- [ ] **2.4** You understand Plaid has 3 environments: Sandbox (fake banks, free), Development (real banks, limited), Production (real banks, paid). We start in Sandbox.
- [ ] **2.5** You are comfortable that users will see a Plaid-branded popup to connect their bank — this is standard and trusted

## What we will build in Phase 2

### 2-A: Supabase Edge Functions

```
POST /plaid/create-link-token    → generates a Plaid Link token for the user
POST /plaid/exchange-token       → exchanges public token for access token (server-side only)
POST /plaid/sync-transactions    → pulls transactions and stores in Supabase
GET  /plaid/summary              → returns categorised revenue/expense summary
```

### 2-B: New database tables

```
plaid_connections   (access_token per user — encrypted, never exposed to browser)
transactions        (date, amount, category, merchant_name, account_id, user_id)
financial_summary   (pre-computed monthly rev/exp/profit per user — updated nightly)
```

### 2-C: Frontend changes

- Add "Connect your bank" button to the nav.js profile modal and to dashboard.html
- Load Plaid Link JS SDK and open it when button is clicked
- On success, call `/plaid/exchange-token` with the public token
- Auto-refresh all tool fields from `/plaid/summary` instead of localStorage

### 2-D: Nightly sync

- Supabase pg_cron job runs at 2 AM
- Calls `/plaid/sync-transactions` for each connected user
- Updates `financial_summary` table
- Triggers health score recalculation (feeds into Phase 3)

## Steps (we do these together)

```
Step 2.1  → Get Plaid API credentials (Client ID + Sandbox Secret)
Step 2.2  → Create Plaid Edge Functions (create-link-token, exchange-token)
Step 2.3  → Create plaid_connections and transactions tables
Step 2.4  → Add Plaid Link button and JS to the profile modal
Step 2.5  → Test bank connection in Sandbox (use test credentials: username=user_good, password=pass_good)
Step 2.6  → Build transaction categorisation (revenue vs expense by category)
Step 2.7  → Create /plaid/summary endpoint
Step 2.8  → Update all tool auto-fill to pull from /plaid/summary
Step 2.9  → Set up nightly pg_cron sync job
Step 2.10 → Test end to end: connect bank → transactions imported → LDSE auto-fills correctly
```

## Verify Phase 2 is done

- [ ] User can click "Connect Bank" and see Plaid Link popup
- [ ] After connection, transactions appear in Supabase `transactions` table
- [ ] `/plaid/summary` returns correct monthly revenue and expenses
- [ ] Loan Safety Score auto-fills from live bank data — no manual entry needed
- [ ] Nightly cron job runs and updates financial_summary
- [ ] If user disconnects bank, tools fall back gracefully to manual entry

## ✋ STOP — confirm before proceeding to Phase 3

**Tell me:** Phase 2 complete. Ready for Phase 3.

---

---

# PHASE 3 — Daily Health Engine

> **Why third:** This is the core differentiator. It is what turns a toolbox into an advisor. It requires Phases 1 and 2 because it needs a real database and real financial data to be meaningful.

## What we are building

- A nightly analysis engine that runs for every user
- A health score algorithm (0–100) combining 6 financial dimensions
- A priority generator that outputs the top 3 actions for each user
- A new dashboard homepage — "Daily Briefing" replaces the tool menu as the first thing users see

## Health score dimensions

| Dimension | Weight | What it measures |
|---|---|---|
| Cash Flow | 25% | Net income margin, revenue trend |
| Liquidity | 20% | Cash runway in months |
| Debt Burden | 20% | Debt-to-income ratio |
| Revenue Stability | 15% | Month-over-month variance |
| Credit Health | 10% | Credit score band |
| Growth Trajectory | 10% | 3-month revenue trend |

## Pre-flight checklist

- [ ] **3.1** Phases 1 and 2 are fully complete
- [ ] **3.2** At least one test user has bank data connected (or manual profile filled)
- [ ] **3.3** You have reviewed the 6 health score dimensions above and agree with the weights
- [ ] **3.4** You understand the briefing will replace the current dashboard tool menu as the default view — the tools are still accessible but are no longer the first thing users see

## What we will build in Phase 3

### 3-A: Edge Functions

```
POST /health/calculate          → calculate health score for a user (on demand)
GET  /health/score              → get latest health score and breakdown
GET  /health/priorities         → get top 3 priority actions for today
GET  /health/history            → get score history for the chart
```

### 3-B: New database tables

```
health_scores     (date, score, dimension_scores JSON, user_id)
daily_priorities  (date, priority_rank, type, title, description, action_url, user_id)
```

### 3-C: Nightly cron job (extends Phase 2 cron)

```
2:00 AM  → sync transactions (Phase 2)
2:10 AM  → recalculate financial_summary
2:20 AM  → run health score engine for all users
2:30 AM  → generate daily priorities for all users
2:35 AM  → flag any alert conditions (feeds Phase 4)
```

### 3-D: Dashboard redesign

Replace current `dashboard.html` tool menu with:
- Health score ring (animated, 0–100)
- 3 priority cards (red / amber / green by urgency)
- Week-over-week metric comparison strip
- "All Tools" button still accessible (not removed, just secondary)

## Steps (we do these together)

```
Step 3.1  → Write health score algorithm as a JS module (testable in isolation)
Step 3.2  → Create health_scores and daily_priorities tables
Step 3.3  → Build /health/calculate Edge Function
Step 3.4  → Build /health/priorities Edge Function
Step 3.5  → Add health calculation to nightly cron job
Step 3.6  → Redesign dashboard.html — briefing view with score ring
Step 3.7  → Connect dashboard to /health/score and /health/priorities API
Step 3.8  → Test: verify score changes when financial data changes
Step 3.9  → Add score history chart (feeds existing history.html)
```

## Verify Phase 3 is done

- [ ] Health score appears correctly on dashboard with breakdown
- [ ] 3 priority cards show correct urgency and descriptions
- [ ] Score history chart shows trend over time
- [ ] Changing financial data recalculates the score
- [ ] Nightly cron job updates scores for all users
- [ ] "All Tools" is still accessible — briefing is the new default, not a replacement

## ✋ STOP — confirm before proceeding to Phase 4

**Tell me:** Phase 3 complete. Ready for Phase 4.

---

---

# PHASE 4 — Alerts + Weekly Digest

> **Why fourth:** Now that the health engine runs nightly and generates priorities, we can notify users without them having to open the app. This is what keeps users engaged between sessions.

## What we are building

- Alert engine — detects when thresholds are crossed and creates alert records
- Push notifications — browser push notifications for urgent alerts
- Weekly email digest — personalised Monday morning email built from real data
- Email infrastructure using Resend (simple, reliable, 3,000 free emails/month)

## Alert types

| Alert type | Trigger condition | Urgency |
|---|---|---|
| Cash runway warning | Runway drops below 3 months | 🔴 High |
| Cash runway critical | Runway drops below 1.5 months | 🔴🔴 Urgent |
| Loan eligibility improved | Score improves + new offers available | 🟡 Medium |
| Grant deadline | Matching grant deadline within 14 days | 🟡 Medium |
| Tax payment due | Estimated payment due within 14 days | 🟡 Medium |
| Health score milestone | Score crosses 50, 70, or 85 | 🟢 Positive |
| Revenue drop | Revenue drops >15% month over month | 🔴 High |

## Pre-flight checklist

- [ ] **4.1** Phases 1, 2, and 3 are fully complete
- [ ] **4.2** You have a Resend account — sign up free at resend.com (3,000 emails/month free)
- [ ] **4.3** You have a domain to send emails from (e.g. notify@finwise.com or similar) OR you can use Resend's shared domain for testing
- [ ] **4.4** You are comfortable that users will receive a weekly email — there will be an unsubscribe option in every email (legal requirement)
- [ ] **4.5** You understand push notifications require user permission — we ask for permission politely, not on first load

## What we will build in Phase 4

### 4-A: Edge Functions

```
POST /alerts/check          → run alert conditions for a user and create alert records
GET  /alerts/active         → get active unread alerts for a user
POST /alerts/dismiss        → mark an alert as read
POST /email/weekly-digest   → generate and send weekly digest for a user
POST /push/subscribe        → save push subscription for a user
POST /push/send             → send a push notification to a user
```

### 4-B: New database tables

```
alerts              (type, title, body, action_url, urgency, read, created_at, user_id)
push_subscriptions  (endpoint, keys JSON, user_id)
email_preferences   (weekly_digest bool, alert_emails bool, unsubscribed bool, user_id)
```

### 4-C: Weekly digest email design

- Sent every Monday at 7 AM (user's local time)
- Contains: health score, 3 key metrics vs last week, top 3 priorities, upcoming deadlines
- Plain HTML email — clean, mobile-friendly, loads fast
- One-click unsubscribe link at the bottom (required by law)

### 4-D: Frontend changes

- Alert bell icon in nav bar — shows count of unread alerts
- Alert panel slides in when clicked
- Push notification permission prompt appears after user saves profile for the first time (not on page load)

## Steps (we do these together)

```
Step 4.1  → Create alerts table and alert detection logic
Step 4.2  → Add alert check to nightly cron job
Step 4.3  → Create alert bell UI in nav.js
Step 4.4  → Set up Resend account and verify sending domain
Step 4.5  → Build weekly digest email template (HTML email)
Step 4.6  → Create /email/weekly-digest Edge Function
Step 4.7  → Add Monday 7 AM digest send to cron job
Step 4.8  → Set up push notification subscription (sw.js already exists)
Step 4.9  → Create /push/send Edge Function
Step 4.10 → Test full alert flow: trigger condition → alert created → notification sent
Step 4.11 → Test digest: manually trigger for one user → verify email received
```

## Verify Phase 4 is done

- [ ] Alert bell in nav shows count when alerts exist
- [ ] Crossing a threshold (e.g. runway drops below 3 months) creates an alert
- [ ] Weekly digest email is received every Monday with correct data
- [ ] Push notification arrives when urgent alert is created
- [ ] Unsubscribe link works and is included in every email
- [ ] Email preferences can be managed from the user's profile

## ✋ STOP — confirm before proceeding to Phase 5

**Tell me:** Phase 4 complete. Ready for Phase 5.

---

---

# PHASE 5 — Live Loan Pre-Qualification

> **Why fifth:** This is the core revenue engine. Users with connected bank data (Phase 2) have verified financials — lenders trust verified data and pre-qualification becomes meaningful. This phase also generates referral commissions on every funded loan.

## What we are building

- A standardised loan application profile built from the user's Supabase data
- API integrations with 3–5 partnered lenders
- A live offers screen that returns real pre-qualified amounts and rates in seconds
- Application pre-fill — clicking "Apply" opens the lender form with data already filled
- Commission tracking — each referred application is tracked for revenue attribution

## Lender partner options (start with these)

| Lender | API availability | Loan types | Commission |
|---|---|---|---|
| Bluevine | Public partner API | Line of credit, term loan | ~2–3% of funded amount |
| Funding Circle | Partner program | Term loans $25K–$500K | ~3–4% of funded amount |
| Lendio | Marketplace API | All types, matches multiple lenders | Revenue share |
| OnDeck | Partner API | Term loans, LOC | ~2–3% of funded amount |
| SBA LINC | Free referral system | SBA 7(a), 504 | No commission (goodwill/trust) |

## Pre-flight checklist

- [ ] **5.1** Phases 1 and 2 are fully complete (verified bank data is essential here)
- [ ] **5.2** You understand that lender API partnerships require a business agreement — allow 1–2 weeks for approval after applying
- [ ] **5.3** You are comfortable tracking referrals and receiving commission payments (this requires a bank account and tax info for the FinWise business)
- [ ] **5.4** You have reviewed the lender list above and have a preference for which to approach first
- [ ] **5.5** You understand that pre-qualification is not a loan approval — this must be clearly communicated to users

## What we will build in Phase 5

### 5-A: Edge Functions

```
POST /loans/profile             → build standardised loan profile from user data
POST /loans/prequalify          → submit to lender APIs and collect offers
GET  /loans/offers              → get latest pre-qualification results for user
POST /loans/apply               → initiate application with selected lender
GET  /loans/applications        → track user's loan applications
```

### 5-B: New database tables

```
loan_profiles       (standardised profile sent to lenders, versioned by date)
loan_offers         (lender name, amount, rate, term, probability, expires_at, user_id)
loan_applications   (lender, amount, status, applied_at, funded_at, commission, user_id)
```

### 5-C: Frontend — new Loan Offers screen

- Accessible from the Daily Briefing when "loan window open" priority card appears
- Also accessible from the Lender Marketplace tool (upgrades the existing page)
- Shows offer cards: lender name, amount, rate, monthly EMI, approval probability
- "Apply — pre-filled" button: passes data to lender's application URL via deep link or API

### 5-D: Commission tracking

- When user clicks Apply, record the referral in `loan_applications`
- When lender confirms funding (webhook or manual update), record commission
- Advisor dashboard shows commission pipeline (feeds Phase 7)

## Steps (we do these together)

```
Step 5.1  → Apply for Lendio and Bluevine partner accounts
Step 5.2  → Build standardised loan profile schema
Step 5.3  → Create /loans/profile Edge Function
Step 5.4  → Integrate first lender API (start with Lendio — they aggregate multiple lenders)
Step 5.5  → Create loan_offers table and /loans/offers endpoint
Step 5.6  → Build the Loan Offers UI (upgrade existing lenderMarketplace.html)
Step 5.7  → Add "Loan window open" priority card to Daily Briefing (Phase 3 integration)
Step 5.8  → Build application pre-fill flow
Step 5.9  → Add commission tracking to loan_applications table
Step 5.10 → Test end to end with sandbox/test lender credentials
```

## Verify Phase 5 is done

- [ ] User sees real pre-qualified loan offers (not a static list)
- [ ] Offers differ based on the user's actual financial profile
- [ ] Clicking Apply pre-fills the lender form correctly
- [ ] Loan applications are tracked in the database
- [ ] "Loan window open" priority appears on the briefing when conditions are met
- [ ] Commission tracking records referrals

## ✋ STOP — confirm before proceeding to Phase 6

**Tell me:** Phase 5 complete. Ready for Phase 6.

---

---

# PHASE 6 — Mobile PWA

> **Why sixth:** The foundation already exists — sw.js is already in the project. This phase enhances it for a true mobile-first experience. Most SMB owners manage their business from their phone. This reaches them where they are.

## What we are building

- Full PWA (Progressive Web App) — installable on iPhone and Android home screen
- Offline mode — core tools work without internet, sync when connection returns
- Push notifications (builds on Phase 4 infrastructure)
- Mobile-optimised layout for all key screens
- App store presence (optional — PWA can be submitted to Google Play Store via TWA)

## Pre-flight checklist

- [ ] **6.1** Phases 1 and 4 are complete (API + push notifications)
- [ ] **6.2** The app is served over HTTPS (required for PWA install — Supabase Storage or Netlify/Vercel hosting needed if currently on file://)
- [ ] **6.3** You have reviewed manifest.json — it already exists in the project and needs updating
- [ ] **6.4** You are comfortable testing on a real mobile device (not just browser developer tools)

## What we will build in Phase 6

### 6-A: Service Worker enhancements (sw.js already exists)

```
- Cache API responses for offline use
- Background sync — queue profile saves when offline, send when online
- Push notification handling (already partially set up in Phase 4)
- Update notification — tell users when a new version is available
```

### 6-B: manifest.json updates

```json
{
  "name": "FinWise — Business Advisor",
  "short_name": "FinWise",
  "theme_color": "#0f172a",
  "background_color": "#0f172a",
  "display": "standalone",
  "start_url": "/dashboard.html",
  "icons": [ various sizes 192x192, 512x512 ]
}
```

### 6-C: Mobile layout improvements

- Touch-friendly button sizes (minimum 44px tap targets)
- Bottom navigation bar for mobile (replaces sidebar)
- Swipe gesture for priority cards on the briefing
- Compact table views on small screens
- No horizontal scrolling on any screen

### 6-D: Install prompt

- Smart install banner appears after 3rd session
- "Add to Home Screen" button in the nav menu
- Tracks whether user has installed (localStorage flag)

## Steps (we do these together)

```
Step 6.1  → Update manifest.json with correct icons and start_url
Step 6.2  → Enhance sw.js — add API response caching
Step 6.3  → Add background sync for profile saves
Step 6.4  → Audit all screens for mobile layout issues
Step 6.5  → Add bottom navigation bar for mobile
Step 6.6  → Implement install prompt logic
Step 6.7  → Test on real iPhone and Android device
Step 6.8  → Verify offline mode — disconnect internet, confirm core tools still work
Step 6.9  → Submit to Google Play Store via TWA (optional)
```

## Verify Phase 6 is done

- [ ] App installs on iPhone and Android home screen
- [ ] App opens full-screen with no browser UI
- [ ] Core tools work offline (data from last sync shown)
- [ ] Push notifications appear on the lock screen
- [ ] No horizontal scrolling on any screen at 375px wide
- [ ] Install prompt appears after 3 sessions

## ✋ STOP — confirm before proceeding to Phase 7

**Tell me:** Phase 6 complete. Ready for Phase 7.

---

---

# PHASE 7 — Advisor Network + White-Label

> **Why last:** This is the B2B revenue layer. It builds on everything. An advisor needs real data (Phase 2), health scores (Phase 3), and alerts (Phase 4) to add value. White-label for banks is only worth building once the product is proven.

## What we are building

- Advisor access — accountants and advisors can view a client's live FinWise dashboard
- Comment and recommendation system — advisors leave notes visible to the business owner
- Client portfolio view — an advisor sees all their clients in one dashboard
- White-label configuration — banks and CDFIs can embed FinWise under their brand
- Referral tracking — advisors earn commissions when their clients get funded loans (Phase 5 integration)

## Pre-flight checklist

- [ ] **7.1** All previous phases are complete
- [ ] **7.2** You have at least 1 real accountant or advisor willing to test the advisor view
- [ ] **7.3** You have reviewed data privacy implications — advisors see financial data, this requires explicit user consent
- [ ] **7.4** You have a pricing strategy for advisor seats (e.g. $49/month per advisor) and for white-label (custom contract)
- [ ] **7.5** You understand white-label requires legal agreements with each bank/CDFI partner

## What we will build in Phase 7

### 7-A: Role-based access

```
Role: owner        → full access to own business data
Role: advisor      → read access to client data + ability to add comments
Role: admin        → manage all users (internal FinWise team)
Role: white_label  → advisor with custom branding applied
```

### 7-B: New database tables

```
advisor_relationships   (advisor_id, client_id, access_level, consent_given_at)
advisor_comments        (advisor_id, client_id, content, created_at, resolved)
white_label_configs     (org_name, logo_url, primary_color, domain, created_by)
```

### 7-C: Edge Functions

```
POST /advisor/invite            → invite advisor to view a client account
GET  /advisor/clients           → get advisor's client list with summary metrics
GET  /advisor/client/:id        → get full briefing for one client
POST /advisor/comment           → add a comment on a client's dashboard
GET  /advisor/portfolio         → aggregate view across all clients
```

### 7-D: Advisor dashboard (new page: advisorPortfolio.html)

- Replaces the existing advisorDashboard.test.html placeholder
- Shows all clients as cards with health score, runway, urgent flags
- Clicking a client opens their live briefing in read-only view
- Comment thread visible on each client's dashboard

### 7-E: White-label configuration

- Bank or CDFI signs up as a white-label partner
- They get a custom subdomain (e.g. finwise.firstnationalbank.com)
- Their logo and colours applied via `white_label_configs` table
- Their SMB customers see a co-branded or fully branded experience
- The bank's loan products appear first in the Loan Offers screen

## Steps (we do these together)

```
Step 7.1  → Add role column to profiles table
Step 7.2  → Create advisor_relationships table with consent flow
Step 7.3  → Build advisor invite and accept flow (email-based)
Step 7.4  → Create advisor portfolio page (advisorPortfolio.html)
Step 7.5  → Add comment system to client briefing view
Step 7.6  → Build client detail view (read-only briefing for advisor)
Step 7.7  → Create white_label_configs table and config loader
Step 7.8  → Apply white-label branding dynamically at page load
Step 7.9  → Test: advisor invites, accepts, views client, leaves comment
Step 7.10 → Test: white-label config changes logo and colour correctly
```

## Verify Phase 7 is done

- [ ] Advisor can be invited via email and accepts with one click
- [ ] Advisor sees client list with health scores and urgent flags
- [ ] Advisor can view client's live briefing in read-only mode
- [ ] Advisor can leave comments visible to the client
- [ ] White-label config changes branding without code changes
- [ ] Existing users' data is not accessible to advisors without explicit consent

---

---

# Progress Tracker

Update this as each phase is completed.

| Phase | Status | Completed date | Notes |
|---|---|---|---|
| 1 — Backend + Database | 🔲 Not started | — | — |
| 2 — Plaid Bank Connection | 🔲 Not started | — | Requires Phase 1 |
| 3 — Daily Health Engine | 🔲 Not started | — | Requires 1 + 2 |
| 4 — Alerts + Digest | 🔲 Not started | — | Requires 1 + 3 |
| 5 — Live Loan Matching | 🔲 Not started | — | Requires 1 + 2 |
| 6 — Mobile PWA | 🔲 Not started | — | Requires 1 + 4 |
| 7 — Advisor + White-Label | 🔲 Not started | — | Requires all |

---

# Decisions log

Use this section to record key decisions made during implementation.

| Date | Phase | Decision | Reason |
|---|---|---|---|
| — | — | — | — |

---

*Last updated: 2026-05-01*  
*FinWise v2 — No shortcuts. No excuses.*
