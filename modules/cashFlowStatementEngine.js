/**
 * Module 10: Cash Flow Statement Engine
 *
 * Three sections (Indirect Method):
 *   Operating  : Net Profit + non-cash adjustments + working-capital changes
 *   Investing  : Asset purchases / disposals
 *   Financing  : Loans drawn / repaid, owner injections / drawings
 *
 * Core equation:
 *   Net Cash Change = Operating + Investing + Financing
 *   Closing Cash    = Opening Cash + Net Cash Change
 *
 * Depends on:
 *   Module 8  – netProfit (operating section starting point)
 *   Module 2  – principalRepayments (financing outflow)
 *   Module 9  – balance-sheet cash for reconciliation
 */

function _r(n) { return Math.round(n * 100) / 100; }

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build a single-period Cash Flow Statement (Indirect Method).
 *
 * Sign convention for working-capital inputs:
 *   changeInAccountsReceivable  positive = AR went UP  (cash tied up → outflow)
 *   changeInInventory            positive = Inventory UP (cash tied up → outflow)
 *   changeInAccountsPayable      positive = AP went UP  (cash retained → inflow)
 *   changeInOtherWorkingCapital  positive = net inflow
 *
 * All "purchases / payments" fields are entered as positive numbers;
 * the function applies the correct sign internally.
 *
 * @param {object} p
 * @param {string} [p.period=""]
 * @param {number} [p.openingCash=0]
 *
 * Operating
 * @param {number} [p.netProfit=0]                     – From Module 8
 * @param {number} [p.depreciation=0]                  – Non-cash add-back
 * @param {number} [p.amortization=0]                  – Non-cash add-back
 * @param {number} [p.changeInAccountsReceivable=0]
 * @param {number} [p.changeInInventory=0]
 * @param {number} [p.changeInAccountsPayable=0]
 * @param {number} [p.changeInOtherWorkingCapital=0]
 *
 * Investing
 * @param {number} [p.equipmentPurchases=0]
 * @param {number} [p.propertyPurchases=0]
 * @param {number} [p.assetSalesProceeds=0]
 * @param {number} [p.otherInvestingInflows=0]
 * @param {number} [p.otherInvestingOutflows=0]
 *
 * Financing
 * @param {number} [p.newLoanDrawdowns=0]
 * @param {number} [p.principalRepayments=0]           – From Module 2
 * @param {number} [p.ownerCapitalInjections=0]
 * @param {number} [p.ownerDrawings=0]
 * @param {number} [p.otherFinancingInflows=0]
 * @param {number} [p.otherFinancingOutflows=0]
 *
 * @returns {object} full CFS with section totals, summary, and health assessment
 */
function buildCashFlowStatement({
  period = "",
  openingCash = 0,

  // Operating
  netProfit                   = 0,
  depreciation                = 0,
  amortization                = 0,
  changeInAccountsReceivable  = 0,
  changeInInventory           = 0,
  changeInAccountsPayable     = 0,
  changeInOtherWorkingCapital = 0,

  // Investing
  equipmentPurchases    = 0,
  propertyPurchases     = 0,
  assetSalesProceeds    = 0,
  otherInvestingInflows = 0,
  otherInvestingOutflows = 0,

  // Financing
  newLoanDrawdowns       = 0,
  principalRepayments    = 0,
  ownerCapitalInjections = 0,
  ownerDrawings          = 0,
  otherFinancingInflows  = 0,
  otherFinancingOutflows = 0,
} = {}) {

  _validateCFS({ openingCash, depreciation, amortization,
    equipmentPurchases, propertyPurchases, assetSalesProceeds,
    newLoanDrawdowns, principalRepayments, ownerCapitalInjections, ownerDrawings });

  // ── Operating Activities ──────────────────────────────────────────────────
  const nonCashAdjustments      = _r(depreciation + amortization);
  const workingCapitalChanges   = _r(
    -changeInAccountsReceivable   // AR up  → cash out
    - changeInInventory            // Inv up → cash out
    + changeInAccountsPayable      // AP up  → cash in (delayed payment)
    + changeInOtherWorkingCapital
  );
  const netCashFromOperating    = _r(netProfit + nonCashAdjustments + workingCapitalChanges);

  // ── Investing Activities ──────────────────────────────────────────────────
  const totalInvestingInflows   = _r(assetSalesProceeds + otherInvestingInflows);
  const totalInvestingOutflows  = _r(equipmentPurchases + propertyPurchases + otherInvestingOutflows);
  const netCashFromInvesting    = _r(totalInvestingInflows - totalInvestingOutflows);

  // ── Financing Activities ──────────────────────────────────────────────────
  const totalFinancingInflows   = _r(newLoanDrawdowns + ownerCapitalInjections + otherFinancingInflows);
  const totalFinancingOutflows  = _r(principalRepayments + ownerDrawings + otherFinancingOutflows);
  const netCashFromFinancing    = _r(totalFinancingInflows - totalFinancingOutflows);

  // ── Summary ───────────────────────────────────────────────────────────────
  const netCashChange = _r(netCashFromOperating + netCashFromInvesting + netCashFromFinancing);
  const closingCash   = _r(openingCash + netCashChange);

  return {
    period,
    openingCash,

    operating: {
      netProfit,
      depreciation,
      amortization,
      nonCashAdjustments,
      changeInAccountsReceivable,
      changeInInventory,
      changeInAccountsPayable,
      changeInOtherWorkingCapital,
      workingCapitalChanges,
      netCashFromOperating,
    },

    investing: {
      equipmentPurchases,
      propertyPurchases,
      assetSalesProceeds,
      otherInvestingInflows,
      otherInvestingOutflows,
      totalInvestingInflows,
      totalInvestingOutflows,
      netCashFromInvesting,
    },

    financing: {
      newLoanDrawdowns,
      principalRepayments,
      ownerCapitalInjections,
      ownerDrawings,
      otherFinancingInflows,
      otherFinancingOutflows,
      totalFinancingInflows,
      totalFinancingOutflows,
      netCashFromFinancing,
    },

    summary: {
      openingCash,
      netCashFromOperating,
      netCashFromInvesting,
      netCashFromFinancing,
      netCashChange,
      closingCash,
    },

    health: _assessHealth(netCashFromOperating, netCashFromInvesting,
                          netCashFromFinancing, netCashChange, closingCash, netProfit),
  };
}

/**
 * Generate a multi-period Cash Flow Statement.
 * Closing cash of each period rolls forward as opening cash of the next.
 *
 * @param {Array<object>} periods  – Array of period params (same shape as buildCashFlowStatement)
 *                                   openingCash in period[0] sets the starting balance;
 *                                   openingCash in subsequent periods is ignored (auto-chained).
 * @returns {object}
 */
function generateMultiPeriodCFS(periods) {
  if (!Array.isArray(periods) || periods.length === 0)
    throw new Error("periods must be a non-empty array.");

  const results = [];
  let runningCash = periods[0].openingCash ?? 0;

  for (const p of periods) {
    const result = buildCashFlowStatement({ ...p, openingCash: runningCash });
    results.push(result);
    runningCash = result.summary.closingCash;
  }

  const n = results.length;
  const sumSection = (section, key) =>
    _r(results.reduce((s, r) => s + (r[section][key] ?? 0), 0));

  const totalOperating  = sumSection("summary", "netCashFromOperating");
  const totalInvesting  = sumSection("summary", "netCashFromInvesting");
  const totalFinancing  = sumSection("summary", "netCashFromFinancing");
  const totalNetChange  = _r(totalOperating + totalInvesting + totalFinancing);

  return {
    periods: results,
    summary: {
      openingCash:     results[0].openingCash,
      closingCash:     results[n - 1].summary.closingCash,
      totalOperating,
      totalInvesting,
      totalFinancing,
      totalNetChange,
    },
    stats: {
      operatingPositive: results.filter(r => r.operating.netCashFromOperating > 0).length,
      operatingNegative: results.filter(r => r.operating.netCashFromOperating <= 0).length,
      bestOperating:  results.reduce((a, b) =>
        a.operating.netCashFromOperating > b.operating.netCashFromOperating ? a : b),
      worstOperating: results.reduce((a, b) =>
        a.operating.netCashFromOperating < b.operating.netCashFromOperating ? a : b),
    },
  };
}

/**
 * Reconcile the statement's closing cash against the balance sheet cash balance.
 * (Links Module 10 → Module 9)
 *
 * @param {object} statement        – Output of buildCashFlowStatement()
 * @param {number} balanceSheetCash – cash field from Module 9 balance sheet
 * @returns {object}
 */
function reconcileCashBalance(statement, balanceSheetCash) {
  if (typeof balanceSheetCash !== "number" || balanceSheetCash < 0)
    throw new Error("balanceSheetCash must be a non-negative number.");

  const difference   = _r(statement.summary.closingCash - balanceSheetCash);
  const isReconciled = Math.abs(difference) < 0.02;

  return {
    statementClosingCash: statement.summary.closingCash,
    balanceSheetCash,
    difference,
    isReconciled,
    note: isReconciled
      ? "✅ Cash position reconciles with the balance sheet."
      : `❌ Discrepancy of ${Math.abs(difference).toFixed(2)} — check for missing entries.`,
  };
}

// ─── Internal helpers ──────────────────────────────────────────────────────

function _validateCFS(fields) {
  const nonNeg = [
    "openingCash", "depreciation", "amortization",
    "equipmentPurchases", "propertyPurchases", "assetSalesProceeds",
    "newLoanDrawdowns", "principalRepayments", "ownerCapitalInjections", "ownerDrawings",
  ];
  for (const key of nonNeg) {
    if (fields[key] !== undefined && (typeof fields[key] !== "number" || fields[key] < 0))
      throw new Error(`${key} must be a non-negative number. Got: ${fields[key]}`);
  }
}

function _assessHealth(operating, investing, financing, netChange, closingCash, netProfit) {
  const alerts = [], strengths = [];
  let score = 100;

  // Operating CF is the primary health indicator
  if (operating > 0) {
    strengths.push("Positive operating cash flow — business generates real cash.");
  } else if (operating < 0 && netProfit > 0) {
    alerts.push("Operating CF is negative despite reported profit — working capital is consuming cash.");
    score -= 20;
  } else if (operating < 0) {
    alerts.push("Negative operating cash flow — business is burning cash from operations.");
    score -= 35;
  }

  // Investing CF — typically negative for growing businesses
  if (investing < 0) {
    strengths.push("Investing outflows detected — business is reinvesting in assets.");
  } else if (investing > 0) {
    alerts.push("Net asset disposals — may indicate downsizing or asset liquidation.");
  }

  // Financing CF — context-dependent
  if (financing > 0 && operating < 0) {
    alerts.push("Relying on financing (loans/equity) to cover operating shortfalls — unsustainable long-term.");
    score -= 15;
  }
  if (financing < 0 && operating > 0) {
    strengths.push("Using operational surplus to reduce debt or return capital — financially sound.");
  }

  // Closing cash
  if (closingCash <= 0) {
    alerts.push("Closing cash is zero or negative — immediate liquidity risk.");
    score -= 30;
  } else if (closingCash < Math.abs(operating) * 0.5) {
    alerts.push("Cash reserves are thin relative to operating cash flows — limited buffer.");
    score -= 10;
  }

  // Net change
  if (netChange > 0) {
    strengths.push("Net positive cash movement this period.");
  } else if (netChange < 0) {
    alerts.push("Net cash decreased this period.");
    score -= 5;
  }

  score = Math.max(0, score);
  const status = score >= 80 ? "healthy" : score >= 55 ? "moderate" : "stressed";
  return { score, status, alerts, strengths };
}

module.exports = { buildCashFlowStatement, generateMultiPeriodCFS, reconcileCashBalance };
