const test = require('node:test');
const assert = require('node:assert/strict');
const { calculate, DEFAULTS, PLAN_PRESETS } = require('./calculator.js');

function approx(actual, expected, tol = 0.01) {
  assert.ok(
    Math.abs(actual - expected) <= tol,
    `expected ${actual} ≈ ${expected} (±${tol})`
  );
}

// Case 1 — Standard monthly baseline
test('Case 1 standard monthly baseline', () => {
  const { result, error } = calculate({
    pricePerBillingCycle:   8,
    patronCount:            250,
    billingCycleMonths:     1,
    planPreset:             'standard',
    platformFeePct:         10,
    processingFeePct:       2.9,
    processingFixedFee:     0.30,
    targetMonthlyNetIncome: 3000
  }, { lang: 'en' });

  assert.equal(error, '');
  assert.ok(result !== null);

  approx(result.grossCollected,          2000.00);
  approx(result.platformFee,             200.00);
  approx(result.processingFee,           133.00);
  approx(result.totalFees,               333.00);
  approx(result.netCollected,            1667.00);
  approx(result.effectiveTakeHomePct,    83.35, 0.05);
  approx(result.monthlyEquivalentGross,  2000.00);
  approx(result.monthlyEquivalentNet,    1667.00);
  approx(result.netPerPatronPerCycle,    6.668, 0.001);
  assert.equal(result.requiredPatronsForTargetMonthlyNet, 450);
  approx(result.annualizedNet,           20004.00);
});

// Case 2 — Annual billing standard plan
test('Case 2 annual billing standard plan', () => {
  const { result, error } = calculate({
    pricePerBillingCycle:   80,
    patronCount:            120,
    billingCycleMonths:     12,
    planPreset:             'standard',
    platformFeePct:         10,
    processingFeePct:       2.9,
    processingFixedFee:     0.30,
    targetMonthlyNetIncome: 3000
  }, { lang: 'en' });

  assert.equal(error, '');
  approx(result.grossCollected,         9600.00);
  approx(result.platformFee,            960.00);
  approx(result.processingFee,          314.40);
  approx(result.totalFees,              1274.40);
  approx(result.netCollected,           8325.60);
  approx(result.effectiveTakeHomePct,   86.73, 0.05);
  approx(result.monthlyEquivalentGross, 800.00);
  approx(result.monthlyEquivalentNet,   693.80);
  approx(result.netPerPatronPerCycle,   69.38, 0.01);
  assert.equal(result.requiredPatronsForTargetMonthlyNet, 519);
  approx(result.annualizedNet,          8325.60);

  // annual cash spread check
  assert.ok(result.monthlyEquivalentNet < result.netCollected,
    'monthly-equivalent net must be lower than total netCollected for annual billing');
});

// Case 3 — Legacy Pro preset improves take-home vs standard
test('Case 3 legacy-pro vs standard', () => {
  const { result, error } = calculate({
    pricePerBillingCycle:   8,
    patronCount:            250,
    billingCycleMonths:     1,
    planPreset:             'legacy-pro',
    platformFeePct:         8,
    processingFeePct:       2.9,
    processingFixedFee:     0.30,
    targetMonthlyNetIncome: 3000
  }, { lang: 'en' });

  assert.equal(error, '');
  approx(result.grossCollected,      2000.00);
  approx(result.platformFee,         160.00);
  approx(result.processingFee,       133.00);
  approx(result.totalFees,           293.00);
  approx(result.netCollected,        1707.00);
  approx(result.effectiveTakeHomePct, 85.35, 0.05);
  approx(result.monthlyEquivalentNet, 1707.00);
  assert.equal(result.requiredPatronsForTargetMonthlyNet, 440);

  // planDeltaVsStandard should be +40 (legacy-pro nets 40 more than standard)
  assert.ok(result.planDeltaVsStandard !== null);
  approx(result.planDeltaVsStandard, 40.00);
});

// Case 4 — Impossible economics at ultra-low price
test('Case 4 impossible economics at ultra-low price', () => {
  const { result, error } = calculate({
    pricePerBillingCycle:   0.25,
    patronCount:            100,
    billingCycleMonths:     1,
    planPreset:             'standard',
    platformFeePct:         10,
    processingFeePct:       2.9,
    processingFixedFee:     0.30,
    targetMonthlyNetIncome: 100
  }, { lang: 'en' });

  assert.equal(error, '');
  // netPerPatronPerCycle ≈ -0.082 (negative)
  assert.ok(result.netPerPatronPerCycle < 0,
    'netPerPatronPerCycle should be negative at ultra-low price');
  // required patrons must be null (impossible)
  assert.equal(result.requiredPatronsForTargetMonthlyNet, null,
    'requiredPatrons should be null when economics are impossible');
  // warnings must mention impossible state
  assert.ok(result.warnings.length > 0, 'should emit a warning for impossible economics');
});

// Case 5 — Preset sync behavior
test('Case 5 preset sync - standard to legacy-lite changes platformFeePct', () => {
  const standard = calculate({
    pricePerBillingCycle: 8, patronCount: 100, billingCycleMonths: 1,
    planPreset: 'standard'
  });
  assert.equal(standard.error, '');
  // standard preset → platformFeePct=10
  const standardPlatformFee = standard.result.platformFee;
  approx(standardPlatformFee, 8 * 100 * 0.10);

  const lite = calculate({
    pricePerBillingCycle: 8, patronCount: 100, billingCycleMonths: 1,
    planPreset: 'legacy-lite'
  });
  assert.equal(lite.error, '');
  // legacy-lite preset → platformFeePct=5
  approx(lite.result.platformFee, 8 * 100 * 0.05);

  // custom mode: user-supplied platformFeePct should be used
  const custom = calculate({
    pricePerBillingCycle: 8, patronCount: 100, billingCycleMonths: 1,
    planPreset: 'custom',
    platformFeePct: 7
  });
  assert.equal(custom.error, '');
  approx(custom.result.platformFee, 8 * 100 * 0.07);
});

// Case 6 — Validation guardrails
test('Case 6 validation rejects bad inputs', () => {
  const badInputs = [
    // pricePerBillingCycle = 0
    { pricePerBillingCycle: 0,    patronCount: 100,  billingCycleMonths: 1,  planPreset: 'standard', platformFeePct: 10, processingFeePct: 2.9, processingFixedFee: 0.30 },
    // patronCount = 0
    { pricePerBillingCycle: 8,    patronCount: 0,    billingCycleMonths: 1,  planPreset: 'standard', platformFeePct: 10, processingFeePct: 2.9, processingFixedFee: 0.30 },
    // billingCycleMonths = 3 (invalid)
    { pricePerBillingCycle: 8,    patronCount: 100,  billingCycleMonths: 3,  planPreset: 'standard', platformFeePct: 10, processingFeePct: 2.9, processingFixedFee: 0.30 },
    // unknown planPreset
    { pricePerBillingCycle: 8,    patronCount: 100,  billingCycleMonths: 1,  planPreset: 'unknown',  platformFeePct: 10, processingFeePct: 2.9, processingFixedFee: 0.30 },
    // platformFeePct = -1
    { pricePerBillingCycle: 8,    patronCount: 100,  billingCycleMonths: 1,  planPreset: 'custom',   platformFeePct: -1, processingFeePct: 2.9, processingFixedFee: 0.30 },
    // processingFeePct = 101
    { pricePerBillingCycle: 8,    patronCount: 100,  billingCycleMonths: 1,  planPreset: 'standard', platformFeePct: 10, processingFeePct: 101, processingFixedFee: 0.30 },
    // processingFixedFee = -0.01
    { pricePerBillingCycle: 8,    patronCount: 100,  billingCycleMonths: 1,  planPreset: 'standard', platformFeePct: 10, processingFeePct: 2.9, processingFixedFee: -0.01 },
  ];

  for (const inp of badInputs) {
    const { result, error } = calculate(inp, { lang: 'en' });
    assert.equal(result, null, `expected null result for: ${JSON.stringify(inp)}`);
    assert.notEqual(error, '', 'expected non-empty error message');
  }
});

// Case 7 — Fee monotonicity
test('Case 7 fee monotonicity - higher platform fee reduces net', () => {
  const scenarioA = calculate({
    pricePerBillingCycle: 8, patronCount: 250, billingCycleMonths: 1,
    planPreset: 'custom', platformFeePct: 10, processingFeePct: 2.9, processingFixedFee: 0.30
  });
  const scenarioB = calculate({
    pricePerBillingCycle: 8, patronCount: 250, billingCycleMonths: 1,
    planPreset: 'custom', platformFeePct: 12, processingFeePct: 2.9, processingFixedFee: 0.30
  });

  assert.equal(scenarioA.error, '');
  assert.equal(scenarioB.error, '');

  assert.ok(scenarioB.result.netCollected < scenarioA.result.netCollected,
    'higher platform fee must lower netCollected');
  assert.ok(scenarioB.result.effectiveTakeHomePct < scenarioA.result.effectiveTakeHomePct,
    'higher platform fee must lower effectiveTakeHomePct');
});

// DEFAULTS shape
test('DEFAULTS shape is correct', () => {
  assert.equal(DEFAULTS.pricePerBillingCycle,   8);
  assert.equal(DEFAULTS.patronCount,            250);
  assert.equal(DEFAULTS.billingCycleMonths,     1);
  assert.equal(DEFAULTS.planPreset,             'standard');
  assert.equal(DEFAULTS.platformFeePct,         10);
  assert.equal(DEFAULTS.processingFeePct,       2.9);
  assert.equal(DEFAULTS.processingFixedFee,     0.30);
  assert.equal(DEFAULTS.targetMonthlyNetIncome, 3000);
});

// PLAN_PRESETS
test('PLAN_PRESETS contains correct platform fee values', () => {
  assert.equal(PLAN_PRESETS['standard'].platformFeePct,       10);
  assert.equal(PLAN_PRESETS['legacy-lite'].platformFeePct,    5);
  assert.equal(PLAN_PRESETS['legacy-pro'].platformFeePct,     8);
  assert.equal(PLAN_PRESETS['legacy-premium'].platformFeePct, 11);
  assert.equal(PLAN_PRESETS['custom'].platformFeePct,         null);
});

// Summary coverage
test('Summary contains key fields', () => {
  const { result } = calculate({}, { lang: 'en' });
  const s = result.summary;
  assert.ok(s.includes('Patreon'), 'summary should reference Patreon');
  assert.ok(s.includes('Gross collected') || s.includes('grossCollected'), 'summary should include gross');
  assert.ok(s.includes('Net collected') || s.includes('netCollected'), 'summary should include net');
  assert.ok(s.includes('Platform fee') || s.includes('platformFee'), 'summary should include platform fee');
});
