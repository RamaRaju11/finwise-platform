/**
 * Module 6: Multi-Loan Manager
 *
 * Depends on: Module 2 (Loan Engine), Module 4 (Risk & Debt)
 *
 * Features: combine multiple loans, total EMI, total exposure, combined risk
 */

/**
 * Calculate EMI for a single loan.
 * Formula: EMI = P × r × (1+r)^n / ((1+r)^n - 1)
 */
function _calcEMI(principal, annualRate, tenureMonths) {
  const r = annualRate / 12 / 100;
  if (r === 0) return _round(principal / tenureMonths);
  const f = Math.pow(1 + r, tenureMonths);
  return _round((principal * r * f) / (f - 1));
}

function _round(n) { return Math.round(n * 100) / 100; }

/**
 * Validate and enrich a single loan object.
 *
 * @param {object} loan
 * @param {string} loan.name          - Loan label (e.g. "Business Loan")
 * @param {number} loan.principal     - Outstanding principal
 * @param {number} loan.annualRate    - Annual interest rate %
 * @param {number} loan.tenureMonths  - Remaining tenure in months
 * @returns {object} enriched loan with emi, totalPayment, totalInterest
 */
function enrichLoan(loan) {
  const { name, principal, annualRate, tenureMonths } = loan;
  if (!name || typeof name !== "string")                    throw new Error("Each loan must have a name.");
  if (typeof principal !== "number" || principal <= 0)      throw new Error(`Loan "${name}": principal must be > 0.`);
  if (typeof annualRate !== "number" || annualRate < 0)     throw new Error(`Loan "${name}": annualRate cannot be negative.`);
  if (!Number.isInteger(tenureMonths) || tenureMonths <= 0) throw new Error(`Loan "${name}": tenureMonths must be a positive integer.`);

  const emi          = _calcEMI(principal, annualRate, tenureMonths);
  const totalPayment = _round(emi * tenureMonths);
  const totalInterest = _round(totalPayment - principal);

  return { name, principal, annualRate, tenureMonths, emi, totalPayment, totalInterest };
}

/**
 * Calculate the combined summary for a portfolio of loans.
 *
 * @param {Array<object>} loans  - Array of loan objects (each with name, principal, annualRate, tenureMonths)
 * @returns {{
 *   loans: Array,
 *   totalPrincipal: number,
 *   totalEMI: number,
 *   totalPayment: number,
 *   totalInterest: number,
 *   loanCount: number,
 *   heaviestEMILoan: object,
 *   highestRateLoan: object,
 *   longestTenureLoan: object
 * }}
 */
function calculatePortfolioSummary(loans) {
  if (!Array.isArray(loans) || loans.length === 0) throw new Error("loans must be a non-empty array.");

  const enriched = loans.map(enrichLoan);

  const totalPrincipal = _round(enriched.reduce((s, l) => s + l.principal, 0));
  const totalEMI       = _round(enriched.reduce((s, l) => s + l.emi, 0));
  const totalPayment   = _round(enriched.reduce((s, l) => s + l.totalPayment, 0));
  const totalInterest  = _round(enriched.reduce((s, l) => s + l.totalInterest, 0));

  const heaviestEMILoan   = enriched.reduce((a, b) => a.emi > b.emi ? a : b);
  const highestRateLoan   = enriched.reduce((a, b) => a.annualRate > b.annualRate ? a : b);
  const longestTenureLoan = enriched.reduce((a, b) => a.tenureMonths > b.tenureMonths ? a : b);

  return {
    loans: enriched,
    loanCount: enriched.length,
    totalPrincipal,
    totalEMI,
    totalPayment,
    totalInterest,
    heaviestEMILoan,
    highestRateLoan,
    longestTenureLoan,
  };
}

/**
 * Analyse combined risk of the full loan portfolio.
 * Integrates with Module 4 (DSCR, DTI).
 *
 * @param {Array<object>} loans
 * @param {number} grossMonthlyIncome      - Total monthly revenue
 * @param {number} monthlyOperatingExpenses - Monthly expenses excluding debt
 * @returns {{
 *   portfolio: object,
 *   riskMetrics: { dscr, dscrStatus, dti, dtiStatus },
 *   riskLevel: string,
 *   alerts: string[],
 *   recommendations: string[]
 * }}
 */
function analyzePortfolioRisk(loans, grossMonthlyIncome, monthlyOperatingExpenses) {
  if (typeof grossMonthlyIncome !== "number" || grossMonthlyIncome <= 0)
    throw new Error("grossMonthlyIncome must be > 0.");
  if (typeof monthlyOperatingExpenses !== "number" || monthlyOperatingExpenses < 0)
    throw new Error("monthlyOperatingExpenses cannot be negative.");

  const portfolio        = calculatePortfolioSummary(loans);
  const netOpIncome      = _round(grossMonthlyIncome - monthlyOperatingExpenses);
  const totalDebtService = portfolio.totalEMI;

  const dscr       = totalDebtService > 0 ? _round(netOpIncome / totalDebtService) : null;
  const dti        = _round((totalDebtService / grossMonthlyIncome) * 100);
  const cashAfterDebt = _round(netOpIncome - totalDebtService);

  const dscrStatus = _dscrStatus(dscr);
  const dtiStatus  = _dtiStatus(dti);

  // Risk score (same logic as Module 4)
  let score = 0;
  score += { strong:0, adequate:15, caution:30, danger:50, "no-debt":0 }[dscrStatus] ?? 0;
  score += { excellent:0, good:10, moderate:30, "high-risk":50 }[dtiStatus] ?? 0;
  const riskLevel = score <= 10 ? "Low" : score <= 30 ? "Moderate" : score <= 55 ? "High" : "Critical";

  const alerts = [];
  if (netOpIncome <= 0)
    alerts.push("Net operating income is zero or negative.");
  if (dscrStatus === "danger")
    alerts.push(`DSCR ${dscr?.toFixed(2)} < 1.0 — combined debt exceeds operating income.`);
  else if (dscrStatus === "caution")
    alerts.push(`DSCR ${dscr?.toFixed(2)} is between 1.0–1.25 — barely covered.`);
  if (dtiStatus === "high-risk")
    alerts.push(`DTI ${dti.toFixed(1)}% > 50% — over half of revenue goes to debt.`);
  else if (dtiStatus === "moderate")
    alerts.push(`DTI ${dti.toFixed(1)}% is elevated (35–50%). Avoid new borrowing.`);
  if (cashAfterDebt < 0)
    alerts.push("Cash flow is negative after all debt payments.");

  const recommendations = [];
  if (dscrStatus === "danger" || dscrStatus === "caution")
    recommendations.push(`Consider prepaying the highest-rate loan first: "${portfolio.highestRateLoan.name}" at ${portfolio.highestRateLoan.annualRate}%.`);
  if (dtiStatus === "high-risk" || dtiStatus === "moderate")
    recommendations.push(`Consolidate loans or refinance "${portfolio.heaviestEMILoan.name}" (highest EMI: $${portfolio.heaviestEMILoan.emi.toLocaleString()}).`);
  if (riskLevel === "Low")
    recommendations.push("Portfolio risk is low. Business is well-positioned for additional financing if needed.");

  return {
    portfolio,
    inputs: { grossMonthlyIncome, monthlyOperatingExpenses, netOpIncome },
    riskMetrics: { dscr, dscrStatus, dti, dtiStatus, cashAfterDebt },
    riskLevel,
    riskScore: score,
    alerts,
    recommendations,
  };
}

/**
 * Simulate adding a new loan to an existing portfolio and show the impact.
 *
 * @param {Array<object>} existingLoans
 * @param {object} newLoan
 * @param {number} grossMonthlyIncome
 * @param {number} monthlyOperatingExpenses
 * @returns {{ before: object, after: object, impact: object }}
 */
function simulateAddLoan(existingLoans, newLoan, grossMonthlyIncome, monthlyOperatingExpenses) {
  const before = analyzePortfolioRisk(existingLoans, grossMonthlyIncome, monthlyOperatingExpenses);
  const after  = analyzePortfolioRisk([...existingLoans, newLoan], grossMonthlyIncome, monthlyOperatingExpenses);

  const impact = {
    emiIncrease:        _round(after.portfolio.totalEMI - before.portfolio.totalEMI),
    principalIncrease:  _round(after.portfolio.totalPrincipal - before.portfolio.totalPrincipal),
    dscrChange:         after.riskMetrics.dscr !== null && before.riskMetrics.dscr !== null
                          ? _round(after.riskMetrics.dscr - before.riskMetrics.dscr) : null,
    dtiChange:          _round(after.riskMetrics.dti - before.riskMetrics.dti),
    riskLevelChange:    before.riskLevel !== after.riskLevel
                          ? `${before.riskLevel} → ${after.riskLevel}` : "unchanged",
    advisable:          after.riskLevel !== "Critical" && after.riskMetrics.dscr >= 1.0,
  };

  return { before, after, impact };
}

// ─── Internal helpers ──────────────────────────────────────────────────────

function _dscrStatus(d) {
  if (d === null) return "no-debt";
  if (d >= 1.5)   return "strong";
  if (d >= 1.25)  return "adequate";
  if (d >= 1.0)   return "caution";
  return "danger";
}

function _dtiStatus(d) {
  if (d < 20) return "excellent";
  if (d < 35) return "good";
  if (d < 50) return "moderate";
  return "high-risk";
}

module.exports = { enrichLoan, calculatePortfolioSummary, analyzePortfolioRisk, simulateAddLoan };
