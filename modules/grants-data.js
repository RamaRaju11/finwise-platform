/* ═══════════════════════════════════════════════════════════════
   FinWise — USA Grant & Scheme Database
   Shared across: grantFinder.test.html, grants-usa-reference.html
   Last updated: April 2026
═══════════════════════════════════════════════════════════════ */

var GRANTS_CATALOG_DATE = '2026-04-27';

var GRANTS_USA = [

  /* ══════════════════════════════════════
     CATEGORY 1 — FEDERAL SBA LOANS
  ══════════════════════════════════════ */
  {
    id: 'sba_7a',
    name: 'SBA 7(a) Loan',
    category: 'Federal Loan',
    badge: 'Low Interest',
    badgeCol: 'amber',
    amount: 'Up to $5,000,000',
    rate: '~10–11% per year (Prime + 2.75%)',
    repay: 'Monthly EMI — up to 25 years',
    freeGrant: false,
    desc: 'Most popular SBA program. Government-backed loan through an approved bank. SBA guarantees 75–85% so banks approve more easily than conventional loans.',
    eli: {
      countries: ['USA'],
      industries: ['all'],
      minAge: 0,
      maxEmp: 500,
      maxRev: null,
      states: ['all'],
      requires: []
    },
    why: [
      'US-based for-profit small business',
      'Cannot obtain credit elsewhere on reasonable terms',
      'Owner has invested equity in the business',
      'No outstanding delinquencies to US government'
    ],
    docs: [
      'Business tax returns — last 3 years',
      'Personal tax returns for all owners — last 3 years',
      'Bank statements — last 6 months',
      'Detailed business plan with financial projections',
      'SBA Form 413 — Personal Financial Statement',
      'Current year P&L statement and Balance Sheet',
      'Business debt schedule (all existing loans)',
      'Business licenses and registrations',
      'Articles of incorporation or LLC operating agreement',
      'Collateral documentation (property, equipment)',
      'Ownership and affiliation information'
    ],
    ca: {
      need: true,
      role: 'CPA or SBA Loan Consultant',
      cost: '$500 – $2,000 one-time',
      help: [
        'Prepares financial statements in SBA-required format',
        'Writes or reviews the business plan',
        'Accurately completes SBA Form 413',
        'Coordinates with SBA-approved lender',
        'Advises on collateral presentation',
        'Significantly improves approval probability'
      ]
    },
    time: '2–3 weeks',
    diff: 'Medium',
    url: 'https://www.sba.gov/funding-programs/loans/7a-loans',
    tip: 'Government guarantees 75–85% of the loan — banks take less risk = easier approval than conventional. Best for working capital, equipment, or business purchase.'
  },

  {
    id: 'sba_504',
    name: 'SBA 504 Loan',
    category: 'Federal Loan',
    badge: 'Low Interest',
    badgeCol: 'amber',
    amount: 'Up to $5,500,000',
    rate: '~6–7% fixed long-term',
    repay: 'Monthly EMI — 10 to 25 years',
    freeGrant: false,
    desc: 'Long-term fixed-rate financing for major fixed assets — land, buildings, and heavy equipment. Requires only 10% down from borrower.',
    eli: {
      countries: ['USA'],
      industries: ['all'],
      minAge: 0,
      maxEmp: 500,
      maxRev: null,
      states: ['all'],
      requires: []
    },
    why: [
      'US for-profit business',
      'Tangible net worth under $20 million',
      'Average net income under $6.5 million after taxes',
      'Purchasing fixed assets — land, building, or heavy equipment'
    ],
    docs: [
      'Business tax returns — last 3 years',
      'Personal tax returns for all owners — last 3 years',
      'Interim financial statements (within 90 days)',
      'Business debt schedule',
      'Personal Financial Statement (SBA Form 413)',
      'Purchase agreement or letter of intent for the asset',
      'Property appraisal (as-is and post-improvement)',
      'Environmental assessment (if applicable)',
      'Business plan with projections',
      'Construction plans and timeline (if building)'
    ],
    ca: {
      need: true,
      role: 'CPA + Commercial Real Estate Consultant',
      cost: '$1,000 – $3,000 one-time',
      help: [
        'Prepares 3-year financial statements',
        'Coordinates with Certified Development Company (CDC)',
        'Navigates the dual-lender structure (bank + CDC)',
        'Handles property appraisal and environmental documentation',
        'Structures deal for maximum approval odds'
      ]
    },
    time: '4–6 weeks',
    diff: 'Medium-Hard',
    url: 'https://www.sba.gov/funding-programs/loans/504-loans',
    tip: 'Bank provides 50%, CDC provides 40%, you put in 10%. Best fixed rate available for long-term asset financing. Not for working capital.'
  },

  {
    id: 'sba_micro',
    name: 'SBA Microloan',
    category: 'Federal Loan',
    badge: 'Low Interest',
    badgeCol: 'amber',
    amount: 'Up to $50,000',
    rate: '8–13% per year',
    repay: 'Monthly EMI — up to 6 years',
    freeGrant: false,
    desc: 'Small loans for startups and growing businesses through SBA-approved nonprofit intermediaries. Often comes with free business training.',
    eli: {
      countries: ['USA'],
      industries: ['all'],
      minAge: 0,
      maxEmp: 500,
      maxRev: null,
      states: ['all'],
      requires: []
    },
    why: [
      'US-based small business or startup',
      'Cannot qualify for traditional bank financing',
      'Need under $50,000',
      'Not for real estate purchase or debt repayment'
    ],
    docs: [
      'Business plan (even a simple one-page plan)',
      'Bank statements — last 3–6 months',
      'Personal tax returns — last 2 years',
      'Business license',
      '12-month financial projections',
      'Collateral documentation (varies by intermediary)',
      'Personal identification'
    ],
    ca: {
      need: false,
      role: 'SCORE Mentor (FREE)',
      cost: 'Free via SCORE.org',
      help: [
        'Help write simple business plan at no cost',
        'Prepare basic financial projections',
        'Identify the right SBA intermediary lender in your area',
        'Free mentoring available through SBA SCORE program at score.org'
      ]
    },
    time: '1–2 weeks',
    diff: 'Easy',
    url: 'https://www.sba.gov/funding-programs/loans/microloans',
    tip: 'Comes with free business training and mentoring. Best starting point for new businesses who need a small amount to launch or grow.'
  },

  {
    id: 'sba_eidl',
    name: 'SBA EIDL — Economic Injury Disaster Loan',
    category: 'Federal Loan',
    badge: 'Emergency',
    badgeCol: 'red',
    amount: 'Up to $2,000,000',
    rate: '3.75% for businesses / 2.75% for nonprofits',
    repay: 'Monthly EMI — up to 30 years',
    freeGrant: false,
    desc: 'Emergency low-rate loans for businesses in federally declared disaster areas that have suffered economic injury.',
    eli: {
      countries: ['USA'],
      industries: ['all'],
      minAge: 0,
      maxEmp: 500,
      maxRev: null,
      states: ['all'],
      requires: []
    },
    why: [
      'Located in a federally declared disaster area',
      'Business has suffered substantial economic injury',
      'Cannot obtain credit elsewhere',
      'Small business as defined by SBA'
    ],
    docs: [
      'SBA Form 5 or 5C — Disaster Business Loan Application',
      'IRS Form 4506-T — Tax Information Authorization',
      'Federal income tax returns — most recent year',
      'SBA Form 2202 — Schedule of Liabilities',
      'SBA Form 413 — Personal Financial Statement',
      'Current year P&L statement',
      'Monthly sales figures for last 3 years',
      'Proof of location in disaster area',
      'Date of birth for every owner (required from 2025)'
    ],
    ca: {
      need: true,
      role: 'CPA or Disaster Loan Consultant',
      cost: '$300 – $800 one-time',
      help: [
        'Accurately documents and quantifies economic injury',
        'Completes SBA disaster forms correctly',
        'Calculates and justifies loan amount needed',
        'Speeds up the application process significantly'
      ]
    },
    time: '2–4 weeks after disaster declaration',
    diff: 'Medium',
    url: 'https://www.sba.gov/funding-programs/disaster-assistance/economic-injury-disaster-loans',
    tip: 'Only available after a federal disaster declaration. Check disasterloanassistance.sba.gov for currently declared areas. Extremely low rate — 3.75% is far below market.'
  },

  {
    id: 'sba_caplines',
    name: 'SBA CAPLines — Working Capital Line',
    category: 'Federal Loan',
    badge: 'Revolving Credit',
    badgeCol: 'blue',
    amount: 'Up to $5,000,000',
    rate: 'Prime + 2.75% (~10–11%)',
    repay: 'Revolving — draw and repay as needed',
    freeGrant: false,
    desc: 'Revolving credit line for businesses with seasonal or cyclical working capital needs. Draw money when needed, repay when revenue comes in.',
    eli: {
      countries: ['USA'],
      industries: ['all'],
      minAge: 1,
      maxEmp: 500,
      maxRev: null,
      states: ['all'],
      requires: []
    },
    why: [
      'US for-profit small business',
      'Short-term or cyclical working capital needs',
      'At least 1 year in business',
      'Has contracts, seasonal sales, or construction projects'
    ],
    docs: [
      'Business tax returns — last 3 years',
      'Personal tax returns — last 3 years',
      'Bank statements — last 12 months',
      'Accounts receivable and payable aging reports',
      'Existing contracts or purchase orders',
      'Business license',
      'SBA Form 413',
      'Business financial statements (P&L + Balance Sheet)'
    ],
    ca: {
      need: true,
      role: 'CPA or SBA Loan Specialist',
      cost: '$500 – $1,500 one-time',
      help: [
        'Structures the line for seasonal vs contract needs',
        'Prepares aging reports in required format',
        'Advises on which of 4 CAPLines products fits your business',
        'Coordinates with SBA-approved lender'
      ]
    },
    time: '3–4 weeks',
    diff: 'Medium',
    url: 'https://www.sba.gov/funding-programs/loans/7a-loans/types-7a-loans',
    tip: 'Four types: Seasonal, Contract, Builders, and Working Capital. Best for businesses with predictable cycles — retail, landscaping, construction, importers.'
  },

  {
    id: 'sba_export',
    name: 'SBA Export Working Capital Loan (EWCP)',
    category: 'Federal Loan',
    badge: 'Export',
    badgeCol: 'blue',
    amount: 'Up to $5,000,000',
    rate: 'Negotiated — below market',
    repay: 'Per transaction — up to 36 months',
    freeGrant: false,
    desc: 'Special financing for US businesses that export or plan to export products and services internationally.',
    eli: {
      countries: ['USA'],
      industries: ['all'],
      minAge: 1,
      maxEmp: 500,
      maxRev: null,
      states: ['all'],
      requires: []
    },
    why: [
      'US small business',
      'Currently exporting or has concrete export plan',
      'At least 1 year in business',
      'Needs capital specifically for export transactions'
    ],
    docs: [
      'Business tax returns — last 3 years',
      'Export sales contracts or confirmed purchase orders',
      'Bank statements — last 6 months',
      'Export plan or evidence of current export activity',
      'Personal Financial Statement',
      'Business financial statements'
    ],
    ca: {
      need: true,
      role: 'CPA + Export Trade Consultant',
      cost: '$500 – $2,000',
      help: [
        'Validates export documentation',
        'Structures the loan around specific export transactions',
        'Connects with US Export Assistance Center (free government resource)',
        'Advises on trade finance instruments like letters of credit'
      ]
    },
    time: '2–4 weeks',
    diff: 'Medium',
    url: 'https://www.sba.gov/funding-programs/loans/export-loan-programs',
    tip: 'Free help from US Export Assistance Centers in every state — visit export.gov for your nearest center before applying.'
  },

  /* ══════════════════════════════════════
     CATEGORY 2 — FEDERAL GRANTS (FREE)
  ══════════════════════════════════════ */
  {
    id: 'sbir_1',
    name: 'SBIR Phase 1 — Federal R&D Grant',
    category: 'Federal Grant',
    badge: 'FREE Grant',
    badgeCol: 'green',
    amount: 'Up to $323,000',
    rate: 'No repayment',
    repay: 'None — Free Grant',
    freeGrant: true,
    desc: 'America\'s largest grant program for innovative small businesses. Federal agencies fund R&D to prove your concept. No repayment ever. Reauthorised through 2031.',
    eli: {
      countries: ['USA'],
      industries: ['technology', 'biotech', 'science', 'software', 'healthcare', 'energy', 'defense', 'engineering', 'manufacturing'],
      minAge: 0,
      maxEmp: 500,
      maxRev: null,
      states: ['all'],
      requires: []
    },
    why: [
      '51%+ US-owned and operated',
      'Under 500 employees',
      'Technology, science, innovation, or advanced manufacturing business',
      'R&D idea aligned with a participating federal agency priority',
      'Principal Investigator primarily employed by the company'
    ],
    docs: [
      'Technical research proposal (15–20 pages)',
      'SAM.gov registration — Unique Entity Identifier (UEI)',
      'Detailed budget justification and breakdown',
      'Principal Investigator (PI) CV and qualifications',
      'Commercialization plan and market analysis',
      'Company overview and technical qualifications',
      'Subcontractor agreements (if any)',
      'Letters of support from potential customers or partners'
    ],
    ca: {
      need: true,
      role: 'SBIR Grant Writer / Research Consultant',
      cost: '$2,000 – $8,000 per proposal',
      help: [
        'Writes technical proposal to agency-specific requirements',
        'Prepares commercialization narrative with market data',
        'Handles SAM.gov registration and UEI setup',
        'Reviews budget for compliance',
        'Identifies which of 11 federal agencies best fits your technology',
        'Award rate is 10–20% — professional writing significantly improves odds'
      ]
    },
    time: '3–6 months (competitive process)',
    diff: 'Hard',
    url: 'https://www.sbir.gov',
    tip: 'Participating agencies: DoD, HHS, DOE, NASA, NSF and others. SBIR/STTR reauthorised March 2026 through 2031. This is the largest single source of free R&D funding for small US businesses.'
  },

  {
    id: 'sbir_2',
    name: 'SBIR Phase 2 — R&D Commercialisation Grant',
    category: 'Federal Grant',
    badge: 'FREE Grant',
    badgeCol: 'green',
    amount: 'Up to $2,153,927',
    rate: 'No repayment',
    repay: 'None — Free Grant',
    freeGrant: true,
    desc: 'Follow-on grant for SBIR Phase 1 graduates. Largest single R&D grant available to US small businesses. Funds full development and commercialisation.',
    eli: {
      countries: ['USA'],
      industries: ['technology', 'biotech', 'science', 'software', 'healthcare', 'energy', 'defense', 'engineering'],
      minAge: 0,
      maxEmp: 500,
      maxRev: null,
      states: ['all'],
      requires: []
    },
    why: [
      'Must have successfully completed SBIR Phase 1',
      'Demonstrated feasibility in Phase 1 report',
      '51%+ US-owned, under 500 employees',
      'Ready to fully develop and commercialise the technology'
    ],
    docs: [
      'Phase 1 completion report and results summary',
      'Full Phase 2 technical research proposal',
      'Detailed commercialization and go-to-market plan',
      'Business financial statements (2 years)',
      'Detailed budget justification',
      'Letters of intent from potential customers or licensees',
      'IP protection documentation (patents filed or pending)',
      'Full team qualifications and CVs'
    ],
    ca: {
      need: true,
      role: 'SBIR Grant Writer + Commercialisation Advisor',
      cost: '$5,000 – $15,000 per proposal',
      help: [
        'Builds on Phase 1 narrative for Phase 2 submission',
        'Strengthens commercialisation plan with customer validation',
        'Structures IP and licensing strategy',
        'Connects with potential commercial partners',
        'Manages full proposal submission and compliance'
      ]
    },
    time: '4–8 months',
    diff: 'Hard',
    url: 'https://www.sbir.gov',
    tip: 'Phase 2 award rate is higher than Phase 1. Agencies want their Phase 1 investments to succeed. Strong commercialisation plan with named potential customers is critical.'
  },

  {
    id: 'sttr',
    name: 'STTR — Small Business Technology Transfer Grant',
    category: 'Federal Grant',
    badge: 'FREE Grant',
    badgeCol: 'green',
    amount: 'Up to $323,000 (Phase 1)',
    rate: 'No repayment',
    repay: 'None — Free Grant',
    freeGrant: true,
    desc: 'Federal grant for small businesses collaborating with a US university or national lab on joint R&D. Business must partner formally with a research institution.',
    eli: {
      countries: ['USA'],
      industries: ['technology', 'biotech', 'science', 'software', 'healthcare', 'engineering'],
      minAge: 0,
      maxEmp: 500,
      maxRev: null,
      states: ['all'],
      requires: []
    },
    why: [
      '51%+ US-owned, under 500 employees',
      'Must partner with a US university or national research laboratory',
      'Research institution performs at least 30% of the work',
      'Technology and innovation focused business',
      'Formal collaboration agreement signed with the institution'
    ],
    docs: [
      'Joint research proposal (co-written with institution)',
      'Formal collaboration agreement (signed by both parties)',
      'SAM.gov registration — UEI number',
      'Budget justification for both parties',
      'PI CVs from both company and research institution',
      'IP ownership agreement between company and institution',
      'Research institution\'s agreement to participate'
    ],
    ca: {
      need: true,
      role: 'STTR Grant Writer + University Tech Transfer Liaison',
      cost: '$3,000 – $10,000',
      help: [
        'Identifies suitable university research partners via Tech Transfer Offices',
        'Structures the collaboration and IP ownership agreement',
        'Co-writes the joint proposal',
        'Navigates IP ownership terms between company and university',
        'Handles SAM.gov registration and compliance documentation'
      ]
    },
    time: '3–6 months',
    diff: 'Hard',
    url: 'https://www.sbir.gov/about',
    tip: 'Contact your local university\'s Technology Transfer Office to find research partners. Many universities actively seek industry partners for STTR proposals.'
  },

  {
    id: 'usda_rural',
    name: 'USDA Rural Business Development Grant',
    category: 'Federal Grant',
    badge: 'FREE Grant',
    badgeCol: 'green',
    amount: '$10,000 – $500,000+',
    rate: 'No repayment',
    repay: 'None — Free Grant',
    freeGrant: true,
    desc: 'USDA grants for small businesses in rural areas to grow, create jobs, and improve communities. One of the most accessible federal grants.',
    eli: {
      countries: ['USA'],
      industries: ['all'],
      minAge: 0,
      maxEmp: 50,
      maxRev: 1000000,
      states: ['all'],
      requires: []
    },
    why: [
      'Located in a USDA-defined rural area (verify by zip code at rd.usda.gov)',
      'Under 50 full-time employees',
      'Under $1 million annual gross revenue',
      'For-profit business or nonprofit serving rural businesses'
    ],
    docs: [
      'USDA Form RD 4279-1 (Business & Industry Application)',
      'Business plan with job creation projections',
      'Federal tax returns — last 3 years',
      'Current financial statements (P&L and Balance Sheet)',
      'Evidence of rural location (zip code verification)',
      'Documentation of jobs to be created or retained',
      'Environmental review information',
      'Personal financial statements of all principals'
    ],
    ca: {
      need: true,
      role: 'USDA Grant Specialist or Rural Development Consultant',
      cost: '$500 – $2,000',
      help: [
        'Verifies rural eligibility by zip code before you invest time applying',
        'Navigates USDA form requirements',
        'Strengthens the job creation and community impact narrative',
        'Coordinates with local USDA Rural Development state office',
        'Assists with environmental review documentation'
      ]
    },
    time: '3–6 months',
    diff: 'Medium',
    url: 'https://www.rd.usda.gov/programs-services/business-programs',
    tip: 'Apply through your local USDA Rural Development state office — they provide free assistance. Check rd.usda.gov/programs first to verify your zip code qualifies.'
  },

  {
    id: 'usda_vapg',
    name: 'USDA Value-Added Producer Grant (VAPG)',
    category: 'Federal Grant',
    badge: 'FREE Grant',
    badgeCol: 'green',
    amount: 'Up to $250,000',
    rate: 'No repayment',
    repay: 'None — Free Grant',
    freeGrant: true,
    desc: 'Grants for agricultural producers and rural food businesses to develop value-added products and expand into new markets.',
    eli: {
      countries: ['USA'],
      industries: ['agriculture', 'food', 'manufacturing'],
      minAge: 0,
      maxEmp: 50,
      maxRev: null,
      states: ['all'],
      requires: []
    },
    why: [
      'Independent agricultural producer, farmer cooperative, or rural small business',
      'Producing or planning to produce a value-added agricultural product',
      'Has a business plan for expanding market reach',
      'Located in rural or agricultural area'
    ],
    docs: [
      'Grant application — USDA VAPG form',
      'Business plan for the value-added enterprise',
      'Market analysis and feasibility study',
      'Financial statements (3 years if available)',
      'Evidence of agricultural production or sourcing',
      'Matching funds documentation (50% match may be required)',
      'Environmental review information'
    ],
    ca: {
      need: true,
      role: 'Agricultural Grant Consultant or Rural Development Advisor',
      cost: '$500 – $2,500',
      help: [
        'Identifies if your product qualifies as "value-added"',
        'Prepares the required feasibility study',
        'Structures the business plan for USDA requirements',
        'Advises on matching funds sources',
        'Coordinates with USDA Rural Development office'
      ]
    },
    time: '3–5 months',
    diff: 'Medium',
    url: 'https://www.rd.usda.gov/programs-services/business-programs/value-added-producer-grants',
    tip: 'Best for farm-to-table businesses, food processors, craft breweries using local ingredients, and specialty food producers. Often combined with USDA Rural Business loans.'
  },

  /* ══════════════════════════════════════
     CATEGORY 3 — WOMEN-SPECIFIC
  ══════════════════════════════════════ */
  {
    id: 'sba_wosb',
    name: 'SBA Women-Owned Small Business (WOSB) Program',
    category: 'Women — Contract Access',
    badge: 'Women Only',
    badgeCol: 'purple',
    amount: 'Access to $50B+ in federal contracts/year',
    rate: 'No repayment — Contract Access',
    repay: 'None',
    freeGrant: true,
    desc: 'Government legally reserves 5% of all federal contracts for certified Women-Owned Small Businesses. Enormous revenue opportunity — not a grant but access to guaranteed contract dollars.',
    eli: {
      countries: ['USA'],
      industries: ['all'],
      minAge: 0,
      maxEmp: 500,
      maxRev: null,
      states: ['all'],
      requires: ['women']
    },
    why: [
      'Business is 51%+ owned by one or more women',
      'Women owner(s) control day-to-day management and operations',
      'US small business as defined by SBA size standards',
      'Any industry — some restricted to Economically Disadvantaged WOSB (EDWOSB)'
    ],
    docs: [
      'SBA WOSB online certification application (certify.sba.gov)',
      'Proof of 51%+ women ownership — articles of org, operating agreement',
      'Evidence of women management and operational control',
      'Business license and registration documents',
      'Personal financial statements of all women owners',
      'Business and personal tax returns',
      'For EDWOSB: proof personal net worth under $850,000'
    ],
    ca: {
      need: false,
      role: "Women's Business Center Advisor (FREE)",
      cost: 'Free via SBA Women\'s Business Centers',
      help: [
        'Navigate the certify.sba.gov portal at no cost',
        'Ensure ownership documentation is correctly formatted',
        'Advise on government contracting opportunities',
        'Connect with federal procurement officers',
        'Free help available at every SBA Women\'s Business Center — iwbc.org'
      ]
    },
    time: '30–90 days for certification',
    diff: 'Easy',
    url: 'https://www.sba.gov/federal-contracting/contracting-assistance-programs/women-owned-small-business-federal-contracting-program',
    tip: 'Government is legally required to award 5% of all federal contracts to WOSBs. Once certified, you can bid on set-aside contracts. This is a recurring revenue stream, not a one-time grant.'
  },

  {
    id: 'hay_helen',
    name: 'Hay Helen Grant',
    category: 'Women — Private Grant',
    badge: 'Women Only',
    badgeCol: 'purple',
    amount: '$10,000',
    rate: 'No repayment',
    repay: 'None — Free Grant',
    freeGrant: true,
    desc: 'Quarterly grant for women-owned small businesses with under $1M annual revenue. Any industry. Simple application.',
    eli: {
      countries: ['USA'],
      industries: ['all'],
      minAge: 0,
      maxEmp: null,
      maxRev: 1000000,
      states: ['all'],
      requires: ['women']
    },
    why: [
      'Women-owned business (any ownership percentage)',
      'Annual revenue under $1 million',
      'US-based business',
      'Any industry accepted'
    ],
    docs: [
      'Online application form (hayhelen.com)',
      'Business description and founding story',
      'Explanation of how grant funds will be used',
      'Revenue documentation — bank statement or tax return',
      'Proof of women ownership'
    ],
    ca: {
      need: false,
      role: 'Grant Writer',
      cost: '$200 – $500 per application',
      help: [
        'Writes a compelling grant narrative that stands out',
        'Structures the "use of funds" section for maximum impact',
        'Proofreads and polishes the application'
      ]
    },
    time: '4–6 weeks after application',
    diff: 'Easy',
    url: 'https://hayhelen.com',
    tip: 'Applications accepted 3 times per year. Write a compelling personal business story — the narrative matters as much as the numbers. Focus on impact and community.'
  },

  {
    id: 'women_founders',
    name: 'Women Founders Grant',
    category: 'Women — Private Grant',
    badge: 'Women Only',
    badgeCol: 'purple',
    amount: '$5,000 per month',
    rate: 'No repayment',
    repay: 'None — Monthly Grant',
    freeGrant: true,
    desc: 'Monthly grant awarded to a women-owned business. Recurring opportunity — apply every month. Any stage or industry.',
    eli: {
      countries: ['USA'],
      industries: ['all'],
      minAge: 0,
      maxEmp: null,
      maxRev: null,
      states: ['all'],
      requires: ['women']
    },
    why: [
      'Women-owned or women-led business',
      'US-based',
      'Any stage — idea, startup, or established',
      'Any industry'
    ],
    docs: [
      'Online application (womenfoundersgrant.com)',
      'Business description',
      'Personal background and motivation',
      'How grant funds will be used',
      'Business registration (if incorporated)'
    ],
    ca: {
      need: false,
      role: 'Grant Writer',
      cost: '$150 – $300',
      help: [
        'Story-driven application — writing quality matters',
        'Helps articulate impact and mission clearly'
      ]
    },
    time: 'Monthly selection',
    diff: 'Easy',
    url: 'https://www.womenfoundersgrant.com',
    tip: 'Monthly opportunity — apply every month to increase chances. Focus on your personal story and the impact of your business on your community.'
  },

  {
    id: 'amber_grant',
    name: 'Amber Grant for Women',
    category: 'Women — Private Grant',
    badge: 'Women Only',
    badgeCol: 'purple',
    amount: '$10,000/month + $25,000 year-end award',
    rate: 'No repayment',
    repay: 'None — Free Grant',
    freeGrant: true,
    desc: 'Monthly grant for women entrepreneurs with a year-end $25,000 award. Story-driven — your personal business journey is the key selection criterion.',
    eli: {
      countries: ['USA'],
      industries: ['all'],
      minAge: 0,
      maxEmp: null,
      maxRev: null,
      states: ['all'],
      requires: ['women']
    },
    why: [
      'Woman-owned or woman-led business',
      'US-based',
      'Any stage — startup or established',
      'Any industry — story matters most'
    ],
    docs: [
      'Online application with $15 application fee',
      'Business description',
      'Personal business journey and story',
      'Planned use of grant funds',
      'Photo or video pitch (optional but recommended)'
    ],
    ca: {
      need: false,
      role: 'Grant Writer',
      cost: '$150 – $300 per application',
      help: [
        'Crafts a compelling story-driven application',
        'The Amber Grant is 100% story-focused — writing quality is everything'
      ]
    },
    time: 'Monthly announcement',
    diff: 'Easy',
    url: 'https://ambergrantsforwomen.com',
    tip: 'Monthly winners become eligible for the $25,000 year-end award. Focus on WHY you started your business and the lives it impacts. Personal story beats business metrics here.'
  },

  {
    id: 'sogal',
    name: 'SoGal Foundation Startup Grant',
    category: 'Women — Private Grant',
    badge: 'Women · Minority',
    badgeCol: 'purple',
    amount: '$5,000 – $10,000',
    rate: 'No repayment',
    repay: 'None — Free Grant',
    freeGrant: true,
    desc: 'Annual grant specifically for Black women and nonbinary entrepreneurs at startup stage. Focus on underrepresented founders.',
    eli: {
      countries: ['USA'],
      industries: ['all'],
      minAge: 0,
      maxEmp: 50,
      maxRev: null,
      states: ['all'],
      requires: ['women', 'minority']
    },
    why: [
      'Black woman or nonbinary entrepreneur',
      'US-based startup or early-stage business',
      'Underrepresented founder identity',
      'Any industry'
    ],
    docs: [
      'Online application form',
      'Business overview and mission statement',
      'Founder background and personal story',
      'Use of funds plan',
      'Business registration (if incorporated)'
    ],
    ca: {
      need: false,
      role: 'Grant Writer',
      cost: '$150 – $400',
      help: [
        'Story-driven application — writing quality matters',
        'Helps articulate impact and mission clearly'
      ]
    },
    time: '4–8 weeks',
    diff: 'Easy',
    url: 'https://sogalfoundation.com',
    tip: 'Annual competition. Beyond the grant, the SoGal community is a global network of diverse founders — membership provides year-round value.'
  },

  /* ══════════════════════════════════════
     CATEGORY 4 — VETERANS
  ══════════════════════════════════════ */
  {
    id: 'sba_boots',
    name: 'SBA Boots to Business Program',
    category: 'Veterans — Training + Funding Path',
    badge: 'Veterans',
    badgeCol: 'navy',
    amount: 'Free training + direct pathway to SBA loans',
    rate: 'No repayment for training',
    repay: 'None for training component',
    freeGrant: true,
    desc: 'Free SBA entrepreneurship training for transitioning service members and veterans, with a direct pathway to SBA microloans, 7(a) loans, and grants upon completion.',
    eli: {
      countries: ['USA'],
      industries: ['all'],
      minAge: 0,
      maxEmp: null,
      maxRev: null,
      states: ['all'],
      requires: ['veteran']
    },
    why: [
      'Transitioning service member, veteran, or military spouse',
      'US-based or planning to start a US business',
      'Any stage — idea through established business'
    ],
    docs: [
      'Military ID or DD214 discharge documentation',
      'Registration on SBA Boots to Business website',
      'No other documentation required for training'
    ],
    ca: {
      need: false,
      role: 'SBA provides free mentors through this program',
      cost: 'Completely FREE',
      help: [
        'Business plan development included in the program',
        'Direct connection to SBA loans and grants post-training',
        'Free SCORE veteran mentor assigned',
        'Veteran Business Outreach Centers (VBOCs) provide ongoing free support'
      ]
    },
    time: 'Training: 2 days; Follow-on funding: 4–8 weeks',
    diff: 'Easy',
    url: 'https://www.sba.gov/offices/headquarters/ovbd/resources/160511',
    tip: 'Best starting point if you are a veteran new to entrepreneurship. Program is free and directly connects you to SBA funding. Free VBOCs in every state provide ongoing support.'
  },

  {
    id: 'streetshares',
    name: 'StreetShares Foundation Veteran Award',
    category: 'Veterans — Private Grant',
    badge: 'Veterans Only',
    badgeCol: 'navy',
    amount: '$4,000 – $15,000',
    rate: 'No repayment',
    repay: 'None — Free Grant',
    freeGrant: true,
    desc: 'Annual award for military veteran entrepreneurs to grow their small business. Any stage, any industry.',
    eli: {
      countries: ['USA'],
      industries: ['all'],
      minAge: 0,
      maxEmp: null,
      maxRev: null,
      states: ['all'],
      requires: ['veteran']
    },
    why: [
      'Military veteran, active duty, reservist, or military spouse',
      'US-based business',
      'Any stage or industry',
      'Strong business story and growth plan'
    ],
    docs: [
      'Online application',
      'Military service documentation (DD214 or equivalent)',
      'Business description and mission',
      'Planned use of funds',
      'Basic business financials',
      'Video pitch (highly recommended — improves odds significantly)'
    ],
    ca: {
      need: false,
      role: 'Veteran Business Outreach Center (VBOC) — FREE',
      cost: 'Free help available at every VBOC',
      help: [
        'Helps craft a compelling veteran business story',
        'Structures the pitch for video submission',
        'Find your nearest VBOC at sba.gov/vboc'
      ]
    },
    time: '6–8 weeks',
    diff: 'Easy',
    url: 'https://streetsharesfoundation.org',
    tip: 'Annual competition. A short video pitch dramatically improves odds. Veteran Business Outreach Centers (VBOCs) offer free help — find yours at sba.gov/vboc.'
  },

  {
    id: 'hiring_heroes',
    name: 'Hiring Our Heroes Small Business Grant',
    category: 'Veterans — Private Grant',
    badge: 'Veterans Only',
    badgeCol: 'navy',
    amount: '$10,000 – $25,000 (5 winners total)',
    rate: 'No repayment',
    repay: 'None — Free Grant',
    freeGrant: true,
    desc: 'Annual grant from the US Chamber of Commerce Foundation. 4 winners get $10,000, 1 winner gets $25,000.',
    eli: {
      countries: ['USA'],
      industries: ['all'],
      minAge: 0,
      maxEmp: null,
      maxRev: null,
      states: ['all'],
      requires: ['veteran']
    },
    why: [
      'Veteran, active duty, or military spouse',
      'US-based business',
      'Any industry',
      'Must demonstrate business impact and job creation'
    ],
    docs: [
      'Application form (hiringourheroes.org)',
      'Military documentation (DD214)',
      'Business plan or detailed growth description',
      'Basic financial overview',
      'Description of community impact and jobs created/supported'
    ],
    ca: {
      need: false,
      role: 'Grant Writer',
      cost: '$200 – $500',
      help: [
        'Refines the community impact narrative',
        'Structures the financial overview for non-financial readers'
      ]
    },
    time: '6–8 weeks',
    diff: 'Easy',
    url: 'https://www.hiringourheroes.org/small-business-grant',
    tip: 'Annual competition. Strong emphasis on community impact and job creation — lead with how many jobs your business supports.'
  },

  {
    id: 'fedex_fund',
    name: 'FedEx Entrepreneur Fund',
    category: 'Veterans — Corporate Grant',
    badge: 'Veterans · Disability',
    badgeCol: 'navy',
    amount: '$10,000 (30 grants awarded)',
    rate: 'No repayment',
    repay: 'None — Free Grant',
    freeGrant: true,
    desc: 'FedEx awards 30 grants of $10,000 to entrepreneurs with military connections or disabilities. Includes mentoring and FedEx shipping credits.',
    eli: {
      countries: ['USA'],
      industries: ['all'],
      minAge: 0,
      maxEmp: 100,
      maxRev: null,
      states: ['all'],
      requires: ['veteran']
    },
    why: [
      'Military connection — veteran, active duty, or family member — OR a disability',
      'US-based business',
      'Under 100 employees',
      'Any industry'
    ],
    docs: [
      'Hello Alice platform profile (free registration)',
      'Business description',
      'Military service or disability documentation',
      'Grant application narrative',
      'How grant funds will be used'
    ],
    ca: {
      need: false,
      role: 'Grant Writer',
      cost: '$200 – $400',
      help: [
        'Helps write compelling narrative for the Hello Alice application',
        'Apply via helloalice.com/grants/fedex'
      ]
    },
    time: '6–8 weeks',
    diff: 'Easy',
    url: 'https://helloalice.com/grants/fedex',
    tip: 'FedEx also provides business mentoring and shipping credits alongside cash. Register on Hello Alice first — that is where applications are submitted.'
  },

  /* ══════════════════════════════════════
     CATEGORY 5 — MINORITY / UNDERSERVED
  ══════════════════════════════════════ */
  {
    id: 'secretsos',
    name: 'Secretsos Small Business Grant',
    category: 'Underserved — Private Grant',
    badge: 'Underserved',
    badgeCol: 'orange',
    amount: 'Varies by cycle',
    rate: 'No repayment',
    repay: 'None — Free Grant',
    freeGrant: true,
    desc: 'Broadest eligibility of any grant — open to any US entrepreneur who is underserved: denied a bank loan, women-owned, veteran, minority, or in a low-income area.',
    eli: {
      countries: ['USA'],
      industries: ['all'],
      minAge: 0,
      maxEmp: null,
      maxRev: null,
      states: ['all'],
      requires: []
    },
    why: [
      'US-based business',
      '21+ years old owner',
      'Legally registered business',
      'Traditionally underserved: denied bank loan OR women-owned OR veteran OR minority OR low-income area location'
    ],
    docs: [
      'Business registration documentation',
      'Government-issued ID (21+ verification)',
      'Statement explaining how your business is underserved',
      'Grant application form (online at secretsos.com)',
      'Business overview and planned use of funds'
    ],
    ca: {
      need: false,
      role: 'Grant Writer',
      cost: '$100 – $300',
      help: [
        'Helps articulate the underserved narrative',
        'Simple story-driven application'
      ]
    },
    time: '4–8 weeks',
    diff: 'Easy',
    url: 'https://secretsos.com',
    tip: 'If you have ever been denied a bank loan, that alone qualifies you. The broadest eligibility criteria of any grant program — apply immediately if you qualify on any criterion.'
  },

  /* ══════════════════════════════════════
     CATEGORY 6 — CORPORATE GRANTS
  ══════════════════════════════════════ */
  {
    id: 'verizon_digital',
    name: 'Verizon Small Business Digital Ready Grant',
    category: 'Corporate Grant',
    badge: 'FREE Grant',
    badgeCol: 'green',
    amount: '$10,000 (50 grants awarded)',
    rate: 'No repayment',
    repay: 'None — Free Grant',
    freeGrant: true,
    desc: 'Verizon awards $10,000 grants to small businesses that complete 2 free digital skills courses. Very accessible — no special category required.',
    eli: {
      countries: ['USA'],
      industries: ['all'],
      minAge: 0,
      maxEmp: 100,
      maxRev: null,
      states: ['all'],
      requires: []
    },
    why: [
      'US-based small business',
      'Complete any 2 Digital Ready courses or events (free)',
      'Under 100 employees',
      'Any industry accepted'
    ],
    docs: [
      'Digital Ready platform profile (free registration)',
      'Completion certificates for 2 Digital Ready courses or events',
      'Business registration',
      'Grant application via Digital Ready platform',
      'Description of how funds will be used'
    ],
    ca: {
      need: false,
      role: 'Not needed — simple online application',
      cost: 'Free to apply',
      help: [
        'Complete the 2 free online courses — they cover digital marketing, e-commerce, and financial tools',
        'Apply directly at digitalready.verizonwireless.com/grants',
        'Deadline typically in December each year'
      ]
    },
    time: '4–8 weeks after application deadline',
    diff: 'Easy',
    url: 'https://digitalready.verizonwireless.com/grants',
    tip: 'The free Digital Ready courses are valuable on their own — covering digital marketing, e-commerce, and accounting software. Complete them regardless of whether you win.'
  },

  {
    id: 'amazon_grant',
    name: 'Amazon Business Small Business Grant',
    category: 'Corporate Grant',
    badge: 'FREE Grant',
    badgeCol: 'green',
    amount: '$250,000+ pool shared by 15 businesses',
    rate: 'No repayment',
    repay: 'None — Free Grant',
    freeGrant: true,
    desc: 'Amazon Business awards grants to existing Amazon Business customers with under $1M revenue. Annual competition.',
    eli: {
      countries: ['USA'],
      industries: ['all'],
      minAge: 0,
      maxEmp: null,
      maxRev: 1000000,
      states: ['all'],
      requires: []
    },
    why: [
      'US-based small business',
      'Annual revenue under $1 million',
      'Existing Amazon Business account holder',
      'Made at least one Amazon Business purchase in the past 12 months'
    ],
    docs: [
      'Amazon Business account verification',
      'Business registration',
      'Grant application on Amazon Business portal',
      'Business description and growth plan',
      'Use of funds narrative',
      'Revenue documentation showing under $1M'
    ],
    ca: {
      need: false,
      role: 'Grant Writer',
      cost: '$150 – $300',
      help: [
        'Writes compelling grant narrative',
        'Structures the growth plan section effectively'
      ]
    },
    time: '6–10 weeks',
    diff: 'Easy',
    url: 'https://business.amazon.com/en/small-business/small-business-grants',
    tip: 'You must be an Amazon Business customer first — sign up free at business.amazon.com. Annual competition typically opens in spring. Strong growth story with clear use of funds wins.'
  },

  {
    id: 'comcast_rise',
    name: 'Comcast RISE Grant',
    category: 'Corporate Grant',
    badge: 'FREE Grant',
    badgeCol: 'green',
    amount: '$5,000 cash + technology + media advertising package',
    rate: 'No repayment',
    repay: 'None — Free Grant',
    freeGrant: true,
    desc: '$5,000 cash grant PLUS a technology upgrade (hardware, software) AND a local media advertising package from Comcast. Combined value often exceeds $50,000.',
    eli: {
      countries: ['USA'],
      industries: ['all'],
      minAge: 2,
      maxEmp: 100,
      maxRev: null,
      states: ['MA', 'MI', 'TN', 'WA', 'UT'],
      requires: []
    },
    why: [
      'In business for at least 2 years',
      'Under 100 employees',
      'Independently owned and operated',
      'Located in a selected city for that program year'
    ],
    docs: [
      'Business license or registration',
      'Proof of 2+ years in business',
      'Grant application form at comcastrise.com',
      'Business description and how you will use the grant',
      'Brief description of community impact'
    ],
    ca: {
      need: false,
      role: 'Not needed — simple online application',
      cost: 'Free to apply',
      help: [
        'Check comcastrise.com each year for selected cities — changes annually',
        'Apply during the open application window (typically May–June)',
        'Focus on community impact in your application'
      ]
    },
    time: '6–10 weeks after deadline',
    diff: 'Easy',
    url: 'https://www.comcastrise.com',
    tip: 'Location-specific — only 5 US cities selected each year. Check the website early. The tech + media package is often worth far more than the $5,000 cash component.'
  },

  /* ══════════════════════════════════════
     CATEGORY 7 — STATE-SPECIFIC PROGRAMS
     UPDATE ANNUALLY: state programs change eligibility and amounts each fiscal year.
  ══════════════════════════════════════ */
  {
    id: 'ca_ibank',
    name: 'California IBank Small Business Loan Guarantee',
    category: 'State Grant',
    badge: 'CA Only',
    badgeCol: 'blue',
    amount: 'Guarantee up to $1,000,000',
    rate: 'Below-market interest (guaranteed by state)',
    repay: 'Loan — guaranteed by CA state',
    freeGrant: false,
    stateOnly: true,
    desc: 'California Infrastructure and Economic Development Bank (IBank) guarantees up to 95% of your loan so that banks approve more freely. Specially targeted at underserved small businesses.',
    eli: {
      countries: ['USA'],
      industries: ['all'],
      minAge: 0,
      maxEmp: 750,
      maxRev: null,
      states: ['CA'],
      requires: []
    },
    why: [
      'California-based for-profit business',
      'Under 750 employees',
      'Cannot access conventional financing on reasonable terms',
      'Priority for underserved communities and businesses'
    ],
    docs: [
      'Business plan and financial projections',
      'Bank statements — last 6 months',
      'Business and personal tax returns — last 2 years',
      'Business license and CA registration',
      'Personal Financial Statement',
      'Use of loan proceeds explanation'
    ],
    ca: {
      need: false,
      role: 'SBDC Advisor (FREE via CA SBDC Network)',
      cost: 'Free at casbdc.com',
      help: [
        'Pre-qualify your application before submitting to a lender',
        'Connect with a participating IBank lender in your area',
        'Free SBDC advisors available across California'
      ]
    },
    time: '2–4 weeks',
    diff: 'Easy-Medium',
    url: 'https://ibank.ca.gov/small-business',
    tip: 'Priority given to businesses in low-wealth communities. Visit casbdc.com for a free advisor who specializes in IBank applications.'
  },

  {
    id: 'tx_vet_biz',
    name: 'Texas Veterans Small Business Grant',
    category: 'State Grant',
    badge: 'TX Only',
    badgeCol: 'blue',
    amount: '$5,000 – $50,000',
    rate: 'No repayment',
    repay: 'None — Free Grant',
    freeGrant: true,
    stateOnly: true,
    desc: 'Texas Governor\'s Office and Texas Veterans Commission partner to award annual grants to veteran-owned small businesses in Texas. Priority to post-9/11 veterans.',
    eli: {
      countries: ['USA'],
      industries: ['all'],
      minAge: 0,
      maxEmp: 250,
      maxRev: 2000000,
      states: ['TX'],
      requires: ['veteran']
    },
    why: [
      'Texas-based business',
      'Veteran, active duty, or military spouse owner',
      'Under 250 employees and under $2M annual revenue',
      'Any industry accepted'
    ],
    docs: [
      'Texas business registration or DBA certificate',
      'Military service documentation (DD214)',
      'Business plan with growth objectives',
      'Last 2 years business and personal tax returns',
      'Bank statements — last 3 months'
    ],
    ca: {
      need: false,
      role: 'Texas Veterans Commission (FREE)',
      cost: 'Free at tvc.texas.gov',
      help: [
        'Free application assistance from Texas Veterans Commission',
        'Connect with nearest VBOC in Texas at sba.gov/vboc'
      ]
    },
    time: '6–10 weeks',
    diff: 'Easy',
    url: 'https://www.tvc.texas.gov/economic-development',
    tip: 'Apply through the Texas Veterans Commission — they provide free application assistance and actively advocate for veteran-owned businesses in the review process.'
  },

  {
    id: 'ny_mwbe_grant',
    name: 'New York MWBE Capital Access Program',
    category: 'State Grant',
    badge: 'NY Only',
    badgeCol: 'blue',
    amount: '$5,000 – $50,000',
    rate: 'No repayment (grant portion)',
    repay: 'None — Free Grant',
    freeGrant: true,
    stateOnly: true,
    desc: 'New York Empire State Development awards grants to certified Minority and Women-Owned Business Enterprises (MWBE) to grow operations, hire staff, and expand into new markets.',
    eli: {
      countries: ['USA'],
      industries: ['all'],
      minAge: 1,
      maxEmp: 100,
      maxRev: 3500000,
      states: ['NY'],
      requires: ['women', 'minority']
    },
    why: [
      'New York State certified MWBE business',
      '1+ year in business',
      'Under 100 employees and under $3.5M revenue',
      'Women-owned OR minority-owned (or both)'
    ],
    docs: [
      'NY State MWBE certification (or application in progress)',
      'Business plan with specific growth objectives',
      'Federal and state tax returns — last 2 years',
      'Current financial statements (P&L + Balance Sheet)',
      'Bank statements — last 6 months',
      'Proof of NY State business registration'
    ],
    ca: {
      need: false,
      role: 'Empire State Development Regional Office (FREE)',
      cost: 'Free application assistance from ESD',
      help: [
        'ESD regional offices provide free application support',
        'MWBE certification assistance at esd.ny.gov/mwbe',
        'NY Small Business Development Center also assists at nyssbdc.org'
      ]
    },
    time: '8–12 weeks',
    diff: 'Medium',
    url: 'https://esd.ny.gov/mwbe',
    tip: 'MWBE certification unlocks this and dozens of other NY State programs. If not yet certified, start the certification — it takes 3–6 months but is worth it for long-term access to state funding.'
  },

  {
    id: 'fl_sbeg',
    name: 'Florida Small Business Emergency Bridge Loan',
    category: 'State Grant',
    badge: 'FL Only',
    badgeCol: 'blue',
    amount: '$1,000 – $50,000',
    rate: '0% interest for first 12 months',
    repay: 'Repayable loan — 0% for 12 months',
    freeGrant: false,
    stateOnly: true,
    desc: 'Florida DEO administers 0% interest bridge loans for small businesses that have suffered economic damage. Opens after declared emergencies AND for economic hardship cases year-round.',
    eli: {
      countries: ['USA'],
      industries: ['all'],
      minAge: 2,
      maxEmp: 100,
      maxRev: null,
      states: ['FL'],
      requires: []
    },
    why: [
      'Florida-based for-profit business',
      '2+ years in business',
      'Under 100 employees',
      'Suffered or at risk of economic damage'
    ],
    docs: [
      'Florida business registration',
      'Federal tax returns — last 2 years',
      'Bank statements — last 6 months',
      'P&L statement for current year',
      'Description of economic injury or need',
      'Business license'
    ],
    ca: {
      need: false,
      role: 'Florida SBDC (FREE)',
      cost: 'Free at floridasbdc.org',
      help: [
        'Florida SBDC network provides free application assistance at floridasbdc.org',
        'FastHelp hotline: 1-833-832-4553'
      ]
    },
    time: '1–2 weeks (emergency processing)',
    diff: 'Easy',
    url: 'https://floridajobs.org/small-business',
    tip: '0% interest for 12 months makes this effectively a free loan if paid on time. Florida SBDC (floridasbdc.org) provides free assistance and has offices in every county.'
  },

  {
    id: 'wa_flex_fund',
    name: 'Washington Small Business Flex Fund',
    category: 'State Grant',
    badge: 'WA Only',
    badgeCol: 'blue',
    amount: '$10,000 – $150,000',
    rate: '3% fixed — below market',
    repay: 'Low-interest loan — 60-month term',
    freeGrant: false,
    stateOnly: true,
    desc: 'State of Washington backs below-market loans through CDFIs for WA small businesses that cannot access conventional credit. Priority for diverse and underserved businesses.',
    eli: {
      countries: ['USA'],
      industries: ['all'],
      minAge: 0,
      maxEmp: 500,
      maxRev: null,
      states: ['WA'],
      requires: []
    },
    why: [
      'Washington State based business',
      'Cannot access conventional bank financing',
      'Any industry, any stage',
      'Priority for women, minority, veteran, rural, and immigrant-owned businesses'
    ],
    docs: [
      'Washington business registration (UBI number)',
      'Business plan or use of funds statement',
      'Bank statements — last 3 months',
      'Tax returns — last 1–2 years',
      'Personal Financial Statement'
    ],
    ca: {
      need: false,
      role: 'Washington SBDC (FREE)',
      cost: 'Free at wsbdc.org',
      help: [
        'Free loan packaging support from WA SBDC at wsbdc.org',
        'Connects to participating CDFI lender in your region'
      ]
    },
    time: '2–4 weeks',
    diff: 'Easy',
    url: 'https://business.wa.gov/flex-fund',
    tip: 'The Flex Fund uses state money to subsidize the interest — you get 3% while market rates are 8–11%. Diverse and underserved businesses receive priority review.'
  },

  {
    id: 'hello_alice',
    name: 'Hello Alice — Small Business Grant Hub',
    category: 'Corporate Grant',
    badge: 'Multiple Grants',
    badgeCol: 'green',
    amount: '$10,000 – $25,000 per program (varies)',
    rate: 'No repayment',
    repay: 'None — Free Grants',
    freeGrant: true,
    desc: 'Not just one grant — Hello Alice is a platform that aggregates dozens of corporate grants in one place. Register free and get email alerts when new grants match your profile.',
    eli: {
      countries: ['USA'],
      industries: ['all'],
      minAge: 0,
      maxEmp: null,
      maxRev: null,
      states: ['all'],
      requires: []
    },
    why: [
      'US-based small business',
      'Different programs have different specific criteria',
      'Register free on Hello Alice platform',
      'Programs open and close throughout the year'
    ],
    docs: [
      'Hello Alice platform profile (free to create)',
      'Business registration',
      'Documentation varies by specific grant program',
      'Enable email alerts for new grants matching your profile'
    ],
    ca: {
      need: false,
      role: 'Grant Writer (for specific programs)',
      cost: '$150 – $500 per application',
      help: [
        'Hello Alice is an aggregator — apply to multiple grants from one login',
        'Set up your profile and enable email alerts',
        'Some Hello Alice programs include grant writing guidance'
      ]
    },
    time: 'Varies by program',
    diff: 'Easy',
    url: 'https://helloalice.com/grants',
    tip: 'Sign up free and complete your full profile. You will receive email alerts when new grants matching your business type open. This is the most efficient way to track all US small business grants in one place.'
  }

];

/* ── Helper: get grants matching a profile ── */
function matchGrantsUSA(profile) {
  var matched = [];
  var nearMiss = [];

  GRANTS_USA.forEach(function(g) {
    var fails = [];
    var hits  = [];

    /* Country */
    if (g.eli.countries.indexOf('all') > -1 || g.eli.countries.indexOf(profile.country) > -1) {
      hits.push('Country matches — ' + profile.country);
    } else {
      fails.push('Not available in ' + profile.country);
    }

    /* Industry */
    if (g.eli.industries.indexOf('all') > -1 || g.eli.industries.indexOf(profile.industry) > -1) {
      hits.push('Industry qualifies');
    } else {
      fails.push('Industry: ' + g.eli.industries.join(', ') + ' only');
    }

    /* Business age */
    if (profile.businessAge >= g.eli.minAge) {
      hits.push('Business age qualifies (' + profile.businessAge + ' year' + (profile.businessAge !== 1 ? 's' : '') + ')');
    } else {
      fails.push('Need ' + g.eli.minAge + '+ years in business (you have ' + profile.businessAge + ')');
    }

    /* Employees */
    if (!g.eli.maxEmp || profile.employees <= g.eli.maxEmp) {
      hits.push('Employee count qualifies (' + profile.employees + ' employees)');
    } else {
      fails.push('Too many employees — max ' + g.eli.maxEmp + ' (you have ' + profile.employees + ')');
    }

    /* Revenue */
    if (!g.eli.maxRev || profile.annualRevenue <= g.eli.maxRev) {
      hits.push('Revenue qualifies');
    } else {
      fails.push('Revenue exceeds limit of $' + (g.eli.maxRev / 1000000).toFixed(1) + 'M');
    }

    /* State */
    if (g.eli.states.indexOf('all') > -1 || g.eli.states.indexOf(profile.state) > -1) {
      hits.push('Location qualifies');
    } else {
      fails.push('Only in: ' + g.eli.states.join(', ') + ' — not ' + profile.state);
    }

    /* Special category */
    if (g.eli.requires.length === 0) {
      hits.push('No special category required');
    } else {
      var hasIt = g.eli.requires.some(function(r) {
        return profile.specialCategories.indexOf(r) > -1;
      });
      if (hasIt) {
        hits.push('Special category unlocks this grant');
      } else {
        fails.push('Requires: ' + g.eli.requires.join(' or ') + ' ownership');
      }
    }

    var matchPct = Math.round((hits.length / (hits.length + fails.length)) * 100);

    if (fails.length === 0) {
      matched.push({ grant: g, matchPct: matchPct, hits: hits, fails: [] });
    } else if (fails.length === 1) {
      nearMiss.push({ grant: g, matchPct: matchPct, hits: hits, fails: fails });
    }
  });

  /* Sort by match % */
  matched.sort(function(a, b) { return b.matchPct - a.matchPct; });
  nearMiss.sort(function(a, b) { return b.matchPct - a.matchPct; });

  return { matched: matched, nearMiss: nearMiss };
}
