/**
 * Module 2: Loan Engine
 *
 * Features: EMI calculation, amortization schedule, prepayment (reduce tenure / reduce EMI)
 */

/**
 * Calculate EMI (Equated Monthly Installment).
 *
 * Formula: EMI = P × r × (1+r)^n / ((1+r)^n - 1)
 *
 * @param {number} principal      - Loan amount
 * @param {number} annualRate     - Annual interest rate in % (e.g. 12 for 12%)
 * @param {number} tenureMonths   - Loan tenure in months
 * @returns {{ emi: number, totalPayment: number, totalInterest: number }}
 */
function calculateEMI(principal, annualRate, tenureMonths) {
  _validate(principal, annualRate, tenureMonths);

  const r = annualRate / 12 / 100;
  let emi;

  if (r === 0) {
    emi = principal / tenureMonths;
  } else {
    const factor = Math.pow(1 + r, tenureMonths);
    emi = (principal * r * factor) / (factor - 1);
  }

  const totalPayment = emi * tenureMonths;
  const totalInterest = totalPayment - principal;

  return {
    emi: _round(emi),
    totalPayment: _round(totalPayment),
    totalInterest: _round(totalInterest),
  };
}

/**
 * Generate full amortization schedule month by month.
 *
 * @param {number} principal    - Loan amount
 * @param {number} annualRate   - Annual interest rate in %
 * @param {number} tenureMonths - Loan tenure in months
 * @returns {{
 *   emi: number,
 *   totalPayment: number,
 *   totalInterest: number,
 *   schedule: Array<{
 *     month: number,
 *     openingBalance: number,
 *     emi: number,
 *     principal: number,
 *     interest: number,
 *     closingBalance: number
 *   }>
 * }}
 */
function generateAmortizationSchedule(principal, annualRate, tenureMonths) {
  _validate(principal, annualRate, tenureMonths);

  const { emi } = calculateEMI(principal, annualRate, tenureMonths);
  const r = annualRate / 12 / 100;
  const schedule = [];
  let balance = principal;

  for (let month = 1; month <= tenureMonths; month++) {
    const openingBalance = balance;
    const interest = _round(balance * r);
    let principalPaid = _round(emi - interest);

    // Last month: clear any rounding residue
    if (month === tenureMonths) {
      principalPaid = _round(balance);
    }

    const closingBalance = _round(Math.max(0, balance - principalPaid));
    balance = closingBalance;

    schedule.push({
      month,
      openingBalance: _round(openingBalance),
      emi: _round(emi),
      principal: principalPaid,
      interest,
      closingBalance,
    });

    if (balance <= 0) break;
  }

  const totalInterest = _round(schedule.reduce((s, r) => s + r.interest, 0));
  const totalPayment = _round(principal + totalInterest);

  return { emi: _round(emi), totalPayment, totalInterest, schedule };
}

/**
 * Apply a one-time prepayment at a given month and return the updated schedule.
 *
 * @param {number} principal      - Original loan amount
 * @param {number} annualRate     - Annual interest rate in %
 * @param {number} tenureMonths   - Original tenure in months
 * @param {number} prepayMonth    - Month number when prepayment is made (1-based)
 * @param {number} prepayAmount   - Extra lump-sum payment amount
 * @param {'reduce-tenure'|'reduce-emi'} strategy - What to do after prepayment
 * @returns {{
 *   originalEmi: number,
 *   newEmi: number,
 *   newTenure: number,
 *   monthsSaved: number,
 *   interestSaved: number,
 *   totalInterest: number,
 *   totalPayment: number,
 *   schedule: Array
 * }}
 */
function applyPrepayment(principal, annualRate, tenureMonths, prepayMonth, prepayAmount, strategy = "reduce-tenure") {
  _validate(principal, annualRate, tenureMonths);
  if (prepayMonth < 1 || prepayMonth > tenureMonths) throw new Error("prepayMonth out of range.");
  if (prepayAmount <= 0) throw new Error("prepayAmount must be positive.");
  if (!["reduce-tenure", "reduce-emi"].includes(strategy)) throw new Error("strategy must be 'reduce-tenure' or 'reduce-emi'.");

  const { emi: originalEmi } = calculateEMI(principal, annualRate, tenureMonths);
  const r = annualRate / 12 / 100;

  const schedule = [];
  let balance = principal;
  let currentEmi = originalEmi;

  for (let month = 1; month <= tenureMonths + 120; month++) {
    if (balance <= 0) break;

    const openingBalance = balance;
    const interest = _round(balance * r);
    let principalPaid = _round(currentEmi - interest);

    // Apply prepayment
    let prepaid = 0;
    if (month === prepayMonth) {
      prepaid = Math.min(prepayAmount, balance - principalPaid);
      prepaid = _round(Math.max(0, prepaid));

      const remainingBalance = _round(balance - principalPaid - prepaid);
      const remainingMonths = tenureMonths - month;

      if (remainingBalance > 0 && remainingMonths > 0) {
        if (strategy === "reduce-emi") {
          const { emi: newEmi } = calculateEMI(remainingBalance, annualRate, remainingMonths);
          currentEmi = newEmi;
        }
        // reduce-tenure: keep same EMI, loan ends earlier naturally
      }
    }

    const closingBalance = _round(Math.max(0, balance - principalPaid - prepaid));
    balance = closingBalance;

    schedule.push({
      month,
      openingBalance: _round(openingBalance),
      emi: _round(principalPaid + interest),
      principal: principalPaid,
      interest,
      prepayment: prepaid,
      closingBalance,
    });

    if (balance <= 0) break;
  }

  const totalInterest = _round(schedule.reduce((s, r) => s + r.interest, 0));
  const totalPayment = _round(principal + totalInterest + schedule.reduce((s, r) => s + r.prepayment, 0));
  const originalSchedule = generateAmortizationSchedule(principal, annualRate, tenureMonths);
  const interestSaved = _round(originalSchedule.totalInterest - totalInterest);
  const newTenure = schedule.length;
  const monthsSaved = tenureMonths - newTenure;

  return {
    originalEmi: _round(originalEmi),
    newEmi: _round(currentEmi),
    newTenure,
    monthsSaved,
    interestSaved,
    totalInterest,
    totalPayment,
    schedule,
  };
}

// ─── Internal helpers ──────────────────────────────────────────────────────

function _round(n) {
  return Math.round(n * 100) / 100;
}

function _validate(principal, annualRate, tenureMonths) {
  if (typeof principal !== "number" || typeof annualRate !== "number" || typeof tenureMonths !== "number")
    throw new Error("All inputs must be numbers.");
  if (principal <= 0) throw new Error("principal must be greater than 0.");
  if (annualRate < 0) throw new Error("annualRate cannot be negative.");
  if (tenureMonths <= 0 || !Number.isInteger(tenureMonths)) throw new Error("tenureMonths must be a positive integer.");
}

module.exports = { calculateEMI, generateAmortizationSchedule, applyPrepayment };
