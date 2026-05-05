/**
 * Module 12: Forecasting Engine
 *
 * Projects future cash flow, P&L, and loan balance over N periods.
 * Supports three-scenario analysis (optimistic / base / pessimistic).
 *
 * Growth model: compound percentage growth per period
 *   Period i value = baseValue × (1 + growthRate/100)^i
 *   Period 1 = first forecasted month (one growth cycle ahead of current)
 *
 * Depends on:
 *   Module 1  – cash flow inputs (revenue, expenses)
 *   Module 2  – EMI / amortization (emi, annualRate for loan forecast)
 *   Module 8  – P&L structure (cogs, opex, tax)
 */

function _r(n) { return Math.round(n * 100) / 100; }

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Forecast net cash flows over N periods.
 *
 * @param {object} p
 * @param {number} [p.periods=12]              – Number of periods (max 120)
 * @param {number} [p.openingCash=0]           – Starting cash balance
 * @param {number} p.baseRevenue               – Current-period revenue (period 0)
 * @param {number} [p.revenueGrowthRate=0]     – % growth per period (compound)
 * @param {number} [p.baseFixedExpenses=0]
 * @param {number} [p.baseVariableExpenses=0]
 * @param {number} [p.expenseGrowthRate=0]     – % growth per period (applies to both)
 * @param {number} [p.emiPayments=0]           – Fixed monthly loan repayments (Module 2)
 * @returns {object} projections array + summary
 */
function forecastCashFlow({
  periods = 12,
  openingCash = 0,
  baseRevenue,
  revenueGrowthRate = 0,
  baseFixedExpenses = 0,
  baseVariableExpenses = 0,
  expenseGrowthRate = 0,
  emiPayments = 0,
} = {}) {
  _validate(periods, baseRevenue);

  const rg = revenueGrowthRate / 100;
  const eg = expenseGrowthRate / 100;
  const projections = [];
  let cumCash = _r(openingCash);

  for (let i = 1; i <= periods; i++) {
    const revenue        = _r(baseRevenue * Math.pow(1 + rg, i));
    const fixedExp       = _r(baseFixedExpenses * Math.pow(1 + eg, i));
    const variableExp    = _r(baseVariableExpenses * Math.pow(1 + eg, i));
    const totalExpenses  = _r(fixedExp + variableExp + emiPayments);
    const netCashFlow    = _r(revenue - totalExpenses);
    cumCash              = _r(cumCash + netCashFlow);

    projections.push({
      period: i,
      revenue,
      fixedExpenses: fixedExp,
      variableExpenses: variableExp,
      emiPayments,
      totalExpenses,
      netCashFlow,
      cumulativeCash: cumCash,
      status: netCashFlow > 0 ? "surplus" : netCashFlow < 0 ? "deficit" : "breakeven",
    });
  }

  const totalRevenue    = _r(projections.reduce((s, p) => s + p.revenue, 0));
  const totalExpenses   = _r(projections.reduce((s, p) => s + p.totalExpenses, 0));
  const totalNetCash    = _r(projections.reduce((s, p) => s + p.netCashFlow, 0));
  const surplusMonths   = projections.filter(p => p.netCashFlow > 0).length;
  const closingCash     = projections[periods - 1].cumulativeCash;
  const peakCash        = Math.max(...projections.map(p => p.cumulativeCash));
  const troughCash      = Math.min(...projections.map(p => p.cumulativeCash));

  // Breakeven period: first time cumulative cash turns positive
  let breakevenPeriod = null;
  if (openingCash <= 0) {
    const bp = projections.find(p => p.cumulativeCash > 0);
    breakevenPeriod = bp ? bp.period : null;
  }

  // Cash runway if trend is negative
  const lastFlow = projections[periods - 1].netCashFlow;
  let cashRunway = null;
  if (closingCash > 0 && lastFlow < 0) {
    cashRunway = Math.floor(closingCash / Math.abs(lastFlow));
  } else if (closingCash <= 0) {
    cashRunway = 0;
  }

  return {
    projections,
    summary: {
      periods, openingCash, closingCash,
      totalRevenue, totalExpenses, totalNetCash,
      surplusMonths,
      deficitMonths: periods - surplusMonths,
      peakCash, troughCash,
      breakevenPeriod, cashRunway,
      avgMonthlyRevenue:   _r(totalRevenue / periods),
      avgMonthlyCashFlow:  _r(totalNetCash  / periods),
      revenueGrowthRate, expenseGrowthRate,
    },
  };
}

/**
 * Forecast Profit & Loss over N periods.
 *
 * @param {object} p
 * @param {number} [p.periods=12]
 * @param {number} p.baseRevenue
 * @param {number} [p.revenueGrowthRate=0]
 * @param {number} [p.baseCogs=0]             – If cogsPercent set, this is ignored
 * @param {number} [p.cogsPercent=null]        – COGS as % of revenue (locks gross margin)
 * @param {number} [p.cogsGrowthRate=0]        – Only used when cogsPercent is null
 * @param {number} [p.baseFixedOpex=0]
 * @param {number} [p.baseVariableOpex=0]
 * @param {number} [p.opexGrowthRate=0]
 * @param {number} [p.interestExpense=0]       – Fixed monthly (from Module 2)
 * @param {number} [p.taxRate=0]               – %
 * @returns {object}
 */
function forecastProfitLoss({
  periods = 12,
  baseRevenue,
  revenueGrowthRate = 0,
  baseCogs = 0,
  cogsPercent = null,
  cogsGrowthRate = 0,
  baseFixedOpex = 0,
  baseVariableOpex = 0,
  opexGrowthRate = 0,
  interestExpense = 0,
  taxRate = 0,
} = {}) {
  _validate(periods, baseRevenue);

  const rg = revenueGrowthRate / 100;
  const cg = cogsGrowthRate    / 100;
  const og = opexGrowthRate    / 100;
  const projections = [];

  for (let i = 1; i <= periods; i++) {
    const revenue = _r(baseRevenue * Math.pow(1 + rg, i));

    const cogs = cogsPercent !== null
      ? _r(revenue * (cogsPercent / 100))
      : _r(baseCogs * Math.pow(1 + cg, i));

    const grossProfit    = _r(revenue - cogs);
    const grossMargin    = revenue > 0 ? _r((grossProfit / revenue) * 100) : 0;

    const fixedOpex      = _r(baseFixedOpex    * Math.pow(1 + og, i));
    const variableOpex   = _r(baseVariableOpex * Math.pow(1 + og, i));
    const totalOpex      = _r(fixedOpex + variableOpex);
    const operatingProfit  = _r(grossProfit - totalOpex);
    const operatingMargin  = revenue > 0 ? _r((operatingProfit / revenue) * 100) : 0;

    const netProfitBeforeTax = _r(operatingProfit - interestExpense);
    const taxAmount          = (taxRate > 0 && netProfitBeforeTax > 0)
      ? _r(netProfitBeforeTax * (taxRate / 100)) : 0;
    const netProfitAfterTax  = _r(netProfitBeforeTax - taxAmount);
    const netMargin          = revenue > 0 ? _r((netProfitAfterTax / revenue) * 100) : 0;

    projections.push({
      period: i,
      revenue, cogs, grossProfit, grossMargin,
      fixedOpex, variableOpex, totalOpex,
      operatingProfit, operatingMargin,
      interestExpense, netProfitBeforeTax,
      taxAmount, netProfitAfterTax, netMargin,
      status: netProfitAfterTax > 0 ? "profit" : netProfitAfterTax < 0 ? "loss" : "breakeven",
    });
  }

  const totalRevenue    = _r(projections.reduce((s, p) => s + p.revenue, 0));
  const totalNetProfit  = _r(projections.reduce((s, p) => s + p.netProfitAfterTax, 0));
  const profitableMonths = projections.filter(p => p.netProfitAfterTax > 0).length;

  return {
    projections,
    summary: {
      periods, totalRevenue, totalNetProfit,
      profitableMonths,
      lossMonths:          periods - profitableMonths,
      avgMonthlyRevenue:   _r(totalRevenue   / periods),
      avgMonthlyProfit:    _r(totalNetProfit / periods),
      openingNetMargin:    projections[0].netMargin,
      closingNetMargin:    projections[periods - 1].netMargin,
      revenueGrowthPeriod: _r(projections[periods - 1].revenue - baseRevenue),
      revenueGrowthRate,
    },
  };
}

/**
 * Forecast loan balance decline over N months.
 * Uses the same amortization logic as Module 2.
 *
 * @param {object} p
 * @param {number} p.principal          – Original outstanding balance
 * @param {number} p.annualRate         – Annual interest rate %
 * @param {number} p.emi                – Monthly EMI
 * @param {number} [p.periods=24]       – Months to project (capped at full tenure)
 * @returns {object}
 */
function forecastLoanBalance({ principal, annualRate, emi, periods = 24 }) {
  if (typeof principal !== "number" || principal <= 0) throw new Error("principal must be positive.");
  if (typeof annualRate !== "number" || annualRate < 0) throw new Error("annualRate cannot be negative.");
  if (typeof emi !== "number" || emi <= 0)              throw new Error("emi must be positive.");

  const monthlyRate = annualRate / 12 / 100;
  const projections = [];
  let outstanding        = principal;
  let totalInterestPaid  = 0;
  let totalPrincipalPaid = 0;

  for (let i = 1; i <= periods; i++) {
    if (outstanding <= 0.01) break;
    const interest        = _r(outstanding * monthlyRate);
    const principalRepaid = _r(Math.min(emi - interest, outstanding));
    outstanding           = _r(outstanding - principalRepaid);
    totalInterestPaid     = _r(totalInterestPaid  + interest);
    totalPrincipalPaid    = _r(totalPrincipalPaid + principalRepaid);

    projections.push({
      period: i,
      interestPaid:       interest,
      principalRepaid,
      outstandingBalance: outstanding,
      totalInterestPaid,
      totalPrincipalPaid,
      pctRepaid: _r(((principal - outstanding) / principal) * 100),
    });
  }

  // Key milestones (25%, 50%, 75% paid off)
  const milestones = {};
  [25, 50, 75].forEach(pct => {
    const mp = projections.find(p => p.pctRepaid >= pct);
    if (mp) milestones[`${pct}pct`] = mp.period;
  });

  return {
    projections,
    milestones,
    summary: {
      originalPrincipal: principal,
      periodsShown:      projections.length,
      balanceAtEnd:      projections[projections.length - 1]?.outstandingBalance ?? 0,
      pctRepaidAtEnd:    projections[projections.length - 1]?.pctRepaid ?? 100,
      totalInterestPaid,
      totalPrincipalPaid,
      estimatedFullTenure: _estimateTenure(principal, monthlyRate, emi),
    },
  };
}

/**
 * Build optimistic / base / pessimistic scenario cash-flow forecasts.
 *
 * @param {object} p
 * @param {object} p.baseParams               – Same as forecastCashFlow inputs
 * @param {number} [p.optimisticRevGrowth]    – Defaults to baseRate × 2 (min 2%)
 * @param {number} [p.pessimisticRevGrowth]   – Defaults to max(0, baseRate × 0.25)
 * @param {number} [p.optimisticExpGrowth]    – Defaults to baseRate × 0.5
 * @param {number} [p.pessimisticExpGrowth]   – Defaults to baseRate × 2 (min 3%)
 * @returns {object}
 */
function buildScenarios({
  baseParams,
  optimisticRevGrowth,
  pessimisticRevGrowth,
  optimisticExpGrowth,
  pessimisticExpGrowth,
}) {
  const bRev = baseParams.revenueGrowthRate ?? 0;
  const bExp = baseParams.expenseGrowthRate ?? 0;

  const optRev  = optimisticRevGrowth   ?? Math.max(bRev * 2, 2);
  const pessRev = pessimisticRevGrowth  ?? Math.max(bRev * 0.25, 0);
  const optExp  = optimisticExpGrowth   ?? Math.max(bExp * 0.5, 0);
  const pessExp = pessimisticExpGrowth  ?? Math.max(bExp * 2, 3);

  return {
    optimistic:  forecastCashFlow({ ...baseParams, revenueGrowthRate: optRev,  expenseGrowthRate: optExp  }),
    base:        forecastCashFlow(baseParams),
    pessimistic: forecastCashFlow({ ...baseParams, revenueGrowthRate: pessRev, expenseGrowthRate: pessExp }),
    assumptions: {
      optimistic:  { revenueGrowthRate: optRev,  expenseGrowthRate: optExp  },
      base:        { revenueGrowthRate: bRev,     expenseGrowthRate: bExp    },
      pessimistic: { revenueGrowthRate: pessRev,  expenseGrowthRate: pessExp },
    },
  };
}

// ─── Internal helpers ──────────────────────────────────────────────────────

function _validate(periods, baseRevenue) {
  if (typeof periods !== "number" || periods < 1 || periods > 120)
    throw new Error("periods must be between 1 and 120.");
  if (typeof baseRevenue !== "number" || baseRevenue < 0)
    throw new Error("baseRevenue must be a non-negative number.");
}

function _estimateTenure(principal, monthlyRate, emi) {
  if (monthlyRate === 0) return Math.ceil(principal / emi);
  return Math.ceil(Math.log(emi / (emi - principal * monthlyRate)) / Math.log(1 + monthlyRate));
}

module.exports = { forecastCashFlow, forecastProfitLoss, forecastLoanBalance, buildScenarios };
