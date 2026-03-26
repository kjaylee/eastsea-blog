const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { calculate, DEFAULTS, PLATFORM_FEE_RATE } = require('./calculator.js');

function approx(actual, expected, tol) {
  tol = tol || 0.02;
  assert.ok(
    Math.abs(actual - expected) <= tol,
    'expected ' + actual + ' ≈ ' + expected + ' (±' + tol + ')'
  );
}

var baseInput = {
  activeSubscribers: 150,
  subscriptionPrice: 9.99,
  tipsRevenue: 800,
  ppvRevenue: 500,
  customRevenue: 200,
  refundRatePct: 2,
  payoutDelayDays: 7,
  annualCashCostPct: 8,
  promoCost: 300,
  otherCost: 150,
  targetMonthlyNet: 5000
};

// TC-01 Baseline scenario
test('TC-01 baseline scenario', function () {
  var r = calculate(baseInput, { lang: 'en' });
  assert.equal(r.error, '');
  var res = r.result;

  // subscriptionRevenue = 150 * 9.99 = 1498.50
  approx(res.subscriptionRevenue, 1498.50);
  // ancillary = 800 + 500 + 200 = 1500
  approx(res.ancillaryRevenue, 1500);
  // gross = 2998.50
  approx(res.grossRevenue, 2998.50);
  // platformFee = 2998.50 * 0.20 = 599.70
  approx(res.platformFee, 599.70);
  // refundLoss = 2998.50 * 0.02 = 59.97
  approx(res.refundLoss, 59.97);
  // proceedsBeforeDrag = 2998.50 - 599.70 - 59.97 = 2338.83
  approx(res.proceedsBeforeDrag, 2338.83);
  // payoutDrag = 2338.83 * 0.08 * 7/365 = 3.587...
  approx(res.payoutDrag, 3.59, 0.02);
  // takeHomeBeforeOps ≈ 2335.24
  approx(res.takeHomeBeforeOps, 2335.24, 0.10);
  // netIncome ≈ 2335.24 - 450 = 1885.24
  approx(res.netIncome, 1885.24, 0.10);
  // annualized
  approx(res.annualizedNet, res.netIncome * 12, 1.5);

  assert.equal(res.platformFeeRate, 0.20);
  assert.ok(res.effectiveKeepRatePct > 70 && res.effectiveKeepRatePct < 85);
  assert.ok(res.grossPerSubscriber > 0);
  assert.ok(res.takeHomePerSubscriber > 0);
  assert.ok(res.requiredSubscribersForTarget > 0);
  assert.ok(res.breakEvenSubscribers >= 0);
});

// TC-02 Target subscriber math
test('TC-02 required subscribers for target', function () {
  var r = calculate(baseInput, { lang: 'en' });
  assert.equal(r.error, '');
  var res = r.result;

  // requiredSubscribersForTarget = ceil((targetNet + totalOps) / takeHomePerSub)
  var expected = Math.ceil((5000 + 450) / res.takeHomePerSubscriber);
  assert.equal(res.requiredSubscribersForTarget, expected);
});

// TC-03 Break-even subscribers
test('TC-03 break-even subscribers', function () {
  var r = calculate(baseInput, { lang: 'en' });
  assert.equal(r.error, '');
  var expected = Math.ceil(450 / r.result.takeHomePerSubscriber);
  assert.equal(r.result.breakEvenSubscribers, expected);
});

// TC-04 Required subscription price
test('TC-04 required subscription price', function () {
  var r = calculate(baseInput, { lang: 'en' });
  assert.equal(r.error, '');
  assert.ok(r.result.requiredSubscriptionPrice !== null);
  assert.ok(r.result.requiredSubscriptionPrice > 0);
  // If we plug this price back in, net should approximately equal target
  var check = calculate({
    ...baseInput,
    subscriptionPrice: r.result.requiredSubscriptionPrice
  }, { lang: 'en' });
  approx(check.result.netIncome, 5000, 2.0);
});

// TC-05 Validation rejects bad inputs
test('TC-05 validation rejects bad inputs', function () {
  var badInputs = [
    { ...baseInput, activeSubscribers: -1 },
    { ...baseInput, subscriptionPrice: -0.01 },
    { ...baseInput, tipsRevenue: -1 },
    { ...baseInput, ppvRevenue: -1 },
    { ...baseInput, customRevenue: -1 },
    { ...baseInput, refundRatePct: 100 },
    { ...baseInput, refundRatePct: -1 },
    { ...baseInput, payoutDelayDays: 400 },
    { ...baseInput, payoutDelayDays: -1 },
    { ...baseInput, annualCashCostPct: 101 },
    { ...baseInput, promoCost: -1 },
    { ...baseInput, otherCost: -1 },
    { ...baseInput, targetMonthlyNet: -1 }
  ];
  for (var i = 0; i < badInputs.length; i++) {
    var r = calculate(badInputs[i], { lang: 'en' });
    assert.equal(r.result, null, 'expected null result for bad input index ' + i);
    assert.notEqual(r.error, '', 'expected error for bad input index ' + i);
  }
});

// TC-06 Zero-subscriber edge case
test('TC-06 zero subscribers', function () {
  var r = calculate({ ...baseInput, activeSubscribers: 0, subscriptionPrice: 0 }, { lang: 'en' });
  assert.equal(r.error, '');
  var res = r.result;
  assert.equal(res.subscriptionRevenue, 0);
  assert.equal(res.grossPerSubscriber, null);
  assert.equal(res.takeHomePerSubscriber, null);
  assert.equal(res.requiredSubscribersForTarget, null);
  assert.equal(res.breakEvenSubscribers, null);
});

// TC-07 Higher promo cost lowers net dollar-for-dollar
test('TC-07 promo cost sensitivity', function () {
  var base = calculate(baseInput, { lang: 'en' }).result;
  var higher = calculate({ ...baseInput, promoCost: 500 }, { lang: 'en' }).result;
  approx(higher.netIncome, base.netIncome - 200, 0.01);
});

// TC-08 Higher refund rate lowers net and keep rate
test('TC-08 refund rate sensitivity', function () {
  var base = calculate(baseInput, { lang: 'en' }).result;
  var higher = calculate({ ...baseInput, refundRatePct: 10 }, { lang: 'en' }).result;
  assert.ok(higher.netIncome < base.netIncome);
  assert.ok(higher.effectiveKeepRatePct < base.effectiveKeepRatePct);
});

// TC-09 DEFAULTS shape
test('TC-09 DEFAULTS shape', function () {
  assert.equal(DEFAULTS.activeSubscribers, 150);
  assert.equal(DEFAULTS.subscriptionPrice, 9.99);
  assert.equal(PLATFORM_FEE_RATE, 0.20);
});

// TC-10 Summary includes key fields
test('TC-10 summary includes key fields', function () {
  var r = calculate(baseInput, { lang: 'en' });
  var s = r.result.summary;
  assert.ok(s.includes('OnlyFans'), 'summary should mention OnlyFans');
  assert.ok(s.includes('Gross monthly revenue'), 'summary should include gross');
  assert.ok(s.includes('Net monthly income'), 'summary should include net');
  assert.ok(s.includes('20%'), 'summary should mention 20%');
});

// TC-11 Korean language works
test('TC-11 Korean language', function () {
  var r = calculate(baseInput, { lang: 'ko' });
  assert.equal(r.error, '');
  assert.ok(r.result.summary.includes('OnlyFans 실수령액 요약'));
});

// TC-12 HTML scaffold has required anchors
test('TC-12 HTML scaffold anchors', function () {
  var html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  var tokens = ['langBtn', 'activeSubscribers', 'subscriptionPrice', 'summary', 'calculator.js', '/assets/analytics.js',
    'OnlyFans Earnings Calculator', 'canonical'];
  for (var i = 0; i < tokens.length; i++) {
    assert.ok(html.includes(tokens[i]), 'HTML missing: ' + tokens[i]);
  }
});

// TC-13 Catalog exact-once checks
test('TC-13 catalog exact-once wiring', function () {
  var root = path.join(__dirname, '..', '..');
  var slug = 'onlyfans-earnings-calculator';
  var url = '/tools/' + slug + '/';

  var indexHtml = fs.readFileSync(path.join(root, 'tools', 'index.html'), 'utf8');
  var indexMd = fs.readFileSync(path.join(root, 'tools', 'index.md'), 'utf8');
  var toolsList = JSON.parse(fs.readFileSync(path.join(root, '_data', 'tools-list.json'), 'utf8'));
  var manifest = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'manifest.json'), 'utf8'));

  assert.equal((indexHtml.match(new RegExp(slug, 'g')) || []).length, 1, 'index.html exact-once');
  assert.equal((indexMd.match(new RegExp(slug, 'g')) || []).length, 1, 'index.md exact-once');
  assert.equal(toolsList.filter(function (e) { return e.url === url; }).length, 1, 'tools-list exact-once');
  assert.equal(manifest.tools.filter(function (e) { return e.slug === slug && e.url === url; }).length, 1, 'manifest exact-once');
});
