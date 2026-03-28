const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const calc = require('./calculator.js');

function approx(actual, expected, tolerance = 0.01) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} ≈ ${expected} (±${tolerance})`);
}

test('exports expected defaults and platform rules', () => {
  assert.equal(calc.DEFAULTS.revenueMode, 'membership');
  assert.equal(calc.DEFAULTS.planTier, 'free');
  assert.equal(calc.DEFAULTS.pricePerTransaction, 10);
  assert.equal(calc.getPlatformRate({ revenueMode: 'membership', planTier: 'free' }), 0.05);
  assert.equal(calc.getPlatformRate({ revenueMode: 'membership', planTier: 'pro' }), 0.05);
  assert.equal(calc.getPlatformRate({ revenueMode: 'digital', planTier: 'free' }), 0.05);
  assert.equal(calc.getPlatformRate({ revenueMode: 'digital', planTier: 'pro' }), 0);
  assert.equal(calc.getPlatformRate({ revenueMode: 'donation', planTier: 'free' }), 0);
  assert.equal(calc.getPlatformRate({ revenueMode: 'donation', planTier: 'pro' }), 0);
});

test('TC-FW-01 membership baseline', () => {
  const { result, error } = calc.calculateFourthwallFees({
    revenueMode: 'membership',
    planTier: 'free',
    pricePerTransaction: 10,
    monthlyTransactions: 100,
    processingRatePct: 2.9,
    processingFixedFee: 0.30,
    targetMonthlyNet: 1000,
  });

  assert.equal(error, '');
  approx(result.platformFeeRatePct, 5);
  approx(result.monthlyGrossRevenue, 1000);
  approx(result.platformFeeAmount, 50);
  approx(result.processingVariableAmount, 29);
  approx(result.processingFixedAmount, 30);
  approx(result.totalFeeAmount, 109);
  approx(result.monthlyTakeHome, 891);
  approx(result.effectiveTakeHomeRatePct, 89.1);
  approx(result.netPerTransaction, 8.91);
  assert.equal(result.requiredTransactionsForTargetNet, 113);
  approx(result.requiredGrossForTargetNet, 1130);
});

test('TC-FW-02 and TC-FW-03 digital Free vs Pro delta', () => {
  const free = calc.calculateFourthwallFees({
    revenueMode: 'digital',
    planTier: 'free',
    pricePerTransaction: 20,
    monthlyTransactions: 50,
    processingRatePct: 2.9,
    processingFixedFee: 0.30,
    targetMonthlyNet: 1000,
  }).result;

  const pro = calc.calculateFourthwallFees({
    revenueMode: 'digital',
    planTier: 'pro',
    pricePerTransaction: 20,
    monthlyTransactions: 50,
    processingRatePct: 2.9,
    processingFixedFee: 0.30,
    targetMonthlyNet: 1000,
  }).result;

  approx(free.platformFeeRatePct, 5);
  approx(free.platformFeeAmount, 50);
  approx(free.processingVariableAmount, 29);
  approx(free.processingFixedAmount, 15);
  approx(free.monthlyTakeHome, 906);
  approx(free.netPerTransaction, 18.12);
  assert.equal(free.requiredTransactionsForTargetNet, 56);
  approx(free.requiredGrossForTargetNet, 1120);

  approx(pro.platformFeeRatePct, 0);
  approx(pro.platformFeeAmount, 0);
  approx(pro.processingVariableAmount, 29);
  approx(pro.processingFixedAmount, 15);
  approx(pro.monthlyTakeHome, 956);
  approx(pro.netPerTransaction, 19.12);
  assert.equal(pro.requiredTransactionsForTargetNet, 53);
  approx(pro.requiredGrossForTargetNet, 1060);
  approx(pro.monthlyTakeHome - free.monthlyTakeHome, 50);
});

test('TC-FW-04 donation mode applies 0% platform fee', () => {
  const { result, error } = calc.calculateFourthwallFees({
    revenueMode: 'donation',
    planTier: 'free',
    pricePerTransaction: 5,
    monthlyTransactions: 40,
    processingRatePct: 2.9,
    processingFixedFee: 0.30,
    targetMonthlyNet: 150,
  });

  assert.equal(error, '');
  approx(result.platformFeeRatePct, 0);
  approx(result.monthlyGrossRevenue, 200);
  approx(result.platformFeeAmount, 0);
  approx(result.processingVariableAmount, 5.8);
  approx(result.processingFixedAmount, 12);
  approx(result.monthlyTakeHome, 182.2);
  approx(result.effectiveTakeHomeRatePct, 91.1);
  assert.equal(result.requiredTransactionsForTargetNet, 33);
});

test('TC-FW-05 impossible target path returns null planner output', () => {
  const { result, error } = calc.calculateFourthwallFees({
    revenueMode: 'digital',
    planTier: 'free',
    pricePerTransaction: 0.25,
    monthlyTransactions: 100,
    processingRatePct: 2.9,
    processingFixedFee: 0.30,
    targetMonthlyNet: 100,
  });

  assert.equal(error, '');
  assert.ok(result.netPerTransaction < 0);
  approx(result.monthlyTakeHome, -6.975, 0.0001);
  assert.equal(result.requiredTransactionsForTargetNet, null);
  assert.equal(result.requiredGrossForTargetNet, null);
  assert.match(result.summary, /unreachable/i);
});

test('TC-FW-06 invalid inputs are rejected', () => {
  const cases = [
    { revenueMode: 'vip', planTier: 'free', pricePerTransaction: 10, monthlyTransactions: 10, processingRatePct: 2.9, processingFixedFee: 0.3, targetMonthlyNet: 1000 },
    { revenueMode: 'membership', planTier: 'gold', pricePerTransaction: 10, monthlyTransactions: 10, processingRatePct: 2.9, processingFixedFee: 0.3, targetMonthlyNet: 1000 },
    { revenueMode: 'membership', planTier: 'free', pricePerTransaction: -1, monthlyTransactions: 10, processingRatePct: 2.9, processingFixedFee: 0.3, targetMonthlyNet: 1000 },
    { revenueMode: 'membership', planTier: 'free', pricePerTransaction: 10, monthlyTransactions: 0, processingRatePct: 2.9, processingFixedFee: 0.3, targetMonthlyNet: 1000 },
    { revenueMode: 'membership', planTier: 'free', pricePerTransaction: 10, monthlyTransactions: 3.5, processingRatePct: 2.9, processingFixedFee: 0.3, targetMonthlyNet: 1000 },
    { revenueMode: 'membership', planTier: 'free', pricePerTransaction: 10, monthlyTransactions: 10, processingRatePct: -1, processingFixedFee: 0.3, targetMonthlyNet: 1000 },
    { revenueMode: 'membership', planTier: 'free', pricePerTransaction: 10, monthlyTransactions: 10, processingRatePct: 2.9, processingFixedFee: -0.3, targetMonthlyNet: 1000 },
    { revenueMode: 'membership', planTier: 'free', pricePerTransaction: 10, monthlyTransactions: 10, processingRatePct: 2.9, processingFixedFee: 0.3, targetMonthlyNet: -1 },
  ];

  for (const input of cases) {
    const { result, error } = calc.calculateFourthwallFees(input);
    assert.equal(result, null);
    assert.notEqual(error, '');
  }
});

test('TC-FW-07 plan selector does not affect donation mode', () => {
  const free = calc.calculateFourthwallFees({
    revenueMode: 'donation',
    planTier: 'free',
    pricePerTransaction: 5,
    monthlyTransactions: 40,
    processingRatePct: 2.9,
    processingFixedFee: 0.30,
    targetMonthlyNet: 150,
  }).result;

  const pro = calc.calculateFourthwallFees({
    revenueMode: 'donation',
    planTier: 'pro',
    pricePerTransaction: 5,
    monthlyTransactions: 40,
    processingRatePct: 2.9,
    processingFixedFee: 0.30,
    targetMonthlyNet: 150,
  }).result;

  for (const key of [
    'platformFeeRatePct',
    'monthlyGrossRevenue',
    'platformFeeAmount',
    'processingVariableAmount',
    'processingFixedAmount',
    'totalFeeAmount',
    'monthlyTakeHome',
    'effectiveTakeHomeRatePct',
    'netPerTransaction',
    'requiredTransactionsForTargetNet',
    'requiredGrossForTargetNet',
    'modeExplanation',
  ]) {
    assert.deepEqual(pro[key], free[key], key);
  }
});

test('HTML scaffold contains required anchors and scope note', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  for (const token of [
    'Fourthwall Fee Calculator | Fourthwall 수수료 계산기',
    'revenueMode',
    'planTier',
    'pricePerTransaction',
    'monthlyTransactions',
    'processingRatePct',
    'processingFixedFee',
    'targetMonthlyNet',
    'copySummaryBtn',
    'summary',
    '/assets/analytics.js',
    'Merch/product-catalog margins are out of scope',
    'Fees vary by provider and region',
  ]) {
    assert.ok(html.includes(token), token);
  }
});

test('TC-FW-08 discovery exact-once wiring', () => {
  const root = path.join(__dirname, '..', '..');
  const slug = 'fourthwall-fee-calculator';
  const url = `/tools/${slug}/`;

  const indexHtml = fs.readFileSync(path.join(root, 'tools', 'index.html'), 'utf8');
  const indexMd = fs.readFileSync(path.join(root, 'tools', 'index.md'), 'utf8');
  const toolsList = JSON.parse(fs.readFileSync(path.join(root, '_data', 'tools-list.json'), 'utf8'));
  let manifest = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'manifest.json'), 'utf8'));

  if (!manifest.tools.some((entry) => entry.slug === slug && entry.url === url)) {
    execFileSync('bash', ['scripts/build-manifests.sh'], { cwd: root, stdio: 'ignore' });
    manifest = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'manifest.json'), 'utf8'));
  }

  assert.equal(indexHtml.split(`href="${slug}/"`).length - 1, 1, 'index.html exact-once');
  assert.equal(indexMd.split(`./${slug}/`).length - 1, 1, 'index.md exact-once');
  assert.equal(toolsList.filter((entry) => entry.url === url).length, 1, 'tools-list exact-once');
  assert.equal(manifest.tools.filter((entry) => entry.slug === slug && entry.url === url).length, 1, 'manifest exact-once');
});
