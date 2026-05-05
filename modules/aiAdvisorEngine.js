/**
 * Module 21: AI Financial Advisor
 *
 * Rule-based financial advisory engine for small businesses.
 * No external API required — all logic is static rule trees.
 *
 * Capabilities:
 *   - scoreFinancialHealth(metrics)   → 0–100 score, grade, strengths, weaknesses
 *   - assessLoanReadiness(metrics)    → readiness score, blockers, tips, verdict
 *   - analyzeRatios(ratioMap)         → per-ratio interpretation and benchmarks
 *   - generateActionPlan(metrics)     → prioritized, actionable steps
 *   - getAdvisoryInsight(category, metrics) → focused insight for one area
 *
 * Depends on: results from M1–M12 (passed as plain params — no hard imports)
 */

function _r(n) { return Math.round(n * 100) / 100; }

// ─── Ratio definitions ────────────────────────────────────────────────────────

const RATIO_DEFINITIONS = {
  dscr: {
    name: "Debt Service Coverage Ratio (DSCR)",
    formula: "Net Operating Income ÷ Annual Debt Service",
    whatItMeasures: "How many times your income covers your loan payments. A DSCR of 1.25 means you earn $1.25 for every $1 of debt payment.",
    higherIsBetter: true,
    thresholds: [
      { min: 2.0,  label: "Excellent",   color: "green",  text: "Income covers debt 2x over — qualifies for best loan rates." },
      { min: 1.5,  label: "Good",        color: "blue",   text: "Comfortable coverage — most lenders will approve." },
      { min: 1.25, label: "Acceptable",  color: "amber",  text: "Meets minimum threshold — may face higher interest rates." },
      { min: 1.0,  label: "Tight",       color: "orange", text: "Barely covering debt — high default risk. Most lenders decline." },
      { min: 0,    label: "Critical",    color: "red",    text: "Income cannot cover debt payments. Immediate restructuring needed." },
    ],
    tip: "Aim for DSCR ≥ 1.5. Improve by growing revenue, reducing fixed costs, or extending loan tenure.",
  },
  dtiPct: {
    name: "Debt-to-Income Ratio (DTI)",
    formula: "Total Monthly Debt Payments ÷ Gross Monthly Income × 100",
    whatItMeasures: "Percentage of your income consumed by debt repayments.",
    higherIsBetter: false,
    thresholds: [
      { max: 20,  label: "Conservative", color: "green",  text: "Excellent — significant borrowing headroom available." },
      { max: 30,  label: "Manageable",   color: "blue",   text: "Within acceptable range for most lenders." },
      { max: 40,  label: "Moderate",     color: "amber",  text: "Approaching lender limits. Avoid new debt if possible." },
      { max: 50,  label: "High",         color: "orange", text: "Many lenders will hesitate. Reduce existing debt first." },
      { max: 999, label: "Critical",     color: "red",    text: "Debt consuming over half your income — unsustainable." },
    ],
    tip: "Keep DTI below 35% to maintain credit access. Prioritize paying down high-interest debt.",
  },
  grossMarginPct: {
    name: "Gross Profit Margin",
    formula: "(Revenue − COGS) ÷ Revenue × 100",
    whatItMeasures: "Percentage of revenue remaining after direct production costs.",
    higherIsBetter: true,
    thresholds: [
      { min: 60,  label: "Excellent",  color: "green",  text: "High-value product or service with strong pricing power." },
      { min: 40,  label: "Good",       color: "blue",   text: "Healthy margin — sufficient to cover operating costs and profit." },
      { min: 25,  label: "Average",    color: "amber",  text: "Typical for product businesses. Watch operating costs carefully." },
      { min: 10,  label: "Thin",       color: "orange", text: "Low margin — very sensitive to cost increases or price competition." },
      { min: 0,   label: "Critical",   color: "red",    text: "Gross margin critically low — pricing or cost strategy needs urgent review." },
    ],
    tip: "Improve by negotiating better supplier terms, raising prices on high-demand products, or shifting to higher-margin offerings.",
  },
  netMarginPct: {
    name: "Net Profit Margin",
    formula: "Net Profit After Tax ÷ Revenue × 100",
    whatItMeasures: "The percentage of revenue that becomes profit after ALL expenses and taxes.",
    higherIsBetter: true,
    thresholds: [
      { min: 20,   label: "Excellent",  color: "green",  text: "Outstanding profitability — highly efficient operations." },
      { min: 10,   label: "Good",       color: "blue",   text: "Above-average profitability for most industries." },
      { min: 5,    label: "Average",    color: "amber",  text: "Acceptable margin — monitor costs to prevent erosion." },
      { min: 0,    label: "Thin",       color: "orange", text: "Very thin profit — vulnerable to any cost increase or revenue drop." },
      { min: -999, label: "Loss",       color: "red",    text: "Operating at a loss. Immediate cost review or revenue growth needed." },
    ],
    tip: "Below 5% leaves little room for reinvestment. Focus on both revenue growth and cost discipline simultaneously.",
  },
  currentRatio: {
    name: "Current Ratio",
    formula: "Current Assets ÷ Current Liabilities",
    whatItMeasures: "Ability to pay short-term obligations using short-term assets.",
    higherIsBetter: true,
    thresholds: [
      { min: 2.5, label: "Very Strong", color: "green",  text: "Excellent liquidity — may indicate under-utilized assets." },
      { min: 1.5, label: "Healthy",     color: "blue",   text: "Good liquidity — comfortable buffer for short-term payments." },
      { min: 1.0, label: "Adequate",    color: "amber",  text: "Just enough assets to cover liabilities — monitor cash tightly." },
      { min: 0.7, label: "Tight",       color: "orange", text: "Struggling to meet short-term obligations — working capital needed." },
      { min: 0,   label: "Critical",    color: "red",    text: "Unable to cover short-term liabilities — insolvency risk." },
    ],
    tip: "Aim for 1.5–2.5. Too low risks default; too high may mean idle cash not being invested.",
  },
  debtToEquity: {
    name: "Debt-to-Equity Ratio",
    formula: "Total Liabilities ÷ Total Equity",
    whatItMeasures: "How much the business relies on debt versus owner investment.",
    higherIsBetter: false,
    thresholds: [
      { max: 0.5, label: "Conservative", color: "green",  text: "Very low leverage — mostly equity-funded. Highly stable." },
      { max: 1.0, label: "Balanced",     color: "blue",   text: "Good balance of debt and equity — healthy for most businesses." },
      { max: 2.0, label: "Moderate",     color: "amber",  text: "More debt than equity — acceptable for capital-intensive sectors." },
      { max: 4.0, label: "High",         color: "orange", text: "High leverage — increased vulnerability to economic downturns." },
      { max: 999, label: "Critical",     color: "red",    text: "Very high leverage — seek debt reduction immediately." },
    ],
    tip: "Service businesses should aim below 1.0; capital-intensive ones can sustain up to 2.0.",
  },
  operatingCFMarginPct: {
    name: "Operating Cash Flow Margin",
    formula: "Operating Cash Flow ÷ Revenue × 100",
    whatItMeasures: "Percentage of revenue converted to actual operating cash.",
    higherIsBetter: true,
    thresholds: [
      { min: 20, label: "Excellent",  color: "green",  text: "Strong cash conversion — business generates significant real cash." },
      { min: 10, label: "Good",       color: "blue",   text: "Healthy cash generation — well above break-even." },
      { min: 5,  label: "Average",    color: "amber",  text: "Adequate but thin — monitor working capital carefully." },
      { min: 0,  label: "Thin",       color: "orange", text: "Very low cash conversion despite potential profitability." },
      { min: -999, label: "Negative", color: "red",    text: "Negative operating cash flow — burning through reserves." },
    ],
    tip: "Operating CF margin often reveals true business health better than net margin due to accrual accounting differences.",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Score overall financial health on a 0–100 scale.
 *
 * @param {object} metrics
 * @param {number} metrics.revenue
 * @param {number} metrics.netCashFlow
 * @param {number} metrics.netMarginPct      – e.g. 8.5
 * @param {number} metrics.dscr
 * @param {number} metrics.dtiPct
 * @param {number} [metrics.currentRatio]
 * @param {number} [metrics.debtToEquity]
 * @param {number} [metrics.grossMarginPct]
 * @param {number} [metrics.revenueGrowthPct]
 * @returns {{ overallScore, grade, gradeColor, scores, strengths, weaknesses, recommendations, summary }}
 */
function scoreFinancialHealth({ revenue = 0, netCashFlow = 0, netMarginPct = 0,
    dscr = 0, dtiPct = 0, currentRatio, debtToEquity, grossMarginPct, revenueGrowthPct } = {}) {

  const scores      = {};
  const strengths   = [];
  const weaknesses  = [];
  const recommendations = [];

  // ── 1. Cash Flow Health (0–25) ────────────────────────────────────────────
  const cfMarginPct = revenue > 0 ? _r((netCashFlow / revenue) * 100) : 0;
  if (netCashFlow > 0 && cfMarginPct >= 20) {
    scores.cashFlow = 25;
    strengths.push({ area: "Cash Flow", message: `Strong cash flow margin of ${cfMarginPct}% — ample room for debt service and growth.` });
  } else if (netCashFlow > 0 && cfMarginPct >= 10) {
    scores.cashFlow = 18;
    strengths.push({ area: "Cash Flow", message: `Positive cash flow with ${cfMarginPct}% margin — healthy for current operations.` });
  } else if (netCashFlow > 0 && cfMarginPct >= 5) {
    scores.cashFlow = 12;
  } else if (netCashFlow > 0) {
    scores.cashFlow = 6;
    weaknesses.push({ area: "Cash Flow", message: `Cash flow margin below 5% — thin buffer against unexpected expenses.` });
  } else {
    scores.cashFlow = 0;
    weaknesses.push({ area: "Cash Flow", message: `Negative cash flow — urgent action required to restore financial stability.` });
    recommendations.push({ priority: 1, action: "Conduct expense audit. Cut variable costs immediately to restore positive cash flow.", impact: "Critical" });
  }

  // ── 2. Debt Coverage (0–25) ───────────────────────────────────────────────
  if (dscr >= 2.0) {
    scores.debtCoverage = 25;
    strengths.push({ area: "Debt Coverage", message: `Excellent DSCR of ${dscr} — income covers debt obligations 2× over.` });
  } else if (dscr >= 1.5) {
    scores.debtCoverage = 20;
    strengths.push({ area: "Debt Coverage", message: `Good DSCR of ${dscr} — comfortable debt service coverage.` });
  } else if (dscr >= 1.25) {
    scores.debtCoverage = 14;
  } else if (dscr >= 1.0) {
    scores.debtCoverage = 7;
    weaknesses.push({ area: "Debt Coverage", message: `DSCR of ${dscr} below the recommended 1.25 minimum — lenders will be cautious.` });
    recommendations.push({ priority: 2, action: "Work to increase DSCR above 1.25 before seeking new loans.", impact: "High" });
  } else if (dscr > 0) {
    scores.debtCoverage = 0;
    weaknesses.push({ area: "Debt Coverage", message: `DSCR of ${dscr} below 1.0 — income cannot cover current debt service.` });
    recommendations.push({ priority: 1, action: "Renegotiate loan terms to extend tenure, or reduce outstanding principal immediately.", impact: "Critical" });
  } else {
    scores.debtCoverage = 0;
  }

  // ── 3. Profitability (0–25) ───────────────────────────────────────────────
  if (netMarginPct >= 20) {
    scores.profitability = 25;
    strengths.push({ area: "Profitability", message: `Outstanding net margin of ${netMarginPct}% — highly efficient and profitable.` });
  } else if (netMarginPct >= 10) {
    scores.profitability = 20;
    strengths.push({ area: "Profitability", message: `Solid net margin of ${netMarginPct}% — above average for most industries.` });
  } else if (netMarginPct >= 5) {
    scores.profitability = 14;
  } else if (netMarginPct >= 0) {
    scores.profitability = 7;
    weaknesses.push({ area: "Profitability", message: `Net margin of ${netMarginPct}% is thin — focus on cost reduction or pricing strategy.` });
  } else {
    scores.profitability = 0;
    weaknesses.push({ area: "Profitability", message: `Negative net margin — business is operating at a loss.` });
    recommendations.push({ priority: 1, action: "Conduct urgent cost audit. Review pricing, eliminate non-essential overheads.", impact: "Critical" });
  }

  // ── 4. Debt Load (0–25) ───────────────────────────────────────────────────
  if (dtiPct <= 20) {
    scores.debtLoad = 25;
    strengths.push({ area: "Debt Load", message: `Low DTI of ${dtiPct}% — minimal debt burden with significant borrowing headroom.` });
  } else if (dtiPct <= 30) {
    scores.debtLoad = 20;
    strengths.push({ area: "Debt Load", message: `Manageable DTI of ${dtiPct}% — within acceptable range for most lenders.` });
  } else if (dtiPct <= 40) {
    scores.debtLoad = 12;
  } else if (dtiPct <= 50) {
    scores.debtLoad = 5;
    weaknesses.push({ area: "Debt Load", message: `High DTI of ${dtiPct}% — approaching limits that restrict new credit access.` });
    recommendations.push({ priority: 2, action: "Prioritize reducing existing debt before applying for new loans.", impact: "High" });
  } else {
    scores.debtLoad = 0;
    weaknesses.push({ area: "Debt Load", message: `Critical DTI of ${dtiPct}% — over half of income consumed by debt repayments.` });
    recommendations.push({ priority: 1, action: "Seek debt restructuring or consolidation to reduce monthly obligations.", impact: "Critical" });
  }

  // ── Optional metrics bonus ────────────────────────────────────────────────
  if (currentRatio !== undefined) {
    if (currentRatio < 1.0) {
      weaknesses.push({ area: "Liquidity", message: `Current ratio of ${currentRatio} below 1.0 — may struggle to meet short-term obligations.` });
      recommendations.push({ priority: 2, action: "Accelerate receivables collection. Offer early payment discounts to customers.", impact: "High" });
    } else if (currentRatio >= 2.0) {
      strengths.push({ area: "Liquidity", message: `Strong current ratio of ${currentRatio} — excellent short-term liquidity.` });
    }
  }

  if (revenueGrowthPct !== undefined) {
    if (revenueGrowthPct >= 20) {
      strengths.push({ area: "Growth", message: `Strong revenue growth of ${revenueGrowthPct}% — business is scaling effectively.` });
    } else if (revenueGrowthPct < 0) {
      weaknesses.push({ area: "Growth", message: `Revenue declining ${Math.abs(revenueGrowthPct)}% — investigate root cause urgently.` });
      recommendations.push({ priority: 2, action: "Analyze customer churn, pipeline quality, and sales cycle. Develop a growth recovery plan.", impact: "High" });
    }
  }

  if (grossMarginPct !== undefined && grossMarginPct < 25) {
    weaknesses.push({ area: "Gross Margin", message: `Low gross margin of ${grossMarginPct}% — review COGS and pricing strategy.` });
    recommendations.push({ priority: 3, action: "Negotiate supplier contracts and review product pricing to improve gross margins.", impact: "Medium" });
  }

  const totalScore = Math.min(100, Object.values(scores).reduce((s, v) => s + v, 0));

  let grade, gradeColor;
  if (totalScore >= 80) { grade = "A — Excellent";  gradeColor = "green"; }
  else if (totalScore >= 65) { grade = "B — Good";   gradeColor = "blue";  }
  else if (totalScore >= 50) { grade = "C — Fair";   gradeColor = "amber"; }
  else if (totalScore >= 35) { grade = "D — Weak";   gradeColor = "orange";}
  else { grade = "F — Poor"; gradeColor = "red"; }

  recommendations.sort((a, b) => a.priority - b.priority);

  return {
    overallScore: totalScore,
    maxScore: 100,
    grade, gradeColor,
    scores,
    strengths,
    weaknesses,
    recommendations,
    summary: `${grade} (${totalScore}/100). ${strengths.length} strength(s), ${weaknesses.length} area(s) need attention.`,
  };
}

/**
 * Assess readiness to take on a new business loan.
 *
 * @param {object} metrics
 * @param {number} metrics.dscr
 * @param {number} metrics.dtiPct
 * @param {number} metrics.netCashFlow
 * @param {number} [metrics.creditScore]     – 300–900 (FICO-style)
 * @param {number} [metrics.monthsInBusiness]
 * @param {number} [metrics.currentRatio]
 * @returns {{ score, verdict, verdictColor, blockers, enablers, nextSteps }}
 */
function assessLoanReadiness({ dscr = 0, dtiPct = 100, netCashFlow = 0,
    creditScore, monthsInBusiness, currentRatio } = {}) {
  let score = 0;
  const blockers = [];
  const enablers = [];

  // DSCR (0–30)
  if (dscr >= 1.75) {
    score += 30;
    enablers.push(`DSCR of ${dscr} — excellent debt repayment capacity.`);
  } else if (dscr >= 1.5) {
    score += 25;
    enablers.push(`DSCR of ${dscr} — good debt service coverage.`);
  } else if (dscr >= 1.25) {
    score += 18;
    enablers.push(`DSCR of ${dscr} meets minimum lender requirements.`);
  } else if (dscr >= 1.0) {
    score += 8;
    blockers.push(`DSCR of ${dscr} is below the 1.25 minimum — most lenders will decline or charge premium rates.`);
  } else {
    blockers.push(`DSCR of ${dscr} below 1.0 — loan repayment is not feasible with current income.`);
  }

  // DTI (0–25)
  if (dtiPct <= 25) {
    score += 25;
    enablers.push(`Low DTI of ${dtiPct}% — significant debt headroom available.`);
  } else if (dtiPct <= 35) {
    score += 18;
    enablers.push(`Manageable DTI of ${dtiPct}% — within lender acceptable range.`);
  } else if (dtiPct <= 45) {
    score += 8;
    blockers.push(`DTI of ${dtiPct}% is high — lenders prefer below 40%.`);
  } else {
    blockers.push(`Critical DTI of ${dtiPct}% — unlikely to qualify for additional debt.`);
  }

  // Cash Flow (0–20)
  if (netCashFlow > 0) {
    score += 20;
    enablers.push("Positive cash flow demonstrates operational health.");
  } else {
    blockers.push("Negative cash flow is a primary red flag for all lenders.");
  }

  // Credit Score (0–15)
  if (creditScore !== undefined) {
    if (creditScore >= 750) {
      score += 15;
      enablers.push(`Excellent credit score of ${creditScore} — qualifies for best rates.`);
    } else if (creditScore >= 700) {
      score += 10;
      enablers.push(`Good credit score of ${creditScore}.`);
    } else if (creditScore >= 650) {
      score += 5;
    } else {
      blockers.push(`Credit score of ${creditScore} below 650 — limits lender options significantly.`);
    }
  } else {
    score += 8; // neutral assumption
  }

  // Business Age (0–10)
  if (monthsInBusiness !== undefined) {
    if (monthsInBusiness >= 36) {
      score += 10;
      enablers.push(`${Math.floor(monthsInBusiness / 12)} years in business — demonstrates stability.`);
    } else if (monthsInBusiness >= 12) {
      score += 6;
    } else {
      blockers.push(`Business under 12 months — most traditional lenders require 1+ year history.`);
    }
  } else {
    score += 5;
  }

  // Current Ratio bonus
  if (currentRatio !== undefined && currentRatio >= 1.5) {
    score = Math.min(100, score + 5);
    enablers.push(`Healthy current ratio of ${currentRatio} — good short-term liquidity.`);
  }

  score = Math.min(100, score);

  let verdict, verdictColor;
  if (blockers.length === 0 && score >= 70) { verdict = "LOAN READY";          verdictColor = "green"; }
  else if (score >= 50)                      { verdict = "CONDITIONALLY READY"; verdictColor = "amber"; }
  else                                       { verdict = "NOT READY";           verdictColor = "red";   }

  const nextSteps = _getLoanReadinessSteps(verdict, blockers);

  return { score, maxScore: 100, verdict, verdictColor, blockers, enablers, nextSteps };
}

/**
 * Analyze one or more financial ratios and return per-ratio interpretations.
 *
 * @param {object} ratioMap – { dscr: 1.8, dtiPct: 28, netMarginPct: 12, ... }
 * @returns {Array} per-ratio interpretation objects
 */
function analyzeRatios(ratioMap = {}) {
  return Object.entries(ratioMap).map(([key, value]) => {
    const def = RATIO_DEFINITIONS[key];
    if (!def) return { ratioKey: key, value, label: "Unknown", color: "gray", interpretation: "No definition available." };

    let label, color, interpretation;
    const thresholds = def.thresholds;

    if (def.higherIsBetter) {
      const match = thresholds.find(t => value >= t.min) || thresholds[thresholds.length - 1];
      label = match.label; color = match.color; interpretation = match.text;
    } else {
      const match = thresholds.find(t => value <= t.max) || thresholds[thresholds.length - 1];
      label = match.label; color = match.color; interpretation = match.text;
    }

    return {
      ratioKey:     key,
      name:         def.name,
      formula:      def.formula,
      whatItMeasures: def.whatItMeasures,
      value,
      label,
      color,
      interpretation,
      tip:          def.tip,
      higherIsBetter: def.higherIsBetter,
    };
  });
}

/**
 * Generate a prioritized action plan from a full metrics set.
 *
 * @param {object} metrics – same shape as scoreFinancialHealth
 * @returns {{ actions, totalActions, criticalCount, overallGrade }}
 */
function generateActionPlan(metrics = {}) {
  const health   = scoreFinancialHealth(metrics);
  const readiness = assessLoanReadiness(metrics);
  const actions  = [...health.recommendations];

  const { dscr = 0, dtiPct = 0, netMarginPct = 0, netCashFlow = 0,
          currentRatio, grossMarginPct, revenueGrowthPct } = metrics;

  // Growth-phase actions when financials are strong
  if (dscr >= 1.5 && dtiPct <= 30 && netCashFlow > 0) {
    actions.push({ priority: 4, action: "Build a 3-month operating cash reserve before your next growth move.", impact: "Medium" });
    actions.push({ priority: 4, action: "Explore refinancing existing loans at lower rates — DSCR is strong enough.", impact: "Medium" });
  }

  if (dscr >= 1.25 && dscr < 1.5) {
    actions.push({ priority: 2, action: "Build a 2-month emergency cash reserve before taking on any new debt.", impact: "High" });
  }

  if (netMarginPct > 0 && netMarginPct < 8) {
    actions.push({ priority: 3, action: "Review your bottom 20% of product/service lines — eliminate or reprice low-margin offerings.", impact: "Medium" });
    actions.push({ priority: 3, action: "Automate 1–2 operational processes to reduce recurring labor costs.", impact: "Medium" });
  }

  if (currentRatio !== undefined && currentRatio < 1.5 && currentRatio >= 1.0) {
    actions.push({ priority: 3, action: "Improve working capital: offer 2% early-payment discounts to customers and extend supplier payment terms.", impact: "Medium" });
  }

  if (netCashFlow > 0 && dtiPct <= 35) {
    actions.push({ priority: 4, action: "Make extra principal payments on highest-rate loans to reduce total interest cost.", impact: "Low" });
  }

  if (revenueGrowthPct !== undefined && revenueGrowthPct > 15) {
    actions.push({ priority: 3, action: "Revenue growing fast — ensure cash flow keeps pace. Consider invoice factoring or credit line for working capital.", impact: "Medium" });
  }

  if (grossMarginPct !== undefined && grossMarginPct >= 50) {
    actions.push({ priority: 4, action: "High gross margin — consider investing in sales/marketing to scale revenue without proportional cost increase.", impact: "High" });
  }

  actions.sort((a, b) => a.priority - b.priority);

  return {
    actions:      actions.slice(0, 8),
    totalActions: actions.length,
    criticalCount: actions.filter(a => a.impact === "Critical").length,
    overallGrade: health.grade,
    loanVerdict:  readiness.verdict,
  };
}

/**
 * Get a focused advisory insight for one specific area.
 *
 * @param {"cashflow"|"debt"|"profitability"|"growth"|"loan"} category
 * @param {object} metrics
 * @returns {{ insight, recommendation, urgency }}
 */
function getAdvisoryInsight(category, metrics = {}) {
  const { netCashFlow = 0, revenue = 0, dscr = 0, dtiPct = 0,
          netMarginPct = 0, grossMarginPct, revenueGrowthPct } = metrics;

  switch (category) {
    case "cashflow": {
      const cfM = revenue > 0 ? _r((netCashFlow / revenue) * 100) : 0;
      if (netCashFlow > 0 && cfM >= 15)
        return { insight: `Cash flow margin of ${cfM}% is strong. Your business is generating healthy surplus.`, recommendation: "Allocate surplus to loan prepayment or a growth reserve fund.", urgency: "low" };
      if (netCashFlow > 0)
        return { insight: `Cash flow is positive but margin (${cfM}%) is thin. Any revenue shock could turn it negative.`, recommendation: "Identify and cut 2–3 recurring expenses that deliver low value.", urgency: "medium" };
      return { insight: "Negative cash flow is the most urgent risk to address.", recommendation: "Pause all discretionary spending. Focus on converting inventory to cash and collecting overdue receivables.", urgency: "high" };
    }
    case "debt": {
      if (dscr >= 1.5 && dtiPct <= 30)
        return { insight: `DSCR ${dscr} and DTI ${dtiPct}% are both healthy. Debt is well-managed.`, recommendation: "Maintain discipline. Consider one strategic loan for growth if opportunity arises.", urgency: "low" };
      if (dscr < 1.25 || dtiPct > 40)
        return { insight: `Debt metrics (DSCR: ${dscr}, DTI: ${dtiPct}%) are concerning — lenders will notice.`, recommendation: "Prioritize debt reduction before taking any new credit. Explore balance transfer or refinancing.", urgency: "high" };
      return { insight: `Debt is manageable (DSCR: ${dscr}, DTI: ${dtiPct}%) but has room to improve.`, recommendation: "Avoid new debt until DSCR exceeds 1.5 and DTI drops below 30%.", urgency: "medium" };
    }
    case "profitability": {
      if (netMarginPct >= 10)
        return { insight: `Net margin of ${netMarginPct}% is above average. Profitability is solid.`, recommendation: "Reinvest profits in high-ROI activities: staff training, equipment, or marketing.", urgency: "low" };
      if (netMarginPct >= 0)
        return { insight: `Net margin of ${netMarginPct}% is thin — one bad month can wipe profits.`, recommendation: "Run a cost-per-customer analysis. Identify your most and least profitable customer segments.", urgency: "medium" };
      return { insight: "Business is loss-making. Every month losses compound.", recommendation: "Immediate action: price increase on top-selling products, cut bottom 3 expense lines, and chase overdue invoices.", urgency: "high" };
    }
    case "growth": {
      if (revenueGrowthPct !== undefined && revenueGrowthPct > 20)
        return { insight: `Revenue growing at ${revenueGrowthPct}% — outstanding growth trajectory.`, recommendation: "Ensure systems and cash flow can handle scale. Hire ahead of demand, not behind it.", urgency: "low" };
      if (revenueGrowthPct !== undefined && revenueGrowthPct < 0)
        return { insight: `Revenue declining at ${Math.abs(revenueGrowthPct)}% — this requires immediate diagnosis.`, recommendation: "Conduct customer exit interviews. Audit your top 5 churned accounts from the last quarter.", urgency: "high" };
      return { insight: "Growth is steady. Focus on improving unit economics before aggressive scaling.", recommendation: "Identify your highest-margin customer segment and double down on acquiring more of them.", urgency: "low" };
    }
    case "loan": {
      const readiness = assessLoanReadiness(metrics);
      return {
        insight: `Loan readiness score: ${readiness.score}/100 — ${readiness.verdict}.`,
        recommendation: readiness.blockers.length > 0
          ? `Address these before applying: ${readiness.blockers[0]}`
          : readiness.enablers[0] || "Your financials are in good shape for a loan application.",
        urgency: readiness.verdict === "NOT READY" ? "high" : readiness.verdict === "CONDITIONALLY READY" ? "medium" : "low",
      };
    }
    default:
      throw new Error(`Unknown category: "${category}". Valid: cashflow, debt, profitability, growth, loan`);
  }
}

// ─── Internal ─────────────────────────────────────────────────────────────────

function _getLoanReadinessSteps(verdict, blockers) {
  if (verdict === "LOAN READY") {
    return [
      "Gather 6 months of bank statements and financial statements.",
      "Compare lenders using the Loan Marketplace (Module 16).",
      "Use the Affordability Engine (Module 3) to determine the optimal loan amount.",
      "Request pre-approval letters from your top 2–3 lenders.",
    ];
  }
  if (verdict === "CONDITIONALLY READY") {
    return [
      ...blockers.map(b => `Resolve: ${b}`),
      "Re-run this readiness check after addressing blockers above.",
      "Meanwhile, compare lenders so you know your options.",
    ];
  }
  return [
    ...blockers.map(b => `Critical: ${b}`),
    "Focus on restoring positive cash flow first — all other improvements follow.",
    "Set a target: DSCR ≥ 1.25 and DTI ≤ 40% before re-applying.",
    "Consider alternative financing: invoice factoring, business credit card, or owner capital.",
  ];
}

module.exports = {
  scoreFinancialHealth, assessLoanReadiness,
  analyzeRatios, generateActionPlan, getAdvisoryInsight,
  RATIO_DEFINITIONS,
};
