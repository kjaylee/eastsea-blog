'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const {
  calculateForward,
  calculateReverse,
  calcServiceFee,
  calcWithdrawalFee,
  calcRequiredGross,
  calcTierProgress,
  UPWORK_TIERS,
  WITHDRAWAL_METHODS
} = require('./calculator.js');

function approx(actual, expected, tolerance) {
  var tol = tolerance !== undefined ? tolerance : 0.01;
  assert.ok(
    Math.abs(actual - expected) <= tol,
    'expected ' + actual + ' ≈ ' + expected + ' (±' + tol + ')'
  );
}

// ─────────────────────────────────────────────────────────────────
// Section A — Forward Calculation (Gross → Net, ACH)
// ─────────────────────────────────────────────────────────────────

test('A1: brand-new client, single Tier 1 ($300, prior $0, ACH)', function () {
  var r = calculateForward({ gross: 300, prior: 0, method: 'ach' }, { lang: 'en' });
  assert.equal(r.error, '');
  approx(r.result.totalServiceFee, 60.00);
  approx(r.result.grossAfterServiceFee, 240.00);
  approx(r.result.withdrawalFee, 0.00);
  approx(r.result.net, 240.00);
  approx(r.result.effectiveRate, 20.00);
  assert.equal(r.result.serviceFeeBreakdown.length, 1);
  approx(r.result.serviceFeeBreakdown[0].inTier, 300.00);
  approx(r.result.serviceFeeBreakdown[0].tierFee, 60.00);
});

test('A2: brand-new client, spans Tier 1 → Tier 2 ($1200, prior $0, ACH)', function () {
  var r = calculateForward({ gross: 1200, prior: 0, method: 'ach' }, { lang: 'en' });
  assert.equal(r.error, '');
  assert.equal(r.result.serviceFeeBreakdown.length, 2);
  approx(r.result.serviceFeeBreakdown[0].inTier, 500.00);
  approx(r.result.serviceFeeBreakdown[0].tierFee, 100.00);
  approx(r.result.serviceFeeBreakdown[1].inTier, 700.00);
  approx(r.result.serviceFeeBreakdown[1].tierFee, 70.00);
  approx(r.result.totalServiceFee, 170.00);
  approx(r.result.grossAfterServiceFee, 1030.00);
  approx(r.result.net, 1030.00);
  approx(r.result.effectiveRate, 14.17, 0.02);
});

test('A3: existing Tier 2 client, single tier ($2000, prior $1000, ACH)', function () {
  var r = calculateForward({ gross: 2000, prior: 1000, method: 'ach' }, { lang: 'en' });
  assert.equal(r.error, '');
  approx(r.result.totalServiceFee, 200.00);
  approx(r.result.grossAfterServiceFee, 1800.00);
  approx(r.result.net, 1800.00);
  approx(r.result.effectiveRate, 10.00);
});

test('A4: Tier 2 → Tier 3 transition ($1000, prior $9600, ACH)', function () {
  var r = calculateForward({ gross: 1000, prior: 9600, method: 'ach' }, { lang: 'en' });
  assert.equal(r.error, '');
  assert.equal(r.result.serviceFeeBreakdown.length, 2);
  approx(r.result.serviceFeeBreakdown[0].inTier, 400.00);
  approx(r.result.serviceFeeBreakdown[0].tierFee, 40.00);
  approx(r.result.serviceFeeBreakdown[1].inTier, 600.00);
  approx(r.result.serviceFeeBreakdown[1].tierFee, 30.00);
  approx(r.result.totalServiceFee, 70.00);
  approx(r.result.net, 930.00);
  approx(r.result.effectiveRate, 7.00);
});

test('A5: full Tier 3 client ($5000, prior $15000, ACH)', function () {
  var r = calculateForward({ gross: 5000, prior: 15000, method: 'ach' }, { lang: 'en' });
  assert.equal(r.error, '');
  approx(r.result.totalServiceFee, 250.00);
  approx(r.result.grossAfterServiceFee, 4750.00);
  approx(r.result.net, 4750.00);
  approx(r.result.effectiveRate, 5.00);
});

// ─────────────────────────────────────────────────────────────────
// Section B — Withdrawal Fee Variation
// Base: gross $1000, prior $0 → service fee $150, grossAfterFee $850
// ─────────────────────────────────────────────────────────────────

test('B1: ACH — $0 withdrawal fee', function () {
  var r = calculateForward({ gross: 1000, prior: 0, method: 'ach' }, { lang: 'en' });
  approx(r.result.withdrawalFee, 0.00);
  approx(r.result.net, 850.00);
});

test('B2: PayPal — max($0.99, 1%) = $8.50 on $850', function () {
  var r = calculateForward({ gross: 1000, prior: 0, method: 'paypal' }, { lang: 'en' });
  approx(r.result.withdrawalFee, 8.50);
  approx(r.result.net, 841.50);
});

test('B3: Wire — $30 flat', function () {
  var r = calculateForward({ gross: 1000, prior: 0, method: 'wire' }, { lang: 'en' });
  approx(r.result.withdrawalFee, 30.00);
  approx(r.result.net, 820.00);
});

test('B4: Instant Pay — clamp(1%, $0.25, $15) = $8.50 on $850', function () {
  var r = calculateForward({ gross: 1000, prior: 0, method: 'instant' }, { lang: 'en' });
  approx(r.result.withdrawalFee, 8.50);
  approx(r.result.net, 841.50);
});

// ─────────────────────────────────────────────────────────────────
// Section C — Reverse Calculation
// ─────────────────────────────────────────────────────────────────

test('C1: target $240, prior $0, ACH → gross $300', function () {
  var r = calculateReverse({ netTarget: 240, prior: 0, method: 'ach' }, { lang: 'en' });
  assert.equal(r.error, '');
  approx(r.result.requiredGross, 300.00, 0.01);
});

test('C2: target $1030, prior $0, ACH → gross $1200', function () {
  var r = calculateReverse({ netTarget: 1030, prior: 0, method: 'ach' }, { lang: 'en' });
  assert.equal(r.error, '');
  approx(r.result.requiredGross, 1200.00, 0.01);
});

test('C3: target $800, prior $2000, ACH → gross $888.89', function () {
  var r = calculateReverse({ netTarget: 800, prior: 2000, method: 'ach' }, { lang: 'en' });
  assert.equal(r.error, '');
  approx(r.result.requiredGross, 888.89, 0.02);
});

test('C4: target $1000, prior $10000, Wire → gross $1084.21', function () {
  var r = calculateReverse({ netTarget: 1000, prior: 10000, method: 'wire' }, { lang: 'en' });
  assert.equal(r.error, '');
  approx(r.result.requiredGross, 1084.21, 0.02);
});

// ─────────────────────────────────────────────────────────────────
// Section D — Edge Cases
// ─────────────────────────────────────────────────────────────────

test('D1: invoice exactly at Tier 1 boundary ($500, prior $0)', function () {
  var r = calculateForward({ gross: 500, prior: 0, method: 'ach' }, { lang: 'en' });
  assert.equal(r.error, '');
  approx(r.result.totalServiceFee, 100.00);
  approx(r.result.net, 400.00);
  // Tier progress: at boundary — should be in Tier 2 now (100% of T1 consumed)
  assert.ok(r.result.tierProgress.endTotal >= 500);
});

test('D2: prior exactly at Tier 1 boundary (prior $500, gross $100)', function () {
  var r = calculateForward({ gross: 100, prior: 500, method: 'ach' }, { lang: 'en' });
  assert.equal(r.error, '');
  approx(r.result.totalServiceFee, 10.00);
  approx(r.result.net, 90.00);
  approx(r.result.effectiveRate, 10.00);
});

test('D3: invoice $0 — zero fee, no error', function () {
  var r = calculateForward({ gross: 0, prior: 0, method: 'ach' }, { lang: 'en' });
  assert.equal(r.error, '');
  approx(r.result.totalServiceFee, 0.00);
  approx(r.result.net, 0.00);
});

test('D4: PayPal minimum fee ($50 gross, prior $0 → afterFee $40, PayPal $0.99 min)', function () {
  var r = calculateForward({ gross: 50, prior: 0, method: 'paypal' }, { lang: 'en' });
  assert.equal(r.error, '');
  approx(r.result.grossAfterServiceFee, 40.00);
  approx(r.result.withdrawalFee, 0.99);
  approx(r.result.net, 39.01);
});

test('D5: Instant Pay cap — $2000 after service fee → fee capped at $15', function () {
  var wFee = calcWithdrawalFee(2000, 'instant');
  approx(wFee, 15.00);
});

// ─────────────────────────────────────────────────────────────────
// Invalid input validation
// ─────────────────────────────────────────────────────────────────

test('invalid: negative gross is rejected', function () {
  var r = calculateForward({ gross: -1, prior: 0, method: 'ach' }, { lang: 'en' });
  assert.notEqual(r.error, '');
  assert.equal(r.result, null);
});

test('invalid: NaN gross is rejected', function () {
  var r = calculateForward({ gross: NaN, prior: 0, method: 'ach' }, { lang: 'en' });
  assert.notEqual(r.error, '');
  assert.equal(r.result, null);
});

test('invalid: negative prior is rejected', function () {
  var r = calculateForward({ gross: 100, prior: -1, method: 'ach' }, { lang: 'en' });
  assert.notEqual(r.error, '');
  assert.equal(r.result, null);
});

test('invalid: unknown method is rejected', function () {
  var r = calculateForward({ gross: 100, prior: 0, method: 'bitcoin' }, { lang: 'en' });
  assert.notEqual(r.error, '');
  assert.equal(r.result, null);
});

test('invalid: reverse with netTarget < 1 is rejected', function () {
  var r = calculateReverse({ netTarget: 0, prior: 0, method: 'ach' }, { lang: 'en' });
  assert.notEqual(r.error, '');
  assert.equal(r.result, null);
});

// ─────────────────────────────────────────────────────────────────
// Tier progress
// ─────────────────────────────────────────────────────────────────

test('tier progress: $300 gross, prior $0 → 60% through Tier 1', function () {
  var tp = calcTierProgress(300, 0);
  assert.equal(tp.currentTierIndex, 0);
  approx(tp.pctThroughTier, 60.00, 0.1);
  approx(tp.remaining, 200.00);
  assert.equal(tp.isMaxTier, false);
});

test('tier progress: prior $15000, gross $500 → fully in Tier 3', function () {
  var tp = calcTierProgress(500, 15000);
  assert.equal(tp.currentTierIndex, 2);
  assert.equal(tp.isMaxTier, true);
  assert.equal(tp.nextRate, null);
});

// ─────────────────────────────────────────────────────────────────
// Withdrawal comparison table
// ─────────────────────────────────────────────────────────────────

test('allWithdrawals: forward result has all 4 methods', function () {
  var r = calculateForward({ gross: 1000, prior: 0, method: 'ach' }, { lang: 'en' });
  var w = r.result.allWithdrawals;
  assert.ok(w.ach !== undefined);
  assert.ok(w.paypal !== undefined);
  assert.ok(w.wire !== undefined);
  assert.ok(w.instant !== undefined);
  approx(w.ach.fee, 0.00);
  approx(w.paypal.fee, 8.50);
  approx(w.wire.fee, 30.00);
  approx(w.instant.fee, 8.50);
});

// ─────────────────────────────────────────────────────────────────
// Discovery integration (exact-once in all 4 catalog files)
// ─────────────────────────────────────────────────────────────────

test('TC-discovery: upwork-fee-calculator is wired exactly once across the 4 catalog files', function () {
  var repoRoot = path.resolve(__dirname, '..', '..');
  var slug = 'upwork-fee-calculator';
  var url = '/tools/' + slug + '/';

  var indexHtml = fs.readFileSync(path.join(repoRoot, 'tools', 'index.html'), 'utf8');
  var indexMd = fs.readFileSync(path.join(repoRoot, 'tools', 'index.md'), 'utf8');
  var toolsList = JSON.parse(fs.readFileSync(path.join(repoRoot, '_data', 'tools-list.json'), 'utf8'));
  var manifest = JSON.parse(fs.readFileSync(path.join(repoRoot, 'tools', 'manifest.json'), 'utf8'));

  assert.equal((indexHtml.match(new RegExp('href="' + slug + '/"', 'g')) || []).length, 1, 'tools/index.html exact-once');
  assert.equal((indexMd.match(new RegExp('\\./' + slug + '/', 'g')) || []).length, 1, 'tools/index.md exact-once');
  assert.equal(toolsList.filter(function (entry) { return entry.url === url; }).length, 1, '_data/tools-list.json exact-once');
  assert.equal(manifest.tools.filter(function (entry) { return entry.slug === slug && entry.url === url; }).length, 1, 'tools/manifest.json exact-once');

  var listEntry = toolsList.find(function (entry) { return entry.url === url; });
  assert.match(listEntry.title, /Upwork Fee Calculator/);
  assert.match(listEntry.description, /20%\/10%\/5%/);
});
