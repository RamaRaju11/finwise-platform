/**
 * Module 18: Paid Reports Engine
 *
 * Assembles structured, export-ready reports from data produced by other modules.
 * Reports are plain JS objects that the frontend renders as printable HTML.
 *
 * Report types:
 *   1. Loan Risk Report      – M2 + M1 + M4 data → risk assessment
 *   2. Business Plan         – M1 + M8 + M12 data → investor-ready plan
 *   3. Financial Summary     – M8 + M9 + M10 → three-statement snapshot
 *   4. Loan Viability Report – M3 + M5 + M7 → "should you take this loan?"
 *
 * Depends on: All previous modules (data passed as params, no hard imports)
 */

function _r(n) { return Math.round(n * 100) / 100; }

// ─── Report catalog ───────────────────────────────────────────────────────

const REPORT_CATALOG = [
  {
    id: "loan-risk",
    name: "Loan Risk Report",
    description: "Full risk assessment for a proposed loan — DSCR, DTI, stress scenarios, and verdict.",
    icon: "⚠️",
    price: { free: null, basic: null, pro: 299, enterprise: 0 },
    requiredModules: ["M2: Loan Engine", "M1: Cash Flow", "M4: Risk & Debt"],
    pages: "3–4 pages",
    useCases: ["Loan application support", "Banker presentation", "Internal risk review"],
  },
  {
    id: "business-plan",
    name: "Business Financial Plan",
    description: "Investor-ready plan with revenue projections, P&L forecast, and loan viability.",
    icon: "📋",
    price: { free: null, basic: null, pro: 499, enterprise: 0 },
    requiredModules: ["M1: Cash Flow", "M8: P&L", "M12: Forecasting"],
    pages: "5–7 pages",
    useCases: ["Investor deck", "Bank loan application", "Internal business planning"],
  },
  {
    id: "financial-summary",
    name: "Financial Statements Summary",
    description: "Three-statement report: P&L, Balance Sheet, and Cash Flow Statement in one document.",
    icon: "📊",
    price: { free: null, basic: null, pro: 399, enterprise: 0 },
    requiredModules: ["M8: P&L", "M9: Balance Sheet", "M10: Cash Flow Statement"],
    pages: "4–5 pages",
    useCases: ["Year-end review", "Auditor prep", "Lender package"],
  },
  {
    id: "loan-viability",
    name: "Loan Viability Report",
    description: "Clear yes/no verdict on whether your business can safely take a specific loan.",
    icon: "✅",
    price: { free: null, basic: 199, pro: 199, enterprise: 0 },
    requiredModules: ["M3: Affordability", "M5: Stress Test", "M7: Recommendations"],
    pages: "2–3 pages",
    useCases: ["Quick decision making", "Comparison between loan options", "Business owner briefing"],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/** Return the report catalog */
function getReportCatalog() { return [...REPORT_CATALOG]; }

/**
 * Get pricing for a specific report on a given subscription tier.
 * @param {string} reportId  – e.g. "loan-risk"
 * @param {string} tierId    – "free"|"basic"|"pro"|"enterprise"
 * @returns {object}
 */
function getReportPrice(reportId, tierId) {
  const report = REPORT_CATALOG.find(r => r.id === reportId);
  if (!report) throw new Error(`Unknown report: "${reportId}"`);
  const price = report.price[tierId];
  return {
    reportId, tierId,
    price:     price === null ? null : price,
    available: price !== null,
    note:      price === null ? `Not available on ${tierId} tier.` :
               price === 0   ? "Included in your plan." :
               `$${price} per report.`,
  };
}

/**
 * Generate a Loan Risk Report.
 *
 * @param {object} p
 * @param {string} [p.businessName="Business"]
 * @param {string} [p.reportDate]              – defaults to today
 * @param {object} p.loan                      – { principal, annualRate, tenureMonths, emi, lenderName }
 * @param {object} p.cashFlow                  – { revenue, fixedExpenses, variableExpenses, netCashFlow }
 * @param {object} p.risk                      – { dscr, dti, dtiPercent, riskLevel, riskScore }
 * @param {object} [p.stress]                  – { revenueDrop, expenseIncrease, rateIncrease } scenario results
 * @param {string} [p.preparedBy="SmallBiz Platform"]
 * @returns {object} structured report ready for rendering
 */
function generateLoanRiskReport({ businessName = "Business", reportDate,
    loan, cashFlow, risk, stress = null, preparedBy = "SmallBiz Platform" }) {
  _assertFields({ loan, cashFlow, risk }, ["loan", "cashFlow", "risk"]);

  const date  = reportDate || new Date().toLocaleDateString("en-US", { day:"2-digit", month:"long", year:"numeric" });
  const totalPayment   = _r(loan.emi * loan.tenureMonths);
  const totalInterest  = _r(totalPayment - loan.principal);
  const debtBurdenPct  = cashFlow.netCashFlow > 0
    ? _r((loan.emi / cashFlow.netCashFlow) * 100) : null;

  const verdict = _loanRiskVerdict(risk.dscr, risk.dtiPercent, risk.riskLevel);

  return {
    type:        "loan-risk",
    title:       "Loan Risk Assessment Report",
    businessName, reportDate: date, preparedBy,
    generatedAt: new Date().toISOString(),

    executiveSummary: {
      verdict:      verdict.decision,
      riskLevel:    risk.riskLevel,
      riskScore:    risk.riskScore,
      keyMessage:   verdict.message,
      highlights: [
        `Loan Amount: $${_fmt(loan.principal)} at ${loan.annualRate}% for ${loan.tenureMonths} months`,
        `Monthly EMI: $${_fmt(loan.emi)} (${debtBurdenPct !== null ? debtBurdenPct + "% of net cash flow" : "N/A"})`,
        `DSCR: ${risk.dscr} (${risk.dscr >= 1.25 ? "Healthy ≥ 1.25" : "Below threshold 1.25"})`,
        `DTI: ${risk.dtiPercent}% (${risk.dtiPercent < 35 ? "Acceptable < 35%" : "High ≥ 35%"})`,
      ],
    },

    loanDetails: {
      principal:    loan.principal,
      annualRate:   loan.annualRate,
      tenureMonths: loan.tenureMonths,
      emi:          loan.emi,
      totalPayment,
      totalInterest,
      lenderName:   loan.lenderName || "—",
    },

    cashFlowAnalysis: {
      monthlyRevenue:     cashFlow.revenue,
      monthlyFixedCosts:  cashFlow.fixedExpenses,
      monthlyVarCosts:    cashFlow.variableExpenses,
      netCashFlow:        cashFlow.netCashFlow,
      emiAfterLoan:       loan.emi,
      residualCashFlow:   _r(cashFlow.netCashFlow - loan.emi),
      debtBurdenPct,
    },

    riskAssessment: {
      dscr:      risk.dscr,
      dscrStatus: risk.dscr >= 1.5 ? "Strong" : risk.dscr >= 1.25 ? "Adequate" : risk.dscr >= 1.0 ? "Tight" : "Critical",
      dtiPercent: risk.dtiPercent,
      dtiStatus:  risk.dtiPercent < 30 ? "Conservative" : risk.dtiPercent < 35 ? "Acceptable" : "High",
      riskLevel:  risk.riskLevel,
      riskScore:  risk.riskScore,
    },

    stressResults: stress ? {
      revenueDrop20:     stress.revenueDrop || null,
      expenseIncrease15: stress.expenseIncrease || null,
      rateIncrease2pp:   stress.rateIncrease || null,
      worstCaseNote:     "If any scenario shows FAIL, reconsider loan size or tenure.",
    } : null,

    verdict,

    disclaimer: "This report is generated by SmallBiz Financial Platform for informational purposes only. " +
                "It does not constitute financial advice. Consult a qualified financial advisor before taking any loan.",
  };
}

/**
 * Generate a Business Financial Plan report.
 *
 * @param {object} p
 * @param {string} [p.businessName]
 * @param {string} [p.businessType]  – e.g. "Retail", "Services"
 * @param {object} p.cashFlow        – current period cash flow data
 * @param {object} p.pnl             – P&L data (from Module 8)
 * @param {object} p.forecast        – 12-month cash flow forecast (from Module 12)
 * @param {string} [p.loanPurpose]   – Why do you need the loan?
 * @param {number} [p.loanRequested] – Amount sought
 * @returns {object}
 */
function generateBusinessPlan({ businessName = "Business", businessType = "Small Business",
    cashFlow, pnl, forecast, loanPurpose = "", loanRequested = 0, preparedBy = "SmallBiz Platform",
    reportDate }) {
  _assertFields({ cashFlow, pnl, forecast }, ["cashFlow", "pnl", "forecast"]);
  const date = reportDate || new Date().toLocaleDateString("en-US", { day:"2-digit", month:"long", year:"numeric" });

  const sm = forecast.summary || {};
  const projectedGrowth = sm.totalRevenue && cashFlow.revenue
    ? _r(((sm.avgMonthlyRevenue - cashFlow.revenue) / cashFlow.revenue) * 100) : null;

  return {
    type:        "business-plan",
    title:       "Business Financial Plan",
    businessName, businessType, reportDate: date, preparedBy,
    generatedAt: new Date().toISOString(),

    businessOverview: {
      name:         businessName,
      type:         businessType,
      loanPurpose,
      loanRequested,
    },

    currentFinancials: {
      monthlyRevenue:  cashFlow.revenue,
      monthlyExpenses: cashFlow.totalExpenses,
      netCashFlow:     cashFlow.netCashFlow,
      grossMargin:     pnl.grossMargin,
      netMargin:       pnl.netMargin,
      operatingProfit: pnl.operatingProfit,
    },

    forecastSummary: {
      forecastPeriods:     sm.periods || 12,
      projectedRevenue12m: sm.totalRevenue,
      projectedNetCash12m: sm.totalNetCash,
      avgMonthlyRevenue:   sm.avgMonthlyRevenue,
      avgMonthlyCashFlow:  sm.avgMonthlyCashFlow,
      surplusMonths:       sm.surplusMonths,
      projectedGrowth,
      closingCash:         sm.closingCash,
    },

    monthlyProjections: (forecast.projections || []).slice(0, 12).map(p => ({
      period:       p.period,
      revenue:      p.revenue,
      netCashFlow:  p.netCashFlow,
      cumulative:   p.cumulativeCash,
    })),

    loanUtilizationPlan: loanPurpose ? {
      purpose:         loanPurpose,
      amount:          loanRequested,
      expectedROI:     "To be determined based on implementation",
    } : null,

    disclaimer: "This business plan is generated by SmallBiz Financial Platform for planning purposes only.",
  };
}

/**
 * Generate a Financial Statements Summary report.
 *
 * @param {object} p
 * @param {object} p.pnl           – Output of Module 8 calculatePeriodPL()
 * @param {object} p.balanceSheet  – Output of Module 9 buildBalanceSheet()
 * @param {object} p.cashFlow      – Output of Module 10 buildCashFlowStatement()
 */
function generateFinancialSummary({ businessName = "Business", pnl, balanceSheet,
    cashFlow, reportDate, preparedBy = "SmallBiz Platform" }) {
  _assertFields({ pnl, balanceSheet, cashFlow }, ["pnl", "balanceSheet", "cashFlow"]);
  const date = reportDate || new Date().toLocaleDateString("en-US", { day:"2-digit", month:"long", year:"numeric" });

  const bsSummary = balanceSheet.summary || balanceSheet;

  return {
    type:        "financial-summary",
    title:       "Financial Statements Summary",
    businessName, reportDate: date, preparedBy,
    generatedAt: new Date().toISOString(),

    profitLoss: {
      period:          pnl.period || date,
      revenue:         pnl.revenue,
      grossProfit:     pnl.grossProfit,
      grossMargin:     pnl.grossMargin,
      operatingProfit: pnl.operatingProfit,
      netProfitAfterTax: pnl.netProfitAfterTax,
      netMargin:       pnl.netMargin,
      status:          pnl.status,
    },

    balanceSheet: {
      period:          balanceSheet.period || date,
      totalAssets:     bsSummary.totalAssets,
      totalLiabilities: bsSummary.totalLiabilities,
      totalEquity:     bsSummary.totalEquity,
      isBalanced:      bsSummary.isBalanced,
      currentRatio:    balanceSheet.ratios?.currentRatio,
      debtToEquity:    balanceSheet.ratios?.debtToEquityRatio,
    },

    cashFlowStatement: {
      period:              cashFlow.period || date,
      openingCash:         cashFlow.openingCash,
      netCashFromOperating: cashFlow.summary?.netCashFromOperating || cashFlow.operating?.netCashFromOperating,
      netCashFromInvesting: cashFlow.summary?.netCashFromInvesting || cashFlow.investing?.netCashFromInvesting,
      netCashFromFinancing: cashFlow.summary?.netCashFromFinancing || cashFlow.financing?.netCashFromFinancing,
      closingCash:         cashFlow.summary?.closingCash,
    },

    interlinkCheck: {
      netProfitMatchesOperatingCF:
        pnl.netProfitAfterTax !== undefined && cashFlow.operating?.netProfit !== undefined
          ? Math.abs(pnl.netProfitAfterTax - cashFlow.operating.netProfit) < 0.02
          : null,
      closingCashMatchesBS:
        cashFlow.summary?.closingCash !== undefined && balanceSheet.assets?.cash !== undefined
          ? Math.abs(cashFlow.summary.closingCash - balanceSheet.assets.cash) < 0.02
          : null,
    },

    disclaimer: "This report is for informational purposes only.",
  };
}

/**
 * Generate a Loan Viability Report.
 *
 * @param {object} p
 * @param {object} p.affordability – Output of Module 3 assessAffordability()
 * @param {object} [p.stress]      – Output of Module 5 runAllScenarios()
 * @param {object} [p.recommendation] – Output of Module 7
 */
function generateLoanViabilityReport({ businessName = "Business", affordability,
    stress = null, recommendation = null, reportDate, preparedBy = "SmallBiz Platform" }) {
  if (!affordability) throw new Error("affordability data is required.");
  const date = reportDate || new Date().toLocaleDateString("en-US", { day:"2-digit", month:"long", year:"numeric" });

  const verdict = affordability.status === "affordable" ? "PROCEED"
    : affordability.status === "tight" ? "PROCEED WITH CAUTION"
    : "DO NOT PROCEED";

  return {
    type:        "loan-viability",
    title:       "Loan Viability Report",
    businessName, reportDate: date, preparedBy,
    generatedAt: new Date().toISOString(),

    verdict,
    verdictColor: verdict === "PROCEED" ? "green" : verdict === "PROCEED WITH CAUTION" ? "amber" : "red",

    affordabilityAnalysis: {
      status:         affordability.status,
      safeEMI:        affordability.safeEMI,
      desiredEMI:     affordability.desiredEMI,
      headroom:       affordability.headroom,
      shortfall:      affordability.shortfall,
      maxLoanAmount:  affordability.maxLoanAmount,
    },

    stressResults: stress ? {
      scenarios: stress.results || [],
      allPassed: stress.allPassed || false,
      worstCase: stress.worstScenario || null,
    } : null,

    recommendations: recommendation ? {
      decision:   recommendation.decision,
      actions:    recommendation.actions || [],
    } : null,

    disclaimer: "This report is generated by SmallBiz Financial Platform for informational purposes only.",
  };
}

// ─── Internal ─────────────────────────────────────────────────────────────

function _assertFields(data, required) {
  for (const key of required) {
    if (!data[key]) throw new Error(`Missing required field: "${key}"`);
  }
}

function _fmt(n) { return (n || 0).toLocaleString("en-US"); }

function _loanRiskVerdict(dscr, dtiPercent, riskLevel) {
  if (riskLevel === "Critical" || dscr < 1.0)
    return { decision: "DO NOT PROCEED", color: "red",
             message: "Critical risk — loan would severely strain your cash flow." };
  if (riskLevel === "High" || dscr < 1.25)
    return { decision: "HIGH RISK — RECONSIDER", color: "orange",
             message: "High risk — consider reducing loan amount or extending tenure." };
  if (riskLevel === "Moderate" || dtiPercent > 35)
    return { decision: "PROCEED WITH CAUTION", color: "amber",
             message: "Moderate risk — ensure you have 2+ months cash reserve." };
  return { decision: "SAFE TO PROCEED", color: "green",
           message: "Loan appears manageable based on current cash flow and risk metrics." };
}

module.exports = {
  getReportCatalog, getReportPrice,
  generateLoanRiskReport, generateBusinessPlan,
  generateFinancialSummary, generateLoanViabilityReport,
};
