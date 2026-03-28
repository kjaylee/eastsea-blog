'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  DEFAULT_INPUTS,
  ASSUMPTION_NOTE,
  BENCHMARK_NOTE,
  calculate,
  deriveBurnMultipleState,
  getHealthBand,
  validateInputs,
} = require('./calculator.js');

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

test('TC-BM-00 exports defaults, notes, and helpers', () => {
  assert.equal(DEFAULT_INPUTS.netBurn, 1200000);
  assert.equal(DEFAULT_INPUTS.targetBurnMultiple, 1.5);
  assert.match(ASSUMPTION_NOTE, /ARR-first/);
  assert.match(BENCHMARK_NOTE, /below 1\.0x is elite/i);
  assert.deepEqual(deriveBurnMultipleState(0, 100), {
    burnMultiple: 0,
    stateNote: 'Breakeven or profitable growth',
  });
  assert.equal(getHealthBand(Infinity, 0, 1000), 'No net new ARR');
  assert.equal(getHealthBand(null, -1, 1000), 'Contracting');
});

test('TC-BM-01 healthy venture-stage baseline', () => {
  const { result, error } = calculate({
    netBurn: 1200000,
    beginningArr: 4000000,
    endingArr: 5000000,
    targetBurnMultiple: 1.5,
  });

  assert.equal(error, '');
  assert.equal(result.netNewArr, 1000000);
  assert.equal(result.burnMultiple, 1.2);
  assert.equal(result.healthBand, 'Good for venture-stage');
  assert.equal(result.requiredNetNewArrAtTarget, 800000);
  assert.equal(result.additionalNetNewArrNeeded, 0);
  assert.equal(result.burnReductionNeeded, 0);
});

test('TC-BM-02 elite efficiency', () => {
  const { result, error } = calculate({
    netBurn: 500000,
    beginningArr: 3000000,
    endingArr: 4000000,
    targetBurnMultiple: 1.5,
  });

  assert.equal(error, '');
  assert.equal(result.burnMultiple, 0.5);
  assert.equal(result.healthBand, 'Elite capital efficiency');
});

test('TC-BM-03 needs-improvement band', () => {
  const { result, error } = calculate({
    netBurn: 2600000,
    beginningArr: 5000000,
    endingArr: 6000000,
    targetBurnMultiple: 1.5,
  });

  assert.equal(error, '');
  assert.equal(result.burnMultiple, 2.6);
  assert.equal(result.healthBand, 'Needs improvement');
  assert.ok(result.burnReductionNeeded > 0);
});

test('TC-BM-04 zero burn with positive ARR growth', () => {
  const { result, error } = calculate({
    netBurn: 0,
    beginningArr: 2000000,
    endingArr: 2900000,
    targetBurnMultiple: 1.5,
  });

  assert.equal(error, '');
  assert.equal(result.burnMultiple, 0);
  assert.equal(result.stateNote, 'Breakeven or profitable growth');
  assert.equal(result.healthBand, 'Breakeven or profitable growth');
});

test('TC-BM-05 no ARR growth with burn', () => {
  const { result, error } = calculate({
    netBurn: 900000,
    beginningArr: 3500000,
    endingArr: 3500000,
    targetBurnMultiple: 1.5,
  });

  assert.equal(error, '');
  assert.equal(result.burnMultiple, Infinity);
  assert.equal(result.healthBand, 'No net new ARR');
  assert.equal(result.stateNote, 'No net new ARR in the period');
});

test('TC-BM-06 negative ARR growth', () => {
  const { result, error } = calculate({
    netBurn: 900000,
    beginningArr: 4000000,
    endingArr: 3700000,
    targetBurnMultiple: 1.5,
  });

  assert.equal(error, '');
  assert.equal(result.burnMultiple, null);
  assert.equal(result.healthBand, 'Contracting');
  assert.equal(result.stateNote, 'Negative net new ARR makes burn multiple non-comparable');
});

test('TC-BM-07 planning-gap math', () => {
  const { result, error } = calculate({
    netBurn: 1800000,
    beginningArr: 2000000,
    endingArr: 2900000,
    targetBurnMultiple: 1.5,
  });

  assert.equal(error, '');
  assert.equal(result.netNewArr, 900000);
  assert.equal(result.requiredNetNewArrAtTarget, 1200000);
  assert.equal(result.additionalNetNewArrNeeded, 300000);
  assert.equal(result.maxBurnAtTarget, 1350000);
  assert.equal(result.burnReductionNeeded, 450000);
  assert.equal(result.targetEndingArr, 3200000);
});

test('TC-BM-08 validation rejects bad input', () => {
  const negativeBurn = validateInputs({
    netBurn: -1,
    beginningArr: 0,
    endingArr: 0,
    targetBurnMultiple: 1.5,
  });
  const negativeArr = validateInputs({
    netBurn: 0,
    beginningArr: -1,
    endingArr: 0,
    targetBurnMultiple: 1.5,
  });
  const badText = validateInputs({
    netBurn: 'abc',
    beginningArr: 0,
    endingArr: 0,
    targetBurnMultiple: 1.5,
  });
  const zeroTarget = validateInputs({
    netBurn: 0,
    beginningArr: 0,
    endingArr: 0,
    targetBurnMultiple: 0,
  });

  assert.equal(negativeBurn.ok, false);
  assert.equal(negativeArr.ok, false);
  assert.equal(badText.ok, false);
  assert.equal(zeroTarget.ok, false);
});

test('TC-BM-09 summary block includes planning details', () => {
  const { result, error } = calculate({
    netBurn: 1800000,
    beginningArr: 2000000,
    endingArr: 2900000,
    targetBurnMultiple: 1.5,
  });

  assert.equal(error, '');
  for (const token of [
    '[SaaS Burn Multiple Summary]',
    ASSUMPTION_NOTE,
    BENCHMARK_NOTE,
    'Burn multiple: 2.00x',
    'Health band: Needs improvement',
    'Net burn: $1,800,000',
    'Beginning ARR: $2,000,000',
    'Ending ARR: $2,900,000',
    'Net new ARR: $900,000',
    'Target burn multiple: 1.50x',
    'Target gap: add $300,000 of net new ARR to reach the selected burn multiple.',
    'Alternative target gap: reduce net burn by $450,000 at the current ARR growth level.',
  ]) {
    assert.ok(result.summary.includes(token), token);
  }
});

test('TC-BM-10 HTML scaffold anchors', () => {
  for (const token of [
    'SaaS Burn Multiple Calculator | SaaS 번 멀티플 계산기',
    'rel="canonical"',
    'Net burn',
    'Beginning ARR',
    'Ending ARR',
    'Target burn multiple',
    'Copy summary',
    '/assets/analytics.js',
    'script defer src="./calculator.js"',
    'burn multiple = net burn ÷ net new ARR',
  ]) {
    assert.ok(html.includes(token), token);
  }
});

test('TC-BM-11 exact-once discovery wiring', () => {
  const root = path.join(__dirname, '..', '..');
  const slug = 'saas-burn-multiple-calculator';
  const url = `/tools/${slug}/`;

  const indexHtml = fs.readFileSync(path.join(root, 'tools', 'index.html'), 'utf8');
  const indexMd = fs.readFileSync(path.join(root, 'tools', 'index.md'), 'utf8');
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'manifest.json'), 'utf8'));
  const toolsList = JSON.parse(fs.readFileSync(path.join(root, '_data', 'tools-list.json'), 'utf8'));

  assert.equal((indexHtml.match(new RegExp(slug, 'g')) || []).length, 1, 'index.html exact-once');
  assert.equal((indexMd.match(new RegExp(`\\./${slug}/`, 'g')) || []).length, 1, 'index.md exact-once');
  assert.equal(manifest.tools.filter((entry) => entry.slug === slug && entry.url === url).length, 1, 'manifest exact-once');
  assert.equal(toolsList.filter((entry) => entry.slug === slug && entry.url === url).length, 1, 'tools-list exact-once');
});

test('TC-BM-12 related-link sanity', () => {
  for (const token of [
    '/tools/saas-magic-number-calculator/',
    '/tools/saas-quick-ratio-calculator/',
    '/tools/saas-nrr-calculator/',
    '/tools/runway-calculator/',
  ]) {
    assert.ok(html.includes(token), token);
  }
});
