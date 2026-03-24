const test = require('node:test');
const assert = require('node:assert/strict');
const calc = require('./calculator.js');

function near(actual, expected, tolerance = 0.02) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} vs ${expected}`);
}

const fixture = {
  appStorePrice: 14.99,
  webPrice: 12.99,
  eligibleCustomers: 1000,
  webCaptureRatePct: 72,
  appStoreRefundRatePct: 4,
  webRefundRatePct: 5,
  appStoreFeeRatePct: 30,
  merchantOfRecordFeeRatePct: 5,
  paymentFeeRatePct: 2.9,
  paymentFixedFee: 0.30,
  monthlyWebFixedCost: 399,
};

test('golden default scenario matches expected economics', () => {
  const out = calc.calculate(fixture);
  assert.equal(out.ok, true);
  near(out.result.appGrossBillings, 14990.00);
  near(out.result.appRefundedAmount, 599.60);
  near(out.result.appRecognizedBillings, 14390.40);
  near(out.result.appFeeAmount, 4317.12);
  near(out.result.appNetTakeHome, 10073.28);
  near(out.result.completedWebOrders, 720.00);
  near(out.result.webGrossBillings, 9352.80);
  near(out.result.webRefundedAmount, 467.64);
  near(out.result.webRecognizedBillings, 8885.16);
  near(out.result.webVariableFees, 701.93);
  near(out.result.webFixedPaymentFees, 216.00);
  near(out.result.webTotalCosts, 1316.93);
  near(out.result.webNetTakeHome, 7568.23);
  near(out.result.monthlyDelta, -2505.05);
  near(out.result.annualDelta, -30060.57);
  near(out.result.breakEvenWebCaptureRatePct, 94.64);
  near(out.result.requiredWebPrice, 16.97);
});

test('better web capture improves web net and monthly delta', () => {
  const lowCapture = calc.calculate({ ...fixture, webCaptureRatePct: 40 });
  const highCapture = calc.calculate({ ...fixture, webCaptureRatePct: 90 });
  assert.equal(lowCapture.ok, true);
  assert.equal(highCapture.ok, true);
  assert.ok(highCapture.result.webNetTakeHome > lowCapture.result.webNetTakeHome);
  assert.ok(highCapture.result.monthlyDelta > lowCapture.result.monthlyDelta);
});

test('low web capture can keep App Store ahead despite high App Store fee', () => {
  const out = calc.calculate({
    ...fixture,
    webCaptureRatePct: 18,
    webPrice: 11.99,
    monthlyWebFixedCost: 499,
  });
  assert.equal(out.ok, true);
  assert.ok(out.result.appNetTakeHome > out.result.webNetTakeHome);
  assert.ok(out.result.monthlyDelta < 0);
});

test('break-even capture acts as a threshold', () => {
  const base = calc.calculate(fixture);
  const below = calc.calculate({ ...fixture, webCaptureRatePct: 90 });
  const above = calc.calculate({ ...fixture, webCaptureRatePct: 98 });
  assert.equal(base.ok, true);
  assert.equal(below.ok, true);
  assert.equal(above.ok, true);
  assert.ok(base.result.breakEvenWebCaptureRatePct > 90);
  assert.ok(below.result.monthlyDelta < 0);
  assert.ok(above.result.monthlyDelta > 0);
});

test('required web price rises when current setup under-earns App Store', () => {
  const out = calc.calculate(fixture);
  assert.equal(out.ok, true);
  assert.ok(out.result.requiredWebPrice > fixture.webPrice);
});

test('validation rejects impossible values', () => {
  const out = calc.calculate({
    ...fixture,
    appStorePrice: 0,
    webPrice: -1,
    eligibleCustomers: 10.5,
    webCaptureRatePct: 101,
    monthlyWebFixedCost: -20,
  });
  assert.equal(out.ok, false);
  assert.match(out.errors.join(' | '), /appStorePrice/);
  assert.match(out.errors.join(' | '), /webPrice/);
  assert.match(out.errors.join(' | '), /eligibleCustomers/);
  assert.match(out.errors.join(' | '), /webCaptureRatePct/);
  assert.match(out.errors.join(' | '), /monthlyWebFixedCost/);
});

test('break-even capture is unavailable when web unit economics are non-positive', () => {
  const out = calc.calculate({
    ...fixture,
    merchantOfRecordFeeRatePct: 60,
    paymentFeeRatePct: 39,
    paymentFixedFee: 2,
  });
  assert.equal(out.ok, true);
  assert.equal(out.result.breakEvenWebCaptureRatePct, null);
  assert.ok(out.result.requiredWebPrice > 1000);
});
