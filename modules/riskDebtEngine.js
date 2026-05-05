/**
 * Module 4: Risk & Debt Engine
 *
 * Metrics : DSCR (Debt Service Coverage Ratio), DTI (Debt-to-Income Ratio)
 * Outputs : risk level, alerts
 */

/**
 * Calculate DSCR — can the business cover its debt from operating income?
 *
 * Formula: DSCR = Net Operating Income / Total Debt Service
 *
 * Benchmarks:
 *   ≥ 1.50  → Strong
 *   1.25–1.49 → Adequate
 *   1.00–1.24 → Caution
 *   < 1.00  → Danger (cannot cover debt)
 *
 * @param {number} netOperatingIncome  - Revenue minus operating expenses (excl. debt)
 * @param {number} totalDebtService    - Total monthly principal + interest payments
 * @returns {{ dscr: number, status: string, label: string }}
 */
function calculateDSCR(netOperatingIncome, totalDebtService) {
  if (typeof netOperatingIncome !== "number") throw new Error("netOperatingIncome must be a number.");
  if (typeof totalDebtService !== "number")   throw new Error("totalDebtService must be a number.");
  if (totalDebtService <= 0) throw new Error("totalDebtService must be greater than 0.");

  const dscr = _round(netOperatingIncome / totalDebtService);

  let status, label;
  if (dscr >= 1.5)       { status = "strong";   label = "Strong — well covered"; }
  else if (dscr >= 1.25) { status = "adequate";  label = "Adequate — safe with buffer"; }
  else if (dscr >= 1.0)  { status = "caution";   label = "Caution — barely covered"; }
  else                   { status = "danger";    label = "Danger — income insufficient to cover debt"; }

  return { dscr, status, label };
}

/**
 * Calculate DTI — what share of income goes to debt payments?
 *
 * Formula: DTI = (Total Monthly Debt / Gross Monthly Income) × 100
 *
 * Benchmarks:
 *   < 20%   → Excellent
 *   20–35%  → Good
 *   35–50%  → Moderate
 *   > 50%   → High Risk
 *
 * @param {number} totalMonthlyDebt    - All monthly debt payments (EMIs)
 * @param {number} grossMonthlyIncome  - Total monthly revenue (before expenses)
 * @returns {{ dti: number, dtiPercent: string, status: string, label: string }}
 */
function calculateDTI(totalMonthlyDebt, grossMonthlyIncome) {
  if (typeof totalMonthlyDebt !== "number")   throw new Error("totalMonthlyDebt must be a number.");
  if (typeof grossMonthlyIncome !== "number") throw new Error("grossMonthlyIncome must be a number.");
  if (grossMonthlyIncome <= 0) throw new Error("grossMonthlyIncome must be greater than 0.");
  if (totalMonthlyDebt < 0)    throw new Error("totalMonthlyDebt cannot be negative.");

  const dti = _round((totalMonthlyDebt / grossMonthlyIncome) * 100);

  let status, label;
  if (dti < 20)      { status = "excellent"; label = "Excellent — very low debt burden"; }
  else if (dti < 35) { status = "good";      label = "Good — manageable debt load"; }
  else if (dti < 50) { status = "moderate";  label = "Moderate — monitor closely"; }
  else               { status = "high-risk"; label = "High Risk — debt burden is excessive"; }

  return { dti, dtiPercent: dti.toFixed(1) + "%", status, label };
}

/**
 * Full risk assessment combining DSCR + DTI with alerts.
 *
 * @param {object} params
 * @param {number} params.grossMonthlyIncome   - Total revenue
 * @param {number} params.operatingExpenses    - Monthly expenses excluding debt
 * @param {number} params.totalDebtService     - Monthly principal + interest (all loans)
 * @param {number} [params.proposedNewEMI=0]   - EMI of a loan being considered
 * @returns {{
 *   dscr: object, dti: object,
 *   riskLevel: string, riskScore: number,
 *   alerts: string[], recommendations: string[]
 * }}
 */
function assessRisk({
  grossMonthlyIncome,
  operatingExpenses,
  totalDebtService,
  proposedNewEMI = 0,
}) {
  if (grossMonthlyIncome <= 0) throw new Error("grossMonthlyIncome must be greater than 0.");
  if (operatingExpenses < 0)   throw new Error("operatingExpenses cannot be negative.");
  if (totalDebtService < 0)    throw new Error("totalDebtService cannot be negative.");
  if (proposedNewEMI < 0)      throw new Error("proposedNewEMI cannot be negative.");

  const totalDebt         = _round(totalDebtService + proposedNewEMI);
  const netOperatingIncome = _round(grossMonthlyIncome - operatingExpenses);

  // DSCR needs at least some debt to be meaningful
  const dscrResult = totalDebt > 0
    ? calculateDSCR(netOperatingIncome, totalDebt)
    : { dscr: null, status: "no-debt", label: "No debt obligations" };

  const dtiResult  = calculateDTI(totalDebt > 0 ? totalDebt : 0.01, grossMonthlyIncome);
  // If no debt, DTI is effectively 0
  const dtiForCalc = totalDebt > 0 ? dtiResult : { ...dtiResult, dti: 0, dtiPercent: "0%", status: "excellent" };

  const alerts          = _buildAlerts(dscrResult, dtiForCalc, netOperatingIncome, proposedNewEMI);
  const recommendations = _buildRecommendations(dscrResult, dtiForCalc, netOperatingIncome);
  const { riskLevel, riskScore } = _computeOverallRisk(dscrResult, dtiForCalc);

  return {
    inputs: {
      grossMonthlyIncome,
      operatingExpenses,
      netOperatingIncome,
      totalDebtService,
      proposedNewEMI,
      totalDebt,
    },
    dscr: dscrResult,
    dti: totalDebt > 0 ? dtiResult : { dti: 0, dtiPercent: "0%", status: "excellent", label: "No debt" },
    riskLevel,
    riskScore,
    alerts,
    recommendations,
  };
}

// ─── Internal helpers ──────────────────────────────────────────────────────

function _round(n) { return Math.round(n * 100) / 100; }

function _computeOverallRisk(dscr, dti) {
  let score = 0;

  // DSCR scoring (0–50 pts)
  if (dscr.status === "strong")   score += 0;
  else if (dscr.status === "adequate")  score += 15;
  else if (dscr.status === "caution")   score += 30;
  else if (dscr.status === "danger")    score += 50;
  else score += 0; // no-debt

  // DTI scoring (0–50 pts)
  if (dti.status === "excellent") score += 0;
  else if (dti.status === "good")      score += 10;
  else if (dti.status === "moderate")  score += 30;
  else if (dti.status === "high-risk") score += 50;

  let riskLevel;
  if (score <= 10)      riskLevel = "Low";
  else if (score <= 30) riskLevel = "Moderate";
  else if (score <= 55) riskLevel = "High";
  else                  riskLevel = "Critical";

  return { riskLevel, riskScore: score };
}

function _buildAlerts(dscr, dti, noi, proposedEMI) {
  const alerts = [];
  if (noi <= 0)
    alerts.push("⚠️ Net operating income is zero or negative — business is not covering its expenses.");
  if (dscr.status === "danger")
    alerts.push("🚨 DSCR < 1.0: Business cannot cover its debt payments from operating income.");
  if (dscr.status === "caution")
    alerts.push("⚠️ DSCR between 1.0–1.25: Debt is barely covered. Any revenue drop is risky.");
  if (dti.status === "high-risk")
    alerts.push("🚨 DTI > 50%: Over half of revenue goes to debt — extremely high burden.");
  if (dti.status === "moderate")
    alerts.push("⚠️ DTI 35–50%: Debt load is elevated. Avoid additional borrowing.");
  if (proposedEMI > 0 && (dscr.status === "danger" || dscr.status === "caution"))
    alerts.push("🚫 Adding a new loan at current DSCR levels is not advisable.");
  return alerts;
}

function _buildRecommendations(dscr, dti, noi) {
  const recs = [];
  if (noi <= 0)
    recs.push("Reduce operating expenses or increase revenue before considering any debt.");
  if (dscr.status === "danger" || dscr.status === "caution")
    recs.push("Target a DSCR ≥ 1.25 before taking new debt. Increase income or reduce existing EMIs.");
  if (dti.status === "high-risk")
    recs.push("Pay down existing debt aggressively to bring DTI below 35%.");
  if (dti.status === "moderate")
    recs.push("Avoid new loans until DTI drops below 35%. Focus on revenue growth.");
  if (dscr.status === "strong" && dti.status === "excellent")
    recs.push("Financials are healthy. Business is well-positioned to take on new debt if needed.");
  if (dscr.status === "adequate" && dti.status === "good")
    recs.push("Business is in good shape. Maintain buffer before committing to additional loans.");
  return recs;
}

module.exports = { calculateDSCR, calculateDTI, assessRisk };
