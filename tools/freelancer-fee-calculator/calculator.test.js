const test   = require('node:test');
const assert = require('node:assert/strict');
const fs     = require('node:fs');
const path   = require('node:path');

const { calculate, DEFAULTS, FEE_RATE, FIXED_PRICE_MIN } = require('./calculator.js');

function approx(actual, expected, tol = 0.01) {
  assert.ok(Math.abs(actual - expected) <= tol,
    `expected ${actual} ≈ ${expected} (±${tol})`);
}

// ── Exports & constants ──────────────────────────────────────────────────────
test('exports exist and defaults are correct', () => {
  assert.equal(typeof calculate, 'function');
  assert.equal(FEE_RATE, 0.10);
  assert.equal(FIXED_PRICE_MIN, 5.00);
  assert.equal(DEFAULTS.workMode, 'fixed-price');
  assert.equal(DEFAULTS.originalBid, 100);
  assert.equal(DEFAULTS.totalReleased, 100);
});

// ── TC1: fixed-price, bid=$100, released=$100 → fee=max(10,5)=$10, net=$90 ──
test('TC1 — fixed-price $100 bid, no overage, no seller costs', () => {
  const { result, error, warning } = calculate({
    workMode: 'fixed-price',
    originalBid: 100,
    totalReleased: 100,
    subcontractorCost: 0,
    softwareCost: 0,
    deliveryCost: 0
  }, { lang: 'en' });

  assert.equal(error, '');
  approx(result.grossReleasedAmount, 100);
  approx(result.feeOnBid, 10);         // max(100*0.10, 5) = 10
  approx(result.feeOnOverage, 0);
  approx(result.platformFee, 10);
  approx(result.payoutBeforeSellerCosts, 90);
  approx(result.netProfit, 90);
  approx(result.effectiveFeeRatePct, 10);
  assert.equal(result.breakEvenGross, 0); // no seller costs
});

// ── TC2: fixed-price, bid=$30 → $5 minimum fee applies ──────────────────────
test('TC2 — fixed-price $30 bid: $5 minimum fee applies', () => {
  const { result, error } = calculate({
    workMode: 'fixed-price',
    originalBid: 30,
    totalReleased: 30,
    subcontractorCost: 0,
    softwareCost: 0,
    deliveryCost: 0
  }, { lang: 'en' });

  assert.equal(error, '');
  approx(result.feeOnBid, 5);         // max(30*0.10=3, 5) = 5
  approx(result.platformFee, 5);
  approx(result.payoutBeforeSellerCosts, 25);
  approx(result.effectiveFeeRatePct, 16.67, 0.05);
});

// ── TC3: overage — bid=$100, released=$150 → fee=$10 + $5 = $15 ─────────────
test('TC3 — fixed-price overage: released > bid', () => {
  const { result, error, warning } = calculate({
    workMode: 'fixed-price',
    originalBid: 100,
    totalReleased: 150,
    subcontractorCost: 0,
    softwareCost: 0,
    deliveryCost: 0
  }, { lang: 'en' });

  assert.equal(error, '');
  approx(result.feeOnBid, 10);
  approx(result.overageAmount, 50);
  approx(result.feeOnOverage, 5);    // 50 * 0.10 = 5
  approx(result.platformFee, 15);
  approx(result.netProfit, 135);     // 150 - 15
  assert.ok(warning !== '', 'should note overage');
});

// ── TC4: hourly milestone — 10% flat, no minimum ────────────────────────────
test('TC4 — hourly milestone: $200 released → $20 fee', () => {
  const { result, error } = calculate({
    workMode: 'hourly',
    originalBid: 200,
    totalReleased: 200,
    subcontractorCost: 0,
    softwareCost: 0,
    deliveryCost: 0
  }, { lang: 'en' });

  assert.equal(error, '');
  approx(result.platformFee, 20);    // 200 * 0.10
  approx(result.netProfit, 180);
  approx(result.effectiveFeeRatePct, 10);
});

// ── TC5: seller costs subtract from payout ───────────────────────────────────
test('TC5 — seller costs reduce net profit', () => {
  const { result, error } = calculate({
    workMode: 'fixed-price',
    originalBid: 500,
    totalReleased: 500,
    subcontractorCost: 100,
    softwareCost: 50,
    deliveryCost: 25
  }, { lang: 'en' });

  assert.equal(error, '');
  approx(result.sellerCostTotal, 175);
  approx(result.platformFee, 50);        // max(500*0.10, 5) = 50
  approx(result.payoutBeforeSellerCosts, 450);
  approx(result.netProfit, 275);         // 450 - 175
  approx(result.breakEvenGross, 175 / 0.90, 0.02);
});

// ── TC6: negative net when costs exceed payout ──────────────────────────────
test('TC6 — negative net triggers warning', () => {
  const { result, error, warning } = calculate({
    workMode: 'fixed-price',
    originalBid: 100,
    totalReleased: 100,
    subcontractorCost: 200,
    softwareCost: 0,
    deliveryCost: 0
  }, { lang: 'en' });

  assert.equal(error, '');
  assert.ok(result.netProfit < 0, 'net should be negative');
  assert.notEqual(warning, '', 'should warn about negative net');
});

// ── TC7: validation — originalBid=0 ──────────────────────────────────────────
test('TC7 — originalBid=0 returns error', () => {
  const { result, error } = calculate({
    workMode: 'fixed-price',
    originalBid: 0,
    totalReleased: 0,
    subcontractorCost: 0,
    softwareCost: 0,
    deliveryCost: 0
  }, { lang: 'en' });

  assert.equal(result, null);
  assert.notEqual(error, '');
});

// ── TC8: validation — totalReleased < originalBid ────────────────────────────
test('TC8 — totalReleased < originalBid is invalid', () => {
  const { result, error } = calculate({
    workMode: 'fixed-price',
    originalBid: 200,
    totalReleased: 100,
    subcontractorCost: 0,
    softwareCost: 0,
    deliveryCost: 0
  }, { lang: 'en' });

  assert.equal(result, null);
  assert.notEqual(error, '');
});

// ── TC9: validation — invalid workMode ──────────────────────────────────────
test('TC9 — invalid workMode returns error', () => {
  const { result, error } = calculate({
    workMode: 'enterprise',
    originalBid: 100,
    totalReleased: 100,
    subcontractorCost: 0,
    softwareCost: 0,
    deliveryCost: 0
  }, { lang: 'en' });

  assert.equal(result, null);
  assert.notEqual(error, '');
});

// ── TC10: negative seller cost rejected ─────────────────────────────────────
test('TC10 — negative seller cost is invalid', () => {
  const { result, error } = calculate({
    workMode: 'fixed-price',
    originalBid: 100,
    totalReleased: 100,
    subcontractorCost: -10,
    softwareCost: 0,
    deliveryCost: 0
  }, { lang: 'en' });

  assert.equal(result, null);
  assert.notEqual(error, '');
});

// ── TC11: Korean error strings ───────────────────────────────────────────────
test('TC11 — Korean error strings', () => {
  const { result, error } = calculate({
    workMode: 'fixed-price',
    originalBid: 0,
    totalReleased: 0,
    subcontractorCost: 0,
    softwareCost: 0,
    deliveryCost: 0
  }, { lang: 'ko' });

  assert.equal(result, null);
  assert.ok(error.includes('입찰'), `Expected Korean error, got: ${error}`);
});

// ── TC12: break-even in $5 minimum zone (small job) ─────────────────────────
test('TC12 — break-even uses $5 minimum for small seller costs', () => {
  const { result, error } = calculate({
    workMode: 'fixed-price',
    originalBid: 100,
    totalReleased: 100,
    subcontractorCost: 10,    // < 45, so break-even = 10 + 5 = 15 (< $50)
    softwareCost: 0,
    deliveryCost: 0
  }, { lang: 'en' });

  assert.equal(error, '');
  // candidate90 = 10 / 0.90 ≈ 11.11 < 50, so uses 10 + 5 = 15
  approx(result.breakEvenGross, 15, 0.02);
});

// ── HTML scaffold checks ──────────────────────────────────────────────────────
test('HTML scaffold has required anchors', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  for (const token of ['langBtn', 'summary', 'script defer src="./calculator.js"', '/assets/analytics.js']) {
    assert.ok(html.includes(token), `Missing: ${token}`);
  }
  assert.match(html, /Freelancer Fee Calculator|Freelancer\.com/);
  assert.ok(html.includes('10%'), 'Should mention 10% fee');
  assert.ok(html.includes('$5'), 'Should mention $5 minimum');
});

// ── Discovery exact-once wiring ──────────────────────────────────────────────
test('Discovery exact-once wiring across pages', () => {
  const root  = path.join(__dirname, '..', '..');
  const slug  = 'freelancer-fee-calculator';
  const url   = `/tools/${slug}/`;

  const indexHtml = fs.readFileSync(path.join(root, 'tools', 'index.html'), 'utf8');
  const indexMd   = fs.readFileSync(path.join(root, 'tools', 'index.md'), 'utf8');
  const manifest  = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'manifest.json'), 'utf8'));

  // Use boundary-aware regex to avoid matching inside upwork-freelancer-fee-calculator
  const slugRe = new RegExp(`(?<![a-z0-9-])${slug}(?![a-z0-9-])`, 'g');
  assert.equal((indexHtml.match(slugRe) || []).length, 1, 'index.html exact-once');
  assert.equal((indexMd.match(slugRe) || []).length, 1, 'index.md exact-once');
  assert.equal(
    manifest.tools.filter(e => e.slug === slug && e.url === url).length,
    1,
    'manifest exact-once'
  );
});
