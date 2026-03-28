'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  DEFAULT_INPUTS,
  ASSUMPTION_NOTE,
  PLANNING_NOTE,
  ZERO_TARGET_NOTE,
  calculate,
  getEfficiencyBand,
  validateInputs,
} = require('./calculator.js');

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

test('TC-SMN-00 exports defaults and helpers', () => {
  assert.equal(DEFAULT_INPUTS.previousQuarterRecurringRevenue, 100000);
  assert.equal(DEFAULT_INPUTS.targetMagicNumber, 0.75);
  assert.match(ASSUMPTION_NOTE, /delta by 4/);
  assert.match(PLANNING_NOTE, /prior-quarter spend base fixed/);
  assert.equal(getEfficiencyBand(-0.1), 'Contraction');
  assert.equal(getEfficiencyBand(0.25), 'Weak efficiency');
  assert.equal(getEfficiencyBand(0.6), 'Below target');
  assert.equal(getEfficiencyBand(0.8), 'Acceptable');
  assert.equal(getEfficiencyBand(1.1), 'Strong');
});

test('TC-SMN-01 base positive case', () => {
  const { result, error } = calculate({
    previousQuarterRecurringRevenue: 100000,
    currentQuarterRecurringRevenue: 130000,
    previousQuarterSalesMarketingSpend: 120000,
    targetMagicNumber: 0.75,
  });

  assert.equal(error, '');
  assert.equal(result.recurringRevenueDelta, 30000);
  assert.equal(result.annualizedRecurringRevenueAdded, 120000);
  assert.equal(result.magicNumber, 1);
  assert.equal(result.arrCreatedPerDollar, 1);
  assert.equal(result.efficiencyBand, 'Strong');
  assert.equal(result.requiredCurrentQuarterRecurringRevenue, 122500);
  assert.equal(result.additionalRecurringRevenueNeededThisQuarter, 0);
  assert.equal(result.maxSalesMarketingSpendAtTarget, 160000);
  assert.equal(result.magicNumberGapToTarget, -0.25);
});

test('TC-SMN-02 below-target case', () => {
  const { result, error } = calculate({
    previousQuarterRecurringRevenue: 200000,
    currentQuarterRecurringRevenue: 220000,
    previousQuarterSalesMarketingSpend: 160000,
    targetMagicNumber: 0.75,
  });

  assert.equal(error, '');
  assert.equal(result.annualizedRecurringRevenueAdded, 80000);
  assert.equal(result.magicNumber, 0.5);
  assert.equal(result.efficiencyBand, 'Below target');
  assert.ok(result.requiredCurrentQuarterRecurringRevenue > result.input.currentQuarterRecurringRevenue);
  assert.equal(result.additionalRecurringRevenueNeededThisQuarter, 10000);
});

test('TC-SMN-03 contraction case', () => {
  const { result, error } = calculate({
    previousQuarterRecurringRevenue: 150000,
    currentQuarterRecurringRevenue: 140000,
    previousQuarterSalesMarketingSpend: 100000,
    targetMagicNumber: 0.75,
  });

  assert.equal(error, '');
  assert.equal(result.recurringRevenueDelta, -10000);
  assert.equal(result.annualizedRecurringRevenueAdded, -40000);
  assert.equal(result.magicNumber, -0.4);
  assert.equal(result.efficiencyBand, 'Contraction');
  assert.equal(result.maxSalesMarketingSpendAtTarget, 0);
  assert.match(result.interpretation, /negative/);
});

test('TC-SMN-04 zero growth case', () => {
  const { result, error } = calculate({
    previousQuarterRecurringRevenue: 90000,
    currentQuarterRecurringRevenue: 90000,
    previousQuarterSalesMarketingSpend: 45000,
    targetMagicNumber: 0.75,
  });

  assert.equal(error, '');
  assert.equal(result.recurringRevenueDelta, 0);
  assert.equal(result.magicNumber, 0);
  assert.equal(result.efficiencyBand, 'Weak efficiency');
  assert.equal(result.maxSalesMarketingSpendAtTarget, 0);
});

test('TC-SMN-05 invalid spend case', () => {
  const validation = validateInputs({
    previousQuarterRecurringRevenue: 100000,
    currentQuarterRecurringRevenue: 120000,
    previousQuarterSalesMarketingSpend: 0,
    targetMagicNumber: 0.75,
  });

  assert.equal(validation.ok, false);
  assert.match(validation.errors.join(' '), /greater than 0/);
});

test('TC-SMN-06 target-zero case', () => {
  const { result, error } = calculate({
    previousQuarterRecurringRevenue: 100000,
    currentQuarterRecurringRevenue: 120000,
    previousQuarterSalesMarketingSpend: 100000,
    targetMagicNumber: 0,
  });

  assert.equal(error, '');
  assert.equal(result.additionalRecurringRevenueNeededThisQuarter, 0);
  assert.equal(result.requiredCurrentQuarterRecurringRevenue, 120000);
  assert.equal(result.maxSalesMarketingSpendAtTarget, 0);
  assert.equal(result.magicNumberGapToTarget, 0);
  assert.equal(result.targetState, ZERO_TARGET_NOTE);
});

test('TC-SMN-07 summary text includes target planning and assumptions', () => {
  const { result, error } = calculate({
    previousQuarterRecurringRevenue: 100000,
    currentQuarterRecurringRevenue: 130000,
    previousQuarterSalesMarketingSpend: 120000,
    targetMagicNumber: 0.75,
  });

  assert.equal(error, '');
  for (const token of [
    '[SaaS Magic Number Summary]',
    ASSUMPTION_NOTE,
    PLANNING_NOTE,
    'Magic number: 1.00',
    'ARR created per $1 of spend: 1.00',
    'Efficiency band: Strong',
    'Required current-quarter recurring revenue at target: $122,500.00',
  ]) {
    assert.match(result.summary, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

test('TC-SMN-08 HTML scaffold anchors', () => {
  for (const token of [
    'SaaS Magic Number Calculator | EastSea',
    'SaaS Magic Number Calculator',
    'Previous Quarter Recurring Revenue',
    'Current Quarter Recurring Revenue',
    'Previous Quarter Sales and Marketing Spend',
    'Target Magic Number',
    'current quarter recurring revenue − previous quarter recurring revenue',
    'script defer src="./calculator.js"',
    '/assets/analytics.js',
    'What is a SaaS magic number?',
  ]) {
    assert.ok(html.includes(token), token);
  }
});

test('TC-SMN-09 exact-once discovery wiring', () => {
  const root = path.join(__dirname, '..', '..');
  const slug = 'saas-magic-number-calculator';
  const url = `/tools/${slug}/`;

  const indexHtml = fs.readFileSync(path.join(root, 'tools', 'index.html'), 'utf8');
  const indexMd = fs.readFileSync(path.join(root, 'tools', 'index.md'), 'utf8');
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'manifest.json'), 'utf8'));
  const toolsList = JSON.parse(fs.readFileSync(path.join(root, '_data', 'tools-list.json'), 'utf8'));

  assert.equal((indexHtml.match(new RegExp(slug, 'g')) || []).length, 1, 'index.html exact-once');
  assert.equal((indexMd.match(new RegExp(`\\./${slug}/`, 'g')) || []).length, 1, 'index.md exact-once');
  assert.equal(manifest.tools.filter((entry) => entry.slug === slug && entry.url === url).length, 1, 'manifest exact-once');
  assert.equal(toolsList.filter((entry) => entry.url === url).length, 1, 'tools-list exact-once');
});

test('TC-SMN-10 related-link sanity', () => {
  for (const token of [
    '/tools/saas-quick-ratio-calculator/',
    '/tools/cac-payback-period-calculator/',
    '/tools/saas-unit-economics-calculator/',
    '/tools/saas-expansion-mrr-waterfall-calculator/',
  ]) {
    assert.ok(html.includes(token), token);
  }
});
