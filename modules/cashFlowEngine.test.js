/**
 * Unit tests for Module 1: Cash Flow Engine
 * Run with: node cashFlowEngine.test.js
 */

const { calculatePeriodCashFlow, calculateMultiPeriodCashFlow } = require("./cashFlowEngine");

let passed = 0;
let failed = 0;

function assert(label, condition) {
  if (condition) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.error(`  ✗ ${label}`);
    failed++;
  }
}

function assertThrows(label, fn) {
  try {
    fn();
    console.error(`  ✗ ${label} (expected an error but none was thrown)`);
    failed++;
  } catch (e) {
    console.log(`  ✓ ${label}`);
    passed++;
  }
}

// ─── Single Period Tests ───────────────────────────────────────────────────

console.log("\nSingle Period:");

const surplus = calculatePeriodCashFlow(50000, 20000, 10000);
assert("surplus: netCashFlow = 20000", surplus.netCashFlow === 20000);
assert("surplus: totalExpenses = 30000", surplus.totalExpenses === 30000);
assert("surplus: status = surplus", surplus.status === "surplus");

const deficit = calculatePeriodCashFlow(25000, 20000, 10000);
assert("deficit: netCashFlow = -5000", deficit.netCashFlow === -5000);
assert("deficit: status = deficit", deficit.status === "deficit");

const breakEven = calculatePeriodCashFlow(30000, 20000, 10000);
assert("break-even: netCashFlow = 0, status = surplus", breakEven.netCashFlow === 0 && breakEven.status === "surplus");

assertThrows("throws on negative revenue", () => calculatePeriodCashFlow(-1000, 500, 200));
assertThrows("throws on non-number input", () => calculatePeriodCashFlow("abc", 500, 200));

// ─── Multi-Period Tests ────────────────────────────────────────────────────

console.log("\nMulti-Period:");

const periods = [
  { month: "Jan", revenue: 50000, fixedExpenses: 20000, variableExpenses: 10000 }, // +20000
  { month: "Feb", revenue: 60000, fixedExpenses: 20000, variableExpenses: 15000 }, // +25000
  { month: "Mar", revenue: 30000, fixedExpenses: 20000, variableExpenses: 15000 }, // -5000
];

const multi = calculateMultiPeriodCashFlow(periods);
assert("multi: totalRevenue = 140000", multi.totalRevenue === 140000);
assert("multi: totalExpenses = 100000", multi.totalExpenses === 100000);
assert("multi: totalNetCashFlow = 40000", multi.totalNetCashFlow === 40000);
assert("multi: averageMonthlyNetCashFlow ≈ 13333", Math.round(multi.averageMonthlyNetCashFlow) === 13333);
assert("multi: surplusMonths = 2", multi.surplusMonths === 2);
assert("multi: deficitMonths = 1", multi.deficitMonths === 1);
assert("multi: overall status = surplus", multi.status === "surplus");
assert("multi: period results count = 3", multi.periods.length === 3);
assert("multi: Mar is deficit", multi.periods[2].status === "deficit");

assertThrows("throws on empty array", () => calculateMultiPeriodCashFlow([]));
assertThrows("throws on non-array", () => calculateMultiPeriodCashFlow(null));

// ─── Summary ──────────────────────────────────────────────────────────────

console.log(`\nResults: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
