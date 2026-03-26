const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  calculate,
  DEFAULTS,
  PROCESSOR_PRESETS,
  resolveProcessor,
  findRequiredGross
} = require('./calculator.js');

function approx(actual, expected, tolerance = 0.01) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} ≈ ${expected} (±${tolerance})`);
}

const baseInput = {
  monthlyGrossSales: 4900,
  successfulCharges: 100,
  refundRatePct: 2,
  launchPassMonthlyFee: 29,
  launchPassTransactionRatePct: 3.5,
  processorPreset: 'domestic',
  customProcessorRatePct: 3.7,
  customProcessorFlatFee: 0.45,
  otherMonthlyCost: 120,
  desiredMonthlyNetProfit: 4000,
  currency: 'USD'
};

test('exports expected LaunchPass defaults and presets', () => {
  assert.equal(DEFAULTS.monthlyGrossSales, 4900);
  assert.equal(DEFAULTS.launchPassMonthlyFee, 29);
  assert.equal(DEFAULTS.launchPassTransactionRatePct, 3.5);
  assert.equal(PROCESSOR_PRESETS.length, 3);
  assert.equal(resolveProcessor(baseInput).ratePct, 2.9);
  assert.equal(resolveProcessor({ ...baseInput, processorPreset: 'international' }).ratePct, 4.4);
  assert.equal(resolveProcessor({ ...baseInput, processorPreset: 'custom', customProcessorRatePct: 3.7, customProcessorFlatFee: 0.45 }).flatFee, 0.45);
});

test('TC-LP-01 golden default scenario', () => {
  const { result, error } = calculate(baseInput, { lang: 'en' });

  assert.equal(error, '');
  approx(result.averageChargeAmount, 49);
  approx(result.refundLoss, 98);
  approx(result.launchPassMonthlyFee, 29);
  approx(result.launchPassTransactionFees, 171.5);
  approx(result.processorFees, 172.1);
  approx(result.feeDragTotal, 470.6);
  approx(result.takeHomeAfterPlatform, 4429.4);
  approx(result.monthlyNetProfit, 4309.4);
  approx(result.annualizedNetProfit, 51712.8);
  approx(result.effectiveFeeRatePct, 9.6);
  approx(result.netMarginPct, 87.95);
  approx(result.breakEvenGrossSales, 163.76);
  approx(result.breakEvenSuccessfulCharges, 3.34);
  approx(result.requiredGrossForTargetNet, 4559.95);
  approx(result.requiredSuccessfulChargesForTargetNet, 93.06);
  approx(result.targetGapGross, 0);
  approx(result.targetGrossBuffer, 340.05);
});

test('TC-LP-02 higher refund rate lowers profit and worsens fee drag', () => {
  const base = calculate(baseInput, { lang: 'en' }).result;
  const higherRefund = calculate({ ...baseInput, refundRatePct: 8 }, { lang: 'en' }).result;

  assert.ok(higherRefund.monthlyNetProfit < base.monthlyNetProfit);
  assert.ok(higherRefund.effectiveFeeRatePct > base.effectiveFeeRatePct);
  approx(higherRefund.refundLoss, 392);
});

test('TC-LP-03 international preset increases processor drag', () => {
  const domestic = calculate(baseInput, { lang: 'en' }).result;
  const international = calculate({ ...baseInput, processorPreset: 'international' }, { lang: 'en' }).result;

  approx(international.processorFees, 245.6);
  approx(international.monthlyNetProfit, 4235.9);
  assert.ok(international.processorFees > domestic.processorFees);
  assert.ok(international.monthlyNetProfit < domestic.monthlyNetProfit);
});

test('TC-LP-04 custom processor override flows through math', () => {
  const { result, error } = calculate({
    ...baseInput,
    processorPreset: 'custom',
    customProcessorRatePct: 3.7,
    customProcessorFlatFee: 0.45
  }, { lang: 'en' });

  assert.equal(error, '');
  approx(result.processorFees, 226.3);
  approx(result.monthlyNetProfit, 4255.2);
  approx(result.requiredGrossForTargetNet, 4616.07);
});

test('TC-LP-05 impossible economics return null break-even outputs', () => {
  const { result, error } = calculate({
    ...baseInput,
    processorPreset: 'custom',
    customProcessorRatePct: 95,
    customProcessorFlatFee: 1
  }, { lang: 'en' });

  assert.equal(error, '');
  assert.equal(result.breakEvenGrossSales, null);
  assert.equal(result.breakEvenSuccessfulCharges, null);
  assert.equal(result.requiredGrossForTargetNet, null);
  assert.equal(result.requiredSuccessfulChargesForTargetNet, null);
  assert.ok(result.monthlyNetProfit < 0);
});

test('TC-LP-06 invalid inputs are rejected', () => {
  const invalidCases = [
    { ...baseInput, monthlyGrossSales: 0 },
    { ...baseInput, monthlyGrossSales: -1 },
    { ...baseInput, successfulCharges: 0 },
    { ...baseInput, successfulCharges: 1.5 },
    { ...baseInput, refundRatePct: 100 },
    { ...baseInput, launchPassMonthlyFee: -1 },
    { ...baseInput, launchPassTransactionRatePct: 100 },
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

test('TC-LP-07 target gross helper matches calculator output', () => {
  const { result, error } = calculate(baseInput, { lang: 'en' });

  assert.equal(error, '');
  approx(result.requiredGrossForTargetNet, findRequiredGross(baseInput, 4000), 0.01);
});

test('TC-LP-08 summary contains decision-ready fields', () => {
  const { result, error } = calculate(baseInput, { lang: 'en' });

  assert.equal(error, '');
  assert.match(result.summary, /Monthly gross sales: \$4,900\.00/);
  assert.match(result.summary, /Successful charges: 100/);
  assert.match(result.summary, /Average charge amount: \$49\.00/);
  assert.match(result.summary, /LaunchPass monthly fee: \$29\.00/);
  assert.match(result.summary, /LaunchPass transaction fees: \$171\.50/);
  assert.match(result.summary, /Stripe processing fees: \$172\.10/);
  assert.match(result.summary, /Monthly net profit: \$4,309\.40/);
  assert.match(result.summary, /Required monthly gross for target net: \$4,559\.95/);
});

test('TC-LP-09 HTML scaffold contains required anchors', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

  for (const token of [
    'langBtn',
    'monthlyGrossSales',
    'successfulCharges',
    'launchPassTransactionRatePct',
    'processorPreset',
    'comparisonBody',
    'summary',
    'script defer src="./calculator.js"',
    '/assets/analytics.js'
  ]) {
    assert.ok(html.includes(token), token);
  }

  assert.match(html, /LaunchPass Fee Calculator|LaunchPass 수수료 계산기/);
});

test('TC-LP-10 discovery exact-once wiring', () => {
  const root = path.join(__dirname, '..', '..');
  const slug = 'launchpass-fee-calculator';
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
