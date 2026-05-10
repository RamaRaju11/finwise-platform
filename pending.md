# Pending Tasks

## Stripe Payment Buttons (Priority: High)

Wire real Stripe Payment Links into the 3 pricing buttons on index.html.

### Steps:
1. Go to dashboard.stripe.com → Switch to **Live account** (not sandbox)
2. Click **Payment Links** in left menu → **+ New** for each plan:
   - **Starter** — $9/month
   - **Pro** — $29/month
   - **Advisor** — $79/month
3. Copy the 3 live payment link URLs
4. Paste all 3 links here — Claude will update index.html in one shot

### Current state:
- Pricing buttons exist on index.html but href="#" (no real link yet)
- Stripe account already exists (sandbox has dummy subscriptions)
- Need to create equivalent links in **live mode**

---

## Done
- [x] Google Analytics GA4 — ID: G-DC9C8M6R9T
- [x] Formspree email capture — ID: xgodlldk (tested and working)
- [x] GitHub Pages deployment live
