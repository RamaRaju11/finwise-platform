/**
 * Module 7: Recommendation Engine
 *
 * Depends on: Module 2 (Loan), Module 3 (Affordability), Module 4 (Risk), Module 6 (Multi-Loan)
 *
 * Outputs: prioritised, actionable recommendations for prepayment, tenure change, loan delay/proceed
 */

// ─── EMI helpers (inline so module is self-contained) ─────────────────────
function _calcEMI(principal, annualRate, tenureMonths) {
  const r = annualRate / 12 / 100;
  if (r === 0) return _r(principal / tenureMonths);
  const f = Math.pow(1 + r, tenureMonths);
  return _r((principal * r * f) / (f - 1));
}
function _totalInterest(principal, annualRate, tenureMonths) {
  return _r(_calcEMI(principal, annualRate, tenureMonths) * tenureMonths - principal);
}
function _r(n) { return Math.round(n * 100) / 100; }

// ─── RECOMMENDATION 1: Prepayment ─────────────────────────────────────────

/**
 * Should the business make a prepayment? Which loan? How much?
 *
 * Strategy:
 *   - If cash surplus exists, recommend prepaying the highest-rate loan first (avalanche method)
 *   - Calculate interest saved and months saved
 *
 * @param {Array<{name,principal,annualRate,tenureMonths}>} loans
 * @param {number} availableSurplus   - Monthly cash surplus available for prepayment
 * @param {number} [lumpSum=0]        - One-time lump sum available
 * @returns {object} recommendation
 */
function recommendPrepayment(loans, availableSurplus, lumpSum = 0) {
  if (!Array.isArray(loans) || loans.length === 0) throw new Error("loans must be a non-empty array.");
  if (availableSurplus < 0) throw new Error("availableSurplus cannot be negative.");

  const enriched = loans.map(l => ({
    ...l,
    emi:           _calcEMI(l.principal, l.annualRate, l.tenureMonths),
    totalInterest: _totalInterest(l.principal, l.annualRate, l.tenureMonths),
  }));

  // Sort: highest rate first (avalanche), then highest principal
  const sorted = [...enriched].sort((a, b) =>
    b.annualRate !== a.annualRate ? b.annualRate - a.annualRate : b.principal - a.principal
  );
  const target = sorted[0];

  const prepayAmount   = _r(lumpSum + availableSurplus);
  const hasFunds       = prepayAmount > 0;

  // Estimate interest saved if prepayAmount applied to target loan
  let interestSaved = 0, monthsSaved = 0, newTenure = target.tenureMonths;
  if (hasFunds && prepayAmount < target.principal) {
    const newPrincipal   = _r(target.principal - prepayAmount);
    const newTotalInt    = _totalInterest(newPrincipal, target.annualRate, target.tenureMonths);
    interestSaved        = _r(target.totalInterest - newTotalInt);

    // Estimate months saved by keeping same EMI
    const r = target.annualRate / 12 / 100;
    if (r > 0) {
      const emi = target.emi;
      newTenure = Math.ceil(
        -Math.log(1 - (newPrincipal * r) / emi) / Math.log(1 + r)
      );
      monthsSaved = target.tenureMonths - newTenure;
    }
  } else if (hasFunds && prepayAmount >= target.principal) {
    interestSaved = target.totalInterest;
    monthsSaved   = target.tenureMonths;
    newTenure     = 0;
  }

  const priority = !hasFunds ? "low"
    : target.annualRate >= 14 ? "high"
    : target.annualRate >= 10 ? "medium"
    : "low";

  return {
    type: "prepayment",
    priority,
    title: `Prepay "${target.name}" (highest rate at ${target.annualRate}%)`,
    reason: `Highest-rate loan costs the most in interest. Avalanche method minimises total interest paid.`,
    action: hasFunds
      ? `Apply ${prepayAmount > 0 ? '$' + prepayAmount.toLocaleString() : 'available surplus'} to "${target.name}".`
      : `Build a cash surplus first. No funds available for prepayment.`,
    targetLoan: target.name,
    prepayAmount,
    interestSaved,
    monthsSaved,
    newTenure,
    allLoansSorted: sorted.map(l => ({ name: l.name, rate: l.annualRate, emi: l.emi, totalInterest: l.totalInterest })),
  };
}

// ─── RECOMMENDATION 2: Tenure Change ──────────────────────────────────────

/**
 * Should the business extend or shorten loan tenure?
 *
 * - Extend tenure → lower EMI → improves cash flow (costs more interest)
 * - Shorten tenure → higher EMI → saves interest (requires more cash flow)
 *
 * @param {object} loan                        - Single loan object
 * @param {number} targetEMI                   - Desired monthly EMI
 * @param {'extend'|'shorten'|'auto'} direction - Which way to adjust ('auto' = decide based on targetEMI)
 * @returns {object} recommendation
 */
function recommendTenureChange(loan, targetEMI, direction = "auto") {
  const { name, principal, annualRate, tenureMonths } = loan;
  if (!name)           throw new Error("loan must have a name.");
  if (principal <= 0)  throw new Error("principal must be > 0.");
  if (annualRate < 0)  throw new Error("annualRate cannot be negative.");
  if (tenureMonths <= 0) throw new Error("tenureMonths must be > 0.");
  if (targetEMI <= 0)  throw new Error("targetEMI must be > 0.");

  const currentEMI = _calcEMI(principal, annualRate, tenureMonths);

  // Find tenure required to hit targetEMI
  const r = annualRate / 12 / 100;
  let newTenure;
  if (r === 0) {
    newTenure = Math.round(principal / targetEMI);
  } else {
    // Solve: n = -ln(1 - P*r/EMI) / ln(1+r)
    const ratio = (principal * r) / targetEMI;
    if (ratio >= 1) {
      newTenure = tenureMonths * 3; // EMI too small to ever pay off — cap
    } else {
      newTenure = Math.ceil(-Math.log(1 - ratio) / Math.log(1 + r));
    }
  }

  const actualDirection = direction === "auto"
    ? (targetEMI < currentEMI ? "extend" : "shorten")
    : direction;

  const newTotalInterest  = _totalInterest(principal, annualRate, newTenure);
  const currTotalInterest = _totalInterest(principal, annualRate, tenureMonths);
  const interestDelta     = _r(newTotalInterest - currTotalInterest);
  const tenureDelta       = newTenure - tenureMonths;
  const emiDelta          = _r(targetEMI - currentEMI);

  const priority = Math.abs(emiDelta) / currentEMI > 0.2 ? "high" : "medium";

  return {
    type: "tenure-change",
    priority,
    title: `${actualDirection === "extend" ? "Extend" : "Shorten"} tenure on "${name}"`,
    reason: actualDirection === "extend"
      ? `Extending tenure reduces monthly EMI, improving cash flow at the cost of more interest.`
      : `Shortening tenure increases EMI but saves interest and clears debt faster.`,
    action: `Change tenure from ${tenureMonths} months to ${newTenure} months to achieve EMI of $${targetEMI.toLocaleString()}.`,
    loan: name,
    currentEMI,
    targetEMI: _r(targetEMI),
    emiDelta,
    currentTenure: tenureMonths,
    newTenure,
    tenureDelta,
    interestDelta,
    direction: actualDirection,
  };
}

// ─── RECOMMENDATION 3: Loan Delay / Proceed ───────────────────────────────

/**
 * Should the business delay taking a new loan or proceed?
 *
 * Decision matrix based on DSCR, DTI, and risk level.
 *
 * @param {object} params
 * @param {number} params.dscr          - Current DSCR (from Module 4)
 * @param {number} params.dti           - Current DTI % (from Module 4)
 * @param {string} params.riskLevel     - "Low" | "Moderate" | "High" | "Critical"
 * @param {number} params.safeEMI       - Safe EMI capacity (from Module 3)
 * @param {number} params.desiredEMI    - EMI of the loan being considered
 * @param {number} [params.cashSurplus] - Monthly cash after all expenses
 * @returns {object} recommendation
 */
function recommendLoanDecision({ dscr, dti, riskLevel, safeEMI, desiredEMI, cashSurplus = 0 }) {
  if (typeof dscr !== "number")      throw new Error("dscr must be a number.");
  if (typeof dti !== "number")       throw new Error("dti must be a number.");
  if (typeof safeEMI !== "number")   throw new Error("safeEMI must be a number.");
  if (typeof desiredEMI !== "number") throw new Error("desiredEMI must be a number.");

  const canAfford     = desiredEMI <= safeEMI;
  const dscrAfter     = dscr > 0 ? _r(dscr * (safeEMI / (safeEMI + (desiredEMI - safeEMI || 0.01)))) : dscr;
  const headroom      = _r(safeEMI - desiredEMI);
  const overrun       = canAfford ? 0 : _r(desiredEMI - safeEMI);

  let decision, priority, title, reason, action, conditions;

  if (riskLevel === "Critical" || dscr < 1.0) {
    decision  = "delay";
    priority  = "high";
    title     = "Delay — current risk is Critical";
    reason    = `DSCR of ${dscr.toFixed(2)} indicates the business cannot currently service its existing debt.`;
    action    = "Stabilise existing finances before taking on new debt.";
    conditions = ["DSCR must reach ≥ 1.25", "Risk level must improve to Moderate or Low"];
  } else if (riskLevel === "High" || !canAfford) {
    decision  = "delay";
    priority  = "high";
    title     = canAfford ? "Delay — risk level is High" : "Delay — EMI exceeds safe capacity";
    reason    = canAfford
      ? `Risk level is High. Taking more debt now increases probability of default.`
      : `Desired EMI ($${desiredEMI.toLocaleString()}) exceeds safe capacity ($${safeEMI.toLocaleString()}) by $${overrun.toLocaleString()}.`;
    action    = canAfford
      ? "Wait until risk level drops to Moderate before proceeding."
      : `Either reduce loan amount, extend tenure to lower EMI, or grow revenue by $${overrun.toLocaleString()}/mo.`;
    conditions = canAfford
      ? ["Bring risk level to Moderate", "Maintain DSCR ≥ 1.25 for 3 consecutive months"]
      : [`Reduce desired EMI by $${overrun.toLocaleString()}`, "Or increase net cash flow"];
  } else if (riskLevel === "Moderate" || (dscr >= 1.0 && dscr < 1.25)) {
    decision  = "caution";
    priority  = "medium";
    title     = "Proceed with caution";
    reason    = `Business can technically afford this loan but headroom is limited ($${headroom.toLocaleString()}/mo).`;
    action    = "Negotiate better terms — lower rate or longer tenure to reduce EMI and preserve buffer.";
    conditions = ["Ensure 3-month cash reserve before signing", "Monitor DSCR monthly"];
  } else {
    decision  = "proceed";
    priority  = "low";
    title     = "Proceed — business is in good shape";
    reason    = `DSCR of ${dscr.toFixed(2)}, DTI of ${dti.toFixed(1)}%, and $${headroom.toLocaleString()}/mo headroom make this loan manageable.`;
    action    = "Proceed. Negotiate best available rate to maximise savings.";
    conditions = [];
  }

  return {
    type: "loan-decision",
    priority,
    decision,
    title,
    reason,
    action,
    conditions,
    metrics: { dscr, dti, riskLevel, safeEMI, desiredEMI, headroom, overrun, cashSurplus },
  };
}

// ─── RECOMMENDATION 4: Full Report ────────────────────────────────────────

/**
 * Generate a complete prioritised recommendation report.
 *
 * @param {object} params
 * @param {Array}  params.loans                    - All active loans
 * @param {number} params.grossMonthlyIncome
 * @param {number} params.monthlyOperatingExpenses
 * @param {number} params.monthlyCashSurplus        - Cash left after all expenses + debt
 * @param {number} params.lumpSumAvailable          - One-time prepayment funds
 * @param {object} [params.newLoan]                 - Loan being considered (optional)
 * @param {number} [params.safeRatio=0.4]           - Safe EMI ratio
 * @returns {{ recommendations: Array, summary: object }}
 */
function generateRecommendations({
  loans,
  grossMonthlyIncome,
  monthlyOperatingExpenses,
  monthlyCashSurplus,
  lumpSumAvailable = 0,
  newLoan = null,
  safeRatio = 0.4,
}) {
  if (!Array.isArray(loans) || loans.length === 0) throw new Error("loans must be non-empty.");
  if (grossMonthlyIncome <= 0) throw new Error("grossMonthlyIncome must be > 0.");

  // Compute derived metrics
  const totalEMI      = _r(loans.reduce((s, l) => s + _calcEMI(l.principal, l.annualRate, l.tenureMonths), 0));
  const netOpIncome   = _r(grossMonthlyIncome - monthlyOperatingExpenses);
  const dscr          = totalEMI > 0 ? _r(netOpIncome / totalEMI) : null;
  const dti           = _r((totalEMI / grossMonthlyIncome) * 100);
  const maxAllowedEMI = _r(grossMonthlyIncome * safeRatio);
  const safeEMI       = _r(Math.max(0, maxAllowedEMI - totalEMI));

  const dscrStatus = dscr === null ? "no-debt" : dscr >= 1.5 ? "strong" : dscr >= 1.25 ? "adequate" : dscr >= 1.0 ? "caution" : "danger";
  const dtiStatus  = dti < 20 ? "excellent" : dti < 35 ? "good" : dti < 50 ? "moderate" : "high-risk";
  let riskScore    = ({ strong:0, adequate:15, caution:30, danger:50, "no-debt":0 }[dscrStatus] ?? 0)
                   + ({ excellent:0, good:10, moderate:30, "high-risk":50 }[dtiStatus] ?? 0);
  const riskLevel  = riskScore <= 10 ? "Low" : riskScore <= 30 ? "Moderate" : riskScore <= 55 ? "High" : "Critical";

  const recommendations = [];

  // 1. Prepayment recommendation
  const hasSurplus = monthlyCashSurplus > 0 || lumpSumAvailable > 0;
  if (hasSurplus || riskLevel === "High" || riskLevel === "Critical") {
    recommendations.push(recommendPrepayment(loans, Math.max(0, monthlyCashSurplus), lumpSumAvailable));
  }

  // 2. Tenure change — suggest extending for the heaviest EMI loan if cash is tight
  if (dscr !== null && dscr < 1.25 && monthlyCashSurplus < 0) {
    const heaviest = [...loans].sort((a, b) =>
      _calcEMI(b.principal, b.annualRate, b.tenureMonths) - _calcEMI(a.principal, a.annualRate, a.tenureMonths)
    )[0];
    const targetEMI = _r(_calcEMI(heaviest.principal, heaviest.annualRate, heaviest.tenureMonths) * 0.75);
    recommendations.push(recommendTenureChange(heaviest, targetEMI, "extend"));
  }

  // 3. Loan decision if new loan is being considered
  if (newLoan) {
    const desiredEMI = _calcEMI(newLoan.principal, newLoan.annualRate, newLoan.tenureMonths);
    recommendations.push(recommendLoanDecision({ dscr: dscr ?? 99, dti, riskLevel, safeEMI, desiredEMI, cashSurplus: monthlyCashSurplus }));
  }

  // 4. Consolidation suggestion if multiple high-rate loans
  const highRateLoans = loans.filter(l => l.annualRate >= 12);
  if (highRateLoans.length >= 2) {
    const totalHighRateEMI = _r(highRateLoans.reduce((s, l) => s + _calcEMI(l.principal, l.annualRate, l.tenureMonths), 0));
    recommendations.push({
      type: "consolidation",
      priority: riskLevel === "High" || riskLevel === "Critical" ? "high" : "medium",
      title: `Consolidate ${highRateLoans.length} high-rate loans`,
      reason: `${highRateLoans.length} loans are above 12% rate. Consolidating could significantly reduce total interest.`,
      action: `Explore refinancing ${highRateLoans.map(l => `"${l.name}"`).join(", ")} into a single lower-rate loan.`,
      loans: highRateLoans.map(l => l.name),
      combinedEMI: totalHighRateEMI,
    });
  }

  // Sort by priority: high → medium → low
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return {
    recommendations,
    summary: {
      totalLoans: loans.length,
      totalEMI,
      netOpIncome,
      dscr,
      dscrStatus,
      dti,
      dtiStatus,
      riskLevel,
      riskScore,
      safeEMI,
      monthlyCashSurplus,
      recommendationCount: recommendations.length,
      highPriorityCount: recommendations.filter(r => r.priority === "high").length,
    },
  };
}

module.exports = { recommendPrepayment, recommendTenureChange, recommendLoanDecision, generateRecommendations };
