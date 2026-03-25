const test = require('node:test');
const assert = require('node:assert/strict');

const { calculate, DEFAULTS } = require('./calculator.js');

function approx(actual, expected, tolerance = 0.02) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `expected ${actual} ≈ ${expected} (±${tolerance})`
  );
}

const BASE = {
  goalAmount: 10000,
  totalRaised: 12500,
  numberOfBackers: 100,
  campaignType: 'flexible',
  platformFeePct: 5,
  processingFeePct: 2.9,
  processingFixedFee: 0.30,
  refundRatePct: 0,
  targetNetProceeds: 8000
};

// TC-IG-01 — Flexible campaign over goal: baseline fee calculation
test('TC-IG-01 flexible campaign over goal — baseline', () => {
  const { result, error } = calculate(BASE, { lang: 'en' });

  assert.equal(error, '');
  assert.equal(result.isGoalMet, true);
  approx(result.grossRaised, 12500);
  // platformFee = 12500 * 0.05 = 625.00
  approx(result.platformFee, 625.00);
  // processingFees = 12500 * 0.029 + 100 * 0.30 = 362.50 + 30 = 392.50
  approx(result.processingFees, 392.50);
  approx(result.refundLoss, 0);
  approx(result.totalFees, 1017.50);
  // netProceeds = 12500 - 1017.50 = 11482.50
  approx(result.netProceeds, 11482.50);
  // effectiveFeeRatePct = 1017.50 / 12500 * 100 = 8.14
  approx(result.effectiveFeeRatePct, 8.14, 0.05);
  approx(result.proceedsPerBacker, 114.83, 0.03);
  approx(result.goalReachedPct, 125.00);
});

// TC-IG-02 — Fixed campaign over goal: funds kept, fees apply
test('TC-IG-02 fixed campaign that meets goal — fees apply', () => {
  const { result, error } = calculate({ ...BASE, campaignType: 'fixed' }, { lang: 'en' });

  assert.equal(error, '');
  assert.equal(result.isGoalMet, true);
  approx(result.grossRaised, 12500);
  approx(result.platformFee, 625.00);
  assert.ok(result.netProceeds > 0, 'net proceeds should be positive');
});

// TC-IG-03 — Fixed campaign under goal: grossRaised = 0, no fees
test('TC-IG-03 fixed campaign under goal — funds returned, no proceeds', () => {
  const { result, error } = calculate({
    ...BASE,
    campaignType: 'fixed',
    totalRaised: 7500
  }, { lang: 'en' });

  assert.equal(error, '');
  assert.equal(result.isGoalMet, false);
  assert.equal(result.grossRaised, 0);
  assert.equal(result.platformFee, 0);
  assert.equal(result.processingFees, 0);
  assert.equal(result.totalFees, 0);
  assert.equal(result.netProceeds, 0);
  approx(result.goalReachedPct, 75.00);
});

// TC-IG-04 — InDemand campaign: always keeps what's raised
test('TC-IG-04 indemand campaign — keeps what is raised regardless of goal', () => {
  const { result, error } = calculate({
    ...BASE,
    campaignType: 'indemand',
    totalRaised: 5000  // below goal
  }, { lang: 'en' });

  assert.equal(error, '');
  // indemand keeps funds even if under goal
  approx(result.grossRaised, 5000);
  assert.ok(result.platformFee > 0, 'platform fee should apply');
  assert.ok(result.netProceeds > 0, 'net proceeds should be positive');
});

// TC-IG-05 — Refund rate reduces net proceeds
test('TC-IG-05 refund rate reduces net proceeds', () => {
  const base = calculate(BASE, { lang: 'en' }).result;
  const { result, error } = calculate({ ...BASE, refundRatePct: 5 }, { lang: 'en' });

  assert.equal(error, '');
  // refundLoss = 12500 * 0.05 = 625
  approx(result.refundLoss, 625.00);
  assert.ok(result.netProceeds < base.netProceeds, 'refund should reduce net proceeds');
  // effective fee rate should be higher
  assert.ok(result.effectiveFeeRatePct > 0, 'effective fee rate should be computed from fees only');
});

// TC-IG-06 — Invalid inputs are rejected
test('TC-IG-06 invalid inputs are rejected', () => {
  const badCases = [
    { ...BASE, goalAmount: 0 },
    { ...BASE, goalAmount: -100 },
    { ...BASE, totalRaised: -1 },
    { ...BASE, numberOfBackers: 0 },
    { ...BASE, campaignType: 'unknown' },
    { ...BASE, platformFeePct: -1 },
    { ...BASE, platformFeePct: 101 },
    { ...BASE, processingFeePct: 110 },
    { ...BASE, processingFixedFee: -0.01 },
    { ...BASE, refundRatePct: -5 },
    { ...BASE, targetNetProceeds: -100 }
  ];

  badCases.forEach((input) => {
    const { result, error } = calculate(input, { lang: 'en' });
    assert.equal(result, null, `should reject: ${JSON.stringify(input)}`);
    assert.notEqual(error, '', 'error should be non-empty');
  });
});

// TC-IG-07 — requiredRaisedForTarget matches target net proceeds
test('TC-IG-07 requiredRaisedForTarget achieves target net proceeds', () => {
  const targetNetProceeds = 8000;
  const { result, error } = calculate({ ...BASE, targetNetProceeds }, { lang: 'en' });

  assert.equal(error, '');
  assert.ok(result.requiredRaisedForTarget !== null, 'should compute required raised');
  assert.ok(result.requiredRaisedForTarget > targetNetProceeds, 'required raised must exceed target');

  // Verify: calculate with requiredRaisedForTarget as totalRaised
  const check = calculate({
    ...BASE,
    totalRaised: result.requiredRaisedForTarget,
    targetNetProceeds: 0
  }, { lang: 'en' }).result;
  approx(check.netProceeds, targetNetProceeds, 1.00);
});

// TC-IG-08 — Summary includes required fields
test('TC-IG-08 summary includes all required fields', () => {
  const { result, error } = calculate(BASE, { lang: 'en' });

  assert.equal(error, '');
  assert.match(result.summary, /Indiegogo Fee Calculator Summary/);
  assert.match(result.summary, /Campaign type:.*flexible/);
  assert.match(result.summary, /Goal amount:.*10000/);
  assert.match(result.summary, /Platform fee/);
  assert.match(result.summary, /Processing fees:/);
  assert.match(result.summary, /Net proceeds:/);
  assert.match(result.summary, /Effective fee rate:/);
  assert.match(result.summary, /Required raised for target:/);
});

// TC-IG-09 — DEFAULTS export has correct shape and values
test('TC-IG-09 DEFAULTS export has expected shape', () => {
  assert.equal(typeof DEFAULTS.goalAmount, 'number');
  assert.equal(typeof DEFAULTS.campaignType, 'string');
  assert.equal(DEFAULTS.goalAmount, 10000);
  assert.equal(DEFAULTS.platformFeePct, 5);
  assert.equal(DEFAULTS.processingFeePct, 2.9);
  assert.equal(DEFAULTS.processingFixedFee, 0.30);
  assert.equal(DEFAULTS.refundRatePct, 0);
  assert.equal(DEFAULTS.campaignType, 'flexible');
});

// TC-IG-10 — Korean language returns localized strings
test('TC-IG-10 Korean language returns localized strings', () => {
  const { result, error } = calculate(BASE, { lang: 'ko' });

  assert.equal(error, '');
  assert.match(result.summary, /Indiegogo 수수료 계산기 요약/);
});
