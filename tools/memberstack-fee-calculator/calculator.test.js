const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  YEARLY_DISCOUNT,
  PLANS,
  PROCESSOR_PRESETS,
  DEFAULTS,
  getPlan,
  getPlanMonthlyFee,
  resolveProcessor,
  getContributionDenominator,
  buildUpgradeThresholds,
  calculate
} = require('./calculator.js');

function approx(actual, expected, tolerance = 0.01) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} ≈ ${expected} (±${tolerance})`);
}

const baseInput = { ...DEFAULTS };

test('exports Memberstack plan constants and processor presets', () => {
  assert.equal(YEARLY_DISCOUNT, 0.2);
  assert.equal(PLANS.length, 4);
  assert.equal(PROCESSOR_PRESETS.length, 2);
  assert.equal(getPlan('basic').monthlyFee, 29);
  assert.equal(getPlan('business').transactionRatePct, 0.9);
  assert.equal(getPlanMonthlyFee(getPlan('professional'), 'yearly'), 39.2);
  assert.equal(resolveProcessor(baseInput).ratePct, 2.9);
});

test('TC-MS-01 baseline monthly Professional + Stripe scenario', () => {
  const { result, error } = calculate(baseInput, { lang: 'en' });

  assert.equal(error, '');
  approx(result.fixedFee, 49);
  approx(result.variableFee, 120);
  approx(result.processorFees, 219);
  approx(result.refundLoss, 120);
  approx(result.takeHomeAfterPlatform, 5492);
  approx(result.netProfit, 5092);
  approx(result.annualizedNetProfit, 61104);
  approx(result.averageChargeAmount, 40);
  approx(result.effectiveFeeRatePct, 6.47);
  approx(result.breakEvenGrossSales, 486.19);
  approx(result.requiredGrossForTargetNet, 3734.70);
  assert.equal(result.recommendedPlan.id, 'business');
});

test('TC-MS-02 yearly billing lowers fixed fee and upgrade thresholds', () => {
  const monthly = calculate(baseInput, { lang: 'en' }).result;
  const yearly = calculate({ ...baseInput, billingMode: 'yearly' }, { lang: 'en' }).result;

  approx(yearly.fixedFee, 39.2);
  assert.ok(yearly.fixedFee < monthly.fixedFee);
  assert.ok(yearly.netProfit > monthly.netProfit);
  approx(yearly.breakEvenGrossSales, 475.58);
  approx(yearly.upgradeThresholds[0].grossSales, 800);
  approx(yearly.upgradeThresholds[1].grossSales, 3636.36);
});

test('TC-MS-03 custom processor override increases fee drag', () => {
  const stripe = calculate(baseInput, { lang: 'en' }).result;
  const custom = calculate({
    ...baseInput,
    processorPreset: 'custom',
    customProcessorRatePct: 4.1,
    customProcessorFlatFee: 0.6
  }, { lang: 'en' }).result;

  assert.ok(custom.processorFees > stripe.processorFees);
  assert.ok(custom.requiredGrossForTargetNet > stripe.requiredGrossForTargetNet);
  approx(custom.processorFees, 336);
  approx(custom.netProfit, 4975);
  approx(custom.requiredGrossForTargetNet, 3815.27);
});

test('TC-MS-04 recommendation never selects over-cap Basic plan', () => {
  const { result, error } = calculate({
    ...baseInput,
    activeMembers: 1800,
    monthlyGrossSales: 800,
    successfulCharges: 40
  }, { lang: 'en' });

  assert.equal(error, '');
  const comparisonMap = Object.fromEntries(result.comparisonRows.map((row) => [row.id, row]));
  assert.equal(comparisonMap.basic.eligible, false);
  assert.ok(comparisonMap.basic.netProfit > comparisonMap.professional.netProfit);
  assert.equal(result.recommendedPlan.id, 'professional');
});

test('TC-MS-05 comparison rows expose member-cap eligibility and headroom', () => {
  const members800 = calculate({ ...baseInput, activeMembers: 800 }, { lang: 'en' }).result;
  const members3000 = calculate({ ...baseInput, activeMembers: 3000 }, { lang: 'en' }).result;
  const members8000 = calculate({ ...baseInput, activeMembers: 8000 }, { lang: 'en' }).result;
  const members12000 = calculate({ ...baseInput, activeMembers: 12000 }, { lang: 'en' }).result;

  const map800 = Object.fromEntries(members800.comparisonRows.map((row) => [row.id, row]));
  const map3000 = Object.fromEntries(members3000.comparisonRows.map((row) => [row.id, row]));
  const map8000 = Object.fromEntries(members8000.comparisonRows.map((row) => [row.id, row]));
  const map12000 = Object.fromEntries(members12000.comparisonRows.map((row) => [row.id, row]));

  assert.equal(map800.basic.eligible, true);
  assert.equal(map800.basic.headroomMembers, 200);
  assert.equal(map3000.basic.eligible, false);
  assert.equal(map3000.professional.eligible, true);
  assert.equal(map3000.professional.headroomMembers, 2000);
  assert.equal(map8000.professional.eligible, false);
  assert.equal(map8000.business.eligible, true);
  assert.equal(map12000.business.eligible, true);
  assert.equal(map12000.established.eligible, true);
  assert.equal(map12000.basic.overByMembers, 11000);
});

test('TC-MS-06 adjacent upgrade thresholds match public fee deltas', () => {
  const rows = buildUpgradeThresholds('monthly', 'en');
  assert.deepEqual(rows.map((row) => row.id), ['basic-to-professional', 'professional-to-business', 'business-to-established']);
  approx(rows[0].grossSales, 1000);
  approx(rows[1].grossSales, 4545.45);
  approx(rows[2].grossSales, 44444.44);
});

test('TC-MS-07 validation rejects invalid inputs', () => {
  const invalidCases = [
    { ...baseInput, billingMode: 'weekly' },
    { ...baseInput, activeMembers: 0 },
    { ...baseInput, monthlyGrossSales: 0 },
    { ...baseInput, successfulCharges: 0 },
    { ...baseInput, planId: 'missing' },
    { ...baseInput, refundRatePct: 100 },
    { ...baseInput, processorPreset: 'missing' },
    { ...baseInput, customProcessorRatePct: 100 },
    { ...baseInput, customProcessorFlatFee: -0.01 },
    { ...baseInput, otherMonthlyCost: -1 },
    { ...baseInput, desiredMonthlyNetProfit: -1 }
  ];

  invalidCases.forEach((input) => {
    const { result, error } = calculate(input, { lang: 'en' });
    assert.equal(result, null);
    assert.notEqual(error, '');
  });
});

test('TC-MS-08 break-even returns null when contribution denominator is not positive', () => {
  const input = {
    ...baseInput,
    planId: 'established',
    processorPreset: 'custom',
    customProcessorRatePct: 99,
    customProcessorFlatFee: 1
  };
  const { result, error } = calculate(input, { lang: 'en' });

  assert.equal(error, '');
  approx(getContributionDenominator(getPlan('established'), resolveProcessor(input), input), -0.035, 0.000001);
  assert.equal(result.breakEvenGrossSales, null);
  assert.equal(result.requiredGrossForTargetNet, null);
});

test('TC-MS-09 summary includes decision-ready fields', () => {
  const { result, error } = calculate(baseInput, { lang: 'en' });

  assert.equal(error, '');
  assert.match(result.summary, /\[Memberstack Fee Calculator Summary\]/);
  assert.match(result.summary, /Billing mode: Monthly/);
  assert.match(result.summary, /Current plan: Professional/);
  assert.match(result.summary, /Monthly gross sales: \$6,000\.00/);
  assert.match(result.summary, /Memberstack transaction fees: \$120\.00/);
  assert.match(result.summary, /Recommended plan: Business/);
  assert.match(result.summary, /Basic → Professional: \$1,000\.00/);
});

test('TC-MS-10 HTML scaffold has required anchors and SEO copy', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

  for (const token of ['langBtn', 'summary', 'comparisonBody', 'thresholdBody', 'script defer src="./calculator.js"', '/assets/analytics.js']) {
    assert.ok(html.includes(token), token);
  }

  assert.match(html, /Memberstack Fee Calculator/);
  assert.match(html, /Basic \$29 \/ 4%/);
  assert.match(html, /Professional \$49 \/ 2%/);
  assert.match(html, /Business \$99 \/ 0\.9%/);
  assert.match(html, /Established \$499 \/ 0%/);
  assert.match(html, /Yearly 20% OFF/);
  assert.match(html, /Stripe domestic 2\.9% \+ \$0\.30/);
});

test('TC-MS-11 discovery exact-once wiring', () => {
  const root = path.join(__dirname, '..', '..');
  const slug = 'memberstack-fee-calculator';
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
