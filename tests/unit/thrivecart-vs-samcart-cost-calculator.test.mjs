import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

import {
  DEFAULT_INPUT,
  calculateBaseContributionMarginRate,
  calculateComparison,
  calculateRequiredSamcartLift,
  calculateScenario,
  getBreakEvenMonth,
  validateInputs,
} from '../../tools/thrivecart-vs-samcart-cost-calculator/logic.mjs';
import { BLOG_ROOT, readJSON, readText } from '../setup.mjs';

const slug = 'thrivecart-vs-samcart-cost-calculator';
const url = `/tools/${slug}/`;
const html = readText(`tools/${slug}/index.html`);

function approx(actual, expected, tolerance = 0.01) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} ≈ ${expected} (±${tolerance})`);
}

test('TC-TS-01 baseline break-even month is 7', () => {
  assert.equal(getBreakEvenMonth(DEFAULT_INPUT), 7);
});

test('TC-TS-02 required SamCart lift matches platform delta divided by contribution margin', () => {
  const margin = calculateBaseContributionMarginRate(DEFAULT_INPUT);
  const thrive = calculateScenario(DEFAULT_INPUT, 'thrivecart');
  const sam = calculateScenario({ ...DEFAULT_INPUT, samcartRevenueLiftPct: 0 }, 'samcart');
  const required = calculateRequiredSamcartLift(DEFAULT_INPUT);

  const expectedLift = (sam.equivalentMonthlyPlatformCost - thrive.equivalentMonthlyPlatformCost) / margin.baseContributionMarginRate;
  approx(required.monthlyGrossLiftNeeded, expectedLift, 0.01);
  approx(required.liftPctNeeded, (expectedLift / DEFAULT_INPUT.monthlyGrossSales) * 100, 0.01);
  approx(required.monthlyPlatformDelta, 37.75, 0.01);
});

test('TC-TS-03 SamCart wins when user-entered lift is strong enough', () => {
  const result = calculateComparison({
    ...DEFAULT_INPUT,
    samcartRevenueLiftPct: 5,
  });

  assert.equal(result.winner.key, 'samcart');
  assert.ok(result.samcart.cumulativeNetAfterPlatform > result.thrivecart.cumulativeNetAfterPlatform);
  approx(result.samcart.monthlyNetAfterPlatform, 5211.5, 0.01);
});

test('TC-TS-04 target gross planner returns deterministic values', () => {
  const result = calculateComparison(DEFAULT_INPUT);

  approx(result.thrivecart.requiredBaselineGrossForTargetNet, 3359.63, 0.01);
  approx(result.samcart.requiredBaselineGrossForTargetNet, 3400.0, 0.01);
  approx(result.thrivecart.cumulativeNetAfterPlatform, 59625, 0.01);
  approx(result.samcart.cumulativeNetAfterPlatform, 59172, 0.01);
  approx(result.cumulativeNetDelta, -453, 0.01);
});

test('TC-TS-05 invalid inputs are rejected', () => {
  const cases = [
    { ...DEFAULT_INPUT, monthlyGrossSales: 0 },
    { ...DEFAULT_INPUT, successfulPayments: 0 },
    { ...DEFAULT_INPUT, successfulPayments: 10.5 },
    { ...DEFAULT_INPUT, planningMonths: 0 },
    { ...DEFAULT_INPUT, refundRatePct: -1 },
    { ...DEFAULT_INPUT, processorRatePct: 101 },
    { ...DEFAULT_INPUT, processorFlatFee: -1 },
    { ...DEFAULT_INPUT, samcartRevenueLiftPct: -1 },
  ];

  for (const input of cases) {
    const validation = validateInputs(input);
    assert.equal(validation.valid, false);
    assert.notEqual(validation.message, '');
  }
});

test('TC-TS-06 structural metadata and framing are present', () => {
  assert.match(html, /<link rel="canonical" href="https:\/\/eastsea\.monster\/tools\/thrivecart-vs-samcart-cost-calculator\/"/i);
  assert.match(html, /"WebApplication"/i);
  assert.match(html, /\/assets\/analytics\.js/i);
  assert.match(html, /ThriveCart vs SamCart Cost Calculator/i);
  assert.match(html, /one-time ThriveCart purchase/i);
  assert.match(html, /monthly SamCart subscription/i);
  assert.match(html, /break-even month/i);
});

test('TC-TS-07 discovery exact-once wiring', () => {
  const indexHtml = readText('tools/index.html');
  const indexMd = readText('tools/index.md');
  const toolsList = readJSON('_data/tools-list.json');
  let manifest = readJSON('tools/manifest.json');

  if (!manifest.tools.some((entry) => entry.slug === slug && entry.url === url)) {
    execFileSync('bash', ['scripts/build-manifests.sh'], { cwd: BLOG_ROOT, stdio: 'ignore' });
    manifest = readJSON('tools/manifest.json');
  }

  assert.equal((indexHtml.match(new RegExp(`href="${slug}/"`, 'g')) || []).length, 1, 'tools/index.html exact-once');
  assert.equal((indexMd.match(new RegExp(`\(\./${slug}/\)`, 'g')) || []).length, 1, 'tools/index.md exact-once');
  assert.equal(toolsList.filter((entry) => entry.url === url).length, 1, '_data/tools-list.json exact-once');
  assert.equal(manifest.tools.filter((entry) => entry.slug === slug && entry.url === url).length, 1, 'tools/manifest.json exact-once');

  const listEntry = toolsList.find((entry) => entry.url === url);
  assert.match(listEntry.title, /ThriveCart vs SamCart Cost Calculator/);
  assert.match(listEntry.description, /break-even/i);
});
