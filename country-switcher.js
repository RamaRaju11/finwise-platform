/* ════════════════════════════════════════════════════════════════════
   COUNTRY SWITCHER — BizSco Multi-Country Localization
   Reads selected country from localStorage, applies it to all
   elements marked with data-cn="key.path" attributes.
══════════════════════════════════════════════════════════════════════ */

(function(){
  'use strict';

  const STORAGE_KEY = 'bizsco_country';
  const DEFAULT_COUNTRY = 'us';

  // ── 1. Determine current country (URL param > localStorage > browser locale > default)
  function getCurrentCountry(){
    const urlParam = new URLSearchParams(window.location.search).get('cn');
    if (urlParam && COUNTRY_DATA[urlParam]) {
      localStorage.setItem(STORAGE_KEY, urlParam);
      return urlParam;
    }
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && COUNTRY_DATA[stored]) return stored;

    // Auto-detect from browser language
    const lang = (navigator.language || '').toLowerCase();
    const langMap = {
      'en-in':'in','hi-in':'in','te-in':'in','ta-in':'in','mr-in':'in','bn-in':'in',
      'en-gb':'uk',
      'en-au':'au',
      'en-ca':'ca','fr-ca':'ca',
      'en-sg':'sg','zh-sg':'sg'
    };
    if (langMap[lang]) return langMap[lang];
    return DEFAULT_COUNTRY;
  }

  // ── 2. Lookup a nested path in country object (e.g. "hero.h1Line1")
  function lookup(obj, path){
    return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined) ? acc[key] : undefined, obj);
  }

  // ── 3. Apply country to all marked elements
  function applyCountry(country){
    const data = COUNTRY_DATA[country] || COUNTRY_DATA[DEFAULT_COUNTRY];
    if (!data) return;

    // Set <html lang>
    document.documentElement.lang = data.lang || 'en';

    // Set <title> and meta description
    if (data.title) document.title = data.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && data.description) metaDesc.setAttribute('content', data.description);

    // Replace all data-cn elements
    document.querySelectorAll('[data-cn]').forEach(el => {
      const path = el.getAttribute('data-cn');
      const value = lookup(data, path);
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          // For lists, replace via data-cn-tpl on parent + data-cn-item on template child
          // Default: join with comma
          el.textContent = value.join(', ');
        } else {
          // Preserve any HTML in the value (e.g. <span> in h1)
          if (el.hasAttribute('data-cn-html')) {
            el.innerHTML = value;
          } else {
            el.textContent = value;
          }
        }
      }
    });

    // Replace data-cn-html elements (innerHTML, supports HTML)
    document.querySelectorAll('[data-cn-html]').forEach(el => {
      const path = el.getAttribute('data-cn-html');
      const value = lookup(data, path);
      if (value !== undefined && value !== null && typeof value === 'string') {
        el.innerHTML = value;
      }
    });

    // Replace lists (data-cn-list="path" on container, data-cn-tpl on template child)
    document.querySelectorAll('[data-cn-list]').forEach(el => {
      const path = el.getAttribute('data-cn-list');
      const value = lookup(data, path);
      const tpl = el.getAttribute('data-cn-tpl') || 'li';
      if (Array.isArray(value)) {
        el.innerHTML = value.map(item => `<${tpl}>${item}</${tpl}>`).join('');
      }
    });

    // Sync the country selector dropdown if present
    const selector = document.getElementById('cn-selector');
    if (selector) selector.value = country;

    // Update country chip if present
    const chip = document.getElementById('cn-chip');
    if (chip) chip.textContent = data.flag + ' ' + data.brandSuffix;

    // Dispatch event so other scripts can react
    window.dispatchEvent(new CustomEvent('countrychange', { detail: { country, data } }));
  }

  // ── 4. Country selector widget (floating top-right)
  function injectSelector(){
    if (document.getElementById('cn-selector-wrap')) return;

    const wrap = document.createElement('div');
    wrap.id = 'cn-selector-wrap';
    wrap.style.cssText = 'position:fixed;top:14px;right:14px;z-index:10000;background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:4px;box-shadow:0 4px 16px rgba(0,0,0,.08);font-family:Inter,system-ui,sans-serif';

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
      localStorage.setItem(STORAGE_KEY, newCountry);
      applyCountry(newCountry);
    });

    wrap.appendChild(select);
    document.body.appendChild(wrap);
  }

  // ── 5. Init
  function init(){
    if (typeof COUNTRY_DATA === 'undefined') {
      console.error('country-data.js must load before country-switcher.js');
      return;
    }
    const country = getCurrentCountry();
    applyCountry(country);
    injectSelector();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for external use
  window.BizScoCountry = {
    getCurrent: () => localStorage.getItem(STORAGE_KEY) || DEFAULT_COUNTRY,
    set: (cn) => { if (COUNTRY_DATA[cn]) { localStorage.setItem(STORAGE_KEY, cn); applyCountry(cn); } },
    apply: applyCountry,
    data: () => COUNTRY_DATA[getCurrentCountry()]
  };
})();
