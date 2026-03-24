/**
 * Lemon Squeezy Fee Calculator — Node tests
 * Run: node --test tools/lemon-squeezy-fee-calculator/calculator.test.js
 */
const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const { evaluate, DEFAULTS } = require('./calculator.js');

function ok(res) {
  assert.equal(res.error, '');
  return res.result;
}

/* TC-LS-01 Baseline card + US Stripe payout */
describe('TC-LS-01 baseline (card + Stripe US)', () => {
  test('core fee math and reverse price', () => {
    const input = {
      orderCount: 100,
      listPrice: 29,
      taxRate: 0,
      platformFeeRate: 5,
      platformFixedFee: 0.50,
      isInternationalPayment: false,
      internationalSurchargeRate: 1.5,
      paymentMethod: 'card',
      paypalSurchargeRate: 1.5,
      isSubscription: false,
      subscriptionSurchargeRate: 0.5,
      extraMarketingFeeRate: 0,
      payoutMethod: 'stripe',
      payoutRegion: 'us',
      payoutCount: 1,
      targetNetAfterPayoutPerOrder: 20,
    };
    const r = ok(evaluate(input));
    assert.equal(r.combinedPlatformRatePct, 5);
    assert.equal(r.customerTotalPerOrder, 29.00);
    assert.equal(r.platformFeePerOrder, 1.95);
    assert.equal(r.estimatedNetAfterPayoutPerOrder, 27.05);
    assert.equal(r.periodPayoutFee, 0);
    assert.equal(r.targetListPriceForDesiredNetAfterPayout, 21.58);
  });
});

/* TC-LS-02 International PayPal subscription + PayPal intl payout */
describe('TC-LS-02 intl PayPal subscription + PayPal intl payout', () => {
  test('surcharge stacking and payout handling', () => {
    const r = ok(evaluate({
      orderCount: 40,
      listPrice: 49,
      taxRate: 20,
      platformFeeRate: 5,
      platformFixedFee: DEFAULTS.platformFixedFee,
      isInternationalPayment: true,
      internationalSurchargeRate: 1.5,
      paymentMethod: 'paypal',
      paypalSurchargeRate: 1.5,
      isSubscription: true,
      subscriptionSurchargeRate: 0.5,
      extraMarketingFeeRate: 3,
      payoutMethod: 'paypal',
      payoutRegion: 'intl',
      payoutCount: 2,
      targetNetAfterPayoutPerOrder: 20,
    }));
    assert.equal(r.combinedPlatformRatePct, 11.5);
    assert.equal(r.customerTotalPerOrder, 58.80);
    assert.ok(r.periodPayoutFee > 0);
    assert.ok(Number.isFinite(r.estimatedNetAfterPayoutPerOrder));
    assert.equal(r.status === 'good' || r.status === 'tight' || r.status === 'negative', true);
  });
});

/* TC-LS-03 Reverse pricing respects payout mode */
describe('TC-LS-03 reverse pricing respects payout regime', () => {
  test('payout-fee regimes require higher target price than Stripe US', () => {
    const base = {
      orderCount: 100,
      taxRate: 10,
      platformFeeRate: 5,
      platformFixedFee: 0.50,
      isInternationalPayment: false,
      internationalSurchargeRate: 1.5,
      paymentMethod: 'card',
      paypalSurchargeRate: 1.5,
      isSubscription: false,
      subscriptionSurchargeRate: 0.5,
      extraMarketingFeeRate: 0,
      payoutCount: 2,
      targetNetAfterPayoutPerOrder: 15,
    };
    const stripeUs = ok(evaluate({ ...base, listPrice: 25, payoutMethod: 'stripe', payoutRegion: 'us' }));
    const stripeIntl = ok(evaluate({ ...base, listPrice: 25, payoutMethod: 'stripe', payoutRegion: 'intl' }));
    const paypalIntl = ok(evaluate({ ...base, listPrice: 25, payoutMethod: 'paypal', payoutRegion: 'intl' }));
    assert.ok(stripeIntl.targetListPriceForDesiredNetAfterPayout > stripeUs.targetListPriceForDesiredNetAfterPayout);
    assert.ok(paypalIntl.targetListPriceForDesiredNetAfterPayout > stripeUs.targetListPriceForDesiredNetAfterPayout);
  });
});

/* TC-LS-04 Invalid numeric inputs rejected */
describe('TC-LS-04 invalid inputs', () => {
  test('invalid examples return error', () => {
    const bads = [
      { orderCount: 0, listPrice: 10, taxRate: 0, payoutCount: 1 },
      { orderCount: 1, listPrice: -1, taxRate: 0, payoutCount: 1 },
      { orderCount: 1, listPrice: 10, taxRate: 101, payoutCount: 1 },
      { orderCount: 1, listPrice: 10, taxRate: 10, payoutCount: 0 },
      { orderCount: 1, listPrice: 10, taxRate: 10, platformFixedFee: -0.01, payoutCount: 1 },
      { orderCount: 1, listPrice: 10, taxRate: 10, extraMarketingFeeRate: 120, payoutCount: 1 },
      { orderCount: 1, listPrice: 10, taxRate: 10, targetNetAfterPayoutPerOrder: -1, payoutCount: 1 },
    ];
    for (const b of bads) {
      const res = evaluate({ ...DEFAULTS, ...b });
      assert.equal(res.result, null);
      assert.ok(res.error.length > 0);
    }
  });
});

/* Additional regression: payout fees never credit a loss */
describe('negative take-home does not create a negative payout fee credit', () => {
  test('payout fee is zero when pre-payout is negative', () => {
    const r = ok(evaluate({
      orderCount: 10,
      listPrice: 1,
      taxRate: 0,
      platformFeeRate: 90,
      platformFixedFee: 2,
      isInternationalPayment: false,
      paymentMethod: 'card',
      payoutMethod: 'stripe',
      payoutRegion: 'intl',
      payoutCount: 1,
      targetNetAfterPayoutPerOrder: 0,
    }));
    assert.equal(r.periodNetBeforePayout < 0, true);
    assert.equal(r.periodPayoutFee, 0);
  });
});

/* TC-LS-05 Catalog integration exact-once */
describe('TC-LS-05 catalog integration exact-once', () => {
  test('index surfaces include the tool exactly once', () => {
    const root = path.resolve(__dirname, '..', '..');
    const slug = 'lemon-squeezy-fee-calculator';
    const html = fs.readFileSync(path.join(root, 'tools', 'index.html'), 'utf8');
    const md = fs.readFileSync(path.join(root, 'tools', 'index.md'), 'utf8');
    const manifest = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'manifest.json'), 'utf8')).tools;
    const lst = JSON.parse(fs.readFileSync(path.join(root, '_data', 'tools-list.json'), 'utf8'));
    const htmlMatches = (html.match(new RegExp(`href="${slug}/"`, 'g')) || []).length;
    const mdMatches = (md.match(new RegExp(`\.\/${slug}\/`, 'g')) || []).length;
    const manifestMatches = manifest.filter(x => x && x.slug === slug && x.url === `/tools/${slug}/`).length;
    const listMatches = lst.filter(x => x && x.url === `/tools/${slug}/`).length;
    assert.equal(htmlMatches, 1);
    assert.equal(mdMatches, 1);
    assert.equal(manifestMatches, 1);
    assert.equal(listMatches, 1);
  });
});

/* Summary contains key phrases */
describe('summary includes target price and payout mode', () => {
  test('contains target list price string and payout label', () => {
    const r = ok(evaluate(DEFAULTS));
    assert.ok(/Target list price/i.test(r.summary));
    assert.ok(/Stripe|PayPal/i.test(r.summary));
  });
});
