const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  calculate,
  DEFAULTS,
  PAYOUT_METHODS,
  SOURCE_REVIEWED_AT,
  calcPayoutFee,
  findBreakEvenSalePrice,
  findBreakEvenTransactions
} = require('./calculator.js');

function approx(actual, expected, tolerance = 0.01) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} ≈ ${expected} (±${tolerance})`);
}

test('exports conservative Whop defaults and payout presets', () => {
  assert.equal(DEFAULTS.processorDomesticPct, 2.7);
  assert.equal(DEFAULTS.processorFixedUsd, 0.30);
  assert.equal(DEFAULTS.internationalSurchargePct, 1.5);
  assert.equal(DEFAULTS.fxSurchargePct, 1.0);
  assert.equal(DEFAULTS.billingPct, 0.5);
  assert.equal(DEFAULTS.taxPct, 0.5);
  assert.equal(DEFAULTS.affiliateProcessingPct, 1.25);
  assert.equal(PAYOUT_METHODS.next_day_ach.fixed, 2.5);
  assert.equal(PAYOUT_METHODS.instant_bank.pct, 4);
  assert.equal(SOURCE_REVIEWED_AT, '2026-03-27');
});

test('TC-WHOP-01 baseline domestic card case', () => {
  const { result, error } = calculate({
    salePrice: 99,
    transactions: 10,
    domesticSharePct: 100,
    internationalSharePct: 0,
    fxConversionSharePct: 0,
    billingEnabled: false,
    taxRemittanceEnabled: false,
    affiliateEnabled: false,
    payoutMethod: 'none',
    sellerCostPerSale: 0,
    monthlyFixedCost: 0
  });

  assert.equal(error, '');
  approx(result.grossRevenue, 990);
  approx(result.processorBaseFee, 29.73);
  approx(result.totalFees, 29.73);
  approx(result.takeHomeBeforeSellerCosts, 960.27);
  approx(result.netProfit, 960.27);
  approx(result.effectiveTakeRatePct, 3.003, 0.001);
});

test('TC-WHOP-02 international cards reduce take-home', () => {
  const domestic = calculate({
    salePrice: 99,
    transactions: 10,
    domesticSharePct: 100,
    internationalSharePct: 0,
    fxConversionSharePct: 0,
    billingEnabled: false,
    taxRemittanceEnabled: false,
    affiliateEnabled: false,
    payoutMethod: 'none',
    sellerCostPerSale: 0,
    monthlyFixedCost: 0
  }).result;

  const international = calculate({
    salePrice: 99,
    transactions: 10,
    domesticSharePct: 0,
    internationalSharePct: 100,
    fxConversionSharePct: 0,
    billingEnabled: false,
    taxRemittanceEnabled: false,
    affiliateEnabled: false,
    payoutMethod: 'none',
    sellerCostPerSale: 0,
    monthlyFixedCost: 0
  }).result;

  approx(international.internationalFee, 14.85);
  approx(international.totalFees, 44.58);
  approx(international.takeHomeBeforeSellerCosts, 945.42);
  assert.ok(international.takeHomeBeforeSellerCosts < domestic.takeHomeBeforeSellerCosts);
});

test('TC-WHOP-03 FX, billing, tax, and affiliate processing layers stay explicit', () => {
  const { result, error } = calculate({
    salePrice: 99,
    transactions: 10,
    domesticSharePct: 0,
    internationalSharePct: 100,
    fxConversionSharePct: 100,
    billingEnabled: true,
    taxRemittanceEnabled: true,
    affiliateEnabled: true,
    affiliateCommissionBasePct: 20,
    payoutMethod: 'none',
    sellerCostPerSale: 0,
    monthlyFixedCost: 0
  });

  assert.equal(error, '');
  approx(result.fxFee, 9.9);
  approx(result.billingFee, 4.95);
  approx(result.taxFee, 4.95);
  approx(result.affiliateProcessingFee, 12.38);
  approx(result.affiliateCommissionCost, 198);
  approx(result.totalFees, 76.76);
  approx(result.netProfit, 715.24);
});

test('TC-WHOP-04 payout fee presets are deterministic', () => {
  approx(calcPayoutFee(960.27, 'next_day_ach', 10), 2.5);
  approx(calcPayoutFee(960.27, 'instant_bank', 10), 39.41);
  approx(calcPayoutFee(960.27, 'crypto', 10), 49.01);
});

test('TC-WHOP-05 instant payout lowers take-home vs next day ACH', () => {
  const ach = calculate({
    salePrice: 99,
    transactions: 10,
    domesticSharePct: 100,
    internationalSharePct: 0,
    fxConversionSharePct: 0,
    billingEnabled: false,
    taxRemittanceEnabled: false,
    affiliateEnabled: false,
    payoutMethod: 'next_day_ach',
    sellerCostPerSale: 0,
    monthlyFixedCost: 0
  }).result;

  const instant = calculate({
    salePrice: 99,
    transactions: 10,
    domesticSharePct: 100,
    internationalSharePct: 0,
    fxConversionSharePct: 0,
    billingEnabled: false,
    taxRemittanceEnabled: false,
    affiliateEnabled: false,
    payoutMethod: 'instant_bank',
    sellerCostPerSale: 0,
    monthlyFixedCost: 0
  }).result;

  approx(ach.payoutFee, 2.5);
  approx(instant.payoutFee, 39.41);
  assert.ok(instant.takeHomeBeforeSellerCosts < ach.takeHomeBeforeSellerCosts);
});

test('TC-WHOP-06 seller costs push up break-even price and transaction count', () => {
  const input = {
    salePrice: 99,
    transactions: 10,
    domesticSharePct: 100,
    internationalSharePct: 0,
    fxConversionSharePct: 0,
    billingEnabled: false,
    taxRemittanceEnabled: false,
    affiliateEnabled: false,
    payoutMethod: 'none',
    sellerCostPerSale: 10,
    monthlyFixedCost: 100
  };
  const { result, error } = calculate(input);

  assert.equal(error, '');
  approx(result.sellerVariableCost, 100);
  approx(result.netProfit, 760.27);
  approx(findBreakEvenSalePrice(input), 20.87, 0.02);
  assert.equal(findBreakEvenTransactions(input), 2);
});

test('TC-WHOP-07 invalid share mixes and payout methods fail cleanly', () => {
  const invalidCases = [
    { ...DEFAULTS, domesticSharePct: 60, internationalSharePct: 30 },
    { ...DEFAULTS, fxConversionSharePct: 50, internationalSharePct: 20, domesticSharePct: 80 },
    { ...DEFAULTS, salePrice: -1 },
    { ...DEFAULTS, transactions: 1.5 },
    { ...DEFAULTS, payoutMethod: 'mystery' }
  ];

  invalidCases.forEach((input) => {
    const { result, error } = calculate(input);
    assert.equal(result, null);
    assert.notEqual(error, '');
  });
});

test('TC-WHOP-08 impossible fee stack returns null break-even values', () => {
  const { result, error } = calculate({
    salePrice: 99,
    transactions: 10,
    domesticSharePct: 0,
    internationalSharePct: 100,
    fxConversionSharePct: 100,
    billingEnabled: true,
    taxRemittanceEnabled: true,
    affiliateEnabled: true,
    payoutMethod: 'crypto',
    sellerCostPerSale: 50,
    monthlyFixedCost: 1000,
    affiliateCommissionBasePct: 90,
    processorDomesticPct: 80,
    processorFixedUsd: 10,
    internationalSurchargePct: 10,
    fxSurchargePct: 10,
    billingPct: 10,
    taxPct: 10,
    affiliateProcessingPct: 10
  });

  assert.equal(error, '');
  assert.equal(result.breakEvenSalePrice, null);
  assert.equal(result.breakEvenTransactions, null);
  assert.match(result.summary, /break-even sale price: impossible/i);
});

test('TC-WHOP-09 summary text includes current assumptions and exclusions', () => {
  const { result, error } = calculate({
    salePrice: 99,
    transactions: 10,
    domesticSharePct: 100,
    internationalSharePct: 0,
    fxConversionSharePct: 0,
    billingEnabled: true,
    taxRemittanceEnabled: true,
    affiliateEnabled: false,
    payoutMethod: 'next_day_ach',
    sellerCostPerSale: 5,
    monthlyFixedCost: 50
  });

  assert.equal(error, '');
  assert.match(result.summary, /Reviewed official Whop docs: 2026-03-27/);
  assert.match(result.summary, /2\.7% \+ \$0\.30/);
  assert.match(result.summary, /Payout assumption: Next day ACH/);
  assert.match(result.summary, /Not modeled: automation-only 3% platform fee/);
});

test('TC-WHOP-10 HTML scaffold contains disclaimer, sources, and calculator anchors', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

  for (const token of [
    'salePrice',
    'transactions',
    'domesticSharePct',
    'internationalSharePct',
    'fxConversionSharePct',
    'billingEnabled',
    'taxRemittanceEnabled',
    'affiliateEnabled',
    'affiliateCommissionBasePct',
    'payoutMethod',
    'sellerCostPerSale',
    'monthlyFixedCost',
    'processorDomesticPct',
    'summary',
    'breakdownRows',
    'script defer src="./calculator.js"',
    '/assets/analytics.js',
    'Public Whop docs reviewed March 27, 2026'
  ]) {
    assert.ok(html.includes(token), token);
  }

  assert.match(html, /Whop Fee Calculator/);
  assert.match(html, /docs\.whop\.com\/fees/);
  assert.match(html, /3% automation-only platform fee/);
});

test('TC-WHOP-11 discovery exact-once wiring', () => {
  const root = path.join(__dirname, '..', '..');
  const slug = 'whop-fee-calculator';
  const url = `/tools/${slug}/`;

  const indexHtml = fs.readFileSync(path.join(root, 'tools', 'index.html'), 'utf8');
  const indexMd = fs.readFileSync(path.join(root, 'tools', 'index.md'), 'utf8');
  const toolsList = JSON.parse(fs.readFileSync(path.join(root, '_data', 'tools-list.json'), 'utf8'));
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'manifest.json'), 'utf8'));

  assert.equal((indexHtml.match(new RegExp(slug, 'g')) || []).length, 1, 'tools/index.html exact-once');
  assert.equal((indexMd.match(new RegExp(slug, 'g')) || []).length, 1, 'tools/index.md exact-once');
  assert.equal(toolsList.filter((entry) => entry.url === url).length, 1, '_data/tools-list.json exact-once');
  assert.equal(manifest.tools.filter((entry) => entry.slug === slug && entry.url === url).length, 1, 'tools/manifest.json exact-once');
});
