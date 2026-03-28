const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const calc = require('./calculator.js');

function calculate(overrides = {}) {
  return calc.calculate(Object.assign({}, calc.DEFAULT_INPUTS, overrides));
}

function approx(actual, expected, epsilon = 1e-6) {
  assert.ok(Math.abs(actual - expected) <= epsilon, `expected ${actual} to be within ${epsilon} of ${expected}`);
}

test('TC-01 baseline creator-covers scenario matches expected math', () => {
  const { result, error } = calculate({
    transactionCount: 120,
    averageSupportAmount: 10,
    coverCardFeeFromSupporters: false,
    platformFeeRatePct: 5,
    processingRatePct: 2.9,
    processingFixedFee: 0.30,
    payoutRatePct: 0.5,
    rewardCostPerTransaction: 1.20,
    otherMonthlyCost: 80,
    desiredMonthlyNetProfit: 1000,
  });

  assert.equal(error, '');
  const current = result.currentScenario;
  assert.equal(current.mode, calc.MODE_KEYS.CREATOR_COVERS);
  assert.equal(current.grossSupportVolume, 1200);
  assert.equal(current.supporterChargeTotal, 1200);
  assert.equal(current.platformFees, 60);
  assert.equal(current.processingFees, 70.8);
  approx(current.payoutFees, 5.346);
  approx(current.takeHomeBeforeOperatingCosts, 1063.854);
  assert.equal(current.rewardCosts, 144);
  approx(current.monthlyNetProfit, 839.854);
  approx(current.effectiveCreatorFeeDragPct, 11.3455, 1e-4);
  approx(result.breakEvenAverageSupport, 2.3627, 1e-4);
  approx(result.targetAverageSupport, 11.456304, 1e-5);
});

test('TC-02 supporter-covers scenario improves creator net as expected', () => {
  const { result, error } = calculate({
    transactionCount: 120,
    averageSupportAmount: 10,
    coverCardFeeFromSupporters: true,
    platformFeeRatePct: 5,
    processingRatePct: 2.9,
    processingFixedFee: 0.30,
    payoutRatePct: 0.5,
    rewardCostPerTransaction: 1.20,
    otherMonthlyCost: 80,
    desiredMonthlyNetProfit: 1000,
  });

  assert.equal(error, '');
  const current = result.currentScenario;
  assert.equal(current.mode, calc.MODE_KEYS.SUPPORTER_COVERS);
  assert.equal(current.grossSupportVolume, 1200);
  approx(current.supporterChargeTotal, 1272.914521, 1e-6);
  approx(current.processingFees, 72.914521, 1e-6);
  assert.equal(current.platformFees, 60);
  assert.equal(current.payoutFees, 5.7);
  assert.equal(current.takeHomeBeforeOperatingCosts, 1134.3);
  assert.equal(current.monthlyNetProfit, 910.3);
  approx(current.breakEvenAverageSupport, 1.974786, 1e-6);
  approx(current.targetAverageSupport, 10.790796, 1e-6);
  approx(result.netProfitDeltaVsAlternate, 70.446, 1e-6);
});

test('TC-03 reward-cost sensitivity is linear', () => {
  const base = calculate({
    transactionCount: 120,
    averageSupportAmount: 10,
    rewardCostPerTransaction: 1.20,
    otherMonthlyCost: 80,
  }).result.currentScenario.monthlyNetProfit;

  const heavierReward = calculate({
    transactionCount: 120,
    averageSupportAmount: 10,
    rewardCostPerTransaction: 2.00,
    otherMonthlyCost: 80,
  }).result.currentScenario.monthlyNetProfit;

  approx(base - heavierReward, 96, 1e-6);
});

test('TC-04 fixed monthly cost reduces net dollar-for-dollar', () => {
  const lowCost = calculate({
    transactionCount: 120,
    averageSupportAmount: 10,
    rewardCostPerTransaction: 1.20,
    otherMonthlyCost: 80,
  }).result.currentScenario.monthlyNetProfit;

  const highCost = calculate({
    transactionCount: 120,
    averageSupportAmount: 10,
    rewardCostPerTransaction: 1.20,
    otherMonthlyCost: 180,
  }).result.currentScenario.monthlyNetProfit;

  approx(lowCost - highCost, 100, 1e-6);
});

test('TC-05 zero transactions returns safe outputs', () => {
  const { result, error } = calculate({
    transactionCount: 0,
    averageSupportAmount: 10,
    otherMonthlyCost: 25,
    desiredMonthlyNetProfit: 100,
  });

  assert.equal(error, '');
  const current = result.currentScenario;
  assert.equal(current.grossSupportVolume, 0);
  assert.equal(current.supporterChargeTotal, 0);
  assert.equal(current.monthlyNetProfit, -25);
  assert.equal(result.breakEvenAverageSupport, null);
  assert.equal(result.targetAverageSupport, null);
});

test('TC-06 invalid input rejection catches negative and impossible values', () => {
  const { error } = calculate({
    transactionCount: -1,
    averageSupportAmount: -5,
    platformFeeRatePct: 100,
    processingRatePct: 100,
    processingFixedFee: -0.01,
    payoutRatePct: 100,
    rewardCostPerTransaction: -1,
    otherMonthlyCost: -1,
    desiredMonthlyNetProfit: -1,
  });

  assert.match(error, /transactionCount must be an integer/);
  assert.match(error, /averageSupportAmount must be at least 0/);
  assert.match(error, /platformFeeRatePct must be between 0 and less than 100/);
  assert.match(error, /processingRatePct must be between 0 and less than 100/);
  assert.match(error, /processingFixedFee must be at least 0/);
  assert.match(error, /payoutRatePct must be between 0 and less than 100/);
});

test('TC-07 denominator guard returns null thresholds for impossible creator-covers structure', () => {
  const { result, error } = calculate({
    transactionCount: 10,
    averageSupportAmount: 5,
    coverCardFeeFromSupporters: false,
    platformFeeRatePct: 60,
    processingRatePct: 45,
    payoutRatePct: 1,
  });

  assert.equal(error, '');
  const current = result.currentScenario;
  assert.equal(current.breakEvenAverageSupport, null);
  assert.equal(current.targetAverageSupport, null);
  assert.ok(Number.isFinite(current.processingFees));
});

test('TC-08 alternate scenario block is internally consistent', () => {
  const { result } = calculate({
    transactionCount: 45,
    averageSupportAmount: 8,
    coverCardFeeFromSupporters: false,
  });

  assert.equal(result.currentScenarioLabel, 'Creator covers card fee');
  assert.equal(result.alternateScenarioLabel, 'Supporters cover card fee');
  assert.equal(result.alternateScenario.mode, calc.MODE_KEYS.SUPPORTER_COVERS);
  approx(result.netProfitDeltaVsAlternate, result.currentScenario.monthlyNetProfit - result.alternateScenario.monthlyNetProfit, 1e-9);
});

test('TC-09 summary includes decision-ready fields', () => {
  const { result } = calculate({
    transactionCount: 120,
    averageSupportAmount: 10,
    coverCardFeeFromSupporters: true,
  });

  const text = result.summary;
  assert.match(text, /Transactions \/ 거래 수:/);
  assert.match(text, /Average support \/ 평균 후원액:/);
  assert.match(text, /Platform fees \/ 플랫폼 수수료:/);
  assert.match(text, /Card processing fees \/ 카드 결제 수수료:/);
  assert.match(text, /Payout fees \/ 정산 수수료:/);
  assert.match(text, /Reward costs \/ 리워드 비용:/);
  assert.match(text, /Monthly net profit \/ 월 순이익:/);
  assert.match(text, /Break-even average support \/ 손익분기 평균 후원액:/);
  assert.match(text, /Target average support \/ 목표 순이익 달성 평균 후원액:/);
});

test('TC-10 required HTML anchors are present', () => {
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
    '/assets/analytics.js',
  ]) {
    assert.match(html, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

test('TC-11 discovery exact-once wiring stays intact', () => {
  const root = path.join(__dirname, '..', '..');
  const slug = 'buy-me-a-coffee-fee-calculator';
  assert.ok(fs.existsSync(path.join(root, 'tools', slug, 'index.html')));
  assert.equal(fs.readFileSync(path.join(root, 'tools', 'index.html'), 'utf8').split(`${slug}/`).length - 1, 1);
  assert.equal(fs.readFileSync(path.join(root, 'tools', 'index.md'), 'utf8').split(`./${slug}/`).length - 1, 1);
  assert.equal(fs.readFileSync(path.join(root, '_data', 'tools-list.json'), 'utf8').split(`/tools/${slug}/`).length - 1, 1);
  assert.equal(fs.readFileSync(path.join(root, 'tools', 'manifest.json'), 'utf8').split(`"slug": "${slug}"`).length - 1, 1);
});

test('TC-12 HTTP smoke content markers are embedded in HTML', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  assert.match(html, /Buy Me a Coffee Fee Calculator/);
  assert.match(html, /5% platform fee/);
  assert.match(html, /2\.9% \+ \$0\.30/);
  assert.match(html, /0\.5% payout drag/);
});
