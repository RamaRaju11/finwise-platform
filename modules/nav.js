/* BizScale — Tool Launcher + Business Profile
   Add <script src="nav.js"></script> right after <body> in any module page. */
(function(){

/* ── 1. Plan detection ── */
var plan = 'free';
if(localStorage.getItem('fw_advisor')) plan = 'advisor';
else if(localStorage.getItem('fw_pro')) plan = 'pro';
else if(localStorage.getItem('fw_starter')) plan = 'starter';
var TIER_ORDER = ['free','starter','pro','advisor'];
var planIdx = TIER_ORDER.indexOf(plan);

var PLAN_CFG = {
  free:    {label:'Free Plan',    navBg:'#334155', badge:'#475569'},
  starter: {label:'Starter Plan', navBg:'#1e3a5f', badge:'#0891b2'},
  pro:     {label:'Pro Plan',     navBg:'#2e1065', badge:'#7c3aed'},
  advisor: {label:'Advisor Plan', navBg:'#4a0d2e', badge:'#be185d'}
};
var pc = PLAN_CFG[plan];
var currPage = window.location.pathname.split('/').pop();

/* ── 2. Tool registry ── */
var SECTIONS = [
  { tier:'free', label:'Free Tools', color:'#0891b2', bg:'#e0f2fe', tools:[
    {icon:'🏦', label:'Loan Safety Score',   desc:'Will this loan hurt your cash flow?',          href:'loanDecisionScoreEngine.test.html'},
    {icon:'🧮', label:'EMI Calculator',       desc:'Monthly payment + total cost of any loan',     href:'emiCalculator.test.html'},
    {icon:'🏛',  label:'Lender Marketplace',  desc:'Trusted lenders with real rates & terms',      href:'lenderMarketplace.html'},
    {icon:'🩺', label:'Financial Checkup',    desc:'4-point health check with graded score',       href:'../checkup.html'},
    {icon:'📊', label:'Score History',        desc:'Track your health score over time',             href:'../history.html'},
    {icon:'🔮', label:'What-If Scenarios',   desc:'Model revenue & expense what-if changes',      href:'../whatif.html'},
    {icon:'⏱',  label:'Cash Runway',          desc:'Months of runway across 3 revenue scenarios',  href:'cashRunway.test.html'},
    {icon:'⛽', label:'Cash Flow Tracker',    desc:'Track monthly cash in/out and runway',          href:'cashFlowTracker.test.html'},
    {icon:'⚖',  label:'Break-Even Analyzer', desc:'Extra revenue needed to cover a new loan',     href:'breakEven.test.html'},
    {icon:'🎯', label:'Goal Tracker',          desc:'Set business targets, track monthly progress', href:'goalTracker.test.html'},
    {icon:'📸', label:'Monthly Snapshot',     desc:'One-page visual summary — download or share',  href:'monthlySnapshot.test.html'}
  ]},
  { tier:'starter', label:'Starter Tools', color:'#7c3aed', bg:'#f3e8ff', tools:[
    {icon:'📋', label:'Starter Dashboard',      desc:'Compare 3 loan scenarios side by side',        href:'starterPlan.test.html'},
    {icon:'✅', label:'Loan Eligibility',        desc:'Which lenders will likely approve you?',       href:'loanEligibility.test.html'},
    {icon:'🎯', label:'Grant Finder',            desc:'Grants + deadline calendar by urgency',        href:'grantFinder.test.html'},
    {icon:'🧾', label:'Tax Command Center',       desc:'All 4 tax modules in one dashboard — income, deductions, sales tax, contractor', href:'taxCommandCenter.test.html'},
    {icon:'🧾', label:'Tax Estimator',           desc:'Quarterly estimates + payment tracker',        href:'taxEstimator.test.html'},
    {icon:'🏷️', label:'Sales Tax Tracker',       desc:'Track collected tax + nexus for all 50 states',href:'salesTaxTracker.test.html'},
    {icon:'💼', label:'Key Deductions',           desc:'Home office, mileage log, Section 179',         href:'keyDeductions.test.html'},
    {icon:'📋', label:'Contractor & Payroll Tax', desc:'1099-NEC tracking + FUTA/SUTA estimates',       href:'contractorPayroll.test.html'},
    {icon:'📋', label:'Invoice Tracker',         desc:'Overdue invoices + follow-up email templates', href:'invoiceTracker.test.html'},
    {icon:'👥', label:'Payroll Estimator',       desc:'What can you afford to pay staff?',            href:'payrollEstimator.test.html'},
    {icon:'🏦', label:'Bank Statement Upload',   desc:'Upload CSV → auto-fill cash flow',             href:'bankStatementUpload.test.html'},
    {icon:'🗂️', label:'Vendor Bill Tracker',    desc:'Bills, autopay & contract expiry tracking',    href:'vendorBillTracker.test.html'},
    {icon:'📊', label:'Profit Margin Analyzer',  desc:'Margins, COGS & price-raise simulator',        href:'profitMarginAnalyzer.test.html'},
    {icon:'💰', label:'Savings Planner',         desc:'Goals with 25 / 50 / 75% milestones',          href:'businessSavingsPlanner.test.html'},
    {icon:'💰', label:'Debt Command Center',      desc:'All loans in one view — track balances, compare payoff strategies, eliminate debt faster', href:'debtCommandCenter.test.html'},
    {icon:'🏆', label:'Loan Repayment Optimizer',desc:'Snowball vs avalanche + payoff calendar',       href:'loanRepaymentOptimizer.test.html'},
    {icon:'💧', label:'Working Capital Calc',   desc:'30/60/90-day cash coverage + CCC gap',          href:'workingCapitalCalc.test.html'},
    {icon:'📊', label:'Budget vs. Actual',      desc:'Monthly variance with traffic-light alerts',    href:'budgetActualTracker.test.html'},
    {icon:'👥', label:'Payroll Impact Sim',     desc:'Model new hires — runway & break-even shift',   href:'payrollImpactSim.test.html'},
    {icon:'🔄', label:'Loan Refinance Analyzer',desc:'Monthly savings, break-even & net benefit',    href:'loanRefinanceAnalyzer.test.html'},
    {icon:'📅', label:'Cash Flow Calendar',     desc:'Visual monthly bill & income calendar',         href:'cashFlowCalendar.test.html'}
  ]},
  { tier:'pro', label:'Pro Tools', color:'#b45309', bg:'#fef3c7', tools:[
    {icon:'📈', label:'Revenue Forecast',      desc:'Predict your next 12 months of revenue',    href:'forecastPro.test.html'},
    {icon:'🤖', label:'AI CFO Advisor',        desc:'Ask financial questions, get plain answers', href:'aiCfoChat.test.html'},
    {icon:'📊', label:'Industry Benchmarks',   desc:'See how you compare to your industry',       href:'benchmarkPro.test.html'},
    {icon:'📄', label:'Financial Statements',  desc:'P&L, Balance Sheet, Cash Flow Statement',    href:'financialStatements.test.html'},
    {icon:'📤', label:'CA Export Pack',        desc:'Documents ready for your accountant',        href:'caExport.test.html'},
    {icon:'💸', label:"Owner's Pay",           desc:'How much can you safely pay yourself?',      href:'ownersPay.test.html'},
    {icon:'🔄', label:'Debt Consolidation',    desc:'Combine loans to lower monthly payments',    href:'debtConsolidation.test.html'},
    {icon:'🏆', label:'Business Health Score', desc:'Overall A–F grade for your finances',        href:'businessHealthScore.test.html'},
    {icon:'💪', label:'Stress Test Engine',   desc:'Test finances under worst-case scenarios',   href:'stressTestEngine.test.html'},
    {icon:'💳', label:'Multi-Loan Manager',   desc:'All your loans in one consolidated view',    href:'multiLoanManager.test.html'}
  ]},
  { tier:'advisor', label:'Advisor Tools', color:'#be185d', bg:'#fce7f3', tools:[
    {icon:'👥', label:'Advisor Dashboard',     desc:'Manage all your clients in one view',        href:'../advisorDashboard.html'},
    {icon:'📝', label:'Branded Client Report', desc:'White-label PDF reports for your clients',   href:'brandedReport.test.html'},
    {icon:'📧', label:'Client Risk Email',     desc:'One-click risk summary email to clients',    href:'clientRiskEmail.test.html'},
    {icon:'🔗', label:'Referral Tracker',      desc:'Track referrals and estimated commissions',  href:'referralTracker.test.html'},
    {icon:'🔗', label:'Client Portal',        desc:'Share secure reports with clients',           href:'clientPortal.test.html'},
    {icon:'🎨', label:'White-Label Settings', desc:'Your brand on every client report',           href:'whiteLabelSettings.test.html'}
  ]}
];

/* ── 3. Tools modal HTML ── */
var toolsHtml = '';
for(var i=0;i<SECTIONS.length;i++){
  var sec=SECTIONS[i], unlocked=(i<=planIdx);
  toolsHtml+='<div class="fnav-tier-hd" style="border-color:'+sec.color+';color:'+sec.color+'">'+sec.label+(unlocked?'':' <span class="fnav-lock-pill">🔒 Upgrade</span>')+'</div><div class="fnav-tool-grid">';
  for(var j=0;j<sec.tools.length;j++){
    var t=sec.tools[j], cur=(t.href===currPage);
    if(unlocked){
      toolsHtml+='<a href="'+t.href+'" class="fnav-card'+(cur?' fnav-card-active':'')+'" style="--cc:'+sec.color+';--cb:'+sec.bg+'">'+
        '<div class="fnav-card-icon">'+t.icon+'</div><div class="fnav-card-name">'+t.label+'</div>'+
        '<div class="fnav-card-desc">'+t.desc+'</div>'+(cur?'<div class="fnav-card-here">● You are here</div>':'')+
        '</a>';
    } else {
      toolsHtml+='<div class="fnav-card fnav-card-locked"><div class="fnav-card-icon">'+t.icon+'</div>'+
        '<div class="fnav-card-name">'+t.label+'</div><div class="fnav-card-desc">'+t.desc+'</div>'+
        '<div class="fnav-card-locklabel">🔒 '+sec.label.replace(' Tools','')+'</div></div>';
    }
  }
  toolsHtml+='</div>';
}

/* ── 4. Profile form data ── */
var STATES=['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'];
var stateOpts='<option value="">-- Select --</option>'+STATES.map(function(s){return '<option>'+s+'</option>';}).join('');

var INDUSTRIES=['Retail / E-commerce','Food & Restaurant','Health & Wellness','Professional Services','Construction & Trades','Technology / Software','Education & Training','Beauty & Personal Care','Transportation & Logistics','Manufacturing','Real Estate','Financial Services','Agriculture / Farming','Non-profit / NGO','Other'];
var indOpts='<option value="">-- Select --</option>'+INDUSTRIES.map(function(s){return '<option>'+s+'</option>';}).join('');

/* ── 5. Profile modal HTML ── */
var profileHtml=
'<div class="fp-sec">BUSINESS IDENTITY</div>'+
'<div class="fp-row2">'+
  '<div class="fp-field"><label>Business Name <span class="fp-req">*</span></label><input type="text" id="fp_biz" placeholder="e.g. Sarah\'s Boutique"/></div>'+
  '<div class="fp-field"><label>Owner Name <span class="fp-req">*</span></label><input type="text" id="fp_owner" placeholder="e.g. Sarah Mitchell"/></div>'+
'</div>'+
'<div class="fp-row2">'+
  '<div class="fp-field"><label>Business Email</label><input type="text" id="fp_email" placeholder="you@example.com"/></div>'+
  '<div class="fp-field"><label>State</label><select id="fp_state">'+stateOpts+'</select></div>'+
'</div>'+

'<div class="fp-sec" style="margin-top:18px">BUSINESS PROFILE</div>'+
'<div class="fp-row2">'+
  '<div class="fp-field"><label>Industry / Sector</label><select id="fp_ind">'+indOpts+'</select></div>'+
  '<div class="fp-field"><label>Number of Employees</label>'+
  '<select id="fp_emp"><option value="">-- Select --</option><option>Just me (Solo)</option><option>2–5</option><option>6–20</option><option>21–50</option><option>51–100</option><option>100+</option></select></div>'+
'</div>'+
'<div class="fp-row2">'+
  '<div class="fp-field"><label>Years in Business</label>'+
  '<select id="fp_yrs"><option value="">-- Select --</option><option>Less than 1 year</option><option>1–2 years</option><option>2–5 years</option><option>5–10 years</option><option>10+ years</option></select></div>'+
  '<div class="fp-field"><label>Business Structure</label>'+
  '<select id="fp_str"><option value="">-- Select --</option><option>Sole Proprietor</option><option>Partnership</option><option>LLC</option><option>S-Corporation</option><option>C-Corporation</option><option>Non-profit (501c3)</option></select></div>'+
'</div>'+

'<div class="fp-sec" style="margin-top:18px">OWNER CATEGORY <span class="fp-hint">Tick all that apply</span></div>'+
'<div class="fp-checks">'+
  '<label class="fp-chk"><input type="checkbox" id="fp_women"/>  Women-owned</label>'+
  '<label class="fp-chk"><input type="checkbox" id="fp_minority"/> Minority-owned</label>'+
  '<label class="fp-chk"><input type="checkbox" id="fp_veteran"/> Veteran-owned</label>'+
  '<label class="fp-chk"><input type="checkbox" id="fp_disabled"/> Differently-abled</label>'+
  '<label class="fp-chk"><input type="checkbox" id="fp_lgbtq"/> LGBTQ+-owned</label>'+
'</div>'+

'<div class="fp-sec" style="margin-top:18px">FINANCIAL SNAPSHOT <span class="fp-hint">Pre-fills all tools</span></div>'+
'<div class="fp-row2">'+
  '<div class="fp-field"><label>Monthly Revenue ($)</label><input type="number" id="fp_rev" placeholder="e.g. 22000"/></div>'+
  '<div class="fp-field"><label>Monthly Expenses ($)</label><input type="number" id="fp_exp" placeholder="e.g. 14500"/></div>'+
'</div>'+
'<div class="fp-row2">'+
  '<div class="fp-field"><label>Monthly EMI / Debt ($)</label><input type="number" id="fp_emi" placeholder="e.g. 1500"/></div>'+
  '<div class="fp-field"><label>Cash Reserve ($)</label><input type="number" id="fp_res" placeholder="e.g. 32000"/></div>'+
'</div>'+
'<div style="text-align:center;margin-top:22px">'+
  '<button class="fp-save-btn" id="fpSaveBtn">💾 Save Profile</button>'+
  '<div class="fp-toast" id="fpToast">✅ Profile saved! All tools will auto-load your data.</div>'+
'</div>'+
'<div style="margin-top:20px;padding-top:18px;border-top:1px solid #e2e8f0;text-align:center">'+
  '<div style="font-size:.68rem;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:#0891b2;border-left:3px solid #0891b2;padding-left:9px;text-align:left;margin-bottom:12px">BANK CONNECTION <span style="font-size:.63rem;color:#94a3b8;text-transform:none;font-weight:400;letter-spacing:0;margin-left:6px">Auto-fills all tools with real data</span></div>'+
  '<div id="fpBankStatus" style="font-size:.8rem;color:#64748b;margin-bottom:10px;min-height:20px"></div>'+
  '<button class="fp-bank-btn" id="fpConnectBankBtn">🏦 Connect Your Bank</button>'+
  '<div style="font-size:.68rem;color:#94a3b8;margin-top:7px">Powered by Plaid · Bank-level encryption · Disconnect anytime</div>'+
'</div>'+
'<div style="margin-top:16px;padding-top:14px;border-top:1px solid #e2e8f0;text-align:center">'+
  '<div style="font-size:.68rem;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:#7c3aed;border-left:3px solid #7c3aed;padding-left:9px;text-align:left;margin-bottom:10px">SUBSCRIPTION</div>'+
  '<div id="fpPlanInfo" style="font-size:.8rem;color:#475569;margin-bottom:10px"></div>'+
  '<button class="fp-bank-btn" id="fpManageSubBtn" onclick="fnavManageSubscription()" style="background:#7c3aed;display:none">⚡ Manage Subscription</button>'+
  '<a href="../pricing.html" id="fpUpgradeBtn" style="display:inline-block;background:#2563eb;color:#fff;padding:9px 20px;border-radius:8px;font-size:.82rem;font-weight:800;text-decoration:none;cursor:pointer">🚀 Upgrade Plan</a>'+
'</div>';

/* ── 6. CSS ── */
var css=[
/* Bar */
'.fnav-bar{position:sticky;top:0;z-index:9999;background:'+pc.navBg+';display:flex;align-items:center;height:48px;padding:0 14px;gap:8px;font-family:Arial,sans-serif;box-shadow:0 2px 10px rgba(0,0,0,.25);flex-wrap:nowrap}',
'.fnav-logo{font-weight:800;font-size:.92rem;color:#fff;text-decoration:none;letter-spacing:-.02em;white-space:nowrap;flex-shrink:0}',
'.fnav-logo b{color:#a5b4fc}',
'.fnav-badge{background:'+pc.badge+';color:#fff;font-size:.63rem;font-weight:800;padding:3px 9px;border-radius:999px;text-transform:uppercase;letter-spacing:.05em;white-space:nowrap;flex-shrink:0}',
'.fnav-bizname{max-width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:.75rem;color:rgba(255,255,255,.8);background:rgba(255,255,255,.1);padding:3px 10px;border-radius:999px;flex-shrink:1}',
'.fnav-spacer{flex:1;min-width:4px}',
'.fnav-btn{display:flex;align-items:center;gap:6px;background:rgba(255,255,255,.1);border:1.5px solid rgba(255,255,255,.2);color:#fff;padding:6px 13px;border-radius:7px;cursor:pointer;font-size:.78rem;font-weight:700;font-family:Arial,sans-serif;white-space:nowrap;transition:background .15s;flex-shrink:0}',
'.fnav-btn:hover{background:rgba(255,255,255,.2)}',
'.fnav-back{color:rgba(255,255,255,.6);font-size:.75rem;text-decoration:none;padding:5px 11px;border-radius:6px;border:1px solid rgba(255,255,255,.14);white-space:nowrap;flex-shrink:0}',
'.fnav-back:hover{color:#fff;background:rgba(255,255,255,.1)}',
/* Overlay shared */
'.fnav-overlay{display:none;position:fixed;inset:0;background:rgba(15,23,42,.65);z-index:10000;backdrop-filter:blur(3px);align-items:flex-start;justify-content:center;padding:20px 14px;overflow-y:auto}',
'.fnav-overlay.open{display:flex}',
'.fnav-modal{background:#fff;border-radius:16px;width:100%;overflow:hidden;box-shadow:0 24px 64px rgba(0,0,0,.35);margin:auto}',
'.fnav-modal-hd{background:'+pc.navBg+';padding:16px 22px;display:flex;align-items:center;gap:10px}',
'.fnav-modal-hd h2{font-size:.98rem;font-weight:800;color:#fff;flex:1;margin:0}',
'.fnav-hd-badge{background:'+pc.badge+';color:#fff;font-size:.62rem;font-weight:800;padding:3px 9px;border-radius:999px;text-transform:uppercase;letter-spacing:.05em}',
'.fnav-close{background:rgba(255,255,255,.15);border:none;color:#fff;width:28px;height:28px;border-radius:50%;cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-family:Arial,sans-serif}',
'.fnav-close:hover{background:rgba(255,255,255,.3)}',
'.fnav-body{padding:18px 18px 22px;overflow-y:auto;max-height:calc(90vh - 72px)}',
/* Tools grid */
'.fnav-modal.tools-modal{max-width:720px}',
'.fnav-tier-hd{display:flex;align-items:center;gap:8px;font-size:.68rem;font-weight:800;text-transform:uppercase;letter-spacing:.1em;padding-left:10px;border-left:3px solid;margin-bottom:10px;margin-top:18px}',
'.fnav-tier-hd:first-child{margin-top:0}',
'.fnav-lock-pill{font-size:.6rem;background:#f1f5f9;color:#94a3b8;padding:2px 7px;border-radius:999px;font-weight:700;text-transform:none;letter-spacing:0}',
'.fnav-tool-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-bottom:4px}',
'@media(max-width:520px){.fnav-tool-grid{grid-template-columns:repeat(2,1fr)}}',
'.fnav-card{display:flex;flex-direction:column;align-items:center;text-align:center;padding:13px 9px 11px;border-radius:11px;border:2px solid #e2e8f0;background:#fff;text-decoration:none;color:#1e293b;transition:all .15s}',
'.fnav-card:hover{border-color:var(--cc);background:var(--cb);transform:translateY(-2px);box-shadow:0 4px 14px rgba(0,0,0,.1)}',
'.fnav-card-active{border-color:var(--cc)!important;background:var(--cb)!important;box-shadow:0 0 0 3px color-mix(in srgb,var(--cc) 20%,transparent)}',
'.fnav-card-locked{opacity:.42;cursor:not-allowed;filter:grayscale(.4)}',
'.fnav-card-icon{font-size:1.7rem;margin-bottom:6px;line-height:1}',
'.fnav-card-name{font-size:.76rem;font-weight:800;color:#1e293b;margin-bottom:3px;line-height:1.3}',
'.fnav-card-desc{font-size:.66rem;color:#64748b;line-height:1.4;flex:1}',
'.fnav-card-here{font-size:.6rem;color:var(--cc);font-weight:800;margin-top:5px;text-transform:uppercase;letter-spacing:.05em}',
'.fnav-card-locklabel{font-size:.6rem;color:#94a3b8;font-weight:700;margin-top:5px}',
/* Profile form */
'.fnav-modal.prof-modal{max-width:620px}',
'.fp-sec{font-size:.68rem;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:'+pc.badge+';border-left:3px solid '+pc.badge+';padding-left:9px;margin-bottom:10px}',
'.fp-hint{font-size:.65rem;color:#94a3b8;text-transform:none;letter-spacing:0;font-weight:400;margin-left:6px}',
'.fp-req{color:#ef4444}',
'.fp-row2{display:grid;grid-template-columns:1fr 1fr;gap:0 16px;margin-bottom:4px}',
'@media(max-width:480px){.fp-row2{grid-template-columns:1fr}}',
'.fp-field{margin-bottom:12px}',
'.fp-field label{display:block;font-size:.77rem;font-weight:700;color:#475569;margin-bottom:4px}',
'.fp-field input,.fp-field select{width:100%;padding:8px 10px;border:1.5px solid #e2e8f0;border-radius:7px;font-size:.85rem;font-family:Arial,sans-serif;color:#1e293b;background:#fff}',
'.fp-field input:focus,.fp-field select:focus{outline:none;border-color:'+pc.badge+'}',
'.fp-checks{display:flex;flex-wrap:wrap;gap:8px 16px;margin-bottom:6px}',
'.fp-chk{display:flex;align-items:center;gap:6px;font-size:.82rem;color:#334155;cursor:pointer;padding:6px 12px;border-radius:7px;border:1.5px solid #e2e8f0;background:#fff;transition:all .12s}',
'.fp-chk:hover{border-color:'+pc.badge+';background:#f8f7ff}',
'.fp-chk input{width:15px;height:15px;accent-color:'+pc.badge+';cursor:pointer}',
'.fp-save-btn{padding:11px 36px;background:'+pc.badge+';color:#fff;border:none;border-radius:9px;font-size:.92rem;font-weight:800;cursor:pointer;font-family:Arial,sans-serif;letter-spacing:.01em}',
'.fp-save-btn:hover{opacity:.88}',
'.fp-toast{display:none;margin-top:10px;font-size:.82rem;color:#16a34a;font-weight:700;background:#f0fdf4;border:1px solid #86efac;padding:8px 18px;border-radius:8px;display:inline-block;opacity:0;transition:opacity .3s}',
'.fp-toast.show{display:inline-block;opacity:1}',
'.fp-bank-btn{padding:10px 28px;background:#0891b2;color:#fff;border:none;border-radius:9px;font-size:.88rem;font-weight:800;cursor:pointer;font-family:Arial,sans-serif;letter-spacing:.01em;transition:background .15s}',
'.fp-bank-btn:hover{background:#0e7490}',
'.fp-bank-btn:disabled{background:#94a3b8;cursor:not-allowed}',
/* Alert bell */
'.fnav-bell{position:relative;background:rgba(255,255,255,.1);border:1.5px solid rgba(255,255,255,.2);color:#fff;width:36px;height:36px;border-radius:8px;cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-family:Arial,sans-serif;transition:background .15s}',
'.fnav-bell:hover{background:rgba(255,255,255,.2)}',
'.fnav-bell-count{position:absolute;top:-6px;right:-6px;background:#ef4444;color:#fff;font-size:.55rem;font-weight:800;min-width:16px;height:16px;border-radius:999px;display:flex;align-items:center;justify-content:center;padding:0 3px;font-family:Arial,sans-serif}',
/* Alert panel */
'.fnav-alert-panel{display:none;position:fixed;top:56px;right:14px;width:340px;max-height:480px;background:#fff;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.18);z-index:10001;overflow:hidden;flex-direction:column}',
'.fnav-alert-panel.open{display:flex}',
'.fnav-ap-hd{background:#0f172a;padding:14px 16px;display:flex;align-items:center;gap:8px}',
'.fnav-ap-hd h3{font-size:.88rem;font-weight:800;color:#fff;flex:1;margin:0}',
'.fnav-ap-close{background:rgba(255,255,255,.15);border:none;color:#fff;width:24px;height:24px;border-radius:50%;cursor:pointer;font-size:.85rem;display:flex;align-items:center;justify-content:center;font-family:Arial,sans-serif}',
'.fnav-ap-body{overflow-y:auto;flex:1;padding:8px}',
'.fnav-alert-item{padding:12px;border-radius:8px;margin-bottom:6px;border-left:3px solid}',
'.fnav-al-urgent{background:#fff1f2;border-color:#dc2626}',
'.fnav-al-high{background:#fff7ed;border-color:#f97316}',
'.fnav-al-medium{background:#fefce8;border-color:#eab308}',
'.fnav-al-low{background:#f0fdf4;border-color:#22c55e}',
'.fnav-al-title{font-size:.82rem;font-weight:800;color:#0f172a;margin-bottom:3px}',
'.fnav-al-body{font-size:.75rem;color:#475569;line-height:1.4;margin-bottom:6px}',
'.fnav-al-actions{display:flex;gap:8px;align-items:center}',
'.fnav-al-link{font-size:.73rem;font-weight:700;color:#2563eb;text-decoration:none}',
'.fnav-al-dismiss{font-size:.7rem;color:#94a3b8;background:none;border:none;cursor:pointer;font-family:Arial,sans-serif;padding:0}',
'.fnav-al-dismiss:hover{color:#475569}',
'.fnav-ap-empty{padding:24px;text-align:center;font-size:.82rem;color:#94a3b8}'
].join('');

var styleEl=document.createElement('style');
styleEl.textContent=css;
document.head.appendChild(styleEl);

/* ── PWA: inject manifest + meta tags + pwa.js for all module pages ── */
(function(){
  if(!document.querySelector('link[rel="manifest"]')){
    var lm=document.createElement('link');lm.rel='manifest';lm.href='../manifest.json';document.head.appendChild(lm);
  }
  if(!document.querySelector('link[rel="apple-touch-icon"]')){
    var la=document.createElement('link');la.rel='apple-touch-icon';la.href='../icon-192.png';document.head.appendChild(la);
  }
  if(!document.querySelector('meta[name="theme-color"]')){
    var mt=document.createElement('meta');mt.name='theme-color';mt.content='#0f172a';document.head.appendChild(mt);
  }
  if(!document.getElementById('fwPwaScript')){
    var ps=document.createElement('script');ps.id='fwPwaScript';ps.src='../pwa.js';ps.defer=true;document.head.appendChild(ps);
  }
})();

/* ── 7. Profile save / load ── */
function fnavLoadProfile(){
  var p={};
  try{p=JSON.parse(localStorage.getItem('fw_profile')||'{}');}catch(e){}
  function set(id,val){var el=document.getElementById(id);if(el&&val!=null)el.value=val;}
  function chk(id,arr){var el=document.getElementById(id);if(el&&arr)el.checked=arr.indexOf(el.value||id.replace('fp_',''))>-1;}
  set('fp_biz',p.bizName);set('fp_owner',p.ownerName);set('fp_email',p.email);
  set('fp_state',p.state);set('fp_ind',p.industry);set('fp_emp',p.employees);
  set('fp_yrs',p.yearsInBusiness);set('fp_str',p.structure);
  set('fp_rev',p.rev);set('fp_exp',p.exp);set('fp_emi',p.emi);set('fp_res',p.reserve);
  var cats=p.ownerCategory||[];
  ['women','minority','veteran','disabled','lgbtq'].forEach(function(c){
    var el=document.getElementById('fp_'+c);if(el)el.checked=cats.indexOf(c)>-1;
  });
}

window.fnavSaveProfile=function(){
  var cats=[];
  ['women','minority','veteran','disabled','lgbtq'].forEach(function(c){
    var el=document.getElementById('fp_'+c);if(el&&el.checked)cats.push(c);
  });
  function val(id){var el=document.getElementById(id);return el?el.value.trim():'';}
  function num(id){var el=document.getElementById(id);return el?parseFloat(el.value)||0:0;}

  var p={
    bizName:val('fp_biz'), ownerName:val('fp_owner'), email:val('fp_email'),
    state:val('fp_state'), industry:val('fp_ind'), employees:val('fp_emp'),
    yearsInBusiness:val('fp_yrs'), structure:val('fp_str'), ownerCategory:cats,
    rev:num('fp_rev'), exp:num('fp_exp'), emi:num('fp_emi'), reserve:num('fp_res')
  };
  localStorage.setItem('fw_profile',JSON.stringify(p));

  /* Sync → fw_profiles (financial tools auto-load) */
  var profiles=[{id:'p1',name:p.bizName||'My Business',industry:p.industry||'',
    rev:p.rev,exp:p.exp,emi:p.emi,reserve:p.reserve}];
  localStorage.setItem('fw_profiles',JSON.stringify(profiles));
  localStorage.setItem('fw_active_idx','0');

  /* Sync financial figures into every tool-specific save so they auto-fill on next load */
  var toolSyncs=['fw_ldse'];
  toolSyncs.forEach(function(key){
    try{
      var ts=JSON.parse(localStorage.getItem(key)||'{}');
      ts.revenue=p.rev;
      ts.expenses=p.exp;
      ts.existingEmi=p.emi||0;
      localStorage.setItem(key,JSON.stringify(ts));
    }catch(e){}
  });

  /* Sync → fw_biz_profile (grant finder) */
  localStorage.setItem('fw_biz_profile',JSON.stringify({
    businessName:p.bizName,industry:p.industry,state:p.state,employees:p.employees,
    businessAge:parseFloat(p.yearsInBusiness)||0,
    country:'USA',
    annualRevenue:(p.rev||0)*12,
    specialCategories:cats.map(function(c){return c.replace('-owned','');}),
    savedAt:new Date().toISOString()
  }));

  /* Back up to Supabase Edge Function so profile survives localStorage clears */
  if(window.fwAuth&&window.fwAuth.user){
    window.fwAuth.client.auth.getSession().then(function(res){
      var token=res&&res.data&&res.data.session&&res.data.session.access_token;
      if(!token) return;
      fetch('https://ugtfdtdbegdjqrdtplkg.supabase.co/functions/v1/profile-save',{
        method:'POST',
        headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
        body:JSON.stringify({rev:p.rev,exp:p.exp,emi:p.emi,bizName:p.bizName,industry:p.industry})
      }).catch(function(){});
    });
  }

  /* Update nav name chip */
  var chip=document.getElementById('fnavBizChip');
  if(chip&&p.bizName){chip.textContent='🏪 '+p.bizName;chip.style.display='block';}

  /* Unlock forced gate if bizName now filled */
  if(p.bizName&&window.fnavForced){
    window.fnavForced=false;
    var cb=document.getElementById('fnavProfClose');
    if(cb){cb.style.opacity='1';cb.style.pointerEvents='auto';}
    var banner=document.getElementById('fpGateBanner');
    if(banner)banner.style.display='none';
    var hd=document.querySelector('#fnavProfOv .fnav-modal-hd h2');
    if(hd)hd.innerHTML='👤 My Business Profile';
    setTimeout(function(){document.getElementById('fnavProfOv').classList.remove('open');},1800);
  }

  /* Auto-fill common tool input fields on the current page */
  var toolFields = {
    revenue:['revenue','monthlyRevenue','rev'],
    expenses:['expenses','monthlyExpenses','exp'],
    existingEmi:['existingEmi','emi','loanEmi'],
    reserve:['reserve','cashReserve','cash']
  };
  var fieldMap = {revenue:p.rev, expenses:p.exp, existingEmi:p.emi, reserve:p.reserve};
  Object.keys(fieldMap).forEach(function(key){
    var val = fieldMap[key];
    if(!val && val !== 0) return;
    toolFields[key].forEach(function(id){
      var el = document.getElementById(id);
      if(el) el.value = val;
    });
  });

  /* Trigger the page's own save function so fw_ldse stays in sync */
  if(typeof saveInputs === 'function') setTimeout(saveInputs, 50);

  /* Toast */
  var t=document.getElementById('fpToast');
  if(t){t.classList.add('show');setTimeout(function(){t.classList.remove('show');},3000);}
};

/* ── 8. Build DOM ── */
/* Read saved profile for business name chip */
var savedP={};try{savedP=JSON.parse(localStorage.getItem('fw_profile')||'{}');}catch(e){}

var bar=document.createElement('div');
bar.className='fnav-bar';
bar.id='fnavBar';
bar.innerHTML=
  '<a href="../try.html" class="fnav-logo">💡 Fin<b>Wise</b></a>'+
  '<span class="fnav-badge">'+pc.label+'</span>'+
  (savedP.bizName?'<span class="fnav-bizname" id="fnavBizChip">🏪 '+savedP.bizName+'</span>':'<span class="fnav-bizname" id="fnavBizChip" style="display:none"></span>')+
  '<div class="fnav-spacer"></div>'+
  '<button class="fnav-bell" id="fnavBellBtn" title="Alerts">🔔<span class="fnav-bell-count" id="fnavBellCount" style="display:none">0</span></button>'+
  '<button class="fnav-btn" id="fnavProfBtn">👤 My Profile</button>'+
  '<button class="fnav-btn" id="fnavToolsBtn">☰ All Tools</button>'+
  '<a href="../try.html" class="fnav-back">← Dashboard</a>';

/* Tools modal */
var toolsModal=document.createElement('div');
toolsModal.className='fnav-overlay';toolsModal.id='fnavToolsOv';
toolsModal.innerHTML='<div class="fnav-modal tools-modal"><div class="fnav-modal-hd">'+
  '<h2>☰ Your Tools</h2><span class="fnav-hd-badge">'+pc.label+'</span>'+
  '<button class="fnav-close" id="fnavToolsClose">✕</button></div>'+
  '<div class="fnav-body">'+toolsHtml+'</div></div>';

/* Profile modal */
var profModal=document.createElement('div');
profModal.className='fnav-overlay';profModal.id='fnavProfOv';
profModal.innerHTML='<div class="fnav-modal prof-modal"><div class="fnav-modal-hd">'+
  '<h2>👤 My Business Profile</h2><span class="fnav-hd-badge">'+pc.label+'</span>'+
  '<button class="fnav-close" id="fnavProfClose">✕</button></div>'+
  '<div class="fnav-body">'+profileHtml+'</div></div>';

/* Alert panel */
var alertPanel=document.createElement('div');
alertPanel.className='fnav-alert-panel';alertPanel.id='fnavAlertPanel';
alertPanel.innerHTML='<div class="fnav-ap-hd"><h3>🔔 Alerts</h3><button class="fnav-ap-close" id="fnavAlertClose">✕</button></div>'+
  '<div class="fnav-ap-body" id="fnavAlertBody"><div class="fnav-ap-empty">Loading alerts…</div></div>';

function inject(){
  document.body.insertBefore(bar,document.body.firstChild);
  document.body.appendChild(toolsModal);
  document.body.appendChild(profModal);
  document.body.appendChild(alertPanel);

  /* Tools modal events */
  document.getElementById('fnavToolsBtn').addEventListener('click',function(){
    document.getElementById('fnavToolsOv').classList.add('open');
  });
  document.getElementById('fnavToolsClose').addEventListener('click',function(){
    document.getElementById('fnavToolsOv').classList.remove('open');
  });
  toolsModal.addEventListener('click',function(e){if(e.target===toolsModal)toolsModal.classList.remove('open');});

  /* Profile modal events */
  document.getElementById('fnavProfBtn').addEventListener('click',function(){
    fnavLoadProfile();
    document.getElementById('fnavProfOv').classList.add('open');
  });
  document.getElementById('fnavProfClose').addEventListener('click',function(){
    document.getElementById('fnavProfOv').classList.remove('open');
  });
  profModal.addEventListener('click',function(e){if(e.target===profModal&&!window.fnavForced)profModal.classList.remove('open');});

  /* Save button — validate bizName required */
  document.getElementById('fpSaveBtn').addEventListener('click',function(){
    var bizEl=document.getElementById('fp_biz');
    if(!bizEl||!bizEl.value.trim()){
      bizEl.style.borderColor='#ef4444';bizEl.style.boxShadow='0 0 0 3px #fca5a533';
      bizEl.focus();
      var em=document.getElementById('fpBizError');if(em)em.style.display='block';
      return;
    }
    if(bizEl){bizEl.style.borderColor='';bizEl.style.boxShadow='';}
    var em=document.getElementById('fpBizError');if(em)em.style.display='none';
    fnavSaveProfile();
    if(!window.fnavForced){
      setTimeout(function(){document.getElementById('fnavProfOv').classList.remove('open');},1800);
    }
  });

  window.fnavForced=false;

  /* Alert bell */
  document.getElementById('fnavBellBtn').addEventListener('click',function(e){
    e.stopPropagation();
    var panel=document.getElementById('fnavAlertPanel');
    var isOpen=panel.classList.contains('open');
    panel.classList.toggle('open');
    if(!isOpen) fnavLoadAlerts();
  });
  document.getElementById('fnavAlertClose').addEventListener('click',function(){
    document.getElementById('fnavAlertPanel').classList.remove('open');
  });
  document.addEventListener('click',function(e){
    var panel=document.getElementById('fnavAlertPanel');
    if(panel&&panel.classList.contains('open')&&!panel.contains(e.target)&&e.target.id!=='fnavBellBtn'){
      panel.classList.remove('open');
    }
  });

  /* Connect Bank button */
  var bankBtn = document.getElementById('fpConnectBankBtn');
  if(bankBtn) bankBtn.addEventListener('click', fnavConnectBank);

  /* Show bank status if already connected */
  fnavRefreshBankStatus();
  /* Show plan info */
  fnavRefreshPlanInfo();
}

function fnavLoadAlerts(){
  if(!window.fwAuth||!window.fwAuth.user) return;
  window.fwAuth.client.auth.getSession().then(function(res){
    var token=res&&res.data&&res.data.session&&res.data.session.access_token;
    if(!token) return;
    fetch('https://ugtfdtdbegdjqrdtplkg.supabase.co/functions/v1/alerts-get',{
      headers:{'Authorization':'Bearer '+token}
    }).then(function(r){return r.json();}).then(function(data){
      var body=document.getElementById('fnavAlertBody');
      if(!body) return;
      var alerts=data.alerts||[];
      var countEl=document.getElementById('fnavBellCount');
      if(countEl){
        if(alerts.length>0){countEl.textContent=alerts.length;countEl.style.display='flex';}
        else{countEl.style.display='none';}
      }
      if(alerts.length===0){body.innerHTML='<div class="fnav-ap-empty">✅ No new alerts — finances look on track.</div>';return;}
      var urgMap={urgent:'fnav-al-urgent',high:'fnav-al-high',medium:'fnav-al-medium',low:'fnav-al-low'};
      body.innerHTML=alerts.map(function(a){
        return '<div class="fnav-alert-item '+(urgMap[a.urgency]||'fnav-al-medium')+'" id="fnal-'+a.id+'">'+
          '<div class="fnav-al-title">'+a.title+'</div>'+
          '<div class="fnav-al-body">'+a.body+'</div>'+
          '<div class="fnav-al-actions">'+
          (a.action_url?'<a href="'+a.action_url+'" class="fnav-al-link">Take action →</a>':'')+
          '<button class="fnav-al-dismiss" onclick="fnavDismissAlert(\''+a.id+'\')">Dismiss</button>'+
          '</div></div>';
      }).join('');
    }).catch(function(){
      var body=document.getElementById('fnavAlertBody');
      if(body) body.innerHTML='<div class="fnav-ap-empty">Could not load alerts.</div>';
    });
  });
}

window.fnavDismissAlert=function(id){
  var el=document.getElementById('fnal-'+id);
  if(el) el.style.opacity='0.4';
  if(!window.fwAuth||!window.fwAuth.user) return;
  window.fwAuth.client.auth.getSession().then(function(res){
    var token=res&&res.data&&res.data.session&&res.data.session.access_token;
    if(!token) return;
    fetch('https://ugtfdtdbegdjqrdtplkg.supabase.co/functions/v1/alerts-get?action=dismiss&id='+id,{
      headers:{'Authorization':'Bearer '+token}
    }).then(function(){
      if(el) el.remove();
      fnavLoadAlerts();
    });
  });
};

function fnavRefreshBankStatus(){
  var el = document.getElementById('fpBankStatus');
  if(!el) return;
  if(window.fwAuth && window.fwAuth.user){
    window.fwAuth.client.auth.getSession().then(function(res){
      var token = res&&res.data&&res.data.session&&res.data.session.access_token;
      if(!token){ el.textContent = ''; return; }
      window.fwAuth.client.from('plaid_connections')
        .select('institution_name,last_synced_at')
        .eq('user_id', window.fwAuth.user.id)
        .maybeSingle()
        .then(function(r){
          if(r.data){
            var when = r.data.last_synced_at ? new Date(r.data.last_synced_at).toLocaleDateString() : 'never';
            el.innerHTML = '✅ <strong>'+r.data.institution_name+'</strong> connected · Last sync: '+when;
            var btn = document.getElementById('fpConnectBankBtn');
            if(btn){ btn.textContent = '🔄 Re-sync Now'; }
          } else {
            el.textContent = 'No bank connected yet.';
          }
        });
    });
  }
}

function fnavRefreshPlanInfo(){
  var planInfo = document.getElementById('fpPlanInfo');
  var manageBtn = document.getElementById('fpManageSubBtn');
  var upgradeBtn = document.getElementById('fpUpgradeBtn');
  if(!planInfo) return;
  var plan = (window.fwAuth && window.fwAuth.plan) || 'free';
  var planLabels = {free:'Free Plan',starter:'Starter Plan',pro:'Pro Plan',advisor:'Advisor Plan'};
  planInfo.textContent = 'Current plan: ' + (planLabels[plan] || plan);
  if(plan !== 'free'){
    if(manageBtn) manageBtn.style.display = 'inline-block';
    if(upgradeBtn) upgradeBtn.style.display = 'none';
  } else {
    if(manageBtn) manageBtn.style.display = 'none';
    if(upgradeBtn) upgradeBtn.style.display = 'inline-block';
  }
}

window.fnavManageSubscription = function(){
  var btn = document.getElementById('fpManageSubBtn');
  if(btn){ btn.textContent = 'Opening…'; btn.disabled = true; }
  if(!window.fwAuth || !window.fwAuth.user){ window.location.href = '../pricing.html'; return; }
  window.fwAuth.client.auth.getSession().then(function(res){
    var token = res&&res.data&&res.data.session&&res.data.session.access_token;
    if(!token){ window.location.href = '../pricing.html'; return; }
    fetch('https://ugtfdtdbegdjqrdtplkg.supabase.co/functions/v1/stripe-portal',{
      method:'POST',
      headers:{'Authorization':'Bearer '+token,'Content-Type':'application/json'},
      body:JSON.stringify({return_url: window.location.href})
    }).then(function(r){return r.json();}).then(function(data){
      if(data.url){ window.location.href = data.url; }
      else{ alert(data.error || 'Could not open billing portal'); if(btn){btn.textContent='⚡ Manage Subscription';btn.disabled=false;} }
    }).catch(function(){ if(btn){btn.textContent='⚡ Manage Subscription';btn.disabled=false;} });
  });
};

function fnavConnectBank(){
  var btn = document.getElementById('fpConnectBankBtn');
  var status = document.getElementById('fpBankStatus');
  if(!window.fwAuth || !window.fwAuth.user){
    if(status) status.innerHTML = '⚠️ Please sign in first.';
    return;
  }
  if(btn){ btn.disabled = true; btn.textContent = '⏳ Loading...'; }

  window.fwAuth.client.auth.getSession().then(function(res){
    var token = res&&res.data&&res.data.session&&res.data.session.access_token;
    if(!token){
      if(status) status.innerHTML = '⚠️ Session expired. Please sign in again.';
      if(btn){ btn.disabled = false; btn.textContent = '🏦 Connect Your Bank'; }
      return;
    }

    fetch('https://ugtfdtdbegdjqrdtplkg.supabase.co/functions/v1/plaid-create-link-token',{
      headers:{ 'Authorization': 'Bearer '+token }
    })
    .then(function(r){ return r.json(); })
    .then(function(data){
      if(!data.link_token){
        if(status) status.innerHTML = '❌ Could not start bank connection: '+(data.error||'unknown error');
        if(btn){ btn.disabled = false; btn.textContent = '🏦 Connect Your Bank'; }
        return;
      }

      /* Load Plaid SDK if not already loaded */
      function openPlaidLink(){
        var handler = window.Plaid.create({
          token: data.link_token,
          onSuccess: function(public_token, metadata){
            if(status) status.innerHTML = '⏳ Connecting '+metadata.institution.name+'...';
            fetch('https://ugtfdtdbegdjqrdtplkg.supabase.co/functions/v1/plaid-exchange-token',{
              method: 'POST',
              headers:{ 'Authorization':'Bearer '+token, 'Content-Type':'application/json' },
              body: JSON.stringify({ public_token: public_token, institution_name: metadata.institution.name })
            })
            .then(function(r){ return r.json(); })
            .then(function(ex){
              if(!ex.ok){
                if(status) status.innerHTML = '❌ Connection failed: '+(ex.error||'unknown');
                if(btn){ btn.disabled = false; btn.textContent = '🏦 Connect Your Bank'; }
                return;
              }
              if(status) status.innerHTML = '⏳ Importing transactions...';
              return fetch('https://ugtfdtdbegdjqrdtplkg.supabase.co/functions/v1/plaid-sync',{
                method: 'POST',
                headers:{ 'Authorization':'Bearer '+token, 'Content-Type':'application/json' }
              }).then(function(r){ return r.json(); });
            })
            .then(function(sync){
              if(!sync) return;
              if(sync.ok){
                if(status) status.innerHTML = '✅ <strong>'+metadata.institution.name+'</strong> connected · '+sync.transactions_imported+' transactions imported';
                if(btn){ btn.disabled = false; btn.textContent = '🔄 Re-sync Now'; }
                /* Update profile financials from real bank data */
                var revEl = document.getElementById('fp_rev');
                var expEl = document.getElementById('fp_exp');
                if(revEl && sync.revenue) revEl.value = Math.round(sync.revenue);
                if(expEl && sync.expenses) expEl.value = Math.round(sync.expenses);
                /* Re-run tool auto-fill */
                if(typeof window.fwToolAutoFill === 'function') setTimeout(window.fwToolAutoFill, 200);
              } else {
                if(status) status.innerHTML = '⚠️ Bank connected but sync issue: '+(sync.error||'');
                if(btn){ btn.disabled = false; btn.textContent = '🔄 Re-sync Now'; }
              }
            })
            .catch(function(e){
              if(status) status.innerHTML = '❌ Error: '+e.message;
              if(btn){ btn.disabled = false; btn.textContent = '🏦 Connect Your Bank'; }
            });
          },
          onExit: function(err){
            if(btn){ btn.disabled = false; btn.textContent = '🏦 Connect Your Bank'; }
            if(err && status) status.innerHTML = '⚠️ '+err.display_message;
          }
        });
        handler.open();
      }

      if(window.Plaid){
        openPlaidLink();
      } else {
        var s = document.createElement('script');
        s.src = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js';
        s.onload = openPlaidLink;
        s.onerror = function(){
          if(status) status.innerHTML = '❌ Could not load Plaid SDK. Check your internet connection.';
          if(btn){ btn.disabled = false; btn.textContent = '🏦 Connect Your Bank'; }
        };
        document.head.appendChild(s);
      }
    })
    .catch(function(e){
      if(status) status.innerHTML = '❌ '+e.message;
      if(btn){ btn.disabled = false; btn.textContent = '🏦 Connect Your Bank'; }
    });
  });
}

function runProfileGate(realPlan){
  var sp={};try{sp=JSON.parse(localStorage.getItem('fw_profile')||'{}');}catch(e){}
  var hp=sp.bizName&&sp.bizName.trim();
  var hf=parseFloat(sp.rev)>0||parseFloat(sp.exp)>0;

  /* Has full profile — nothing to do */
  if(hp&&hf) return;

  var ov=document.getElementById('fnavProfOv');
  if(!ov) return;

  fnavLoadProfile();
  ov.classList.add('open');

  if(!hp){
    /* No name at all — force blocking gate */
    if(realPlan==='free') return;
    window.fnavForced=true;
    var hd=ov.querySelector('.fnav-modal-hd h2');
    if(hd)hd.innerHTML='👋 Set up your profile to auto-fill all tools';
    var cb=document.getElementById('fnavProfClose');
    if(cb){cb.style.opacity='0';cb.style.pointerEvents='none';}
    var bd=ov.querySelector('.fnav-body');
    if(bd&&!document.getElementById('fpGateBanner')){
      var bn=document.createElement('div');
      bn.id='fpGateBanner';
      bn.style.cssText='background:#fef9c3;border:1px solid #fde68a;border-radius:8px;padding:11px 14px;margin-bottom:16px;font-size:.82rem;color:#92400e;font-weight:600;line-height:1.5;';
      bn.innerHTML='⚠️ Enter your <strong>Business Name</strong> and financials — all tools auto-fill from this. You only do this once.';
      bd.insertBefore(bn,bd.firstChild);
    }
  } else {
    /* Has name but no financials — soft prompt (closeable) */
    var hd2=ov.querySelector('.fnav-modal-hd h2');
    if(hd2)hd2.innerHTML='💰 Add your financials to auto-fill tools';
    var bd2=ov.querySelector('.fnav-body');
    if(bd2&&!document.getElementById('fpFinBanner')){
      var b2=document.createElement('div');
      b2.id='fpFinBanner';
      b2.style.cssText='background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:11px 14px;margin-bottom:16px;font-size:.82rem;color:#1e40af;font-weight:600;line-height:1.5;';
      b2.innerHTML='💡 Add your <strong>Monthly Revenue</strong> and <strong>Expenses</strong> below — every tool will pre-fill automatically once saved.';
      bd2.insertBefore(b2,bd2.firstChild);
    }
  }
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',inject);
}else{
  inject();
}

/* ── Auth layer: update nav once Supabase session is known ── */
function fnavApplyAuth(){
  if(!window.fwAuth) return;
  window.fwAuth.init(function(){
    var auth = window.fwAuth;
    var PCFG2 = {free:{label:'Free Plan',badge:'#475569'},starter:{label:'Starter Plan',badge:'#0891b2'},pro:{label:'Pro Plan',badge:'#7c3aed'},advisor:{label:'Advisor Plan',badge:'#be185d'}};

    if(auth.user){
      /* Update all plan badges (topbar + modal headers) */
      var pc2=PCFG2[auth.plan]||PCFG2.free;
      document.querySelectorAll('.fnav-badge,.fnav-hd-badge').forEach(function(el){
        el.textContent=pc2.label; el.style.background=pc2.badge;
      });

      /* Update / show user name chip */
      var chip=document.querySelector('.fnav-bizname');
      var displayName='👤 '+auth.displayName();
      if(chip){chip.textContent=displayName;}
      else{
        var spacer=document.querySelector('.fnav-spacer');
        if(spacer){var c=document.createElement('span');c.className='fnav-bizname';c.textContent=displayName;spacer.parentNode.insertBefore(c,spacer);}
      }

      /* Add Sign Out button */
      var bar=document.getElementById('fnavBar');
      if(bar&&!document.getElementById('fnavSignOutBtn')){
        var so=document.createElement('button');
        so.id='fnavSignOutBtn';so.className='fnav-back';so.style.cursor='pointer';
        so.textContent='Sign Out';
        so.onclick=function(){auth.signOut();};
        bar.appendChild(so);
      }

      /* Sync plan to localStorage — clear all first so demo flags don't bleed */
      ['fw_starter','fw_pro','fw_advisor'].forEach(function(k){ localStorage.removeItem(k); });
      if(auth.plan!=='free'){
        localStorage.setItem('fw_'+auth.plan,'1');
        if(auth.plan==='pro'||auth.plan==='advisor') localStorage.setItem('fw_starter','1');
        if(auth.plan==='advisor') localStorage.setItem('fw_pro','1');
      }

      /* Fetch latest profile from Supabase and merge into localStorage */
      auth.client.auth.getSession().then(function(res){
        var token=res&&res.data&&res.data.session&&res.data.session.access_token;
        if(!token) return;
        fetch('https://ugtfdtdbegdjqrdtplkg.supabase.co/functions/v1/profile-get',{
          headers:{'Authorization':'Bearer '+token}
        }).then(function(r){return r.json();}).then(function(data){
          if(data&&data.profile&&data.profile.bizName){
            var existing={};
            try{existing=JSON.parse(localStorage.getItem('fw_profile')||'{}');}catch(e){}
            var merged=Object.assign({},data.profile,existing.bizName?{}:data.profile);
            localStorage.setItem('fw_profile',JSON.stringify(Object.assign({},data.profile,existing)));
          }
          /* Run profile gate now that we know the real plan */
          runProfileGate(auth.plan);
          /* Re-run tool auto-fill after Supabase profile is merged */
          if(typeof window.fwToolAutoFill === 'function') setTimeout(window.fwToolAutoFill, 0);
          /* Load alert count */
          setTimeout(fnavLoadAlerts, 500);
        }).catch(function(){
          runProfileGate(auth.plan);
          if(typeof window.fwToolAutoFill === 'function') setTimeout(window.fwToolAutoFill, 0);
          setTimeout(fnavLoadAlerts, 500);
        });
      });
    } else {
      /* Not signed in — clear any stale plan flags so next user sees Free Plan */
      ['fw_starter','fw_pro','fw_advisor'].forEach(function(k){ localStorage.removeItem(k); });
      /* Correct badge to Free Plan */
      var freeCfg=PCFG2.free;
      document.querySelectorAll('.fnav-badge,.fnav-hd-badge').forEach(function(el){
        el.textContent=freeCfg.label; el.style.background=freeCfg.badge;
      });
      /* Clear biz name chip */
      var bizChip=document.getElementById('fnavBizChip');
      if(bizChip){bizChip.textContent='';bizChip.style.display='none';}
      /* Not signed in — show Sign In link */
      var bar2=document.getElementById('fnavBar');
      if(bar2&&!document.getElementById('fnavSignInBtn')){
        var si=document.createElement('a');
        si.id='fnavSignInBtn';
        si.href=(window.location.pathname.includes('/modules/')?'../':'')+'auth.html';
        si.className='fnav-back';
        si.textContent='🔑 Sign In';
        bar2.appendChild(si);
      }
    }
  });
}
window.addEventListener('load',fnavApplyAuth);
})();
