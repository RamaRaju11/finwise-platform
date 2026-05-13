/* BizSco First-Time Onboarding Tour
   Include on dashboard.html or try.html — shows once per browser session
   localStorage key: fw_tour_done = '1'
*/
(function(){
  if(localStorage.getItem('fw_tour_done') === '1') return;

  var STEPS = [
    {
      title: 'Welcome to BizSco!',
      body:  'Analyze your finances, fund your growth, and scale your business — 30 tools built for small business owners. Let\'s take a 30-second tour.',
      icon:  '👋',
      anchor: null  /* centered overlay */
    },
    {
      title: 'Start with a Free Checkup',
      body:  'Run a Financial Checkup to get your Loan Safety Score, Cash Runway, and Health Grade — in under 2 minutes. No sign-up needed.',
      icon:  '🩺',
      anchor: null
    },
    {
      title: '30+ Tools at Your Fingertips',
      body:  'Use the sidebar to access every tool: Loan Optimizer, Cash Flow Calendar, Tax Estimator, Grant Finder, and more. Dark mode available at the bottom of the sidebar.',
      icon:  '🛠️',
      anchor: null
    }
  ];

  var cur = 0;

  /* ── Styles ── */
  var s = document.createElement('style');
  s.textContent =
    '.fw-tour-overlay{position:fixed;inset:0;background:rgba(0,0,0,.62);z-index:9000;display:flex;align-items:center;justify-content:center;padding:20px}'+
    '.fw-tour-box{background:#fff;border-radius:16px;padding:28px 28px 22px;max-width:420px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,.35);position:relative;animation:fwTourIn .22s ease}'+
    '@keyframes fwTourIn{from{opacity:0;transform:scale(.94) translateY(10px)}to{opacity:1;transform:none}}'+
    '.fw-tour-icon{font-size:2.4rem;margin-bottom:10px;display:block;text-align:center}'+
    '.fw-tour-title{font-size:1.1rem;font-weight:900;color:#0f172a;text-align:center;margin-bottom:8px}'+
    '.fw-tour-body{font-size:.88rem;color:#475569;line-height:1.65;text-align:center;margin-bottom:20px}'+
    '.fw-tour-dots{display:flex;justify-content:center;gap:6px;margin-bottom:18px}'+
    '.fw-tour-dot{width:8px;height:8px;border-radius:50%;background:#e2e8f0;transition:background .2s}'+
    '.fw-tour-dot.active{background:#2563eb}'+
    '.fw-tour-actions{display:flex;gap:10px;justify-content:center}'+
    '.fw-tour-btn{padding:10px 22px;border-radius:8px;font-size:.88rem;font-weight:700;cursor:pointer;border:none;transition:background .15s}'+
    '.fw-tour-next{background:#2563eb;color:#fff}'+
    '.fw-tour-next:hover{background:#1d4ed8}'+
    '.fw-tour-skip{background:#f1f5f9;color:#64748b}'+
    '.fw-tour-skip:hover{background:#e2e8f0}'+
    '.fw-tour-close{position:absolute;top:12px;right:14px;background:none;border:none;font-size:1.1rem;color:#94a3b8;cursor:pointer;line-height:1;padding:4px}'+
    '.fw-tour-close:hover{color:#475569}';
  document.head.appendChild(s);

  /* ── DOM ── */
  var overlay = document.createElement('div');
  overlay.className = 'fw-tour-overlay';
  overlay.id = 'fwTourOverlay';

  function render(){
    var step = STEPS[cur];
    var dots = STEPS.map(function(_,i){
      return '<div class="fw-tour-dot'+(i===cur?' active':'')+'"></div>';
    }).join('');
    var isLast = cur === STEPS.length - 1;
    overlay.innerHTML =
      '<div class="fw-tour-box">'+
        '<button class="fw-tour-close" onclick="fwTourDismiss()" title="Close">&#215;</button>'+
        '<span class="fw-tour-icon">'+step.icon+'</span>'+
        '<div class="fw-tour-title">'+step.title+'</div>'+
        '<div class="fw-tour-body">'+step.body+'</div>'+
        '<div class="fw-tour-dots">'+dots+'</div>'+
        '<div class="fw-tour-actions">'+
          '<button class="fw-tour-btn fw-tour-skip" onclick="fwTourDismiss()">Skip Tour</button>'+
          '<button class="fw-tour-btn fw-tour-next" onclick="fwTourNext()">'+(isLast ? 'Get Started ✓' : 'Next →')+'</button>'+
        '</div>'+
      '</div>';
  }

  window.fwTourNext = function(){
    if(cur < STEPS.length - 1){ cur++; render(); }
    else { fwTourDismiss(); }
  };

  window.fwTourDismiss = function(){
    localStorage.setItem('fw_tour_done', '1');
    var el = document.getElementById('fwTourOverlay');
    if(el){ el.style.opacity='0'; el.style.transition='opacity .25s'; setTimeout(function(){ el.parentNode && el.parentNode.removeChild(el); }, 260); }
  };

  render();

  /* Show after a short delay so the page has time to render */
  setTimeout(function(){
    document.body.appendChild(overlay);
  }, 600);
})();
