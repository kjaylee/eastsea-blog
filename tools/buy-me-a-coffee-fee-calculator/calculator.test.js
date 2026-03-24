const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  calculate,
  DEFAULTS,
  calculateAverageSupportRequired,
  calculateBreakEvenTransactionCount,
  getScenarioMode
} = require('./calculator.js');

function approx(actual, expected, tolerance = 0.01) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} ≈ ${expected} (±${tolerance})`);
}

const baseline = {
  transactionCount: 120,
  averageSupportAmount: 10,
  refundRatePct: 0,
  coverCardFeeFromSupporters: false,
  platformFeeRatePct: 5,
  processingRatePct: 2.9,
  processingFixedFee: 0.30,
  payoutRatePct: 0.5,
  rewardCostPerTransaction: 1.2,
  otherMonthlyCost: 80,
  desiredMonthlyNetProfit: 1000,
  currency: 'USD'
};

const rootSpecBaseline = {
  transactionCount: 180,
  averageSupportAmount: 7,
  refundRatePct: 2,
  coverCardFeeFromSupporters: false,
  platformFeeRatePct: 5,
  processingRatePct: 2.9,
  processingFixedFee: 0.30,
  payoutRatePct: 0.5,
  rewardCostPerTransaction: 0.5,
  otherMonthlyCost: 120,
  desiredMonthlyNetProfit: 900,
  currency: 'USD'
};

test('exports expected defaults', () => {
  assert.equal(DEFAULTS.platformFeeRatePct, 5);
  assert.equal(DEFAULTS.processingRatePct, 2.9);
  assert.equal(DEFAULTS.processingFixedFee, 0.3);
  assert.equal(DEFAULTS.payoutRatePct, 0.5);
});

test('TC-01 baseline creator-covers scenario matches detailed spec math', () => {
  const { result, error } = calculate(baseline, { lang: 'en' });

  assert.equal(error, '');
  assert.equal(getScenarioMode(result.inputs), 'creatorCovers');
  approx(result.grossBillings, 1200);
  approx(result.supporterChargeTotal, 1200);
  approx(result.platformFeeTotal, 60);
  approx(result.processorCardFeeGross, 70.8);
  approx(result.payoutFeeTotal, 5.35);
  approx(result.takeHomeAfterFees, 1063.85);
  approx(result.rewardCosts, 144);
  approx(result.monthlyNetProfit, 839.85);
  approx(result.effectiveCreatorFeeDragPct, 11.35);
  approx(result.breakEvenAverageSupportAmount, 2.36);
  approx(result.targetAverageSupportAmount, 11.46);
  approx(result.breakEvenMonthlyTransactions, 10.44);
});

test('TC-02 supporter covers card fee improves creator net', () => {
  const creator = calculate(baseline, { lang: 'en' }).result;
  const supporter = calculate({ ...baseline, coverCardFeeFromSupporters: true, processorFeeCoveredBySupportersPct: 100 }, { lang: 'en' }).result;

  approx(supporter.supporterChargeTotal, 1272.91);
  approx(supporter.processorCardFeeGross, 72.91);
  approx(supporter.platformFeeTotal, 60);
  approx(supporter.payoutFeeTotal, 5.7);
  approx(supporter.takeHomeAfterFees, 1134.3);
  approx(supporter.monthlyNetProfit, 910.3);
  approx(supporter.netProfitDeltaVsAlternate, 70.45);
  approx(supporter.breakEvenAverageSupportAmount, 1.97);
  approx(supporter.targetAverageSupportAmount, 10.79);
  assert.equal(supporter.processorCardFeeNet, 0);
  assert.ok(supporter.monthlyNetProfit > creator.monthlyNetProfit);
});

test('TC-03 reward-cost sensitivity is linear', () => {
  const base = calculate(baseline, { lang: 'en' }).result;
  const higherReward = calculate({ ...baseline, rewardCostPerTransaction: 2 }, { lang: 'en' }).result;

  approx(higherReward.rewardCosts - base.rewardCosts, 96);
  approx(base.monthlyNetProfit - higherReward.monthlyNetProfit, 96);
});

test('TC-04 fixed monthly cost reduces profit dollar-for-dollar', () => {
  const base = calculate(baseline, { lang: 'en' }).result;
  const higherFixed = calculate({ ...baseline, otherMonthlyCost: 180 }, { lang: 'en' }).result;

  approx(base.monthlyNetProfit - higherFixed.monthlyNetProfit, 100);
});

test('TC-05 zero transactions returns safe outputs', () => {
  const { result, error } = calculate({
    ...baseline,
    transactionCount: 0,
    averageSupportAmount: 10,
    rewardCostPerTransaction: 0,
    otherMonthlyCost: 30,
    desiredMonthlyNetProfit: 1000
  }, { lang: 'en' });

  assert.equal(error, '');
  approx(result.grossBillings, 0);
  approx(result.supporterChargeTotal, 0);
  approx(result.monthlyNetProfit, -30);
  assert.equal(result.breakEvenAverageSupportAmount, null);
  assert.equal(result.targetAverageSupportAmount, null);
});

test('TC-06 invalid inputs are rejected', () => {
  const invalidCases = [
    { ...baseline, transactionCount: -1 },
    { ...baseline, transactionCount: 1.5 },
    { ...baseline, averageSupportAmount: -1 },
    { ...baseline, refundRatePct: 100 },
    { ...baseline, platformFeeRatePct: 100 },
    { ...baseline, processingRatePct: 100 },
    { ...baseline, processingFixedFee: -0.01 },
    { ...baseline, payoutRatePct: 100 },
    { ...baseline, rewardCostPerTransaction: -0.1 },
    { ...baseline, otherMonthlyCost: -1 },
    { ...baseline, desiredMonthlyNetProfit: -1 }
  ];

  invalidCases.forEach((input) => {
    const { result, error } = calculate(input, { lang: 'en' });
    assert.equal(result, null);
    assert.notEqual(error, '');
  });
});

test('TC-07 denominator guard returns null for impossible fee structure', () => {
  const { result, error } = calculate({
    ...baseline,
    transactionCount: 10,
    averageSupportAmount: 5,
    platformFeeRatePct: 60,
    processingRatePct: 45,
    payoutRatePct: 1,
    rewardCostPerTransaction: 0,
    otherMonthlyCost: 0,
    desiredMonthlyNetProfit: 100
  }, { lang: 'en' });

  assert.equal(error, '');
  assert.equal(result.breakEvenAverageSupportAmount, null);
  assert.equal(result.targetAverageSupportAmount, null);
  assert.ok(Number.isFinite(result.monthlyNetProfit));
});

test('TC-08 summary includes decision-ready fields', () => {
  const { result, error } = calculate({ ...baseline, refundRatePct: 2 }, { lang: 'en' });

  assert.equal(error, '');
  assert.match(result.summary, /Monthly transaction count: 120/);
  assert.match(result.summary, /Average support amount: \$10\.00/);
  assert.match(result.summary, /Refund rate: 2\.00%/);
  assert.match(result.summary, /Platform fees: \$60\.00/);
  assert.match(result.summary, /Processing fees: \$70\.80/);
  assert.match(result.summary, /Payout fees:/);
  assert.match(result.summary, /Reward costs: \$144\.00/);
  assert.match(result.summary, /Monthly net profit:/);
  assert.match(result.summary, /Break-even average support amount:/);
  assert.match(result.summary, /Required average support for target net:/);
});

test('TC-09 root spec baseline stays positive and break-even is below current average', () => {
  const { result, error } = calculate(rootSpecBaseline, { lang: 'en' });

  assert.equal(error, '');
  approx(result.grossBillings, 1260);
  approx(result.platformFeeTotal, 63);
  assert.ok(result.processorCardFeeGross > 0);
  assert.ok(result.netAfterCosts > 0);
  assert.ok(result.breakEvenAverageSupportAmount < rootSpecBaseline.averageSupportAmount);
});

test('TC-10 root spec supporter-covered card fee improves outcomes', () => {
  const creator = calculate(rootSpecBaseline, { lang: 'en' }).result;
  const supporter = calculate({ ...rootSpecBaseline, coverCardFeeFromSupporters: true, processorFeeCoveredBySupportersPct: 100 }, { lang: 'en' }).result;

  assert.equal(supporter.processorCardFeeNet, 0);
  assert.ok(supporter.netAfterCosts > creator.netAfterCosts);
  assert.ok(supporter.targetAverageSupportAmount < creator.targetAverageSupportAmount);
});

test('TC-11 HTML scaffold contains required anchors', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

  for (const token of [
    'transactionCount',
    'averageSupportAmount',
    'coverCardFeeFromSupporters',
    'platformFeeRatePct',
    'processingRatePct',
    'processingFixedFee',
    'payoutRatePct',
    'rewardCostPerTransaction',
    'otherMonthlyCost',
    'desiredMonthlyNetProfit',
    'summary',
    'alternateScenario',
    'script defer src="./calculator.js"',
    '/assets/analytics.js'
  ]) {
    assert.ok(html.includes(token), token);
  }

  assert.match(html, /Buy Me a Coffee Fee Calculator/);
  assert.match(html, /5%/);
  assert.match(html, /2\.9% \+ \$0\.30/);
  assert.match(html, /0\.5%/);
});

test('TC-12 discovery exact-once wiring', () => {
  const root = path.join(__dirname, '..', '..');
  const slug = 'buy-me-a-coffee-fee-calculator';
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

test('helper formulas stay directly callable', () => {
  approx(calculateAverageSupportRequired(baseline, 'creatorCovers', 0), 2.36);
  approx(calculateAverageSupportRequired(baseline, 'supporterCovers', baseline.desiredMonthlyNetProfit), 10.79);
  approx(calculateBreakEvenTransactionCount(baseline, 'creatorCovers'), 10.44);
});
