const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  calculate,
  DEFAULTS,
  PLAN_PRESETS,
  CONSTANTS,
  resolvePlanMonthlyFee,
  resolveTransactionRatePct,
  findRequiredMembers,
  findUpgradeBreakEvenGross
} = require('./calculator.js');

function approx(actual, expected, tolerance = 0.01) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} ≈ ${expected} (±${tolerance})`);
}

const baseline = {
  subscriptionPrice: 99,
  billedMembers: 80,
  refundRatePct: 2,
  planTier: 'pro',
  planBilling: 'monthly',
  otherMonthlyCost: 500,
  desiredMonthlyNetProfit: 5000
};

test('exports expected defaults and constants', () => {
  assert.equal(DEFAULTS.subscriptionPrice, 99);
  assert.equal(PLAN_PRESETS.hobby.monthlyFee, 9);
  assert.equal(PLAN_PRESETS.pro.monthlyFee, 99);
  assert.equal(CONSTANTS.HIGH_TICKET_THRESHOLD, 900);
  assert.equal(CONSTANTS.FLAT_FEE, 0.3);
});

test('TC-SK-01 baseline Pro scenario', () => {
  const { result, error } = calculate(baseline);

  assert.equal(error, '');
  approx(result.monthlyGrossSales, 7920);
  approx(result.planFixedFee, 99);
  approx(result.skoolTransactionFees, 253.68);
  approx(result.refundLoss, 158.4);
  approx(result.takeHomeAfterSkool, 7408.92);
  approx(result.monthlyNetProfit, 6908.92);
  approx(result.annualizedNetProfit, 82907.04);
  approx(result.effectiveSkoolFeeRatePct, 4.45);
  approx(result.breakEvenMembers, 6.38);
  approx(result.requiredMembersForTargetNet, 59.66);
  approx(result.targetGapMembers, 0);
  approx(result.upgradeBreakEvenGross, 1267.61);
  approx(result.upgradeBreakEvenMembers, 12.8);
  assert.equal(result.recommendedPlanId, 'pro');
});

test('TC-SK-02 Hobby scenario is worse above threshold', () => {
  const pro = calculate(baseline).result;
  const hobby = calculate({ ...baseline, planTier: 'hobby' }).result;

  approx(hobby.planFixedFee, 9);
  approx(hobby.skoolTransactionFees, 816);
  approx(hobby.monthlyNetProfit, 6436.6);
  assert.ok(pro.monthlyNetProfit > hobby.monthlyNetProfit);
});

test('TC-SK-03 low-gross scenario recommends Hobby', () => {
  const { result, error } = calculate({
    ...baseline,
    subscriptionPrice: 29,
    billedMembers: 20,
    planTier: 'hobby',
    otherMonthlyCost: 100,
    desiredMonthlyNetProfit: 500
  });

  assert.equal(error, '');
  assert.equal(result.recommendedPlanId, 'hobby');
  assert.ok(result.upgradeBreakEvenGross > result.monthlyGrossSales);
});

test('TC-SK-04 Pro high-ticket rate applies at $900+', () => {
  const { result, error } = calculate({
    ...baseline,
    subscriptionPrice: 999,
    billedMembers: 4,
    refundRatePct: 0,
    otherMonthlyCost: 0,
    desiredMonthlyNetProfit: 0
  });

  assert.equal(error, '');
  approx(resolveTransactionRatePct({ ...baseline, subscriptionPrice: 999 }, 'pro'), 3.9);
  approx(result.transactionRatePct, 3.9);
  approx(result.skoolTransactionFees, 157.04);
  approx(result.takeHomeAfterSkool, 3739.96);
  approx(result.upgradeBreakEvenGross, 1475.41);
});

test('TC-SK-05 annual billing lowers fixed-fee drag', () => {
  const monthly = calculate(baseline).result;
  const annual = calculate({ ...baseline, planBilling: 'annual' }).result;

  approx(resolvePlanMonthlyFee({ ...baseline, planBilling: 'annual' }, 'pro'), 82.5);
  approx(resolvePlanMonthlyFee({ ...baseline, planBilling: 'annual' }, 'hobby'), 7.5);
  assert.ok(annual.planFixedFee < monthly.planFixedFee);
  assert.ok(annual.monthlyNetProfit > monthly.monthlyNetProfit);
});

test('TC-SK-06 break-even and target members return null when contribution <= 0', () => {
  const { result, error } = calculate({
    ...baseline,
    subscriptionPrice: 1,
    billedMembers: 20,
    refundRatePct: 95,
    planTier: 'hobby',
    otherMonthlyCost: 0,
    desiredMonthlyNetProfit: 0
  });

  assert.equal(error, '');
  assert.equal(result.breakEvenMembers, null);
  assert.equal(result.requiredMembersForTargetNet, null);
  assert.ok(result.monthlyNetProfit < 0);
});

test('TC-SK-07 validation rejects invalid inputs', () => {
  const invalidCases = [
    { ...baseline, subscriptionPrice: 0 },
    { ...baseline, subscriptionPrice: -1 },
    { ...baseline, subscriptionPrice: 100001 },
    { ...baseline, billedMembers: 0 },
    { ...baseline, billedMembers: 1.5 },
    { ...baseline, refundRatePct: 100 },
    { ...baseline, refundRatePct: -1 },
    { ...baseline, planTier: 'vip' },
    { ...baseline, planBilling: 'weekly' },
    { ...baseline, otherMonthlyCost: -1 },
    { ...baseline, desiredMonthlyNetProfit: -1 }
  ];

  invalidCases.forEach((input) => {
    const { result, error } = calculate(input);
    assert.equal(result, null);
    assert.notEqual(error, '');
  });
});

test('TC-SK-08 summary includes decision-ready lines', () => {
  const { result, error } = calculate(baseline);

  assert.equal(error, '');
  assert.match(result.summary, /Selected plan: Pro/);
  assert.match(result.summary, /Billing mode: monthly/);
  assert.match(result.summary, /Subscription price: \$99\.00/);
  assert.match(result.summary, /Monthly gross sales: \$7,920\.00/);
  assert.match(result.summary, /Transaction fee rate used: 2\.9% \+ \$0\.30/);
  assert.match(result.summary, /Monthly net profit: \$6,908\.92/);
  assert.match(result.summary, /Break-even billed members: 6\.38/);
  assert.match(result.summary, /Hobby→Pro upgrade break-even gross: \$1,267\.61/);
});

test('TC-SK-09 comparison rows and helper math are deterministic', () => {
  const { result, error } = calculate(baseline);

  assert.equal(error, '');
  assert.equal(result.comparisonRows.length, 2);
  assert.deepEqual(result.comparisonRows.map((row) => row.id), ['hobby', 'pro']);
  approx(findRequiredMembers(baseline, 0, { planTier: 'pro' }), 6.382593314792912, 0.00001);
  approx(findUpgradeBreakEvenGross(baseline), 1267.605633802817, 0.00001);
});

test('TC-SK-10 HTML scaffold contains required anchors', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

  for (const token of [
    'subscriptionPrice',
    'billedMembers',
    'refundRatePct',
    'planTier',
    'planBilling',
    'desiredMonthlyNetProfit',
    'comparisonBody',
    'summary',
    'script defer src="./calculator.js"',
    '/assets/analytics.js'
  ]) {
    assert.ok(html.includes(token), token);
  }

  assert.match(html, /Skool Fee Calculator|스쿨 수수료 계산기/);
  assert.match(html, /Hobby = 10% \+ \$0\.30/);
  assert.match(html, /Pro = 2\.9% \+ \$0\.30/);
});

test('TC-SK-11 discovery exact-once wiring', () => {
  const root = path.join(__dirname, '..', '..');
  const slug = 'skool-fee-calculator';
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
