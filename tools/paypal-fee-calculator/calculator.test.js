const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { calculate, DEFAULTS, RATES, CROSS_BORDER_RATE } = require('./calculator.js');

describe('TC-F001 forward standard domestic', () => {
  it('calculates correct fees for $100 standard domestic', () => {
    const r = calculate({ amount: 100, paymentType: 'standard', international: false, mode: 'forward' });
    assert.equal(r.error, '');
    // 3.49% + $0.49 = $3.49 + $0.49 = $3.98
    assert.equal(r.result.pctFee, 3.49);
    assert.equal(r.result.fixedFee, 0.49);
    assert.equal(r.result.totalFee, 3.98);
    assert.equal(r.result.net, 96.02);
    assert.equal(r.result.crossBorderFee, 0);
  });
});

describe('TC-F002 reverse standard domestic', () => {
  it('finds charge amount to net $200', () => {
    const r = calculate({ amount: 200, paymentType: 'standard', international: false, mode: 'reverse' });
    assert.equal(r.error, '');
    assert.ok(r.result.chargeAmount > 200);
    assert.equal(r.result.net, 200);
    // Verify: charge - fee ≈ 200
    const verifyNet = r.result.chargeAmount - r.result.totalFee;
    assert.ok(Math.abs(verifyNet - 200) < 0.02);
  });
});

describe('TC-F003 Friends & Family bank domestic', () => {
  it('no fees for F&F bank domestic', () => {
    const r = calculate({ amount: 500, paymentType: 'ff', ffFunding: 'bank', international: false, mode: 'forward' });
    assert.equal(r.error, '');
    assert.equal(r.result.totalFee, 0);
    assert.equal(r.result.net, 500);
  });
});

describe('TC-F004 Friends & Family card domestic', () => {
  it('charges 3.49% + $0.49 for card-funded F&F', () => {
    const r = calculate({ amount: 100, paymentType: 'ff', ffFunding: 'card', international: false, mode: 'forward' });
    assert.equal(r.error, '');
    assert.equal(r.result.pctFee, 3.49);
    assert.equal(r.result.fixedFee, 0.49);
    assert.equal(r.result.totalFee, 3.98);
  });
});

describe('TC-F005 QR code tier switch', () => {
  it('uses low tier for $8 (≤$10)', () => {
    const r = calculate({ amount: 8, paymentType: 'qr', mode: 'forward' });
    assert.equal(r.error, '');
    assert.equal(r.result.qrTier, 'low');
    // 2.4% + $0.05 = $0.192 + $0.05 = $0.24
    assert.equal(r.result.fixedFee, 0.05);
  });

  it('uses high tier for $50 (>$10)', () => {
    const r = calculate({ amount: 50, paymentType: 'qr', mode: 'forward' });
    assert.equal(r.error, '');
    assert.equal(r.result.qrTier, 'high');
    // 1.9% + $0.10
    assert.equal(r.result.fixedFee, 0.10);
  });
});

describe('TC-F006 international cross-border surcharge', () => {
  it('adds 1.5% cross-border fee', () => {
    const r = calculate({ amount: 300, paymentType: 'standard', international: true, mode: 'forward' });
    assert.equal(r.error, '');
    assert.equal(r.result.crossBorderFee, 4.5);
    // total = 300*(0.0349+0.015) + 0.49 = 300*0.0499 + 0.49 = 14.97 + 0.49 = 15.46
    assert.equal(r.result.totalFee, 15.46);
  });
});

describe('TC-F007 invoicing', () => {
  it('invoicing uses 3.49% + $0.49', () => {
    const r = calculate({ amount: 500, paymentType: 'invoicing', international: false, mode: 'forward' });
    assert.equal(r.error, '');
    assert.equal(r.result.pctFee, 17.45);
    assert.equal(r.result.fixedFee, 0.49);
    assert.equal(r.result.totalFee, 17.94);
  });
});

describe('TC-F008 validation', () => {
  it('rejects negative amount', () => {
    const r = calculate({ amount: -10 });
    assert.ok(r.error.length > 0);
    assert.equal(r.result, null);
  });

  it('rejects invalid payment type', () => {
    const r = calculate({ amount: 100, paymentType: 'venmo' });
    assert.ok(r.error.length > 0);
    assert.equal(r.result, null);
  });

  it('rejects invalid mode', () => {
    const r = calculate({ amount: 100, mode: 'sideways' });
    assert.ok(r.error.length > 0);
  });
});

describe('TC-F009 effective fee rate', () => {
  it('shows correct effective rate', () => {
    const r = calculate({ amount: 100, paymentType: 'standard', mode: 'forward' });
    assert.equal(r.result.effectiveRatePct, 3.98);
  });
});

describe('TC-F010 defaults shape', () => {
  it('DEFAULTS has all expected keys', () => {
    for (const k of ['amount', 'paymentType', 'ffFunding', 'international', 'mode']) {
      assert.ok(k in DEFAULTS, `missing DEFAULTS.${k}`);
    }
  });
});
