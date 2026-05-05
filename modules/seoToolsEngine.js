/**
 * Module 19: SEO Tools Engine
 *
 * Drives organic discovery for the SmallBiz Financial Platform:
 *   - Meta tags generator (title / description / Open Graph / Twitter Card)
 *   - Schema.org JSON-LD markup for financial calculators
 *   - UTM link builder for campaign tracking
 *   - Keyword suggestions per industry and tool type
 *   - Embeddable calculator widget code generator
 *
 * All output is plain text / HTML strings — no server required.
 */

// ─── Module catalog ──────────────────────────────────────────────────────────

const MODULE_CATALOG = {
  cashFlowEngine:          { id: "cashFlowEngine",          name: "Cash Flow Calculator",         slug: "cash-flow-calculator",        icon: "💵", description: "Calculate monthly net cash flow, identify surplus and deficit periods." },
  loanEngine:              { id: "loanEngine",              name: "Loan EMI Calculator",           slug: "loan-emi-calculator",          icon: "🏦", description: "Compute EMI, full amortization schedule, and prepayment simulation." },
  loanAffordabilityEngine: { id: "loanAffordabilityEngine", name: "Loan Affordability Calculator", slug: "loan-affordability-calculator", icon: "📊", description: "Find the maximum loan amount your business cash flow can safely support." },
  riskDebtEngine:          { id: "riskDebtEngine",          name: "Debt Risk Analyzer",            slug: "debt-risk-analyzer",           icon: "⚠️", description: "Calculate DSCR, DTI, and risk level for your current debt load." },
  stressTestEngine:        { id: "stressTestEngine",        name: "Business Stress Test",          slug: "business-stress-test",         icon: "🔥", description: "Simulate revenue drops, expense spikes, and rate hikes on loan viability." },
  multiLoanManager:        { id: "multiLoanManager",        name: "Multi-Loan Portfolio Manager",  slug: "multi-loan-manager",           icon: "🗂️", description: "Manage multiple loans, compute total exposure, and simulate new loan impact." },
  recommendationEngine:    { id: "recommendationEngine",    name: "Loan Recommendation Engine",    slug: "loan-recommendation-engine",   icon: "💡", description: "Get prioritized recommendations on prepayment, tenure, and loan decisions." },
  profitLossEngine:        { id: "profitLossEngine",        name: "Profit & Loss Calculator",      slug: "profit-loss-calculator",       icon: "📈", description: "Build a full P&L statement with gross, operating, and net margins." },
  balanceSheetEngine:      { id: "balanceSheetEngine",      name: "Balance Sheet Builder",         slug: "balance-sheet-builder",        icon: "⚖️", description: "Construct a balance sheet and verify Assets = Liabilities + Equity." },
  cashFlowStatementEngine: { id: "cashFlowStatementEngine", name: "Cash Flow Statement Tool",      slug: "cash-flow-statement",          icon: "💧", description: "Generate operating, investing, and financing cash flow statements." },
  accountingMappingEngine: { id: "accountingMappingEngine", name: "Accounting Mapper",             slug: "accounting-mapper",            icon: "🔑", description: "Map EMI payments and depreciation across P&L, Balance Sheet, and CFS." },
  forecastingEngine:       { id: "forecastingEngine",       name: "Business Forecasting Tool",     slug: "business-forecasting",         icon: "🔮", description: "Project cash flow and P&L up to 36 months with scenario analysis." },
  loanMarketplaceEngine:   { id: "loanMarketplaceEngine",   name: "Business Loan Marketplace",     slug: "loan-marketplace",             icon: "🏪", description: "Compare loan offers from multiple lenders by EMI and total cost." },
  aiAdvisorEngine:         { id: "aiAdvisorEngine",         name: "AI Financial Advisor",          slug: "ai-financial-advisor",         icon: "🤖", description: "Get rule-based financial health scores, loan readiness, and action plans." },
  industryBenchmarksEngine:{ id: "industryBenchmarksEngine",name: "Industry Benchmarks Tool",      slug: "industry-benchmarks",          icon: "📊", description: "Compare your financial ratios against industry averages and percentiles." },
};

const KEYWORD_DATABASE = {
  loan: [
    { keyword: "business loan calculator", volume: "high",   difficulty: "medium" },
    { keyword: "EMI calculator for business",volume: "high", difficulty: "low"    },
    { keyword: "business loan eligibility",  volume: "high", difficulty: "medium" },
    { keyword: "how to calculate EMI",       volume: "high", difficulty: "low"    },
    { keyword: "small business loan rates",  volume: "medium",difficulty: "medium"},
    { keyword: "MSME loan interest rate",    volume: "medium",difficulty: "low"   },
    { keyword: "loan affordability check",   volume: "medium",difficulty: "low"   },
    { keyword: "prepayment benefit calculator",volume:"medium",difficulty:"low"   },
  ],
  cashflow: [
    { keyword: "cash flow calculator",        volume: "high",   difficulty: "medium" },
    { keyword: "business cash flow analysis", volume: "high",   difficulty: "medium" },
    { keyword: "monthly cash flow template",  volume: "medium", difficulty: "low"    },
    { keyword: "cash flow forecast tool",     volume: "medium", difficulty: "medium" },
    { keyword: "operating cash flow formula", volume: "medium", difficulty: "low"    },
    { keyword: "working capital calculator",  volume: "medium", difficulty: "low"    },
  ],
  risk: [
    { keyword: "DSCR calculator",             volume: "medium", difficulty: "low"    },
    { keyword: "debt service coverage ratio", volume: "medium", difficulty: "low"    },
    { keyword: "DTI calculator business",     volume: "medium", difficulty: "low"    },
    { keyword: "business debt risk analysis", volume: "low",    difficulty: "low"    },
    { keyword: "loan stress test calculator", volume: "low",    difficulty: "low"    },
  ],
  financial_statements: [
    { keyword: "profit and loss calculator",  volume: "high",   difficulty: "medium" },
    { keyword: "P&L statement template",      volume: "high",   difficulty: "low"    },
    { keyword: "balance sheet builder",       volume: "medium", difficulty: "low"    },
    { keyword: "cash flow statement tool",    volume: "medium", difficulty: "medium" },
    { keyword: "gross margin calculator",     volume: "high",   difficulty: "medium" },
    { keyword: "net profit margin formula",   volume: "high",   difficulty: "low"    },
  ],
  benchmarks: [
    { keyword: "industry profit margin averages",    volume: "medium", difficulty: "low"  },
    { keyword: "small business financial benchmarks",volume: "medium", difficulty: "low"  },
    { keyword: "average DSCR by industry",           volume: "low",    difficulty: "low"  },
    { keyword: "retail gross margin benchmark",      volume: "medium", difficulty: "low"  },
  ],
  general: [
    { keyword: "small business financial tools",     volume: "high",   difficulty: "high"  },
    { keyword: "free business financial calculator", volume: "high",   difficulty: "medium"},
    { keyword: "SMB financial planning tools",       volume: "medium", difficulty: "medium"},
    { keyword: "business financial health check",    volume: "medium", difficulty: "low"   },
  ],
};

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Generate SEO meta tags for a calculator page.
 *
 * @param {object} p
 * @param {string} p.moduleId   – key from MODULE_CATALOG
 * @param {string} [p.baseUrl]  – canonical base URL (e.g. "https://smallbiz.app")
 * @param {string} [p.siteName]
 * @returns {object} { title, description, keywords, canonical, openGraph, twitterCard, html }
 */
function generateMetaTags({ moduleId, baseUrl = "https://smallbiz.app",
    siteName = "SmallBiz Financial Platform" }) {
  const mod = MODULE_CATALOG[moduleId];
  if (!mod) throw new Error(`Unknown moduleId: "${moduleId}". Valid: ${Object.keys(MODULE_CATALOG).join(", ")}`);

  const url       = `${baseUrl}/calculators/${mod.slug}`;
  const title     = `${mod.name} — Free Small Business Tool | ${siteName}`;
  const desc      = `${mod.description} Free, no sign-up required. Works for any small business.`;
  const keywords  = [mod.name.toLowerCase(), "small business", "free calculator", "financial tool",
                     mod.slug.replace(/-/g, " ")].join(", ");

  const og = {
    "og:title":       title,
    "og:description": desc,
    "og:url":         url,
    "og:type":        "website",
    "og:image":       `${baseUrl}/og/${mod.slug}.png`,
    "og:site_name":   siteName,
  };
  const tc = {
    "twitter:card":        "summary_large_image",
    "twitter:title":       title,
    "twitter:description": desc,
    "twitter:image":       `${baseUrl}/og/${mod.slug}.png`,
  };

  const html = [
    `<title>${title}</title>`,
    `<meta name="description" content="${desc}">`,
    `<meta name="keywords" content="${keywords}">`,
    `<link rel="canonical" href="${url}">`,
    ...Object.entries(og).map(([k, v]) => `<meta property="${k}" content="${v}">`),
    ...Object.entries(tc).map(([k, v]) => `<meta name="${k}" content="${v}">`),
  ].join("\n");

  return { title, description: desc, keywords, canonical: url, openGraph: og, twitterCard: tc, html };
}

/**
 * Generate Schema.org JSON-LD markup for a financial calculator.
 *
 * @param {object} p
 * @param {string} p.moduleId
 * @param {string} [p.baseUrl]
 * @param {string} [p.businessName]
 * @returns {object} { schema, scriptTag }
 */
function generateSchemaOrg({ moduleId, baseUrl = "https://smallbiz.app",
    businessName = "SmallBiz Financial Platform" }) {
  const mod = MODULE_CATALOG[moduleId];
  if (!mod) throw new Error(`Unknown moduleId: "${moduleId}"`);

  const schema = {
    "@context": "https://schema.org",
    "@type":    "WebApplication",
    "name":     mod.name,
    "url":      `${baseUrl}/calculators/${mod.slug}`,
    "description": mod.description,
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Any",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
    "provider": {
      "@type": "Organization",
      "name":  businessName,
      "url":   baseUrl,
    },
    "featureList": [mod.description],
    "screenshot": `${baseUrl}/screenshots/${mod.slug}.png`,
  };

  const scriptTag = `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`;
  return { schema, scriptTag };
}

/**
 * Build a UTM-tagged URL for campaign tracking.
 *
 * @param {string} baseUrl
 * @param {object} p
 * @param {string} p.source    – e.g. "google"
 * @param {string} p.medium    – e.g. "cpc"
 * @param {string} p.campaign  – e.g. "loan-calculator-q1"
 * @param {string} [p.term]
 * @param {string} [p.content]
 * @returns {object} { url, params }
 */
function buildUTMLink(baseUrl, { source, medium, campaign, term = "", content = "" }) {
  if (!source || !medium || !campaign)
    throw new Error("source, medium, and campaign are required.");

  const params = {
    utm_source:   source,
    utm_medium:   medium,
    utm_campaign: campaign,
    ...(term    ? { utm_term:    term    } : {}),
    ...(content ? { utm_content: content } : {}),
  };

  const qs  = Object.entries(params).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&");
  const url = `${baseUrl}${baseUrl.includes("?") ? "&" : "?"}${qs}`;
  return { url, params };
}

/**
 * Suggest keywords for a given topic.
 *
 * @param {string} topic – "loan" | "cashflow" | "risk" | "financial_statements" | "benchmarks" | "general"
 * @returns {Array} keyword objects with volume and difficulty
 */
function suggestKeywords(topic = "general") {
  const kws = KEYWORD_DATABASE[topic] || KEYWORD_DATABASE.general;
  return kws.map((k, i) => ({ rank: i + 1, ...k }));
}

/**
 * Generate an embeddable iframe widget snippet for a calculator.
 *
 * @param {string} moduleId
 * @param {object} [options]
 * @param {number}  [options.width=800]
 * @param {number}  [options.height=600]
 * @param {string}  [options.theme="light"]
 * @param {string}  [options.baseUrl="https://smallbiz.app"]
 * @returns {object} { iframeTag, fullSnippet, url }
 */
function getCalculatorEmbedCode(moduleId,
    { width = 800, height = 600, theme = "light", baseUrl = "https://smallbiz.app" } = {}) {
  const mod = MODULE_CATALOG[moduleId];
  if (!mod) throw new Error(`Unknown moduleId: "${moduleId}"`);

  const url        = `${baseUrl}/embed/${mod.slug}?theme=${theme}`;
  const iframeTag  = `<iframe src="${url}" width="${width}" height="${height}" frameborder="0" `
                   + `allowfullscreen loading="lazy" title="${mod.name}"></iframe>`;
  const fullSnippet = `<!-- SmallBiz ${mod.name} Widget -->\n`
                   + `<div style="max-width:${width}px;margin:0 auto;">\n`
                   + `  ${iframeTag}\n`
                   + `  <p style="font-size:12px;text-align:center;color:#94a3b8;">\n`
                   + `    Powered by <a href="${baseUrl}" target="_blank">SmallBiz Financial Platform</a>\n`
                   + `  </p>\n`
                   + `</div>`;

  return { iframeTag, fullSnippet, url, moduleId, width, height, theme };
}

/** Get full module catalog */
function getModuleCatalog() { return { ...MODULE_CATALOG }; }

module.exports = {
  generateMetaTags, generateSchemaOrg, buildUTMLink,
  suggestKeywords, getCalculatorEmbedCode, getModuleCatalog,
  MODULE_CATALOG,
};
