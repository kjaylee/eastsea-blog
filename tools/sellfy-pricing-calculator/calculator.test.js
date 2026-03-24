const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  calculate,
  DEFAULTS,
  PLANS,
  PROCESSORS,
  OVERAGE_RATE,
  getAnnualSubscriptionCost,
  findNextPlanBreakEvenSales
} = require('./calculator.js');

function approx(actual, expected, tolerance = 0.01) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} ≈ ${expected} (±${tolerance})`);
}

test('exports required Sellfy constants and presets', () => {
  assert.equal(OVERAGE_RATE, 0.02);
  assert.equal(PLANS.length, 3);
  assert.equal(PROCESSORS.length, 4);
  assert.equal(getAnnualSubscriptionCost(PLANS[0], 'annual'), 264);
  assert.equal(getAnnualSubscriptionCost(PLANS[1], 'monthly'), 948);
});

test('TC-SF-01 baseline Starter annual under cap', () => {
  const { result, error } = calculate(DEFAULTS, { lang: 'en' });

  assert.equal(error, '');
  approx(result.annualGrossSales, 8000);
  approx(result.subscriptionCost, 264);
  approx(result.processorFees, 292);
  approx(result.refundLoss, 400);
  approx(result.overageFee, 0);
  approx(result.takeHomeAfterPlatform, 7044);
  approx(result.netProfit, 6344);
  approx(result.monthlyNetProfit, 528.67);
  approx(result.averageOrderValue, 40);
  approx(result.breakEvenGrossSales, 1111.83);
  approx(result.nextPlanBreakEvenSales, 32200);
  assert.equal(result.recommendedPlanId, 'starter');
});

test('TC-SF-02 Starter annual overage triggers above cap', () => {
  const { result, error } = calculate({ ...DEFAULTS, annualGrossSales: 15000 }, { lang: 'en' });

  assert.equal(error, '');
  approx(result.processorFees, 495);
  approx(result.overageFee, 100);
  approx(result.takeHomeAfterPlatform, 13391);
  approx(result.netProfit, 12691);
  approx(result.capHeadroom, -5000);
  assert.equal(result.recommendedPlanId, 'starter');
});

test('TC-SF-03 recommendation switches to Business when overage dominates', () => {
  const { result, error } = calculate({ ...DEFAULTS, annualGrossSales: 45000 }, { lang: 'en' });

  assert.equal(error, '');
  assert.equal(result.recommendedPlanId, 'business');
  const starter = result.comparison.rows.find((row) => row.planId === 'starter');
  const business = result.comparison.rows.find((row) => row.planId === 'business');
  approx(starter.overageFee, 700);
  approx(starter.netProfit, 39721);
  approx(business.netProfit, 39977);
  assert.ok(business.netProfit > starter.netProfit);
});

test('TC-SF-04 monthly billing costs more than annual', () => {
  const annual = calculate(DEFAULTS, { lang: 'en' }).result;
  const monthly = calculate({ ...DEFAULTS, billingCycle: 'monthly' }, { lang: 'en' }).result;

  approx(annual.subscriptionCost, 264);
  approx(monthly.subscriptionCost, 348);
  assert.ok(monthly.netProfit < annual.netProfit);
  approx(monthly.breakEvenGrossSales, 1203.04);
  approx(monthly.nextPlanBreakEvenSales, 40000);
});

test('TC-SF-05 PayPal Intl increases processor drag', () => {
  const stripe = calculate(DEFAULTS, { lang: 'en' }).result;
  const intl = calculate({ ...DEFAULTS, processorId: 'paypal-intl', processorRatePct: 3.4, processorFlat: 0.3 }, { lang: 'en' }).result;

  approx(intl.processorFees, 332);
  approx(intl.netProfit, 6304);
  assert.ok(intl.processorFees > stripe.processorFees);
  assert.ok(intl.netProfit < stripe.netProfit);
});

test('TC-SF-06 custom processor override applies exact math', () => {
  const { result, error } = calculate({ ...DEFAULTS, processorId: 'custom', processorRatePct: 4.2, processorFlat: 0.45 }, { lang: 'en' });

  assert.equal(error, '');
  approx(result.processorPercentFee, 336);
  approx(result.processorFlatFee, 90);
  approx(result.processorFees, 426);
  approx(result.takeHomeAfterPlatform, 6910);
  approx(result.netProfit, 6210);
});

test('TC-SF-07 next-plan break-even revenue is correct', () => {
  approx(findNextPlanBreakEvenSales({ ...DEFAULTS, planId: 'starter', billingCycle: 'annual' }), 32200);
  approx(findNextPlanBreakEvenSales({ ...DEFAULTS, planId: 'business', billingCycle: 'annual' }), 86000);
  assert.equal(findNextPlanBreakEvenSales({ ...DEFAULTS, planId: 'premium', billingCycle: 'annual' }), null);
});

test('TC-SF-08 validation rejects impossible inputs', () => {
  const invalidCases = [
    { ...DEFAULTS, annualGrossSales: 0 },
    { ...DEFAULTS, annualGrossSales: -1 },
    { ...DEFAULTS, ordersPerYear: 0 },
    { ...DEFAULTS, refundRatePct: 100 },
    { ...DEFAULTS, planId: 'unknown' },
    { ...DEFAULTS, processorId: 'missing' },
    { ...DEFAULTS, processorId: 'custom', processorRatePct: 100 },
    { ...DEFAULTS, processorId: 'custom', processorFlat: -1 }
  ];

  invalidCases.forEach((input) => {
    const { result, error } = calculate(input, { lang: 'en' });
    assert.equal(result, null);
    assert.notEqual(error, '');
  });
});

test('TC-SF-09 premium becomes best above Business break-even', () => {
  const { result, error } = calculate({ ...DEFAULTS, annualGrossSales: 90000 }, { lang: 'en' });

  assert.equal(error, '');
  assert.equal(result.recommendedPlanId, 'premium');
  const business = result.comparison.rows.find((row) => row.planId === 'business');
  const premium = result.comparison.rows.find((row) => row.planId === 'premium');
  approx(business.overageFee, 800);
  approx(premium.overageFee, 0);
  approx(business.netProfit, 80622);
  approx(premium.netProfit, 80702);
  assert.ok(premium.netProfit > business.netProfit);
});

test('TC-SF-10 summary includes decision-ready metrics', () => {
  const { result, error } = calculate(DEFAULTS, { lang: 'en' });

  assert.equal(error, '');
  assert.match(result.summary, /Selected plan: Starter · Annual billing/);
  assert.match(result.summary, /Annual gross sales: \$8,000\.00/);
  assert.match(result.summary, /Sellfy subscription cost: \$264\.00/);
  assert.match(result.summary, /Processor fees: \$292\.00/);
  assert.match(result.summary, /Overage fee: \$0\.00/);
  assert.match(result.summary, /Take-home after platform costs: \$7,044\.00/);
  assert.match(result.summary, /Net profit: \$6,344\.00/);
  assert.match(result.summary, /Cost-based recommended plan: Starter/);
});

test('TC-SF-11 HTML scaffold has required anchors', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

  for (const token of ['langBtn', 'planId', 'billingCycle', 'processorId', 'summary', 'script defer src="./calculator.js"', '/assets/analytics.js']) {
    assert.ok(html.includes(token), token);
  }
  assert.match(html, /Sellfy Pricing Calculator|셀피 요금제 수익 계산기/);
});

test('TC-SF-12 discovery exact-once wiring', () => {
  const root = path.join(__dirname, '..', '..');
  const slug = 'sellfy-pricing-calculator';
  const url = `/tools/${slug}/`;

  const indexHtml = fs.readFileSync(path.join(root, 'tools', 'index.html'), 'utf8');
  const indexMd = fs.readFileSync(path.join(root, 'tools', 'index.md'), 'utf8');
  const toolsList = JSON.parse(fs.readFileSync(path.join(root, '_data', 'tools-list.json'), 'utf8'));
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'manifest.json'), 'utf8'));
  const toolEntries = fs.readdirSync(path.join(root, 'tools'), { withFileTypes: true }).filter((entry) => entry.isDirectory() && entry.name === slug);

  assert.equal((indexHtml.match(new RegExp(slug, 'g')) || []).length, 1, 'index.html exact-once');
  assert.equal((indexMd.match(new RegExp(slug, 'g')) || []).length, 1, 'index.md exact-once');
  assert.equal(toolsList.filter((entry) => entry.url === url).length, 1, 'tools-list exact-once');
  assert.equal(manifest.tools.filter((entry) => entry.slug === slug && entry.url === url).length, 1, 'manifest exact-once');
  assert.equal(toolEntries.length, 1, 'tool directory exact-once');
});
