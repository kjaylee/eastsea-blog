const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  DEFAULTS,
  calculate,
  getNetFactor,
  calculateBreakEvenPaidMessages,
  calculateTargetAverageSuperChatAmount,
  calculateTargetPayingViewerRatePct
} = require('./calculator.js');

function approx(actual, expected, tolerance = 0.01) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} ≈ ${expected} (±${tolerance})`);
}

const baseline = {
  streamsPerMonth: 8,
  averageViewersPerStream: 18000,
  payingViewerRatePct: 1.4,
  messagesPerPayingViewer: 1.25,
  averageSuperChatAmount: 4.5,
  creatorSharePct: 70,
  refundRatePct: 1.5,
  withholdingTaxPct: 0,
  otherMonthlyCost: 450,
  targetMonthlyNet: 9000,
  currency: 'USD'
};

test('exports expected defaults', () => {
  assert.equal(DEFAULTS.streamsPerMonth, 8);
  assert.equal(DEFAULTS.averageSuperChatAmount, 4.5);
  assert.equal(DEFAULTS.creatorSharePct, 70);
  assert.equal(DEFAULTS.currency, 'USD');
});

test('TC-SC-01 baseline Super Chat scenario matches spec math', () => {
  const { result, error } = calculate(baseline, { lang: 'en' });

  assert.equal(error, '');
  approx(getNetFactor(baseline), 0.6895, 0.0001);
  approx(result.monthlyLiveViews, 144000);
  approx(result.monthlyPayingViewers, 2016);
  approx(result.monthlyPaidMessages, 2520);
  approx(result.grossFanSpend, 11340);
  approx(result.platformShareLoss, 3402);
  approx(result.creatorShareBeforeAdjustments, 7938);
  approx(result.refundLoss, 119.07);
  approx(result.takeHomeBeforeCosts, 7818.93);
  approx(result.monthlyNet, 7368.93);
  approx(result.takeHomePerStream, 921.12);
  approx(result.takeHomePerThousandViews, 51.17);
  approx(result.effectiveTakeHomeRatePct, 68.9491, 0.001);
  approx(result.breakEvenPaidMessages, 145.0326, 0.01);
  approx(result.breakEvenPayingViewerRatePct, 0.0806, 0.001);
  approx(result.targetAverageSuperChatAmount, 5.437, 0.01);
  approx(result.targetPayingViewerRatePct, 1.692, 0.01);
});

test('TC-SC-02 withholding tax lowers take-home and raises targets', () => {
  const noTax = calculate(baseline, { lang: 'en' }).result;
  const taxed = calculate({ ...baseline, withholdingTaxPct: 10 }, { lang: 'en' }).result;

  assert.ok(taxed.takeHomeBeforeCosts < noTax.takeHomeBeforeCosts);
  assert.ok(taxed.monthlyNet < noTax.monthlyNet);
  assert.ok(taxed.targetAverageSuperChatAmount > noTax.targetAverageSuperChatAmount);
  assert.ok(taxed.targetPayingViewerRatePct > noTax.targetPayingViewerRatePct);
});

test('TC-SC-03 cost sensitivity stays linear', () => {
  const base = calculate(baseline, { lang: 'en' }).result;
  const higherCost = calculate({ ...baseline, otherMonthlyCost: 950 }, { lang: 'en' }).result;

  approx(base.monthlyNet - higherCost.monthlyNet, 500);
  approx(calculateBreakEvenPaidMessages({ ...baseline, otherMonthlyCost: 950 }) - base.breakEvenPaidMessages, 161.1472, 0.05);
});

test('TC-SC-04 zero audience produces safe null target outputs', () => {
  const { result, error } = calculate({
    ...baseline,
    averageViewersPerStream: 0,
    payingViewerRatePct: 0,
    otherMonthlyCost: 100
  }, { lang: 'en' });

  assert.equal(error, '');
  approx(result.monthlyLiveViews, 0);
  approx(result.grossFanSpend, 0);
  approx(result.monthlyNet, -100);
  assert.equal(result.targetAverageSuperChatAmount, null);
  assert.equal(result.targetPayingViewerRatePct, null);
  assert.equal(calculateTargetAverageSuperChatAmount({ ...baseline, averageViewersPerStream: 0, payingViewerRatePct: 0 }), null);
  assert.equal(calculateTargetPayingViewerRatePct({ ...baseline, averageViewersPerStream: 0 }), null);
});

test('TC-SC-05 validation rejects impossible inputs', () => {
  const invalidCases = [
    { ...baseline, streamsPerMonth: 0 },
    { ...baseline, streamsPerMonth: 1.5 },
    { ...baseline, averageViewersPerStream: -1 },
    { ...baseline, payingViewerRatePct: 100 },
    { ...baseline, messagesPerPayingViewer: -1 },
    { ...baseline, averageSuperChatAmount: -1 },
    { ...baseline, creatorSharePct: 0 },
    { ...baseline, refundRatePct: 100 },
    { ...baseline, withholdingTaxPct: 100 },
    { ...baseline, otherMonthlyCost: -1 },
    { ...baseline, targetMonthlyNet: -1 }
  ];

  invalidCases.forEach((input) => {
    const { result, error } = calculate(input, { lang: 'en' });
    assert.equal(result, null);
    assert.notEqual(error, '');
  });
});

test('TC-SC-06 impossible net factor returns null break-even and target math', () => {
  const { result, error } = calculate({
    ...baseline,
    messagesPerPayingViewer: 0,
    averageSuperChatAmount: 0
  }, { lang: 'en' });

  assert.equal(error, '');
  assert.equal(result.breakEvenPaidMessages, null);
  assert.equal(result.breakEvenPayingViewerRatePct, null);
  assert.equal(result.targetAverageSuperChatAmount, null);
  assert.equal(result.targetPayingViewerRatePct, null);
});

test('TC-SC-07 summary includes decision-ready fields', () => {
  const { result, error } = calculate(baseline, { lang: 'en' });

  assert.equal(error, '');
  assert.match(result.summary, /Streams per month: 8/);
  assert.match(result.summary, /Average live views per stream: 18,000/);
  assert.match(result.summary, /Gross fan spend: \$11,340\.00/);
  assert.match(result.summary, /Monthly net after costs: \$7,368\.93/);
  assert.match(result.summary, /Break-even paid messages:/);
  assert.match(result.summary, /Target average Super Chat amount:/);
});

test('TC-SC-08 HTML scaffold contains required anchors', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

  for (const token of [
    'streamsPerMonth',
    'averageViewersPerStream',
    'payingViewerRatePct',
    'messagesPerPayingViewer',
    'averageSuperChatAmount',
    'creatorSharePct',
    'targetMonthlyNet',
    'summary',
    'script defer src="./calculator.js"',
    '/assets/analytics.js'
  ]) {
    assert.ok(html.includes(token), token);
  }

  assert.match(html, /YouTube Super Chat Revenue Calculator|유튜브 슈퍼챗 수익 계산기/);
});

test('TC-SC-09 discovery exact-once wiring', () => {
  const root = path.join(__dirname, '..', '..');
  const slug = 'youtube-super-chat-revenue-calculator';
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
