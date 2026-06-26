# Debt Center v3 — Implementation Plan

**Status:** Draft for approval before code
**Date:** 2026-06-26
**Owner:** rama.raju@accenture.com

## Why this exists

Today, BizSco tracks debt in three independent stores that don't sync:

1. `fw_profile.emi` — a single aggregate number the user types in onboarding
2. `fw_profile.loan` — the loan amount the user is *considering* (future)
3. `fw_loans` (Debt Center) — itemised loans with full terms

The New Loan Stress Test tool silently writes the loan-being-tested into `fw_loans` as if it were a real debt. So users see mismatches:

- Profile says they owe **$7,500/mo** in EMIs
- Debt Center totals **$1,567/mo** from a single auto-injected stress-test loan
- Loan Readiness on the dashboard (60) and Loan Safety Score in the tool (64) disagree because they use different inputs and different formulas

This plan unifies all debt-related state behind one architecture: **Debt Center as the single source of truth, with loans labelled by status (active / planned / refinance target / paid off).** Profile.emi becomes a derived value when Debt Center has data, with a graceful fallback for users who haven't itemised.

It also adds plan-aware behavior so Free users still see meaningful DSCR while being prompted to upgrade for itemised tracking.

---

## Step 1 — Add `status` field to the loan schema + migrate existing data

**Goal:** Every loan in `fw_loans` carries a status that says what kind of debt it is.

**Data model:**

```
status: 'active' | 'planned' | 'refinance_target' | 'paid_off'
```

- **active** — user is currently paying it
- **planned** — user is considering it, has not taken it yet
- **refinance_target** — a planned loan that would replace an existing active loan
- **paid_off** — historical, kept for trend / insight only

If a loan is `refinance_target`, it also stores `replacesLoanId` pointing at the active loan it would replace.

**Migration on first load of v3:**

For each loan currently in `fw_loans`:

- If `notes` contains "Saved from Loan Safety Score" or "Saved from New Loan Stress Test" → set `status = 'planned'`
- Otherwise → set `status = 'active'`

Migration runs once per user; tracked via a `fw_debt_center_v3_migrated` flag.

**Files:**

- `modules/debtCommandCenter.test.html` (schema + migration block on load)
- `modules/loanRepaymentOptimizer.test.html` (consumer — reads new field)
- `modules/loanRefinanceAnalyzer.test.html` (consumer)
- `modules/loanDecisionScoreEngine.test.html` (consumer)

**Acceptance:**

- Kowalski's existing "Saved from Loan Safety Score (score: 94)" loan auto-tags as `planned`
- All other loans default to `active`
- Migration runs exactly once per user; second visit doesn't re-tag

---

## Step 2 — Stop New Loan Stress Test from auto-injecting into Debt Center

**Goal:** The Stress Test tool no longer writes loans into Debt Center silently.

**Current bug:** After running a stress test, the tool calls a save function that adds the modeled loan to `fw_loans` without asking. This is how the "ghost" planned loans got there.

**Fix:**

- Remove the auto-save call
- Replace with an explicit CTA on the result screen: **"Save this as a Planned loan in Debt Center"** (only enabled if score and inputs are valid)
- The button writes the loan with `status = 'planned'` and a clear note "Saved from Stress Test on YYYY-MM-DD"

**Files:**

- `modules/loanDecisionScoreEngine.test.html` (remove auto-save, add manual button)

**Acceptance:**

- Run Stress Test → no Debt Center row appears unless user clicks Save
- Click Save → row appears in Debt Center with `planned` badge

---

## Step 3 — Profile.emi becomes computed from active loans (with fallback)

**Goal:** Profile and Debt Center never disagree. When Debt Center has data, it wins.

**Behavior:**

| Debt Center state | Profile.emi behavior |
|---|---|
| Empty (no loans) | EMI field is **editable** in onboarding. User types an aggregate. (Same as today.) |
| Has at least one **active** loan | EMI field becomes **read-only display**: `$X,XXX/mo · from N tracked loans · [Edit loans →]`. The link goes to Debt Center. |

The form still saves `fw_profile.emi`, but its value is **always recomputed** from `sum(active_loans.emi)` on every load when Debt Center is non-empty.

**Files:**

- `onboarding.html` (form rendering: show read-only display when applicable, edit link to Debt Center)
- `modules/fw-auth.js` (recompute fw_profile.emi from fw_loans on every login)

**Acceptance:**

- Pro user with 2 active loans sees "$7,500/mo · from 2 tracked loans · [Edit loans →]" instead of an editable field
- Free user with no Debt Center access keeps the editable aggregate field
- Editing a loan in Debt Center updates the profile.emi shown on dashboard within the same session

---

## Step 4 — Add scenario toggle + status badges to Debt Center UI

**Goal:** User can switch between three views of their debt picture.

**Toggle at top of Debt Center:**

```
[ Current debt only ]  [ Including planned ]  [ After refinance ]
```

- **Current debt only** (default) — summary totals include only `active` loans. Matches profile.emi.
- **Including planned** — summary totals include `active + planned` loans. Shows projected DSCR / runway / payoff if user took all planned loans.
- **After refinance** — for each `refinance_target` loan, swap in the new and swap out the loan it replaces. Useful for "should I refinance my 15% credit card to a 9% term loan?"

**Status badges on each loan card:**

| Status | Badge |
|---|---|
| active | green "ACTIVE" |
| planned | amber "PLANNED · not yet taken" |
| refinance_target | purple "REFINANCE TARGET · replaces [Loan Name]" |
| paid_off | gray "PAID OFF" |

**Header cards** (Total debt / Monthly minimums / Avg interest / Payoff estimate) re-compute live as the toggle changes.

**Files:**

- `modules/debtCommandCenter.test.html` (toggle UI + filtered renderers)

**Acceptance:**

- Toggle changes header totals in under 200 ms
- Each loan card shows the correct badge for its status
- "After refinance" view correctly swaps in the new loan and removes the replaced one from totals

---

## Step 5 — Add status selector to the loan add/edit form + status-change actions

**Goal:** User can choose status when adding a loan, and can change status later.

**Add-loan form:** one new dropdown at the top:

```
Loan status: [ Active ▼ ]   ← default
             [ Planned ]
             [ Refinance target ]
             [ Paid off ]
```

When `Refinance target` is selected, an additional field appears: **"Replaces which active loan?"** as a dropdown of active loans.

**On each loan card** (3-dot menu):

- **"Mark as taken"** — appears on `planned` loans. Flips status to `active`. Prompts user to confirm/adjust actual rate and EMI (lenders rarely match the stress-test exactly).
- **"Mark as paid off"** — flips status to `paid_off`.
- **"Convert to planned"** — flips `active → planned` (useful if user paid off informally but wants to model re-taking it).

**Files:**

- `modules/debtCommandCenter.test.html` (form + menu actions)

**Acceptance:**

- New loan defaults to Active
- Marking a planned loan as taken updates profile.emi in the same session
- Refinance target requires a valid `replacesLoanId`; can't save without it

---

## Step 6 — Plan-aware visibility and upsell prompts

**Goal:** Free users see DSCR but get a clear upgrade path. Pro users get full access.

**Per-tier policy:**

| Tier | Dashboard "Loan Readiness" tile | Dashboard "DSCR" tile | Debt Center | Stress Test |
|---|---|---|---|---|
| **Free** | Visible · clicks Edit Profile | Visible · clicks Edit Profile · 🔒 "Itemise (Pro)" sub-badge | Locked → pricing.html | Locked → pricing.html |
| **Starter** | Visible · clicks tool | Visible · clicks Debt Center | Read-only itemised view | Limited (1 scenario per month) |
| **Pro** | Visible · clicks tool | Visible · clicks tool | Full access + scenarios | Unlimited |
| **Advisor** | Same as Pro | Same as Pro | Multi-client | Multi-client |

**Upsell placements for Free users:**

1. **EMI tile** — sub-text reads "Aggregate from profile · Itemise each loan → Pro"
2. **Quick Actions strip** — Debt Center button becomes "🔒 Track each loan (Pro)" linking to pricing.html
3. **After running a checkup** with `RISKY` or `DANGEROUS` verdict — value-led prompt: *"Your DSCR is 0.9x. Itemise your loans to see exactly which one to refinance first. → Try Pro free for 7 days."*

The pitch is always **outcome-led**, not feature-led: "see which loan is hurting your business" not "get the Debt Center tool".

**Files:**

- `dashboard.html` (tile sub-text + Quick Actions lock state)
- `checkup.html` (post-result upsell card when verdict is risky/dangerous + user is free)
- `plan-banner.js` (no change — already plan-aware)

**Acceptance:**

- Free user clicking the EMI tile lands on pricing.html, not Debt Center
- Free user clicking DSCR tile lands on Edit Profile (the field they CAN change)
- Pro user clicking either tile lands on Debt Center

---

## Step 7 — Empty-state and onboarding nudge for Pro users without itemised loans

**Goal:** Pro user who hasn't entered any loans gets a clear path to full value, with a fallback that lets every tool work immediately.

**Three states a Pro user can be in:**

| State | What we show |
|---|---|
| A. profile.emi = 0 AND Debt Center empty | Empty state: "No debt yet — that's great. Track loans here if you take any." |
| B. profile.emi > 0 AND Debt Center empty | **Reconciliation prompt:** see below |
| C. Debt Center has loans | Normal Debt Center, profile.emi computed from sum |

**State B reconciliation prompt:**

In **Debt Center**:

```
You told us you pay $7,500/mo in EMIs. Help every tool give you better
answers — track each loan here.

[ Add manually (2 min)  ]   [ Use one estimated loan ]
                            [ Skip for a week         ]
```

**"Use one estimated loan"** is a one-click fallback that creates a single Debt Center entry:

- Name: "Existing debt (pending review)"
- EMI: `fw_profile.emi`
- Balance: `EMI × 24` (estimated)
- Rate: `10%` (sane default for SMB lending — adjust by country)
- Tenure: `24` months
- Status: `active`
- Visible warning: *"Estimates — please confirm balance and rate when you have time."*

This lets the Repayment Optimizer and Refinance Analyzer run immediately, while making clear the data needs cleanup.

**Dashboard-level banner for state B:**

A small persistent banner that survives across pages:

> 📋 You're tracking **$7,500/mo** in EMIs as one entry. Add the actual loans → unlocks Payoff Optimizer + Refinance Ideas.
> [ Add now ]  [ Dismiss for a week ]

Dismissing buys 7 days; it comes back if still un-itemised.

**Files:**

- `modules/debtCommandCenter.test.html` (empty state, "Use one estimated loan" handler)
- `dashboard.html` (state-B banner, 7-day dismiss flag)

**Acceptance:**

- Fresh Pro user (Kowalski) lands on Debt Center, sees state B with both buttons
- Clicking "Use one estimated loan" creates a row with the right defaults
- Dismissing the dashboard banner hides it for 7 days; localStorage flag respected

---

## Step 8 — Connect Stress Test and Refinance Analyzer to Debt Center

**Goal:** The standalone loan tools become aware of what's already tracked and can write back as `planned` / `refinance_target`.

**Stress Test (`loanDecisionScoreEngine.test.html`):**

- Add "Use planned loans from Debt Center" picker — lists planned loans the user has saved, click to pre-fill the form
- After Save (Step 2), allow optional note + lender + expected start date

**Refinance Analyzer (`loanRefinanceAnalyzer.test.html`):**

- Add "Refinance which loan?" dropdown listing active loans
- After analysis, prompt: *"Save this as a Refinance Target in Debt Center? It would replace [Loan Name]."*
- Saved entry has `status = 'refinance_target'` and `replacesLoanId = <selected>`

**Files:**

- `modules/loanDecisionScoreEngine.test.html` (picker + save handler)
- `modules/loanRefinanceAnalyzer.test.html` (source-loan dropdown + save handler)

**Acceptance:**

- Stress Test result can be saved as planned, appears in Debt Center with planned badge
- Refinance Analyzer result can be saved as refinance_target, appears with badge that names the replaced loan
- "After refinance" toggle in Debt Center correctly swaps these in

---

## Step 9 — Cross-tool DSCR + Loan Readiness recalculation and tooltips

**Goal:** Every surface that shows a debt-derived metric makes its inputs transparent and consistent.

**Loan Readiness tile (dashboard):**

- `sub` text changes from generic "Based on current finances" to **"Based on N active loan(s) · last checkup MMM DD"** when Debt Center has loans
- Tooltip: explicit list of inputs — "Computed from: revenue $65K, expenses $52K, active EMIs $7.5K (sum of 2 loans), reserves $30K"

**DSCR tile (dashboard):**

- `val` shows current ratio
- Hover tooltip shows the breakdown:
  - "Net cash flow $13,000/mo ÷ active EMI $7,500/mo = 1.73x"
  - "Including planned loans: would become 1.41x (Pro)"

**"Show planned in dashboard" toggle (in user settings):**

- Off by default — dashboard reflects current state
- On — dashboard tiles use `active + planned` EMI, with a clear "WHAT-IF" badge on each tile

**Files:**

- `dashboard.html` (tile sub text + tooltip generation + settings toggle)
- `modules/fw-auth.js` (expose helper for loan-count + active-EMI-sum)

**Acceptance:**

- Hovering DSCR shows the breakdown
- Toggle in settings changes dashboard tile values + adds a WHAT-IF badge
- Loan Readiness sub line updates when user adds/removes a loan, no page refresh needed

---

## Step 10 — Testing, migration verification, and rollback path

**Goal:** Ship with confidence. Cover the migration risks and have a way back if something breaks.

**Test matrix:** verify each scenario manually with a seeded test user:

| User profile | Pre-state | Action | Expected |
|---|---|---|---|
| Pro · Kowalski | 1 planned loan from old Stress Test injection | First load of v3 | Loan re-tagged as `planned`; profile.emi unchanged; banner suggests itemising |
| Pro · Sarah | profile.emi = $4,000, Debt Center empty | First load of v3 | State B banner appears; "Use one estimated loan" creates an active row with balance=$96K, rate=10% |
| Free · new user | No data | Onboarding + dashboard | Sees DSCR tile, clicks → goes to Edit Profile; EMI tile shows "Aggregate · Itemise → Pro" |
| Pro · with 3 active + 2 planned | Full Debt Center | Toggle "Including planned" | Totals jump by sum of 2 planned EMIs |
| Pro · refinance scenario | 1 active credit-card loan + 1 refinance_target term loan replacing it | Toggle "After refinance" | Credit-card disappears from totals, term loan appears |

**Migration safety:**

- Backup current state to `june26bkp/` before touching production files (same pattern as june24/june25 backups)
- Migration runs inside a try/catch — any failure leaves `fw_loans` unchanged and logs to console
- Add a `fw_debt_center_v3_disable_migration=1` localStorage flag that skips migration (for our own debugging)

**Rollback:**

- All v3 changes are reversible by restoring from `june26bkp/`
- The new `status` field is additive — older code that doesn't know about it still works (it just treats every loan as if it were `active`)
- If migration corrupts data, user can paste a tiny JS snippet in console to reset `fw_loans` (we document it in the rollback note)

**Acceptance:**

- All 5 rows in the test matrix produce the expected result
- A user with `fw_debt_center_v3_disable_migration=1` sees the old behaviour
- `june26bkp/` exists in the repo and contains the pre-v3 versions of all touched files

---

## Suggested ship order

1. **Steps 1–3** as one batch (data model + auto-injection fix + computed profile.emi). Ship together because they depend on each other; ship alone first and verify on Kowalski's profile.
2. **Steps 4–5** as the next batch (UI for scenarios + status changes).
3. **Steps 6–7** (plan-aware + Pro empty state) — can ship independently of 4/5.
4. **Steps 8–9** (cross-tool wiring + tooltips) — polish; ship after 1–7 stable.
5. **Step 10** (test matrix + migration safety) — runs throughout, not at the end.

## Files touched, complete list

- `modules/debtCommandCenter.test.html` — main UI + state machine
- `modules/loanDecisionScoreEngine.test.html` — Stress Test integration
- `modules/loanRefinanceAnalyzer.test.html` — Refinance integration
- `modules/loanRepaymentOptimizer.test.html` — reads status-filtered loans
- `modules/fw-auth.js` — profile.emi recompute + USER_KEYS already updated
- `onboarding.html` — read-only EMI display when Debt Center has loans
- `dashboard.html` — tile sub-text, tooltips, settings toggle, state-B banner
- `checkup.html` — post-result upsell card for Free users
- New: `june26bkp/` — backup folder before any code changes

## What this plan deliberately does NOT do

- Does not add balance + interest rate to the onboarding form (decided in earlier discussion — too much friction for the Free signup flow)
- Does not change the underlying loan-score / health-score / DSCR formulas
- Does not add multi-currency conversion logic (existing `BizSco_currency` handling is enough)
- Does not touch India-specific WhatsApp signup flow (separate surface, separate plan)

## Open questions for you to confirm before code

1. **Refinance target with leftover balance** — when a refinance loan doesn't cover 100% of the old loan, what should happen to the residual? **My recommendation:** v3 ships without this, flagged as known gap. Add in a follow-up.
2. **"Use one estimated loan" defaults for India users** — should rate default to 12% (more realistic for Indian SMB lending) instead of 10%? **My recommendation:** branch by `fw_profile.country`.
3. **Starter tier permissions** — does Starter get full Debt Center or read-only? Plan doc says Starter has "limited" but the line between Starter and Pro on this feature isn't drawn yet. **My recommendation:** Starter gets read-only Debt Center + 1 scenario per month; full editing + unlimited scenarios is Pro.

---

*End of plan. Reply with "approved" or "change X" before any code starts.*
