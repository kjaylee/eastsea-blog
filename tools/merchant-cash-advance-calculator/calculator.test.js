const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  COLLECTION_MODES,
  DEFAULTS,
  modeLabel,
  calculate,
  evaluateScenario,
  buildPlannerRows
} = require('./calculator.js');

function approx(actual, expected, tolerance = 0.01) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} ≈ ${expected} (±${tolerance})`);
}

const baseInput = {
  advanceAmount: 50000,
  factorRate: 1.32,
  collectionMode: COLLECTION_MODES.holdback,
  termBusinessDays: 130,
  holdbackPct: 12,
  averageMonthlyCardSales: 90000,
  businessDaysPerMonth: 21,
  originationFeePct: 3,
  fixedClosingFee: 495,
  targetPayoffMonths: 6
};

test('exports defaults and collection modes', () => {
  assert.equal(DEFAULTS.advanceAmount, 50000);
  assert.equal(COLLECTION_MODES.holdback, 'holdback');
  assert.equal(COLLECTION_MODES.fixedDaily, 'fixedDaily');
  assert.equal(modeLabel(COLLECTION_MODES.fixedDaily, 'en'), 'Fixed daily ACH / fixed business-day term');
});

test('TC-MCA-01 baseline holdback scenario', () => {
  const { result, error } = calculate(baseInput, { lang: 'en' });

  assert.equal(error, '');
  approx(result.totalPayback, 66000);
  approx(result.financeCharge, 16000);
  approx(result.originationFee, 1995);
  approx(result.netFundedCash, 48005);
  approx(result.dailyRemittance, 514.29);
  approx(result.weeklyRemittance, 2571.43);
  approx(result.monthlyRemittance, 10800);
  approx(result.estimatedPayoffMonths, 6.11);
  approx(result.estimatedBusinessDays, 128.33);
  approx(result.holdbackEquivalentPct, 12);
  approx(result.approxAprGrossPct, 91.01);
  approx(result.approxAprNetPct, 106.62);
  approx(result.monthlySalesNeededForTarget, 91666.67);
  approx(result.targetGap, 1666.67);
});

test('TC-MCA-02 fixed-daily scenario', () => {
  const { result, error } = calculate({ ...baseInput, collectionMode: COLLECTION_MODES.fixedDaily }, { lang: 'en' });

  assert.equal(error, '');
  approx(result.dailyRemittance, 507.69);
  approx(result.weeklyRemittance, 2538.46);
  approx(result.monthlyRemittance, 10661.54);
  approx(result.estimatedPayoffMonths, 6.19);
  approx(result.estimatedBusinessDays, 130);
  approx(result.holdbackEquivalentPct, 11.85);
  approx(result.approxAprGrossPct, 89.85);
  approx(result.approxAprNetPct, 105.25);
});

test('TC-MCA-03 target-sales planner', () => {
  const scenario = evaluateScenario(baseInput);
  const plannerRows = buildPlannerRows(baseInput, scenario);
  const sixMonthRow = plannerRows.find((row) => row.months === 6);

  assert.ok(sixMonthRow);
  approx(sixMonthRow.monthlySalesNeeded, 91666.67);
  approx(sixMonthRow.dailyRemittanceNeeded, 523.81);
  approx(sixMonthRow.coveragePct, 98.18);
});

test('TC-MCA-04 validation rejects impossible inputs', () => {
  const invalidCases = [
    { ...baseInput, advanceAmount: 0 },
    { ...baseInput, factorRate: 1 },
    { ...baseInput, factorRate: 3 },
    { ...baseInput, collectionMode: 'missing' },
    { ...baseInput, collectionMode: COLLECTION_MODES.fixedDaily, termBusinessDays: 0 },
    { ...baseInput, holdbackPct: 0 },
    { ...baseInput, holdbackPct: 100 },
    { ...baseInput, averageMonthlyCardSales: 0 },
    { ...baseInput, businessDaysPerMonth: 0 },
    { ...baseInput, originationFeePct: -1 },
    { ...baseInput, fixedClosingFee: -1 },
    { ...baseInput, targetPayoffMonths: 0 },
    { ...baseInput, originationFeePct: 99, fixedClosingFee: 1000 }
  ];

  invalidCases.forEach((input) => {
    const { result, error } = calculate(input, { lang: 'en' });
    assert.equal(result, null);
    assert.notEqual(error, '');
  });
});

test('TC-MCA-05 summary includes decision-ready fields', () => {
  const { result, error } = calculate(baseInput, { lang: 'en' });

  assert.equal(error, '');
  assert.match(result.summary, /Collection mode: Holdback % of card sales/);
  assert.match(result.summary, /Advance amount: \$50,000\.00/);
  assert.match(result.summary, /Total payback: \$66,000\.00/);
  assert.match(result.summary, /Upfront fees: \$1,995\.00/);
  assert.match(result.summary, /Net funded cash: \$48,005\.00/);
  assert.match(result.summary, /Approx APR on net cash: 106\.62%/);
  assert.match(result.summary, /Monthly sales needed for target payoff: \$91,666\.67/);
});

test('TC-MCA-06 HTML scaffold has required anchors', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

  for (const token of ['langBtn', 'collectionMode', 'plannerBody', 'summary', 'script defer src="./calculator.js"', '/assets/analytics.js']) {
    assert.ok(html.includes(token), token);
  }
  assert.match(html, /Merchant Cash Advance Calculator/);
});

test('TC-MCA-07 exact-once discovery wiring', () => {
  const root = path.join(__dirname, '..', '..');
  const slug = 'merchant-cash-advance-calculator';
  const url = `/tools/${slug}/`;

  const indexHtml = fs.readFileSync(path.join(root, 'tools', 'index.html'), 'utf8');
  const indexMd = fs.readFileSync(path.join(root, 'tools', 'index.md'), 'utf8');
  const toolsList = JSON.parse(fs.readFileSync(path.join(root, '_data', 'tools-list.json'), 'utf8'));
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'manifest.json'), 'utf8'));

  assert.equal((indexHtml.match(new RegExp(slug, 'g')) || []).length, 1, 'index.html exact-once');
  assert.equal((indexMd.match(new RegExp(slug, 'g')) || []).length, 1, 'index.md exact-once');
  assert.equal(toolsList.filter((entry) => entry.url === url).length, 1, 'tools-list exact-once');
  assert.equal(manifest.tools.filter((entry) => entry.slug === slug && entry.url === url).length, 1, 'manifest exact-once');
});
