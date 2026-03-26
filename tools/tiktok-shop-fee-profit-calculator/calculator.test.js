/**
 * TikTok Shop Fee Profit Calculator — Node tests
 * Run: node --test tools/tiktok-shop-fee-profit-calculator/calculator.test.js
 */
const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { calculate, DEFAULTS, buildSummary, r2 } = require('./calculator.js');

function ok(res) {
  assert.equal(res.error, '');
  assert.notEqual(res.result, null);
  return res.result;
}

/* Case 1 — Baseline standard 6% */
describe('Case 1 — Baseline standard 6%', () => {
  test('core fee math', () => {
    const r = ok(calculate({
      customerPaymentPerOrder: 25,
      platformDiscountPerOrder: 0,
      taxPerOrder: 0,
      monthlyOrders: 100,
      feeMode: 'standard-6',
      refundRatePct: 4,
      productCostPerOrder: 10,
      shippingSubsidyPerOrder: 2,
      otherCostPerOrder: 1,
    }));
    assert.equal(r.qualifiedFeeBasePerOrder, 25.00);
    assert.equal(r.referralFeePct, 6.00);
    assert.equal(r.referralFeePerOrder, 1.50);
    assert.equal(r.refundAdminFeePerRefundedOrder, 0.30);
    assert.equal(r.completedOrders, 96.00);
    assert.equal(r.refundedOrders, 4.00);
    assert.equal(r.grossSellerReceipts, 2400.00);
    assert.equal(r.monthlyReferralFees, 144.00);
    assert.equal(r.monthlyRefundAdminFees, 1.20);
    assert.equal(r.estimatedPayoutAfterPlatformFees, 2254.80);
    assert.equal(r.variableCostPerOrder, 13.00);
    assert.equal(r.monthlyVariableCosts, 1300.00);
    assert.equal(r.estimatedNetProfit, 954.80);
    assert.equal(r.effectivePlatformTakeRatePct, 6.05);
  });
});

/* Case 2 — Promo 3% */
describe('Case 2 — Promo 3%', () => {
  test('promo fee mode', () => {
    const r = ok(calculate({
      customerPaymentPerOrder: 25,
      platformDiscountPerOrder: 0,
      taxPerOrder: 0,
      monthlyOrders: 100,
      feeMode: 'promo-3',
      refundRatePct: 4,
      productCostPerOrder: 10,
      shippingSubsidyPerOrder: 2,
      otherCostPerOrder: 1,
    }));
    assert.equal(r.referralFeePct, 3.00);
    assert.equal(r.referralFeePerOrder, 0.75);
    assert.equal(r.refundAdminFeePerRefundedOrder, 0.15);
    assert.equal(r.grossSellerReceipts, 2400.00);
    assert.equal(r.monthlyReferralFees, 72.00);
    assert.equal(r.monthlyRefundAdminFees, 0.60);
    assert.equal(r.estimatedPayoutAfterPlatformFees, 2327.40);
    assert.equal(r.monthlyVariableCosts, 1300.00);
    assert.equal(r.estimatedNetProfit, 1027.40);
    assert.equal(r.effectivePlatformTakeRatePct, 3.03);
  });
});

/* Case 3 — Platform discount and tax included */
describe('Case 3 — Platform discount and tax', () => {
  test('fee base includes discount and subtracts tax', () => {
    const r = ok(calculate({
      customerPaymentPerOrder: 22,
      platformDiscountPerOrder: 3,
      taxPerOrder: 2,
      monthlyOrders: 50,
      feeMode: 'standard-6',
      refundRatePct: 0,
      productCostPerOrder: 12,
      shippingSubsidyPerOrder: 1,
      otherCostPerOrder: 0.5,
    }));
    assert.equal(r.qualifiedFeeBasePerOrder, 23.00);
    assert.equal(r.referralFeePerOrder, 1.38);
    assert.equal(r.refundAdminFeePerRefundedOrder, 0.28);
    assert.equal(r.completedOrders, 50.00);
    assert.equal(r.refundedOrders, 0.00);
    assert.equal(r.grossSellerReceipts, 1150.00);
    assert.equal(r.monthlyReferralFees, 69.00);
    assert.equal(r.monthlyRefundAdminFees, 0.00);
    assert.equal(r.estimatedPayoutAfterPlatformFees, 1081.00);
    assert.equal(r.variableCostPerOrder, 13.50);
    assert.equal(r.monthlyVariableCosts, 675.00);
    assert.equal(r.estimatedNetProfit, 406.00);
    assert.equal(r.effectivePlatformTakeRatePct, 6.00);
  });
});

/* Case 4 — Refund admin cap at $5 */
describe('Case 4 — Refund admin cap at $5', () => {
  test('cap engages on high-value order', () => {
    const r = ok(calculate({
      customerPaymentPerOrder: 600,
      platformDiscountPerOrder: 0,
      taxPerOrder: 0,
      monthlyOrders: 10,
      feeMode: 'standard-6',
      refundRatePct: 100,
      productCostPerOrder: 0,
      shippingSubsidyPerOrder: 0,
      otherCostPerOrder: 0,
    }));
    assert.equal(r.qualifiedFeeBasePerOrder, 600.00);
    assert.equal(r.referralFeePerOrder, 36.00);
    // raw 20% of 36 = 7.20, capped at 5.00
    assert.equal(r.refundAdminFeePerRefundedOrder, 5.00);
    assert.equal(r.completedOrders, 0.00);
    assert.equal(r.refundedOrders, 10.00);
    assert.equal(r.grossSellerReceipts, 0.00);
    assert.equal(r.monthlyReferralFees, 0.00);
    assert.equal(r.monthlyRefundAdminFees, 50.00);
    assert.equal(r.estimatedPayoutAfterPlatformFees, -50.00);
    assert.equal(r.monthlyVariableCosts, 0.00);
    assert.equal(r.estimatedNetProfit, -50.00);
    assert.equal(r.effectivePlatformTakeRatePct, 0.00);
  });
});

/* Case 5 — Zero orders */
describe('Case 5 — Zero orders', () => {
  test('zero monthly orders stays stable', () => {
    const r = ok(calculate({
      customerPaymentPerOrder: 25,
      platformDiscountPerOrder: 0,
      taxPerOrder: 0,
      monthlyOrders: 0,
      feeMode: 'standard-6',
      refundRatePct: 4,
      productCostPerOrder: 10,
      shippingSubsidyPerOrder: 2,
      otherCostPerOrder: 1,
    }));
    assert.equal(r.completedOrders, 0);
    assert.equal(r.refundedOrders, 0);
    assert.equal(r.grossSellerReceipts, 0);
    assert.equal(r.estimatedNetProfit, 0);
    assert.equal(r.effectivePlatformTakeRatePct, 0);
    // no NaN or Infinity
    for (const [k, v] of Object.entries(r)) {
      if (typeof v === 'number') {
        assert.ok(Number.isFinite(v), `${k} should be finite, got ${v}`);
      }
    }
  });
});

/* Case 6 — Custom fee mode */
describe('Case 6 — Custom fee mode 4.5%', () => {
  test('custom rate overrides preset', () => {
    const r = ok(calculate({
      customerPaymentPerOrder: 40,
      platformDiscountPerOrder: 0,
      taxPerOrder: 0,
      monthlyOrders: 20,
      feeMode: 'custom',
      customReferralFeePct: 4.5,
      refundRatePct: 10,
      productCostPerOrder: 15,
      shippingSubsidyPerOrder: 3,
      otherCostPerOrder: 2,
    }));
    assert.equal(r.referralFeePct, 4.50);
    assert.equal(r.referralFeePerOrder, 1.80);
    assert.equal(r.refundAdminFeePerRefundedOrder, 0.36);
    assert.equal(r.completedOrders, 18.00);
    assert.equal(r.refundedOrders, 2.00);
    assert.equal(r.grossSellerReceipts, 720.00);
    assert.equal(r.monthlyReferralFees, 32.40);
    assert.equal(r.monthlyRefundAdminFees, 0.72);
    assert.equal(r.estimatedPayoutAfterPlatformFees, 686.88);
    assert.equal(r.variableCostPerOrder, 20.00);
    assert.equal(r.monthlyVariableCosts, 400.00);
    assert.equal(r.estimatedNetProfit, 286.88);
    assert.equal(r.effectivePlatformTakeRatePct, 4.60);
  });
});

/* Case 7 — Fee base floors at zero */
describe('Case 7 — Fee base floors at zero when tax > payment', () => {
  test('negative fee base clamped', () => {
    const r = ok(calculate({
      customerPaymentPerOrder: 2,
      platformDiscountPerOrder: 0,
      taxPerOrder: 5,
      monthlyOrders: 10,
      feeMode: 'standard-6',
      refundRatePct: 0,
      productCostPerOrder: 0,
      shippingSubsidyPerOrder: 0,
      otherCostPerOrder: 0,
    }));
    assert.equal(r.qualifiedFeeBasePerOrder, 0.00);
    assert.equal(r.referralFeePerOrder, 0.00);
    assert.equal(r.grossSellerReceipts, 0.00);
    assert.equal(r.estimatedNetProfit, 0.00);
  });
});

/* Case 8 — Validation failures */
describe('Case 8 — Validation failures', () => {
  test('negative monthly orders', () => {
    const res = calculate({ ...DEFAULTS, monthlyOrders: -1 });
    assert.equal(res.result, null);
    assert.ok(res.error.length > 0);
  });
  test('refundRatePct > 100', () => {
    const res = calculate({ ...DEFAULTS, refundRatePct: 120 });
    assert.equal(res.result, null);
    assert.ok(res.error.length > 0);
  });
  test('negative customReferralFeePct in custom mode', () => {
    const res = calculate({ ...DEFAULTS, feeMode: 'custom', customReferralFeePct: -3 });
    assert.equal(res.result, null);
    assert.ok(res.error.length > 0);
  });
  test('negative customerPaymentPerOrder', () => {
    const res = calculate({ ...DEFAULTS, customerPaymentPerOrder: -0.01 });
    assert.equal(res.result, null);
    assert.ok(res.error.length > 0);
  });
  test('non-numeric string triggers NaN fallback that fails validation', () => {
    const res = calculate({ ...DEFAULTS, monthlyOrders: 'abc' });
    assert.equal(res.result, null);
    assert.ok(res.error.length > 0);
  });
});

/* Summary content */
describe('Summary includes key labels', () => {
  test('summary text has fee mode and net profit', () => {
    const r = ok(calculate(DEFAULTS));
    const s = buildSummary(r, 'en');
    assert.ok(/TikTok Shop/i.test(s));
    assert.ok(/net profit/i.test(s));
    assert.ok(/Standard 6%/i.test(s));
  });
});

/* Status reporting */
describe('Status reflects profitability', () => {
  test('baseline is profitable', () => {
    const r = ok(calculate(DEFAULTS));
    assert.equal(r.status, 'good');
  });
  test('100% refund all costs is loss', () => {
    const r = ok(calculate({
      ...DEFAULTS,
      refundRatePct: 100,
      productCostPerOrder: 10,
    }));
    assert.equal(r.status, 'negative');
  });
});
