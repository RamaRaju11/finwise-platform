/* ════════════════════════════════════════════════════════════════════
   COUNTRY DATA — BizSco Multi-Country Configuration
   All country-specific values: currency, lenders, schemes, pricing, taxes.
   Add new countries by appending entries here.
══════════════════════════════════════════════════════════════════════ */

const COUNTRY_DATA = {

  /* ───── USA (default) ───────────────────────────────────────── */
  us: {
    code: 'US', name: 'USA', flag: '🇺🇸', lang: 'en',
    currency: '$', currencyCode: 'USD', exchangeRate: 1.0,
    title: 'BizSco USA — Loan Safety & Cash Flow Engine',
    description: 'AI-powered Loan Decision Engine for US small businesses. Loan Safety Score in 60 seconds across SBA, BlueVine, OnDeck. Free, no sign-up.',
    brandSuffix: 'USA',
    nav: { live: '▶ Try Live', checkup: '🩺 Free Checkup', signIn: 'Sign In', cta: '⚡ Check Loan Risk Free →' },
    hero: {
      eyebrow: 'Analyze · Fund · Grow — 30 tools for small business owners',
      h1Line1: 'Will your next loan',
      h1Highlight: 'help or hurt',
      h1Line2: 'your business?',
      sub: 'Get a SAFE / RISKY / DANGEROUS verdict in 60 seconds — plus 29 more tools for cash flow, health score, grants, and AI-powered financial advice. Free. No sign-up.',
      cta1: '⚡ Find Out If Your Loan Is Safe',
      cta2: '▶ See All 30 Tools'
    },
    heroStats: { time: '60s', browser: '100%', tools: '30', cost: '$0' },
    heroCard: {
      brand: 'BizSco · Loan Score',
      revenue: '$15,000',
      expenses: '$8,500',
      loan: '$75,000 @ 12%',
      maxLoan: '$92,000',
      emi: '$2,490',
      netCash: '$4,010',
      verdict: '✅ SAFE TO BORROW'
    },
    trustBar: { grants: '🎯 Women · Minority · Veteran-owned grants included' },
    pricing: {
      free: { price: '$0', cta: 'Check Loan Risk Free' },
      survive: { price: '$9', cta: 'Get Survive — $9/mo →', schemes: '🎯 Grant & Scheme Finder (USA)' },
      scale: { price: '$29', cta: 'Get Scale — $29/mo →', advisor: '🤖 AI CFO Chat advisor' },
      advise: { price: '$79', cta: 'Get Advise — $79/mo →' }
    },
    lenders: 'SBA, BlueVine, OnDeck…',
    aiAdvisor: 'AI CFO',
    aiAdvisorLong: 'AI CFO Chat advisor',
    schemeName: 'Grant & Scheme',
    schemes: 'SBA 7(a), 504, Microloans, State Grants',
    entityTypes: ['Sole Proprietor', 'LLC', 'S-Corp', 'C-Corp'],
    revenueTiers: ['Under $5K', '$5K – $20K', '$20K – $50K', '$50K+'],
    taxes: {
      commandCenter: 'Tax Command Center (Income Tax + Deductions + Sales Tax + Contractors)',
      estimator: 'Tax Estimator',
      sales: 'Sales Tax Tracker',
      deductions: 'Key Deductions Calculator',
      payroll: 'Contractor & Payroll Tax (1099-NEC / FUTA / SUTA)'
    },
    testimonials: [
      { initials: 'SM', name: 'Sarah Mitchell', role: 'Boutique Owner · Survive Plan', badge: 'Loan Approved ✓', quote: 'My loan score went from 58 to 82 in six weeks. I knew exactly which numbers to fix because BizSco showed me the DSCR gap. The bank approved me on the first try.', metric: 'Loan Score 58 → 82', avatarBg: '#dbeafe', avatarColor: '#1e40af' },
      { initials: 'MJ', name: 'Marcus Johnson', role: 'IT Services · Scale Plan', badge: '6.8 Mo Runway ✓', quote: 'Cash runway was my blind spot. I thought I had plenty of buffer — BizSco calculated 2.4 months. I cut two expenses and pushed it to 6.8 months in a single afternoon.', metric: 'Runway 2.4 → 6.8 months', avatarBg: '#d1fae5', avatarColor: '#065f46' },
      { initials: 'LC', name: 'Lisa Chen', role: 'SMB Advisor · Advise Plan', badge: '3 Clients Funded ✓', quote: 'I\'m a bookkeeper and I now run every client through the Financial Checkup before their loan meetings. Three of my clients got approved last quarter after we fixed what BizSco flagged.', metric: '3 clients funded in Q1', avatarBg: '#fce7f3', avatarColor: '#9d174d' }
    ],
    before: ['Hours in Excel with no clear answer','Banker says "you qualify" — but for how much, safely?','No stress test — what if revenue drops?','No verdict — just numbers on a screen','Wrong loan taken, cash flow collapses in month 4','No action plan when things go wrong'],
    after: ['Fill profile once — all 30 tools auto-personalise','Loan Decision Score: SAFE / RISKY / DANGEROUS in 60s','Business Health Grade A–F across 6 metrics','Grants matched to your industry, state & owner category','Cash runway, break-even & owner\'s pay calculated instantly','Women / Minority / Veteran-owned categories recognised'],
    footerBrand: 'Analyze, Fund, Grow — 30 financial tools for small businesses. Loan safety, grants, health scores, AI CFO, forecasting, and advisor tools. 100% browser-based, no sign-up.'
  },

  /* ───── INDIA ───────────────────────────────────────────────── */
  in: {
    code: 'IN', name: 'India', flag: '🇮🇳', lang: 'en-IN',
    currency: '₹', currencyCode: 'INR', exchangeRate: 83.0,
    title: 'BizSco India — MSME Loan Safety & Cash Flow Engine',
    description: 'AI-powered Loan Decision Engine for Indian MSMEs. Check loan safety across SBI, HDFC, ICICI, MUDRA & NBFC offers in 60 seconds. Schemes: PMMY, CGTMSE, Stand-up India. Free, no sign-up.',
    brandSuffix: 'INDIA',
    nav: { live: '▶ Try Live', checkup: '🩺 Free Checkup', signIn: 'Sign In', cta: '⚡ Check Loan Risk Free →' },
    hero: {
      eyebrow: 'Built for Indian MSMEs · 30 tools · Made in India 🇮🇳',
      h1Line1: 'Will that MSME loan',
      h1Highlight: 'grow or break',
      h1Line2: 'your business?',
      sub: 'Get a SAFE / RISKY / DANGEROUS verdict in 60 seconds — across SBI, HDFC, ICICI, MUDRA & NBFC offers. Plus 29 more tools for cash flow, GST, schemes (PMMY, CGTMSE), and AI CA advice. Free. No sign-up.',
      cta1: '⚡ Check My Loan Safety',
      cta2: '▶ See All 30 Tools'
    },
    heroStats: { time: '60s', browser: '100%', tools: '30', cost: '₹0' },
    heroCard: {
      brand: 'BizSco · Loan Score',
      revenue: '₹12,50,000',
      expenses: '₹7,10,000',
      loan: '₹60,00,000 @ 11.5%',
      maxLoan: '₹75,00,000',
      emi: '₹1,32,500',
      netCash: '₹4,07,500',
      verdict: '✅ SAFE TO BORROW'
    },
    trustBar: { grants: '🎯 MUDRA · PMMY · CGTMSE · Stand-up India schemes included' },
    pricing: {
      free: { price: '₹0', cta: 'Check Loan Risk Free' },
      survive: { price: '₹499', cta: 'Get Survive — ₹499/mo →', schemes: '🎯 Scheme Finder — PMMY, CGTMSE, MUDRA, Stand-up India' },
      scale: { price: '₹1,499', cta: 'Get Scale — ₹1,499/mo →', advisor: '🤖 AI CA Chat advisor (GST, TDS, MSME)' },
      advise: { price: '₹3,999', cta: 'Get Advise — ₹3,999/mo →' }
    },
    lenders: 'SBI, HDFC, ICICI, MUDRA, NBFCs…',
    aiAdvisor: 'AI CA',
    aiAdvisorLong: 'AI CA Chat advisor (GST, TDS, MSME)',
    schemeName: 'Scheme',
    schemes: 'PMMY, CGTMSE, Stand-up India, MUDRA, SIDBI',
    entityTypes: ['Proprietorship', 'Partnership', 'LLP', 'Pvt Ltd'],
    revenueTiers: ['Under ₹5L', '₹5L – ₹20L', '₹20L – ₹50L', '₹50L+'],
    taxes: {
      commandCenter: 'Tax Command Center (Income Tax + GST + TDS + Professional Tax)',
      estimator: 'Income Tax Estimator (Old vs New regime)',
      sales: 'GST Tracker (CGST + SGST + IGST)',
      deductions: '80C / 80D / Section 35 Deductions',
      payroll: 'Contractor & Payroll (TDS / EPF / ESI / PT)'
    },
    testimonials: [
      { initials: 'PS', name: 'Priya Sharma', role: 'Boutique Owner, Bangalore · Survive Plan', badge: 'SBI Loan Approved ✓', quote: 'My loan score went from 58 to 82 in six weeks. I knew exactly which numbers to fix because BizSco showed me the DSCR gap. SBI approved my ₹50L loan on the first try.', metric: 'Loan Score 58 → 82', avatarBg: '#dbeafe', avatarColor: '#1e40af' },
      { initials: 'RK', name: 'Rahul Kumar', role: 'IT Services, Hyderabad · Scale Plan', badge: '6.8 Mo Runway ✓', quote: 'Cash runway was my blind spot. I thought I had plenty of buffer — BizSco calculated 2.4 months. I cut two expenses and pushed it to 6.8 months in a single afternoon.', metric: 'Runway 2.4 → 6.8 months', avatarBg: '#d1fae5', avatarColor: '#065f46' },
      { initials: 'AM', name: 'CA Anjali Mehta', role: 'MSME Advisor, Mumbai · Advise Plan', badge: '3 MUDRA Loans ✓', quote: 'I\'m a CA and now run every client through the Financial Checkup before their bank meetings. Three of my clients got MUDRA approvals last quarter after we fixed what BizSco flagged.', metric: '3 MUDRA loans approved in Q1', avatarBg: '#fce7f3', avatarColor: '#9d174d' }
    ],
    before: ['Hours in Excel with no clear answer','Bank RM says "you qualify" — but for how much, safely?','No stress test — what if GST collections drop?','No verdict — just numbers on a screen','Wrong loan taken, EMI eats your working capital','Missing out on MUDRA / CGTMSE / PMMY schemes'],
    after: ['Fill profile once — all 30 tools auto-personalise','Loan Decision Score: SAFE / RISKY / DANGEROUS in 60s','Business Health Grade A–F across 6 metrics','Schemes matched — PMMY, CGTMSE, Stand-up India, MUDRA','Cash runway, break-even & owner\'s pay calculated instantly','Women · SC/ST · MSME · Startup India recognised'],
    footerBrand: 'Made in India for Indian MSMEs — 30 financial tools. Loan safety across SBI/HDFC/ICICI/MUDRA, GST tools, government schemes (PMMY, CGTMSE), AI CA advisor, forecasting. 100% browser-based, no sign-up.'
  },

  /* ───── UNITED KINGDOM ──────────────────────────────────────── */
  uk: {
    code: 'UK', name: 'UK', flag: '🇬🇧', lang: 'en-GB',
    currency: '£', currencyCode: 'GBP', exchangeRate: 0.79,
    title: 'BizSco UK — SME Loan Safety & Cash Flow Engine',
    description: 'AI-powered Loan Decision Engine for UK SMEs. Loan Safety Score across Barclays, HSBC, Lloyds, NatWest, Funding Circle. Government schemes: Start Up Loans, Recovery Loan Scheme. Free.',
    brandSuffix: 'UK',
    nav: { live: '▶ Try Live', checkup: '🩺 Free Checkup', signIn: 'Sign In', cta: '⚡ Check Loan Risk Free →' },
    hero: {
      eyebrow: 'Built for UK SMEs · 30 tools · Made for Britain 🇬🇧',
      h1Line1: 'Will your next SME loan',
      h1Highlight: 'help or hurt',
      h1Line2: 'your business?',
      sub: 'Get a SAFE / RISKY / DANGEROUS verdict in 60 seconds — across Barclays, HSBC, Lloyds, NatWest & Funding Circle. Plus 29 more tools for cash flow, VAT, Start Up Loans, and AI advice. Free. No sign-up.',
      cta1: '⚡ Check My Loan Safety',
      cta2: '▶ See All 30 Tools'
    },
    heroStats: { time: '60s', browser: '100%', tools: '30', cost: '£0' },
    heroCard: {
      brand: 'BizSco · Loan Score',
      revenue: '£12,000',
      expenses: '£6,800',
      loan: '£60,000 @ 9.5%',
      maxLoan: '£75,000',
      emi: '£1,990',
      netCash: '£3,210',
      verdict: '✅ SAFE TO BORROW'
    },
    trustBar: { grants: '🎯 Start Up Loans · Recovery Loan Scheme · British Business Bank' },
    pricing: {
      free: { price: '£0', cta: 'Check Loan Risk Free' },
      survive: { price: '£7', cta: 'Get Survive — £7/mo →', schemes: '🎯 Scheme Finder — Start Up Loans, Recovery Scheme, Innovate UK' },
      scale: { price: '£24', cta: 'Get Scale — £24/mo →', advisor: '🤖 AI Accountant Chat advisor (VAT, PAYE)' },
      advise: { price: '£64', cta: 'Get Advise — £64/mo →' }
    },
    lenders: 'Barclays, HSBC, Lloyds, NatWest, Funding Circle…',
    aiAdvisor: 'AI Accountant',
    aiAdvisorLong: 'AI Accountant Chat advisor (VAT, PAYE)',
    schemeName: 'Scheme',
    schemes: 'Start Up Loans, Recovery Loan Scheme, Innovate UK Grants',
    entityTypes: ['Sole Trader', 'Partnership', 'LLP', 'Ltd Company'],
    revenueTiers: ['Under £5K', '£5K – £20K', '£20K – £50K', '£50K+'],
    taxes: {
      commandCenter: 'Tax Command Center (Corporation Tax + VAT + PAYE + NI)',
      estimator: 'Corporation Tax Estimator',
      sales: 'VAT Tracker (Standard / Reduced / Zero rate)',
      deductions: 'Allowable Expenses & Capital Allowances',
      payroll: 'PAYE & National Insurance Calculator'
    },
    testimonials: [
      { initials: 'EW', name: 'Emma Williams', role: 'Boutique Owner, London · Survive Plan', badge: 'Lloyds Loan Approved ✓', quote: 'My loan score went from 58 to 82 in six weeks. BizSco showed me exactly which DSCR numbers to fix. Lloyds approved my £40K loan on the first try.', metric: 'Loan Score 58 → 82', avatarBg: '#dbeafe', avatarColor: '#1e40af' },
      { initials: 'JT', name: 'James Thompson', role: 'IT Services, Manchester · Scale Plan', badge: '6.8 Mo Runway ✓', quote: 'Cash runway was my blind spot. I thought I had plenty of buffer — BizSco calculated 2.4 months. I cut two expenses and pushed it to 6.8 months in a single afternoon.', metric: 'Runway 2.4 → 6.8 months', avatarBg: '#d1fae5', avatarColor: '#065f46' },
      { initials: 'OB', name: 'Olivia Brown ACA', role: 'SME Accountant, Edinburgh · Advise Plan', badge: '3 Start-Up Loans ✓', quote: 'I\'m a chartered accountant and now run every client through the Financial Checkup before their bank meetings. Three got Start Up Loans approved last quarter.', metric: '3 Start Up Loans approved in Q1', avatarBg: '#fce7f3', avatarColor: '#9d174d' }
    ],
    before: ['Hours in spreadsheets with no clear answer','Bank manager says "you qualify" — but for how much, safely?','No stress test — what if VAT collections drop?','No verdict — just numbers on a screen','Wrong loan taken, monthly repayments choke cash flow','Missing out on Start Up Loans / Recovery Scheme'],
    after: ['Fill profile once — all 30 tools auto-personalise','Loan Decision Score: SAFE / RISKY / DANGEROUS in 60s','Business Health Grade A–F across 6 metrics','Schemes matched — Start Up Loans, Recovery Scheme, Innovate UK','Cash runway, break-even & owner\'s pay calculated instantly','Women in Enterprise · Minority Business · Veteran-owned recognised'],
    footerBrand: 'Built for UK SMEs — 30 financial tools. Loan safety across Barclays/HSBC/Lloyds/NatWest, VAT tools, government schemes (Start Up Loans, Recovery), AI Accountant advisor, forecasting. 100% browser-based.'
  },

  /* ───── AUSTRALIA ───────────────────────────────────────────── */
  au: {
    code: 'AU', name: 'Australia', flag: '🇦🇺', lang: 'en-AU',
    currency: 'A$', currencyCode: 'AUD', exchangeRate: 1.55,
    title: 'BizSco Australia — Small Business Loan Safety Engine',
    description: 'AI-powered Loan Decision Engine for Australian small businesses. Loan Safety Score across CommBank, NAB, ANZ, Westpac, Prospa. Government grants: NEIS, Export Market Development Grants.',
    brandSuffix: 'AU',
    nav: { live: '▶ Try Live', checkup: '🩺 Free Checkup', signIn: 'Sign In', cta: '⚡ Check Loan Risk Free →' },
    hero: {
      eyebrow: 'Built for Aussie small businesses · 30 tools 🇦🇺',
      h1Line1: 'Will your next business loan',
      h1Highlight: 'help or hurt',
      h1Line2: 'your business?',
      sub: 'Get a SAFE / RISKY / DANGEROUS verdict in 60 seconds — across CommBank, NAB, ANZ, Westpac & Prospa. Plus 29 more tools for cash flow, GST, BAS, grants, and AI advice. Free. No sign-up.',
      cta1: '⚡ Check My Loan Safety',
      cta2: '▶ See All 30 Tools'
    },
    heroStats: { time: '60s', browser: '100%', tools: '30', cost: 'A$0' },
    heroCard: {
      brand: 'BizSco · Loan Score',
      revenue: 'A$22,000',
      expenses: 'A$13,000',
      loan: 'A$110,000 @ 10.5%',
      maxLoan: 'A$140,000',
      emi: 'A$3,650',
      netCash: 'A$5,350',
      verdict: '✅ SAFE TO BORROW'
    },
    trustBar: { grants: '🎯 NEIS · Export Market Grants · R&D Tax Incentive · Indigenous Business' },
    pricing: {
      free: { price: 'A$0', cta: 'Check Loan Risk Free' },
      survive: { price: 'A$13', cta: 'Get Survive — A$13/mo →', schemes: '🎯 Grant Finder — NEIS, EMDG, R&D Tax Incentive' },
      scale: { price: 'A$42', cta: 'Get Scale — A$42/mo →', advisor: '🤖 AI Accountant Chat advisor (BAS, GST)' },
      advise: { price: 'A$115', cta: 'Get Advise — A$115/mo →' }
    },
    lenders: 'CommBank, NAB, ANZ, Westpac, Prospa…',
    aiAdvisor: 'AI Accountant',
    aiAdvisorLong: 'AI Accountant Chat advisor (BAS, GST)',
    schemeName: 'Grant',
    schemes: 'NEIS, EMDG, R&D Tax Incentive, Indigenous Business Grants',
    entityTypes: ['Sole Trader', 'Partnership', 'Company (Pty Ltd)', 'Trust'],
    revenueTiers: ['Under A$8K', 'A$8K – A$30K', 'A$30K – A$80K', 'A$80K+'],
    taxes: {
      commandCenter: 'Tax Command Center (Income Tax + GST + BAS + PAYG)',
      estimator: 'Income Tax Estimator',
      sales: 'GST & BAS Tracker',
      deductions: 'Allowable Deductions & Instant Asset Write-Off',
      payroll: 'PAYG, Super & Payroll Tax Calculator'
    },
    testimonials: [
      { initials: 'CW', name: 'Chloe Walker', role: 'Café Owner, Melbourne · Survive Plan', badge: 'CommBank Loan ✓', quote: 'My loan score went from 58 to 82 in six weeks. BizSco showed me exactly which DSCR numbers to fix. CommBank approved my A$80K loan on the first try.', metric: 'Loan Score 58 → 82', avatarBg: '#dbeafe', avatarColor: '#1e40af' },
      { initials: 'LD', name: 'Liam Davis', role: 'Tradie Business, Brisbane · Scale Plan', badge: '6.8 Mo Runway ✓', quote: 'Cash runway was my blind spot. I thought I had plenty of buffer — BizSco calculated 2.4 months. I cut two expenses and pushed it to 6.8 months in a single afternoon.', metric: 'Runway 2.4 → 6.8 months', avatarBg: '#d1fae5', avatarColor: '#065f46' },
      { initials: 'GN', name: 'Grace Nguyen CPA', role: 'Tax Agent, Sydney · Advise Plan', badge: '3 Clients Funded ✓', quote: 'I\'m a CPA and now run every client through the Financial Checkup before their bank meetings. Three got approved last quarter after we fixed what BizSco flagged.', metric: '3 clients funded in Q1', avatarBg: '#fce7f3', avatarColor: '#9d174d' }
    ],
    before: ['Hours in spreadsheets with no clear answer','Bank says "you qualify" — but for how much, safely?','No stress test — what if BAS payments rise?','No verdict — just numbers on a screen','Wrong loan taken, repayments hurt cash flow','Missing out on NEIS / EMDG / R&D grants'],
    after: ['Fill profile once — all 30 tools auto-personalise','Loan Decision Score: SAFE / RISKY / DANGEROUS in 60s','Business Health Grade A–F across 6 metrics','Grants matched — NEIS, EMDG, R&D Tax Incentive','Cash runway, break-even & owner\'s pay calculated instantly','Women, Indigenous & First Nations business recognised'],
    footerBrand: 'Built for Aussie small businesses — 30 financial tools. Loan safety across CommBank/NAB/ANZ/Westpac, BAS & GST tools, grants (NEIS, EMDG), AI Accountant advisor. 100% browser-based.'
  },

  /* ───── CANADA ──────────────────────────────────────────────── */
  ca: {
    code: 'CA', name: 'Canada', flag: '🇨🇦', lang: 'en-CA',
    currency: 'C$', currencyCode: 'CAD', exchangeRate: 1.36,
    title: 'BizSco Canada — Small Business Loan Safety Engine',
    description: 'AI-powered Loan Decision Engine for Canadian small businesses. Loan Safety Score across RBC, TD, BMO, Scotiabank, CIBC, BDC. Government programs: CSBFP, IRAP, CEBA.',
    brandSuffix: 'CA',
    nav: { live: '▶ Try Live', checkup: '🩺 Free Checkup', signIn: 'Sign In', cta: '⚡ Check Loan Risk Free →' },
    hero: {
      eyebrow: 'Built for Canadian small businesses · 30 tools 🇨🇦',
      h1Line1: 'Will your next business loan',
      h1Highlight: 'help or hurt',
      h1Line2: 'your business?',
      sub: 'Get a SAFE / RISKY / DANGEROUS verdict in 60 seconds — across RBC, TD, BMO, Scotiabank, CIBC & BDC. Plus 29 more tools for cash flow, GST/HST, CSBFP, and AI advice. Free.',
      cta1: '⚡ Check My Loan Safety',
      cta2: '▶ See All 30 Tools'
    },
    heroStats: { time: '60s', browser: '100%', tools: '30', cost: 'C$0' },
    heroCard: {
      brand: 'BizSco · Loan Score',
      revenue: 'C$20,000',
      expenses: 'C$11,500',
      loan: 'C$100,000 @ 8.5%',
      maxLoan: 'C$125,000',
      emi: 'C$3,200',
      netCash: 'C$5,300',
      verdict: '✅ SAFE TO BORROW'
    },
    trustBar: { grants: '🎯 CSBFP · IRAP · CEBA · Women Entrepreneurship Strategy' },
    pricing: {
      free: { price: 'C$0', cta: 'Check Loan Risk Free' },
      survive: { price: 'C$12', cta: 'Get Survive — C$12/mo →', schemes: '🎯 Program Finder — CSBFP, IRAP, CEBA, BDC' },
      scale: { price: 'C$39', cta: 'Get Scale — C$39/mo →', advisor: '🤖 AI Accountant Chat advisor (GST/HST, T2)' },
      advise: { price: 'C$105', cta: 'Get Advise — C$105/mo →' }
    },
    lenders: 'RBC, TD, BMO, Scotiabank, CIBC, BDC…',
    aiAdvisor: 'AI Accountant',
    aiAdvisorLong: 'AI Accountant Chat advisor (GST/HST, T2)',
    schemeName: 'Program',
    schemes: 'CSBFP, IRAP, CEBA, Women Entrepreneurship Strategy, BDC',
    entityTypes: ['Sole Proprietor', 'Partnership', 'Corporation', 'Co-operative'],
    revenueTiers: ['Under C$7K', 'C$7K – C$25K', 'C$25K – C$65K', 'C$65K+'],
    taxes: {
      commandCenter: 'Tax Command Center (T2 + GST/HST + Payroll + WSIB)',
      estimator: 'Corporate Tax T2 Estimator',
      sales: 'GST/HST/QST Tracker',
      deductions: 'CCA & Small Business Deduction',
      payroll: 'CPP, EI & Payroll Tax Calculator'
    },
    testimonials: [
      { initials: 'AL', name: 'Aisha Lévesque', role: 'Boutique Owner, Toronto · Survive Plan', badge: 'RBC Loan Approved ✓', quote: 'My loan score went from 58 to 82 in six weeks. BizSco showed me exactly which DSCR numbers to fix. RBC approved my C$70K loan on the first try.', metric: 'Loan Score 58 → 82', avatarBg: '#dbeafe', avatarColor: '#1e40af' },
      { initials: 'DM', name: 'David MacDonald', role: 'IT Services, Vancouver · Scale Plan', badge: '6.8 Mo Runway ✓', quote: 'Cash runway was my blind spot. I thought I had plenty of buffer — BizSco calculated 2.4 months. I cut two expenses and pushed it to 6.8 months in a single afternoon.', metric: 'Runway 2.4 → 6.8 months', avatarBg: '#d1fae5', avatarColor: '#065f46' },
      { initials: 'SP', name: 'Sophie Patel CPA', role: 'Tax Advisor, Montreal · Advise Plan', badge: '3 CSBFP Loans ✓', quote: 'I\'m a CPA and now run every client through the Financial Checkup before their bank meetings. Three got CSBFP loans approved last quarter.', metric: '3 CSBFP loans approved in Q1', avatarBg: '#fce7f3', avatarColor: '#9d174d' }
    ],
    before: ['Hours in spreadsheets with no clear answer','Bank manager says "you qualify" — but for how much, safely?','No stress test — what if GST/HST collections drop?','No verdict — just numbers on a screen','Wrong loan taken, monthly repayments choke cash flow','Missing out on CSBFP / IRAP / CEBA programs'],
    after: ['Fill profile once — all 30 tools auto-personalise','Loan Decision Score: SAFE / RISKY / DANGEROUS in 60s','Business Health Grade A–F across 6 metrics','Programs matched — CSBFP, IRAP, CEBA, Women Entrepreneur','Cash runway, break-even & owner\'s pay calculated instantly','Women, Indigenous & Visible Minority business recognised'],
    footerBrand: 'Built for Canadian small businesses — 30 financial tools. Loan safety across RBC/TD/BMO/Scotiabank/CIBC/BDC, GST/HST tools, programs (CSBFP, IRAP), AI Accountant advisor. 100% browser-based.'
  },

  /* ───── SINGAPORE ───────────────────────────────────────────── */
  sg: {
    code: 'SG', name: 'Singapore', flag: '🇸🇬', lang: 'en-SG',
    currency: 'S$', currencyCode: 'SGD', exchangeRate: 1.34,
    title: 'BizSco Singapore — SME Loan Safety & Cash Flow Engine',
    description: 'AI-powered Loan Decision Engine for Singapore SMEs. Loan Safety Score across DBS, OCBC, UOB, Maybank, Standard Chartered. Government schemes: EFS, ESG Grants, PSG.',
    brandSuffix: 'SG',
    nav: { live: '▶ Try Live', checkup: '🩺 Free Checkup', signIn: 'Sign In', cta: '⚡ Check Loan Risk Free →' },
    hero: {
      eyebrow: 'Built for Singapore SMEs · 30 tools 🇸🇬',
      h1Line1: 'Will your next SME loan',
      h1Highlight: 'help or hurt',
      h1Line2: 'your business?',
      sub: 'Get a SAFE / RISKY / DANGEROUS verdict in 60 seconds — across DBS, OCBC, UOB, Maybank, StanChart. Plus 29 more tools for cash flow, GST, EFS, PSG grants, and AI advice. Free.',
      cta1: '⚡ Check My Loan Safety',
      cta2: '▶ See All 30 Tools'
    },
    heroStats: { time: '60s', browser: '100%', tools: '30', cost: 'S$0' },
    heroCard: {
      brand: 'BizSco · Loan Score',
      revenue: 'S$20,000',
      expenses: 'S$11,500',
      loan: 'S$100,000 @ 7.5%',
      maxLoan: 'S$125,000',
      emi: 'S$3,100',
      netCash: 'S$5,400',
      verdict: '✅ SAFE TO BORROW'
    },
    trustBar: { grants: '🎯 EFS · ESG Grants · PSG · Startup SG · TechHub' },
    pricing: {
      free: { price: 'S$0', cta: 'Check Loan Risk Free' },
      survive: { price: 'S$12', cta: 'Get Survive — S$12/mo →', schemes: '🎯 Grant Finder — EFS, ESG Grants, PSG, Startup SG' },
      scale: { price: 'S$39', cta: 'Get Scale — S$39/mo →', advisor: '🤖 AI Accountant Chat advisor (GST, IRAS)' },
      advise: { price: 'S$105', cta: 'Get Advise — S$105/mo →' }
    },
    lenders: 'DBS, OCBC, UOB, Maybank, StanChart…',
    aiAdvisor: 'AI Accountant',
    aiAdvisorLong: 'AI Accountant Chat advisor (GST, IRAS)',
    schemeName: 'Grant',
    schemes: 'EFS, ESG Grants, PSG, Startup SG Founder',
    entityTypes: ['Sole Proprietor', 'Partnership', 'LLP', 'Pte Ltd'],
    revenueTiers: ['Under S$7K', 'S$7K – S$25K', 'S$25K – S$65K', 'S$65K+'],
    taxes: {
      commandCenter: 'Tax Command Center (Corporate Tax + GST + CPF)',
      estimator: 'Corporate Tax Estimator (17% + rebates)',
      sales: 'GST Tracker (9% standard)',
      deductions: 'Allowable Deductions & Tax Incentives',
      payroll: 'CPF, Skills Levy & Payroll Calculator'
    },
    testimonials: [
      { initials: 'WL', name: 'Wei Ling', role: 'F&B Owner, Singapore · Survive Plan', badge: 'DBS Loan Approved ✓', quote: 'My loan score went from 58 to 82 in six weeks. BizSco showed me exactly which DSCR numbers to fix. DBS approved my S$80K loan on the first try.', metric: 'Loan Score 58 → 82', avatarBg: '#dbeafe', avatarColor: '#1e40af' },
      { initials: 'RT', name: 'Ravi Tan', role: 'Tech Startup, Singapore · Scale Plan', badge: '6.8 Mo Runway ✓', quote: 'Cash runway was my blind spot. I thought I had plenty of buffer — BizSco calculated 2.4 months. I cut two expenses and pushed it to 6.8 months in a single afternoon.', metric: 'Runway 2.4 → 6.8 months', avatarBg: '#d1fae5', avatarColor: '#065f46' },
      { initials: 'AC', name: 'Angeline Chan CA', role: 'SME Advisor, Singapore · Advise Plan', badge: '3 EFS Loans ✓', quote: 'I\'m a Chartered Accountant and now run every client through the Financial Checkup before their bank meetings. Three got EFS loans approved last quarter.', metric: '3 EFS loans approved in Q1', avatarBg: '#fce7f3', avatarColor: '#9d174d' }
    ],
    before: ['Hours in spreadsheets with no clear answer','Bank RM says "you qualify" — but for how much, safely?','No stress test — what if GST collections drop?','No verdict — just numbers on a screen','Wrong loan taken, monthly repayments choke cash flow','Missing out on EFS / PSG / ESG grants'],
    after: ['Fill profile once — all 30 tools auto-personalise','Loan Decision Score: SAFE / RISKY / DANGEROUS in 60s','Business Health Grade A–F across 6 metrics','Grants matched — EFS, ESG, PSG, Startup SG','Cash runway, break-even & owner\'s pay calculated instantly','Women & local SME ownership recognised'],
    footerBrand: 'Built for Singapore SMEs — 30 financial tools. Loan safety across DBS/OCBC/UOB/Maybank, GST tools, government schemes (EFS, ESG, PSG), AI Accountant advisor. 100% browser-based.'
  }
};

// Expose globally
if (typeof window !== 'undefined') window.COUNTRY_DATA = COUNTRY_DATA;
if (typeof module !== 'undefined') module.exports = COUNTRY_DATA;
