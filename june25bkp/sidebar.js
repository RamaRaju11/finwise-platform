/* BizSco Shared Sidebar — include in any page, handles path detection automatically */
(function(){
  var page = location.pathname.split('/').pop() || 'index.html';

  /* detect subdirectory context */
  var inModules = /[\/\\]modules[\/\\]/.test(location.pathname);
  var B = inModules ? '../' : '';          /* base for top-level pages  */
  var M = inModules ? '' : 'modules/';    /* prefix for module pages   */

  /* ── CSS (injected immediately so no flash) ── */
  var style = document.createElement('style');
  style.textContent = [
    'body.fw-sb-page{margin-left:220px!important;padding-top:52px!important}',
    'body.fw-sb-page .hdr{display:none!important}',
    /* hide nav.js secondary bar — sidebar replaces it */
    'body.fw-sb-page .fnav-bar{display:none!important}',

    /* module pages: cancel the old margin-left:220px on #mainWrap (now handled by body margin) */
    'body.fw-sb-page #mainWrap{margin-left:0!important}',

    /* standalone page content area — always fill viewport, always light theme */
    'body.fw-sb-page .main{width:100%;min-height:calc(100vh - 52px);box-sizing:border-box;background:#f8fafc!important;color:#1e293b!important}',
    'html.dark body.fw-sb-page .main *{color:#1e293b!important}',
    'html.dark body.fw-sb-page .main .btn-primary{color:#fff!important}',

    /* convert dark standalone hero sections to a clean light page header */
    'body.fw-sb-page .hero{background:#fff!important;color:#1e293b!important;padding:18px 24px 14px!important;text-align:left!important;border-bottom:1px solid #e2e8f0!important}',
    'body.fw-sb-page .hero h1{font-size:1.1rem!important;color:#0f172a!important;font-weight:900!important;background:none!important;-webkit-text-fill-color:unset!important}',
    'body.fw-sb-page .hero p{color:#64748b!important;font-size:.82rem!important}',
    'body.fw-sb-page .hero-eyebrow{color:#2563eb!important}',
    'body.fw-sb-page .hero span.g{color:#4f46e5!important;background:none!important;-webkit-background-clip:unset!important;-webkit-text-fill-color:unset!important}',

    /* sidebar — include emoji-capable fonts so icons render on Windows */
    '.fw-sidebar,.fw-sidebar *,.fw-topbar,.fw-topbar *{font-family:"Inter","Segoe UI","Segoe UI Emoji","Segoe UI Symbol","Apple Color Emoji","Noto Color Emoji",system-ui,sans-serif!important}',
    '.fw-sidebar{width:220px;background:#0f172a;height:100vh;position:fixed!important;top:0;left:0;display:flex;flex-direction:column;overflow-y:auto;z-index:1000;transition:transform .25s ease;scrollbar-width:none}',
    '.fw-sidebar::-webkit-scrollbar{display:none}',

    /* topbar */
    '.fw-topbar{height:52px;background:#0f172a;border-bottom:1px solid #1e293b;position:fixed;top:0;left:220px;right:0;z-index:100;display:flex;align-items:center;padding:0 24px;gap:12px}',
    '.fw-tb-hamburger{display:none;background:none;border:none;font-size:1.1rem;color:#94a3b8;cursor:pointer;padding:4px 8px;border-radius:6px;line-height:1}',
    '.fw-tb-hamburger:hover{background:rgba(255,255,255,.08);color:#e2e8f0}',
    '.fw-tb-title{font-size:.88rem;font-weight:800;color:#e2e8f0}',
    '.fw-tb-spacer{flex:1}',
    '.fw-tb-home{font-size:.78rem;color:#475569;text-decoration:none;font-weight:600;transition:color .15s;white-space:nowrap}',
    '.fw-tb-home:hover{color:#94a3b8}',

    /* overlay */
    '.fw-sb-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:999}',
    '.fw-sb-overlay.open{display:block}',

    /* logo */
    '.fw-sb-logo{padding:18px 16px 10px;display:flex;align-items:center;text-decoration:none;flex-shrink:0}',
    '.fw-sb-logo-text{font-size:1.05rem;font-weight:900;color:#fff;letter-spacing:-.02em}',
    '.fw-sb-logo-text span{color:#818cf8}',
    '.fw-sb-biz{padding:0 16px 12px;font-size:.7rem;color:#64748b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.fw-sb-plan-chip{margin:0 16px 14px;display:inline-block;font-size:.6rem;font-weight:800;padding:3px 10px;border-radius:999px;text-transform:uppercase;letter-spacing:.06em;background:#334155;color:#94a3b8}',
    '.fw-sb-plan-chip.badge-starter{background:#0891b2;color:#fff}',
    '.fw-sb-plan-chip.badge-pro{background:#7c3aed;color:#fff}',
    '.fw-sb-plan-chip.badge-advisor{background:#be185d;color:#fff}',

    /* nav */
    '.fw-sb-nav{flex:1;padding:0 0 8px}',
    '.fw-sb-section{padding:14px 16px 4px;font-size:.58rem;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:#475569}',
    '.fw-sb-link{display:flex;align-items:center;gap:9px;padding:8px 16px;font-size:.8rem;font-weight:600;color:#94a3b8;text-decoration:none;transition:background .12s,color .12s;white-space:nowrap}',
    '.fw-sb-link:hover{background:rgba(255,255,255,.06);color:#e2e8f0}',
    '.fw-sb-link.active{background:rgba(99,102,241,.18);color:#a5b4fc;border-right:3px solid #6366f1}',
    '.fw-sb-ic{font-size:.9rem;width:18px;text-align:center;flex-shrink:0}',
    '.fw-sb-divider{margin:8px 16px;border:none;border-top:1px solid #1e293b}',

    /* footer */
    '.fw-sb-footer{padding:12px 16px 20px;flex-shrink:0;border-top:1px solid #1e293b}',
    '.fw-sb-upgrade{display:block;text-align:center;background:#4f46e5;color:#fff;padding:9px 12px;border-radius:8px;font-size:.78rem;font-weight:800;text-decoration:none;transition:background .15s}',
    '.fw-sb-upgrade:hover{background:#4338ca}',
    '.fw-sb-upgrade.hidden{display:none}',

    /* mobile */
    '@media(max-width:900px){',
    '  body.fw-sb-page{margin-left:0!important}',
    '  .fw-sidebar{transform:translateX(-220px)}',
    '  .fw-sidebar.open{transform:translateX(0);box-shadow:4px 0 30px rgba(0,0,0,.35)}',
    '  .fw-topbar{left:0}',
    '  .fw-tb-hamburger{display:flex!important;align-items:center;justify-content:center}',
    '}',

    /* dark mode toggle button */
    '.fw-dark-btn{display:flex;align-items:center;gap:8px;width:100%;padding:8px 12px;border-radius:7px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.06);color:#94a3b8;font-size:.76rem;font-weight:600;cursor:pointer;margin-bottom:8px;transition:all .15s;text-align:left}',
    '.fw-dark-btn:hover{background:rgba(255,255,255,.12);color:#e2e8f0}',
    '.fw-dark-ic{font-size:.9rem}',

    /* ── dark mode overrides ── */
    'html.dark body,html.dark{background:#0f172a!important;color:#e2e8f0!important}',
    'html.dark .card{background:#1e293b!important;border-color:#334155!important;box-shadow:0 1px 4px rgba(0,0,0,.4)!important}',
    'html.dark .card h2{color:#cbd5e1!important}',
    'html.dark h1{color:#f1f5f9!important}',
    'html.dark .subtitle{color:#94a3b8!important}',
    'html.dark label{color:#94a3b8!important}',
    'html.dark input[type=text],html.dark input[type=number],html.dark select,html.dark textarea{background:#0f172a!important;color:#e2e8f0!important;border-color:#334155!important}',
    'html.dark .back-link{color:#818cf8!important}',
    'html.dark .sum-box{background:#1e293b!important;border-color:#334155!important}',
    'html.dark .fw-topbar{background:#020617!important;border-bottom-color:#1e293b!important}',
    'html.dark .fw-tb-title{color:#e2e8f0!important}',
    'html.dark .fw-tb-home{color:#475569!important}',
    'html.dark .grade-banner{border-color:#334155!important}',
    'html.dark .grade-A{background:linear-gradient(135deg,#052e16,#14532d)!important}',
    'html.dark .grade-B{background:linear-gradient(135deg,#172554,#1e3a8a)!important}',
    'html.dark .grade-C{background:linear-gradient(135deg,#1c1400,#1c1a0c)!important}',
    'html.dark .grade-D{background:linear-gradient(135deg,#1a0d00,#431407)!important}',
    'html.dark .grade-F{background:linear-gradient(135deg,#1a0000,#450a0a)!important}',
    'html.dark table th{background:#1e293b!important;color:#94a3b8!important;border-bottom-color:#334155!important}',
    'html.dark table td{border-bottom-color:#1e293b!important;color:#cbd5e1!important}',
    'html.dark .metric-card{background:#0f172a!important}',
    'html.dark .mc-green{background:#052e16!important;border-color:#166534!important}',
    'html.dark .mc-yellow{background:#1c1a0c!important;border-color:#92400e!important}',
    'html.dark .mc-red{background:#1a0a0a!important;border-color:#991b1b!important}',
    'html.dark .loan-row{background:#0f172a!important;border-color:#334155!important}',
    'html.dark .plan-month{background:#0f172a!important;border-color:#334155!important}',
    'html.dark .roadmap-path{background:#0f172a!important;border-color:#334155!important}',
    'html.dark .sum-box{background:#1e293b!important}',
    'html.dark .profile-bar{background:#020617!important}',
    'html.dark .earn-box{background:#020617!important}',
    'html.dark .grant-card{background:#1e293b!important;border-color:#334155!important}',
    'html.dark .gc-body{background:#1e293b!important}',
    'html.dark .gc-footer{background:#0f172a!important;border-top-color:#334155!important}',
    'html.dark .no-results{background:#1e293b!important}',
    'html.dark .tracker-bar{background:#020617!important}'
  ].join('');
  (document.head || document.documentElement).appendChild(style);

  /* ── DOM injection ── */
  function init(){
    var titles = {
      'dashboard.html':'Dashboard',
      'checkup.html':'Financial Checkup',
      'history.html':'Score History',
      'whatif.html':'What-If Scenarios',
      'onboarding.html':'Setup Profile',
      'try.html':'All 30 Tools',
      'pricing.html':'Plans & Pricing',
      'auth.html':'Sign In',
      /* module pages */
      'loanRepaymentOptimizer.test.html':'Loan Repayment Optimizer',
      'profitMarginAnalyzer.test.html':'Profit Margin Analyzer',
      'cashFlowCalendar.test.html':'Cash Flow Calendar',
      'businessSavingsPlanner.test.html':'Savings Planner',
      'vendorBillTracker.test.html':'Vendor & Bill Tracker',
      'monthlySnapshot.test.html':'Monthly Snapshot',
      'debtCommandCenter.test.html':'Debt Command Center',
      'loanDecisionScoreEngine.test.html':'Loan Safety Score',
      'loanEligibility.test.html':'Loan Eligibility',
      'lenderMarketplace.html':'Lender Marketplace',
      'grantFinder.test.html':'Grant Finder',
      'emiCalculator.test.html':'EMI Calculator',
      'cashRunway.test.html':'Cash Runway',
      'breakEven.test.html':'Break-Even',
      'ownersPay.test.html':"Owner's Pay",
      'taxEstimator.test.html':'Tax Estimator',
      'taxCommandCenter.test.html':'Tax Command Center',
      'salesTaxTracker.test.html':'Sales Tax Tracker',
      'keyDeductions.test.html':'Key Deductions',
      'contractorPayroll.test.html':'Contractor & Payroll Tax',
      'goalTracker.test.html':'Goal Tracker',
      'businessHealthScore.test.html':'Business Health Score',
      'forecastPro.test.html':'Revenue Forecast',
      'aiCfoChat.test.html':'AI CFO Advisor',
      'benchmarkPro.test.html':'Industry Benchmarks',
      'advisorDashboard.test.html':'Advisor Dashboard',
      'clientPortal.test.html':'Client Portal',
      'brandedReport.test.html':'Branded Reports',
      'invoiceTracker.test.html':'Invoice Tracker',
      'payrollEstimator.test.html':'Payroll Estimator',
      'bankStatementUpload.test.html':'Bank Statement Upload',
      'debtConsolidation.test.html':'Debt Consolidation',
      'financialStatements.test.html':'Financial Statements',
      'whiteLabelSettings.test.html':'White-Label Settings'
    };
    var pageTitle = titles[page] || 'BizSco';

    /* helper to build a sidebar link */
    function lnk(href, icon, label, dataP){
      var dp = dataP ? ' data-p="'+dataP+'"' : '';
      return '<a href="'+href+'" class="fw-sb-link"'+dp+'><span class="fw-sb-ic">'+icon+'</span>'+label+'</a>';
    }

    var aside = document.createElement('aside');
    aside.className = 'fw-sidebar';
    aside.id = 'fwSidebar';
    aside.innerHTML =
      '<a href="'+B+'dashboard.html" class="fw-sb-logo"><div class="fw-sb-logo-text">&#128200; Biz<span>Sco</span></div></a>'+
      '<div style="font-size:.58rem;color:#475569;padding:0 16px 10px;margin-top:-6px;letter-spacing:.07em;font-weight:700;text-transform:uppercase">Analyze · Fund · Grow</div>'+
      '<div class="fw-sb-biz" id="fwSbBiz">Your dashboard</div>'+
      '<span class="fw-sb-plan-chip" id="fwSbPlan">Free Plan</span>'+
      '<nav class="fw-sb-nav">'+
        '<div class="fw-sb-section">Overview</div>'+
        lnk(B+'dashboard.html',  '&#127968;', 'Dashboard',          'dashboard.html')+
        lnk(B+'checkup.html',    '&#129514;', 'Financial Checkup',  'checkup.html')+
        lnk(B+'history.html',    '&#128202;', 'Score History',      'history.html')+
        lnk(B+'whatif.html',     '&#128302;', 'What-If Scenarios',  'whatif.html')+
        '<hr class="fw-sb-divider"/>'+
        '<div class="fw-sb-section">Funding</div>'+
        lnk(M+'debtCommandCenter.test.html',        '&#128184;', 'Debt Command Center','debtCommandCenter.test.html')+
        lnk(M+'loanDecisionScoreEngine.test.html', '&#127974;', 'Loan Safety Score',  'loanDecisionScoreEngine.test.html')+
        lnk(M+'loanEligibility.test.html',         '&#9989;',   'Loan Eligibility',   'loanEligibility.test.html')+
        lnk(M+'lenderMarketplace.html',            '&#127963;', 'Lender Marketplace', 'lenderMarketplace.html')+
        lnk(M+'grantFinder.test.html',             '&#127919;', 'Grant Finder',       'grantFinder.test.html')+
        '<hr class="fw-sb-divider"/>'+
        '<div class="fw-sb-section">Finance</div>'+
        lnk(M+'emiCalculator.test.html',   '&#129518;', 'EMI Calculator', 'emiCalculator.test.html')+
        lnk(M+'cashRunway.test.html',      '&#9201;',   'Cash Runway',    'cashRunway.test.html')+
        lnk(M+'breakEven.test.html',       '&#9878;',   'Break-Even',     'breakEven.test.html')+
        lnk(M+'ownersPay.test.html',       '&#128184;', "Owner's Pay",    'ownersPay.test.html')+
        lnk(M+'taxCommandCenter.test.html', '&#129534;', 'Tax Hub',         'taxCommandCenter.test.html')+
        lnk(M+'taxEstimator.test.html',    '&#129535;', 'Tax Estimator',   'taxEstimator.test.html')+
        lnk(M+'salesTaxTracker.test.html', '&#127991;', 'Sales Tax',      'salesTaxTracker.test.html')+
        lnk(M+'keyDeductions.test.html',   '&#128188;', 'Key Deductions',   'keyDeductions.test.html')+
        lnk(M+'contractorPayroll.test.html','&#128203;', 'Contractor/Payroll','contractorPayroll.test.html')+
        lnk(M+'goalTracker.test.html',     '&#127919;', 'Goal Tracker',   'goalTracker.test.html')+
        '<hr class="fw-sb-divider"/>'+
        '<div class="fw-sb-section">New Tools</div>'+
        lnk(M+'loanRepaymentOptimizer.test.html', '&#10054;',  'Repayment Optimizer',  'loanRepaymentOptimizer.test.html')+
        lnk(M+'profitMarginAnalyzer.test.html',   '&#128185;', 'Profit Margins',        'profitMarginAnalyzer.test.html')+
        lnk(M+'cashFlowCalendar.test.html',       '&#128197;', 'Cash Flow Calendar',    'cashFlowCalendar.test.html')+
        lnk(M+'businessSavingsPlanner.test.html', '&#127919;', 'Savings Planner',       'businessSavingsPlanner.test.html')+
        lnk(M+'vendorBillTracker.test.html',      '&#128203;', 'Bill Tracker',          'vendorBillTracker.test.html')+
        '<hr class="fw-sb-divider"/>'+
        '<div class="fw-sb-section">Insights</div>'+
        lnk(M+'businessHealthScore.test.html', '&#127942;', 'Health Score',         'businessHealthScore.test.html')+
        lnk(M+'forecastPro.test.html',         '&#128200;', 'Revenue Forecast',     'forecastPro.test.html')+
        lnk(M+'aiCfoChat.test.html',           '&#129302;', 'AI CFO Advisor',       'aiCfoChat.test.html')+
        lnk(M+'benchmarkPro.test.html',        '&#128202;', 'Industry Benchmarks',  'benchmarkPro.test.html')+
        lnk(M+'monthlySnapshot.test.html',     '&#128247;', 'Monthly Snapshot',     'monthlySnapshot.test.html')+
        '<hr class="fw-sb-divider"/>'+
        lnk(B+'try.html',         '&#128295;', 'All 30 Tools',     'try.html')+
        lnk(B+'pricing.html',     '&#128179;', 'Plans &amp; Pricing', 'pricing.html')+
        lnk(B+'onboarding.html',  '&#9881;',   'Edit Profile',     'onboarding.html')+
      '</nav>'+
      '<div class="fw-sb-footer">'+
        '<button class="fw-dark-btn" id="fwDarkBtn" onclick="fwToggleDark()"><span class="fw-dark-ic">&#9790;</span><span id="fwDarkLabel">Dark Mode</span></button>'+
        '<a href="'+B+'pricing.html" class="fw-sb-upgrade" id="fwSbUpgrade">&#9889; Upgrade Plan</a>'+
      '</div>';

    var overlay = document.createElement('div');
    overlay.className = 'fw-sb-overlay';
    overlay.id = 'fwSbOverlay';
    overlay.onclick = function(){ fwCloseSidebar(); };

    var topbar = document.createElement('header');
    topbar.className = 'fw-topbar';
    topbar.innerHTML =
      '<button class="fw-tb-hamburger" onclick="fwToggleSidebar()">&#9776;</button>'+
      '<span class="fw-tb-title">'+pageTitle+'</span>'+
      '<div class="fw-tb-spacer"></div>'+
      '<a href="'+B+'dashboard.html" class="fw-tb-home">&#8592; Dashboard</a>';

    document.body.insertBefore(aside,   document.body.firstChild);
    document.body.insertBefore(overlay, document.body.children[1]);
    document.body.insertBefore(topbar,  document.body.children[2]);
    document.body.classList.add('fw-sb-page');

    /* mark active link — match by filename */
    aside.querySelectorAll('.fw-sb-link[data-p]').forEach(function(a){
      if(a.dataset.p === page) a.classList.add('active');
    });

    /* plan chip + profile name — deferred to fwAuth to prevent stale data from a previous user */
    try{
      var chip = document.getElementById('fwSbPlan');
      var upg  = document.getElementById('fwSbUpgrade');
      var biz  = document.getElementById('fwSbBiz');

      function _setSbPlan(plan){
        var map = {
          free    : ['Free Plan',    ''],
          starter : ['Starter Plan', ' badge-starter'],
          pro     : ['Pro Plan',     ' badge-pro'],
          advisor : ['Advisor Plan', ' badge-advisor']
        };
        var m = map[plan] || map.free;
        chip.textContent = m[0];
        chip.className   = 'fw-sb-plan-chip' + m[1];
        if(upg){
          if(plan === 'pro' || plan === 'advisor') upg.classList.add('hidden');
          else upg.classList.remove('hidden');
        }
      }

      if(window.fwAuth){
        window.fwAuth.init(function(){
          _setSbPlan(window.fwAuth.plan || 'free');
          /* Read biz name only after auth has cleared any stale profile */
          try{
            var lp = JSON.parse(localStorage.getItem('fw_profile')||'{}');
            if(biz) biz.textContent = lp.bizName || 'Your dashboard';
          }catch(e){}
        });
      }
    }catch(e){}

    /* close sidebar on mobile when a link is clicked */
    aside.querySelectorAll('.fw-sb-link').forEach(function(a){
      a.addEventListener('click', function(){
        if(window.innerWidth <= 900) fwCloseSidebar();
      });
    });

    /* ── Scroll-zone: fade + arrow at bottom (and top) that auto-scrolls nav ── */
    var scrollStyle = document.createElement('style');
    scrollStyle.textContent =
      /* Default: pointer-events NONE so the zone doesn't block clicks on
         sidebar links underneath when it's invisible (no scroll needed). */
      '.fw-scroll-zone{position:absolute;left:0;right:0;height:28px;z-index:10;pointer-events:none;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .2s;cursor:pointer}'+
      '.fw-scroll-zone.bottom{bottom:52px;background:linear-gradient(to top,#0f172a 30%,transparent)}'+
      '.fw-scroll-zone.top{top:0;background:linear-gradient(to bottom,#0f172a 30%,transparent)}'+
      '.fw-scroll-zone .fw-sz-arrow{font-size:.75rem;color:#64748b;line-height:1;user-select:none}'+
      /* Only enable pointer-events when the zone is actually shown
         (there is more content to scroll to). Prevents the zone from
         blocking clicks on bottom sidebar items like Cash Runway. */
      '.fw-scroll-zone.visible{opacity:1;pointer-events:auto}';
    document.head.appendChild(scrollStyle);

    aside.style.position = 'relative'; /* needed for absolute children */

    var szBottom = document.createElement('div');
    szBottom.className = 'fw-scroll-zone bottom';
    szBottom.innerHTML = '<span class="fw-sz-arrow">▼</span>';
    aside.appendChild(szBottom);

    var szTop = document.createElement('div');
    szTop.className = 'fw-scroll-zone top';
    szTop.innerHTML = '<span class="fw-sz-arrow">▲</span>';
    aside.appendChild(szTop);

    var nav = aside.querySelector('.fw-sb-nav');
    var scrollTimer = null;

    function startScroll(dir){
      stopScroll();
      scrollTimer = setInterval(function(){ nav.scrollTop += dir * 4; updateZones(); }, 16);
    }
    function stopScroll(){ clearInterval(scrollTimer); scrollTimer = null; }

    function updateZones(){
      var atTop    = nav.scrollTop <= 2;
      var atBottom = nav.scrollTop + nav.clientHeight >= nav.scrollHeight - 2;
      szTop.classList.toggle('visible',    !atTop);
      szBottom.classList.toggle('visible', !atBottom);
    }

    szBottom.addEventListener('mouseenter', function(){ startScroll(1); });
    szBottom.addEventListener('mouseleave', stopScroll);
    szTop.addEventListener('mouseenter',    function(){ startScroll(-1); });
    szTop.addEventListener('mouseleave',    stopScroll);

    nav.addEventListener('scroll', updateZones);
    /* slight delay so nav has rendered height */
    setTimeout(updateZones, 200);
  }

  /* ── Dark mode ── */
  function applyDark(on){
    if(on){ document.documentElement.classList.add('dark'); }
    else  { document.documentElement.classList.remove('dark'); }
    var lbl = document.getElementById('fwDarkLabel');
    if(lbl) lbl.textContent = on ? 'Light Mode' : 'Dark Mode';
    var ic = document.querySelector('#fwDarkBtn .fw-dark-ic');
    if(ic) ic.textContent = on ? '☀' : '☾';
  }
  /* Apply saved preference immediately */
  applyDark(localStorage.getItem('fw_dark') === '1');

  window.fwToggleDark = function(){
    var isDark = document.documentElement.classList.contains('dark');
    localStorage.setItem('fw_dark', isDark ? '0' : '1');
    applyDark(!isDark);
  };

  window.fwToggleSidebar = function(){
    document.getElementById('fwSidebar').classList.toggle('open');
    document.getElementById('fwSbOverlay').classList.toggle('open');
  };
  window.fwCloseSidebar = function(){
    document.getElementById('fwSidebar').classList.remove('open');
    document.getElementById('fwSbOverlay').classList.remove('open');
  };

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
