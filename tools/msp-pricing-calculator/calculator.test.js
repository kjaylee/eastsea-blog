'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  DEFAULT_INPUTS,
  PLANNING_NOTE,
  SOLVER_ASSUMPTION,
  calculate,
  validate
} = require('./calculator.js');

const BASE_FIXTURE = {
  name: 'baseline-msp-plan',
  assumptionNote: SOLVER_ASSUMPTION,
  input: {
    currentQuotedMonthlyPrice: 4200,
    managedUsers: 25,
    managedEndpoints: 32,
    serversCriticalDevices: 3,
    includedSupportHours: 6,
    reactiveTicketHours: 5,
    onsiteHours: 2,
    vcioHours: 3,
    technicianLoadedCostPerHour: 65,
    seniorStrategyCostPerHour: 140,
    toolStackCostPerUser: 18,
    toolStackCostPerEndpoint: 6,
    fixedVendorCostPerMonth: 280,
    afterHoursIncidentHours: 1.5,
    afterHoursMultiplier: 1.75,
    travelExpensePerMonth: 90,
    paymentFeePct: 3,
    targetOperatingMarginPct: 22,
    onboardingHours: 10,
    implementationCostPerHour: 85
  }
};

test('TC-MSP-01 baseline model computes deterministic monthly cost outputs', () => {
  const { result, error } = calculate(BASE_FIXTURE.input);

  assert.equal(error, '');
  assert.equal(result.variableLaborCost, 715);
  assert.equal(result.afterHoursCost, 170.63);
  assert.equal(result.onsiteCost, 220);
  assert.equal(result.strategyCost, 420);
  assert.equal(result.perUserStackCost, 450);
  assert.equal(result.perEndpointStackCost, 192);
  assert.equal(result.fixedMonthlyCost, 920);
  assert.equal(result.variableMonthlyCost, 1527.63);
  assert.equal(result.monthlyDeliveryCost, 2447.63);
  assert.equal(result.breakEvenMonthlyMRR, 2523.32);
  assert.equal(result.recommendedMonthlyMRR, 3263.5);
  assert.equal(result.onboardingFee, 1133.33);
  assert.equal(result.effectivePricePerUser, 130.54);
  assert.equal(result.contractValue12Months, 40295.33);
  assert.equal(result.grossMarginAtCurrentQuote, 0.3872);
  assert.equal(result.breakEvenManagedUsers, 13.78);
  assert.match(result.summary, /\[MSP Pricing Calculator Summary\]/);
  assert.match(result.summary, /Break-even managed users at current quote: 13.78/);
});

test('TC-MSP-02 higher tool stack cost raises required MRR', () => {
  const base = calculate(BASE_FIXTURE.input).result;
  const higherStack = calculate({
    ...BASE_FIXTURE.input,
    toolStackCostPerUser: 25,
    toolStackCostPerEndpoint: 8
  }).result;

  assert.ok(higherStack.monthlyDeliveryCost > base.monthlyDeliveryCost);
  assert.ok(higherStack.breakEvenMonthlyMRR > base.breakEvenMonthlyMRR);
  assert.ok(higherStack.recommendedMonthlyMRR > base.recommendedMonthlyMRR);
});

test('TC-MSP-03 more after-hours load compresses margin at the current quote', () => {
  const base = calculate(BASE_FIXTURE.input).result;
  const heavierAfterHours = calculate({
    ...BASE_FIXTURE.input,
    afterHoursIncidentHours: 4,
    afterHoursMultiplier: 2
  }).result;

  assert.ok(heavierAfterHours.monthlyDeliveryCost > base.monthlyDeliveryCost);
  assert.ok(heavierAfterHours.grossMarginAtCurrentQuote < base.grossMarginAtCurrentQuote);
});

test('TC-MSP-04 onboarding fee grows with implementation work', () => {
  const base = calculate(BASE_FIXTURE.input).result;
  const heavierOnboarding = calculate({
    ...BASE_FIXTURE.input,
    onboardingHours: 16
  }).result;

  assert.ok(heavierOnboarding.onboardingFee > base.onboardingFee);
});

test('TC-MSP-05 higher target margin raises recommendation but not break-even', () => {
  const base = calculate(BASE_FIXTURE.input).result;
  const higherMargin = calculate({
    ...BASE_FIXTURE.input,
    targetOperatingMarginPct: 28
  }).result;

  assert.equal(higherMargin.breakEvenMonthlyMRR, base.breakEvenMonthlyMRR);
  assert.ok(higherMargin.recommendedMonthlyMRR > base.recommendedMonthlyMRR);
});

test('TC-MSP-06 break-even user solver returns null when per-user unit contribution is non-positive', () => {
  const { result, error } = calculate({
    ...BASE_FIXTURE.input,
    currentQuotedMonthlyPrice: 300,
    managedUsers: 10,
    toolStackCostPerUser: 35
  });

  assert.equal(error, '');
  assert.equal(result.currentQuotePerUser, 30);
  assert.equal(result.perUserUnitContribution, -5.9);
  assert.equal(result.breakEvenManagedUsers, null);
});

test('TC-MSP-07 zero managed users blocks per-user outputs safely', () => {
  const { result, error } = calculate({
    ...BASE_FIXTURE.input,
    managedUsers: 0,
    currentQuotedMonthlyPrice: 0
  });

  assert.equal(error, '');
  assert.equal(result.effectivePricePerUser, null);
  assert.equal(result.currentQuotePerUser, null);
  assert.equal(result.perUserUnitContribution, null);
  assert.equal(result.breakEvenManagedUsers, null);
});

test('TC-MSP-08 validation rejects invalid inputs', () => {
  assert.match(validate({ ...DEFAULT_INPUTS, managedUsers: -1 }), /managedUsers/);
  assert.match(validate({ ...DEFAULT_INPUTS, managedEndpoints: 3.5 }), /managedEndpoints/);
  assert.match(validate({ ...DEFAULT_INPUTS, afterHoursMultiplier: 0.5 }), /afterHoursMultiplier/);
  assert.match(validate({ ...DEFAULT_INPUTS, paymentFeePct: 80, targetOperatingMarginPct: 20 }), /stay below 100/);

  const { result, error } = calculate({
    ...DEFAULT_INPUTS,
    implementationCostPerHour: -10
  });
  assert.equal(result, null);
  assert.match(error, /implementationCostPerHour/);
});

test('TC-MSP-09 summary contains quote-ready planning lines and assumptions', () => {
  const { result } = calculate(BASE_FIXTURE.input);

  for (const token of [
    PLANNING_NOTE,
    BASE_FIXTURE.assumptionNote,
    'Total monthly delivery cost:',
    'Break-even monthly MRR:',
    'Recommended monthly MRR:',
    'Suggested onboarding fee:',
    'Estimated 12-month contract value:',
    'Excluded from this model: tax treatment, procurement or licensing true-ups, financing, and hardware resale.'
  ]) {
    assert.match(result.summary, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

test('TC-MSP-10 HTML contains required planning disclaimer, canonical, analytics, summary, and related links', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

  for (const token of [
    'MSP Pricing Calculator',
    'managed service pricing',
    'monthly contract',
    'Planning model, not a market-rate benchmark',
    'No procurement, tax, or hardware resale logic in v1',
    'Copyable summary',
    '/assets/analytics.js',
    'rel="canonical"',
    '/tools/white-label-agency-margin-calculator/',
    '/tools/professional-services-utilization-margin-calculator/',
    '/tools/ai-retainer-profit-planner/',
    '/tools/fractional-cmo-pricing-calculator/'
  ]) {
    assert.ok(html.includes(token), token);
  }

  assert.match(html, /Servers \/ critical devices are included as planning context only in v1/);
  assert.match(html, /Break-even managed users/);
});

test('TC-MSP-13 exact-once discovery wiring and manifest entry', () => {
  const root = path.join(__dirname, '..', '..');
  const slug = 'msp-pricing-calculator';
  const url = `/tools/${slug}/`;

  const indexHtml = fs.readFileSync(path.join(root, 'tools', 'index.html'), 'utf8');
  const indexMd = fs.readFileSync(path.join(root, 'tools', 'index.md'), 'utf8');
  const toolsList = JSON.parse(fs.readFileSync(path.join(root, '_data', 'tools-list.json'), 'utf8'));
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'manifest.json'), 'utf8'));

  assert.equal((indexHtml.match(new RegExp(slug, 'g')) || []).length, 1, 'index.html exact-once');
  assert.equal((indexMd.match(new RegExp(`\\./${slug}/`, 'g')) || []).length, 1, 'index.md exact-once');
  assert.equal(toolsList.filter((entry) => entry.url === url).length, 1, 'tools-list exact-once');
  assert.equal(manifest.tools.filter((entry) => entry.slug === slug && entry.url === url).length, 1, 'manifest exact-once');

  const listEntry = toolsList.find((entry) => entry.url === url);
  assert.equal(listEntry.slug, slug);
  assert.match(listEntry.description, /managed service pricing/i);
});
