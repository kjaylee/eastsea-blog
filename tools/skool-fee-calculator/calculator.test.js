const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  DEFAULTS,
  PRO_HIGH_TICKET_THRESHOLD,
  calculate,
  getProRate
} = require('./calculator.js');

function approx(actual, expected, tolerance = 0.01) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} to be within ${tolerance} of ${expected}`);
}

test('exports defaults and threshold constants', () => {
  assert.equal(DEFAULTS.monthlyMembers, 60);
  assert.equal(PRO_HIGH_TICKET_THRESHOLD, 900);
  assert.equal(getProRate(899), 0.029);
  assert.equal(getProRate(900), 0.039);
});

test('low-ticket case keeps hobby ahead below pro break-even', () => {
  const { result, error } = calculate({
    monthlyMembers: 100,
    monthlyPrice: 9,
    annualMembersBilled: 0,
    annualPrice: 0,
    oneTimePurchases: 0,
    oneTimePrice: 0,
    refundRatePct: 0
  });

  assert.equal(error, '');
  assert.equal(result.gross, 900);
  approx(result.hobby.transactionFees, 120);
  approx(result.hobby.net, 771);
  approx(result.pro.transactionFees, 56.1);
  approx(result.pro.net, 744.9);
  assert.equal(result.winner, 'hobby');
  approx(result.breakEvenGross, 1267.61, 0.02);
});

test('mixed-ticket case gives pro a clear advantage', () => {
  const { result, error } = calculate({
    monthlyMembers: 80,
    monthlyPrice: 99,
    annualMembersBilled: 4,
    annualPrice: 900,
    oneTimePurchases: 2,
    oneTimePrice: 1200,
    refundRatePct: 3
  });

  assert.equal(error, '');
  assert.equal(result.gross, 13920);
  approx(result.hobby.transactionFees, 1417.8);
  approx(result.pro.transactionFees, 489.48);
  approx(result.hobby.net, 12075.6);
  approx(result.pro.net, 12913.92);
  approx(result.deltaProVsHobby, 838.32);
  assert.equal(result.winner, 'pro');
  approx(result.breakEvenGross, 1349.53, 0.05);
});

test('900-dollar tickets use the higher pro rate branch', () => {
  const { result, error } = calculate({
    monthlyMembers: 0,
    monthlyPrice: 0,
    annualMembersBilled: 1,
    annualPrice: 900,
    oneTimePurchases: 0,
    oneTimePrice: 0,
    refundRatePct: 0
  });

  assert.equal(error, '');
  approx(result.pro.transactionFees, 35.4);
  approx(result.hobby.transactionFees, 90.3);
});

test('zero-volume case stays valid and returns no break-even gross', () => {
  const { result, error } = calculate({
    monthlyMembers: 0,
    monthlyPrice: 99,
    annualMembersBilled: 0,
    annualPrice: 900,
    oneTimePurchases: 0,
    oneTimePrice: 1200,
    refundRatePct: 0
  });

  assert.equal(error, '');
  assert.equal(result.gross, 0);
  assert.equal(result.hobby.net, -9);
  assert.equal(result.pro.net, -99);
  assert.equal(result.breakEvenGross, null);
});

test('invalid values are rejected', () => {
  const invalidInputs = [
    { ...DEFAULTS, monthlyMembers: -1 },
    { ...DEFAULTS, annualMembersBilled: 1.2 },
    { ...DEFAULTS, monthlyPrice: -0.01 },
    { ...DEFAULTS, refundRatePct: 120 }
  ];

  invalidInputs.forEach((input) => {
    const { result, error } = calculate(input);
    assert.equal(result, null);
    assert.notEqual(error, '');
  });
});

test('summary and discovery wiring are exact-once', () => {
  const { result, error } = calculate(DEFAULTS);
  assert.equal(error, '');
  assert.match(result.summary, /Skool Fee Calculator Summary/);
  assert.match(result.summary, /Gross billed:/);
  assert.match(result.summary, /Hobby net:/);
  assert.match(result.summary, /Pro net:/);

  const root = path.join(__dirname, '..', '..');
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  const indexHtml = fs.readFileSync(path.join(root, 'tools', 'index.html'), 'utf8');
  const indexMd = fs.readFileSync(path.join(root, 'tools', 'index.md'), 'utf8');
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'manifest.json'), 'utf8'));
  const toolsList = JSON.parse(fs.readFileSync(path.join(root, '_data', 'tools-list.json'), 'utf8'));

  assert.ok(html.includes('/assets/analytics.js'));
  assert.ok(html.includes('script defer src="./calculator.js"'));
  assert.equal((indexHtml.match(/skool-fee-calculator/g) || []).length, 1, 'index.html exact-once');
  assert.equal((indexMd.match(/skool-fee-calculator/g) || []).length, 1, 'index.md exact-once');
  assert.equal(toolsList.filter((entry) => entry.url === '/tools/skool-fee-calculator/').length, 1, 'tools-list exact-once');
  assert.equal(
    manifest.tools.filter((entry) => entry.slug === 'skool-fee-calculator' && entry.url === '/tools/skool-fee-calculator/').length,
    1,
    'manifest exact-once'
  );
});
