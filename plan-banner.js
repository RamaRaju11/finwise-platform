/* ════════════════════════════════════════════════════════════════════
   plan-banner.js — plan-aware top banner
   ────────────────────────────────────────────────────────────────────
   Reads window.fwAuth.plan after init and renders a sticky banner that
   tells the signed-in user:
     • their current plan
     • what this plan unlocks
     • the next-tier upgrade with the headline benefit

   Include AFTER modules/fw-auth.js (or with a `defer`).
   Pages with no auth (auth.html, login.html, free-demo.html) skip the
   banner automatically — fwAuth.user is null on those.
   ════════════════════════════════════════════════════════════════════ */
(function(){
  if (window.__planBannerInjected) return;
  window.__planBannerInjected = true;

  /* ---- CSS (injected once) ---- */
  var css = document.createElement('style');
  css.textContent = ''
    + '.fw-plan-banner{position:sticky;top:0;z-index:98;display:flex;align-items:center;gap:12px;padding:7px 18px;font-size:.76rem;font-weight:600;border-bottom:1px solid rgba(0,0,0,.06);flex-wrap:wrap}'
    + '.fw-pb-badge{font-size:.62rem;font-weight:900;letter-spacing:.08em;padding:3px 10px;border-radius:5px;text-transform:uppercase;flex-shrink:0}'
    + '.fw-pb-summary{flex:1;min-width:200px;color:inherit;opacity:.92}'
    + '.fw-pb-summary b{font-weight:800}'
    + '.fw-pb-cta{font-size:.7rem;font-weight:800;padding:5px 12px;border-radius:6px;text-decoration:none;border:1.5px solid transparent;transition:all .15s;white-space:nowrap}'
    + '.fw-pb-cta:hover{transform:translateY(-1px)}'
    + '.fw-pb-free{background:linear-gradient(90deg,#f1f5f9,#e2e8f0);color:#1e293b}'
    + '.fw-pb-free .fw-pb-badge{background:#64748b;color:#fff}'
    + '.fw-pb-free .fw-pb-cta{background:#2563eb;color:#fff}.fw-pb-free .fw-pb-cta:hover{background:#1d4ed8}'
    + '.fw-pb-starter{background:linear-gradient(90deg,#cffafe,#a5f3fc);color:#0e4a5e}'
    + '.fw-pb-starter .fw-pb-badge{background:#0891b2;color:#fff}'
    + '.fw-pb-starter .fw-pb-cta{background:#7c3aed;color:#fff}.fw-pb-starter .fw-pb-cta:hover{background:#6d28d9}'
    + '.fw-pb-pro{background:linear-gradient(90deg,#f3e8ff,#e9d5ff);color:#4c1d95}'
    + '.fw-pb-pro .fw-pb-badge{background:#7c3aed;color:#fff}'
    + '.fw-pb-pro .fw-pb-cta{background:#be185d;color:#fff}.fw-pb-pro .fw-pb-cta:hover{background:#9d174d}'
    + '.fw-pb-advisor{background:linear-gradient(90deg,#fce7f3,#fbcfe8);color:#831843}'
    + '.fw-pb-advisor .fw-pb-badge{background:#be185d;color:#fff}'
    + '.fw-pb-trial-tag{background:#fef3c7;color:#92400e;font-size:.6rem;font-weight:800;padding:2px 7px;border-radius:4px;letter-spacing:.05em;text-transform:uppercase;margin-left:6px}'
  ;
  document.head.appendChild(css);

  /* ---- plan content map ---- */
  var PLAN_CONTENT = {
    free: {
      label: 'Free',
      summary: 'Basic checkup + 3 free tool tries / mo. <b>Save your profile to keep results.</b>',
      cta: { href: 'pricing.html', text: 'Upgrade to Starter $9/mo →' }
    },
    starter: {
      label: 'Starter',
      summary: 'Unlimited checkups, monthly history, score tracking, 10 core tools.',
      cta: { href: 'pricing.html', text: 'Upgrade to Pro $29/mo — AI CFO + 40 tools →' }
    },
    pro: {
      label: 'Pro',
      summary: 'Full Pro: AI CFO, branded lender PDF, 40+ tools, deep insights.',
      cta: { href: 'pricing.html', text: 'Upgrade to Advisor — multi-client mgmt →' }
    },
    advisor: {
      label: 'Advisor',
      summary: 'Advisor tier: multi-client portfolio, white-label exports, everything unlocked.',
      cta: null
    }
  };

  function render(plan, onTrial){
    if (document.querySelector('.fw-plan-banner')) return;   // idempotent
    var content = PLAN_CONTENT[plan] || PLAN_CONTENT.free;
    var bar = document.createElement('div');
    bar.className = 'fw-plan-banner fw-pb-' + plan;

    var badge = '<span class="fw-pb-badge">' + content.label
              + (onTrial ? '<span class="fw-pb-trial-tag">Trial</span>' : '')
              + '</span>';
    var summary = '<span class="fw-pb-summary">' + content.summary + '</span>';
    var cta = content.cta
      ? '<a class="fw-pb-cta" href="' + content.cta.href + '">' + content.cta.text + '</a>'
      : '<span style="font-size:.68rem;font-weight:700;opacity:.7">You have everything ✓</span>';

    bar.innerHTML = badge + summary + cta;
    /* Insert AT THE TOP of <body>. If a sticky header exists, the
       browser stacks them sensibly (banner sticks above header). */
    document.body.insertBefore(bar, document.body.firstChild);
  }

  function tryRender(){
    /* Skip if page has explicitly opted out */
    if (document.body && document.body.dataset && document.body.dataset.noPlanBanner === '1') return;
    if (!window.fwAuth) return;                          /* page not auth-enabled */
    window.fwAuth.init(function(){
      if (!window.fwAuth.user) return;                   /* not signed in: skip */
      render(window.fwAuth.plan || 'free', !!window.fwAuth.onTrial);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryRender);
  } else {
    tryRender();
  }
})();
