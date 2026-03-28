const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  calculate,
  DEFAULTS,
  GHOST_PLANS,
  CONSTANTS,
  buildPlanRows,
  evaluateScenario
} = require('./calculator.js');

function approx(actual, expected, tolerance = 0.01) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} ≈ ${expected} (±${tolerance})`);
}

const baseline = {
  paidSubscribers: 1000,
  monthlyPrice: 5,
  monthlyChargeEvents: 1000,
  refundRatePct: 2,
  ghostPlan: 'publisher',
  processorRatePct: 2.9,
  processorFixedFee: 0.30,
  includeRecurringFee: true,
  substackRecurringFeePct: 0.7,
  targetAnnualSavings: 6000
};

test('exports expected presets and defaults', () => {
  assert.equal(DEFAULTS.paidSubscribers, 1000);
  assert.equal(GHOST_PLANS.starter.fee, 18);
  assert.equal(GHOST_PLANS.publisher.fee, 29);
  assert.equal(GHOST_PLANS.business.fee, 199);
  assert.equal(CONSTANTS.GHOST_TRANSACTION_FEE_PCT, 0);
  assert.equal(CONSTANTS.SUBSTACK_PLATFORM_FEE_PCT, 10);
});

test('TC-GS-01 baseline Publisher scenario matches expected math', () => {
  const { result, error } = calculate(baseline);

  assert.equal(error, '');
  approx(result.grossMonthlyRevenue, 5000);
  approx(result.refundLoss, 100);
  approx(result.processorFees, 445);
  approx(result.substackPlatformFee, 500);
  approx(result.substackRecurringFee, 35);
  approx(result.ghostPlanCost, 29);
  approx(result.ghostMonthlyNet, 4426);
  approx(result.substackMonthlyNet, 3920);
  approx(result.monthlySavingsWithGhost, 506);
  approx(result.annualSavingsWithGhost, 6072);
  approx(result.breakEvenSubscribers, 54.21);
  approx(result.requiredSubscribersForTargetAnnualSavings, 988.79);
});

test('TC-GS-02 Ghost wins more as subscriber count increases', () => {
  const low = calculate({ ...baseline, paidSubscribers: 100 }).result;
  const high = calculate({ ...baseline, paidSubscribers: 2000, monthlyChargeEvents: 2000 }).result;

  assert.ok(high.monthlySavingsWithGhost > low.monthlySavingsWithGhost);
  assert.ok(high.annualSavingsWithGhost > low.annualSavingsWithGhost);
});

test('TC-GS-03 Business plan has higher break-even than Starter and Publisher', () => {
  const starter = evaluateScenario(baseline, 'starter');
  const publisher = evaluateScenario(baseline, 'publisher');
  const business = evaluateScenario(baseline, 'business');

  assert.ok(starter.breakEvenSubscribers < publisher.breakEvenSubscribers);
  assert.ok(publisher.breakEvenSubscribers < business.breakEvenSubscribers);
});

test('TC-GS-04 recurring fee toggle increases Substack drag and lowers break-even', () => {
  const recurringOn = calculate({ ...baseline, includeRecurringFee: true }).result;
  const recurringOff = calculate({ ...baseline, includeRecurringFee: false }).result;

  approx(recurringOn.substackRecurringFee, 35);
  approx(recurringOff.substackRecurringFee, 0);
  assert.ok(recurringOn.monthlySavingsWithGhost > recurringOff.monthlySavingsWithGhost);
  assert.ok(recurringOn.breakEvenSubscribers < recurringOff.breakEvenSubscribers);
  approx(recurringOff.breakEvenSubscribers, 58);
});

test('TC-GS-05 target annual savings subscriber requirement is above break-even', () => {
  const { result, error } = calculate(baseline);

  assert.equal(error, '');
  assert.ok(result.requiredSubscribersForTargetAnnualSavings > result.breakEvenSubscribers);
});

test('TC-GS-06 invalid inputs are rejected', () => {
  const invalidCases = [
    { ...baseline, paidSubscribers: 0 },
    { ...baseline, monthlyPrice: 0 },
    { ...baseline, monthlyChargeEvents: 0 },
    { ...baseline, refundRatePct: 100 },
    { ...baseline, ghostPlan: 'creator' },
    { ...baseline, processorRatePct: -1 },
    { ...baseline, processorFixedFee: -0.01 },
    { ...baseline, substackRecurringFeePct: -1 },
    { ...baseline, targetAnnualSavings: -1 }
  ];

  invalidCases.forEach((input) => {
    const { result, error } = calculate(input);
    assert.equal(result, null);
    assert.notEqual(error, '');
  });
});

test('TC-GS-07 HTML scaffold contains required anchors', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

  for (const token of [
    'paidSubscribers',
    'monthlyPrice',
    'monthlyChargeEvents',
    'ghostPlan',
    'includeRecurringFee',
    'targetAnnualSavings',
    'planRows',
    'summary',
    'script defer src="./calculator.js"',
    '/assets/analytics.js'
  ]) {
    assert.ok(html.includes(token), token);
  }

  assert.match(html, /Ghost vs Substack Profit Calculator|고스트 vs 서브스택 수익 비교 계산기/);
});

test('TC-GS-08 summary includes key decision fields', () => {
  const { result, error } = calculate(baseline);

  assert.equal(error, '');
  assert.match(result.summary, /Ghost transaction fee: 0\.00%/);
  assert.match(result.summary, /Substack platform fee: 10\.00%/);
  assert.match(result.summary, /Ghost monthly net: \$4,426\.00/);
  assert.match(result.summary, /Substack monthly net: \$3,920\.00/);
  assert.match(result.summary, /Annual savings with Ghost: \$6,072\.00/);
});

test('TC-GS-09 plan comparison returns exactly three Ghost plan rows', () => {
  const rows = buildPlanRows(baseline);

  assert.equal(rows.length, 3);
  assert.deepEqual(rows.map((row) => row.planId), ['starter', 'publisher', 'business']);
});

test('TC-GS-10 discovery exact-once wiring', () => {
  const root = path.join(__dirname, '..', '..');
  const slug = 'ghost-vs-substack-profit-calculator';
  const url = `/tools/${slug}/`;

  const indexHtml = fs.readFileSync(path.join(root, 'tools', 'index.html'), 'utf8');
  const indexMd = fs.readFileSync(path.join(root, 'tools', 'index.md'), 'utf8');
  const toolsList = JSON.parse(fs.readFileSync(path.join(root, '_data', 'tools-list.json'), 'utf8'));
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'manifest.json'), 'utf8'));

  assert.equal((indexHtml.match(new RegExp(slug, 'g')) || []).length, 1, 'index.html exact-once');
  assert.equal((indexMd.match(new RegExp(slug, 'g')) || []).length, 1, 'index.md exact-once');
  assert.equal(toolsList.filter((entry) => (entry.url || `/tools/${entry.slug}/`) === url).length, 1, 'tools-list exact-once');
  assert.equal(manifest.tools.filter((entry) => entry.slug === slug && entry.url === url).length, 1, 'manifest exact-once');
});
