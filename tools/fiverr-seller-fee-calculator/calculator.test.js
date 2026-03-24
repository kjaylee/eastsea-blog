const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { calculate, DEFAULTS, FIVERR_FEE_RATE } = require('./calculator.js');

function approx(actual, expected, tol = 0.01) {
  assert.ok(Math.abs(actual - expected) <= tol, `expected ${actual} ≈ ${expected} (±${tol})`);
}

test('exports exist and defaults are correct', () => {
  assert.equal(typeof calculate, 'function');
  assert.equal(DEFAULTS.gigPrice, 25);
  assert.equal(DEFAULTS.numberOfOrders, 10);
  assert.equal(DEFAULTS.tipAmount, 0);
  assert.equal(DEFAULTS.sellerPlusMonthlyFee, 0);
  assert.equal(FIVERR_FEE_RATE, 0.20);
});

// TC1: gigPrice=25, orders=20, tips=0, sellerPlus=0 → gross=500, fee=100, net=400, rate=80%
test('TC1 — baseline 20 orders at $25', () => {
  const { result, error, warning } = calculate({
    gigPrice: 25,
    numberOfOrders: 20,
    tipAmount: 0,
    sellerPlusMonthlyFee: 0,
    targetMonthlyNet: 0
  }, { lang: 'en' });

  assert.equal(error, '');
  assert.equal(warning, '');
  approx(result.grossRevenue, 500);
  approx(result.fiverrFee, 100);
  approx(result.netBeforeSellerPlus, 400);
  approx(result.netTakeHome, 400);
  approx(result.effectiveTakeHomePct, 80);
  approx(result.revenuePerOrder, 20);
  assert.equal(result.requiredOrdersForTarget, null);
});

// TC2: gigPrice=100, orders=10, tips=50, sellerPlus=0 → gross=1050, fee=210, net=840
test('TC2 — tips are subject to 20% fee', () => {
  const { result, error } = calculate({
    gigPrice: 100,
    numberOfOrders: 10,
    tipAmount: 50,
    sellerPlusMonthlyFee: 0,
    targetMonthlyNet: 0
  }, { lang: 'en' });

  assert.equal(error, '');
  approx(result.grossRevenue, 1050);
  approx(result.fiverrFee, 210);
  approx(result.tipFeeTotal, 10);
  approx(result.netBeforeSellerPlus, 840);
  approx(result.netTakeHome, 840);
  approx(result.effectiveTakeHomePct, 80);
});

// TC3: gigPrice=5, orders=100, tips=0, sellerPlus=29.99 → net=370.01
test('TC3 — Seller Plus subscription reduces net', () => {
  const { result, error } = calculate({
    gigPrice: 5,
    numberOfOrders: 100,
    tipAmount: 0,
    sellerPlusMonthlyFee: 29.99,
    targetMonthlyNet: 0
  }, { lang: 'en' });

  assert.equal(error, '');
  approx(result.grossRevenue, 500);
  approx(result.fiverrFee, 100);
  approx(result.netBeforeSellerPlus, 400);
  approx(result.sellerPlusCost, 29.99);
  approx(result.netTakeHome, 370.01);
});

// TC4: gigPrice=0 → validation error
test('TC4 — gigPrice=0 returns validation error', () => {
  const { result, error } = calculate({
    gigPrice: 0,
    numberOfOrders: 10,
    tipAmount: 0,
    sellerPlusMonthlyFee: 0,
    targetMonthlyNet: 0
  }, { lang: 'en' });

  assert.equal(result, null);
  assert.notEqual(error, '');
});

// TC5: target=1000, gigPrice=50, sellerPlus=0 → requiredOrders=25
test('TC5 — reverse calc: requiredOrdersForTarget=25', () => {
  const { result, error } = calculate({
    gigPrice: 50,
    numberOfOrders: 1,
    tipAmount: 0,
    sellerPlusMonthlyFee: 0,
    targetMonthlyNet: 1000
  }, { lang: 'en' });

  assert.equal(error, '');
  // netPerOrder = 50 * 0.80 = 40; ceil(1000/40) = 25
  assert.equal(result.requiredOrdersForTarget, 25);
});

// TC6: impossibly high sellerPlus with low gross → negative net + warning
test('TC6 — high Seller Plus causes negative net with warning', () => {
  const { result, error, warning } = calculate({
    gigPrice: 5,
    numberOfOrders: 1,
    tipAmount: 0,
    sellerPlusMonthlyFee: 500,
    targetMonthlyNet: 0
  }, { lang: 'en' });

  assert.equal(error, '');
  assert.ok(result.netTakeHome < 0, 'netTakeHome should be negative');
  assert.notEqual(warning, '', 'should emit a warning');
});

test('TC7 — fractional orders rejected', () => {
  const { result, error } = calculate({
    gigPrice: 25,
    numberOfOrders: 1.5,
    tipAmount: 0,
    sellerPlusMonthlyFee: 0,
    targetMonthlyNet: 0
  }, { lang: 'en' });

  assert.equal(result, null);
  assert.notEqual(error, '');
});

test('TC8 — negative tip rejected', () => {
  const { result, error } = calculate({
    gigPrice: 25,
    numberOfOrders: 5,
    tipAmount: -10,
    sellerPlusMonthlyFee: 0,
    targetMonthlyNet: 0
  }, { lang: 'en' });

  assert.equal(result, null);
  assert.notEqual(error, '');
});

test('TC9 — Korean strings work', () => {
  const { result, error } = calculate({
    gigPrice: 0,
    numberOfOrders: 5,
    tipAmount: 0,
    sellerPlusMonthlyFee: 0,
    targetMonthlyNet: 0
  }, { lang: 'ko' });

  assert.equal(result, null);
  assert.ok(error.includes('0보다 커야'));
});

test('HTML scaffold has required anchors', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  for (const token of ['langBtn', 'summary', 'script defer src="./calculator.js"', '/assets/analytics.js']) {
    assert.ok(html.includes(token), `Missing: ${token}`);
  }
  assert.match(html, /Fiverr Seller Fee Calculator|Fiverr 셀러 수수료 계산기/);
});

test('Discovery exact-once wiring across pages', () => {
  const root = path.join(__dirname, '..', '..');
  const slug = 'fiverr-seller-fee-calculator';
  const url = `/tools/${slug}/`;
  const indexHtml = fs.readFileSync(path.join(root, 'tools', 'index.html'), 'utf8');
  const indexMd = fs.readFileSync(path.join(root, 'tools', 'index.md'), 'utf8');
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'manifest.json'), 'utf8'));

  assert.equal((indexHtml.match(new RegExp(slug, 'g')) || []).length, 1, 'index.html exact-once');
  assert.equal((indexMd.match(new RegExp(slug, 'g')) || []).length, 1, 'index.md exact-once');
  assert.equal(manifest.tools.filter((e) => e.slug === slug && e.url === url).length, 1, 'manifest exact-once');
});
