const test   = require('node:test');
const assert = require('node:assert/strict');
const fs     = require('node:fs');
const path   = require('node:path');

const { calculate, DEFAULTS, TIER1_LIMIT, TIER2_LIMIT, RATE1, RATE2, RATE3, computeFee } = require('./calculator.js');

function approx(actual, expected, tol = 0.01) {
  assert.ok(Math.abs(actual - expected) <= tol,
    `expected ${actual} ≈ ${expected} (±${tol})`);
}

// ── Exports & constants ──────────────────────────────────────────────────────
test('exports exist and constants are correct', () => {
  assert.equal(typeof calculate, 'function');
  assert.equal(typeof computeFee, 'function');
  assert.equal(TIER1_LIMIT, 250);
  assert.equal(TIER2_LIMIT, 5000);
  assert.equal(RATE1, 0.20);
  assert.equal(RATE2, 0.075);
  assert.equal(RATE3, 0.035);
  assert.equal(DEFAULTS.priorLifetimeBilled, 0);
  assert.equal(DEFAULTS.currentInvoice, 500);
});

// ── TC1: first invoice, entirely in Tier 1 (< £250) ─────────────────────────
test('TC1 — first £100 invoice: entirely in Tier 1 at 20%', () => {
  const { result, error } = calculate({
    priorLifetimeBilled: 0,
    currentInvoice: 100,
    subcontractorCost: 0,
    softwareCost: 0,
    deliveryCost: 0
  }, { lang: 'en' });

  assert.equal(error, '');
  approx(result.serviceFeeTotal, 20);     // 100 * 0.20
  approx(result.tier1Amount, 100);
  approx(result.tier1Fee, 20);
  approx(result.tier2Amount, 0);
  approx(result.tier3Amount, 0);
  approx(result.payoutBeforeSellerCosts, 80);
  approx(result.effectiveFeeRatePct, 20);
  approx(result.postInvoiceCumulativeBilled, 100);
});

// ── TC2: invoice spans Tier 1 and Tier 2 ────────────────────────────────────
test('TC2 — £0 prior, £500 invoice spans Tier 1 (£250@20%) and Tier 2 (£250@7.5%)', () => {
  const { result, error } = calculate({
    priorLifetimeBilled: 0,
    currentInvoice: 500,
    subcontractorCost: 0,
    softwareCost: 0,
    deliveryCost: 0
  }, { lang: 'en' });

  assert.equal(error, '');
  approx(result.tier1Amount, 250);
  approx(result.tier1Fee, 50);            // 250 * 0.20
  approx(result.tier2Amount, 250);
  approx(result.tier2Fee, 18.75);         // 250 * 0.075
  approx(result.tier3Amount, 0);
  approx(result.serviceFeeTotal, 68.75);  // 50 + 18.75
  approx(result.payoutBeforeSellerCosts, 431.25);
  approx(result.effectiveFeeRatePct, 13.75, 0.05);
  approx(result.postInvoiceCumulativeBilled, 500);
});

// ── TC3: prior £4,900, invoice £200 spans Tier 2 → Tier 3 ──────────────────
test('TC3 — prior £4,900, £200 invoice: £100@7.5% + £100@3.5%', () => {
  const { result, error } = calculate({
    priorLifetimeBilled: 4900,
    currentInvoice: 200,
    subcontractorCost: 0,
    softwareCost: 0,
    deliveryCost: 0
  }, { lang: 'en' });

  assert.equal(error, '');
  approx(result.tier1Amount, 0);
  approx(result.tier2Amount, 100);        // fills last £100 of Tier 2 (4900→5000)
  approx(result.tier2Fee, 7.5);           // 100 * 0.075
  approx(result.tier3Amount, 100);        // remainder in Tier 3
  approx(result.tier3Fee, 3.5);           // 100 * 0.035
  approx(result.serviceFeeTotal, 11.0);   // 7.5 + 3.5
  approx(result.postInvoiceCumulativeBilled, 5100);
});

// ── TC4: all in Tier 3 ───────────────────────────────────────────────────────
test('TC4 — prior £6,000, invoice £1,000: entirely in Tier 3 at 3.5%', () => {
  const { result, error } = calculate({
    priorLifetimeBilled: 6000,
    currentInvoice: 1000,
    subcontractorCost: 0,
    softwareCost: 0,
    deliveryCost: 0
  }, { lang: 'en' });

  assert.equal(error, '');
  approx(result.tier1Amount, 0);
  approx(result.tier2Amount, 0);
  approx(result.tier3Amount, 1000);
  approx(result.serviceFeeTotal, 35);     // 1000 * 0.035
  approx(result.effectiveFeeRatePct, 3.5);
  approx(result.nextInvoiceTierRate, RATE3);
});

// ── TC5: seller costs reduce net profit ─────────────────────────────────────
test('TC5 — seller costs reduce net profit', () => {
  const { result, error } = calculate({
    priorLifetimeBilled: 0,
    currentInvoice: 500,
    subcontractorCost: 100,
    softwareCost: 50,
    deliveryCost: 25
  }, { lang: 'en' });

  assert.equal(error, '');
  approx(result.sellerCostTotal, 175);
  approx(result.serviceFeeTotal, 68.75);
  approx(result.payoutBeforeSellerCosts, 431.25);
  approx(result.netProfit, 256.25);       // 431.25 - 175
});

// ── TC6: negative net triggers warning ──────────────────────────────────────
test('TC6 — seller costs > payout → negative net + warning', () => {
  const { result, error, warning } = calculate({
    priorLifetimeBilled: 0,
    currentInvoice: 100,
    subcontractorCost: 200,
    softwareCost: 0,
    deliveryCost: 0
  }, { lang: 'en' });

  assert.equal(error, '');
  assert.ok(result.netProfit < 0, 'net should be negative');
  assert.notEqual(warning, '', 'should emit a warning');
});

// ── TC7: validation — currentInvoice=0 ──────────────────────────────────────
test('TC7 — currentInvoice=0 returns validation error', () => {
  const { result, error } = calculate({
    priorLifetimeBilled: 0,
    currentInvoice: 0,
    subcontractorCost: 0,
    softwareCost: 0,
    deliveryCost: 0
  }, { lang: 'en' });

  assert.equal(result, null);
  assert.notEqual(error, '');
});

// ── TC8: validation — negative prior ────────────────────────────────────────
test('TC8 — negative priorLifetimeBilled returns error', () => {
  const { result, error } = calculate({
    priorLifetimeBilled: -100,
    currentInvoice: 200,
    subcontractorCost: 0,
    softwareCost: 0,
    deliveryCost: 0
  }, { lang: 'en' });

  assert.equal(result, null);
  assert.notEqual(error, '');
});

// ── TC9: Korean error strings ─────────────────────────────────────────────────
test('TC9 — Korean error strings', () => {
  const { result, error } = calculate({
    priorLifetimeBilled: 0,
    currentInvoice: 0,
    subcontractorCost: 0,
    softwareCost: 0,
    deliveryCost: 0
  }, { lang: 'ko' });

  assert.equal(result, null);
  assert.ok(error.includes('인보이스'), `Expected Korean error, got: ${error}`);
});

// ── TC10: computeFee unit test ────────────────────────────────────────────────
test('TC10 — computeFee pure function matches manual calc', () => {
  // prior=0, invoice=5500: 250@20% + 4750@7.5% + 500@3.5% = 50 + 356.25 + 17.5 = 423.75
  approx(computeFee(0, 5500), 423.75);

  // prior=250, invoice=100: 100@7.5% = 7.5
  approx(computeFee(250, 100), 7.5);

  // prior=5000, invoice=2000: 2000@3.5% = 70
  approx(computeFee(5000, 2000), 70);
});

// ── TC11: post-invoice cumulative is correct ─────────────────────────────────
test('TC11 — post-invoice cumulative = prior + current', () => {
  const { result } = calculate({
    priorLifetimeBilled: 1234.56,
    currentInvoice: 500,
    subcontractorCost: 0,
    softwareCost: 0,
    deliveryCost: 0
  }, { lang: 'en' });

  approx(result.postInvoiceCumulativeBilled, 1734.56);
});

// ── TC12: next tier rate after invoice ───────────────────────────────────────
test('TC12 — nextInvoiceTierRate reflects post-invoice position', () => {
  // After £200 invoice when prior=0: cumulative=200, still in Tier 1
  const r1 = calculate({ priorLifetimeBilled: 0, currentInvoice: 200, subcontractorCost: 0, softwareCost: 0, deliveryCost: 0 }, {});
  assert.equal(r1.result.nextInvoiceTierRate, RATE1);

  // After £300 invoice when prior=0: cumulative=300, now in Tier 2
  const r2 = calculate({ priorLifetimeBilled: 0, currentInvoice: 300, subcontractorCost: 0, softwareCost: 0, deliveryCost: 0 }, {});
  assert.equal(r2.result.nextInvoiceTierRate, RATE2);

  // After £200 invoice when prior=6000: cumulative=6200, in Tier 3
  const r3 = calculate({ priorLifetimeBilled: 6000, currentInvoice: 200, subcontractorCost: 0, softwareCost: 0, deliveryCost: 0 }, {});
  assert.equal(r3.result.nextInvoiceTierRate, RATE3);
});

// ── HTML scaffold checks ──────────────────────────────────────────────────────
test('HTML scaffold has required anchors', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  for (const token of ['langBtn', 'summary', 'script defer src="./calculator.js"', '/assets/analytics.js']) {
    assert.ok(html.includes(token), `Missing: ${token}`);
  }
  assert.match(html, /PeoplePerHour Fee Calculator|PeoplePerHour 수수료 계산기/);
  assert.ok(html.includes('20%'), 'Should mention 20% tier');
  assert.ok(html.includes('7.5%'), 'Should mention 7.5% tier');
  assert.ok(html.includes('3.5%'), 'Should mention 3.5% tier');
});

// ── Discovery exact-once wiring ──────────────────────────────────────────────
test('Discovery exact-once wiring across pages', () => {
  const root = path.join(__dirname, '..', '..');
  const slug = 'peopleperhour-fee-calculator';
  const url  = `/tools/${slug}/`;

  const indexHtml = fs.readFileSync(path.join(root, 'tools', 'index.html'), 'utf8');
  const indexMd   = fs.readFileSync(path.join(root, 'tools', 'index.md'), 'utf8');
  const manifest  = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'manifest.json'), 'utf8'));

  assert.equal((indexHtml.match(new RegExp(slug, 'g')) || []).length, 1, 'index.html exact-once');
  assert.equal((indexMd.match(new RegExp(slug, 'g')) || []).length, 1, 'index.md exact-once');
  assert.equal(
    manifest.tools.filter(e => e.slug === slug && e.url === url).length,
    1,
    'manifest exact-once'
  );
});
