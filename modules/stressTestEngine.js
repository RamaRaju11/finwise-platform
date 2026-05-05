/**
 * Module 5: Stress Testing Engine
 *
 * Depends on: Module 1 (Cash Flow), Module 2 (Loan Engine), Module 4 (Risk & Debt)
 *
 * Scenarios: revenue drop, expense increase, interest rate increase
 * Outputs  : baseline vs stressed metrics, impact delta, pass/fail, alerts
 */

/**
 * Build a baseline snapshot from inputs.
 *
 * @param {object} p
 * @param {number} p.revenue           - Monthly revenue
 * @param {number} p.fixedExpenses     - Monthly fixed expenses (excl. debt)
 * @param {number} p.variableExpenses  - Monthly variable expenses (excl. debt)
 * @param {number} p.totalDebtService  - Monthly debt payments (all loans)
 * @param {number} p.loanPrincipal     - Outstanding principal (for rate stress)
 * @param {number} p.annualRate        - Current annual interest rate %
 * @param {number} p.tenureMonths      - Remaining tenure in months
 * @returns {object} baseline snapshot
 */
function buildBaseline({ revenue, fixedExpenses, variableExpenses, totalDebtService, loanPrincipal, annualRate, tenureMonths }) {
  _validateInputs(revenue, fixedExpenses, variableExpenses, totalDebtService);
  const totalExpenses     = _round(fixedExpenses + variableExpenses);
  const netCashFlow       = _round(revenue - totalExpenses);
  const netOperatingIncome = netCashFlow; // before debt service
  const cashAfterDebt     = _round(netCashFlow - totalDebtService);
  const dscr              = totalDebtService > 0 ? _round(netOperatingIncome / totalDebtService) : null;
  const dti               = _round((totalDebtService / revenue) * 100);

  return {
    revenue, fixedExpenses, variableExpenses,
    totalExpenses, netCashFlow, netOperatingIncome,
    totalDebtService, cashAfterDebt,
    dscr, dti,
    annualRate, loanPrincipal, tenureMonths,
    dscrStatus: _dscrStatus(dscr),
    dtiStatus:  _dtiStatus(dti),
  };
}

/**
 * Scenario 1: Revenue Drop
 * What happens if monthly revenue falls by X%?
 *
 * @param {object} baseline     - Output of buildBaseline()
 * @param {number} dropPercent  - e.g. 20 means a 20% revenue drop
 * @returns {object} scenario result
 */
function runRevenueDrop(baseline, dropPercent) {
  if (dropPercent <= 0 || dropPercent >= 100) throw new Error("dropPercent must be between 0 and 100.");

  const stressedRevenue = _round(baseline.revenue * (1 - dropPercent / 100));
  const stressed = _buildStressedSnapshot(baseline, { revenue: stressedRevenue });

  return _buildResult("Revenue Drop", `Revenue falls by ${dropPercent}%`, baseline, stressed, {
    revenueChange: _round(stressedRevenue - baseline.revenue),
  });
}

/**
 * Scenario 2: Expense Increase
 * What happens if operating expenses rise by X%?
 *
 * @param {object} baseline         - Output of buildBaseline()
 * @param {number} increasePercent  - e.g. 15 means expenses go up 15%
 * @returns {object} scenario result
 */
function runExpenseIncrease(baseline, increasePercent) {
  if (increasePercent <= 0) throw new Error("increasePercent must be greater than 0.");

  const stressedFixed    = _round(baseline.fixedExpenses * (1 + increasePercent / 100));
  const stressedVariable = _round(baseline.variableExpenses * (1 + increasePercent / 100));
  const stressed = _buildStressedSnapshot(baseline, {
    fixedExpenses: stressedFixed,
    variableExpenses: stressedVariable,
  });

  return _buildResult("Expense Increase", `Expenses rise by ${increasePercent}%`, baseline, stressed, {
    expenseChange: _round(stressed.totalExpenses - baseline.totalExpenses),
  });
}

/**
 * Scenario 3: Interest Rate Increase
 * What happens if the loan interest rate rises by X percentage points?
 * Recalculates EMI and impacts cash flow.
 *
 * @param {object} baseline          - Output of buildBaseline()
 * @param {number} rateIncreasePoints - e.g. 2 means rate goes up by 2pp (e.g. 10% → 12%)
 * @returns {object} scenario result
 */
function runRateIncrease(baseline, rateIncreasePoints) {
  if (rateIncreasePoints <= 0) throw new Error("rateIncreasePoints must be greater than 0.");
  if (!baseline.loanPrincipal || baseline.loanPrincipal <= 0) throw new Error("loanPrincipal must be set in baseline for rate stress.");
  if (!baseline.tenureMonths  || baseline.tenureMonths <= 0)  throw new Error("tenureMonths must be set in baseline for rate stress.");

  const newRate    = _round(baseline.annualRate + rateIncreasePoints);
  const newEMI     = _calcEMI(baseline.loanPrincipal, newRate, baseline.tenureMonths);
  const emiChange  = _round(newEMI - baseline.totalDebtService);
  const stressed   = _buildStressedSnapshot(baseline, { totalDebtService: newEMI });

  return _buildResult("Rate Increase", `Rate rises by ${rateIncreasePoints}pp (${baseline.annualRate}% → ${newRate}%)`, baseline, stressed, {
    newRate,
    newEMI: _round(newEMI),
    emiChange: _round(emiChange),
  });
}

/**
 * Run all three scenarios at once with configurable shock values.
 *
 * @param {object} baseline
 * @param {object} shocks
 * @param {number} [shocks.revenueDrop=20]       - % revenue drop
 * @param {number} [shocks.expenseIncrease=15]   - % expense increase
 * @param {number} [shocks.rateIncrease=2]       - pp rate increase
 * @returns {{ baseline: object, scenarios: object[] }}
 */
function runAllScenarios(baseline, { revenueDrop = 20, expenseIncrease = 15, rateIncrease = 2 } = {}) {
  const scenarios = [];

  scenarios.push(runRevenueDrop(baseline, revenueDrop));
  scenarios.push(runExpenseIncrease(baseline, expenseIncrease));

  if (baseline.loanPrincipal > 0 && baseline.tenureMonths > 0) {
    scenarios.push(runRateIncrease(baseline, rateIncrease));
  }

  const overallPass = scenarios.every(s => s.outcome === "pass");
  const hasWarning  = scenarios.some(s => s.outcome === "warning");
  const overallOutcome = overallPass ? "pass" : hasWarning ? "warning" : "fail";

  return { baseline, scenarios, overallOutcome };
}

// ─── Internal helpers ──────────────────────────────────────────────────────

function _round(n) { return Math.round(n * 100) / 100; }

function _calcEMI(principal, annualRate, tenureMonths) {
  const r = annualRate / 12 / 100;
  if (r === 0) return _round(principal / tenureMonths);
  const factor = Math.pow(1 + r, tenureMonths);
  return _round((principal * r * factor) / (factor - 1));
}

function _validateInputs(revenue, fixedExpenses, variableExpenses, totalDebtService) {
  if (revenue <= 0)           throw new Error("revenue must be greater than 0.");
  if (fixedExpenses < 0)      throw new Error("fixedExpenses cannot be negative.");
  if (variableExpenses < 0)   throw new Error("variableExpenses cannot be negative.");
  if (totalDebtService < 0)   throw new Error("totalDebtService cannot be negative.");
}

function _buildStressedSnapshot(baseline, overrides) {
  const revenue          = overrides.revenue          ?? baseline.revenue;
  const fixedExpenses    = overrides.fixedExpenses    ?? baseline.fixedExpenses;
  const variableExpenses = overrides.variableExpenses ?? baseline.variableExpenses;
  const totalDebtService = overrides.totalDebtService ?? baseline.totalDebtService;

  const totalExpenses      = _round(fixedExpenses + variableExpenses);
  const netCashFlow        = _round(revenue - totalExpenses);
  const netOperatingIncome = netCashFlow;
  const cashAfterDebt      = _round(netCashFlow - totalDebtService);
  const dscr               = totalDebtService > 0 ? _round(netOperatingIncome / totalDebtService) : null;
  const dti                = _round((totalDebtService / revenue) * 100);

  return {
    revenue, fixedExpenses, variableExpenses,
    totalExpenses, netCashFlow, netOperatingIncome,
    totalDebtService, cashAfterDebt,
    dscr, dti,
    dscrStatus: _dscrStatus(dscr),
    dtiStatus:  _dtiStatus(dti),
  };
}

function _buildResult(name, description, baseline, stressed, extras) {
  const delta = {
    revenue:          _round(stressed.revenue - baseline.revenue),
    totalExpenses:    _round(stressed.totalExpenses - baseline.totalExpenses),
    netCashFlow:      _round(stressed.netCashFlow - baseline.netCashFlow),
    totalDebtService: _round(stressed.totalDebtService - baseline.totalDebtService),
    cashAfterDebt:    _round(stressed.cashAfterDebt - baseline.cashAfterDebt),
    dscr:             stressed.dscr !== null && baseline.dscr !== null ? _round(stressed.dscr - baseline.dscr) : null,
    dti:              _round(stressed.dti - baseline.dti),
  };

  // Outcome: pass / warning / fail
  let outcome;
  if (stressed.cashAfterDebt < 0 || (stressed.dscr !== null && stressed.dscr < 1.0)) {
    outcome = "fail";
  } else if (stressed.dscr !== null && stressed.dscr < 1.25) {
    outcome = "warning";
  } else {
    outcome = "pass";
  }

  const alerts = [];
  if (stressed.cashAfterDebt < 0)
    alerts.push("Cash flow turns negative after debt service — business cannot meet obligations.");
  if (stressed.dscr !== null && stressed.dscr < 1.0)
    alerts.push(`DSCR drops to ${stressed.dscr.toFixed(2)} — income no longer covers debt.`);
  else if (stressed.dscr !== null && stressed.dscr < 1.25)
    alerts.push(`DSCR drops to ${stressed.dscr.toFixed(2)} — dangerously close to threshold.`);
  if (stressed.dti > 50)
    alerts.push(`DTI rises to ${stressed.dti.toFixed(1)}% — exceeds safe threshold.`);
  if (stressed.netCashFlow < 0)
    alerts.push("Business operating at a loss under this scenario.");

  return { name, description, outcome, baseline, stressed, delta, alerts, ...extras };
}

function _dscrStatus(dscr) {
  if (dscr === null)  return "no-debt";
  if (dscr >= 1.5)    return "strong";
  if (dscr >= 1.25)   return "adequate";
  if (dscr >= 1.0)    return "caution";
  return "danger";
}

function _dtiStatus(dti) {
  if (dti < 20)  return "excellent";
  if (dti < 35)  return "good";
  if (dti < 50)  return "moderate";
  return "high-risk";
}

module.exports = { buildBaseline, runRevenueDrop, runExpenseIncrease, runRateIncrease, runAllScenarios };
