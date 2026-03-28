import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_INPUT,
  calculateEbookRoyalty,
  calculatePaperbackRoyalty,
  buildSummary,
} from '../../tools/amazon-kdp-royalty-calculator/logic.mjs';
import { readJSON, readText } from '../setup.mjs';

const slug = 'amazon-kdp-royalty-calculator';
const url = `/tools/${slug}/`;
const html = readText(`tools/${slug}/index.html`);

function approx(actual, expected, tolerance = 0.01) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} ≈ ${expected} (±${tolerance})`);
}

test('tc_kdp_01_ebook_35_percent_matches_public_example_style', () => {
  const result = calculateEbookRoyalty({
    ...DEFAULT_INPUT,
    format: 'ebook',
    ebookMarket: 'us',
    ebookListPrice: 0.99,
    ebookUnitsSold: 100,
    ebookRoyaltyPlan: '35',
    ebookFileSizeMb: 2,
    ebookVatRatePct: 0,
    ebookEligibleSalesPct: 100,
  });

  approx(result.royaltyPerSale, 0.35, 0.01);
  approx(result.monthlyRoyalty, 34.65, 0.01);
  approx(result.monthlyRoyaltyAt35, 34.65, 0.01);
});

test('tc_kdp_02_ebook_70_percent_subtracts_delivery_cost', () => {
  const result = calculateEbookRoyalty({
    ...DEFAULT_INPUT,
    format: 'ebook',
    ebookMarket: 'us',
    ebookListPrice: 2.99,
    ebookUnitsSold: 100,
    ebookRoyaltyPlan: '70',
    ebookFileSizeMb: 2,
    ebookVatRatePct: 0,
    ebookEligibleSalesPct: 100,
  });

  approx(result.deliveryCostPerSale, 0.3, 0.001);
  approx(result.royaltyPerSale, 1.88, 0.01);
  approx(result.monthlyRoyalty, 188.3, 0.01);
});

test('tc_kdp_03_ebook_partial_eligible_share_blends_35_and_70', () => {
  const all35 = calculateEbookRoyalty({
    ...DEFAULT_INPUT,
    format: 'ebook',
    ebookMarket: 'us',
    ebookListPrice: 4.99,
    ebookUnitsSold: 100,
    ebookRoyaltyPlan: '35',
    ebookFileSizeMb: 2,
    ebookVatRatePct: 0,
    ebookEligibleSalesPct: 100,
  });
  const partial = calculateEbookRoyalty({
    ...DEFAULT_INPUT,
    format: 'ebook',
    ebookMarket: 'us',
    ebookListPrice: 4.99,
    ebookUnitsSold: 100,
    ebookRoyaltyPlan: '70',
    ebookFileSizeMb: 2,
    ebookVatRatePct: 0,
    ebookEligibleSalesPct: 60,
  });
  const all70 = calculateEbookRoyalty({
    ...DEFAULT_INPUT,
    format: 'ebook',
    ebookMarket: 'us',
    ebookListPrice: 4.99,
    ebookUnitsSold: 100,
    ebookRoyaltyPlan: '70',
    ebookFileSizeMb: 2,
    ebookVatRatePct: 0,
    ebookEligibleSalesPct: 100,
  });

  assert.ok(partial.monthlyRoyalty > all35.monthlyRoyalty);
  assert.ok(partial.monthlyRoyalty < all70.monthlyRoyalty);
});

test('tc_kdp_04_paperback_us_below_threshold_uses_50_band', () => {
  const result = calculatePaperbackRoyalty({
    ...DEFAULT_INPUT,
    format: 'paperback',
    paperbackMarket: 'us',
    paperbackListPrice: 8.99,
    paperbackPrintingCost: 4,
    paperbackAmazonUnits: 10,
    paperbackExpandedUnits: 0,
  });

  assert.equal(result.amazonRatePct, 50);
  assert.equal(result.amazonBandLabel, '50% band');
  approx(result.amazonRoyaltyPerSale, 0.5, 0.01);
});

test('tc_kdp_05_paperback_us_at_999_uses_60_band', () => {
  const result = calculatePaperbackRoyalty({
    ...DEFAULT_INPUT,
    format: 'paperback',
    paperbackMarket: 'us',
    paperbackListPrice: 9.99,
    paperbackPrintingCost: 4,
    paperbackAmazonUnits: 10,
    paperbackExpandedUnits: 0,
  });

  assert.equal(result.amazonRatePct, 60);
  assert.equal(result.amazonBandLabel, '60% band');
  approx(result.amazonRoyaltyPerSale, 1.99, 0.01);
});

test('tc_kdp_06_paperback_expanded_distribution_uses_40_percent', () => {
  const result = calculatePaperbackRoyalty({
    ...DEFAULT_INPUT,
    format: 'paperback',
    paperbackMarket: 'us',
    paperbackListPrice: 14.99,
    paperbackPrintingCost: 5,
    paperbackAmazonUnits: 0,
    paperbackExpandedUnits: 1,
  });

  approx(result.expandedRoyaltyPerSale, 1, 0.01);
  approx(result.totalMonthlyRoyalty, 1, 0.01);
});

test('tc_kdp_07_summary_contains_key_kdp_outputs', () => {
  const ebookSummary = buildSummary(calculateEbookRoyalty(DEFAULT_INPUT), 'en-US');
  const paperbackSummary = buildSummary(calculatePaperbackRoyalty({ ...DEFAULT_INPUT, format: 'paperback' }), 'en-US');

  assert.match(ebookSummary, /Amazon KDP Royalty Summary/);
  assert.match(ebookSummary, /Royalty per sale/);
  assert.match(ebookSummary, /35% baseline/);
  assert.match(paperbackSummary, /Paperback/);
  assert.match(paperbackSummary, /Amazon band/);
  assert.match(paperbackSummary, /Expanded break-even list price/);
});

test('tc_kdp_08_structural_metadata_present', () => {
  assert.match(html, /<link rel="canonical" href="https:\/\/eastsea\.monster\/tools\/amazon-kdp-royalty-calculator\/"/i);
  assert.match(html, /"WebApplication"/i);
  assert.match(html, /aria-live="polite"/i);
  assert.match(html, /35%\/70%/i);
  assert.match(html, /Expanded Distribution/i);
  assert.match(html, /printing cost shown in KDP/i);
});

test('tc_kdp_09_catalog_wiring_exact_once', () => {
  const indexHtml = readText('tools/index.html');
  const indexMd = readText('tools/index.md');
  const toolsList = readJSON('_data/tools-list.json');
  const manifest = readJSON('tools/manifest.json');

  const htmlMatches = (indexHtml.match(new RegExp(`href="${slug}/"`, 'g')) || []).length;
  const mdMatches = (indexMd.match(new RegExp(`\(\./${slug}/\)`, 'g')) || []).length;
  const listMatches = toolsList.filter((entry) => entry.url === url).length;
  const manifestMatches = manifest.tools.filter((entry) => entry.slug === slug && entry.url === url).length;

  assert.equal(htmlMatches, 1, 'tools/index.html exact-once');
  assert.equal(mdMatches, 1, 'tools/index.md exact-once');
  assert.equal(listMatches, 1, '_data/tools-list.json exact-once');
  assert.equal(manifestMatches, 1, 'tools/manifest.json exact-once');

  const listEntry = toolsList.find((entry) => entry.url === url);
  assert.match(listEntry.title, /Amazon KDP Royalty Calculator/);
  assert.match(listEntry.description, /35%\/70%/i);
  assert.match(listEntry.description, /paperback/i);
});
