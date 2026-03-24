const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  DEFAULTS,
  KICKSTARTER_FEE_RATE,
  calculate
} = require('./calculator.js');

function approx(actual, expected, tolerance = 0.01) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} to be within ${tolerance} of ${expected}`);
}

test('exports expected defaults', () => {
  assert.equal(DEFAULTS.plannedFundingGoal, 25000);
  assert.equal(KICKSTARTER_FEE_RATE, 0.05);
});

test('TC-02 positive case produces surplus', () => {
  const { result, error } = calculate({
    plannedFundingGoal: 25000,
    productionBudget: 12000,
    fulfillmentBudget: 3000,
    shippingBudget: 2000,
    marketingBudget: 1500,
    contingencyReserve: 500,
    failedPledgeRate: 4,
    paymentProcessingRate: 3.5,
    taxReserveRate: 8
  }, { lang: 'en' });

  assert.equal(error, '');
  assert.equal(result.totalBudget, 19000);
  assert.equal(result.chargedAmount, 24000);
  assert.equal(result.kickstarterFee, 1200);
  assert.equal(result.processingFee, 840);
  assert.equal(result.taxReserveAmount, 1920);
  assert.equal(result.netProceeds, 20040);
  assert.equal(result.gapVsBudget, 1040);
  assert.equal(result.status, 'safe');
});

test('TC-03 shortfall case flags negative gap', () => {
  const { result, error } = calculate({
    plannedFundingGoal: 15000,
    productionBudget: 12000,
    fulfillmentBudget: 2500,
    shippingBudget: 1200,
    marketingBudget: 900,
    contingencyReserve: 400,
    failedPledgeRate: 6,
    paymentProcessingRate: 5,
    taxReserveRate: 10
  }, { lang: 'en' });

  assert.equal(error, '');
  assert.ok(result.netProceeds < result.totalBudget);
  assert.ok(result.gapVsBudget < 0);
  assert.equal(result.status, 'shortfall');
  assert.ok(result.recommendedFundingGoal > 15000);
});

test('TC-04 near break-even case returns tight status', () => {
  const totalBudget = 19000;
  const takeHomeFactor = (1 - 0.04) * (1 - 0.05 - 0.035 - 0.08);
  const plannedFundingGoal = totalBudget / takeHomeFactor;
  const { result, error } = calculate({
    plannedFundingGoal,
    productionBudget: 12000,
    fulfillmentBudget: 3000,
    shippingBudget: 2000,
    marketingBudget: 1500,
    contingencyReserve: 500,
    failedPledgeRate: 4,
    paymentProcessingRate: 3.5,
    taxReserveRate: 8
  }, { lang: 'en' });

  assert.equal(error, '');
  approx(result.gapVsBudget, 0, 0.02);
  assert.equal(result.status, 'tight');
});

test('TC-05 invalid inputs are rejected', () => {
  const invalidInputs = [
    { ...DEFAULTS, plannedFundingGoal: 0 },
    { ...DEFAULTS, productionBudget: -1 },
    { ...DEFAULTS, failedPledgeRate: 101 },
    { ...DEFAULTS, paymentProcessingRate: -0.01 },
    { ...DEFAULTS, taxReserveRate: Number.NaN }
  ];

  invalidInputs.forEach((input) => {
    const { result, error } = calculate(input, { lang: 'en' });
    assert.equal(result, null);
    assert.notEqual(error, '');
  });
});

test('TC-06 non-feasible take-home factor returns Infinity', () => {
  const { result, error } = calculate({
    plannedFundingGoal: 25000,
    productionBudget: 12000,
    fulfillmentBudget: 3000,
    shippingBudget: 2000,
    marketingBudget: 1500,
    contingencyReserve: 500,
    failedPledgeRate: 20,
    paymentProcessingRate: 55,
    taxReserveRate: 40
  }, { lang: 'en' });

  assert.equal(error, '');
  assert.ok(result.takeHomeFactor <= 0);
  assert.equal(result.recommendedFundingGoal, Infinity);
  assert.match(result.summary, /Recommended funding goal: N\/A/);
});

test('TC-07 summary and discovery wiring are complete', () => {
  const { result, error } = calculate(DEFAULTS, { lang: 'en' });
  assert.equal(error, '');
  assert.match(result.summary, /Planned funding goal:/);
  assert.match(result.summary, /Total budget needed:/);
  assert.match(result.summary, /Expected net proceeds:/);
  assert.match(result.summary, /Surplus\/shortfall vs budget:/);
  assert.match(result.summary, /Recommended funding goal:/);

  const root = path.join(__dirname, '..', '..');
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'manifest.json'), 'utf8'));
  const toolsList = JSON.parse(fs.readFileSync(path.join(root, '_data', 'tools-list.json'), 'utf8'));

  assert.ok(html.includes('/assets/analytics.js'));
  assert.ok(html.includes('Tools Portal'));
  assert.ok(html.includes('script defer src="./calculator.js"'));
  assert.equal(
    manifest.tools.filter((entry) => entry.slug === 'kickstarter-net-proceeds-calculator').length,
    1,
    'manifest exact-once'
  );
  assert.equal(
    toolsList.filter((entry) => entry.url === '/tools/kickstarter-net-proceeds-calculator/').length,
    1,
    'tools-list exact-once'
  );
});
