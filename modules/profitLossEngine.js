/**
 * Module 8: Profit & Loss (P&L) Engine
 *
 * Formula: Revenue - COGS = Gross Profit
 *          Gross Profit - Operating Expenses = Operating Profit (EBIT)
 *          EBIT - Interest Expense = Net Profit Before Tax (EBT)
 *          EBT - Tax = Net Profit After Tax
 *
 * Depends on: Module 2 (Loan Engine) for interest expense
 */

function _r(n) { return Math.round(n * 100) / 100; }

/**
 * Calculate P&L for a single period (one month or one year).
 *
 * @param {object} p
 * @param {number} p.revenue               - Total revenue / sales
 * @param {number} [p.cogs=0]              - Cost of Goods Sold (direct costs)
 * @param {number} [p.fixedOpex=0]         - Fixed operating expenses (rent, salaries)
 * @param {number} [p.variableOpex=0]      - Variable operating expenses (commissions, supplies)
 * @param {number} [p.interestExpense=0]   - Interest paid on loans (from Module 2)
 * @param {number} [p.taxRate=0]           - Tax rate as % (e.g. 25 for 25%)
 * @param {string} [p.period=""]           - Label (e.g. "Jan 2025")
 * @returns {object} full P&L breakdown
 */
function calculatePeriodPL({
  revenue,
  cogs = 0,
  fixedOpex = 0,
  variableOpex = 0,
  interestExpense = 0,
  taxRate = 0,
  period = "",
}) {
  _validatePL(revenue, cogs, fixedOpex, variableOpex, interestExpense, taxRate);

  const grossProfit        = _r(revenue - cogs);
  const totalOpex          = _r(fixedOpex + variableOpex);
  const operatingProfit    = _r(grossProfit - totalOpex);   // EBIT
  const netProfitBeforeTax = _r(operatingProfit - interestExpense); // EBT
  const taxAmount          = taxRate > 0 ? _r(netProfitBeforeTax > 0 ? netProfitBeforeTax * (taxRate / 100) : 0) : 0;
  const netProfitAfterTax  = _r(netProfitBeforeTax - taxAmount);

  const grossMargin     = revenue > 0 ? _r((grossProfit / revenue) * 100) : 0;
  const operatingMargin = revenue > 0 ? _r((operatingProfit / revenue) * 100) : 0;
  const netMargin       = revenue > 0 ? _r((netProfitAfterTax / revenue) * 100) : 0;

  return {
    period,
    // Income statement lines
    revenue,
    cogs,
    grossProfit,
    fixedOpex,
    variableOpex,
    totalOpex,
    operatingProfit,
    interestExpense,
    netProfitBeforeTax,
    taxRate,
    taxAmount,
    netProfitAfterTax,
    // Ratios
    grossMargin,
    operatingMargin,
    netMargin,
    // Status
    isProfitable: netProfitAfterTax > 0,
    status: netProfitAfterTax > 0 ? "profit" : netProfitAfterTax === 0 ? "breakeven" : "loss",
  };
}

/**
 * Generate a multi-period P&L (e.g. 12 months or 3 years).
 *
 * @param {Array<object>} periods  - Array of period input objects (same shape as calculatePeriodPL)
 * @returns {{
 *   periods: Array,
 *   totals: object,
 *   averages: object,
 *   profitableMonths: number,
 *   lossMonths: number,
 *   bestPeriod: object,
 *   worstPeriod: object,
 * }}
 */
function generateMultiPeriodPL(periods) {
  if (!Array.isArray(periods) || periods.length === 0)
    throw new Error("periods must be a non-empty array.");

  const results = periods.map(p => calculatePeriodPL(p));
  const n = results.length;

  const sum = key => _r(results.reduce((s, r) => s + r[key], 0));

  const totals = {
    revenue:             sum("revenue"),
    cogs:                sum("cogs"),
    grossProfit:         sum("grossProfit"),
    totalOpex:           sum("totalOpex"),
    operatingProfit:     sum("operatingProfit"),
    interestExpense:     sum("interestExpense"),
    netProfitBeforeTax:  sum("netProfitBeforeTax"),
    taxAmount:           sum("taxAmount"),
    netProfitAfterTax:   sum("netProfitAfterTax"),
  };

  totals.grossMargin     = totals.revenue > 0 ? _r((totals.grossProfit / totals.revenue) * 100) : 0;
  totals.operatingMargin = totals.revenue > 0 ? _r((totals.operatingProfit / totals.revenue) * 100) : 0;
  totals.netMargin       = totals.revenue > 0 ? _r((totals.netProfitAfterTax / totals.revenue) * 100) : 0;

  const averages = {};
  Object.keys(totals).forEach(k => {
    averages[k] = _r(totals[k] / n);
  });

  const profitableMonths = results.filter(r => r.isProfitable).length;
  const lossMonths       = results.filter(r => r.status === "loss").length;
  const bestPeriod       = results.reduce((a, b) => a.netProfitAfterTax > b.netProfitAfterTax ? a : b);
  const worstPeriod      = results.reduce((a, b) => a.netProfitAfterTax < b.netProfitAfterTax ? a : b);

  return {
    periods: results,
    totals,
    averages,
    profitableMonths,
    lossMonths,
    bestPeriod,
    worstPeriod,
  };
}

/**
 * Extract interest expense from a loan for a specific month.
 * Uses amortization logic from Module 2.
 *
 * @param {number} outstandingPrincipal  - Balance at start of month
 * @param {number} annualRate            - Annual interest rate %
 * @returns {number} monthly interest expense
 */
function getMonthlyInterestExpense(outstandingPrincipal, annualRate) {
  if (outstandingPrincipal < 0) throw new Error("outstandingPrincipal cannot be negative.");
  if (annualRate < 0)           throw new Error("annualRate cannot be negative.");
  return _r(outstandingPrincipal * (annualRate / 12 / 100));
}

// ─── Internal validation ───────────────────────────────────────────────────

function _validatePL(revenue, cogs, fixedOpex, variableOpex, interestExpense, taxRate) {
  if (typeof revenue !== "number" || revenue < 0)          throw new Error("revenue must be a non-negative number.");
  if (typeof cogs !== "number" || cogs < 0)                throw new Error("cogs must be a non-negative number.");
  if (typeof fixedOpex !== "number" || fixedOpex < 0)      throw new Error("fixedOpex must be a non-negative number.");
  if (typeof variableOpex !== "number" || variableOpex < 0) throw new Error("variableOpex must be a non-negative number.");
  if (typeof interestExpense !== "number" || interestExpense < 0) throw new Error("interestExpense must be a non-negative number.");
  if (typeof taxRate !== "number" || taxRate < 0 || taxRate > 100) throw new Error("taxRate must be between 0 and 100.");
}

module.exports = { calculatePeriodPL, generateMultiPeriodPL, getMonthlyInterestExpense };
