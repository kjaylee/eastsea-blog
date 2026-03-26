const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  PLAN_OPTIONS,
  PROCESSOR_PRESETS,
  DEFAULTS,
  CREATOR_ANNUAL_SAVINGS,
  CREATOR_PRO_ANNUAL_SAVINGS,
  calculate,
  resolveProcessor,
  findRequiredPrice,
  findRequiredOrders
} = require('./calculator.js');

function approx(actual, expected, tolerance = 0.01) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} ≈ ${expected} (±${tolerance})`);
}

const baseInput = {
  selectedPlanId: 'creator-monthly',
  averageOrderValue: 75,
  monthlyOrders: 40,
  refundRatePct: 3,
  processorPreset: 'stripe-standard',
  internationalSharePct: 10,
  recurringSharePct: 20,
  customProcessorRatePct: 2.9,
  customProcessorFlatFee: 0.3,
  customInternationalFeePct: 1.5,
  customRecurringFeePct: 0.5,
  otherMonthlyCost: 250,
  desiredMonthlyNetProfit: 2000
};

test('exports Stan plan and processor constants', () => {
  assert.equal(DEFAULTS.selectedPlanId, 'creator-monthly');
  assert.equal(PLAN_OPTIONS.length, 4);
  assert.equal(PROCESSOR_PRESETS.length, 5);
  assert.equal(CREATOR_ANNUAL_SAVINGS, 48);
  assert.equal(CREATOR_PRO_ANNUAL_SAVINGS, 240);
});

test('TC-STAN-01 baseline Creator monthly + Stripe standard', () => {
  const { result, error } = calculate(baseInput);

  assert.equal(error, '');
  approx(result.processor.effectiveRatePct, 3.15, 0.0001);
  approx(result.selectedScenario.grossSales, 3000);
  approx(result.selectedScenario.refundLoss, 90);
  approx(result.selectedScenario.processorVariableFees, 94.5);
  approx(result.selectedScenario.processorFixedFees, 12);
  approx(result.selectedScenario.totalProcessorFees, 106.5);
  approx(result.selectedScenario.planMonthlyFee, 29);
  approx(result.selectedScenario.monthlyNetProfit, 2524.5);
  approx(result.selectedScenario.netProfitPerOrder, 63.11);
  approx(result.selectedScenario.breakEvenPrice, 7.75);
  approx(result.selectedScenario.requiredPriceForTargetNet, 61.03);
  approx(result.selectedScenario.breakEvenOrders, 3.98);
  approx(result.selectedScenario.requiredOrdersForTargetNet, 32.52);
  approx(result.creatorProMonthlyLift.extraGrossNeeded, 74.91);
  approx(result.creatorProAnnualLift.extraGrossNeeded, 57.78);
  assert.equal(result.bestPlan.planId, 'creator-annual');
});

test('TC-STAN-02 annual Creator beats monthly Creator by plan delta', () => {
  const { result } = calculate(baseInput);
  const monthly = result.comparisonRows.find((row) => row.planId === 'creator-monthly');
  const annual = result.comparisonRows.find((row) => row.planId === 'creator-annual');

  approx(annual.monthlyNetProfit - monthly.monthlyNetProfit, 4);
});

test('TC-STAN-03 Creator Pro monthly payback requirement', () => {
  const { result } = calculate(baseInput);

  approx(result.creatorProMonthlyLift.feeGap, 70);
  approx(result.creatorProMonthlyLift.extraOrdersNeeded, 1);
  approx(result.creatorProMonthlyLift.extraGrossNeeded, 74.91);
});

test('TC-STAN-04 Afterpay drag exceeds Stripe standard', () => {
  const standard = calculate(baseInput).result;
  const afterpay = calculate({ ...baseInput, processorPreset: 'stripe-afterpay' }).result;

  assert.ok(afterpay.selectedScenario.totalProcessorFees > standard.selectedScenario.totalProcessorFees);
  assert.ok(afterpay.selectedScenario.monthlyNetProfit < standard.selectedScenario.monthlyNetProfit);
  approx(afterpay.processor.effectiveRatePct, 6.15, 0.0001);
});

test('TC-STAN-05 custom processor override flows through totals', () => {
  const { result, error } = calculate({
    ...baseInput,
    processorPreset: 'custom',
    customProcessorRatePct: 4.2,
    customProcessorFlatFee: 0.45,
    customInternationalFeePct: 2,
    customRecurringFeePct: 0.8
  });

  assert.equal(error, '');
  approx(result.processor.effectiveRatePct, 4.56, 0.0001);
  approx(result.selectedScenario.processorVariableFees, 136.8);
  approx(result.selectedScenario.processorFixedFees, 18);
  approx(result.selectedScenario.monthlyNetProfit, 2476.2);
});

test('TC-STAN-06 invalid inputs are rejected', () => {
  const invalidCases = [
    { ...baseInput, selectedPlanId: 'missing' },
    { ...baseInput, averageOrderValue: 0 },
    { ...baseInput, monthlyOrders: 0 },
    { ...baseInput, monthlyOrders: 3.4 },
    { ...baseInput, refundRatePct: 100 },
    { ...baseInput, processorPreset: 'nope' },
    { ...baseInput, internationalSharePct: 101 },
    { ...baseInput, recurringSharePct: -1 },
    { ...baseInput, customProcessorRatePct: 100 },
    { ...baseInput, customProcessorFlatFee: -0.1 },
    { ...baseInput, otherMonthlyCost: -1 },
    { ...baseInput, desiredMonthlyNetProfit: -1 }
  ];

  invalidCases.forEach((entry) => {
    const { result, error } = calculate(entry);
    assert.equal(result, null);
    assert.notEqual(error, '');
  });
});

test('TC-STAN-07 reverse outputs return null when contribution margin is invalid', () => {
  const extreme = {
    ...baseInput,
    processorPreset: 'custom',
    customProcessorRatePct: 97,
    customProcessorFlatFee: 3,
    customInternationalFeePct: 0,
    customRecurringFeePct: 0
  };

  const { result, error } = calculate(extreme);

  assert.equal(error, '');
  assert.equal(result.selectedScenario.breakEvenPrice, null);
  assert.equal(result.selectedScenario.requiredPriceForTargetNet, null);
  assert.equal(result.selectedScenario.breakEvenOrders, null);
  assert.equal(result.selectedScenario.requiredOrdersForTargetNet, null);
  assert.ok(result.selectedScenario.monthlyNetProfit < 0);
});

test('TC-STAN-08 summary includes decision-ready lines', () => {
  const { result, error } = calculate(baseInput);

  assert.equal(error, '');
  assert.match(result.summary, /Selected plan: Creator monthly/);
  assert.match(result.summary, /Processor preset: Stripe standard/);
  assert.match(result.summary, /Monthly net profit: \$2,524\.50/);
  assert.match(result.summary, /Best plan under current assumptions: Creator annual/);
  assert.match(result.summary, /Required price for target net: \$61\.03/);
  assert.match(result.summary, /Creator Pro monthly uplift needed: \$74\.91/);
});

test('TC-STAN-09 helper functions stay deterministic', () => {
  const processor = resolveProcessor(baseInput);
  const plan = PLAN_OPTIONS.find((item) => item.id === 'creator-monthly');

  approx(findRequiredPrice(baseInput, 0, plan, processor), 7.751731, 0.0001);
  approx(findRequiredOrders(baseInput, 2000, plan, processor), 32.516497, 0.0001);
});

test('TC-STAN-10 HTML scaffold has required anchors', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  for (const token of ['calculatorForm', 'selectedPlanId', 'processorPreset', 'comparisonBody', 'summary', 'copySummaryBtn', 'script defer src="./calculator.js"', '/assets/analytics.js']) {
    assert.ok(html.includes(token), token);
  }
  assert.match(html, /Stan Store Fee Calculator|스탠 스토어 수수료 계산기/);
});

test('TC-STAN-11 exact-once discovery wiring', () => {
  const root = path.join(__dirname, '..', '..');
  const slug = 'stan-store-fee-calculator';
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
