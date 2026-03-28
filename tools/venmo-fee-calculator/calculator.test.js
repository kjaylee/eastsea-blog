const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  MODE_PRESETS,
  DEFAULTS,
  calculate,
  calculateTransferFees,
  findBreakEvenTransactionCount,
  findRequiredAveragePayment
} = require('./calculator.js');

function approx(actual, expected, tolerance = 0.01) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} ≈ ${expected} (±${tolerance})`);
}

const baseline = {
  receivingMode: 'personalGoods',
  transactionCount: 80,
  averagePaymentAmount: 45,
  refundRatePct: 2,
  transferMethod: 'standard',
  transferCount: 1,
  otherMonthlyCost: 120,
  desiredMonthlyNetProfit: 4000,
  currency: 'USD'
};

test('TC-01 preset correctness matches official fee table inputs', () => {
  assert.equal(MODE_PRESETS.personalGoods.ratePct, 2.99);
  assert.equal(MODE_PRESETS.personalGoods.fixedFee, 0);
  assert.equal(MODE_PRESETS.businessProfile.ratePct, 1.9);
  assert.equal(MODE_PRESETS.businessProfile.fixedFee, 0.10);
  assert.equal(MODE_PRESETS.businessTapToPay.ratePct, 2.29);
  assert.equal(MODE_PRESETS.businessTapToPay.fixedFee, 0.09);
  assert.equal(MODE_PRESETS.charityProfile.ratePct, 1.9);
  assert.equal(MODE_PRESETS.charityProfile.fixedFee, 0.10);
  assert.equal(DEFAULTS.receivingMode, 'personalGoods');
});

test('TC-02 baseline personal goods + standard transfer matches spec math', () => {
  const { result, error } = calculate(baseline, { lang: 'en' });

  assert.equal(error, '');
  approx(result.grossVolume, 3600);
  approx(result.venmoFeeTotal, 107.64);
  approx(result.refundLossTotal, 72);
  approx(result.transferFeeTotal, 0);
  approx(result.takeHomeBeforeFixedCost, 3420.36);
  approx(result.monthlyNetProfit, 3300.36);
  approx(result.effectiveFeeRatePct, 4.99);
  assert.equal(result.breakEvenTransactionCount, 3);
  approx(result.targetAveragePaymentAmount, 54.2);
});

test('TC-03 business profile + instant transfer mid-band keeps more than personal goods', () => {
  const business = calculate({
    receivingMode: 'businessProfile',
    transactionCount: 120,
    averagePaymentAmount: 30,
    refundRatePct: 0,
    transferMethod: 'instant',
    transferCount: 4,
    otherMonthlyCost: 120,
    desiredMonthlyNetProfit: 4000,
    currency: 'USD'
  }, { lang: 'en' }).result;

  const personal = calculate({
    receivingMode: 'personalGoods',
    transactionCount: 120,
    averagePaymentAmount: 30,
    refundRatePct: 0,
    transferMethod: 'instant',
    transferCount: 4,
    otherMonthlyCost: 120,
    desiredMonthlyNetProfit: 4000,
    currency: 'USD'
  }, { lang: 'en' }).result;

  approx(business.perTransferGross, 879.9);
  approx(business.transferFeePerTransfer, 15.4);
  approx(business.transferFeeTotal, 61.59);
  approx(business.monthlyNetProfit, 3338.01);
  assert.ok(business.monthlyNetProfit > personal.monthlyNetProfit);
});

test('TC-04 instant transfer minimum applies per transfer', () => {
  const result = calculateTransferFees(4.81, 'instant', 2);
  approx(result.perTransferGross, 2.405, 0.001);
  approx(result.transferFeePerTransfer, 0.25);
  approx(result.transferFeeTotal, 0.5);
});

test('TC-05 instant transfer maximum applies per transfer', () => {
  const result = calculateTransferFees(490400, 'instant', 3);
  approx(result.transferFeePerTransfer, 25);
  approx(result.transferFeeTotal, 75);
});

test('TC-06 charity and business standard math are equal under identical assumptions', () => {
  const business = calculate({ ...baseline, receivingMode: 'businessProfile' }, { lang: 'en' }).result;
  const charity = calculate({ ...baseline, receivingMode: 'charityProfile' }, { lang: 'en' }).result;

  approx(business.venmoFeeTotal, charity.venmoFeeTotal);
  approx(business.monthlyNetProfit, charity.monthlyNetProfit);
});

test('TC-07 break-even guard returns null when contribution never turns positive', () => {
  const impossible = {
    receivingMode: 'businessProfile',
    transactionCount: 10,
    averagePaymentAmount: 1,
    refundRatePct: 90,
    transferMethod: 'instant',
    transferCount: 10,
    otherMonthlyCost: 500,
    desiredMonthlyNetProfit: 100,
    currency: 'USD'
  };

  const { result, error } = calculate(impossible, { lang: 'en' });
  assert.equal(error, '');
  assert.equal(result.breakEvenTransactionCount, null);
  assert.equal(findBreakEvenTransactionCount(impossible, 'businessProfile'), null);
});

test('TC-08 required average payment increases when target exceeds current net', () => {
  const { result, error } = calculate(baseline, { lang: 'en' });
  assert.equal(error, '');
  assert.ok(result.targetAveragePaymentAmount > baseline.averagePaymentAmount);
  assert.ok(findRequiredAveragePayment(baseline, baseline.receivingMode, baseline.desiredMonthlyNetProfit) > baseline.averagePaymentAmount);
});

test('TC-09 invalid inputs are rejected', () => {
  const cases = [
    { ...baseline, receivingMode: 'unknown' },
    { ...baseline, transactionCount: -1 },
    { ...baseline, transactionCount: 1.5 },
    { ...baseline, averagePaymentAmount: -1 },
    { ...baseline, refundRatePct: 100 },
    { ...baseline, transferMethod: 'wire' },
    { ...baseline, transferCount: -1 },
    { ...baseline, otherMonthlyCost: -1 },
    { ...baseline, desiredMonthlyNetProfit: -1 }
  ];

  cases.forEach((input) => {
    const { result, error } = calculate(input, { lang: 'en' });
    assert.equal(result, null);
    assert.notEqual(error, '');
  });
});

test('TC-10 summary includes decision-ready fields', () => {
  const { result, error } = calculate({ ...baseline, transferMethod: 'instant', transferCount: 2 }, { lang: 'en' });
  assert.equal(error, '');
  assert.match(result.summary, /Receiving mode:/);
  assert.match(result.summary, /Gross payment volume:/);
  assert.match(result.summary, /Venmo transaction fees:/);
  assert.match(result.summary, /Transfer fees:/);
  assert.match(result.summary, /Monthly net profit:/);
  assert.match(result.summary, /Required average payment for target net:/);
});

test('TC-11 HTML scaffold contains required anchors', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  for (const token of [
    'receivingMode',
    'transactionCount',
    'averagePaymentAmount',
    'refundRatePct',
    'transferMethod',
    'transferCount',
    'otherMonthlyCost',
    'desiredMonthlyNetProfit',
    'comparisonBody',
    'summary',
    'script defer src="./calculator.js"',
    '/assets/analytics.js',
    'Venmo Fee Calculator'
  ]) {
    assert.ok(html.includes(token), token);
  }
});

test('TC-12 discovery exact-once wiring', () => {
  const root = path.join(__dirname, '..', '..');
  const slug = 'venmo-fee-calculator';
  const url = `/tools/${slug}/`;

  const indexHtml = fs.readFileSync(path.join(root, 'tools', 'index.html'), 'utf8');
  const indexMd = fs.readFileSync(path.join(root, 'tools', 'index.md'), 'utf8');
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'manifest.json'), 'utf8'));
  const toolsList = JSON.parse(fs.readFileSync(path.join(root, '_data', 'tools-list.json'), 'utf8'));

  assert.equal((indexHtml.match(new RegExp(slug, 'g')) || []).length, 1, 'index.html exact-once');
  assert.equal((indexMd.match(new RegExp(slug, 'g')) || []).length, 1, 'index.md exact-once');
  assert.equal(manifest.tools.filter((entry) => entry.slug === slug && entry.url === url).length, 1, 'manifest exact-once');
  assert.equal(toolsList.filter((entry) => entry.url === url).length, 1, 'tools-list exact-once');
});
