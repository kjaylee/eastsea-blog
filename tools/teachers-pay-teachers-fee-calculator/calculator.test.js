const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const calc = require('./calculator.js');

function approx(actual, expected, tolerance = 0.000001) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} ≈ ${expected} (±${tolerance})`);
}

function scenario(overrides = {}) {
  return calc.calculate(Object.assign({}, calc.DEFAULT_INPUTS, overrides));
}

test('TC-TPT-01 basic baseline at 4.99 matches formula', () => {
  const { result, error } = scenario({ listPrice: 4.99, discountPct: 0, monthlySales: 10, lang: 'en' });
  assert.equal(error, '');
  approx(result.realizedSalePrice, 4.99);
  approx(result.basicPayout, 2.4445);
  approx(result.basicPlatformTake, 2.5455);
  approx(result.basicEffectiveTakeRatePct, 51.012024, 0.00001);
});

test('TC-TPT-02 premium baseline at 4.99 skips under-3 fee and yields positive lift', () => {
  const { result, error } = scenario({ listPrice: 4.99, discountPct: 0, monthlySales: 10, lang: 'en' });
  assert.equal(error, '');
  approx(result.premiumTransactionFee, 0);
  approx(result.premiumPayout, 3.992);
  approx(result.perSalePremiumLift, 1.5475);
  assert.equal(result.premiumBreakEvenSalesNewSeller, 21);
  assert.equal(result.premiumBreakEvenSalesUpgrade, 39);
});

test('TC-TPT-03 under-3 premium fee applies at 2.50', () => {
  const { result, error } = scenario({ listPrice: 2.5, discountPct: 0, monthlySales: 10, lang: 'en' });
  assert.equal(error, '');
  approx(result.realizedSalePrice, 2.5);
  approx(result.premiumTransactionFee, 0.15);
  approx(result.basicPayout, 1.075);
  approx(result.premiumPayout, 1.85);
  approx(result.perSalePremiumLift, 0.775);
  assert.equal(result.premiumBreakEvenSalesNewSeller, 40);
  assert.equal(result.premiumBreakEvenSalesUpgrade, 78);
});

test('TC-TPT-04 discount-driven threshold crossing is deterministic', () => {
  const above = scenario({ listPrice: 4.99, discountPct: 20, monthlySales: 10, lang: 'en' }).result;
  const below = scenario({ listPrice: 3.25, discountPct: 10, monthlySales: 10, lang: 'en' }).result;

  approx(above.realizedSalePrice, 3.992);
  approx(above.premiumTransactionFee, 0);
  approx(below.realizedSalePrice, 2.925);
  approx(below.premiumTransactionFee, 0.15);
  approx(below.premiumPayout, 2.19);
});

test('TC-TPT-05 annual projections favor premium at moderate sales', () => {
  const { result, error } = scenario({ listPrice: 4.99, discountPct: 0, monthlySales: 50, lang: 'en' });
  assert.equal(error, '');
  approx(result.annualBasicEarningsAfterMembership, 1437.7);
  approx(result.annualPremiumEarningsAfterMembership, 2335.25);
  approx(result.annualPremiumLift, 897.55);
  assert.equal(result.recommendedTier, 'Premium');
});

test('TC-TPT-06 zero monthly sales returns null month-based payback', () => {
  const { result, error } = scenario({ listPrice: 4.99, discountPct: 0, monthlySales: 0, lang: 'en' });
  assert.equal(error, '');
  assert.equal(result.premiumBreakEvenSalesNewSeller, 21);
  assert.equal(result.premiumBreakEvenSalesUpgrade, 39);
  assert.equal(result.premiumBreakEvenMonthsNewSeller, null);
  assert.equal(result.premiumBreakEvenMonthsUpgrade, null);
});

test('TC-TPT-07 invalid input is rejected', () => {
  const invalidCases = [
    { listPrice: 0, discountPct: 0, monthlySales: 10, lang: 'en' },
    { listPrice: 1, discountPct: 100, monthlySales: 10, lang: 'en' },
    { listPrice: 4.99, discountPct: -1, monthlySales: 10, lang: 'en' },
    { listPrice: 4.99, discountPct: 0, monthlySales: -1, lang: 'en' },
    { listPrice: 'abc', discountPct: 0, monthlySales: 10, lang: 'en' },
  ];

  invalidCases.forEach((input) => {
    const { result, error } = calc.calculate(input);
    assert.equal(result, null);
    assert.notEqual(error, '');
  });
});

test('TC-TPT-08 summary includes decision-ready fields', () => {
  const { result, error } = scenario({ listPrice: 4.99, discountPct: 0, monthlySales: 10, lang: 'en' });
  assert.equal(error, '');
  assert.match(result.summary, /Realized sale price:/);
  assert.match(result.summary, /Basic payout per sale:/);
  assert.match(result.summary, /Premium payout per sale:/);
  assert.match(result.summary, /Annual Premium earnings after membership:/);
  assert.match(result.summary, /Premium break-even sales \(new seller\):/);
  assert.match(result.summary, /Recommendation:/);
});

test('TC-TPT-09 html scaffold has required anchors', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  for (const token of [
    'langBtn',
    'listPrice',
    'discountPct',
    'monthlySales',
    'summary',
    '/assets/analytics.js',
    './calculator.js',
    'Teachers Pay Teachers Fee Calculator'
  ]) {
    assert.ok(html.includes(token), token);
  }
});

test('TC-TPT-10 discovery exact-once wiring', () => {
  const root = path.join(__dirname, '..', '..');
  const slug = 'teachers-pay-teachers-fee-calculator';
  const url = `/tools/${slug}/`;
  const indexHtml = fs.readFileSync(path.join(root, 'tools', 'index.html'), 'utf8');
  const indexMd = fs.readFileSync(path.join(root, 'tools', 'index.md'), 'utf8');
  const toolsList = JSON.parse(fs.readFileSync(path.join(root, '_data', 'tools-list.json'), 'utf8'));
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'manifest.json'), 'utf8'));

  assert.equal((indexHtml.match(new RegExp(slug, 'g')) || []).length, 1, 'index.html exact-once');
  assert.equal((indexMd.match(new RegExp(slug, 'g')) || []).length, 1, 'index.md exact-once');
  assert.equal(toolsList.filter((entry) => entry.url === url).length, 1, 'tools-list exact-once');
  assert.equal(manifest.tools.filter((entry) => entry.slug === slug && entry.url === url).length, 1, 'manifest exact-once');
});
