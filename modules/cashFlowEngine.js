/**
 * Module 1: Cash Flow Engine
 *
 * Inputs:  revenue, fixedExpenses, variableExpenses (monthly arrays or single values)
 * Outputs: netCashFlow, surplus/deficit status, summary
 */

/**
 * Calculate cash flow for a single period.
 *
 * @param {number} revenue           - Total income for the period
 * @param {number} fixedExpenses     - Expenses that don't change (rent, salaries, etc.)
 * @param {number} variableExpenses  - Expenses that vary (supplies, commissions, etc.)
 * @returns {{ netCashFlow: number, status: string, totalExpenses: number }}
 */
function calculatePeriodCashFlow(revenue, fixedExpenses, variableExpenses) {
  if (typeof revenue !== "number" || typeof fixedExpenses !== "number" || typeof variableExpenses !== "number") {
    throw new Error("All inputs must be numbers.");
  }
  if (revenue < 0 || fixedExpenses < 0 || variableExpenses < 0) {
    throw new Error("Inputs cannot be negative.");
  }

  const totalExpenses = fixedExpenses + variableExpenses;
  const netCashFlow = revenue - totalExpenses;
  const status = netCashFlow >= 0 ? "surplus" : "deficit";

  return { netCashFlow, totalExpenses, status };
}

/**
 * Calculate cash flow across multiple periods (e.g. 12 months).
 *
 * @param {Array<{ month: string, revenue: number, fixedExpenses: number, variableExpenses: number }>} periods
 * @returns {{
 *   periods: Array,
 *   totalRevenue: number,
 *   totalExpenses: number,
 *   totalNetCashFlow: number,
 *   averageMonthlyNetCashFlow: number,
 *   surplusMonths: number,
 *   deficitMonths: number,
 *   status: string
 * }}
 */
function calculateMultiPeriodCashFlow(periods) {
  if (!Array.isArray(periods) || periods.length === 0) {
    throw new Error("periods must be a non-empty array.");
  }

  const results = periods.map((p, i) => {
    const label = p.month || `Period ${i + 1}`;
    const { netCashFlow, totalExpenses, status } = calculatePeriodCashFlow(
      p.revenue,
      p.fixedExpenses,
      p.variableExpenses
    );
    return { month: label, revenue: p.revenue, fixedExpenses: p.fixedExpenses, variableExpenses: p.variableExpenses, totalExpenses, netCashFlow, status };
  });

  const totalRevenue = results.reduce((sum, r) => sum + r.revenue, 0);
  const totalExpenses = results.reduce((sum, r) => sum + r.totalExpenses, 0);
  const totalNetCashFlow = results.reduce((sum, r) => sum + r.netCashFlow, 0);
  const averageMonthlyNetCashFlow = totalNetCashFlow / results.length;
  const surplusMonths = results.filter((r) => r.status === "surplus").length;
  const deficitMonths = results.filter((r) => r.status === "deficit").length;
  const status = totalNetCashFlow >= 0 ? "surplus" : "deficit";

  return {
    periods: results,
    totalRevenue,
    totalExpenses,
    totalNetCashFlow,
    averageMonthlyNetCashFlow,
    surplusMonths,
    deficitMonths,
    status,
  };
}

module.exports = { calculatePeriodCashFlow, calculateMultiPeriodCashFlow };
