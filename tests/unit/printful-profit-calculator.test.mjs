import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';

import { readJSON, readText } from '../setup.mjs';

const slug = 'printful-profit-calculator';
const url = `/tools/${slug}/`;
const html = readText(`tools/${slug}/index.html`);

function approx(actual, expected, tolerance = 0.01) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} ≈ ${expected} (±${tolerance})`);
}

function loadCompute() {
  const startMarker = '<!-- TESTABLE_COMPUTE_START -->';
  const endMarker = '// TESTABLE_COMPUTE_END';
  const start = html.indexOf(startMarker);
  const end = html.indexOf(endMarker);

  assert.ok(start !== -1, 'start marker should exist');
  assert.ok(end !== -1 && end > start, 'end marker should exist after start marker');

  const source = html
    .slice(start + startMarker.length, end + endMarker.length)
    .replace('<script>', '')
    .replace('</script>', '')
    .trim();

  const context = {
    module: { exports: {} },
    exports: {},
    console,
    Math,
    Number,
  };

  vm.createContext(context);
  vm.runInContext(`${source}\nmodule.exports = { PRODUCTS, GROWTH_DISCOUNT, calcProfit, calcRequiredPrice, growthBreakEvenOrders, savingsPerOrder, marginTone };`, context);
  return context.module.exports;
}

const {
  PRODUCTS,
  GROWTH_DISCOUNT,
  calcProfit,
  calcRequiredPrice,
  growthBreakEvenOrders,
  savingsPerOrder,
  marginTone,
} = loadCompute();

test('tc_p01_products_constants_match_spec', () => {
  assert.equal(PRODUCTS.tshirt.base, 12.95);
  assert.equal(PRODUCTS.tshirt.ship, 3.99);
  assert.equal(PRODUCTS.hoodie.base, 23.95);
  assert.equal(PRODUCTS.mug.ship, 4.99);
  assert.equal(GROWTH_DISCOUNT, 0.2);
});

test('tc_a1_forward_tshirt_free', () => {
  const r = calcProfit('tshirt', 'free', 24.99, 0);
  assert.equal(r.effectiveBase, 12.95);
  assert.equal(r.totalCost, 16.94);
  assert.equal(r.revenue, 24.99);
  assert.equal(r.profit, 8.05);
  assert.equal(r.margin, 32.2);
  assert.equal(r.breakEven, 16.94);
});

test('tc_a2_forward_tshirt_growth', () => {
  const r = calcProfit('tshirt', 'growth', 24.99, 0);
  assert.equal(r.effectiveBase, 10.36);
  assert.equal(r.totalCost, 14.35);
  assert.equal(r.revenue, 24.99);
  assert.equal(r.profit, 10.64);
  assert.equal(r.margin, 42.6);
  assert.equal(r.breakEven, 14.35);
});

test('tc_a3_forward_mug_with_customer_shipping', () => {
  const r = calcProfit('mug', 'free', 19.99, 4.99);
  assert.equal(r.effectiveBase, 8.95);
  assert.equal(r.totalCost, 13.94);
  assert.equal(r.revenue, 24.98);
  assert.equal(r.profit, 11.04);
  assert.equal(r.margin, 44.2);
  assert.equal(r.breakEven, 8.95);
});

test('tc_a4_forward_hoodie_free', () => {
  const r = calcProfit('hoodie', 'free', 39.99, 0);
  assert.equal(r.effectiveBase, 23.95);
  assert.equal(r.totalCost, 29.44);
  assert.equal(r.profit, 10.55);
  assert.equal(r.margin, 26.4);
});

test('tc_a5_forward_hoodie_growth', () => {
  const r = calcProfit('hoodie', 'growth', 39.99, 0);
  assert.equal(r.effectiveBase, 19.16);
  assert.equal(r.totalCost, 24.65);
  assert.equal(r.profit, 15.34);
  assert.equal(r.margin, 38.4);
});

test('tc_a6_forward_poster_customer_shipping', () => {
  const r = calcProfit('poster', 'free', 22, 4.99);
  assert.equal(r.effectiveBase, 12.95);
  assert.equal(r.totalCost, 17.94);
  assert.equal(r.revenue, 26.99);
  assert.equal(r.profit, 9.05);
  assert.equal(r.margin, 33.5);
  assert.equal(r.breakEven, 12.95);
});

test('tc_b1_reverse_tshirt_free', () => {
  const r = calcRequiredPrice('tshirt', 'free', 0, 10);
  assert.equal(r.effectiveBase, 12.95);
  assert.equal(r.totalCost, 16.94);
  assert.equal(r.required, 26.94);
  assert.equal(r.margin, 37.1);
  assert.equal(calcProfit('tshirt', 'free', r.required, 0).profit, 10);
});

test('tc_b2_reverse_tshirt_growth', () => {
  const r = calcRequiredPrice('tshirt', 'growth', 0, 10);
  assert.equal(r.effectiveBase, 10.36);
  assert.equal(r.totalCost, 14.35);
  assert.equal(r.required, 24.35);
  assert.equal(r.margin, 41.1);
  assert.equal(calcProfit('tshirt', 'growth', r.required, 0).profit, 10);
});

test('tc_b3_reverse_hoodie_free', () => {
  const r = calcRequiredPrice('hoodie', 'free', 0, 15);
  assert.equal(r.required, 44.44);
  assert.equal(r.margin, 33.8);
  assert.equal(calcProfit('hoodie', 'free', r.required, 0).profit, 15);
});

test('tc_b4_reverse_mug_with_shipping', () => {
  const r = calcRequiredPrice('mug', 'free', 4.99, 8);
  assert.equal(r.effectiveBase, 8.95);
  assert.equal(r.totalCost, 13.94);
  assert.equal(r.required, 16.95);
  assert.equal(r.margin, 36.5);
  assert.equal(calcProfit('mug', 'free', r.required, 4.99).profit, 8);
});

test('tc_c1_loss_scenario_and_bad_margin', () => {
  const r = calcProfit('tshirt', 'free', 15, 0);
  assert.equal(r.profit, -1.94);
  assert.equal(r.margin, -12.9);
  assert.equal(marginTone(r.margin), 'bad');
});

test('tc_c2_exact_break_even', () => {
  const r = calcProfit('tshirt', 'free', 16.94, 0);
  assert.equal(r.profit, 0);
  assert.equal(r.margin, 0);
  assert.equal(marginTone(r.margin), 'bad');
});

test('tc_c3_zero_revenue_guards_division', () => {
  const r = calcProfit('tshirt', 'free', 0, 0);
  assert.equal(r.profit, -16.94);
  assert.equal(r.margin, 0);
});

test('tc_c4_high_margin_stays_green', () => {
  const r = calcProfit('tshirt', 'growth', 99.99, 0);
  assert.equal(r.profit, 85.64);
  assert.equal(r.margin, 85.6);
  assert.equal(marginTone(r.margin), 'good');
});

test('tc_d1_d3_growth_break_even_orders', () => {
  assert.equal(savingsPerOrder('tshirt'), 2.59);
  assert.equal(growthBreakEvenOrders('tshirt'), 10);
  assert.equal(growthBreakEvenOrders('hoodie'), 6);
  assert.equal(growthBreakEvenOrders('mug'), 14);
});

test('tc_e1_structural_requirements_present', () => {
  assert.match(html, /<link rel="canonical" href="https:\/\/eastsea\.monster\/tools\/printful-profit-calculator\/"/i);
  assert.match(html, /"WebApplication"/i);
  assert.match(html, /verify at printful\.com/i);
  assert.match(html, /aria-live="polite"/i);
  assert.match(html, /target net profit/i);
  assert.match(html, /find required price/i);

  const externalDependencyMatches = html.match(/(?:<script[^>]+src=|href=["'][^"']+\.css["'])/gi) || [];
  assert.deepEqual(externalDependencyMatches, [], 'single-file page should not load external JS/CSS');
});

test('tc_e2_catalog_wiring_is_exact_once', () => {
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
  assert.match(listEntry.title, /Printful Profit Calculator/);
  assert.match(listEntry.description, /Growth plan/i);
  assert.match(listEntry.description, /break-even/i);
});
