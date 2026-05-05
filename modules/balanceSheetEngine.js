/**
 * Module 9: Balance Sheet Engine
 *
 * Equation: Assets = Liabilities + Equity  (must always balance)
 *
 * Structure:
 *   ASSETS
 *     Current Assets  : cash, accountsReceivable, inventory, otherCurrentAssets
 *     Fixed Assets    : equipment, property, otherFixedAssets
 *   LIABILITIES
 *     Current Liabilities : accountsPayable, shortTermDebt, otherCurrentLiabilities
 *     Long-Term Liabilities: loanPrincipalOutstanding (from Module 2), otherLongTermLiabilities
 *   EQUITY
 *     ownerEquity, retainedEarnings (from Module 8 net profit)
 *
 * Depends on: Module 2 (outstanding principal), Module 8 (net profit → retained earnings)
 */

function _r(n) { return Math.round(n * 100) / 100; }

/**
 * Build a balance sheet snapshot for a single point in time.
 *
 * @param {object} assets
 * @param {number} [assets.cash=0]
 * @param {number} [assets.accountsReceivable=0]
 * @param {number} [assets.inventory=0]
 * @param {number} [assets.otherCurrentAssets=0]
 * @param {number} [assets.equipment=0]
 * @param {number} [assets.property=0]
 * @param {number} [assets.otherFixedAssets=0]
 *
 * @param {object} liabilities
 * @param {number} [liabilities.accountsPayable=0]
 * @param {number} [liabilities.shortTermDebt=0]
 * @param {number} [liabilities.otherCurrentLiabilities=0]
 * @param {number} [liabilities.loanPrincipalOutstanding=0]  - From Module 2
 * @param {number} [liabilities.otherLongTermLiabilities=0]
 *
 * @param {object} equity
 * @param {number} [equity.ownerEquity=0]
 * @param {number} [equity.retainedEarnings=0]  - Cumulative net profit from Module 8
 *
 * @param {string} [period=""]
 *
 * @returns {object} full balance sheet with totals, ratios, and balance check
 */
function buildBalanceSheet(assets = {}, liabilities = {}, equity = {}, period = "") {
  // ── Assets ──────────────────────────────────────────────────────────────
  const cash                = _pos(assets.cash);
  const accountsReceivable  = _pos(assets.accountsReceivable);
  const inventory           = _pos(assets.inventory);
  const otherCurrentAssets  = _pos(assets.otherCurrentAssets);
  const totalCurrentAssets  = _r(cash + accountsReceivable + inventory + otherCurrentAssets);

  const equipment           = _pos(assets.equipment);
  const property            = _pos(assets.property);
  const otherFixedAssets    = _pos(assets.otherFixedAssets);
  const totalFixedAssets    = _r(equipment + property + otherFixedAssets);

  const totalAssets         = _r(totalCurrentAssets + totalFixedAssets);

  // ── Liabilities ──────────────────────────────────────────────────────────
  const accountsPayable           = _pos(liabilities.accountsPayable);
  const shortTermDebt             = _pos(liabilities.shortTermDebt);
  const otherCurrentLiabilities   = _pos(liabilities.otherCurrentLiabilities);
  const totalCurrentLiabilities   = _r(accountsPayable + shortTermDebt + otherCurrentLiabilities);

  const loanPrincipalOutstanding  = _pos(liabilities.loanPrincipalOutstanding);
  const otherLongTermLiabilities  = _pos(liabilities.otherLongTermLiabilities);
  const totalLongTermLiabilities  = _r(loanPrincipalOutstanding + otherLongTermLiabilities);

  const totalLiabilities          = _r(totalCurrentLiabilities + totalLongTermLiabilities);

  // ── Equity ───────────────────────────────────────────────────────────────
  const ownerEquity       = assets.ownerEquity !== undefined ? assets.ownerEquity
                          : equity.ownerEquity !== undefined ? equity.ownerEquity : 0;
  const retainedEarnings  = equity.retainedEarnings ?? 0; // can be negative (accumulated loss)
  const totalEquity       = _r(ownerEquity + retainedEarnings);

  // ── Balance check ────────────────────────────────────────────────────────
  const liabilitiesPlusEquity = _r(totalLiabilities + totalEquity);
  const isBalanced            = Math.abs(totalAssets - liabilitiesPlusEquity) < 0.02; // allow rounding
  const balanceDifference     = _r(totalAssets - liabilitiesPlusEquity);

  // ── Key ratios ───────────────────────────────────────────────────────────
  const currentRatio      = totalCurrentLiabilities > 0
    ? _r(totalCurrentAssets / totalCurrentLiabilities) : null; // ≥ 1.5 is healthy

  const quickRatio        = totalCurrentLiabilities > 0
    ? _r((totalCurrentAssets - inventory) / totalCurrentLiabilities) : null; // ≥ 1.0 is healthy

  const debtToEquityRatio = totalEquity > 0
    ? _r(totalLiabilities / totalEquity) : null; // <1 is conservative, <2 is acceptable

  const debtToAssetsRatio = totalAssets > 0
    ? _r(totalLiabilities / totalAssets) : null; // <0.5 preferred

  const equityRatio       = totalAssets > 0
    ? _r((totalEquity / totalAssets) * 100) : null;

  const workingCapital    = _r(totalCurrentAssets - totalCurrentLiabilities);

  return {
    period,
    assets: {
      cash, accountsReceivable, inventory, otherCurrentAssets, totalCurrentAssets,
      equipment, property, otherFixedAssets, totalFixedAssets,
      totalAssets,
    },
    liabilities: {
      accountsPayable, shortTermDebt, otherCurrentLiabilities, totalCurrentLiabilities,
      loanPrincipalOutstanding, otherLongTermLiabilities, totalLongTermLiabilities,
      totalLiabilities,
    },
    equity: {
      ownerEquity, retainedEarnings, totalEquity,
    },
    summary: {
      totalAssets, totalLiabilities, totalEquity,
      liabilitiesPlusEquity, isBalanced, balanceDifference,
    },
    ratios: {
      currentRatio, quickRatio,
      debtToEquityRatio, debtToAssetsRatio,
      equityRatio, workingCapital,
    },
    health: _assessHealth(currentRatio, quickRatio, debtToEquityRatio, workingCapital, totalEquity),
  };
}

/**
 * Compare two balance sheets (e.g. start vs end of year) to show changes.
 *
 * @param {object} previous  - Output of buildBalanceSheet()
 * @param {object} current   - Output of buildBalanceSheet()
 * @returns {object} delta analysis
 */
function compareBalanceSheets(previous, current) {
  const delta = (cur, prev) => _r(cur - prev);

  return {
    previousPeriod: previous.period,
    currentPeriod:  current.period,
    assets: {
      cash:               delta(current.assets.cash, previous.assets.cash),
      totalCurrentAssets: delta(current.assets.totalCurrentAssets, previous.assets.totalCurrentAssets),
      totalFixedAssets:   delta(current.assets.totalFixedAssets, previous.assets.totalFixedAssets),
      totalAssets:        delta(current.assets.totalAssets, previous.assets.totalAssets),
    },
    liabilities: {
      totalCurrentLiabilities:  delta(current.liabilities.totalCurrentLiabilities, previous.liabilities.totalCurrentLiabilities),
      loanPrincipalOutstanding: delta(current.liabilities.loanPrincipalOutstanding, previous.liabilities.loanPrincipalOutstanding),
      totalLiabilities:         delta(current.liabilities.totalLiabilities, previous.liabilities.totalLiabilities),
    },
    equity: {
      retainedEarnings: delta(current.equity.retainedEarnings, previous.equity.retainedEarnings),
      totalEquity:      delta(current.equity.totalEquity, previous.equity.totalEquity),
    },
    ratios: {
      currentRatio:      current.ratios.currentRatio && previous.ratios.currentRatio
                           ? _r(current.ratios.currentRatio - previous.ratios.currentRatio) : null,
      debtToEquityRatio: current.ratios.debtToEquityRatio && previous.ratios.debtToEquityRatio
                           ? _r(current.ratios.debtToEquityRatio - previous.ratios.debtToEquityRatio) : null,
      workingCapital:    delta(current.ratios.workingCapital, previous.ratios.workingCapital),
    },
  };
}

// ─── Internal helpers ──────────────────────────────────────────────────────

function _pos(n) {
  if (n === undefined || n === null) return 0;
  if (typeof n !== "number") throw new Error(`Expected a number, got: ${typeof n}`);
  if (n < 0) throw new Error(`Balance sheet values cannot be negative. Got: ${n}`);
  return _r(n);
}

function _assessHealth(currentRatio, quickRatio, debtToEquity, workingCapital, totalEquity) {
  const alerts = [], strengths = [];
  let score = 100;

  if (currentRatio !== null) {
    if (currentRatio >= 2)        strengths.push("Strong current ratio (≥ 2.0) — good short-term liquidity.");
    else if (currentRatio >= 1.5) strengths.push("Healthy current ratio (≥ 1.5).");
    else if (currentRatio >= 1)   alerts.push("Current ratio between 1.0–1.5 — limited liquidity buffer.");
    else                          { alerts.push("Current ratio < 1.0 — current liabilities exceed current assets."); score -= 30; }
  }

  if (quickRatio !== null) {
    if (quickRatio < 1) { alerts.push("Quick ratio < 1.0 — may struggle to meet short-term obligations without selling inventory."); score -= 20; }
  }

  if (debtToEquity !== null) {
    if (debtToEquity <= 1)        strengths.push("Conservative debt-to-equity ratio (≤ 1.0).");
    else if (debtToEquity <= 2)   alerts.push("Debt-to-equity ratio between 1–2 — moderate leverage.");
    else                          { alerts.push("Debt-to-equity > 2 — high financial leverage, increased risk."); score -= 25; }
  }

  if (workingCapital < 0)         { alerts.push("Negative working capital — business may face short-term cash crisis."); score -= 25; }
  if (totalEquity < 0)            { alerts.push("Negative equity — liabilities exceed assets (technically insolvent)."); score -= 30; }

  score = Math.max(0, score);
  const status = score >= 80 ? "healthy" : score >= 55 ? "moderate" : "stressed";
  return { score, status, alerts, strengths };
}

module.exports = { buildBalanceSheet, compareBalanceSheets };
