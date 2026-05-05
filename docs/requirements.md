# FinWise SmallBiz Platform — Requirements

**Version:** 1.0
**Date:** April 24, 2026
**Status:** Active Development

---

## 1. Platform Overview

FinWise is a browser-native, self-contained financial intelligence platform for small business owners and financial advisors. All tools run client-side using HTML/CSS/JavaScript. Data is persisted in Supabase (PostgreSQL + Auth). Payments via Stripe. Email via Resend.

---

## 2. User Roles & Plan Tiers

| Plan | Monthly | Annual | Access |
|------|---------|--------|--------|
| Free | $0 | $0 | 6 core tools |
| Starter | $9/mo | $84/yr | +8 tools (tax, invoices, payroll, bank upload) |
| Pro | $29/mo | $276/yr | +5 tools (AI CFO, forecasting, P&L) |
| Advisor | $79/mo | $756/yr | +5 advisor tools (client portal, white-label) |

---

## 3. Authentication & User Management

### REQ-AUTH-001: User Signup
- Email + password registration via Supabase Auth
- Auto-creates profile row with full_name, trial_ends_at (+7 days), trial_plan='starter'
- Captures referral code from URL ?ref= param
- Clears stale localStorage on new signup

### REQ-AUTH-002: User Login
- Email + password via Supabase signInWithPassword
- Already-logged-in users: redirect to dashboard.html (if onboarded) or onboarding.html
- Stale localStorage cleared when different user logs in (via fw_uid detection)

### REQ-AUTH-003: Password Reset
- Email-based reset via Supabase resetPasswordForEmail
- Redirects to auth.html?mode=reset

### REQ-AUTH-004: Sign Out
- Clears Supabase session
- Redirects to auth.html

---

## 4. Trial & Subscription System

### REQ-TRIAL-001: 7-Day Free Trial
- All new signups get 7-day Starter trial automatically
- trial_ends_at stored in profiles table
- Dashboard shows countdown banner with days remaining
- On expiry: plan reverts to free

### REQ-SUB-001: Stripe Payment Links
- Monthly: Starter $9, Pro $29, Advisor $79
- Annual: Starter $84, Pro $276, Advisor $756
- All links pre-filled with ?prefilled_email= of logged-in user
- Stripe webhook updates profiles.plan + plan_expires_at

### REQ-SUB-002: Webhook Processing
- checkout.session.completed: sets plan + expiry (31 days monthly, 365 days annual)
- customer.subscription.deleted: reverts plan to free
- Annual amounts: $84→starter/365d, $276→pro/365d, $756→advisor/365d

### REQ-SUB-003: Payment Success Page
- payment-success.html shown after Stripe payment
- 5-second countdown then redirects to dashboard.html

---

## 5. Onboarding

### REQ-ONB-001: Business Profile Setup
- Fields: Business Name, Industry (12 categories), State (50 + DC), Employee Count
- Financial: Monthly Revenue, Monthly Expenses, Existing EMI, Cash Reserve
- Stored in fw_profile localStorage key
- Sets fw_onboarded flag on completion

---

## 6. Dashboard

### REQ-DASH-001: Metric Cards
- Monthly Revenue, Total Expenses, Net Profit, Cash Runway (months)
- Calculated from fw_profile localStorage

### REQ-DASH-002: Tools Grid
- Shows unlocked tools as clickable cards
- Shows 2 locked tools as upgrade previews
- Plan-gated: free < starter < pro < advisor

### REQ-DASH-003: Trial Banner
- Shown when auth.onTrial = true
- Displays days remaining, link to pricing.html

### REQ-DASH-004: Referral Card
- Shows unique referral link (first 8 chars of user UUID)
- Copy, WhatsApp, Email, Twitter share buttons
- Shows friends joined count + months free earned

### REQ-DASH-005: Recent Activity
- Last 6 tools opened, tracked in fw_recent localStorage

---

## 7. Free Tier Tools

### REQ-TOOL-001: Loan Safety Score
- Inputs: Revenue, Expenses, EMI, Reserve, Loan Amount, Term, Rate
- Output: SAFE / RISKY / BORDERLINE verdict with breakdown
- Pre-fills from fw_profile

### REQ-TOOL-002: EMI Calculator
- Loan amount, tenure (months), interest rate
- Monthly EMI, total interest, total repayment
- Amortization schedule

### REQ-TOOL-003: Cash Runway
- Revenue, Expenses, EMI, Cash Reserve inputs
- Output: months of runway, burn rate
- Color-coded: green ≥6mo, amber 3-5mo, red <3mo

### REQ-TOOL-004: Break-Even Analysis
- Fixed costs, variable cost per unit, revenue per unit
- Break-even units, break-even revenue, contribution margin

### REQ-TOOL-005: Lender Marketplace
- Static directory: SBA, BlueVine, OnDeck, Kabbage, Fundbox
- Filter by loan type, amount range

### REQ-TOOL-006: Goal Tracker
- Goal types: Revenue, Profit, Savings, Expense Reduction
- Monthly progress logging
- Pace detection: ahead / on-track / behind / danger
- Bar chart visualization
- Data in fw_goals localStorage

---

## 8. Starter Tier Tools

### REQ-TOOL-007: Loan Eligibility
- Business age, credit score, revenue inputs
- Matches against lender criteria
- Outputs eligible/ineligible list with loan amounts

### REQ-TOOL-008: Owner's Pay
- Revenue, expenses, EMI, reserve inputs
- Safe owner pay calculation with buffer
- Slider for conservative/moderate/aggressive

### REQ-TOOL-009: Business Health Score
- A–F grade based on: profit margin, cash runway, debt ratio, growth
- Score 0–100 with weighted components
- Recommendations per score range

### REQ-TOOL-010: Grant Finder
- Business type, industry, state, employee count filters
- Federal + state grant database (static)
- Eligibility match percentage

### REQ-TOOL-011: Tax Estimator
- Business structure: Sole Proprietor, S-Corp, Partnership
- Filing status: Single, Married, Head of Household
- State selection (all 50 + DC)
- 2024 federal tax brackets
- SE tax: 15.3% on 92.35% of profit (Sole Prop), 40% for S-Corp
- Outputs: federal tax, state tax, SE tax, quarterly due dates

### REQ-TOOL-012: Invoice Tracker
- CRUD invoices: client, amount, due date, status
- Auto-overdue detection
- Filter tabs: All, Pending, Overdue, Paid
- Mark as paid, auto invoice numbering
- Data in fw_invoices localStorage

### REQ-TOOL-013: Payroll Estimator
- Safety buffer slider (20–40%)
- Benefits % dropdown
- Headcount comparison cards
- Payroll-as-%-of-revenue gauge (green/amber/red)

### REQ-TOOL-014: Bank Statement Upload
- 3-step wizard
- 5 bank presets: Bank of America, Chase, Wells Fargo, Citi, Capital One
- Auto column mapping by bank
- Client-side CSV parsing (FileReader API, never uploads)
- Expense categorization by keyword matching
- Save totals to fw_profile

---

## 9. Pro Tier Tools

### REQ-TOOL-015: Revenue Forecast
- 12-month projection using historical growth rate
- Seasonality adjustments
- Best / Base / Worst case scenarios

### REQ-TOOL-016: AI CFO Advisor
- Chat interface powered by Claude API (via Supabase Edge Function)
- Context-aware: reads fw_profile for personalized answers
- Financial Q&A, ratio analysis, recommendations

### REQ-TOOL-017: Industry Benchmarks
- Compare revenue, margins, expenses to industry averages
- 12 industry categories
- Percentile ranking visualization

### REQ-TOOL-018: Financial Statements
- P&L Statement (monthly + annual)
- Balance Sheet (assets, liabilities, equity)
- Cash Flow Statement
- All generated from fw_profile inputs

### REQ-TOOL-019: Debt Consolidation
- Multiple loan inputs
- Consolidated EMI calculation
- Savings vs current payment comparison

---

## 10. Advisor Tier Tools

### REQ-TOOL-020: Advisor Dashboard
- Client roster with financial health overview
- White-label brand color customization
- Quick stats: total clients, at-risk count, avg health score

### REQ-TOOL-021: Branded Reports
- White-label PDF-style report
- Advisor name, logo, colors applied
- All financial metrics in print-ready format

### REQ-TOOL-022: Client Risk Email
- One-click email draft to clients at financial risk
- Pre-written templates with client-specific data

### REQ-TOOL-023: Referral Tracker
- Track referred users and commission status
- Unique referral link per advisor

### REQ-TOOL-024: Client Portal
- Create secure, token-based read-only report links for clients
- No client login required — 32-char hex token = access
- Sections advisor can share: Revenue/Expenses, Cash Runway, Health Score, Loan Readiness
- Custom message per client
- View count and last-viewed tracking
- Delete portal to revoke access

#### REQ-TOOL-024a: Bulk Client Import
- Upload CSV or Excel (.xlsx/.xls) with up to 200 clients
- Auto-detects Name/Email/Message columns
- Column mapper for manual override
- Preview table with Valid/Invalid badges
- Parallel bulk insert to Supabase

#### REQ-TOOL-024b: Scheduled Monthly Reports
- Per-client toggle to enable monthly email
- Email sent 1st of each month at 8 AM UTC via Resend
- Email includes full HTML report with advisor branding
- schedule_last_sent tracked per portal

### REQ-TOOL-025: White-Label Settings
- Brand Name (replaces "FinWise" in all client reports)
- Tagline, Primary Color (color picker + 8 presets)
- Logo URL
- Custom domain with CNAME DNS instructions
- Hide "Powered by FinWise" toggle
- Live preview updates in real-time
- Settings stored in profiles.wl_* columns
- Applied to client-view.html via shared_data.wl

---

## 11. Referral Program

### REQ-REF-001: Referral Link Generation
- Code = first 8 characters of user's Supabase UUID
- Link format: auth.html?ref=CODE
- Captured at signup and stored in profiles.referred_by

### REQ-REF-002: Referral Credit
- When referred user upgrades to paid plan: referrer gets +1 month free
- referral_credits incremented via Stripe webhook
- referral_credited flag prevents double-credit

---

## 12. Email Drip Campaign

### REQ-EMAIL-001: Day 1 Email
- Trigger: signup + 0 days
- Content: Welcome + top 3 tools overview

### REQ-EMAIL-002: Day 3 Email
- Trigger: signup + 3 days (if still free)
- Content: Cash flow focus, "4 days left" urgency

### REQ-EMAIL-003: Day 7 Email
- Trigger: trial end day (if still free)
- Content: Trial ending today, urgent upgrade CTA

### REQ-EMAIL-004: Drip Tracking
- drip_sent INT[] column tracks which emails sent
- Skips already-sent emails
- Only processes plan='free' users with active trial

---

## 13. Data Model

### profiles table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Supabase Auth user ID (PK) |
| email | TEXT | User email |
| full_name | TEXT | Display name |
| plan | TEXT | free / starter / pro / advisor |
| plan_expires_at | TIMESTAMPTZ | Subscription expiry |
| trial_ends_at | TIMESTAMPTZ | 7-day trial end |
| trial_plan | TEXT | Plan during trial (starter) |
| drip_sent | INT[] | Email drip days sent |
| referred_by | TEXT | Referral code of referrer |
| referral_credits | INT | Months free earned |
| referral_credited | BOOL | Prevents double credit |
| wl_brand_name | TEXT | White-label brand name |
| wl_tagline | TEXT | White-label tagline |
| wl_color | TEXT | Brand hex color |
| wl_logo_url | TEXT | Logo image URL |
| wl_domain | TEXT | Custom domain |
| wl_hide_finwise | BOOL | Hide FinWise branding |

### client_portals table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| advisor_id | UUID | FK → profiles.id |
| client_name | TEXT | Client display name |
| client_email | TEXT | Client email |
| token | TEXT | 32-char hex access token (unique) |
| advisor_name | TEXT | Cached advisor name |
| biz_name | TEXT | Advisor's business name |
| shared_data | JSONB | Report data + wl settings |
| custom_message | TEXT | Advisor's note to client |
| schedule_enabled | BOOL | Monthly email toggle |
| schedule_last_sent | TIMESTAMPTZ | Last email sent timestamp |
| view_count | INT | Number of times client viewed |
| last_viewed_at | TIMESTAMPTZ | Last client view time |
| created_at | TIMESTAMPTZ | Creation timestamp |

---

## 14. External Integrations

| System | Purpose | Auth Method |
|--------|---------|-------------|
| Supabase | Database, Auth, Edge Functions | Anon key (client), Service role (server) |
| Stripe | Payment processing | Payment Links + Webhook |
| Resend | Transactional email | API key (server-side only) |
| SheetJS | Excel parsing | CDN (client-side) |

---

## 15. Security Requirements

- REQ-SEC-001: All payment links pre-filled with ?prefilled_email= to prevent wrong-account payments
- REQ-SEC-002: Token-based client portal access — 128-bit entropy (32 hex chars)
- REQ-SEC-003: Supabase RLS on client_portals — advisors own their rows, anon can only SELECT
- REQ-SEC-004: CSV parsing fully client-side — files never leave the browser
- REQ-SEC-005: Resend API key stored only in Supabase secrets (never in client JS)
- REQ-SEC-006: Service role key never exposed to client

