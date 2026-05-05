/**
 * Module 17: Subscription System
 *
 * Defines feature tiers (Free / Basic / Pro / Enterprise),
 * gates platform features by tier, tracks usage limits,
 * and generates upgrade prompts and billing summaries.
 *
 * Feature keys map directly to platform module IDs (M1–M18).
 */

function _r(n) { return Math.round(n * 100) / 100; }

// ─── Tier catalog ─────────────────────────────────────────────────────────

const TIERS = {
  free: {
    id: "free", name: "Free", price: { monthly: 0, annual: 0 },
    description: "Basic EMI and cash flow tools — no sign-up required",
    color: "#64748b", popular: false,
    limits: { calculationsPerMonth: 10, forecastMonths: 6, savedReports: 0, lenderComparisons: 3 },
    features: {
      // Phase 1 — Core Engines
      cashFlowEngine:           { enabled: true,  note: "Single period only"    },
      loanEngine:               { enabled: true,  note: "EMI & amortization"    },
      loanAffordabilityEngine:  { enabled: true,  note: "Basic check only"      },
      riskDebtEngine:           { enabled: false, note: "Requires Basic+"       },
      stressTestEngine:         { enabled: false, note: "Requires Basic+"       },
      multiLoanManager:         { enabled: false, note: "Requires Basic+"       },
      recommendationEngine:     { enabled: false, note: "Requires Basic+"       },
      // Phase 2 — Financial Statements
      profitLossEngine:         { enabled: false, note: "Requires Basic+"       },
      balanceSheetEngine:       { enabled: false, note: "Requires Basic+"       },
      cashFlowStatementEngine:  { enabled: false, note: "Requires Pro+"         },
      accountingMappingEngine:  { enabled: false, note: "Requires Pro+"         },
      forecastingEngine:        { enabled: false, note: "Requires Basic+"       },
      // Phase 3 — Monetization
      loanMarketplace:          { enabled: true,  note: "View only"             },
      paidReports:              { enabled: false, note: "Requires Pro+"         },
      // Export
      exportCSV:                { enabled: false, note: "Requires Basic+"       },
      exportPDF:                { enabled: false, note: "Requires Pro+"         },
      apiAccess:                { enabled: false, note: "Requires Enterprise"   },
      whiteLabel:               { enabled: false, note: "Requires Enterprise"   },
    },
  },
  basic: {
    id: "basic", name: "Basic", price: { monthly: 499, annual: 4990 },
    description: "All 7 core engines + basic financial statements",
    color: "#2563eb", popular: false,
    limits: { calculationsPerMonth: 100, forecastMonths: 12, savedReports: 5, lenderComparisons: 10 },
    features: {
      cashFlowEngine:           { enabled: true  },
      loanEngine:               { enabled: true  },
      loanAffordabilityEngine:  { enabled: true  },
      riskDebtEngine:           { enabled: true  },
      stressTestEngine:         { enabled: true  },
      multiLoanManager:         { enabled: true,  note: "Up to 5 loans"        },
      recommendationEngine:     { enabled: true  },
      profitLossEngine:         { enabled: true,  note: "Single period"        },
      balanceSheetEngine:       { enabled: true,  note: "Single period"        },
      cashFlowStatementEngine:  { enabled: false, note: "Requires Pro+"        },
      accountingMappingEngine:  { enabled: false, note: "Requires Pro+"        },
      forecastingEngine:        { enabled: true,  note: "Up to 12 months"      },
      loanMarketplace:          { enabled: true  },
      paidReports:              { enabled: false, note: "Requires Pro+"        },
      exportCSV:                { enabled: true  },
      exportPDF:                { enabled: false, note: "Requires Pro+"        },
      apiAccess:                { enabled: false, note: "Requires Enterprise"  },
      whiteLabel:               { enabled: false, note: "Requires Enterprise"  },
    },
  },
  pro: {
    id: "pro", name: "Pro", price: { monthly: 1499, annual: 14990 },
    description: "Complete platform — all 12 modules + PDF reports",
    color: "#7c3aed", popular: true,
    limits: { calculationsPerMonth: -1, forecastMonths: 36, savedReports: 25, lenderComparisons: -1 },
    features: {
      cashFlowEngine:           { enabled: true  },
      loanEngine:               { enabled: true  },
      loanAffordabilityEngine:  { enabled: true  },
      riskDebtEngine:           { enabled: true  },
      stressTestEngine:         { enabled: true  },
      multiLoanManager:         { enabled: true  },
      recommendationEngine:     { enabled: true  },
      profitLossEngine:         { enabled: true  },
      balanceSheetEngine:       { enabled: true  },
      cashFlowStatementEngine:  { enabled: true  },
      accountingMappingEngine:  { enabled: true  },
      forecastingEngine:        { enabled: true,  note: "Up to 36 months"      },
      loanMarketplace:          { enabled: true  },
      paidReports:              { enabled: true,  note: "3 reports/month"       },
      exportCSV:                { enabled: true  },
      exportPDF:                { enabled: true  },
      apiAccess:                { enabled: false, note: "Requires Enterprise"  },
      whiteLabel:               { enabled: false, note: "Requires Enterprise"  },
    },
  },
  enterprise: {
    id: "enterprise", name: "Enterprise", price: { monthly: 4999, annual: 49990 },
    description: "Unlimited access + API + white-label for teams",
    color: "#0f172a", popular: false,
    limits: { calculationsPerMonth: -1, forecastMonths: 120, savedReports: -1, lenderComparisons: -1 },
    features: {
      cashFlowEngine:           { enabled: true  },
      loanEngine:               { enabled: true  },
      loanAffordabilityEngine:  { enabled: true  },
      riskDebtEngine:           { enabled: true  },
      stressTestEngine:         { enabled: true  },
      multiLoanManager:         { enabled: true  },
      recommendationEngine:     { enabled: true  },
      profitLossEngine:         { enabled: true  },
      balanceSheetEngine:       { enabled: true  },
      cashFlowStatementEngine:  { enabled: true  },
      accountingMappingEngine:  { enabled: true  },
      forecastingEngine:        { enabled: true  },
      loanMarketplace:          { enabled: true  },
      paidReports:              { enabled: true,  note: "Unlimited"             },
      exportCSV:                { enabled: true  },
      exportPDF:                { enabled: true  },
      apiAccess:                { enabled: true  },
      whiteLabel:               { enabled: true  },
    },
  },
};

// Ordered by upgrade path
const TIER_ORDER = ["free", "basic", "pro", "enterprise"];

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/** Get all tier definitions */
function getAllTiers() { return { ...TIERS }; }

/** Get a single tier definition */
function getTier(tierId) {
  if (!TIERS[tierId]) throw new Error(`Unknown tier: "${tierId}". Valid: ${TIER_ORDER.join(", ")}`);
  return TIERS[tierId];
}

/**
 * Check if a feature is accessible on a given tier.
 *
 * @param {string} tierId      – "free" | "basic" | "pro" | "enterprise"
 * @param {string} featureKey  – e.g. "riskDebtEngine", "exportPDF"
 * @returns {{ allowed: boolean, note: string, requiredTier: string|null }}
 */
function checkFeatureAccess(tierId, featureKey) {
  const tier = getTier(tierId);
  const featureOnTier = tier.features[featureKey];

  if (!featureOnTier) throw new Error(`Unknown feature: "${featureKey}".`);

  if (featureOnTier.enabled) {
    return { allowed: true, note: featureOnTier.note || null, requiredTier: null };
  }

  // Find the minimum tier that has this feature enabled
  const requiredTier = TIER_ORDER.find(t => TIERS[t].features[featureKey]?.enabled) || null;
  return {
    allowed:      false,
    note:         featureOnTier.note || `Requires ${requiredTier || "higher"} tier.`,
    requiredTier,
  };
}

/**
 * Check multiple features at once.
 * @param {string}   tierId
 * @param {string[]} featureKeys
 * @returns {object} key → access result
 */
function checkMultipleFeatures(tierId, featureKeys) {
  const results = {};
  for (const key of featureKeys) {
    results[key] = checkFeatureAccess(tierId, key);
  }
  return results;
}

/**
 * Check if a usage action is within the tier's limit.
 *
 * @param {string} tierId
 * @param {string} limitKey   – e.g. "calculationsPerMonth"
 * @param {number} currentUsage
 * @returns {{ allowed: boolean, current: number, limit: number|"unlimited", remaining: number|"unlimited" }}
 */
function checkUsageLimit(tierId, limitKey, currentUsage = 0) {
  const tier  = getTier(tierId);
  const limit = tier.limits[limitKey];
  if (limit === undefined) throw new Error(`Unknown limit key: "${limitKey}"`);

  if (limit === -1) {
    return { allowed: true, current: currentUsage, limit: "unlimited", remaining: "unlimited" };
  }
  const remaining = Math.max(0, limit - currentUsage);
  return { allowed: currentUsage < limit, current: currentUsage, limit, remaining };
}

/**
 * Generate an upgrade prompt for a blocked feature.
 *
 * @param {string} currentTierId
 * @param {string} requiredTierId
 * @param {string} featureKey
 * @returns {object}
 */
function getUpgradePrompt(currentTierId, requiredTierId, featureKey) {
  const current  = getTier(currentTierId);
  const required = getTier(requiredTierId);
  const monthlySavings = _r(required.price.monthly - current.price.monthly);
  const annualSavings  = _r(required.price.annual * (10 / 12)); // 2 months free on annual

  return {
    currentTier:   currentTierId,
    requiredTier:  requiredTierId,
    featureKey,
    message:       `"${featureKey}" requires the ${required.name} plan.`,
    upgradeAction: `Upgrade from ${current.name} → ${required.name}`,
    monthlyCost:   required.price.monthly,
    annualCost:    required.price.annual,
    annualSaving:  annualSavings,
    cta:           `Upgrade to ${required.name} — $${required.price.monthly}/month`,
  };
}

/**
 * Calculate billing for a tier and billing cycle.
 *
 * @param {string} tierId
 * @param {"monthly"|"annual"} cycle
 * @returns {object}
 */
function calculateBilling(tierId, cycle = "monthly") {
  const tier = getTier(tierId);
  if (cycle === "annual") {
    const annualTotal  = tier.price.annual;
    const monthlyEqv   = _r(annualTotal / 12);
    const monthlySaved = _r(tier.price.monthly - monthlyEqv);
    const pctSaved     = tier.price.monthly > 0 ? _r((monthlySaved / tier.price.monthly) * 100) : 0;
    return { tierId, cycle, amount: annualTotal, perMonth: monthlyEqv,
             savingVsMonthly: _r(monthlySaved * 12), savingPct: pctSaved };
  }
  return { tierId, cycle: "monthly", amount: tier.price.monthly, perMonth: tier.price.monthly,
           savingVsMonthly: 0, savingPct: 0 };
}

/**
 * Get a full feature comparison table across all tiers.
 * @returns {object[]} rows with feature key and per-tier access status
 */
function getFeatureComparison() {
  const featureKeys = Object.keys(TIERS.free.features);
  return featureKeys.map(key => {
    const row = { feature: key };
    for (const tierId of TIER_ORDER) {
      const f = TIERS[tierId].features[key];
      row[tierId] = { enabled: f.enabled, note: f.note || null };
    }
    return row;
  });
}

/**
 * Recommend the most cost-effective tier for a set of required features.
 * @param {string[]} requiredFeatures
 * @returns {{ recommendedTier: string, tier: object, reasoning: string[] }}
 */
function recommendTier(requiredFeatures) {
  const reasoning = [];
  for (const tierId of TIER_ORDER) {
    const tier    = TIERS[tierId];
    const blocked = requiredFeatures.filter(f => !tier.features[f]?.enabled);
    if (blocked.length === 0) {
      reasoning.push(`${tier.name} enables all ${requiredFeatures.length} requested features.`);
      return { recommendedTier: tierId, tier, reasoning };
    }
    reasoning.push(`${tier.name}: missing ${blocked.join(", ")}`);
  }
  return { recommendedTier: "enterprise", tier: TIERS.enterprise, reasoning };
}

module.exports = {
  getAllTiers, getTier, checkFeatureAccess, checkMultipleFeatures,
  checkUsageLimit, getUpgradePrompt, calculateBilling,
  getFeatureComparison, recommendTier,
  TIER_ORDER,
};
