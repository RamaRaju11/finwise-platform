/**
 * Module 22: Industry Benchmarks Engine
 *
 * Compares a business's financial metrics against industry averages.
 *
 * Industries: Retail, Restaurant, Manufacturing, Professional Services,
 *             Healthcare, Technology/SaaS, Construction, Wholesale,
 *             E-Commerce, Hospitality
 *
 * Metrics (all unit-free percentages or ratios):
 *   grossMarginPct, netMarginPct, currentRatio, debtToEquity,
 *   dscr, operatingCFMarginPct, revenueGrowthPct
 *
 * Benchmarks stored as { p25, median, p75 } — all sourced from publicly
 * available SMB financial research (US market, small business segment).
 */

function _r(n) { return Math.round(n * 100) / 100; }

// ─── Benchmark database ───────────────────────────────────────────────────────
// Each metric has { p25, median, p75, higherIsBetter, unit }

const BENCHMARKS = {
  retail: {
    label: "Retail (General)",
    icon: "🛍️",
    description: "Brick-and-mortar and mixed retail stores.",
    metrics: {
      grossMarginPct:       { p25: 22, median: 32, p75: 45, higherIsBetter: true,  unit: "%" },
      netMarginPct:         { p25: 1,  median: 3.5,p75: 6,  higherIsBetter: true,  unit: "%" },
      currentRatio:         { p25: 1.0,median: 1.4,p75: 2.0,higherIsBetter: true,  unit: "×" },
      debtToEquity:         { p25: 0.5,median: 1.0,p75: 2.0,higherIsBetter: false, unit: "×" },
      dscr:                 { p25: 1.1,median: 1.5,p75: 2.2,higherIsBetter: true,  unit: "×" },
      operatingCFMarginPct: { p25: 2,  median: 5,  p75: 8,  higherIsBetter: true,  unit: "%" },
      revenueGrowthPct:     { p25: 2,  median: 6,  p75: 12, higherIsBetter: true,  unit: "%" },
    },
  },
  restaurant: {
    label: "Restaurant / Food Service",
    icon: "🍽️",
    description: "Full-service restaurants, cafes, and quick-service outlets.",
    metrics: {
      grossMarginPct:       { p25: 30, median: 55, p75: 70, higherIsBetter: true,  unit: "%" },
      netMarginPct:         { p25: 1,  median: 4,  p75: 8,  higherIsBetter: true,  unit: "%" },
      currentRatio:         { p25: 0.5,median: 0.8,p75: 1.2,higherIsBetter: true,  unit: "×" },
      debtToEquity:         { p25: 1.0,median: 2.5,p75: 4.0,higherIsBetter: false, unit: "×" },
      dscr:                 { p25: 1.0,median: 1.4,p75: 2.0,higherIsBetter: true,  unit: "×" },
      operatingCFMarginPct: { p25: 3,  median: 7,  p75: 12, higherIsBetter: true,  unit: "%" },
      revenueGrowthPct:     { p25: 3,  median: 8,  p75: 15, higherIsBetter: true,  unit: "%" },
    },
  },
  manufacturing: {
    label: "Manufacturing",
    icon: "🏭",
    description: "Small to mid-size product manufacturers.",
    metrics: {
      grossMarginPct:       { p25: 15, median: 28, p75: 40, higherIsBetter: true,  unit: "%" },
      netMarginPct:         { p25: 2,  median: 5,  p75: 10, higherIsBetter: true,  unit: "%" },
      currentRatio:         { p25: 1.2,median: 1.8,p75: 2.5,higherIsBetter: true,  unit: "×" },
      debtToEquity:         { p25: 0.4,median: 0.9,p75: 1.8,higherIsBetter: false, unit: "×" },
      dscr:                 { p25: 1.2,median: 1.6,p75: 2.5,higherIsBetter: true,  unit: "×" },
      operatingCFMarginPct: { p25: 4,  median: 8,  p75: 14, higherIsBetter: true,  unit: "%" },
      revenueGrowthPct:     { p25: 2,  median: 5,  p75: 10, higherIsBetter: true,  unit: "%" },
    },
  },
  services: {
    label: "Professional Services",
    icon: "💼",
    description: "Consulting, legal, accounting, and advisory firms.",
    metrics: {
      grossMarginPct:       { p25: 50, median: 65, p75: 80, higherIsBetter: true,  unit: "%" },
      netMarginPct:         { p25: 10, median: 18, p75: 30, higherIsBetter: true,  unit: "%" },
      currentRatio:         { p25: 1.5,median: 2.2,p75: 3.5,higherIsBetter: true,  unit: "×" },
      debtToEquity:         { p25: 0.1,median: 0.4,p75: 1.0,higherIsBetter: false, unit: "×" },
      dscr:                 { p25: 1.5,median: 2.2,p75: 3.5,higherIsBetter: true,  unit: "×" },
      operatingCFMarginPct: { p25: 12, median: 20, p75: 30, higherIsBetter: true,  unit: "%" },
      revenueGrowthPct:     { p25: 5,  median: 12, p75: 20, higherIsBetter: true,  unit: "%" },
    },
  },
  healthcare: {
    label: "Healthcare / Medical",
    icon: "🏥",
    description: "Medical practices, clinics, and healthcare services.",
    metrics: {
      grossMarginPct:       { p25: 30, median: 45, p75: 60, higherIsBetter: true,  unit: "%" },
      netMarginPct:         { p25: 4,  median: 8,  p75: 15, higherIsBetter: true,  unit: "%" },
      currentRatio:         { p25: 1.3,median: 1.8,p75: 2.8,higherIsBetter: true,  unit: "×" },
      debtToEquity:         { p25: 0.5,median: 1.2,p75: 2.5,higherIsBetter: false, unit: "×" },
      dscr:                 { p25: 1.3,median: 1.8,p75: 2.8,higherIsBetter: true,  unit: "×" },
      operatingCFMarginPct: { p25: 6,  median: 12, p75: 20, higherIsBetter: true,  unit: "%" },
      revenueGrowthPct:     { p25: 4,  median: 8,  p75: 14, higherIsBetter: true,  unit: "%" },
    },
  },
  technology: {
    label: "Technology / SaaS",
    icon: "💻",
    description: "Software companies, SaaS, and technology services.",
    metrics: {
      grossMarginPct:       { p25: 55, median: 72, p75: 85, higherIsBetter: true,  unit: "%" },
      netMarginPct:         { p25: -5, median: 8,  p75: 25, higherIsBetter: true,  unit: "%" },
      currentRatio:         { p25: 1.8,median: 2.5,p75: 4.0,higherIsBetter: true,  unit: "×" },
      debtToEquity:         { p25: 0.0,median: 0.3,p75: 0.8,higherIsBetter: false, unit: "×" },
      dscr:                 { p25: 1.0,median: 1.8,p75: 3.0,higherIsBetter: true,  unit: "×" },
      operatingCFMarginPct: { p25: 5,  median: 18, p75: 35, higherIsBetter: true,  unit: "%" },
      revenueGrowthPct:     { p25: 10, median: 25, p75: 50, higherIsBetter: true,  unit: "%" },
    },
  },
  construction: {
    label: "Construction / Contracting",
    icon: "🏗️",
    description: "General contractors, subcontractors, and specialty trades.",
    metrics: {
      grossMarginPct:       { p25: 15, median: 22, p75: 30, higherIsBetter: true,  unit: "%" },
      netMarginPct:         { p25: 2,  median: 4,  p75: 8,  higherIsBetter: true,  unit: "%" },
      currentRatio:         { p25: 1.1,median: 1.5,p75: 2.0,higherIsBetter: true,  unit: "×" },
      debtToEquity:         { p25: 0.5,median: 1.2,p75: 2.5,higherIsBetter: false, unit: "×" },
      dscr:                 { p25: 1.1,median: 1.5,p75: 2.2,higherIsBetter: true,  unit: "×" },
      operatingCFMarginPct: { p25: 3,  median: 6,  p75: 10, higherIsBetter: true,  unit: "%" },
      revenueGrowthPct:     { p25: 3,  median: 7,  p75: 12, higherIsBetter: true,  unit: "%" },
    },
  },
  wholesale: {
    label: "Wholesale / Distribution",
    icon: "📦",
    description: "Wholesale distributors and B2B product suppliers.",
    metrics: {
      grossMarginPct:       { p25: 10, median: 20, p75: 30, higherIsBetter: true,  unit: "%" },
      netMarginPct:         { p25: 1,  median: 3,  p75: 6,  higherIsBetter: true,  unit: "%" },
      currentRatio:         { p25: 1.2,median: 1.6,p75: 2.2,higherIsBetter: true,  unit: "×" },
      debtToEquity:         { p25: 0.5,median: 1.0,p75: 2.0,higherIsBetter: false, unit: "×" },
      dscr:                 { p25: 1.1,median: 1.5,p75: 2.0,higherIsBetter: true,  unit: "×" },
      operatingCFMarginPct: { p25: 2,  median: 4,  p75: 7,  higherIsBetter: true,  unit: "%" },
      revenueGrowthPct:     { p25: 3,  median: 6,  p75: 10, higherIsBetter: true,  unit: "%" },
    },
  },
  ecommerce: {
    label: "E-Commerce",
    icon: "🛒",
    description: "Online retail, DTC brands, and marketplace sellers.",
    metrics: {
      grossMarginPct:       { p25: 25, median: 40, p75: 60, higherIsBetter: true,  unit: "%" },
      netMarginPct:         { p25: 1,  median: 5,  p75: 12, higherIsBetter: true,  unit: "%" },
      currentRatio:         { p25: 1.0,median: 1.5,p75: 2.5,higherIsBetter: true,  unit: "×" },
      debtToEquity:         { p25: 0.3,median: 0.8,p75: 1.8,higherIsBetter: false, unit: "×" },
      dscr:                 { p25: 1.0,median: 1.6,p75: 2.5,higherIsBetter: true,  unit: "×" },
      operatingCFMarginPct: { p25: 3,  median: 8,  p75: 15, higherIsBetter: true,  unit: "%" },
      revenueGrowthPct:     { p25: 10, median: 20, p75: 40, higherIsBetter: true,  unit: "%" },
    },
  },
  hospitality: {
    label: "Hospitality / Hotel",
    icon: "🏨",
    description: "Hotels, resorts, B&Bs, and short-term rentals.",
    metrics: {
      grossMarginPct:       { p25: 45, median: 60, p75: 75, higherIsBetter: true,  unit: "%" },
      netMarginPct:         { p25: -2, median: 5,  p75: 12, higherIsBetter: true,  unit: "%" },
      currentRatio:         { p25: 0.5,median: 0.9,p75: 1.4,higherIsBetter: true,  unit: "×" },
      debtToEquity:         { p25: 1.5,median: 3.0,p75: 5.0,higherIsBetter: false, unit: "×" },
      dscr:                 { p25: 1.0,median: 1.4,p75: 2.0,higherIsBetter: true,  unit: "×" },
      operatingCFMarginPct: { p25: 5,  median: 15, p75: 25, higherIsBetter: true,  unit: "%" },
      revenueGrowthPct:     { p25: 2,  median: 6,  p75: 12, higherIsBetter: true,  unit: "%" },
    },
  },
};

const METRIC_LABELS = {
  grossMarginPct:       "Gross Profit Margin",
  netMarginPct:         "Net Profit Margin",
  currentRatio:         "Current Ratio",
  debtToEquity:         "Debt-to-Equity Ratio",
  dscr:                 "Debt Service Coverage (DSCR)",
  operatingCFMarginPct: "Operating Cash Flow Margin",
  revenueGrowthPct:     "Revenue Growth Rate",
};

// ─── Public API ───────────────────────────────────────────────────────────────

/** Return list of all industry keys with labels */
function getIndustries() {
  return Object.entries(BENCHMARKS).map(([key, v]) => ({
    key, label: v.label, icon: v.icon, description: v.description,
  }));
}

/**
 * Get full benchmark table for one industry.
 *
 * @param {string} industry  – key from BENCHMARKS
 * @returns {{ industry, label, metrics: Array }}
 */
function getBenchmarks(industry) {
  const b = BENCHMARKS[industry];
  if (!b) throw new Error(`Unknown industry: "${industry}". Valid: ${Object.keys(BENCHMARKS).join(", ")}`);

  const metrics = Object.entries(b.metrics).map(([key, v]) => ({
    key, label: METRIC_LABELS[key] || key,
    p25: v.p25, median: v.median, p75: v.p75,
    unit: v.unit, higherIsBetter: v.higherIsBetter,
  }));

  return { industry, label: b.label, icon: b.icon, description: b.description, metrics };
}

/**
 * Compare user metrics against an industry's benchmarks.
 *
 * @param {string} industry
 * @param {object} userMetrics  – e.g. { grossMarginPct: 35, netMarginPct: 8, dscr: 1.6 }
 * @returns {{ industry, label, comparisons: Array, overallRating, score }}
 */
function compareMetrics(industry, userMetrics = {}) {
  const b = BENCHMARKS[industry];
  if (!b) throw new Error(`Unknown industry: "${industry}"`);

  const comparisons = [];
  let totalScore = 0, count = 0;

  for (const [key, val] of Object.entries(userMetrics)) {
    const bm = b.metrics[key];
    if (!bm || val == null || isNaN(val)) continue;

    const rating    = _getRating(val, bm);
    const score     = _ratingScore(rating);
    const percentile = _estimatePercentile(val, bm);
    const delta     = bm.higherIsBetter
      ? _r(val - bm.median)
      : _r(bm.median - val);
    const deltaDir  = delta > 0 ? "above" : delta < 0 ? "below" : "at";

    comparisons.push({
      key, label: METRIC_LABELS[key] || key,
      userValue: val, unit: bm.unit,
      p25: bm.p25, median: bm.median, p75: bm.p75,
      higherIsBetter: bm.higherIsBetter,
      rating, score, percentile,
      delta: Math.abs(delta),
      deltaDir,
      vsMedian: `${Math.abs(delta)}${bm.unit} ${deltaDir} industry median`,
    });

    totalScore += score;
    count++;
  }

  const avgScore = count > 0 ? _r(totalScore / count) : 0;
  const overallRating = avgScore >= 4 ? "Excellent" : avgScore >= 3 ? "Good"
                      : avgScore >= 2 ? "Average"   : avgScore >= 1 ? "Below Average" : "Poor";

  return {
    industry, label: b.label, icon: b.icon,
    comparisons,
    overallRating, overallScore: _r(avgScore * 25), // 0-100
    metricsCompared: count,
  };
}

/**
 * Estimate percentile rank for a single metric value within an industry.
 *
 * @param {string} industry
 * @param {string} metricKey
 * @param {number} value
 * @returns {{ percentile, rating, label }}
 */
function getPercentileRank(industry, metricKey, value) {
  const b = BENCHMARKS[industry];
  if (!b) throw new Error(`Unknown industry: "${industry}"`);
  const bm = b.metrics[metricKey];
  if (!bm) throw new Error(`Unknown metric: "${metricKey}" for industry "${industry}"`);

  const percentile = _estimatePercentile(value, bm);
  const rating = _getRating(value, bm);

  return {
    industry, metricKey,
    label:     METRIC_LABELS[metricKey] || metricKey,
    value, unit: bm.unit,
    percentile,
    rating,
    interpretation: `Your value of ${value}${bm.unit} is in the ${percentile}th percentile for ${BENCHMARKS[industry].label}.`,
  };
}

/**
 * Generate narrative insights from a comparison result.
 *
 * @param {string} industry
 * @param {object} userMetrics
 * @returns {{ strengths, weaknesses, suggestions, summary }}
 */
function generateInsights(industry, userMetrics = {}) {
  const result = compareMetrics(industry, userMetrics);
  const strengths   = [];
  const weaknesses  = [];
  const suggestions = [];

  result.comparisons.forEach(c => {
    if (c.rating === "Excellent" || c.rating === "Good") {
      strengths.push(`${c.label}: ${c.userValue}${c.unit} — ${c.rating.toLowerCase()} (top ${100 - c.percentile}% of ${result.label} businesses).`);
    } else if (c.rating === "Below Average" || c.rating === "Poor") {
      weaknesses.push(`${c.label}: ${c.userValue}${c.unit} — ${c.rating.toLowerCase()} (industry median: ${c.median}${c.unit}).`);
      suggestions.push(_getSuggestion(c.key, c.userValue, c.median, c.unit));
    }
  });

  return {
    industry, label: result.label,
    overallRating: result.overallRating,
    overallScore: result.overallScore,
    strengths,
    weaknesses,
    suggestions: suggestions.filter(Boolean),
    summary: `Overall ${result.overallRating} compared to ${result.label} industry. ${strengths.length} strength(s), ${weaknesses.length} area(s) below industry median.`,
  };
}

// ─── Internal ─────────────────────────────────────────────────────────────────

function _getRating(value, bm) {
  if (bm.higherIsBetter) {
    if (value >= bm.p75) return "Excellent";
    if (value >= bm.median) return "Good";
    if (value >= bm.p25) return "Average";
    return value >= bm.p25 * 0.6 ? "Below Average" : "Poor";
  } else {
    if (value <= bm.p25) return "Excellent";
    if (value <= bm.median) return "Good";
    if (value <= bm.p75) return "Average";
    return value <= bm.p75 * 1.5 ? "Below Average" : "Poor";
  }
}

function _ratingScore(rating) {
  return { Excellent: 5, Good: 4, Average: 3, "Below Average": 2, Poor: 1 }[rating] || 0;
}

function _estimatePercentile(value, bm) {
  // Simple linear interpolation between known percentile points
  if (bm.higherIsBetter) {
    if (value <= bm.p25) return Math.max(1,  Math.round(25 * (value / bm.p25)));
    if (value <= bm.median) return Math.round(25 + 25 * ((value - bm.p25) / (bm.median - bm.p25)));
    if (value <= bm.p75)    return Math.round(50 + 25 * ((value - bm.median) / (bm.p75 - bm.median)));
    return Math.min(99, Math.round(75 + 24 * ((value - bm.p75) / (bm.p75 * 0.5))));
  } else {
    if (value >= bm.p75) return Math.max(1,  Math.round(25 * (bm.p75 / value)));
    if (value >= bm.median) return Math.round(25 + 25 * ((bm.p75 - value) / (bm.p75 - bm.median)));
    if (value >= bm.p25)    return Math.round(50 + 25 * ((bm.median - value) / (bm.median - bm.p25)));
    return Math.min(99, Math.round(75 + 24 * ((bm.p25 - value) / (bm.p25 * 0.5))));
  }
}

function _getSuggestion(metricKey, value, median, unit) {
  const gap = _r(Math.abs(value - median));
  const suggestions = {
    grossMarginPct:       `Improve gross margin by ${gap}${unit}: renegotiate supplier contracts and review pricing on top-selling items.`,
    netMarginPct:         `Net margin is ${gap}${unit} below median. Identify and eliminate the highest-cost, lowest-value expense lines.`,
    currentRatio:         `Current ratio is ${gap}${unit} below median. Speed up receivables collection and defer non-essential payables.`,
    debtToEquity:         `Debt-to-equity is ${gap}${unit} above median. Prioritize debt repayment or consider equity injection.`,
    dscr:                 `DSCR is ${gap}${unit} below median. Increase net operating income or reduce total debt service obligations.`,
    operatingCFMarginPct: `Operating cash flow margin is ${gap}${unit} below median. Review working capital cycle — especially receivables and inventory days.`,
    revenueGrowthPct:     `Revenue growth is ${gap}${unit} below median for this industry. Audit customer acquisition channels and pricing strategy.`,
  };
  return suggestions[metricKey] || null;
}

module.exports = {
  getIndustries, getBenchmarks, compareMetrics,
  getPercentileRank, generateInsights,
  BENCHMARKS, METRIC_LABELS,
};
