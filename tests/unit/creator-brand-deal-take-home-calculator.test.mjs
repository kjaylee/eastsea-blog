import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_INPUT,
  validateInputs,
  calculateBrandDeal,
  buildSummary,
} from '../../tools/creator-brand-deal-take-home-calculator/logic.mjs';
import { readJSON, readText } from '../setup.mjs';

const slug = 'creator-brand-deal-take-home-calculator';
const url = `/tools/${slug}/`;
const html = readText(`tools/${slug}/index.html`);

function approx(actual, expected, tolerance = 0.01) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} ≈ ${expected} (±${tolerance})`);
}

test('tc_cbd_01_validation_rejects_negative_values', () => {
  const validation = validateInputs({ ...DEFAULT_INPUT, baseFeePerDeliverable: -1 });
  assert.equal(validation.valid, false);
  assert.match(validation.message, /baseFeePerDeliverable/);
});

test('tc_cbd_02_validation_rejects_impossible_fee_stack', () => {
  const validation = validateInputs({
    ...DEFAULT_INPUT,
    managerFeePct: 40,
    agencyFeePct: 30,
    platformFeePct: 20,
    paymentProcessingFeePct: 10,
  });
  assert.equal(validation.valid, false);
  assert.match(validation.message, /Combined manager/);
});

test('tc_cbd_03_baseline_math_returns_expected_quote_and_net', () => {
  const result = calculateBrandDeal(DEFAULT_INPUT);

  approx(result.contentSubtotal, 3600);
  approx(result.rightsSubtotal, 1800);
  approx(result.grossQuote, 5400);
  approx(result.creatorNetTakeHome, 2678.33, 0.02);
  approx(result.requiredGrossQuote, 6785.04, 0.02);
});

test('tc_cbd_04_more_rights_months_raise_quote', () => {
  const base = calculateBrandDeal(DEFAULT_INPUT);
  const expanded = calculateBrandDeal({
    ...DEFAULT_INPUT,
    usageMonths: DEFAULT_INPUT.usageMonths + 3,
    whitelistingMonths: DEFAULT_INPUT.whitelistingMonths + 2,
  });

  assert.ok(expanded.rightsSubtotal > base.rightsSubtotal);
  assert.ok(expanded.grossQuote > base.grossQuote);
});

test('tc_cbd_05_higher_target_net_requires_higher_quote', () => {
  const low = calculateBrandDeal({ ...DEFAULT_INPUT, targetNetTakeHome: 2500 });
  const high = calculateBrandDeal({ ...DEFAULT_INPUT, targetNetTakeHome: 4500 });

  assert.ok(high.requiredGrossQuote > low.requiredGrossQuote);
  assert.ok(high.requiredBaseFeePerDeliverable > low.requiredBaseFeePerDeliverable);
});

test('tc_cbd_06_zero_target_net_returns_zero_required_quote', () => {
  const result = calculateBrandDeal({ ...DEFAULT_INPUT, targetNetTakeHome: 0 });
  assert.equal(result.requiredGrossQuote, 0);
  assert.equal(result.requiredBaseFeePerDeliverable, 0);
});

test('tc_cbd_07_summary_contains_key_deal_outputs', () => {
  const summary = buildSummary(calculateBrandDeal(DEFAULT_INPUT));

  assert.match(summary, /Creator Brand Deal Take-home Summary/);
  assert.match(summary, /Brand quote:/);
  assert.match(summary, /Required quote for target:/);
  assert.match(summary, /Required base fee \/ deliverable:/);
});

test('tc_cbd_08_structural_metadata_present', () => {
  assert.match(html, /<link rel="canonical" href="https:\/\/eastsea\.monster\/tools\/creator-brand-deal-take-home-calculator\/"/i);
  assert.match(html, /"WebApplication"/i);
  assert.match(html, /aria-live="polite"/i);
  assert.match(html, /deal take-home math/i);
  assert.match(html, /Reverse-solve the quote required to hit/i);
});

test('tc_cbd_09_catalog_wiring_exact_once', () => {
  const indexHtml = readText('tools/index.html');
  const indexMd = readText('tools/index.md');
  const toolsList = readJSON('_data/tools-list.json');
  const manifest = readJSON('tools/manifest.json');

  const htmlMatches = (indexHtml.match(new RegExp(`href="${slug}/"`, 'g')) || []).length;
  const mdMatches = (indexMd.match(new RegExp(`\\(\\./${slug}/\\)`, 'g')) || []).length;
  const listMatches = toolsList.filter((entry) => entry.url === url).length;
  const manifestMatches = manifest.tools.filter((entry) => entry.slug === slug && entry.url === url).length;

  assert.equal(htmlMatches, 1, 'tools/index.html exact-once');
  assert.equal(mdMatches, 1, 'tools/index.md exact-once');
  assert.equal(listMatches, 1, '_data/tools-list.json exact-once');
  assert.equal(manifestMatches, 1, 'tools/manifest.json exact-once');

  const listEntry = toolsList.find((entry) => entry.url === url);
  assert.match(listEntry.title, /Creator Brand Deal Take-home Calculator/);
  assert.match(listEntry.description, /화이트리스팅|whitelisting/i);
  assert.match(listEntry.description, /목표|target/i);
});
