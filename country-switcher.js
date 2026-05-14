/* ════════════════════════════════════════════════════════════════════
   COUNTRY SWITCHER — BizSco Multi-Country Localization

   Country detection priority (highest to lowest):
   1. URL ?cn=xx param (for testing/shareable links)
   2. Saved profile country (locked — cannot be changed via switcher)
   3. Stored visitor preference (localStorage)
   4. IP-based geolocation (free visitors only)
   5. Browser language hint
   6. Default: US

   Profile shape (localStorage 'bizsco_profile'):
   { country: 'us', currency: 'USD', businessName, address, createdAt }
══════════════════════════════════════════════════════════════════════ */

(function(){
  'use strict';

  const STORAGE_KEY  = 'bizsco_country';     // visitor's chosen country (no profile)
  const PROFILE_KEY  = 'bizsco_profile';     // user's locked business profile
  const IP_CACHE_KEY = 'bizsco_ip_country';  // session-cache of IP-detected country
  const DEFAULT_COUNTRY = 'us';

  /* ── Profile helpers ──────────────────────────────────────────── */
  function getProfile(){
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch(e){ return null; }
  }
  function saveProfile(profile){
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  }
  function clearProfile(){
    localStorage.removeItem(PROFILE_KEY);
  }
  function hasProfile(){
    const p = getProfile();
    return !!(p && p.country);
  }

  /* ── IP-based country detection (free visitors only) ─────────── */
  async function detectCountryByIP(){
    const cached = sessionStorage.getItem(IP_CACHE_KEY);
    if (cached) return cached || null;
    try {
      const res = await fetch('https://ipapi.co/json/', { headers: { 'Accept': 'application/json' } });
      if (!res.ok) throw new Error('IP API failed');
      const data = await res.json();
      const iso = (data.country_code || data.country || '').toLowerCase();
      const isoMap = { 'us':'us', 'in':'in', 'gb':'uk', 'au':'au', 'ca':'ca', 'sg':'sg' };
      const result = isoMap[iso] || '';
      sessionStorage.setItem(IP_CACHE_KEY, result);
      return result || null;
    } catch(e){
      sessionStorage.setItem(IP_CACHE_KEY, ''); // cache failure to avoid repeated calls
      return null;
    }
  }

  /* ── Resolve current country (synchronous part) ──────────────── */
  function getInitialCountry(){
    // 1. URL param wins
    const urlParam = new URLSearchParams(window.location.search).get('cn');
    if (urlParam && COUNTRY_DATA[urlParam]) {
      return { country: urlParam, source: 'url', locked: false };
    }
    // 2. Profile country — LOCKED
    const profile = getProfile();
    if (profile && profile.country && COUNTRY_DATA[profile.country]) {
      return { country: profile.country, source: 'profile', locked: true };
    }
    // 3. Stored visitor preference
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && COUNTRY_DATA[stored]) {
      return { country: stored, source: 'stored', locked: false };
    }
    // 4. Browser language hint (instant fallback while IP detect runs)
    const lang = (navigator.language || '').toLowerCase();
    const langMap = {
      'en-in':'in','hi-in':'in','te-in':'in','ta-in':'in','mr-in':'in','bn-in':'in',
      'en-gb':'uk',
      'en-au':'au',
      'en-ca':'ca','fr-ca':'ca',
      'en-sg':'sg','zh-sg':'sg'
    };
    if (langMap[lang]) return { country: langMap[lang], source: 'lang', locked: false };
    return { country: DEFAULT_COUNTRY, source: 'default', locked: false };
  }

  /* ── Lookup helper ───────────────────────────────────────────── */
  function lookup(obj, path){
    return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined) ? acc[key] : undefined, obj);
  }

  /* ── Currency conversion helper ──────────────────────────────── */
  function smartRound(n){
    if (n < 100) return Math.round(n / 5) * 5;
    if (n < 1000) return Math.round(n / 50) * 50;
    if (n < 10000) return Math.round(n / 100) * 100;
    if (n < 100000) return Math.round(n / 500) * 500;
    if (n < 1000000) return Math.round(n / 5000) * 5000;
    return Math.round(n / 50000) * 50000;
  }
  function formatLocal(num, country){
    const data = COUNTRY_DATA[country] || COUNTRY_DATA[DEFAULT_COUNTRY];
    const sym = data.currency || '$';
    // Indian numbering system (lakh/crore) for INR
    if (data.code === 'IN') {
      return sym + num.toLocaleString('en-IN');
    }
    return sym + num.toLocaleString('en-US');
  }
  function convertUSD(usdAmount, country){
    const data = COUNTRY_DATA[country] || COUNTRY_DATA[DEFAULT_COUNTRY];
    const rate = data.exchangeRate || 1.0;
    return smartRound(usdAmount * rate);
  }

  /* ── Apply country to DOM ────────────────────────────────────── */
  function applyCountry(country){
    const data = COUNTRY_DATA[country] || COUNTRY_DATA[DEFAULT_COUNTRY];
    if (!data) return;

    document.documentElement.lang = data.lang || 'en';
    if (data.title) document.title = data.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && data.description) metaDesc.setAttribute('content', data.description);

    document.querySelectorAll('[data-cn]').forEach(el => {
      const value = lookup(data, el.getAttribute('data-cn'));
      if (value === undefined || value === null) return;
      if (Array.isArray(value)) {
        el.textContent = value.join(', ');
      } else if (el.hasAttribute('data-cn-html')) {
        el.innerHTML = value;
      } else {
        el.textContent = value;
      }
    });

    document.querySelectorAll('[data-cn-list]').forEach(el => {
      const value = lookup(data, el.getAttribute('data-cn-list'));
      const tpl = el.getAttribute('data-cn-tpl') || 'li';
      if (Array.isArray(value)) {
        el.innerHTML = value.map(item => `<${tpl}>${item}</${tpl}>`).join('');
      }
    });

    // Convert USD amounts to local currency
    // <span data-cn-usd="5000">$5,000</span> → "₹4,15,000" in India
    // Use data-cn-usd-suffix="/mo" to keep suffix intact
    document.querySelectorAll('[data-cn-usd]').forEach(el => {
      const usd = parseFloat(el.getAttribute('data-cn-usd'));
      if (isNaN(usd)) return;
      const localAmount = convertUSD(usd, country);
      const suffix = el.getAttribute('data-cn-usd-suffix') || '';
      el.textContent = formatLocal(localAmount, country) + suffix;
    });

    // Just swap currency symbol (for non-numeric currency references)
    document.querySelectorAll('[data-cn-symbol]').forEach(el => {
      el.textContent = data.currency || '$';
    });

    // Auto-convert <span data-cn-money="number"> elements with currency formatting
    document.querySelectorAll('[data-cn-money]').forEach(el => {
      const num = parseFloat(el.getAttribute('data-cn-money'));
      if (isNaN(num)) return;
      el.textContent = formatLocal(num, country);
    });

    // Auto-update tier badges: <span data-tier-badge="starter">Starter — $9/mo</span>
    const planMap = { starter: 'survive', pro: 'scale', advisor: 'advise', free: 'free' };
    document.querySelectorAll('[data-tier-badge]').forEach(el => {
      const tier = el.getAttribute('data-tier-badge');
      const planKey = planMap[tier];
      const price = (data.pricing && data.pricing[planKey] && data.pricing[planKey].price) || '';
      const label = tier.charAt(0).toUpperCase() + tier.slice(1);
      el.textContent = price ? (label + ' — ' + price + '/mo') : label;
    });

    // Sync selector + chip
    const selector = document.getElementById('cn-selector');
    if (selector) selector.value = country;
    const chip = document.getElementById('cn-chip');
    if (chip) chip.textContent = data.flag + ' ' + data.brandSuffix;

    // Update locked-state UI on selector
    updateSelectorLockState();

    window.dispatchEvent(new CustomEvent('countrychange', { detail: { country, data } }));
  }

  /* ── Show profile-mismatch warning popup ─────────────────────── */
  function showProfileMismatchWarning(profileCountry, attemptedCountry){
    const pData = COUNTRY_DATA[profileCountry];
    const aData = COUNTRY_DATA[attemptedCountry];
    if (!pData || !aData) return;

    // Remove any existing popup
    const existing = document.getElementById('cn-warning-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'cn-warning-modal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,.6);z-index:10001;display:flex;align-items:center;justify-content:center;padding:20px;font-family:Inter,system-ui,sans-serif';

    modal.innerHTML = `
      <div style="background:#fff;border-radius:14px;max-width:520px;width:100%;padding:28px;box-shadow:0 24px 64px rgba(0,0,0,.3)">
        <div style="font-size:1.8rem;margin-bottom:8px">${pData.flag} → ${aData.flag}</div>
        <h3 style="font-size:1.25rem;font-weight:800;color:#0f172a;margin-bottom:10px;line-height:1.3">
          Your business profile is set to ${pData.flag} ${pData.name}
        </h3>
        <p style="font-size:.92rem;color:#475569;line-height:1.65;margin-bottom:18px">
          Your saved business data uses <strong>${pData.currencyCode} (${pData.currency})</strong>. Switching the site to ${aData.name} would only change UI labels — your loan analysis, tax calculations, and scheme matches would still apply ${pData.name} rules to ${pData.currency} numbers, giving you <strong>incorrect results</strong>.
        </p>
        <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:12px 14px;border-radius:6px;margin-bottom:18px;font-size:.85rem;color:#78350f;line-height:1.5">
          <strong>📌 Profile address country: ${pData.name} (${pData.currency})</strong><br>
          To use ${aData.flag} ${aData.name} tools, choose an option below.
        </div>
        <div style="display:flex;flex-direction:column;gap:8px">
          <button id="cn-warn-update" style="background:#4f46e5;color:#fff;border:none;padding:11px 16px;border-radius:8px;font-weight:700;font-size:.9rem;cursor:pointer;text-align:left">
            🔄 Update my profile to ${aData.flag} ${aData.name} (${aData.currency})<br>
            <span style="font-weight:400;font-size:.78rem;opacity:.85">Existing numbers stay as-is — you'll review them on the profile page</span>
          </button>
          <button id="cn-warn-new" style="background:#fff;color:#0f172a;border:1.5px solid #e2e8f0;padding:11px 16px;border-radius:8px;font-weight:700;font-size:.9rem;cursor:pointer;text-align:left">
            ✨ Start a NEW ${aData.flag} ${aData.name} profile<br>
            <span style="font-weight:400;font-size:.78rem;color:#64748b">Keep ${pData.flag} ${pData.name} profile, create a fresh ${aData.name} one</span>
          </button>
          <button id="cn-warn-cancel" style="background:transparent;color:#64748b;border:none;padding:8px 16px;font-weight:600;font-size:.85rem;cursor:pointer;margin-top:4px">
            Cancel — keep ${pData.flag} ${pData.name}
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('cn-warn-update').onclick = () => {
      const profile = getProfile();
      profile.country = attemptedCountry;
      profile.currency = aData.currencyCode;
      profile.updatedAt = new Date().toISOString();
      saveProfile(profile);
      modal.remove();
      applyCountry(attemptedCountry);
      showToast(`✓ Profile updated to ${aData.flag} ${aData.name}`);
    };
    document.getElementById('cn-warn-new').onclick = () => {
      clearProfile();
      localStorage.setItem(STORAGE_KEY, attemptedCountry);
      modal.remove();
      applyCountry(attemptedCountry);
      showToast(`✨ Starting fresh ${aData.flag} ${aData.name} profile. Set up your business when ready.`);
    };
    document.getElementById('cn-warn-cancel').onclick = () => {
      modal.remove();
      // Reset selector to profile's country
      const sel = document.getElementById('cn-selector');
      if (sel) sel.value = profileCountry;
    };
  }

  /* ── Toast notification ──────────────────────────────────────── */
  function showToast(msg){
    const t = document.createElement('div');
    t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#0f172a;color:#fff;padding:12px 20px;border-radius:8px;font-family:Inter,sans-serif;font-size:.88rem;z-index:10002;box-shadow:0 8px 24px rgba(0,0,0,.25);max-width:90vw';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .4s'; }, 3000);
    setTimeout(() => t.remove(), 3500);
  }

  /* ── Update selector lock-state visually ─────────────────────── */
  function updateSelectorLockState(){
    const wrap = document.getElementById('cn-selector-wrap');
    if (!wrap) return;
    const profile = getProfile();
    const note = document.getElementById('cn-profile-note');
    if (profile && profile.country) {
      wrap.style.borderColor = '#fbbf24';
      wrap.title = `Profile locked to ${COUNTRY_DATA[profile.country].name}. Click to change.`;
      if (!note) {
        const n = document.createElement('div');
        n.id = 'cn-profile-note';
        n.style.cssText = 'font-size:.65rem;color:#92400e;background:#fef3c7;padding:2px 8px;border-radius:0 0 6px 6px;margin:4px -4px -4px;text-align:center;font-weight:600';
        n.textContent = '🔒 Profile country';
        wrap.appendChild(n);
      }
    } else {
      wrap.style.borderColor = '#e2e8f0';
      wrap.title = 'Choose your country';
      if (note) note.remove();
    }
  }

  /* ── Inject country selector widget ──────────────────────────── */
  function injectSelector(){
    if (document.getElementById('cn-selector-wrap')) return;

    const wrap = document.createElement('div');
    wrap.id = 'cn-selector-wrap';
    wrap.style.cssText = 'position:fixed;top:14px;right:14px;z-index:10000;background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:4px;box-shadow:0 4px 16px rgba(0,0,0,.08);font-family:Inter,system-ui,sans-serif;transition:border-color .2s';

    const select = document.createElement('select');
    select.id = 'cn-selector';
    select.style.cssText = 'border:none;background:transparent;padding:6px 10px;font-size:.85rem;font-weight:600;cursor:pointer;outline:none;color:#0f172a';
    select.setAttribute('aria-label','Select country');

    Object.keys(COUNTRY_DATA).forEach(key => {
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = COUNTRY_DATA[key].flag + ' ' + COUNTRY_DATA[key].name;
      select.appendChild(opt);
    });

    select.addEventListener('change', (e) => {
      const newCountry = e.target.value;
      const profile = getProfile();

      // If profile exists, check for country mismatch
      if (profile && profile.country && profile.country !== newCountry) {
        showProfileMismatchWarning(profile.country, newCountry);
        // Revert immediately
        e.target.value = profile.country;
        return;
      }

      // No profile — free to switch
      localStorage.setItem(STORAGE_KEY, newCountry);
      applyCountry(newCountry);
    });

    wrap.appendChild(select);
    document.body.appendChild(wrap);
    updateSelectorLockState();
  }

  /* ── Inject emoji font fallback so icons render properly on all systems ── */
  function injectEmojiFontFix(){
    if (document.getElementById('cn-emoji-fix-style')) return;
    const style = document.createElement('style');
    style.id = 'cn-emoji-fix-style';
    style.textContent = `
      body, body * {
        font-family: var(--app-font, "Inter"), "Segoe UI", "Apple Color Emoji",
                     "Segoe UI Emoji", "Noto Color Emoji", "Segoe UI Symbol",
                     system-ui, -apple-system, sans-serif;
      }
    `;
    document.head.appendChild(style);
  }

  /* ── Clean broken emoji placeholders (literal ?, ??, ??? in text) ── */
  function cleanBrokenEmojis(){
    // Word patterns of '?' that appear as broken emojis:
    // 1. <element>?</element>, <element>??</element>, <element>???</element>
    //    (element content is JUST question marks — clearly a broken emoji)
    // 2. "?? Some Text" or "??? Some Text" at the start of a text node
    //    (leading question marks before space and capitalized word)

    function processTextNode(node){
      if (!node.nodeValue) return;
      let val = node.nodeValue;
      // Strip leading "?? ", "??? ", "? " when followed by letter
      const cleaned = val.replace(/^[\s]*\?{1,3}\s+(?=[A-Z$₹£€])/gm, '');
      // Strip trailing " ?" arrows
      const cleaned2 = cleaned.replace(/\s+\?(?=\s*$)/gm, ' →');
      if (cleaned2 !== val) node.nodeValue = cleaned2;
    }

    function walk(el){
      // For elements whose entire text content is just ?, ??, ??? — clear them
      if (el.children.length === 0) {
        const txt = (el.textContent || '').trim();
        if (/^\?{1,3}$/.test(txt)) {
          // Replace with a neutral bullet
          el.textContent = '•';
          return;
        }
      }
      // Walk text nodes
      for (let i = 0; i < el.childNodes.length; i++) {
        const child = el.childNodes[i];
        if (child.nodeType === 3) { // text node
          processTextNode(child);
        } else if (child.nodeType === 1) { // element
          // Skip script/style/select/option
          const tag = child.tagName.toLowerCase();
          if (tag === 'script' || tag === 'style' || tag === 'select' || tag === 'option' || tag === 'input' || tag === 'textarea') continue;
          walk(child);
        }
      }
    }

    if (document.body) walk(document.body);
  }

  /* ── Init ────────────────────────────────────────────────────── */
  async function init(){
    if (typeof COUNTRY_DATA === 'undefined') {
      console.error('country-data.js must load before country-switcher.js');
      return;
    }
    injectEmojiFontFix();
    cleanBrokenEmojis();

    // Step 1: Apply initial country immediately (sync sources only)
    const initial = getInitialCountry();
    applyCountry(initial.country);
    injectSelector();

    // Step 2: If no profile and no stored choice — try IP detection async
    if (initial.source === 'default' || initial.source === 'lang') {
      const ipCountry = await detectCountryByIP();
      if (ipCountry && ipCountry !== initial.country && COUNTRY_DATA[ipCountry]) {
        // Only switch if user hasn't manually chosen during the wait
        const stillNoProfile = !hasProfile();
        const noManualChoice = !localStorage.getItem(STORAGE_KEY);
        if (stillNoProfile && noManualChoice) {
          applyCountry(ipCountry);
          // Don't persist IP detection — re-detect next session
        }
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ── Public API ──────────────────────────────────────────────── */
  window.BizScoCountry = {
    getCurrent: () => {
      const profile = getProfile();
      if (profile && profile.country) return profile.country;
      return localStorage.getItem(STORAGE_KEY) || DEFAULT_COUNTRY;
    },
    set: (cn) => {
      if (!COUNTRY_DATA[cn]) return false;
      const profile = getProfile();
      if (profile && profile.country && profile.country !== cn) {
        showProfileMismatchWarning(profile.country, cn);
        return false;
      }
      localStorage.setItem(STORAGE_KEY, cn);
      applyCountry(cn);
      return true;
    },
    data: () => COUNTRY_DATA[window.BizScoCountry.getCurrent()],

    // Apply UI only (no profile check) — used by wizard preview
    apply: applyCountry,

    // Currency helpers — convert USD amount to current country's currency, formatted string
    convertUSD: (usd, opts) => {
      const country = window.BizScoCountry.getCurrent();
      const amount = convertUSD(usd, country);
      if (opts && opts.numberOnly) return amount;
      return formatLocal(amount, country) + (opts && opts.suffix ? opts.suffix : '');
    },
    formatLocal: (num) => formatLocal(num, window.BizScoCountry.getCurrent()),

    // Profile API
    getProfile,
    saveProfile: (p) => {
      const country = p.country || DEFAULT_COUNTRY;
      const fullProfile = Object.assign({
        currency: (COUNTRY_DATA[country] || {}).currencyCode || 'USD',
        createdAt: new Date().toISOString()
      }, p, { country });
      saveProfile(fullProfile);
      applyCountry(country);
      updateSelectorLockState();
      return fullProfile;
    },
    clearProfile: () => {
      clearProfile();
      updateSelectorLockState();
    },
    hasProfile
  };
})();
