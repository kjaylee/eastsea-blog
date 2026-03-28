const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const calc = require('./calculator.js');

function near(actual, expected, tolerance = 1e-6) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} vs ${expected}`);
}

const baseline = {
  monthlyOrders: 100,
  averageOrderValue: 30,
  refundRatePct: 5,
  gumroadDiscoverSharePct: 0,
  lemonInternationalSharePct: 0,
  lemonPaypalSharePct: 0,
  subscriptionSharePct: 0,
  expectedOrderLiftPct: 0,
  migrationCost: 300,
};

test('TC-GL-00 exports defaults and constants', () => {
  assert.equal(calc.DEFAULT_INPUTS.monthlyOrders, 100);
  assert.equal(calc.CONSTANTS.GUMROAD_DIRECT_RATE, 0.10);
  assert.equal(calc.CONSTANTS.GUMROAD_DISCOVER_RATE, 0.30);
  assert.equal(calc.CONSTANTS.LEMON_BASE_RATE, 0.05);
});

test('TC-GL-01 baseline direct-sale comparison favors Lemon at same volume', () => {
  const out = calc.calculate(baseline);
  assert.equal(out.ok, true);

  near(out.result.currentGross, 3000);
  near(out.result.recognizedRevenue, 2850);
  near(out.result.gumroadFees, 335);
  near(out.result.gumroadNet, 2515);
  near(out.result.sameVolumeLemonFees, 192.5);
  near(out.result.sameVolumeLemonNet, 2657.5);
  near(out.result.sameVolumeDelta, 142.5);
  near(out.result.projectedDelta, 142.5);
  near(out.result.paybackMonths, 2.1052631579, 1e-8);
});

test('TC-GL-02 Discover-heavy Gumroad seller widens Lemon advantage', () => {
  const out = calc.calculate({ ...baseline, gumroadDiscoverSharePct: 40 });
  assert.equal(out.ok, true);

  near(out.result.gumroadDirectFee, 201);
  near(out.result.gumroadDiscoverFee, 342);
  near(out.result.gumroadFees, 543);
  near(out.result.gumroadNet, 2307);
  near(out.result.sameVolumeDelta, 350.5);
  assert.ok(out.result.sameVolumeDelta > calc.calculate(baseline).result.sameVolumeDelta);
});

test('TC-GL-03 Lemon surcharges reduce same-volume savings', () => {
  const out = calc.calculate({
    ...baseline,
    lemonInternationalSharePct: 50,
    lemonPaypalSharePct: 25,
    subscriptionSharePct: 100,
  });
  assert.equal(out.ok, true);

  near(out.result.lemonFeeRatePct, 6.625, 1e-9);
  near(out.result.sameVolumeLemonFees, 238.8125, 1e-8);
  near(out.result.sameVolumeLemonNet, 2611.1875, 1e-8);
  near(out.result.sameVolumeDelta, 96.1875, 1e-8);
});

test('TC-GL-04 Expected order lift improves projected ROI and shortens payback', () => {
  const out = calc.calculate({ ...baseline, expectedOrderLiftPct: 20 });
  assert.equal(out.ok, true);

  near(out.result.projectedLemonOrders, 120);
  near(out.result.projectedLemonGross, 3600);
  near(out.result.projectedLemonFees, 231);
  near(out.result.projectedLemonNet, 3189);
  near(out.result.projectedDelta, 674);
  near(out.result.annualProjectedDelta, 8088);
  near(out.result.paybackMonths, 0.4451038576, 1e-8);
  assert.ok(out.result.projectedDelta > out.result.sameVolumeDelta);
});

test('TC-GL-05 payback scales with migration cost when delta is positive', () => {
  const cheap = calc.calculate({ ...baseline, migrationCost: 300 });
  const expensive = calc.calculate({ ...baseline, migrationCost: 1200 });
  assert.equal(cheap.ok, true);
  assert.equal(expensive.ok, true);
  assert.ok(cheap.result.projectedDelta > 0);
  assert.ok(expensive.result.projectedDelta > 0);
  assert.ok(expensive.result.paybackMonths > cheap.result.paybackMonths);
});

test('TC-GL-06 validation rejects impossible values', () => {
  const out = calc.calculate({
    ...baseline,
    monthlyOrders: 0,
    averageOrderValue: 0,
    refundRatePct: 100,
    gumroadDiscoverSharePct: 101,
    migrationCost: -1,
  });
  assert.equal(out.ok, false);
  const joined = out.errors.join(' | ');
  assert.match(joined, /monthlyOrders/);
  assert.match(joined, /averageOrderValue/);
  assert.match(joined, /refundRatePct/);
  assert.match(joined, /gumroadDiscoverSharePct/);
  assert.match(joined, /migrationCost/);
});

test('TC-GL-07 HTML contains required controls and related links', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  for (const token of [
    'Gumroad vs Lemon Squeezy Migration ROI Calculator',
    'id="monthlyOrders"',
    'id="averageOrderValue"',
    'id="refundRatePct"',
    'id="gumroadDiscoverSharePct"',
    'id="lemonInternationalSharePct"',
    'id="lemonPaypalSharePct"',
    'id="subscriptionSharePct"',
    'id="expectedOrderLiftPct"',
    'id="migrationCost"',
    '/assets/analytics.js',
    './calculator.js',
    '/tools/gumroad-net-revenue-calculator/',
    '/tools/lemon-squeezy-fee-calculator/'
  ]) {
    assert.ok(html.includes(token), token);
  }
});
