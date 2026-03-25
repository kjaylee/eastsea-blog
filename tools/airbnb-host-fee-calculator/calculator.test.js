const { test } = require('node:test');
const assert = require('node:assert/strict');
const { calculate, DEFAULTS } = require('./calculator.js');

// TC-AB-01: Baseline profitable booking (host-only 3% model)
test('TC-AB-01: baseline host-only 3% fee', () => {
  const { result, error } = calculate({
    nightlyRate: 150,
    numberOfNights: 3,
    cleaningFee: 45,
    hostServiceFeePct: 3,
    coHostSplitPct: 0,
    numberOfBookings: 8,
    occupancyTaxPct: 0,
    targetMonthlyNet: 2000
  });
  assert.equal(error, '');
  assert.ok(result !== null);
  // bookingSubtotal = 150*3 = 450; gross = 450+45 = 495
  assert.equal(result.grossBookingRevenue, 495);
  // host fee = 450 * 0.03 = 13.50
  assert.equal(result.airbnbHostFee, 13.50);
  // co-host = 0
  assert.equal(result.coHostPayout, 0);
  // incomePerBooking = 495 - 13.50 = 481.50
  assert.equal(result.incomePerBooking, 481.50);
  // netHostIncome = 481.50 * 8 = 3852
  assert.equal(result.netHostIncome, 3852);
  // incomePerNight = 481.50 / 3 = 160.5
  assert.equal(result.incomePerNight, 160.5);
  // effectiveFeeRatePct = 13.50 / 495 * 100 ≈ 2.7273
  assert.ok(Math.abs(result.effectiveFeeRatePct - 2.7273) < 0.001);
  // requiredBookings = ceil(2000 / 481.50) = ceil(4.153) = 5
  assert.equal(result.requiredBookingsForTarget, 5);
});

// TC-AB-02: With co-host split
test('TC-AB-02: co-host split reduces net income', () => {
  const { result, error } = calculate({
    nightlyRate: 200,
    numberOfNights: 2,
    cleaningFee: 60,
    hostServiceFeePct: 3,
    coHostSplitPct: 20,
    numberOfBookings: 5,
    occupancyTaxPct: 0,
    targetMonthlyNet: 1500
  });
  assert.equal(error, '');
  // bookingSubtotal = 400; gross = 460
  assert.equal(result.grossBookingRevenue, 460);
  // host fee = 400 * 0.03 = 12
  assert.equal(result.airbnbHostFee, 12);
  // payoutBeforeCoHost = 460 - 12 = 448
  // coHostPayout = 448 * 0.20 = 89.60
  assert.equal(result.coHostPayout, 89.60);
  // incomePerBooking = 448 - 89.60 = 358.40
  assert.equal(result.incomePerBooking, 358.40);
  // netHostIncome = 358.40 * 5 = 1792
  assert.equal(result.netHostIncome, 1792);
});

// TC-AB-03: Occupancy tax is calculated on nightly subtotal only
test('TC-AB-03: occupancy tax calculation', () => {
  const { result, error } = calculate({
    nightlyRate: 100,
    numberOfNights: 5,
    cleaningFee: 30,
    hostServiceFeePct: 3,
    coHostSplitPct: 0,
    numberOfBookings: 4,
    occupancyTaxPct: 10,
    targetMonthlyNet: 1000
  });
  assert.equal(error, '');
  // bookingSubtotal = 500; occupancyTax = 500 * 0.10 = 50
  assert.equal(result.occupancyTaxTotal, 50);
  // gross = 500 + 30 = 530; host fee = 500*0.03 = 15
  assert.equal(result.grossBookingRevenue, 530);
  assert.equal(result.airbnbHostFee, 15);
});

// TC-AB-04: requiredBookings for target
test('TC-AB-04: required bookings for monthly target', () => {
  const { result, error } = calculate({
    nightlyRate: 80,
    numberOfNights: 2,
    cleaningFee: 20,
    hostServiceFeePct: 3,
    coHostSplitPct: 0,
    numberOfBookings: 1,
    occupancyTaxPct: 0,
    targetMonthlyNet: 1000
  });
  assert.equal(error, '');
  // bookingSubtotal = 160; gross = 180; fee = 4.80; income = 175.20
  assert.equal(result.incomePerBooking, 175.20);
  // ceil(1000 / 175.20) = ceil(5.707) = 6
  assert.equal(result.requiredBookingsForTarget, 6);
});

// TC-AB-05: targetMonthlyNet = 0 → requiredBookings = 0
test('TC-AB-05: zero target monthly net', () => {
  const { result, error } = calculate({
    nightlyRate: 120,
    numberOfNights: 1,
    cleaningFee: 0,
    hostServiceFeePct: 3,
    coHostSplitPct: 0,
    numberOfBookings: 1,
    occupancyTaxPct: 0,
    targetMonthlyNet: 0
  });
  assert.equal(error, '');
  assert.equal(result.requiredBookingsForTarget, 0);
});

// TC-AB-06: Invalid inputs return errors
test('TC-AB-06: invalid input validation', () => {
  const cases = [
    { nightlyRate: 0, numberOfNights: 1, cleaningFee: 0, hostServiceFeePct: 3, coHostSplitPct: 0, numberOfBookings: 1, occupancyTaxPct: 0, targetMonthlyNet: 0 },
    { nightlyRate: 100, numberOfNights: 0, cleaningFee: 0, hostServiceFeePct: 3, coHostSplitPct: 0, numberOfBookings: 1, occupancyTaxPct: 0, targetMonthlyNet: 0 },
    { nightlyRate: 100, numberOfNights: 1, cleaningFee: -5, hostServiceFeePct: 3, coHostSplitPct: 0, numberOfBookings: 1, occupancyTaxPct: 0, targetMonthlyNet: 0 },
    { nightlyRate: 100, numberOfNights: 1, cleaningFee: 0, hostServiceFeePct: 110, coHostSplitPct: 0, numberOfBookings: 1, occupancyTaxPct: 0, targetMonthlyNet: 0 },
    { nightlyRate: 100, numberOfNights: 1, cleaningFee: 0, hostServiceFeePct: 3, coHostSplitPct: 0, numberOfBookings: 0, occupancyTaxPct: 0, targetMonthlyNet: 0 }
  ];
  for (const input of cases) {
    const { result, error } = calculate(input);
    assert.equal(result, null, `expected null result for input ${JSON.stringify(input)}`);
    assert.ok(error.length > 0, `expected error for input ${JSON.stringify(input)}`);
  }
});

// TC-AB-07: DEFAULTS export exists and is usable
test('TC-AB-07: DEFAULTS are valid and produce result', () => {
  assert.ok(DEFAULTS.nightlyRate > 0);
  assert.ok(DEFAULTS.numberOfNights >= 1);
  assert.ok(DEFAULTS.cleaningFee >= 0);
  const { result, error } = calculate(DEFAULTS);
  assert.equal(error, '');
  assert.ok(result !== null);
  assert.ok(typeof result.grossBookingRevenue === 'number');
  assert.ok(typeof result.netHostIncome === 'number');
});

// TC-AB-08: Korean language support
test('TC-AB-08: Korean language summary and status', () => {
  const { result, error } = calculate({
    nightlyRate: 100,
    numberOfNights: 2,
    cleaningFee: 20,
    hostServiceFeePct: 3,
    coHostSplitPct: 0,
    numberOfBookings: 5,
    occupancyTaxPct: 0,
    targetMonthlyNet: 500
  }, { lang: 'ko' });
  assert.equal(error, '');
  assert.ok(result.summary.includes('에어비앤비'));
  assert.ok(result.status.includes('플러스'));
});
