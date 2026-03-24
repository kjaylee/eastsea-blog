'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { calculate, DEFAULT_INPUTS, computeAppleFeeRatePct } = require('./calculator.js');

function approx(actual, expected, tolerance = 1e-9) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} ≈ ${expected} (±${tolerance})`);
}

test('exports the expected defaults and fee helper', () => {
  assert.equal(DEFAULT_INPUTS.price, 9.99);
  assert.equal(DEFAULT_INPUTS.appleSmallBusiness, true);
  assert.equal(DEFAULT_INPUTS.googlePlaySubscriptionFeeRate, 15);
  approx(computeAppleFeeRatePct({
    appleSmallBusiness: false,
    appleLongTermSharePct: 60,
    appleFirstYearFeeRate: 30,
    applePostYearOneFeeRate: 15,
  }), 21);
});

test('TC-AG-01 standard Apple first-year vs Google Play', () => {
  const { ok, result } = calculate({
    price: 10,
    billedSubscribers: 1000,
    refundRate: 0,
    appleSmallBusiness: false,
    appleLongTermSharePct: 0,
    monthlyOpsCost: 0,
  });

  assert.equal(ok, true);
  approx(result.grossBillings, 10000);
  approx(result.recognizedBillings, 10000);
  approx(result.appleFeeRatePct, 30);
  approx(result.appleFeeAmount, 3000);
  approx(result.appleNetBeforeOps, 7000);
  approx(result.googleFeeAmount, 1500);
  approx(result.googleNetBeforeOps, 8500);
  approx(result.monthlyDelta, 1500);
  approx(result.annualDelta, 18000);
  approx(result.requiredApplePrice, 12.1428571429, 1e-10);
});

test('TC-AG-02 Apple Small Business parity with Google Play', () => {
  const { ok, result } = calculate({
    price: 10,
    billedSubscribers: 1000,
    refundRate: 0,
    appleSmallBusiness: true,
    appleLongTermSharePct: 0,
    monthlyOpsCost: 0,
  });

  assert.equal(ok, true);
  approx(result.appleFeeRatePct, 15);
  approx(result.appleFeeAmount, 1500);
  approx(result.appleNetBeforeOps, 8500);
  approx(result.googleNetBeforeOps, 8500);
  approx(result.monthlyDelta, 0);
  approx(result.annualDelta, 0);
  approx(result.requiredApplePrice, 10);
});

test('TC-AG-03 mixed Apple subscriber base narrows but does not erase the gap', () => {
  const { ok, result } = calculate({
    price: 10,
    billedSubscribers: 1000,
    refundRate: 0,
    appleSmallBusiness: false,
    appleLongTermSharePct: 60,
    monthlyOpsCost: 0,
  });

  assert.equal(ok, true);
  approx(result.appleFeeRatePct, 21);
  approx(result.appleFeeAmount, 2100);
  approx(result.appleNetBeforeOps, 7900);
  approx(result.googleNetBeforeOps, 8500);
  approx(result.monthlyDelta, 600);
  approx(result.annualDelta, 7200);
  approx(result.requiredApplePrice, 10.7594936709, 1e-10);
});

test('TC-AG-04 refunds reduce both channels before fee application', () => {
  const { ok, result } = calculate({
    price: 10,
    billedSubscribers: 1000,
    refundRate: 10,
    appleSmallBusiness: false,
    appleLongTermSharePct: 0,
    monthlyOpsCost: 0,
  });

  assert.equal(ok, true);
  approx(result.grossBillings, 10000);
  approx(result.refundedAmount, 1000);
  approx(result.recognizedBillings, 9000);
  approx(result.appleFeeAmount, 2700);
  approx(result.appleNetBeforeOps, 6300);
  approx(result.googleFeeAmount, 1350);
  approx(result.googleNetBeforeOps, 7650);
  approx(result.monthlyDelta, 1350);
  approx(result.annualDelta, 16200);
  approx(result.requiredApplePrice, 12.1428571429, 1e-10);
});

test('TC-AG-05 shared monthly ops cost affects both channels equally', () => {
  const { ok, result } = calculate({
    price: 10,
    billedSubscribers: 1000,
    refundRate: 0,
    appleSmallBusiness: false,
    appleLongTermSharePct: 0,
    monthlyOpsCost: 500,
  });

  assert.equal(ok, true);
  approx(result.appleNetBeforeOps, 7000);
  approx(result.googleNetBeforeOps, 8500);
  approx(result.appleNetAfterOps, 6500);
  approx(result.googleNetAfterOps, 8000);
  approx(result.monthlyDelta, 1500);
  approx(result.annualDelta, 18000);
});

test('TC-AG-06 zero subscribers does not crash parity math', () => {
  const { ok, result } = calculate({
    price: 10,
    billedSubscribers: 0,
    refundRate: 0,
    appleSmallBusiness: false,
    appleLongTermSharePct: 0,
    monthlyOpsCost: 0,
  });

  assert.equal(ok, true);
  approx(result.grossBillings, 0);
  approx(result.recognizedBillings, 0);
  approx(result.appleNetBeforeOps, 0);
  approx(result.googleNetBeforeOps, 0);
  approx(result.monthlyDelta, 0);
  approx(result.annualDelta, 0);
  assert.equal(result.requiredApplePrice, null);
  assert.match(result.parityNote, /unavailable/);
});

test('TC-AG-07 full long-term Apple mix reaches Google parity without Small Business', () => {
  const { ok, result } = calculate({
    price: 10,
    billedSubscribers: 1000,
    refundRate: 0,
    appleSmallBusiness: false,
    appleLongTermSharePct: 100,
    monthlyOpsCost: 0,
  });

  assert.equal(ok, true);
  approx(result.appleFeeRatePct, 15);
  approx(result.appleNetBeforeOps, 8500);
  approx(result.googleNetBeforeOps, 8500);
  approx(result.monthlyDelta, 0);
  approx(result.requiredApplePrice, 10);
});

test('TC-AG-08 validation rejects invalid refund bounds', () => {
  const negative = calculate({ price: 10, billedSubscribers: 1000, refundRate: -5 });
  const over = calculate({ price: 10, billedSubscribers: 1000, refundRate: 140 });

  assert.equal(negative.ok, false);
  assert.equal(over.ok, false);
  assert.match(negative.errors.join(' '), /refundRate/);
  assert.match(over.errors.join(' '), /refundRate/);
});

test('HTML scaffold includes required anchors and copy', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

  for (const token of [
    'App Store vs Google Play Subscription Profit Comparator',
    'smallBusinessToggle',
    'advancedAssumptions',
    'data-long-term-preset="25"',
    'data-long-term-preset="100"',
    'Apple price needed to match Google Play',
    'script src="./calculator.js"',
    '/assets/analytics.js'
  ]) {
    assert.ok(html.includes(token), token);
  }
});

test('catalog integration exists exactly once across discovery surfaces', () => {
  const repoRoot = path.join(__dirname, '..', '..');
  const slug = 'app-store-vs-google-play-subscription-profit-comparator';
  const url = `/tools/${slug}/`;

  const htmlIndex = fs.readFileSync(path.join(repoRoot, 'tools', 'index.html'), 'utf8');
  const markdownIndex = fs.readFileSync(path.join(repoRoot, 'tools', 'index.md'), 'utf8');
  const manifest = JSON.parse(fs.readFileSync(path.join(repoRoot, 'tools', 'manifest.json'), 'utf8'));
  const toolsList = JSON.parse(fs.readFileSync(path.join(repoRoot, '_data', 'tools-list.json'), 'utf8'));

  const htmlMatches = (htmlIndex.match(new RegExp(`href="${slug}/"`, 'g')) || []).length;
  const mdMatches = (markdownIndex.match(new RegExp(`\\(\\./${slug}/\\)`, 'g')) || []).length;
  const manifestMatches = manifest.tools.filter((entry) => entry.slug === slug && entry.url === url).length;
  const listMatches = toolsList.filter((entry) => entry.url === url).length;

  assert.equal(htmlMatches, 1, 'tools/index.html should link to the tool exactly once');
  assert.equal(mdMatches, 1, 'tools/index.md should reference the tool exactly once');
  assert.equal(manifestMatches, 1, 'tools/manifest.json should include the tool exactly once');
  assert.equal(listMatches, 1, '_data/tools-list.json should include the tool exactly once');
});
