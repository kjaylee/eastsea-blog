const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const calc = require('./calculator.js');

function near(actual, expected, tolerance = 1e-6) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} vs ${expected}`);
}

const fixtureA = {
  monthlyOrders: 120,
  averageOrderValue: 25,
  refundRatePct: 3,
  processorRatePct: 2.9,
  processorFixedFee: 0.30,
  sellfyMonthlyPlanCost: 29,
  sellfyOverageRatePct: 0,
  annualSalesCap: 0,
};

const fixtureB = {
  monthlyOrders: 10,
  averageOrderValue: 12,
  refundRatePct: 0,
  processorRatePct: 2.9,
  processorFixedFee: 0.30,
  sellfyMonthlyPlanCost: 29,
  sellfyOverageRatePct: 0,
  annualSalesCap: 0,
};

const fixtureC = {
  monthlyOrders: 200,
  averageOrderValue: 30,
  refundRatePct: 2,
  processorRatePct: 2.9,
  processorFixedFee: 0.30,
  sellfyMonthlyPlanCost: 29,
  sellfyOverageRatePct: 2,
  annualSalesCap: 50000,
};

test('TC-SG-00 exports defaults and constants', () => {
  assert.equal(calc.DEFAULT_INPUTS.monthlyOrders, 120);
  assert.equal(calc.CONSTANTS.GUMROAD_DIRECT_RATE, 0.10);
  assert.equal(calc.CONSTANTS.GUMROAD_DIRECT_FIXED_FEE, 0.50);
});

test('TC-SG-01 baseline creator scenario favors Sellfy', () => {
  const out = calc.calculate(fixtureA);
  assert.equal(out.ok, true);
  near(out.result.grossBillings, 3000);
  near(out.result.refundLoss, 90);
  near(out.result.recognizedRevenue, 2910);
  near(out.result.processorVariableFees, 87);
  near(out.result.processorFixedFees, 36);
  near(out.result.gumroadPlatformFee, 351);
  near(out.result.gumroadNetTakeHome, 2436);
  near(out.result.sellfyNetTakeHome, 2758);
  near(out.result.monthlyDelta, 322);
  near(out.result.annualDelta, 3864);
  near(out.result.perOrderDelta, 2.6833333333, 1e-8);
  assert.equal(out.result.breakEvenMonthlyOrdersForSellfy, 10);
  assert.equal(out.result.winner, 'sellfy');
});

test('TC-SG-02 low-volume creator scenario favors Gumroad', () => {
  const out = calc.calculate(fixtureB);
  assert.equal(out.ok, true);
  near(out.result.grossBillings, 120);
  near(out.result.gumroadPlatformFee, 17);
  near(out.result.gumroadNetTakeHome, 96.52);
  near(out.result.sellfyNetTakeHome, 84.52);
  near(out.result.monthlyDelta, -12);
  assert.equal(out.result.winner, 'gumroad');
});

test('TC-SG-03 overage path reduces Sellfy advantage', () => {
  const out = calc.calculate(fixtureC);
  assert.equal(out.ok, true);
  near(out.result.annualizedGrossBillings, 72000);
  near(out.result.annualSellfyOverageFee, 440);
  near(out.result.sellfyMonthlyOverageFee, 36.6666666667, 1e-8);
  near(out.result.sellfyTotalFixedMonthlyCost, 65.6666666667, 1e-8);
  assert.ok(out.result.sellfyMonthlyOverageFee > 0);
});

test('TC-SG-04 validation rejects impossible values', () => {
  const out = calc.calculate({
    ...fixtureA,
    monthlyOrders: 0,
    averageOrderValue: 0,
    refundRatePct: 101,
    processorFixedFee: -1,
    sellfyOverageRatePct: 5,
    annualSalesCap: 0,
  });
  assert.equal(out.ok, false);
  const joined = out.errors.join(' | ');
  assert.match(joined, /monthlyOrders/);
  assert.match(joined, /averageOrderValue/);
  assert.match(joined, /refundRatePct/);
  assert.match(joined, /processorFixedFee/);
});

test('TC-SG-04b overage without cap is rejected', () => {
  const out = calc.calculate({ ...fixtureA, sellfyOverageRatePct: 5, annualSalesCap: 0 });
  assert.equal(out.ok, false);
  assert.match(out.errors.join(' | '), /annualSalesCap/);
});

test('TC-SG-05 summary includes decision-ready output', () => {
  const out = calc.calculate(fixtureA);
  assert.equal(out.ok, true);
  assert.match(out.result.summary, /Winner: Sellfy wins/);
  assert.match(out.result.summary, /Gumroad net take-home: \$2,436\.00/);
  assert.match(out.result.summary, /Sellfy net take-home: \$2,758\.00/);
  assert.match(out.result.summary, /Monthly delta .*\$322\.00/);
  assert.match(out.result.summary, /break-even monthly orders: 10/i);
});

test('TC-SG-06 HTML contains required anchors and related links', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  for (const token of [
    'Sellfy vs Gumroad Profit Calculator',
    'id="monthlyOrders"',
    'id="averageOrderValue"',
    'id="refundRatePct"',
    'id="processorRatePct"',
    'id="processorFixedFee"',
    'id="sellfyMonthlyPlanCost"',
    'id="sellfyOverageRatePct"',
    'id="annualSalesCap"',
    '/assets/analytics.js',
    './calculator.js',
    '/tools/gumroad-net-revenue-calculator/',
    '/tools/merchant-of-record-vs-direct-billing-profit-calculator/'
  ]) {
    assert.ok(html.includes(token), token);
  }
});

test('TC-SG-07 catalog exact-once contract holds', () => {
  const root = path.resolve(__dirname, '..', '..');
  const slug = 'sellfy-vs-gumroad-profit-calculator';
  const url = `/tools/${slug}/`;
  const html = fs.readFileSync(path.join(root, 'tools', 'index.html'), 'utf8');
  const md = fs.readFileSync(path.join(root, 'tools', 'index.md'), 'utf8');
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'manifest.json'), 'utf8')).tools;
  const toolsList = JSON.parse(fs.readFileSync(path.join(root, '_data', 'tools-list.json'), 'utf8'));

  const htmlMatches = (html.match(new RegExp(`href="${slug}/"`, 'g')) || []).length;
  const mdMatches = (md.match(new RegExp(`\./${slug}/`, 'g')) || []).length;
  const manifestMatches = manifest.filter((x) => x && x.slug === slug && x.url === url).length;
  const listMatches = toolsList.filter((x) => x && x.url === url).length;

  assert.equal(htmlMatches, 1);
  assert.equal(mdMatches, 1);
  assert.equal(manifestMatches, 1);
  assert.equal(listMatches, 1);
});
