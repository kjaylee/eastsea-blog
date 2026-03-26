const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  DEFAULTS,
  calculate,
  computeScenario,
  validate
} = require('./calculator.js');

function approx(actual, expected, tolerance = 0.02) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} ≈ ${expected} (±${tolerance})`);
}

test('exports default assumptions', () => {
  assert.equal(DEFAULTS.monthlyInvoiceVolume, 900000);
  assert.equal(DEFAULTS.eligibleSharePct, 55);
  assert.equal(DEFAULTS.projectedAdoptionPct, 45);
  assert.equal(DEFAULTS.discountRatePct, 1);
  assert.equal(DEFAULTS.processingFeeRatePct, 0.35);
});

test('TC-CD-01 baseline positive ROI', () => {
  const { error, result } = calculate(DEFAULTS, { lang: 'en' });

  assert.equal(error, '');
  approx(result.eligibleVolume, 495000);
  approx(result.adoptedVolume, 222750);
  approx(result.participatingInvoiceCount, 34.2692, 0.0002);
  approx(result.discountCost, 2227.5);
  approx(result.processingFees, 791.62);
  approx(result.financingBenefit, 2441.1);
  approx(result.badDebtSavings, 2405.7);
  approx(result.grossBenefit, 5096.8);
  approx(result.monthlyNetImpact, 1427.68);
  approx(result.periodNetImpact, 13632.12);
  approx(result.roiPct, 28.68);
  approx(result.paybackMonths, 2.45);
  approx(result.breakEvenAdoptionPct, 9.85);
  approx(result.totalProgramCost, 47529.43);
});

test('TC-CD-02 zero adoption zeroes variable items', () => {
  const { error, result } = calculate({ ...DEFAULTS, projectedAdoptionPct: 0 }, { lang: 'en' });

  assert.equal(error, '');
  assert.equal(result.adoptedVolume, 0);
  assert.equal(result.discountCost, 0);
  assert.equal(result.processingFees, 0);
  assert.equal(result.financingBenefit, 0);
  assert.equal(result.badDebtSavings, 0);
});

test('TC-CD-03 higher discount worsens economics', () => {
  const baseline = calculate(DEFAULTS, { lang: 'en' }).result;
  const worse = calculate({ ...DEFAULTS, discountRatePct: 3 }, { lang: 'en' }).result;

  assert.ok(worse.discountCost > baseline.discountCost);
  assert.ok(worse.monthlyNetImpact < baseline.monthlyNetImpact);
  assert.ok(worse.roiPct < baseline.roiPct);
});

test('TC-CD-04 shorter early-pay terms improve financing benefit', () => {
  const baseline = calculate(DEFAULTS, { lang: 'en' }).result;
  const improved = calculate({ ...DEFAULTS, earlyPayTermsDays: 10 }, { lang: 'en' }).result;

  assert.ok(improved.financingBenefit > baseline.financingBenefit);
  assert.ok(improved.daysAccelerated > baseline.daysAccelerated);
});

test('TC-CD-05 non-positive contribution makes break-even unattainable', () => {
  const { error, result } = calculate({
    ...DEFAULTS,
    discountRatePct: 8,
    processingFeeRatePct: 6,
    processingFixedFee: 10,
    opsSavings: 0
  }, { lang: 'en' });

  assert.equal(error, '');
  assert.equal(result.breakEvenAdoptionPct, null);
  assert.equal(result.paybackMonths, null);
  assert.ok(result.monthlyNetImpact < 0);
});

test('TC-CD-06 validation rejects impossible inputs', () => {
  const badInputs = [
    { ...DEFAULTS, monthlyInvoiceVolume: 0 },
    { ...DEFAULTS, eligibleSharePct: -1 },
    { ...DEFAULTS, projectedAdoptionPct: 101 },
    { ...DEFAULTS, averageInvoiceAmount: 0 },
    { ...DEFAULTS, processingFixedFee: -1 },
    { ...DEFAULTS, currentTermsDays: 0 },
    { ...DEFAULTS, earlyPayTermsDays: 45 },
    { ...DEFAULTS, annualCostOfCapitalPct: 101 },
    { ...DEFAULTS, badDebtRatePct: 25 },
    { ...DEFAULTS, badDebtReductionPct: 101 },
    { ...DEFAULTS, months: 0 }
  ];

  badInputs.forEach((input) => {
    const { error, result } = calculate(input, { lang: 'en' });
    assert.notEqual(error, '');
    assert.equal(result, null);
  });
});

test('TC-CD-07 summary includes decision-ready fields', () => {
  const { error, result } = calculate(DEFAULTS, { lang: 'en' });

  assert.equal(error, '');
  assert.match(result.summary, /Eligible volume: \$495,000\.00/);
  assert.match(result.summary, /Adopted early-pay volume: \$222,750\.00/);
  assert.match(result.summary, /Monthly net impact: \$1,427\.68/);
  assert.match(result.summary, /Period net impact: \$13,632\.12/);
  assert.match(result.summary, /ROI: 28\.68%/);
  assert.match(result.summary, /Break-even adoption: 9\.85%/);
});

test('TC-CD-08 direct scenario helper stays aligned with calculate', () => {
  const scenario = computeScenario(DEFAULTS);
  const result = calculate(DEFAULTS, { lang: 'en' }).result;

  approx(result.monthlyNetImpact, scenario.monthlyNetImpact);
  approx(result.contributionPerAdoptedDollar, scenario.contributionPerAdoptedDollar, 0.0002);
});

test('TC-CD-09 HTML scaffold includes required hooks', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

  for (const token of ['langBtn', 'monthlyInvoiceVolume', 'eligibleSharePct', 'summary', 'script defer src="./calculator.js"', '/assets/analytics.js']) {
    assert.ok(html.includes(token), token);
  }
  assert.match(html, /Cash Discount Early Payment Calculator|조기결제 현금할인 ROI 계산기/);
});

test('TC-CD-10 discovery exact-once wiring', () => {
  const root = path.join(__dirname, '..', '..');
  const slug = 'cash-discount-early-payment-calculator';
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

test('validate returns an explicit message', () => {
  assert.match(validate({ ...DEFAULTS, earlyPayTermsDays: 45 }, 'en'), /shorter than current/);
});
