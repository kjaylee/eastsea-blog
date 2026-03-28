const test = require('node:test');
const assert = require('node:assert/strict');
const calc = require('./calculator.js');

test('tc1_baseline_default_inputs_return_valid_result', () => {
  const out = calc.calculate(calc.DEFAULT_INPUTS);
  assert.equal(out.ok, true);
  assert.equal(out.result.winnerId, 'memberful');
  assert.equal(out.result.patreonNet, 3314);
  assert.equal(out.result.memberfulNet, 3469);
  assert.equal(out.result.memberfulDeltaVsPatreon, 155);
  assert.equal(out.result.paybackMonths, 1.61);
  assert.equal(out.result.breakEvenGrossForMemberful, 960.78);
  assert.equal(out.result.breakEvenChargesForMemberful, 72.06);
  assert.match(out.result.summary, /Patreon vs Memberful Profit Calculator/);
});

test('tc2_invalid_monthly_gross_is_rejected', () => {
  const out = calc.calculate({ monthlyGrossSales: 0, successfulCharges: 10 });
  assert.equal(out.ok, false);
  assert.match(out.errors[0], /monthlyGrossSales/);
});

test('tc3_payback_is_null_when_memberful_does_not_win', () => {
  const out = calc.calculate({
    monthlyGrossSales: 500,
    successfulCharges: 50,
    refundRatePct: 0,
    patreonExtraFeePreset: 'baseline',
    memberfulProcessorPreset: 'international',
    migrationCost: 250,
  });

  assert.equal(out.ok, true);
  assert.equal(out.result.winnerId, 'patreon');
  assert.equal(out.result.memberfulDeltaVsPatreon, -31);
  assert.equal(out.result.paybackMonths, null);
});

test('tc4_choose_winner_prefers_higher_net_then_lower_fees', () => {
  const higherNet = calc.chooseWinner([
    { id: 'a', net: 900, totalFees: 100 },
    { id: 'b', net: 950, totalFees: 140 },
  ]);
  assert.equal(higherNet.id, 'b');

  const lowerFeeTie = calc.chooseWinner([
    { id: 'a', net: 900, totalFees: 120 },
    { id: 'b', net: 900, totalFees: 100 },
  ]);
  assert.equal(lowerFeeTie.id, 'b');
});

test('tc5_break_even_for_memberful_is_finite_when_memberful_unit_economics_are_better', () => {
  const out = calc.calculate({
    monthlyGrossSales: 2500,
    successfulCharges: 200,
    refundRatePct: 2,
    patreonExtraFeePreset: 'baseline',
    memberfulProcessorPreset: 'domestic',
  });

  assert.equal(out.ok, true);
  assert.equal(out.result.breakEvenGrossForMemberful > 0, true);
  assert.equal(out.result.breakEvenChargesForMemberful > 0, true);
});

test('tc6_break_even_is_null_when_memberful_never_catches_up', () => {
  const validation = calc.validateInputs({
    monthlyGrossSales: 1000,
    successfulCharges: 100,
    refundRatePct: 0,
    patreonExtraFeePreset: 'custom',
    customPatreonExtraFeeRatePct: 0,
    customPatreonExtraFixedFee: 0,
    memberfulProcessorPreset: 'custom',
    customMemberfulProcessorRatePct: 8,
    customMemberfulProcessorFlatFee: 1,
    migrationCost: 0,
  });

  assert.equal(validation.ok, true);
  const input = validation.input;
  const shared = calc.buildSharedMetrics(input);
  const patreon = calc.calcPatreonScenario(shared, calc.resolvePatreonExtraFees(input));
  const memberful = calc.calcMemberfulScenario(shared, calc.resolveMemberfulProcessor(input));
  const breakEven = calc.calcBreakEvenForMemberful(shared, patreon, memberful);

  assert.equal(breakEven.grossSales, null);
  assert.equal(breakEven.charges, null);
});

test('tc7_custom_fee_paths_override_defaults', () => {
  const out = calc.calculate({
    monthlyGrossSales: 3000,
    successfulCharges: 150,
    refundRatePct: 1,
    patreonExtraFeePreset: 'custom',
    customPatreonExtraFeeRatePct: 4.5,
    customPatreonExtraFixedFee: 0.5,
    memberfulProcessorPreset: 'custom',
    customMemberfulProcessorRatePct: 3.5,
    customMemberfulProcessorFlatFee: 0.4,
    migrationCost: 100,
  });

  assert.equal(out.ok, true);
  assert.equal(out.result.patreonNet, 2460);
  assert.equal(out.result.memberfulNet, 2609);
  assert.equal(out.result.memberfulDeltaVsPatreon, 149);
  assert.equal(out.result.paybackMonths, 0.67);
});
