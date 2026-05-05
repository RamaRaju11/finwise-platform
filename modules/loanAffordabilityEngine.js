/**
 * Module 3: Loan Affordability Engine
 *
 * Depends on: Module 1 (Cash Flow Engine), Module 2 (Loan Engine)
 *
 * Outputs: safe EMI, max loan amount, affordability verdict
 */

/**
 * Calculate how much EMI a business can safely commit to.
 *
 * Safe EMI = (netCashFlow × safeRatio) - existingEMIs
 *
 * @param {number} netCashFlow    - Monthly net cash flow (from Module 1)
 * @param {number} existingEMIs  - Total existing monthly EMI obligations
 * @param {number} safeRatio     - Fraction of cash flow allowed for EMIs (default 0.4 = 40%)
 * @returns {{ safeEMI: number, maxAllowedEMI: number, availableEMI: number, status: string }}
 */
function calculateSafeEMI(netCashFlow, existingEMIs = 0, safeRatio = 0.4) {
  _validateSafeEMI(netCashFlow, existingEMIs, safeRatio);

  const maxAllowedEMI = _round(netCashFlow * safeRatio);
  const availableEMI  = _round(maxAllowedEMI - existingEMIs);
  const safeEMI       = Math.max(0, availableEMI);

  let status;
  if (netCashFlow <= 0)       status = "no-cash-flow";
  else if (availableEMI <= 0) status = "fully-committed";
  else if (availableEMI < maxAllowedEMI * 0.25) status = "tight";
  else                        status = "affordable";

  return { safeEMI, maxAllowedEMI, availableEMI, status };
}

/**
 * Reverse-calculate maximum loan principal for a given EMI.
 *
 * Formula: P = EMI × ((1+r)^n - 1) / (r × (1+r)^n)
 *
 * @param {number} emi           - Monthly EMI available
 * @param {number} annualRate    - Annual interest rate in % (e.g. 12)
 * @param {number} tenureMonths  - Desired loan tenure in months
 * @returns {{ maxLoanAmount: number, totalPayment: number, totalInterest: number }}
 */
function calculateMaxLoanAmount(emi, annualRate, tenureMonths) {
  _validateLoan(emi, annualRate, tenureMonths);

  const r = annualRate / 12 / 100;
  let maxLoanAmount;

  if (r === 0) {
    maxLoanAmount = emi * tenureMonths;
  } else {
    const factor = Math.pow(1 + r, tenureMonths);
    maxLoanAmount = emi * (factor - 1) / (r * factor);
  }

  const totalPayment  = _round(emi * tenureMonths);
  const totalInterest = _round(totalPayment - maxLoanAmount);

  return {
    maxLoanAmount: _round(maxLoanAmount),
    totalPayment,
    totalInterest,
  };
}

/**
 * Full affordability assessment — combines safe EMI + max loan calculation.
 *
 * Given business financials and a desired loan, answers:
 *   "Can this business safely afford this loan?"
 *
 * @param {object} params
 * @param {number} params.netCashFlow      - Monthly net cash flow (Module 1 output)
 * @param {number} params.existingEMIs     - Existing monthly EMI commitments
 * @param {number} params.annualRate       - Interest rate in % for new loan
 * @param {number} params.tenureMonths     - Desired tenure in months
 * @param {number} [params.desiredLoan]    - Loan amount being considered (optional)
 * @param {number} [params.safeRatio=0.4]  - Safe EMI ratio (default 40%)
 * @returns {{
 *   safeEMI: number,
 *   maxAllowedEMI: number,
 *   availableEMI: number,
 *   maxLoanAmount: number,
 *   desiredLoanEMI: number|null,
 *   canAffordDesiredLoan: boolean|null,
 *   shortfall: number|null,
 *   headroom: number|null,
 *   affordabilityStatus: string,
 *   verdict: string,
 *   recommendation: string
 * }}
 */
function assessAffordability({
  netCashFlow,
  existingEMIs = 0,
  annualRate,
  tenureMonths,
  desiredLoan = null,
  safeRatio = 0.4,
}) {
  const safeResult = calculateSafeEMI(netCashFlow, existingEMIs, safeRatio);
  const { safeEMI, maxAllowedEMI, availableEMI, status } = safeResult;

  const maxLoanResult = safeEMI > 0
    ? calculateMaxLoanAmount(safeEMI, annualRate, tenureMonths)
    : { maxLoanAmount: 0, totalPayment: 0, totalInterest: 0 };

  let desiredLoanEMI       = null;
  let canAffordDesiredLoan = null;
  let shortfall            = null;
  let headroom             = null;

  if (desiredLoan !== null && desiredLoan > 0) {
    const r = annualRate / 12 / 100;
    if (r === 0) {
      desiredLoanEMI = _round(desiredLoan / tenureMonths);
    } else {
      const factor = Math.pow(1 + r, tenureMonths);
      desiredLoanEMI = _round((desiredLoan * r * factor) / (factor - 1));
    }
    canAffordDesiredLoan = desiredLoanEMI <= safeEMI;
    shortfall = canAffordDesiredLoan ? null : _round(desiredLoanEMI - safeEMI);
    headroom  = canAffordDesiredLoan ? _round(safeEMI - desiredLoanEMI) : null;
  }

  const verdict       = _buildVerdict(status, canAffordDesiredLoan, desiredLoan);
  const recommendation = _buildRecommendation(status, canAffordDesiredLoan, shortfall, maxLoanResult.maxLoanAmount, safeEMI);

  return {
    safeEMI,
    maxAllowedEMI,
    availableEMI,
    maxLoanAmount: maxLoanResult.maxLoanAmount,
    totalPaymentOnMaxLoan: maxLoanResult.totalPayment,
    totalInterestOnMaxLoan: maxLoanResult.totalInterest,
    desiredLoanEMI,
    canAffordDesiredLoan,
    shortfall,
    headroom,
    affordabilityStatus: status,
    verdict,
    recommendation,
  };
}

// ─── Internal helpers ──────────────────────────────────────────────────────

function _round(n) {
  return Math.round(n * 100) / 100;
}

function _validateSafeEMI(netCashFlow, existingEMIs, safeRatio) {
  if (typeof netCashFlow !== "number")  throw new Error("netCashFlow must be a number.");
  if (typeof existingEMIs !== "number") throw new Error("existingEMIs must be a number.");
  if (existingEMIs < 0)                 throw new Error("existingEMIs cannot be negative.");
  if (safeRatio <= 0 || safeRatio > 1)  throw new Error("safeRatio must be between 0 and 1.");
}

function _validateLoan(emi, annualRate, tenureMonths) {
  if (emi <= 0)                                       throw new Error("emi must be greater than 0.");
  if (typeof annualRate !== "number" || annualRate < 0) throw new Error("annualRate must be a non-negative number.");
  if (!Number.isInteger(tenureMonths) || tenureMonths <= 0) throw new Error("tenureMonths must be a positive integer.");
}

function _buildVerdict(status, canAfford, desiredLoan) {
  if (status === "no-cash-flow")    return "Business has no positive cash flow. Taking a loan is not advisable.";
  if (status === "fully-committed") return "Existing EMIs already exceed the safe threshold. No capacity for a new loan.";
  if (desiredLoan === null)         return "Business has capacity to take a loan. See max loan amount.";
  return canAfford
    ? "Business can safely afford this loan."
    : "Desired loan EMI exceeds safe capacity. Consider a smaller loan or longer tenure.";
}

function _buildRecommendation(status, canAfford, shortfall, maxLoan, safeEMI) {
  if (status === "no-cash-flow")    return "Focus on improving revenue or reducing expenses before taking a loan.";
  if (status === "fully-committed") return "Pay down existing debt before taking on a new loan.";
  if (status === "tight")           return `Loan capacity is limited. Max safe loan is $${maxLoan.toLocaleString()}. Proceed cautiously.`;
  if (canAfford === null)           return `You can afford up to $${maxLoan.toLocaleString()} at the given rate and tenure.`;
  if (canAfford)                    return `Safe to proceed. You have $${safeEMI.toLocaleString()} available vs the required EMI.`;
  return `Reduce loan amount or extend tenure to bring EMI within the safe limit of $${safeEMI.toLocaleString()}/month. Current shortfall: $${shortfall.toLocaleString()}.`;
}

module.exports = { calculateSafeEMI, calculateMaxLoanAmount, assessAffordability };
