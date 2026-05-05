/* FinWise — Contextual Help System (Option B + C)
   B: Floating coach panel per tool   C: Plain-English glossary underlines
   Add <script src="help.js"></script> after nav.js in every module page. */
(function(){

/* ══════════════════════════════════════════
   1. TOOL COACH CONTENT (per page)
══════════════════════════════════════════ */
var COACH = {
  'loanDecisionScoreEngine.test.html':{
    title:'Loan Safety Score', icon:'🏦',
    what:'Tells you — in plain English — whether taking a loan right now is SAFE, RISKY, or DANGEROUS for your business. It checks if your monthly income can still cover all your costs after paying the loan back.',
    example:'Sarah runs a boutique making $8,500/month. She wants a $30,000 loan. This tool checks: after the monthly loan payment, does she have enough left for rent, staff, and supplies? Yes → SAFE.',
    results:[
      {icon:'✅',label:'SAFE (Score 70–100)',desc:'Your income comfortably covers the loan. Good to proceed.'},
      {icon:'⚠️',label:'RISKY (Score 40–69)',desc:'Loan is payable but tight. One slow month could cause trouble.'},
      {icon:'🚨',label:'DANGEROUS (Score 0–39)',desc:'This loan will strain your finances. Consider a smaller amount or longer repayment.'}
    ],
    tip:'Try lowering the loan amount OR extending the repayment years — either move can flip RISKY to SAFE.'
  },
  'emiCalculator.test.html':{
    title:'EMI Calculator', icon:'🧮',
    what:'EMI is your fixed monthly loan payment — part pays back what you borrowed, part is the bank\'s fee (interest). This tool shows exactly what you\'ll pay every month and how much the loan truly costs in total.',
    example:'James borrows $18,000 at 14% for 3 years. His EMI is $615/month. Over 3 years he pays $22,140 — meaning the loan cost him an extra $4,140 in interest on top of what he borrowed.',
    results:[
      {icon:'📅',label:'Monthly EMI',desc:'Fixed amount you owe the bank every single month — plan your budget around this.'},
      {icon:'💰',label:'Total Interest Paid',desc:'The real cost of borrowing — what you pay on top of the original loan amount.'},
      {icon:'📊',label:'Repayment Table',desc:'Month-by-month view of how your loan balance shrinks over time.'}
    ],
    tip:'Even a 1–2% lower interest rate saves thousands. Always compare 2–3 lenders before signing anything.'
  },
  'lenderMarketplace.html':{
    title:'Lender Marketplace', icon:'🏛',
    what:'A curated list of trusted US lenders — government programs, online lenders, and marketplaces — with their rates and requirements in one place. No need to search the web.',
    example:'Marcus needs $85,000 for IT equipment. SBA 7(a) has the lowest rates but takes 60–90 days. Funding Circle approves in days but costs slightly more. This page helps him choose based on his timeline.',
    results:[
      {icon:'🏛',label:'SBA / Government',desc:'Lowest rates, strictest requirements, slower to approve. Best for established businesses.'},
      {icon:'⚡',label:'Online Lenders',desc:'Faster approval, slightly higher rates. Good if you need money quickly.'},
      {icon:'🤝',label:'Marketplaces',desc:'They submit to multiple lenders at once — one application, multiple offers.'}
    ],
    tip:'Use the Loan Eligibility tool first to see which lenders you\'re likely to qualify for before applying.'
  },
  'starterPlan.test.html':{
    title:'Starter Dashboard', icon:'📋',
    what:'Lets you compare 3 different loan options side by side — different amounts, rates, or repayment periods. See which one fits your business best before you commit to anything.',
    example:'Sarah compares: $20K for 2 years vs $30K for 4 years vs $40K for 5 years. The dashboard shows scores, monthly impact, and which option keeps her cash flow healthy.',
    results:[
      {icon:'🏆',label:'Best Scenario',desc:'The option with the highest score and positive cash flow — that\'s your target.'},
      {icon:'📊',label:'Side-by-side',desc:'EMI, net cash, and score for all 3 options in one view.'},
      {icon:'📄',label:'PDF Report',desc:'Download a professional report to share with your bank or accountant.'}
    ],
    tip:'Use this before walking into a bank — you\'ll know exactly what loan terms to ask for.'
  },
  'cashRunway.test.html':{
    title:'Cash Runway', icon:'⏱',
    what:'How many months can your business survive if revenue drops or stops? This uses your current savings (cash reserve) to calculate your "survival window." Like fuel in a tank — how far can you go?',
    example:'James has $1,000 saved. His monthly costs are $4,000. If his market had no sales for a month, he\'d run out of money in about 1 week. Dangerously low — he needs a much bigger safety cushion.',
    results:[
      {icon:'✅',label:'6+ months',desc:'Strong safety net. Your business can handle emergencies or slow periods.'},
      {icon:'⚠️',label:'3–6 months',desc:'Acceptable but build more. Aim for at least 3 months of expenses saved.'},
      {icon:'🚨',label:'Under 3 months',desc:'High risk. One bad month could mean missing payments or closing temporarily.'}
    ],
    tip:'Before taking any loan, build your cash reserve to at least 2 months of expenses first.'
  },
  'breakEven.test.html':{
    title:'Break-Even Analyzer', icon:'⚖',
    what:'The minimum monthly sales your business needs to cover ALL costs — including your new loan payment. If your sales are below this number, your business is losing money every month.',
    example:'Sarah\'s boutique costs $5,800/month to run. A $30K loan adds $700/month. New break-even = $6,500/month. She makes $8,500 — so she has $2,000 of breathing room. That\'s a healthy cushion.',
    results:[
      {icon:'✅',label:'Sales above break-even',desc:'You cover all costs. The loan is manageable given your current revenue.'},
      {icon:'⚠️',label:'Close to break-even',desc:'A small revenue dip could mean losses. Try reducing other costs first.'},
      {icon:'🚨',label:'Sales below break-even',desc:'You\'re already losing money — adding a loan makes it worse.'}
    ],
    tip:'If your break-even is more than 90% of your current sales, the loan amount is too high for your business right now.'
  },
  'loanEligibility.test.html':{
    title:'Loan Eligibility Check', icon:'✅',
    what:'Shows which lenders would likely approve your application based on your revenue, business age, and cash flow — before you waste time applying and getting rejected.',
    example:'Marcus has been in business 4 years, earns $22K/month. This tool shows he likely qualifies for SBA 7(a), Funding Circle, and BlueVine — but probably not Kiva, which is for micro-businesses under $50K revenue.',
    results:[
      {icon:'✅',label:'Likely to Qualify',desc:'Your numbers meet this lender\'s known requirements. Apply with confidence.'},
      {icon:'🟡',label:'Maybe',desc:'You meet some criteria but not all. Worth applying but manage expectations.'},
      {icon:'❌',label:'Unlikely',desc:'Your business doesn\'t meet key criteria yet. Focus on improving those areas first.'}
    ],
    tip:'A "Likely" result is not a guarantee — lenders have final say. But it saves you from pointless rejections.'
  },
  'grantFinder.test.html':{
    title:'Grant Finder', icon:'🎯',
    what:'Grants are FREE money — you don\'t pay them back. This matches you to grants based on your industry, state, business age, and owner type (woman, veteran, minority-owned, etc.).',
    example:'Sarah is a woman-owned retail business in New York, 2 years old. The Grant Finder shows she qualifies for the Amber Grant (women-owned businesses) and several NY state small business programs.',
    results:[
      {icon:'🎯',label:'Matched Grants',desc:'Best-fit grants based on your exact profile — apply for these first.'},
      {icon:'🔍',label:'Near Matches',desc:'You meet most but not all criteria — worth reviewing individually.'},
      {icon:'📋',label:'Application Checklist',desc:'Documents you\'ll need ready before applying to each grant.'}
    ],
    tip:'Apply for grants BEFORE taking a loan — free money reduces how much you need to borrow and pay interest on.'
  },
  'forecastPro.test.html':{
    title:'Revenue Forecast', icon:'📈',
    what:'Uses your past revenue to predict what your business will earn over the next 12 months. Helps you plan: will you have enough cash to cover loan payments even in your slowest months?',
    example:'Marcus\'s IT business grows about 8% per year. The forecast shows revenue in month 12 = $23,800. His $2,000 EMI is covered even at the lowest predicted month — safe to proceed with the loan.',
    results:[
      {icon:'📈',label:'Growing trend',desc:'Revenue increasing — good time to expand with a loan.'},
      {icon:'➡️',label:'Stable trend',desc:'Revenue flat. Loan is manageable but don\'t over-borrow.'},
      {icon:'📉',label:'Declining trend',desc:'Revenue dropping — fix the cause before adding loan obligations.'}
    ],
    tip:'Check if your loan EMI is covered even during the lowest forecast month — not just the average.'
  },
  'aiCfoChat.test.html':{
    title:'AI CFO Advisor', icon:'🤖',
    what:'A CFO is the financial expert every big corporation has. This AI gives you the same level of advice — ask any money question about your business and get a clear, jargon-free answer instantly.',
    example:'James types: "I want to take a $20,000 loan to buy more inventory. Good idea?" The AI checks his numbers and replies: "Your cash reserve is too low. Build it to $3,000 first — then this loan becomes low risk."',
    results:[
      {icon:'💬',label:'Plain-English answers',desc:'No jargon. Just clear advice based on your actual business numbers.'},
      {icon:'⚡',label:'Available 24/7',desc:'No need to wait for an accountant — get answers any time.'},
      {icon:'🎯',label:'Personalised to you',desc:'Advice based on your specific profile, not generic tips.'}
    ],
    tip:'Try asking: "What is the single most important thing I should fix in my finances right now?"'
  },
  'benchmarkPro.test.html':{
    title:'Industry Benchmarks', icon:'📊',
    what:'Shows how your business compares to others in your industry. Are your expenses too high? Profit margin below average? This tells you exactly where you stand against your competition.',
    example:'Sarah\'s boutique has a 32% profit margin. Fashion retail average is 40%. This means she\'s spending more relative to sales than most boutiques — likely in supplier or rent costs.',
    results:[
      {icon:'🟢',label:'Above industry average',desc:'You\'re outperforming your peers — keep doing what works.'},
      {icon:'🟡',label:'At industry average',desc:'You\'re on par. Look for one metric to improve to get ahead.'},
      {icon:'🔴',label:'Below industry average',desc:'There\'s a gap. Focus on the highlighted metric first — it has the highest impact.'}
    ],
    tip:'Even a 5% improvement in profit margin above the industry average can mean thousands of extra dollars per year.'
  },
  'financialStatements.test.html':{
    title:'Financial Statements', icon:'📄',
    what:'Generates the 3 official financial documents banks and accountants require: P&L (did you make money?), Balance Sheet (what do you own vs. owe?), and Cash Flow Statement (where did your money come and go?).',
    example:'When Marcus applies for an SBA loan, the bank asks for 2 years of statements. This tool generates them from his numbers in minutes — saving hours of accountant time and cost.',
    results:[
      {icon:'📋',label:'P&L Statement',desc:'Shows if your business made or lost money in a period — income minus all expenses.'},
      {icon:'⚖',label:'Balance Sheet',desc:'What you own (assets) vs. what you owe (liabilities) — your business\'s net worth.'},
      {icon:'💰',label:'Cash Flow Statement',desc:'Where your money actually came from and where it went — different from profit.'}
    ],
    tip:'Banks look at these before approving any loan. Having them ready in advance speeds up your application significantly.'
  },
  'caExport.test.html':{
    title:'CPA Export Pack', icon:'📤',
    what:'Packages all your financial data into a neat summary you can hand to your accountant or tax advisor. Saves time explaining your numbers and reduces your accounting bill.',
    example:'Lisa prepares taxes for a client. Instead of sorting through a folder of receipts, the client exports a clean FinWise summary. Lisa has everything needed in minutes — the client saves 1–2 hours of billable time.',
    results:[
      {icon:'📦',label:'Complete package',desc:'All key numbers, statements, and loan analysis in one clean file.'},
      {icon:'🖨',label:'Print or email ready',desc:'Professional formatting for sharing with your accountant or bank.'},
      {icon:'✅',label:'Transparent calculations',desc:'Every number is explained — no black boxes your accountant has to question.'}
    ],
    tip:'Do this before your annual tax appointment to save on accountant fees — come prepared, not reactive.'
  },
  'ownersPay.test.html':{
    title:"Owner's Pay Optimizer", icon:'💸',
    what:'Many business owners pay themselves too much (draining the business) or too little (struggling personally). This finds the safe amount you can take home without hurting your business finances.',
    example:'Marcus wants to pay himself $6,500/month. This tool checks his cash flow and says: Moderate pay = $5,800 — he\'s slightly over the safe limit. Taking $6,500 leaves almost no buffer for emergencies.',
    results:[
      {icon:'🟢',label:'Conservative Pay',desc:'Safest option — keeps maximum cash in the business for growth or emergencies.'},
      {icon:'🟡',label:'Moderate Pay',desc:'Balanced — fair personal income while keeping the business financially healthy.'},
      {icon:'🔴',label:'Aggressive Pay',desc:'Maximum take-home — leaves little cushion if revenue drops even slightly.'}
    ],
    tip:'During the first 2 years of a loan, stick to Conservative or Moderate pay to protect your cash flow.'
  },
  'debtConsolidation.test.html':{
    title:'Debt Consolidation Analyzer', icon:'🔄',
    what:'If you have multiple loans, this checks whether combining them into ONE loan reduces your monthly payments and total interest. Sometimes it helps — sometimes it doesn\'t. This shows you which.',
    example:'James pays 3 loans: $300 + $200 + $150 = $650/month. A consolidated loan might drop this to $480/month AND save $8,000 in total interest. This tool does that math instantly.',
    results:[
      {icon:'✅',label:'Consolidation saves money',desc:'Lower monthly payment AND less total interest — definitely worth doing.'},
      {icon:'⚠️',label:'Mixed result',desc:'Lower monthly payment but more total interest paid — or vice versa. Consider your priority.'},
      {icon:'❌',label:'Consolidation costs more',desc:'Your current loans are better. Don\'t consolidate — it would cost you more.'}
    ],
    tip:'Lower monthly payment = better short-term cash flow. Lower total interest = better long-term. You may have to choose one.'
  },
  'businessHealthScore.test.html':{
    title:'Business Health Score', icon:'🏆',
    what:'Gives your business an overall grade — A to F — across 6 financial measures. Like a school report card for your finances. Shows instantly what\'s healthy and what needs fixing.',
    example:'Sarah\'s boutique gets a B. Her profit margin (A) and cash buffer (B) are strong, but her current ratio (C) is weak — she owes more relative to assets than ideal. The score card shows what to fix first.',
    results:[
      {icon:'🅰',label:'A — Excellent',desc:'Finances in top shape. You\'re well-positioned to grow or borrow safely.'},
      {icon:'🅱',label:'B — Good',desc:'Healthy business with minor areas to improve. Loan-ready.'},
      {icon:'🅲',label:'C — Fair',desc:'Some weaknesses. Fix highlighted areas before taking on more debt.'},
      {icon:'🅳',label:'D / F — Weak',desc:'Urgent attention needed. Focus on cutting costs and building cash reserves first.'}
    ],
    tip:'Aim for a B or above before applying for any loan. Banks evaluate the same 6 metrics.'
  },
  'advisorDashboard.test.html':{
    title:'Advisor Dashboard', icon:'👥',
    what:'For financial advisors and CPAs: see all your clients\' risk scores in one place, run analyses, and manage their financial health — without switching between tools or spreadsheets.',
    example:'Lisa has 5 clients. The dashboard shows Tony\'s Diner is RISKY (needs a call today) while GreenLeaf Organics is SAFE (routine check-in). She instantly knows where to focus her time.',
    results:[
      {icon:'🔴',label:'High Risk clients',desc:'Need immediate attention — flag for review and schedule a call.'},
      {icon:'🟡',label:'Medium Risk clients',desc:'Monitor monthly — send a check-in or risk summary email.'},
      {icon:'🟢',label:'Low Risk clients',desc:'Healthy — routine quarterly check-ins are sufficient.'}
    ],
    tip:'Sort by Risk Score every Monday morning to quickly identify which clients need action this week.'
  },
  'brandedReport.test.html':{
    title:'Branded Client Report', icon:'📝',
    what:'Generates a professional PDF report with YOUR firm\'s name and logo — not FinWise\'s. You give this to clients as your own advisory document. Builds trust and looks 100% professional.',
    example:'Lisa prepares a loan readiness report for Tony\'s Diner. The PDF shows "Chen & Associates — Certified Financial Advisors" at the top. Tony sees professional advice from his CPA, not a generic tool.',
    results:[
      {icon:'🏷',label:'Your brand on it',desc:'Your name, firm, and contact details — fully customisable white-label output.'},
      {icon:'📊',label:'Full client analysis',desc:'Loan score, health metrics, recommendations — all in one clean document.'},
      {icon:'🖨',label:'Print or email ready',desc:'Professional layout suitable for client meetings or email delivery.'}
    ],
    tip:'Send branded reports before client meetings — they\'ll come to the call having already read the analysis.'
  },
  'clientRiskEmail.test.html':{
    title:'Client Risk Email', icon:'📧',
    what:'Generates a ready-to-send professional email summarising your client\'s financial risk, their key numbers, and your recommendation. Takes 30 seconds instead of 30 minutes.',
    example:'Lisa runs a risk check on Metro Electronics: RISKY. She clicks Generate Email — it writes a professional note explaining the numbers, the risk, and recommending they delay their loan application by 3 months.',
    results:[
      {icon:'📧',label:'Ready-to-send email',desc:'Professional format — just review, personalise if needed, and send.'},
      {icon:'📋',label:'All metrics included',desc:'Revenue, expenses, EMI, debt coverage, cash runway — explained in plain terms.'},
      {icon:'✅',label:'Clear recommendation',desc:'SAFE / RISKY / DANGEROUS verdict with specific next steps for the client.'}
    ],
    tip:'Personalise the "Additional Notes" field to make each email feel like personal advice, not a form letter.'
  },
  'referralTracker.test.html':{
    title:'Referral Tracker', icon:'🔗',
    what:'Tracks which clients you\'ve referred to which lenders and shows your estimated commission at each stage. Keeps your referral pipeline organised so nothing falls through the cracks.',
    example:'Lisa referred 3 clients to Funding Circle. Two are "Applied," one is "Funded." The tracker shows estimated earnings of $1,300 and reminds her the other two need a follow-up call.',
    results:[
      {icon:'🔗',label:'Referred',desc:'You\'ve made the introduction between your client and the lender.'},
      {icon:'📋',label:'Applied',desc:'Client has submitted their application — follow up with the lender.'},
      {icon:'✅',label:'Funded',desc:'Loan approved and money disbursed — commission milestone reached.'}
    ],
    tip:'Follow up with lenders every 2 weeks for clients at "Applied" stage — timely nudges improve approval rates.'
  }
};

/* ══════════════════════════════════════════
   2. GLOSSARY TERMS (Option C)
══════════════════════════════════════════ */
var GLOSSARY = [
  {
    terms:['DSCR','Debt Service Coverage Ratio','Debt Coverage Ratio'],
    plain:'For every $1 you owe in loan payments, how much does your business earn?',
    example:'DSCR of 1.5 means you earn $1.50 for every $1 of loan payment.',
    safe:'1.25 or above is healthy',
    risk:'Below 1.0 means your income doesn\'t cover payments'
  },
  {
    terms:['Cash Runway'],
    plain:'How many months can your business survive if all revenue stopped tomorrow?',
    example:'$12,000 savings ÷ $4,000/month costs = 3 months runway.',
    safe:'6+ months is a strong safety net',
    risk:'Under 2 months is a financial emergency'
  },
  {
    terms:['Break-Even','Break Even'],
    plain:'The minimum monthly sales needed to cover ALL your costs — zero profit, zero loss.',
    example:'If your costs are $6,500/month, you must sell at least $6,500 to break even.',
    safe:'Your sales should be 20%+ above break-even',
    risk:'If you\'re near or below break-even, a loan makes things worse'
  },
  {
    terms:['EMI','Equated Monthly Instalment'],
    plain:'The fixed amount you pay your lender every month — part loan repayment, part interest fee.',
    example:'A $30,000 loan at 12% for 4 years = about $790/month EMI.',
    safe:'EMI should be under 30% of your monthly revenue',
    risk:'EMI above 40% of revenue = high financial stress'
  },
  {
    terms:['Cash Flow','Net Cash Flow'],
    plain:'Money coming into your business minus money going out — what\'s left at the end of the month.',
    example:'Revenue $10,000 – Expenses $7,000 – Loan $1,500 = Cash Flow $1,500.',
    safe:'Positive cash flow means your business is self-sustaining',
    risk:'Negative cash flow means you\'re spending more than you earn'
  },
  {
    terms:['Profit Margin'],
    plain:'What percentage of your sales turns into actual profit after all costs.',
    example:'Revenue $10,000 – Costs $8,000 = $2,000 profit = 20% margin.',
    safe:'Above 15% is healthy for most small businesses',
    risk:'Under 5% means almost nothing is left — very vulnerable'
  },
  {
    terms:['Cash Reserve','Cash Buffer'],
    plain:'Money set aside in your business account for emergencies — your financial safety net.',
    example:'3 months of expenses saved = strong safety net.',
    safe:'Aim for 3–6 months of total monthly expenses in reserve',
    risk:'Under 1 month = one bad week could cause you to miss payments'
  },
  {
    terms:['Stress Test'],
    plain:'What happens to your finances if revenue drops by 20% or 30%? This tests the worst-case.',
    example:'If your revenue drops 25%, can you still pay your EMI and expenses? A stress test answers this.',
    safe:'If you pass a 20% revenue drop test, your loan is low risk',
    risk:'If you fail at even a 10% drop, the loan is dangerous for your business'
  },
  {
    terms:['Collateral'],
    plain:'Something valuable you pledge to the lender — if you can\'t repay, they take this asset.',
    example:'A car, equipment, or property used as collateral. If you default, the lender can seize it.',
    safe:'Only pledge collateral you can afford to lose',
    risk:'Most SBA loans require collateral — check before applying'
  },
  {
    terms:['Amortization','Amortisation'],
    plain:'The process of paying off your loan gradually through regular monthly payments over time.',
    example:'A 3-year loan amortizes (shrinks) to zero over 36 monthly payments.',
    safe:'Early in the loan, most payment goes to interest — later, more goes to principal',
    risk:'Prepaying early can save significant interest — ask your lender about penalties'
  },
  {
    terms:['Debt-to-Equity','Debt to Equity'],
    plain:'How much your business owes compared to what it owns. High ratio = heavy debt load.',
    example:'$50,000 in loans ÷ $100,000 in net assets = 0.5x debt-to-equity. Under 1x is healthy.',
    safe:'Below 1x is manageable for most small businesses',
    risk:'Above 2x means debt significantly exceeds equity — risky for lenders'
  },
  {
    terms:['Current Ratio'],
    plain:'Can your business pay its short-term bills? Compares what you own to what you owe right now.',
    example:'$40,000 in assets ÷ $20,000 in liabilities = 2.0 current ratio.',
    safe:'Above 1.5 means you can comfortably cover short-term obligations',
    risk:'Below 1.0 means you can\'t cover immediate bills — financial distress territory'
  },
  {
    terms:['Principal'],
    plain:'The original amount of money you borrowed — not including interest.',
    example:'You borrow $30,000 (principal). Over time you also pay interest on top of returning this $30,000.',
    safe:'Principal reduces with every payment you make',
    risk:'Interest-only loans don\'t reduce principal — avoid these if possible'
  },
  {
    terms:['Debt Coverage','Debt Service'],
    plain:'Your ability to make loan payments using your business earnings.',
    example:'If you earn $5,000/month and your total loan payments are $2,000, your debt coverage is solid.',
    safe:'Earnings should cover loan payments with at least 25% to spare',
    risk:'Barely covering payments = no room for any unexpected expense'
  }
];

/* ══════════════════════════════════════════
   3. DETECT CURRENT PAGE
══════════════════════════════════════════ */
var currPage = window.location.pathname.split('/').pop();
var coachData = COACH[currPage] || null;

/* ══════════════════════════════════════════
   4. CSS
══════════════════════════════════════════ */
var css = [
/* Floating help button */
'.fh-fab{position:fixed;bottom:22px;right:22px;z-index:8000;width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#0891b2);color:#fff;border:none;cursor:pointer;font-size:1.3rem;box-shadow:0 4px 18px rgba(124,58,237,.4);display:flex;align-items:center;justify-content:center;transition:transform .15s;font-family:Arial,sans-serif}',
'.fh-fab:hover{transform:scale(1.1)}',
'.fh-fab-label{position:absolute;right:58px;background:#1e293b;color:#fff;font-size:.7rem;font-weight:700;padding:4px 10px;border-radius:6px;white-space:nowrap;opacity:0;pointer-events:none;transition:opacity .2s}',
'.fh-fab:hover .fh-fab-label{opacity:1}',
/* Coach panel overlay */
'.fh-overlay{display:none;position:fixed;inset:0;background:rgba(15,23,42,.5);z-index:8500;backdrop-filter:blur(2px)}',
'.fh-overlay.open{display:block}',
/* Coach panel */
'.fh-panel{position:fixed;bottom:0;right:0;z-index:8600;width:380px;max-width:100vw;background:#fff;border-radius:18px 18px 0 0;box-shadow:0 -8px 40px rgba(0,0,0,.2);transform:translateY(100%);transition:transform .28s cubic-bezier(.4,0,.2,1);font-family:Arial,sans-serif;max-height:88vh;display:flex;flex-direction:column}',
'.fh-panel.open{transform:translateY(0)}',
'@media(max-width:420px){.fh-panel{width:100vw;border-radius:16px 16px 0 0}}',
/* Panel header */
'.fh-hd{background:linear-gradient(135deg,#7c3aed,#0891b2);padding:16px 18px 14px;border-radius:18px 18px 0 0;display:flex;align-items:center;gap:10px;flex-shrink:0}',
'.fh-hd-icon{font-size:1.5rem}',
'.fh-hd-text{flex:1}',
'.fh-hd-title{font-size:.95rem;font-weight:800;color:#fff;line-height:1.2}',
'.fh-hd-sub{font-size:.68rem;color:rgba(255,255,255,.75);margin-top:2px}',
'.fh-close{background:rgba(255,255,255,.18);border:none;color:#fff;width:28px;height:28px;border-radius:50%;cursor:pointer;font-size:.9rem;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-family:Arial,sans-serif}',
'.fh-close:hover{background:rgba(255,255,255,.32)}',
/* Panel body */
'.fh-body{overflow-y:auto;flex:1}',
'.fh-sec{padding:14px 18px;border-bottom:1px solid #f1f5f9}',
'.fh-sec:last-child{border-bottom:none}',
'.fh-sec-label{font-size:.62rem;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:#7c3aed;margin-bottom:8px}',
'.fh-what{font-size:.84rem;color:#1e293b;line-height:1.6}',
'.fh-example-box{background:#f0fdf4;border-left:3px solid #16a34a;border-radius:0 8px 8px 0;padding:10px 12px;margin-top:8px;font-size:.8rem;color:#166534;line-height:1.6}',
'.fh-example-box strong{display:block;font-size:.65rem;text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px;color:#15803d}',
'.fh-results{display:flex;flex-direction:column;gap:6px}',
'.fh-result-row{display:flex;align-items:flex-start;gap:8px;padding:6px 8px;border-radius:7px;background:#f8fafc;font-size:.78rem;color:#1e293b}',
'.fh-result-icon{flex-shrink:0;font-size:1rem;line-height:1.4}',
'.fh-result-label{font-weight:800;margin-bottom:1px;font-size:.76rem}',
'.fh-result-desc{color:#475569;font-size:.74rem;line-height:1.4}',
'.fh-tip-box{background:#fef9c3;border-left:3px solid #f59e0b;border-radius:0 8px 8px 0;padding:10px 12px;font-size:.8rem;color:#92400e;line-height:1.6}',
'.fh-tip-box strong{display:block;font-size:.65rem;text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px;color:#b45309}',
/* Glossary underlines */
'.fw-term{border-bottom:1.5px dotted #7c3aed;cursor:help;color:inherit;position:relative}',
/* Glossary tooltip */
'.fw-tooltip{position:fixed;background:#1e293b;color:#fff;border-radius:10px;padding:12px 14px;width:240px;font-size:.76rem;line-height:1.5;font-family:Arial,sans-serif;z-index:9500;box-shadow:0 8px 28px rgba(0,0,0,.3);pointer-events:none}',
'.fw-tooltip-title{font-weight:800;font-size:.82rem;margin-bottom:6px;color:#a5b4fc}',
'.fw-tooltip-plain{margin-bottom:6px;color:#e2e8f0}',
'.fw-tooltip-ex{font-size:.72rem;color:#94a3b8;margin-bottom:6px;font-style:italic}',
'.fw-tooltip-meta{display:flex;flex-direction:column;gap:3px}',
'.fw-tt-safe{font-size:.7rem;color:#4ade80}',
'.fw-tt-risk{font-size:.7rem;color:#f87171}',
'.fw-tooltip-arrow{position:absolute;bottom:-7px;left:20px;width:14px;height:7px;overflow:hidden}',
'.fw-tooltip-arrow::after{content:"";position:absolute;top:-7px;left:2px;width:10px;height:10px;background:#1e293b;transform:rotate(45deg)}'
].join('');

var styleEl = document.createElement('style');
styleEl.textContent = css;
document.head.appendChild(styleEl);

/* ══════════════════════════════════════════
   5. BUILD COACH PANEL
══════════════════════════════════════════ */
function buildCoach(){
  if(!coachData) return;

  /* FAB button */
  var fab = document.createElement('button');
  fab.className = 'fh-fab';
  fab.title = 'Help — What does this tool do?';
  fab.innerHTML = '<span class="fh-fab-label">💡 What is this?</span>💬';

  /* Overlay */
  var ov = document.createElement('div');
  ov.className = 'fh-overlay';
  ov.id = 'fhOverlay';

  /* Results HTML */
  var resHtml = coachData.results.map(function(r){
    return '<div class="fh-result-row">'+
      '<div class="fh-result-icon">'+r.icon+'</div>'+
      '<div><div class="fh-result-label">'+r.label+'</div>'+
      '<div class="fh-result-desc">'+r.desc+'</div></div></div>';
  }).join('');

  /* Panel */
  var panel = document.createElement('div');
  panel.className = 'fh-panel';
  panel.id = 'fhPanel';
  panel.innerHTML =
    '<div class="fh-hd">'+
      '<div class="fh-hd-icon">'+coachData.icon+'</div>'+
      '<div class="fh-hd-text">'+
        '<div class="fh-hd-title">'+coachData.title+'</div>'+
        '<div class="fh-hd-sub">Plain-English Guide — tap anywhere outside to close</div>'+
      '</div>'+
      '<button class="fh-close" id="fhClose">✕</button>'+
    '</div>'+
    '<div class="fh-body">'+
      '<div class="fh-sec">'+
        '<div class="fh-sec-label">📖 What does this tool do?</div>'+
        '<div class="fh-what">'+coachData.what+'</div>'+
        '<div class="fh-example-box"><strong>📍 Real Example</strong>'+coachData.example+'</div>'+
      '</div>'+
      '<div class="fh-sec">'+
        '<div class="fh-sec-label">📊 What do the results mean?</div>'+
        '<div class="fh-results">'+resHtml+'</div>'+
      '</div>'+
      '<div class="fh-sec">'+
        '<div class="fh-tip-box"><strong>💡 Pro Tip</strong>'+coachData.tip+'</div>'+
      '</div>'+
    '</div>';

  document.body.appendChild(fab);
  document.body.appendChild(ov);
  document.body.appendChild(panel);

  function openPanel(){
    panel.classList.add('open');
    ov.classList.add('open');
  }
  function closePanel(){
    panel.classList.remove('open');
    ov.classList.remove('open');
  }

  fab.addEventListener('click', openPanel);
  document.getElementById('fhClose').addEventListener('click', closePanel);
  ov.addEventListener('click', closePanel);
}

/* ══════════════════════════════════════════
   6. GLOSSARY UNDERLINES (Option C)
══════════════════════════════════════════ */
function buildGlossary(){
  /* Build lookup map: term string → glossary entry */
  var lookup = {};
  GLOSSARY.forEach(function(g){
    g.terms.forEach(function(t){
      lookup[t] = g;
    });
  });

  /* Sort terms longest-first to avoid partial replacement */
  var allTerms = Object.keys(lookup).sort(function(a,b){return b.length - a.length;});

  /* Build regex */
  var pattern = allTerms.map(function(t){
    return t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  }).join('|');
  var regex = new RegExp('\\b('+pattern+')\\b','g');

  /* Replaced term tracker — only first instance per term */
  var replaced = {};

  /* Tooltip element */
  var tip = document.createElement('div');
  tip.className = 'fw-tooltip';
  tip.style.display = 'none';
  tip.innerHTML = '<div class="fw-tooltip-arrow"></div>';
  document.body.appendChild(tip);

  var tipTimeout;

  function showTip(el, g){
    clearTimeout(tipTimeout);
    tip.innerHTML =
      '<div class="fw-tooltip-title">'+g.terms[0]+'</div>'+
      '<div class="fw-tooltip-plain">'+g.plain+'</div>'+
      '<div class="fw-tooltip-ex">Example: '+g.example+'</div>'+
      '<div class="fw-tooltip-meta">'+
        '<span class="fw-tt-safe">✅ Safe: '+g.safe+'</span>'+
        '<span class="fw-tt-risk">⚠ Watch: '+g.risk+'</span>'+
      '</div>'+
      '<div class="fw-tooltip-arrow"></div>';
    tip.style.display = 'block';
    var rect = el.getBoundingClientRect();
    var tx = Math.min(rect.left, window.innerWidth - 260);
    var ty = rect.top - tip.offsetHeight - 10;
    if(ty < 8) ty = rect.bottom + 8;
    tip.style.left = Math.max(8, tx)+'px';
    tip.style.top  = ty+'px';
  }

  function hideTip(){
    tipTimeout = setTimeout(function(){ tip.style.display = 'none'; }, 200);
  }

  /* Walk text nodes — skip nav, scripts, inputs, already-processed */
  var SKIP = {SCRIPT:1,STYLE:1,NOSCRIPT:1,INPUT:1,TEXTAREA:1,SELECT:1,BUTTON:1,A:1};
  var SKIP_CLASS = ['fnav-bar','fnav-overlay','fnav-modal','fh-panel','fh-fab','fw-tooltip'];

  function isInsideSkip(node){
    var el = node.parentElement;
    while(el){
      if(SKIP[el.tagName]) return true;
      for(var i=0;i<SKIP_CLASS.length;i++){
        if(el.classList && el.classList.contains(SKIP_CLASS[i])) return true;
      }
      el = el.parentElement;
    }
    return false;
  }

  function processNode(textNode){
    if(!textNode.nodeValue || !regex.test(textNode.nodeValue)) return;
    regex.lastIndex = 0;
    var val = textNode.nodeValue;
    var frag = document.createDocumentFragment();
    var last = 0;
    var m;
    regex.lastIndex = 0;
    while((m = regex.exec(val)) !== null){
      var term = m[0];
      var g = lookup[term];
      if(!g) continue;
      /* Only underline first occurrence of each canonical term */
      var canonical = g.terms[0];
      if(replaced[canonical]){ continue; }
      replaced[canonical] = true;
      if(m.index > last){
        frag.appendChild(document.createTextNode(val.slice(last, m.index)));
      }
      var span = document.createElement('span');
      span.className = 'fw-term';
      span.textContent = term;
      span.title = g.terms[0]+' — tap for plain-English explanation';
      (function(s,gr){
        s.addEventListener('mouseenter', function(){ showTip(s, gr); });
        s.addEventListener('mouseleave', hideTip);
        s.addEventListener('click', function(e){
          e.stopPropagation();
          if(tip.style.display === 'none' || tip.style.display === ''){
            showTip(s, gr);
          } else {
            hideTip();
          }
        });
      })(span, g);
      frag.appendChild(span);
      last = m.index + term.length;
    }
    if(last < val.length){
      frag.appendChild(document.createTextNode(val.slice(last)));
    }
    if(frag.childNodes.length > 0 && last > 0){
      textNode.parentNode.replaceChild(frag, textNode);
    }
    regex.lastIndex = 0;
  }

  /* Use TreeWalker for performance */
  function scanDOM(){
    var walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      { acceptNode: function(node){
          if(isInsideSkip(node)) return NodeFilter.FILTER_REJECT;
          if(!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );
    var nodes = [];
    var n;
    while((n = walker.nextNode())) nodes.push(n);
    nodes.forEach(processNode);
  }

  document.addEventListener('click', function(){ hideTip(); });
  scanDOM();
}

/* ══════════════════════════════════════════
   7. INIT
══════════════════════════════════════════ */
function init(){
  buildCoach();
  buildGlossary();
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
})();
