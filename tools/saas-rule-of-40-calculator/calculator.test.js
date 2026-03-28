'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  DEFAULT_INPUTS,
  ASSUMPTION_NOTE,
  BENCHMARK_NOTE,
  calculate,
  getHealthBand,
  validateInputs,
} = require('./calculator.js');

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
let failures = 0;

function check(name, fn) {
  try {
    fn();
    console.log('PASS', name);
  } catch (error) {
    failures += 1;
    console.error('FAIL', name);
    console.error(error && error.stack ? error.stack : error);
  }
}

check('TC-R40-00 exports defaults and helpers', () => {
  assert.equal(DEFAULT_INPUTS.previousArr, 4000000);
  assert.equal(DEFAULT_INPUTS.targetRuleOf40, 40);
  assert.match(ASSUMPTION_NOTE, /ARR growth rate/);
  assert.match(BENCHMARK_NOTE, /40\+ is generally healthy/);
  assert.equal(getHealthBand(55), 'Elite');
  assert.equal(getHealthBand(42), 'Healthy');
  assert.equal(getHealthBand(25), 'Mixed');
  assert.equal(getHealthBand(10), 'Fragile');
  assert.equal(getHealthBand(-5), 'Underwater');
});

check('TC-R40-01 healthy baseline', () => {
  const { result, error } = calculate({
    previousArr: 4000000,
    currentArr: 5200000,
    profitMarginPercent: 12,
    targetRuleOf40: 40,
  });

  assert.equal(error, '');
  assert.equal(result.arrDelta, 1200000);
  assert.equal(result.growthRatePercent, 30);
  assert.equal(result.ruleOf40Score, 42);
  assert.equal(result.healthBand, 'Healthy');
  assert.equal(result.additionalArrNeeded, 0);
  assert.equal(result.marginImprovementNeeded, 0);
});

check('TC-R40-02 elite score', () => {
  const { result, error } = calculate({
    previousArr: 3000000,
    currentArr: 4500000,
    profitMarginPercent: 10,
    targetRuleOf40: 40,
  });

  assert.equal(error, '');
  assert.equal(result.growthRatePercent, 50);
  assert.equal(result.ruleOf40Score, 60);
  assert.equal(result.healthBand, 'Elite');
});

check('TC-R40-03 mixed score', () => {
  const { result, error } = calculate({
    previousArr: 5000000,
    currentArr: 6000000,
    profitMarginPercent: 5,
    targetRuleOf40: 40,
  });

  assert.equal(error, '');
  assert.equal(result.growthRatePercent, 20);
  assert.equal(result.ruleOf40Score, 25);
  assert.equal(result.healthBand, 'Mixed');
});

check('TC-R40-04 underwater score', () => {
  const { result, error } = calculate({
    previousArr: 4000000,
    currentArr: 3600000,
    profitMarginPercent: -15,
    targetRuleOf40: 40,
  });

  assert.equal(error, '');
  assert.equal(result.growthRatePercent, -10);
  assert.equal(result.ruleOf40Score, -25);
  assert.equal(result.healthBand, 'Underwater');
});

check('TC-R40-05 ARR-gap planning', () => {
  const { result, error } = calculate({
    previousArr: 4000000,
    currentArr: 5000000,
    profitMarginPercent: 5,
    targetRuleOf40: 40,
  });

  assert.equal(error, '');
  assert.equal(result.growthRatePercent, 25);
  assert.equal(result.ruleOf40Score, 30);
  assert.equal(result.requiredGrowthRateAtTarget, 35);
  assert.equal(result.requiredCurrentArrAtTarget, 5400000);
  assert.equal(result.additionalArrNeeded, 400000);
  assert.equal(result.requiredProfitMarginAtTarget, 15);
  assert.equal(result.marginImprovementNeeded, 10);
});

check('TC-R40-06 validation rejects bad input', () => {
  assert.equal(validateInputs({
    previousArr: 0,
    currentArr: 10,
    profitMarginPercent: 5,
    targetRuleOf40: 40,
  }).ok, false);

  assert.equal(validateInputs({
    previousArr: 100,
    currentArr: -1,
    profitMarginPercent: 5,
    targetRuleOf40: 40,
  }).ok, false);

  assert.equal(validateInputs({
    previousArr: 100,
    currentArr: 100,
    profitMarginPercent: 'x',
    targetRuleOf40: 40,
  }).ok, false);

  assert.equal(validateInputs({
    previousArr: 100,
    currentArr: 100,
    profitMarginPercent: 5,
    targetRuleOf40: 'x',
  }).ok, false);
});

check('TC-R40-07 summary block includes planning details', () => {
  const { result, error } = calculate({
    previousArr: 4000000,
    currentArr: 5000000,
    profitMarginPercent: 5,
    targetRuleOf40: 40,
  });

  assert.equal(error, '');
  for (const token of [
    '[SaaS Rule of 40 Summary]',
    ASSUMPTION_NOTE,
    'ARR growth rate: 25.00%',
    'Profit margin: 5.00%',
    'Rule of 40 score: 30.00',
    'Health band: Mixed',
    'Target Rule of 40: 40.00',
    'Target gap: add $400,000 of ARR at the current margin.',
    'Alternative target gap: improve profit margin by 10.00% at the current ARR growth rate.',
  ]) {
    assert.ok(result.summary.includes(token), token);
  }
});

check('TC-R40-08 HTML scaffold anchors', () => {
  for (const token of [
    'SaaS Rule of 40 Calculator | SaaS Rule of 40 계산기',
    'rel="canonical"',
    'Previous ARR',
    'Current ARR',
    'Profit margin (%)',
    'Target Rule of 40',
    'Rule of 40 = ARR growth rate % + profit margin %',
    'Copy summary',
    '/assets/analytics.js',
    'script defer src="./calculator.js"',
    'What is the SaaS Rule of 40?',
  ]) {
    assert.ok(html.includes(token), token);
  }
});

check('TC-R40-09 exact-once discovery wiring', () => {
  const root = path.join(__dirname, '..', '..');
  const slug = 'saas-rule-of-40-calculator';
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

check('TC-R40-10 related-link sanity', () => {
  for (const token of [
    '/tools/saas-quick-ratio-calculator/',
    '/tools/saas-burn-multiple-calculator/',
    '/tools/saas-magic-number-calculator/',
    '/tools/saas-unit-economics-calculator/',
  ]) {
    assert.ok(html.includes(token), token);
  }
});

if (failures > 0) {
  process.exitCode = 1;
} else {
  console.log('All calculator checks passed.');
}
