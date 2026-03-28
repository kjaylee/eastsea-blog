const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  DEFAULTS,
  EXAMPLES,
  calculate,
  validateInputs
} = require('./calculator.js');

function approx(actual, expected, tolerance = 0.000001) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} ≈ ${expected} (±${tolerance})`);
}

test('TC-CM-00 exports defaults and examples', () => {
  assert.equal(DEFAULTS.sellingPrice, 120);
  assert.equal(DEFAULTS.variableCostPerUnit, 45);
  assert.equal(DEFAULTS.fixedCosts, 18000);
  assert.equal(DEFAULTS.targetProfit, 12000);
  assert.equal(Array.isArray(EXAMPLES), true);
  assert.equal(EXAMPLES.length, 3);
});

test('TC-CM-01 baseline profitable unit economics', () => {
  const { result, error } = calculate({
    sellingPrice: 120,
    variableCostPerUnit: 45,
    fixedCosts: 18000,
    targetProfit: 12000
  });

  assert.equal(error, '');
  approx(result.contributionMarginPerUnit, 75);
  approx(result.contributionMarginRatio, 0.625);
  assert.equal(result.breakEvenUnits, 240);
  assert.equal(result.targetProfitUnits, 400);
  approx(result.breakEvenRevenue, 28800);
  approx(result.targetProfitRevenue, 48000);
});

test('TC-CM-02 exact break-even denominator with rounding up', () => {
  const { result, error } = calculate({
    sellingPrice: 49,
    variableCostPerUnit: 17,
    fixedCosts: 10000,
    targetProfit: 2500
  });

  assert.equal(error, '');
  approx(result.contributionMarginPerUnit, 32);
  approx(result.contributionMarginRatio, 0.6531);
  assert.equal(result.breakEvenUnits, 313);
  assert.equal(result.targetProfitUnits, 391);
});

test('TC-CM-03 omitted target profit defaults to zero', () => {
  const { result, error } = calculate({
    sellingPrice: 80,
    variableCostPerUnit: 20,
    fixedCosts: 6000
  });

  assert.equal(error, '');
  assert.equal(result.targetProfit, 0);
  assert.equal(result.breakEvenUnits, 100);
  assert.equal(result.targetProfitUnits, 100);
});

test('TC-CM-04 zero fixed costs keeps break-even at zero when unit economics are viable', () => {
  const { result, error } = calculate({
    sellingPrice: 25,
    variableCostPerUnit: 10,
    fixedCosts: 0,
    targetProfit: 150
  });

  assert.equal(error, '');
  assert.equal(result.breakEvenUnits, 0);
  assert.equal(result.targetProfitUnits, 10);
});

test('TC-CM-05 non-viable unit economics return null thresholds', () => {
  const { result, error } = calculate({
    sellingPrice: 30,
    variableCostPerUnit: 30,
    fixedCosts: 5000,
    targetProfit: 2000
  }, { lang: 'en' });

  assert.equal(error, '');
  assert.equal(result.contributionMarginPerUnit, 0);
  assert.equal(result.contributionMarginRatio, 0);
  assert.equal(result.breakEvenUnits, null);
  assert.equal(result.targetProfitUnits, null);
  assert.match(result.status, /not viable/i);
});

test('TC-CM-06 invalid input validation rejects bad values', () => {
  const invalids = [
    { sellingPrice: 0, variableCostPerUnit: 10, fixedCosts: 1, targetProfit: 0 },
    { sellingPrice: 10, variableCostPerUnit: -1, fixedCosts: 1, targetProfit: 0 },
    { sellingPrice: 10, variableCostPerUnit: 1, fixedCosts: -1, targetProfit: 0 },
    { sellingPrice: 10, variableCostPerUnit: 1, fixedCosts: 1, targetProfit: -1 }
  ];

  invalids.forEach((input) => {
    const normalized = {
      sellingPrice: Number(input.sellingPrice),
      variableCostPerUnit: Number(input.variableCostPerUnit),
      fixedCosts: Number(input.fixedCosts),
      targetProfit: Number(input.targetProfit)
    };
    const validation = validateInputs(normalized, 'en');
    assert.equal(validation.ok, false);
    const { result, error } = calculate(input);
    assert.equal(result, null);
    assert.ok(error.length > 0);
  });
});

test('TC-CM-07 summary output includes decision-ready fields', () => {
  const { result, error } = calculate(DEFAULTS);

  assert.equal(error, '');
  assert.match(result.summary, /Contribution margin per unit: \$75\.00/);
  assert.match(result.summary, /Contribution margin ratio: 62\.50%/);
  assert.match(result.summary, /Break-even units: 240/);
  assert.match(result.summary, /Target-profit units: 400/);
});

test('TC-CM-08 html contains formulas, examples, and copy summary UI', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  for (const token of [
    'Contribution Margin Calculator | 공헌이익 계산기',
    'Copyable result summary',
    'Formula block',
    'Worked example',
    'Copy summary',
    '/assets/analytics.js',
    '<script src="./calculator.js"></script>'
  ]) {
    assert.ok(html.includes(token), token);
  }
});

test('TC-CM-09 discovery exact-once wiring', () => {
  const repoRoot = path.join(__dirname, '..', '..');
  const slug = 'contribution-margin-calculator';
  const url = `/tools/${slug}/`;

  const indexHtml = fs.readFileSync(path.join(repoRoot, 'tools', 'index.html'), 'utf8');
  const indexMd = fs.readFileSync(path.join(repoRoot, 'tools', 'index.md'), 'utf8');
  const manifest = JSON.parse(fs.readFileSync(path.join(repoRoot, 'tools', 'manifest.json'), 'utf8'));
  const toolsList = JSON.parse(fs.readFileSync(path.join(repoRoot, '_data', 'tools-list.json'), 'utf8'));

  assert.equal((indexHtml.match(new RegExp(slug, 'g')) || []).length, 1, 'tools/index.html exact-once');
  assert.equal((indexMd.match(new RegExp(slug, 'g')) || []).length, 1, 'tools/index.md exact-once');
  assert.equal(manifest.tools.filter((entry) => entry.slug === slug && entry.url === url).length, 1, 'tools/manifest.json exact-once');
  assert.equal(toolsList.filter((entry) => entry.url === url).length, 1, '_data/tools-list.json exact-once');
});
