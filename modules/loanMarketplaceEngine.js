/**
 * Module 16: Loan Marketplace Engine
 *
 * Connects businesses with lenders, compares offers by EMI / total cost,
 * and generates referral-tracked application links.
 *
 * Built-in lender catalog: Indian banks + NBFCs (sample data).
 * Functions work independently of any server — suitable for file:/// usage.
 */

function _r(n) { return Math.round(n * 100) / 100; }

// ─── Lender catalog ───────────────────────────────────────────────────────
const LENDER_CATALOG = [
  {
    id: "sbi-sme", name: "SBI SME Business Loan", institution: "State Bank of India",
    type: "public_bank", icon: "🏛️",
    minRate: 8.5,  maxRate: 12.0, minAmount: 100000,  maxAmount: 10000000,
    minTenure: 12, maxTenure: 84, processingFee: 0.5, prepaymentPenalty: 0,
    turnaroundDays: { min: 7, max: 14 }, requiresCollateral: true, minCibilScore: 700,
    loanTypes: ["business", "msme"],
    highlights: ["Lowest interest rates", "MSME-focused scheme", "Zero prepayment penalty", "Govt-backed trust"],
  },
  {
    id: "hdfc-biz", name: "HDFC Business Loan", institution: "HDFC Bank",
    type: "private_bank", icon: "🏦",
    minRate: 11.5, maxRate: 16.5, minAmount: 50000,   maxAmount: 4000000,
    minTenure: 12, maxTenure: 48, processingFee: 1.5, prepaymentPenalty: 2.0,
    turnaroundDays: { min: 2, max: 5 }, requiresCollateral: false, minCibilScore: 725,
    loanTypes: ["business", "personal"],
    highlights: ["No collateral required", "Fast approval 2-5 days", "Fully digital process"],
  },
  {
    id: "icici-biz", name: "ICICI Business Loan", institution: "ICICI Bank",
    type: "private_bank", icon: "🏦",
    minRate: 11.0, maxRate: 17.0, minAmount: 100000,  maxAmount: 5000000,
    minTenure: 12, maxTenure: 60, processingFee: 2.0, prepaymentPenalty: 2.0,
    turnaroundDays: { min: 3, max: 7 }, requiresCollateral: false, minCibilScore: 700,
    loanTypes: ["business"],
    highlights: ["Instant in-principle sanction", "Flexible repayment", "iMobile banking"],
  },
  {
    id: "axis-biz", name: "Axis Bank Business Loan", institution: "Axis Bank",
    type: "private_bank", icon: "🏦",
    minRate: 10.75, maxRate: 17.5, minAmount: 100000, maxAmount: 7500000,
    minTenure: 12, maxTenure: 60, processingFee: 1.75, prepaymentPenalty: 2.0,
    turnaroundDays: { min: 3, max: 7 }, requiresCollateral: false, minCibilScore: 700,
    loanTypes: ["business", "msme"],
    highlights: ["Overdraft facility available", "MSME-friendly", "Relationship banking"],
  },
  {
    id: "kotak-biz", name: "Kotak Business Loan", institution: "Kotak Mahindra Bank",
    type: "private_bank", icon: "🏦",
    minRate: 12.5, maxRate: 20.0, minAmount: 300000,  maxAmount: 7500000,
    minTenure: 12, maxTenure: 48, processingFee: 2.0, prepaymentPenalty: 0,
    turnaroundDays: { min: 2, max: 4 }, requiresCollateral: false, minCibilScore: 720,
    loanTypes: ["business"],
    highlights: ["Zero prepayment penalty", "Quick 2-4 day approval", "Online loan management"],
  },
  {
    id: "idfc-biz", name: "IDFC FIRST Business Loan", institution: "IDFC FIRST Bank",
    type: "private_bank", icon: "🏦",
    minRate: 10.5, maxRate: 18.0, minAmount: 100000,  maxAmount: 5000000,
    minTenure: 12, maxTenure: 60, processingFee: 1.5, prepaymentPenalty: 0,
    turnaroundDays: { min: 3, max: 7 }, requiresCollateral: false, minCibilScore: 680,
    loanTypes: ["business", "msme"],
    highlights: ["Lower CIBIL threshold (680)", "No prepayment penalty", "Competitive rates"],
  },
  {
    id: "bajaj-biz", name: "Bajaj Finserv Business Loan", institution: "Bajaj Finserv",
    type: "nbfc", icon: "🏢",
    minRate: 14.0, maxRate: 24.0, minAmount: 200000,  maxAmount: 4500000,
    minTenure: 12, maxTenure: 60, processingFee: 3.5, prepaymentPenalty: 4.0,
    turnaroundDays: { min: 1, max: 3 }, requiresCollateral: false, minCibilScore: 685,
    loanTypes: ["business"],
    highlights: ["Fastest: 24-hour approval", "Minimum documents", "Flexi loan with overdraft"],
  },
  {
    id: "lendingkart", name: "Lendingkart Business Loan", institution: "Lendingkart Finance",
    type: "fintech_nbfc", icon: "💻",
    minRate: 18.0, maxRate: 27.0, minAmount: 50000,   maxAmount: 2000000,
    minTenure: 1,  maxTenure: 36, processingFee: 2.5, prepaymentPenalty: 0,
    turnaroundDays: { min: 1, max: 3 }, requiresCollateral: false, minCibilScore: 650,
    loanTypes: ["business", "msme"],
    highlights: ["New/young businesses eligible", "CIBIL 650+ accepted", "Algorithm-based decision"],
  },
  {
    id: "indifi", name: "Indifi Business Loan", institution: "Indifi Technologies",
    type: "fintech_nbfc", icon: "💻",
    minRate: 20.0, maxRate: 32.0, minAmount: 50000,   maxAmount: 1500000,
    minTenure: 3,  maxTenure: 36, processingFee: 2.0, prepaymentPenalty: 0,
    turnaroundDays: { min: 1, max: 2 }, requiresCollateral: false, minCibilScore: 600,
    loanTypes: ["business", "msme"],
    highlights: ["Lowest CIBIL requirement (600)", "GST/POS-linked approval", "Sector-specific loans"],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/** Return full lender catalog */
function getAllLenders() { return [...LENDER_CATALOG]; }

/**
 * Filter lenders by eligibility criteria.
 *
 * @param {object} [criteria]
 * @param {string}  [criteria.loanType]     – "business" | "msme" | "personal"
 * @param {number}  [criteria.amount]       – Requested loan amount
 * @param {number}  [criteria.tenureMonths] – Requested tenure
 * @param {number}  [criteria.maxRate]      – Max acceptable interest rate
 * @param {number}  [criteria.cibilScore]   – Applicant's CIBIL score
 * @returns {Array}
 */
function searchLenders({ loanType = null, amount = 0, tenureMonths = 12,
                         maxRate = null, cibilScore = null } = {}) {
  return LENDER_CATALOG.filter(l => {
    if (loanType && !l.loanTypes.includes(loanType)) return false;
    if (amount > 0 && (amount < l.minAmount || amount > l.maxAmount)) return false;
    if (tenureMonths && (tenureMonths < l.minTenure || tenureMonths > l.maxTenure)) return false;
    if (maxRate !== null && l.minRate > maxRate) return false;
    if (cibilScore !== null && cibilScore < l.minCibilScore) return false;
    return true;
  });
}

/**
 * Compare loan offers from a list of lenders for a given loan request.
 *
 * @param {Array}   lenders       – Array of lender objects (from searchLenders)
 * @param {number}  principal     – Requested loan amount
 * @param {number}  tenureMonths  – Loan tenure in months
 * @param {boolean} [useMinRate=true] – true = best-case (min) rate, false = worst-case (max)
 * @returns {Array} Ranked offers sorted by total cost (ascending)
 */
function compareOffers(lenders, principal, tenureMonths, useMinRate = true) {
  if (!Array.isArray(lenders) || lenders.length === 0)
    throw new Error("lenders must be a non-empty array.");
  if (typeof principal !== "number" || principal <= 0)
    throw new Error("principal must be a positive number.");
  if (typeof tenureMonths !== "number" || tenureMonths < 1)
    throw new Error("tenureMonths must be at least 1.");

  const offers = lenders.map(l => {
    const rate               = useMinRate ? l.minRate : l.maxRate;
    const emi                = _r(_calcEMI(principal, rate, tenureMonths));
    const totalPayment       = _r(emi * tenureMonths);
    const totalInterest      = _r(totalPayment - principal);
    const processingFeeAmt   = _r(principal * (l.processingFee / 100));
    const totalCost          = _r(totalInterest + processingFeeAmt);
    const effectiveRate      = _r(rate + (l.processingFee / (tenureMonths / 12)));

    return {
      ...l,
      appliedRate: rate,
      emi, totalPayment, totalInterest,
      processingFeeAmt, totalCost, effectiveRate,
      isBestDeal: false,
    };
  });

  // Rank by total cost (lowest first)
  offers.sort((a, b) => a.totalCost - b.totalCost);
  if (offers.length > 0) offers[0].isBestDeal = true;

  return offers.map((o, i) => ({ ...o, rank: i + 1 }));
}

/**
 * Re-rank an existing offers array by a different field.
 *
 * @param {Array}  offers  – Output of compareOffers()
 * @param {"totalCost"|"emi"|"appliedRate"|"totalInterest"|"turnaroundDays.min"} rankBy
 * @returns {Array}
 */
function rankOffers(offers, rankBy = "totalCost") {
  const getVal = (o, key) => key === "turnaroundDays.min" ? o.turnaroundDays.min : o[key];
  const sorted = [...offers].sort((a, b) => getVal(a, rankBy) - getVal(b, rankBy));
  sorted.forEach((o, i) => { o.rank = i + 1; o.isBestDeal = i === 0; });
  return sorted;
}

/**
 * Get the single best offer by lowest total cost.
 * @param {Array} offers – Output of compareOffers()
 * @returns {object}
 */
function getBestOffer(offers) {
  if (!offers || offers.length === 0) throw new Error("No offers to compare.");
  return offers.reduce((best, o) => o.totalCost < best.totalCost ? o : best);
}

/**
 * Generate a referral-tracked application link.
 *
 * @param {string} lenderId
 * @param {string} referralCode – Platform's tracking code
 * @param {number} loanAmount
 * @returns {object}
 */
function generateReferralLink(lenderId, referralCode, loanAmount) {
  const base   = "https://smallbiz.app/apply";
  const params = `lender=${lenderId}&ref=${encodeURIComponent(referralCode)}&amt=${loanAmount}&ts=${Date.now()}`;
  return {
    url:          `${base}?${params}`,
    lenderId,
    referralCode,
    loanAmount,
    estimatedReferralFee: _r(loanAmount * 0.005), // 0.5% of loan (typical referral)
  };
}

/**
 * Generate a savings summary comparing best vs worst offer.
 * @param {Array} rankedOffers – Output of compareOffers()
 * @returns {object}
 */
function getSavingsSummary(rankedOffers) {
  if (rankedOffers.length < 2) return null;
  const best  = rankedOffers[0];
  const worst = rankedOffers[rankedOffers.length - 1];
  return {
    bestLender:       best.name,
    worstLender:      worst.name,
    emiSaving:        _r(worst.emi - best.emi),
    totalCostSaving:  _r(worst.totalCost - best.totalCost),
    rateDifference:   _r(worst.appliedRate - best.appliedRate),
  };
}

// ─── Internal ─────────────────────────────────────────────────────────────

function _calcEMI(principal, annualRate, tenureMonths) {
  if (annualRate === 0) return principal / tenureMonths;
  const r = annualRate / 12 / 100;
  const factor = Math.pow(1 + r, tenureMonths);
  return (principal * r * factor) / (factor - 1);
}

module.exports = {
  getAllLenders, searchLenders, compareOffers, rankOffers,
  getBestOffer, generateReferralLink, getSavingsSummary,
};
