'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  DEFAULT_INPUTS,
  ASSUMPTION_NOTE,
  PLANNING_NOTE,
  calculate,
  deriveQuickRatio,
  getHealthBand,
  validateInputs,
} = require('./calculator.js');

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

const BASE_FIXTURE = {
  name: 'healthy-mrr-baseline',
  assumptionNote: ASSUMPTION_NOTE,
  planningNote: PLANNING_NOTE,
  input: {
    newMrr: 40000,
    expansionMrr: 20000,
    churnedMrr: 10000,
    contractionMrr: 5000,
    targetQuickRatio: 4,
  },
};

test('TC-SQR-00 exports defaults, assumptions, and helpers', () => {
  assert.equal(DEFAULT_INPUTS.newMrr, 40000);
  assert.equal(DEFAULT_INPUTS.targetQuickRatio, 4);
  assert.match(ASSUMPTION_NOTE, /MRR-first/);
  assert.match(PLANNING_NOTE, /current period only/);
  assert.deepEqual(deriveQuickRatio(10, 0), {
    quickRatio: Infinity,
    stateNote: 'No MRR loss in the period',
  });
  assert.equal(getHealthBand(null), 'Insufficient activity');
  assert.equal(getHealthBand(Infinity), 'Exceptional, no loss in period');
});

test('TC-SQR-01 healthy baseline ratio', () => {
  const { result, error } = calculate(BASE_FIXTURE.input);

  assert.equal(error, '');
  assert.equal(result.grossMrrGain, 60000);
  assert.equal(result.grossMrrLoss, 15000);
  assert.equal(result.netNewMrr, 45000);
  assert.equal(result.quickRatio, 4);
  assert.equal(result.healthBand, 'Healthy');
  assert.equal(result.additionalGainNeeded, 0);
  assert.equal(result.maxAllowableLossAtCurrentGain, 15000);
});

test('TC-SQR-02 weak ratio below one', () => {
  const { result, error } = calculate({
    newMrr: 8000,
    expansionMrr: 2000,
    churnedMrr: 9000,
    contractionMrr: 4000,
    targetQuickRatio: 4,
  });

  assert.equal(error, '');
  assert.ok(result.quickRatio < 1);
  assert.equal(result.healthBand, 'Shrinking');
  assert.ok(result.additionalGainNeeded > 0);
  assert.ok(result.lossReductionNeeded > 0);
});

test('TC-SQR-03 mid-band ratio', () => {
  const { result, error } = calculate({
    newMrr: 18000,
    expansionMrr: 9000,
    churnedMrr: 8000,
    contractionMrr: 4000,
    targetQuickRatio: 4,
  });

  assert.equal(error, '');
  assert.ok(result.quickRatio >= 1 && result.quickRatio < 4);
  assert.equal(result.healthBand, 'Needs improvement');
});

test('TC-SQR-04 zero-loss period returns Infinity', () => {
  const { result, error } = calculate({
    newMrr: 12000,
    expansionMrr: 8000,
    churnedMrr: 0,
    contractionMrr: 0,
    targetQuickRatio: 4,
  });

  assert.equal(error, '');
  assert.equal(result.quickRatio, Infinity);
  assert.equal(result.stateNote, 'No MRR loss in the period');
  assert.equal(result.lossReductionNeeded, 0);
  assert.equal(result.additionalGainNeeded, 0);
  assert.equal(result.healthBand, 'Exceptional, no loss in period');
});

test('TC-SQR-05 zero-activity period returns null', () => {
  const { result, error } = calculate({
    newMrr: 0,
    expansionMrr: 0,
    churnedMrr: 0,
    contractionMrr: 0,
    targetQuickRatio: 4,
  });

  assert.equal(error, '');
  assert.equal(result.quickRatio, null);
  assert.equal(result.stateNote, 'No activity in the period');
  assert.equal(result.healthBand, 'Insufficient activity');
  assert.equal(result.requiredGainAtCurrentLoss, 0);
});

test('TC-SQR-06 target-gap math', () => {
  const { result, error } = calculate({
    newMrr: 20000,
    expansionMrr: 5000,
    churnedMrr: 12000,
    contractionMrr: 3000,
    targetQuickRatio: 4,
  });

  assert.equal(error, '');
  assert.equal(result.grossMrrLoss, 15000);
  assert.equal(result.requiredGainAtCurrentLoss, 60000);
  assert.equal(result.additionalGainNeeded, 35000);
  assert.equal(result.maxAllowableLossAtCurrentGain, 6250);
  assert.equal(result.lossReductionNeeded, 8750);
});

test('TC-SQR-07 validation rejects invalid inputs', () => {
  const negative = validateInputs({
    newMrr: -1,
    expansionMrr: 0,
    churnedMrr: 0,
    contractionMrr: 0,
    targetQuickRatio: 4,
  });
  const zeroTarget = validateInputs({
    newMrr: 0,
    expansionMrr: 0,
    churnedMrr: 0,
    contractionMrr: 0,
    targetQuickRatio: 0,
  });
  const textInput = validateInputs({
    newMrr: 'abc',
    expansionMrr: 0,
    churnedMrr: 0,
    contractionMrr: 0,
    targetQuickRatio: 4,
  });

  assert.equal(negative.ok, false);
  assert.equal(zeroTarget.ok, false);
  assert.equal(textInput.ok, false);
});

test('TC-SQR-08 summary text includes decision-ready details and assumptions', () => {
  const { result, error } = calculate(BASE_FIXTURE.input);

  assert.equal(error, '');
  for (const token of [
    '[SaaS Quick Ratio Summary]',
    BASE_FIXTURE.assumptionNote,
    BASE_FIXTURE.planningNote,
    'Quick ratio: 4.00',
    'Health band: Healthy',
    'Gross MRR gained: $60,000.00',
    'Gross MRR lost: $15,000.00',
    'Net new MRR: $45,000.00',
    'Target quick ratio: 4.00',
    'Target gap: current quick ratio already meets or exceeds the 4.00 target.',
  ]) {
    assert.match(result.summary, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

test('TC-SQR-09 HTML scaffold anchors', () => {
  for (const token of [
    'SaaS Quick Ratio Calculator | SaaS 퀵 레이쇼 계산기',
    'rel="canonical"',
    'New MRR',
    'Expansion MRR',
    'Churned MRR',
    'Contraction MRR',
    'Target quick ratio',
    'Copy summary',
    '/assets/analytics.js',
    'script defer src="./calculator.js"',
    'This page is narrowly about the <strong>SaaS quick ratio</strong>, not the accounting liquidity quick ratio.',
  ]) {
    assert.ok(html.includes(token), token);
  }
});

test('TC-SQR-10 exact-once discovery wiring', () => {
  const root = path.join(__dirname, '..', '..');
  const slug = 'saas-quick-ratio-calculator';
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

test('TC-SQR-11 related-link sanity', () => {
  for (const token of [
    '/tools/saas-nrr-calculator/',
    '/tools/saas-unit-economics-calculator/',
    '/tools/saas-expansion-mrr-waterfall-calculator/',
    '/tools/cac-payback-period-calculator/',
  ]) {
    assert.ok(html.includes(token), token);
  }
});

test('TC-SQR-12 FAQ clarity', () => {
  assert.match(html, /not the accounting liquidity quick ratio/i);
  assert.match(html, /If gains are positive and gross loss is zero, the quick ratio is shown as <strong>Infinity<\/strong>/);
});
