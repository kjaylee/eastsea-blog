const assert = require('node:assert/strict');
const { compute } = require('./calculator.js');

const result = compute({
  price: 100,
  promoSales: 20,
  marketplaceSales: 30,
  affiliateSales: 10,
  promoSharePct: 97,
  marketplaceSharePct: 37,
  affiliateSharePct: 25,
  refundRatePct: 8,
  fixedMonthlyCosts: 300,
  targetMonthlyNetIncome: 2000,
});

assert.equal(result.totalSales, 60);
assert.equal(result.grossSales, 6000);
assert.equal(result.grossPayoutBeforeRefunds, 3300);
assert.equal(result.refundLoss, 264);
assert.equal(result.netPayoutAfterRefunds, 3036);
assert.equal(result.netAfterFixedCosts, 2736);
assert.equal(result.breakEvenSalesNeeded, 6);
assert.equal(result.targetSalesNeeded, 46);
assert.ok(Math.abs(result.blendedSharePct - 55) < 1e-9);
assert.ok(Math.abs(result.avgNetPerSaleAfterRefunds - 50.6) < 1e-9);

assert.throws(() => compute({
  price: -1,
  promoSales: 0,
  marketplaceSales: 0,
  affiliateSales: 0,
  promoSharePct: 97,
  marketplaceSharePct: 37,
  affiliateSharePct: 25,
  refundRatePct: 8,
  fixedMonthlyCosts: 300,
  targetMonthlyNetIncome: 2000,
}));

console.log('calculator.test.js: OK');
