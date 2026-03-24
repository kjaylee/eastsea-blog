const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const calc = require('./calculator.js');

function near(actual, expected, tolerance = 1e-6) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} vs ${expected}`);
}

const fixtureA = {
  monthlyOrders: 500,
  averageOrderValue: 29,
  refundRatePct: 4,
  chargebackRatePct: 0.8,
  directProcessorRatePct: 2.9,
  directProcessorFixedFee: 0.30,
  directTaxBurdenRatePct: 10,
  directComplianceMonthlyCost: 299,
  directBillingOpsMonthlyCost: 199,
  chargebackFeePerCase: 15,
  morFeeRatePct: 5,
  morFixedFeePerOrder: 0.50,
  morMonthlyCost: 0,
};

const fixtureB = {
  ...fixtureA,
  directTaxBurdenRatePct: 0,
  directComplianceMonthlyCost: 50,
  directBillingOpsMonthlyCost: 50,
  chargebackRatePct: 0.3,
};

test('TC-01 baseline fixture matches exact expected outputs', () => {
  const out = calc.calculate(fixtureA);
  assert.equal(out.ok, true);
  near(out.result.grossBillings, 14500.00);
  near(out.result.refundLoss, 580.00);
  near(out.result.recognizedRevenue, 13920.00);
  near(out.result.chargebackOrders, 4.00);
  near(out.result.chargebackRevenueLoss, 116.00);
  near(out.result.directProcessorVariableFees, 420.50);
  near(out.result.directProcessorFixedFees, 150.00);
  near(out.result.directTaxBurden, 1392.00);
  near(out.result.directChargebackFees, 60.00);
  near(out.result.directNetTakeHome, 11283.50);
  near(out.result.morFeeAmount, 696.00);
  near(out.result.morFixedFees, 250.00);
  near(out.result.morNetTakeHome, 12974.00);
  near(out.result.monthlyDelta, 1690.50);
  near(out.result.annualDelta, 20286.00);
  near(out.result.breakEvenMorFeeRatePct, 17.1443965517);
  near(out.result.annualMorROI, 178.6997885835);
  assert.equal(out.result.winner, 'mor');
  assert.match(out.result.summary, /Merchant of Record wins/i);
});

test('TC-02 lean direct-billing fixture flips winner', () => {
  const out = calc.calculate(fixtureB);
  assert.equal(out.ok, true);
  near(out.result.chargebackOrders, 1.50);
  near(out.result.chargebackRevenueLoss, 43.50);
  near(out.result.directChargebackFees, 22.50);
  near(out.result.directNetTakeHome, 13183.50);
  near(out.result.morNetTakeHome, 12974.00);
  near(out.result.monthlyDelta, -209.50);
  near(out.result.annualDelta, -2514.00);
  near(out.result.breakEvenMorFeeRatePct, 3.4949712644);
  near(out.result.annualMorROI, -22.1458773784);
  assert.equal(out.result.winner, 'direct');
  assert.match(out.result.summary, /Direct billing wins/i);
});

test('TC-03 break-even threshold behaves correctly', () => {
  const baseline = calc.calculate(fixtureA);
  const atThreshold = calc.calculate({ ...fixtureA, morFeeRatePct: baseline.result.breakEvenMorFeeRatePct });
  const aboveThreshold = calc.calculate({ ...fixtureA, morFeeRatePct: 20 });
  assert.equal(baseline.ok, true);
  assert.equal(atThreshold.ok, true);
  assert.equal(aboveThreshold.ok, true);
  assert.ok(baseline.result.breakEvenMorFeeRatePct > fixtureA.morFeeRatePct);
  near(atThreshold.result.monthlyDelta, 0, 1e-4);
  assert.ok(aboveThreshold.result.monthlyDelta < 0);
});

test('TC-04 validation rejects impossible inputs', () => {
  const out = calc.calculate({
    ...fixtureA,
    monthlyOrders: 0,
    averageOrderValue: 0,
    refundRatePct: 101,
    directBillingOpsMonthlyCost: -1,
    morMonthlyCost: -1,
  });
  assert.equal(out.ok, false);
  assert.match(out.errors.join(' | '), /monthlyOrders/);
  assert.match(out.errors.join(' | '), /averageOrderValue/);
  assert.match(out.errors.join(' | '), /refundRatePct/);
  assert.match(out.errors.join(' | '), /directBillingOpsMonthlyCost/);
  assert.match(out.errors.join(' | '), /morMonthlyCost/);
});

test('TC-05 denominator edge handling returns null without throwing', () => {
  const out = calc.calculate({
    ...fixtureA,
    refundRatePct: 100,
    morFeeRatePct: 0,
    morFixedFeePerOrder: 0,
    morMonthlyCost: 0,
  });
  assert.equal(out.ok, true);
  near(out.result.recognizedRevenue, 0);
  assert.equal(out.result.breakEvenMorFeeRatePct, null);
  assert.equal(out.result.annualMorROI, null);
});

test('TC-06 HTML contains title analytics IDs and related links', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  assert.match(html, /<title>Merchant of Record vs Direct Billing Profit Calculator \| MoR vs 직접 결제 손익 계산기<\/title>/);
  assert.match(html, /\/assets\/analytics\.js/);
  [
    'monthlyOrders',
    'averageOrderValue',
    'refundRatePct',
    'chargebackRatePct',
    'directProcessorRatePct',
    'directProcessorFixedFee',
    'directTaxBurdenRatePct',
    'directComplianceMonthlyCost',
    'directBillingOpsMonthlyCost',
    'chargebackFeePerCase',
    'morFeeRatePct',
    'morFixedFeePerOrder',
    'morMonthlyCost',
  ].forEach((fieldId) => {
    assert.match(html, new RegExp(`id="${fieldId}"`));
  });
  [
    '/tools/app-store-vs-web-checkout-profit-calculator/',
    '/tools/vat-gst-margin-calculator/',
    '/tools/stripe-fee-calculator/',
    '/tools/lemon-squeezy-fee-calculator/',
  ].forEach((href) => {
    assert.match(html, new RegExp(href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  });
});

test('TC-07 catalog exact-once contract holds after implementation', () => {
  const root = path.resolve(__dirname, '..', '..');
  const slug = 'merchant-of-record-vs-direct-billing-profit-calculator';
  const url = `/tools/${slug}/`;
  const html = fs.readFileSync(path.join(root, 'tools', 'index.html'), 'utf8');
  const md = fs.readFileSync(path.join(root, 'tools', 'index.md'), 'utf8');
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'manifest.json'), 'utf8')).tools;
  const toolsList = JSON.parse(fs.readFileSync(path.join(root, '_data', 'tools-list.json'), 'utf8'));
  const siblingHtml = fs.readFileSync(path.join(root, 'tools', 'app-store-vs-web-checkout-profit-calculator', 'index.html'), 'utf8');

  const htmlMatches = (html.match(new RegExp(`href="${slug}/"`, 'g')) || []).length;
  const mdMatches = (md.match(new RegExp(`\.\/${slug}\/`, 'g')) || []).length;
  const manifestMatches = manifest.filter((x) => x && x.slug === slug && x.url === url).length;
  const listMatches = toolsList.filter((x) => x && x.url === url).length;
  const siblingMatches = (siblingHtml.match(new RegExp(url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;

  assert.equal(htmlMatches, 1);
  assert.equal(mdMatches, 1);
  assert.equal(manifestMatches, 1);
  assert.equal(listMatches, 1);
  assert.equal(siblingMatches, 1);
});
