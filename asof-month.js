/* ════════════════════════════════════════════════════════════════════
   BizSco — Shared "As-of Month" tagger
   --------------------------------------------------------------------
   Lets users tag the monthly data they're entering with the correct
   calendar month (defaults to current; one-click toggle to last month;
   "Earlier" opens a native month picker).

   Usage in any page:
     <script src="asof-month.js"></script>      (or "../asof-month.js" inside modules/)
     <div data-asof-month></div>                ← placeholder; auto-mounted

     // In your save handler:
     var monthKey = window.getAsOfMonth();      // 'YYYY-MM'
     var snaps = JSON.parse(localStorage.getItem('fw_monthly_snapshots')||'{}');
     if (!snaps[monthKey]) snaps[monthKey] = {};
     snaps[monthKey].healthScore = ...;
     snaps[monthKey].rev = ...;
     localStorage.setItem('fw_monthly_snapshots', JSON.stringify(snaps));

   Helpers exposed on window:
     getAsOfMonth()             — 'YYYY-MM' currently selected
     monthLabel('2026-06')      — 'June 2026'
     monthOffsetFromNow(-1)     — 'YYYY-MM' for last month
══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  // ── Inject CSS once ───────────────────────────────────────────────
  if (!document.getElementById('bizscoAsofCss')) {
    var css = document.createElement('style');
    css.id = 'bizscoAsofCss';
    css.textContent =
      '.bz-asof-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:10px 14px;margin:14px 0;font-family:inherit}' +
      '.bz-asof-icon{font-size:1.05rem;line-height:1}' +
      '.bz-asof-lbl{font-size:.82rem;font-weight:700;color:#475569}' +
      '.bz-asof-toggle{display:inline-flex;gap:4px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:3px}' +
      '.bz-asof-btn{background:transparent;border:none;padding:6px 12px;font-size:.78rem;font-weight:700;color:#64748b;cursor:pointer;border-radius:5px;font-family:inherit}' +
      '.bz-asof-btn:hover{background:#f1f5f9;color:#1e293b}' +
      '.bz-asof-btn.active{background:#2563eb;color:#fff}' +
      '.bz-asof-custom-input{padding:5px 10px;font-size:.82rem;border:1px solid #e2e8f0;border-radius:6px;font-family:inherit}';
    document.head.appendChild(css);
  }

  // ── Date helpers ──────────────────────────────────────────────────
  function monthOffsetFromNow(offset) {
    var d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() + offset);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
  }
  function monthLabel(ym) {
    if (!ym) return '—';
    var p = ym.split('-');
    var d = new Date(parseInt(p[0]), parseInt(p[1]) - 1, 1);
    return d.toLocaleString('default', { month: 'long', year: 'numeric' });
  }

  // ── State ─────────────────────────────────────────────────────────
  var _asOfMonth = monthOffsetFromNow(0);  // default: current month

  function getAsOfMonth() { return _asOfMonth; }

  // ── Mount one toggle into a container ─────────────────────────────
  function mountInto(container) {
    if (!container || container.dataset.bzAsofMounted === '1') return;
    container.dataset.bzAsofMounted = '1';

    var curLbl  = monthLabel(monthOffsetFromNow(0));
    var lastLbl = monthLabel(monthOffsetFromNow(-1));

    container.innerHTML =
      '<div class="bz-asof-row">' +
        '<span class="bz-asof-icon">📅</span>' +
        '<span class="bz-asof-lbl">These numbers are for:</span>' +
        '<div class="bz-asof-toggle" role="tablist">' +
          '<button type="button" class="bz-asof-btn active" data-offset="0">' + curLbl + ' (current)</button>' +
          '<button type="button" class="bz-asof-btn" data-offset="-1">' + lastLbl + ' (last month)</button>' +
          '<button type="button" class="bz-asof-btn" data-offset="custom">Earlier ▾</button>' +
        '</div>' +
        '<input type="month" class="bz-asof-custom-input" style="display:none" />' +
      '</div>';

    var customInp = container.querySelector('.bz-asof-custom-input');
    container.querySelectorAll('.bz-asof-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var offset = btn.getAttribute('data-offset');
        // Deactivate siblings
        container.querySelectorAll('.bz-asof-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');

        if (offset === 'custom') {
          if (!customInp.value) customInp.value = monthOffsetFromNow(-2);
          customInp.style.display = 'inline-block';
          _asOfMonth = customInp.value;
          setTimeout(function () {
            customInp.focus();
            if (customInp.showPicker) try { customInp.showPicker(); } catch (e) {}
          }, 30);
        } else {
          _asOfMonth = monthOffsetFromNow(parseInt(offset, 10));
          customInp.style.display = 'none';
        }
        fireMonthChange();
      });
    });

    customInp.addEventListener('change', function () {
      if (customInp.value) {
        _asOfMonth = customInp.value;
        fireMonthChange();
      }
    });
  }

  // Notify any page-level listeners that the user picked a different month.
  // Pages should respond by loading that month's saved numbers into the
  // input form (or clearing the form if no snapshot exists yet).
  function fireMonthChange() {
    window.dispatchEvent(new CustomEvent('bizsco:monthchange', {
      detail: { month: _asOfMonth }
    }));
  }

  // ── Auto-mount all <div data-asof-month> on page load ─────────────
  function autoMount() {
    document.querySelectorAll('[data-asof-month]').forEach(mountInto);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoMount);
  } else {
    autoMount();
  }

  // ── Expose on window ──────────────────────────────────────────────
  window.getAsOfMonth        = getAsOfMonth;
  window.monthLabel          = monthLabel;
  window.monthOffsetFromNow  = monthOffsetFromNow;
  window.bizscoAsOfMount     = function (selectorOrEl) {
    var el = typeof selectorOrEl === 'string' ? document.querySelector(selectorOrEl) : selectorOrEl;
    mountInto(el);
  };
})();
