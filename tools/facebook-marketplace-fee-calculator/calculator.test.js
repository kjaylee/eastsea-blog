const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { calculate } = require('./calculator.js');

describe('Facebook Marketplace Fee Calculator', () => {

  // TC-01: shipped baseline
  it('TC-01 shipped baseline', () => {
    const r = calculate({
      orderMode: 'shipped',
      salePrice: 45,
      shippingChargedToBuyer: 8,
      targetPayout: 40
    });
    assert.equal(r.error, false);
    assert.equal(r.grossCollected, 53.00);
    assert.equal(r.marketplaceFee, 5.30);
    assert.equal(r.processingFee, 0.00);
    assert.equal(r.totalFees, 5.30);
    assert.equal(r.sellerPayout, 47.70);
    assert.equal(r.effectiveFeeRatePct, 10.00);
    // requiredSalePrice: target=40, shipping=8 → gross = 40 / 0.9 = 44.444... → sale = 44.444... - 8 = 36.444...
    assert.ok(Math.abs(r.requiredSalePriceForTargetPayout - 36.44) < 0.01);
  });

  // TC-02: minimum-fee branch
  it('TC-02 minimum-fee branch', () => {
    const r = calculate({
      orderMode: 'shipped',
      salePrice: 2,
      shippingChargedToBuyer: 0
    });
    assert.equal(r.error, false);
    assert.equal(r.grossCollected, 2.00);
    assert.equal(r.marketplaceFee, 0.80);
    assert.equal(r.sellerPayout, 1.20);
    assert.equal(r.effectiveFeeRatePct, 40.00);
  });

  // TC-03: pickup baseline
  it('TC-03 pickup baseline', () => {
    const r = calculate({
      orderMode: 'pickup',
      salePrice: 35,
      shippingChargedToBuyer: 0,
      targetPayout: 35
    });
    assert.equal(r.error, false);
    assert.equal(r.marketplaceFee, 0.00);
    assert.equal(r.processingFee, 0.00);
    assert.equal(r.totalFees, 0.00);
    assert.equal(r.sellerPayout, 35.00);
    assert.equal(r.requiredSalePriceForTargetPayout, 35.00);
  });

  // TC-04: custom override with processing drag
  it('TC-04 custom override with processing drag', () => {
    const r = calculate({
      orderMode: 'shipped',
      salePrice: 60,
      shippingChargedToBuyer: 6,
      customFeeOverride: true,
      customFeeRatePct: 12.5,
      customMinimumFee: 1.50,
      processingRatePct: 2.9,
      processingFlatFee: 0.30,
      targetPayout: 50
    });
    assert.equal(r.error, false);
    // gross = 66
    assert.equal(r.grossCollected, 66.00);
    // marketplace fee = max(66 * 0.125, 1.50) = max(8.25, 1.50) = 8.25
    assert.equal(r.marketplaceFee, 8.25);
    // processing = 66 * 0.029 + 0.30 = 1.914 + 0.30 = 2.214 → round to 2.21
    assert.equal(r.processingFee, 2.21);
    // total = 8.25 + 2.21 = 10.46
    assert.equal(r.totalFees, 10.46);
    // payout = 66 - 10.46 = 55.54
    assert.equal(r.sellerPayout, 55.54);
    // summary is non-empty and contains key fields
    assert.ok(r.summary.includes('Custom:'));
    assert.ok(r.summary.includes('55.54'));
    // target payout solver should return a number
    assert.ok(typeof r.requiredSalePriceForTargetPayout === 'number');
    assert.ok(r.requiredSalePriceForTargetPayout > 0);
  });

  // TC-05: validation rejects impossible inputs
  describe('TC-05 validation', () => {
    it('rejects salePrice <= 0', () => {
      const r = calculate({ salePrice: 0, orderMode: 'shipped' });
      assert.equal(r.error, true);
      assert.ok(r.errors.some(e => e.includes('salePrice')));
    });

    it('rejects unknown orderMode', () => {
      const r = calculate({ salePrice: 10, orderMode: 'drone' });
      assert.equal(r.error, true);
      assert.ok(r.errors.some(e => e.includes('orderMode')));
    });

    it('rejects pickup with shipping > 0', () => {
      const r = calculate({ salePrice: 10, orderMode: 'pickup', shippingChargedToBuyer: 5 });
      assert.equal(r.error, true);
      assert.ok(r.errors.some(e => e.includes('pickup')));
    });

    it('rejects negative fee fields', () => {
      const r = calculate({ salePrice: 10, orderMode: 'shipped', processingFlatFee: -1 });
      assert.equal(r.error, true);
    });

    it('rejects processingRatePct >= 100', () => {
      const r = calculate({ salePrice: 10, orderMode: 'shipped', processingRatePct: 100 });
      assert.equal(r.error, true);
    });

    it('rejects custom combined rate >= 100', () => {
      const r = calculate({
        salePrice: 10, orderMode: 'shipped',
        customFeeOverride: true, customFeeRatePct: 60, processingRatePct: 50
      });
      assert.equal(r.error, true);
      assert.ok(r.errors.some(e => e.includes('< 100')));
    });
  });

  // TC-06: summary output contains required fields
  it('TC-06 summary contains required fields', () => {
    const r = calculate({
      orderMode: 'shipped',
      salePrice: 45,
      shippingChargedToBuyer: 8,
      targetPayout: 40
    });
    assert.ok(r.summary.includes('shipped'));
    assert.ok(r.summary.includes('Gross collected'));
    assert.ok(r.summary.includes('Marketplace fee'));
    assert.ok(r.summary.includes('Processing fee'));
    assert.ok(r.summary.includes('Total fees'));
    assert.ok(r.summary.includes('Seller payout'));
    assert.ok(r.summary.includes('Effective fee rate'));
    assert.ok(r.summary.includes('Required sale price'));
  });
});
