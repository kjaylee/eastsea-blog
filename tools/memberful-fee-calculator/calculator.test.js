const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  calculate,
  DEFAULTS,
  PROCESSOR_PRESETS,
  MEMBERFUL_MONTHLY_FEE,
  MEMBERFUL_TRANSACTION_RATE,
  resolveProcessor,
  findRequiredGrossForNet
} = require('./calculator.js');

function approx(actual, expected, tolerance = 0.01) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} ≈ ${expected} (±${tolerance})`);
}

const baseInput = {
  monthlyGrossSales: 5000,
  successfulCharges: 120,
  refundRatePct: 3,
  processorPreset: 'domestic',
  customProcessorRatePct: 2.9,
  customProcessorFlatFee: 0.3,
  otherMonthlyCost: 600,
  desiredMonthlyNetProfit: 1000
};

test('exports required Memberful constants and presets', () => {
  assert.equal(DEFAULTS.monthlyGrossSales, 5000);
  assert.equal(MEMBERFUL_MONTHLY_FEE, 49);
  assert.equal(MEMBERFUL_TRANSACTION_RATE, 0.049);
  assert.equal(PROCESSOR_PRESETS.length, 3);
  assert.equal(resolveProcessor(baseInput).ratePct, 2.9);
  assert.equal(resolveProcessor({ ...baseInput, processorPreset: 'international' }).ratePct, 4.4);
  assert.equal(resolveProcessor({ ...baseInput, processorPreset: 'custom', customProcessorRatePct: 3.7, customProcessorFlatFee: 0.45 }).ratePct, 3.7);
});

test('TC-MF-01 baseline domestic scenario', () => {
  const { result, error } = calculate(baseInput, { lang: 'en' });

  assert.equal(error, '');
  approx(result.memberfulFixedFee, 49);
  approx(result.memberfulTransactionFees, 245);
  approx(result.processorFees, 181);
  approx(result.refundLoss, 150);
  approx(result.takeHomeAfterPlatform, 4375);
  approx(result.netProfit, 3775);
  approx(result.annualizedNetProfit, 45300);
  approx(result.averageChargeAmount, 41.67);
  approx(result.effectiveFeeRatePct, 9.5);
  approx(result.breakEvenGrossSales, 733.5);
  approx(result.requiredGrossForTargetNet, 1863.7);
  approx(result.targetGap, 0);
});

test('TC-MF-02 international preset increases fee drag', () => {
  const domestic = calculate(baseInput, { lang: 'en' }).result;
  const international = calculate({ ...baseInput, processorPreset: 'international' }, { lang: 'en' }).result;

  approx(international.processorFees, 256);
  approx(international.netProfit, 3700);
  assert.ok(international.processorFees > domestic.processorFees);
  assert.ok(international.effectiveFeeRatePct > domestic.effectiveFeeRatePct);
});

test('TC-MF-03 custom processor override works', () => {
  const { result, error } = calculate({
    ...baseInput,
    processorPreset: 'custom',
    customProcessorRatePct: 3.7,
    customProcessorFlatFee: 0.45
  }, { lang: 'en' });

  assert.equal(error, '');
  approx(result.processorFees, 239);
  approx(result.netProfit, 3717);
  approx(result.effectiveFeeRatePct, 10.66);
});

test('TC-MF-04 other fixed costs reduce profit dollar-for-dollar', () => {
  const baseline = calculate(baseInput, { lang: 'en' }).result;
  const higherCost = calculate({ ...baseInput, otherMonthlyCost: 850 }, { lang: 'en' }).result;

  approx(higherCost.netProfit, baseline.netProfit - 250);
});

test('TC-MF-05 target gross and gap behave correctly', () => {
  const { result, error } = calculate({ ...baseInput, desiredMonthlyNetProfit: 5000 }, { lang: 'en' });

  assert.equal(error, '');
  assert.ok(result.requiredGrossForTargetNet > baseInput.monthlyGrossSales);
  assert.ok(result.targetGap > 0);
  approx(result.requiredGrossForTargetNet, findRequiredGrossForNet(baseInput, 5000), 0.01);
});

test('TC-MF-06 validation rejects impossible inputs', () => {
  const invalidCases = [
    { ...baseInput, monthlyGrossSales: 0 },
    { ...baseInput, monthlyGrossSales: -1 },
    { ...baseInput, successfulCharges: 0 },
    { ...baseInput, refundRatePct: 100 },
    { ...baseInput, refundRatePct: -1 },
    { ...baseInput, processorPreset: 'missing' },
    { ...baseInput, processorPreset: 'custom', customProcessorRatePct: 100 },
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

test('TC-MF-07 break-even returns null when contribution margin is invalid', () => {
  const { result, error } = calculate({
    ...baseInput,
    processorPreset: 'custom',
    customProcessorRatePct: 97,
    customProcessorFlatFee: 0
  }, { lang: 'en' });

  assert.equal(error, '');
  assert.equal(result.breakEvenGrossSales, null);
  assert.equal(result.requiredGrossForTargetNet, null);
  assert.ok(result.netProfit < 0);
});

test('TC-MF-08 summary includes decision-ready fields', () => {
  const { result, error } = calculate(baseInput, { lang: 'en' });

  assert.equal(error, '');
  assert.match(result.summary, /Processor preset: Stripe domestic cards/);
  assert.match(result.summary, /Monthly gross sales: \$5,000\.00/);
  assert.match(result.summary, /Memberful monthly fee: \$49\.00/);
  assert.match(result.summary, /Memberful transaction fees: \$245\.00/);
  assert.match(result.summary, /Processor fees: \$181\.00/);
  assert.match(result.summary, /Refund loss: \$150\.00/);
  assert.match(result.summary, /Monthly net profit: \$3,775\.00/);
  assert.match(result.summary, /Break-even monthly gross sales: \$733\.50/);
});

test('TC-MF-09 comparison table covers all processor presets', () => {
  const { result, error } = calculate(baseInput, { lang: 'en' });

  assert.equal(error, '');
  assert.equal(result.comparisonRows.length, 3);
  assert.deepEqual(result.comparisonRows.map((row) => row.id), ['domestic', 'international', 'custom']);
});

test('TC-MF-10 HTML scaffold has required anchors', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

  for (const token of ['langBtn', 'processorPreset', 'customProcessorRatePct', 'summary', 'comparisonBody', 'script defer src="./calculator.js"', '/assets/analytics.js']) {
    assert.ok(html.includes(token), token);
  }
  assert.match(html, /Memberful Fee Calculator|멤버풀 수수료 계산기/);
});

test('TC-MF-11 discovery exact-once wiring', () => {
  const root = path.join(__dirname, '..', '..');
  const slug = 'memberful-fee-calculator';
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
