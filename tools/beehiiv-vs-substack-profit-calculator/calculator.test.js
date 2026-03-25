var assert = require('assert');
var calc = require('./calculator.js');

var passed = 0;
var failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log('  ✓ ' + name);
  } catch (e) {
    failed++;
    console.error('  ✗ ' + name);
    console.error('    ' + e.message);
  }
}

function approx(actual, expected, msg, tol) {
  tol = tol || 0.01;
  assert.ok(
    Math.abs(actual - expected) <= tol,
    (msg || '') + ' expected ' + expected + ', got ' + actual + ' (±' + tol + ')'
  );
}

console.log('\nbeehiiv vs Substack Profit Calculator — Tests\n');

// ── TC1: 100 subs × $8, plan $42, 2.9% + $0.30 ──
test('TC1: 100 subs × $8 — break-even at 52.5, beehiiv saves', function () {
  var r = calc.calculate({
    subscribers: 100, monthlyPrice: 8,
    processorPct: 2.9, processorFixed: 0.30,
    beehiivPlanCost: 42,
  });
  assert.equal(r.error, '');
  var m = r.result.main;

  approx(m.grossRevenue, 800, 'gross');
  approx(m.substackPlatformFee, 80, 'substack fee');
  approx(m.processorFee, 53.20, 'processor');
  approx(m.substackNet, 666.80, 'substack net');
  approx(m.beehiivNet, 704.80, 'beehiiv net');
  approx(m.monthlySavings, 38, 'monthly savings');
  approx(m.annualSavings, 456, 'annual savings');
  approx(m.breakEvenSubs, 52.5, 'break-even');
  // beehiiv wins since 100 > 52.5
  assert.ok(m.monthlySavings > 0, 'beehiiv should save more');
});

// ── TC2: 500 subs × $8 — beehiiv clearly wins ──
test('TC2: 500 subs × $8 — beehiiv clearly wins', function () {
  var r = calc.calculate({
    subscribers: 500, monthlyPrice: 8,
    processorPct: 2.9, processorFixed: 0.30,
    beehiivPlanCost: 42,
  });
  assert.equal(r.error, '');
  var m = r.result.main;

  approx(m.grossRevenue, 4000, 'gross');
  approx(m.substackPlatformFee, 400, 'substack fee');
  approx(m.processorFee, 266, 'processor');
  approx(m.substackNet, 3334, 'substack net');
  approx(m.beehiivNet, 3692, 'beehiiv net');
  approx(m.annualSavings, 4296, 'annual savings');
  approx(m.breakEvenSubs, 52.5, 'break-even');
  assert.equal(m.verdict, 'beehiiv-wins');
});

// ── TC3: 250 subs × $20 — fee delta widens materially ──
test('TC3: 250 subs × $20 — fee delta widens', function () {
  var r = calc.calculate({
    subscribers: 250, monthlyPrice: 20,
    processorPct: 2.9, processorFixed: 0.30,
    beehiivPlanCost: 42,
  });
  assert.equal(r.error, '');
  var m = r.result.main;

  approx(m.grossRevenue, 5000, 'gross');
  approx(m.substackPlatformFee, 500, 'substack fee');
  approx(m.processorFee, 220, 'processor');
  approx(m.substackNet, 4280, 'substack net');
  approx(m.beehiivNet, 4738, 'beehiiv net');
  approx(m.annualSavings, 5496, 'annual savings');
  approx(m.breakEvenSubs, 21, 'break-even');
  assert.equal(m.verdict, 'beehiiv-wins');
});

// ── TC4: 50 subs × $5 — below break-even, Substack cheaper ──
test('TC4: 50 subs × $5 — Substack cheaper below break-even', function () {
  var r = calc.calculate({
    subscribers: 50, monthlyPrice: 5,
    processorPct: 2.9, processorFixed: 0.30,
    beehiivPlanCost: 42,
  });
  assert.equal(r.error, '');
  var m = r.result.main;

  approx(m.grossRevenue, 250, 'gross');
  approx(m.substackPlatformFee, 25, 'substack fee');
  approx(m.processorFee, 22.25, 'processor');
  approx(m.substackNet, 202.75, 'substack net');
  approx(m.beehiivNet, 185.75, 'beehiiv net');
  approx(m.monthlySavings, -17, 'monthly savings (negative)');
  approx(m.annualSavings, -204, 'annual savings (negative)');
  approx(m.breakEvenSubs, 84, 'break-even');
  // 50 subs < break-even of 84, so Substack is cheaper
  assert.ok(m.monthlySavings < 0, 'Substack should be cheaper');
  assert.equal(m.verdict, 'substack-cheaper');
});

// ── TC5: Processor sensitivity — 3.5% + $0.35 ──
test('TC5: processor 3.5% + $0.35 — both nets fall, delta stable', function () {
  var r = calc.calculate({
    subscribers: 500, monthlyPrice: 8,
    processorPct: 3.5, processorFixed: 0.35,
    beehiivPlanCost: 42,
  });
  assert.equal(r.error, '');
  var m = r.result.main;

  approx(m.grossRevenue, 4000, 'gross');
  approx(m.substackPlatformFee, 400, 'substack fee');
  // processor = 500 × (8×0.035 + 0.35) = 500 × 0.63 = 315
  approx(m.processorFee, 315, 'processor');
  approx(m.substackNet, 3285, 'substack net');
  approx(m.beehiivNet, 3643, 'beehiiv net');
  // Delta = 400 - 42 = 358/month, same as TC2
  approx(m.monthlySavings, 358, 'monthly delta same');
  approx(m.annualSavings, 4296, 'annual savings same as TC2');
});

// ── Edge: validation rejects bad input ──
test('Validation rejects negative subscribers', function () {
  var r = calc.calculate({ subscribers: -1 });
  assert.ok(r.error.length > 0);
  assert.equal(r.result, null);
});

test('Validation rejects zero price', function () {
  var r = calc.calculate({ monthlyPrice: 0 });
  assert.ok(r.error.length > 0);
});

// ── Scenarios strip present ──
test('Scenarios strip includes 4 sub counts', function () {
  var r = calc.calculate({});
  assert.equal(r.result.scenarios.length, 4);
  assert.equal(r.result.scenarios[0].subscribers, 100);
  assert.equal(r.result.scenarios[1].subscribers, 500);
  assert.equal(r.result.scenarios[2].subscribers, 1000);
  assert.equal(r.result.scenarios[3].subscribers, 2000);
});

// ── Default inputs ──
test('Default inputs produce valid result', function () {
  var r = calc.calculate(calc.DEFAULT_INPUTS);
  assert.equal(r.error, '');
  assert.ok(r.result.main.grossRevenue > 0);
});

console.log('\n' + passed + ' passed, ' + failed + ' failed\n');
if (failed > 0) process.exit(1);
