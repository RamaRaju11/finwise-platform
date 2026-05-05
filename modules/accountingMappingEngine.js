/**
 * Module 11: Accounting Mapping Engine (CRITICAL)
 *
 * Core insight: An EMI payment has TWO very different accounting treatments —
 *
 *   EMI = Interest Portion  +  Principal Portion
 *         ↓                    ↓
 *         P&L Expense          Balance Sheet (Liability ↓)
 *         (reduces profit)     (does NOT reduce profit)
 *
 * Depreciation follows a similar pattern:
 *   Depreciation Expense → P&L (reduces profit, non-cash)
 *                        → Balance Sheet (Accumulated Depreciation ↑ / Net Book Value ↓)
 *                        → CFS Operating: Non-cash add-back
 *
 * Depends on: Module 2 (EMI / amortization logic), Module 8 (P&L), Module 9 (Balance Sheet), Module 10 (CFS)
 */

function _r(n) { return Math.round(n * 100) / 100; }

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Split a single EMI payment into its interest and principal components.
 * Uses the same logic as Module 2's amortization schedule.
 *
 * @param {number} outstandingPrincipal  – Balance at the START of this period
 * @param {number} annualRate            – Annual interest rate (e.g. 12 for 12%)
 * @param {number} emi                   – Fixed monthly EMI amount
 * @returns {object}
 */
function splitEMIPayment(outstandingPrincipal, annualRate, emi) {
  if (typeof outstandingPrincipal !== "number" || outstandingPrincipal < 0)
    throw new Error("outstandingPrincipal must be a non-negative number.");
  if (typeof annualRate !== "number" || annualRate < 0)
    throw new Error("annualRate must be a non-negative number.");
  if (typeof emi !== "number" || emi < 0)
    throw new Error("emi must be a non-negative number.");

  const monthlyRate     = annualRate / 12 / 100;
  const interestPortion = _r(outstandingPrincipal * monthlyRate);
  // Principal cannot exceed the outstanding balance (final payment edge case)
  const principalPortion = _r(Math.min(emi - interestPortion, outstandingPrincipal));
  const outstandingAfter = _r(outstandingPrincipal - principalPortion);

  return {
    outstandingBefore: _r(outstandingPrincipal),
    emi:               _r(emi),
    interestPortion,
    principalPortion,
    outstandingAfter,
    interestPct:  emi > 0 ? _r((interestPortion  / emi) * 100) : 0,
    principalPct: emi > 0 ? _r((principalPortion / emi) * 100) : 0,
  };
}

/**
 * Generate a double-entry journal entry for a single EMI payment.
 *
 * Accounting entry:
 *   DR  Interest Expense     [interestPortion]   → P&L
 *   DR  Loan Liability       [principalPortion]  → Balance Sheet
 *   CR  Cash / Bank Account  [totalEMI]          → Cash Flow Statement
 *
 * @param {object} p
 * @param {string} [p.loanName="Loan"]
 * @param {number} p.outstandingPrincipal
 * @param {number} p.annualRate
 * @param {number} p.emi
 * @param {string} [p.period=""]
 * @returns {object}
 */
function generateLoanJournalEntry({ loanName = "Loan", outstandingPrincipal, annualRate, emi, period = "" }) {
  const split = splitEMIPayment(outstandingPrincipal, annualRate, emi);

  const debits = [];
  if (split.interestPortion > 0) {
    debits.push({
      account:   "Interest Expense",
      amount:    split.interestPortion,
      statement: "P&L",
      note:      "Operating expense — reduces net profit",
    });
  }
  if (split.principalPortion > 0) {
    debits.push({
      account:   `${loanName} Payable`,
      amount:    split.principalPortion,
      statement: "Balance Sheet",
      note:      "Reduces loan liability — does NOT affect profit",
    });
  }

  const credits = [{
    account:   "Cash / Bank Account",
    amount:    _r(split.emi),
    statement: "Cash Flow Statement",
    note:      "Financing outflow — total cash paid",
  }];

  const totalDebits  = _r(debits.reduce((s, d) => s + d.amount, 0));
  const totalCredits = _r(credits.reduce((s, c) => s + c.amount, 0));
  const isBalanced   = Math.abs(totalDebits - totalCredits) < 0.02;

  return {
    type: "loan_payment",
    period,
    loanName,
    split,
    debits,
    credits,
    totalDebits,
    totalCredits,
    isBalanced,
    statementMapping: {
      pnl:          { label: "Interest Expense", amount: split.interestPortion, sign: -1 },
      balanceSheet: { label: `${loanName} Liability ↓`, amount: split.principalPortion, sign: -1 },
      cfs:          { label: "Financing Outflow", amount: split.emi, sign: -1 },
    },
  };
}

/**
 * Generate a journal entry for asset depreciation.
 *
 * Accounting entry:
 *   DR  Depreciation Expense        [amount]  → P&L (non-cash, add back in CFS)
 *   CR  Accumulated Depreciation    [amount]  → Balance Sheet (reduces net book value)
 *
 * @param {object} p
 * @param {string} p.assetName
 * @param {number} p.cost                    – Original purchase cost
 * @param {number} [p.salvageValue=0]        – Residual value at end of life
 * @param {number} p.usefulLifeYears         – Useful life in years
 * @param {"straight-line"|"double-declining"} [p.method="straight-line"]
 * @param {number} [p.yearNumber=1]          – Which year (1-based, for double-declining)
 * @param {number} [p.currentBookValue]      – Required for double-declining from year 2+
 * @param {string} [p.period=""]
 * @returns {object}
 */
function generateDepreciationEntry({
  assetName,
  cost,
  salvageValue = 0,
  usefulLifeYears,
  method = "straight-line",
  yearNumber = 1,
  currentBookValue,
  period = "",
}) {
  if (typeof cost !== "number" || cost <= 0)           throw new Error("cost must be a positive number.");
  if (typeof usefulLifeYears !== "number" || usefulLifeYears <= 0) throw new Error("usefulLifeYears must be positive.");
  if (salvageValue < 0)                                throw new Error("salvageValue cannot be negative.");
  if (salvageValue >= cost)                            throw new Error("salvageValue must be less than cost.");

  let annualDepreciation;
  if (method === "straight-line") {
    annualDepreciation = _r((cost - salvageValue) / usefulLifeYears);
  } else if (method === "double-declining") {
    const ddRate   = 2 / usefulLifeYears;
    const bookVal  = currentBookValue !== undefined ? currentBookValue : cost;
    annualDepreciation = _r(Math.min(bookVal * ddRate, bookVal - salvageValue));
  } else {
    throw new Error(`Unknown depreciation method: ${method}. Use "straight-line" or "double-declining".`);
  }

  const monthlyDepreciation = _r(annualDepreciation / 12);

  const debits = [{
    account:   "Depreciation Expense",
    amount:    monthlyDepreciation,
    statement: "P&L",
    note:      "Non-cash expense — reduces profit but no cash leaves the business",
  }];

  const credits = [{
    account:   `Accumulated Depreciation — ${assetName}`,
    amount:    monthlyDepreciation,
    statement: "Balance Sheet",
    note:      "Reduces net book value of asset (contra-asset account)",
  }];

  return {
    type: "depreciation",
    period,
    assetName,
    cost,
    salvageValue,
    usefulLifeYears,
    method,
    annualDepreciation,
    monthlyDepreciation,
    debits,
    credits,
    totalDebits:  monthlyDepreciation,
    totalCredits: monthlyDepreciation,
    isBalanced:   true,
    statementMapping: {
      pnl:          { label: "Depreciation Expense", amount: monthlyDepreciation, sign: -1,
                      note: "Reduces profit" },
      balanceSheet: { label: `Accumulated Depreciation ↑ (${assetName})`, amount: monthlyDepreciation, sign: -1,
                      note: "Reduces net book value" },
      cfs:          { label: "Non-cash Add-back", amount: monthlyDepreciation, sign: +1,
                      note: "Added back to net profit in operating activities" },
    },
  };
}

/**
 * Build a complete period accounting mapping for all loans + depreciation items.
 * Shows exactly what flows into each financial statement.
 *
 * @param {object} p
 * @param {string} [p.period=""]
 * @param {Array}  [p.loans=[]]              – Array of { loanName, outstandingPrincipal, annualRate, emi }
 * @param {Array}  [p.depreciationItems=[]]  – Array of { assetName, cost, salvageValue, usefulLifeYears, method }
 * @returns {object}
 */
function buildPeriodMapping({ period = "", loans = [], depreciationItems = [] }) {
  const loanEntries = loans.map(l => generateLoanJournalEntry({ ...l, period }));
  const depEntries  = depreciationItems.map(d => generateDepreciationEntry({ ...d, period }));

  // ── Aggregate P&L impacts ──────────────────────────────────────────────────
  const totalInterestExpense = _r(loanEntries.reduce((s, e) => s + e.split.interestPortion, 0));
  const totalDepreciation    = _r(depEntries.reduce((s, e) => s + e.monthlyDepreciation, 0));
  const totalPnLReduction    = _r(totalInterestExpense + totalDepreciation);

  // ── Aggregate Balance Sheet impacts ───────────────────────────────────────
  const totalPrincipalRepaid     = _r(loanEntries.reduce((s, e) => s + e.split.principalPortion, 0));
  const totalAccumDepreciation   = totalDepreciation;

  // ── Aggregate Cash Flow impacts ───────────────────────────────────────────
  const totalEMIPaid             = _r(loanEntries.reduce((s, e) => s + e.split.emi, 0));
  // Interest is embedded in operating CF via net profit (not a separate CFS line)
  // Principal is in financing outflows
  // Depreciation is a non-cash add-back in operating

  const allEntries   = [...loanEntries, ...depEntries];
  const isAllBalanced = allEntries.every(e => e.isBalanced);

  return {
    period,
    loanEntries,
    depreciationEntries: depEntries,

    pnlImpacts: {
      interestExpense: totalInterestExpense,
      depreciation:    totalDepreciation,
      totalReduction:  totalPnLReduction,
      note: "These reduce net profit in the P&L statement.",
    },

    balanceSheetImpacts: {
      loanLiabilityReduction:  totalPrincipalRepaid,
      accumulatedDepreciation: totalAccumDepreciation,
      note: "Loan liability decreases; fixed asset net book value decreases.",
    },

    cashFlowImpacts: {
      financingOutflow:      totalEMIPaid,        // Financing section
      nonCashAddback:        totalDepreciation,   // Operating add-back
      note: "Total EMI is cash out (financing). Depreciation is added back in operating (non-cash).",
    },

    allJournalEntries: allEntries,
    isAllBalanced,
    entryCount: allEntries.length,
  };
}

/**
 * Reconcile loan data across all three financial statements.
 * Validates that the numbers are consistent between P&L, Balance Sheet, and CFS.
 *
 * @param {object} p
 * @param {number} p.pnlInterestExpense        – Interest shown in P&L
 * @param {number} p.scheduleInterestSum       – Sum of interest from amortization schedule (Module 2)
 * @param {number} p.bsLoanBalance             – Outstanding loan shown on Balance Sheet
 * @param {number} p.originalPrincipal         – Original loan amount
 * @param {number} p.cumulativePrincipalRepaid – Sum of all principal payments made so far
 * @returns {object}
 */
function reconcileStatements({ pnlInterestExpense, scheduleInterestSum,
                                bsLoanBalance, originalPrincipal, cumulativePrincipalRepaid }) {
  const expectedLoanBalance = _r(originalPrincipal - cumulativePrincipalRepaid);
  const interestMatch    = Math.abs(pnlInterestExpense  - scheduleInterestSum) < 0.02;
  const loanBalanceMatch = Math.abs(bsLoanBalance       - expectedLoanBalance) < 0.02;
  const isReconciled     = interestMatch && loanBalanceMatch;

  const alerts = [];
  if (!interestMatch)
    alerts.push(`Interest mismatch — P&L: ${pnlInterestExpense}, schedule: ${scheduleInterestSum}. Difference: ${_r(pnlInterestExpense - scheduleInterestSum)}`);
  if (!loanBalanceMatch)
    alerts.push(`Loan balance mismatch — B/S: ${bsLoanBalance}, expected: ${expectedLoanBalance}. Difference: ${_r(bsLoanBalance - expectedLoanBalance)}`);

  return {
    interestMatch,
    loanBalanceMatch,
    isReconciled,
    expectedLoanBalance,
    alerts,
    note: isReconciled
      ? "✅ All statements are consistent with the loan schedule."
      : "❌ Discrepancies found — check the inputs above.",
  };
}

/**
 * Show the "confusion vs reality" table for a given EMI.
 * Educational helper that explains the common mistake.
 *
 * @param {number} emi
 * @param {number} interestPortion
 * @param {number} principalPortion
 * @returns {object}
 */
function explainEMIMisconception(emi, interestPortion, principalPortion) {
  return {
    misconception: {
      label:            "What many owners think",
      profitReduction:  emi,
      note:             "Treating the full EMI as a business expense overstates costs.",
    },
    reality: {
      label:            "Correct accounting treatment",
      profitReduction:  interestPortion,
      liabilityReduction: principalPortion,
      note:             "Only the interest portion flows to P&L. Principal reduces the loan on the Balance Sheet.",
    },
    overstatement: _r(emi - interestPortion),
    overstatementPct: emi > 0 ? _r(((emi - interestPortion) / emi) * 100) : 0,
  };
}

module.exports = {
  splitEMIPayment,
  generateLoanJournalEntry,
  generateDepreciationEntry,
  buildPeriodMapping,
  reconcileStatements,
  explainEMIMisconception,
};
