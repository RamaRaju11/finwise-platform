// FinWise Shared Amortization Utility — fw-amortize.js
// Canonical debt simulation used by: debtCommandCenter, loanRepaymentOptimizer
// Both modules delegate their local simulateFull() to this function.
function fwSimulateFull(loans, extra, sortFn) {
  var debts = loans.map(function(l) {
    return {
      name:        l.name || 'Loan',
      balance:     Math.max(0, parseFloat(l.balance)  || 0),
      rate:        Math.max(0, parseFloat(l.rate)      || 0),
      minPay:      Math.max(1, parseFloat(l.minPay)    || 1),
      paidOffMonth: null
    };
  });
  if (sortFn) debts.sort(sortFn);

  var monthlyData     = [];
  var payoffOrder     = [];
  var monthlyInterest = [];
  var totalInterest   = 0;
  var month           = 0;
  var MAX             = 600;

  while (debts.some(function(d) { return d.balance > 0.01; }) && month < MAX) {
    month++;
    var monthInt = 0;

    debts.forEach(function(d) {
      if (d.balance > 0) {
        var interest = d.balance * (d.rate / 100 / 12);
        totalInterest += interest;
        monthInt      += interest;
        d.balance     += interest;
      }
    });
    monthlyInterest.push(monthInt);

    // Freed minimums from already-paid loans cascade to the priority loan
    var freed = debts
      .filter(function(d) { return d.paidOffMonth !== null; })
      .reduce(function(s, d) { return s + d.minPay; }, 0);
    var avail = (extra || 0) + freed;

    // Pay minimums on active loans
    debts.forEach(function(d) {
      if (d.balance > 0) {
        var pay   = Math.min(d.balance, d.minPay);
        d.balance = Math.max(0, d.balance - pay);
      }
    });

    // Apply extra in priority order
    for (var i = 0; i < debts.length && avail > 0; i++) {
      if (debts[i].balance > 0) {
        var p         = Math.min(debts[i].balance, avail);
        debts[i].balance = Math.max(0, debts[i].balance - p);
        avail        -= p;
      }
    }

    // Record payoffs
    debts.forEach(function(d) {
      if (d.balance <= 0.01 && d.paidOffMonth === null) {
        d.balance     = 0;
        d.paidOffMonth = month;
        payoffOrder.push({ name: d.name, month: month });
      }
    });

    monthlyData.push(debts.map(function(d) {
      return { name: d.name, balance: Math.round(d.balance), paidOff: d.balance === 0 };
    }));
  }

  return {
    months:          month,
    totalInterest:   Math.round(totalInterest),
    payoffOrder:     payoffOrder,
    monthlyData:     monthlyData,
    monthlyInterest: monthlyInterest
  };
}
