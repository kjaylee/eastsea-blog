const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  calculate,
  DEFAULTS,
  PROCESSOR_PRESETS,
  GUMROAD_DIRECT_RATE,
  GUMROAD_DIRECT_FLAT,
  GUMROAD_DISCOVER_RATE,
  resolveProcessor
} = require('./calculator.js');

function approx(actual, expected, tolerance = 0.01) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} ≈ ${expected} (±${tolerance})`);
}

const baseInput = {
  directGrossSales: 3000,
  directOrders: 80,
  discoverGrossSales: 1500,
  discoverOrders: 30,
  processorPreset: 'stripe-domestic',
  customProcessorRatePct: 2.9,
  customProcessorFlatFee: 0.30,
  payoutDelayDays: 7,
  annualCashCostPct: 8
};

test('exports Gumroad fee constants and presets', () => {
  assert.equal(DEFAULTS.directGrossSales, 3000);
  assert.equal(GUMROAD_DIRECT_RATE, 0.10);
  assert.equal(GUMROAD_DIRECT_FLAT, 0.50);
  assert.equal(GUMROAD_DISCOVER_RATE, 0.30);
  assert.equal(PROCESSOR_PRESETS.length, 3);
  assert.equal(resolveProcessor(baseInput).ratePct, 2.9);
  assert.equal(resolveProcessor({ ...baseInput, processorPreset: 'paypal-standard' }).flatFee, 0.49);
});

test('TC-GR-01 baseline mixed-sales scenario', () => {
  const { result, error } = calculate(baseInput, { lang: 'en' });

  assert.equal(error, '');
  approx(result.directGumroadFee, 340);
  approx(result.directProcessingFee, 111);
  approx(result.discoverGumroadFee, 450);
  approx(result.directNetBeforeDrag, 2549);
  approx(result.discoverNetBeforeDrag, 1050);
  approx(result.gumroadFeesTotal, 790);
  approx(result.totalGrossSales, 4500);
  approx(result.payoutDragCost, 5.52);
  approx(result.netRevenue, 3593.48);
  approx(result.blendedTakeHomeRatePct, 79.86);
  approx(result.effectiveFeeRateBeforeDragPct, 20.02);
  approx(result.directAverageOrderValue, 37.5);
  approx(result.discoverAverageOrderValue, 50);
  approx(result.directTakeHomePerOrder, 31.86);
  approx(result.discoverTakeHomePerOrder, 35);
});

test('TC-GR-02 direct-only scenario works with discover set to zero', () => {
  const { result, error } = calculate({
    ...baseInput,
    discoverGrossSales: 0,
    discoverOrders: 0
  }, { lang: 'en' });

  assert.equal(error, '');
  approx(result.netRevenue, 2545.09);
  assert.equal(result.discoverAverageOrderValue, null);
  assert.equal(result.discoverTakeHomePerOrder, null);
  approx(result.discoverNetBeforeDrag, 0);
});

test('TC-GR-03 discover-only scenario removes direct processing fees', () => {
  const { result, error } = calculate({
    ...baseInput,
    directGrossSales: 0,
    directOrders: 0,
    discoverGrossSales: 2000,
    discoverOrders: 40
  }, { lang: 'en' });

  assert.equal(error, '');
  approx(result.directProcessingFee, 0);
  approx(result.gumroadFeesTotal, 600);
  approx(result.netRevenue, 1397.85);
  approx(result.discoverTakeHomeRatePct, 70);
});

test('TC-GR-04 PayPal preset increases direct fee drag vs Stripe', () => {
  const stripe = calculate(baseInput, { lang: 'en' }).result;
  const paypal = calculate({ ...baseInput, processorPreset: 'paypal-standard' }, { lang: 'en' }).result;

  assert.ok(paypal.directProcessingFee > stripe.directProcessingFee);
  assert.ok(paypal.netRevenue < stripe.netRevenue);
  approx(paypal.directProcessingFee, 143.9);
  approx(paypal.netRevenue, 3560.63);
});

test('TC-GR-05 custom processor override works', () => {
  const { result, error } = calculate({
    ...baseInput,
    processorPreset: 'custom',
    customProcessorRatePct: 4.1,
    customProcessorFlatFee: 0.60
  }, { lang: 'en' });

  assert.equal(error, '');
  approx(result.directProcessingFee, 171);
  approx(result.netRevenue, 3533.57);
});

test('TC-GR-06 payout drag increases with longer delay', () => {
  const instant = calculate({ ...baseInput, payoutDelayDays: 0 }, { lang: 'en' }).result;
  const delayed = calculate({ ...baseInput, payoutDelayDays: 21 }, { lang: 'en' }).result;

  approx(instant.payoutDragCost, 0);
  assert.ok(delayed.payoutDragCost > instant.payoutDragCost);
  assert.ok(delayed.netRevenue < instant.netRevenue);
});

test('TC-GR-07 validation rejects impossible inputs', () => {
  const invalidCases = [
    { ...baseInput, directGrossSales: -1 },
    { ...baseInput, directGrossSales: 0, discoverGrossSales: 0 },
    { ...baseInput, directGrossSales: 100, directOrders: 0 },
    { ...baseInput, discoverGrossSales: 100, discoverOrders: 0 },
    { ...baseInput, processorPreset: 'missing' },
    { ...baseInput, processorPreset: 'custom', customProcessorRatePct: 100 },
    { ...baseInput, customProcessorFlatFee: -0.01 },
    { ...baseInput, payoutDelayDays: 366 },
    { ...baseInput, annualCashCostPct: 100 }
  ];

  invalidCases.forEach((input) => {
    const { result, error } = calculate(input, { lang: 'en' });
    assert.equal(result, null);
    assert.notEqual(error, '');
  });
});

test('TC-GR-08 summary includes decision-ready fields', () => {
  const { result, error } = calculate(baseInput, { lang: 'en' });

  assert.equal(error, '');
  assert.match(result.summary, /\[Gumroad Net Revenue Summary\]/);
  assert.match(result.summary, /Total gross sales: \$4,500\.00/);
  assert.match(result.summary, /Direct processing preset: Stripe domestic cards/);
  assert.match(result.summary, /Gumroad fees: \$790\.00/);
  assert.match(result.summary, /Direct processing fees: \$111\.00/);
  assert.match(result.summary, /Payout drag cost: \$5\.52/);
  assert.match(result.summary, /Net revenue: \$3,593\.48/);
});

test('TC-GR-09 comparison table covers all processor presets', () => {
  const { result, error } = calculate(baseInput, { lang: 'en' });

  assert.equal(error, '');
  assert.equal(result.comparisonRows.length, 3);
  assert.deepEqual(result.comparisonRows.map((row) => row.id), ['stripe-domestic', 'paypal-standard', 'custom']);
});

test('TC-GR-10 HTML scaffold has required anchors and SEO copy', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

  for (const token of ['langBtn', 'processorPreset', 'summary', 'comparisonBody', 'script defer src="./calculator.js"', '/assets/analytics.js']) {
    assert.ok(html.includes(token), token);
  }

  assert.match(html, /Gumroad Net Revenue Calculator/);
  assert.match(html, /10% \+ \$0\.50/);
  assert.match(html, /30% Discover/);
  assert.match(html, /Merchant of Record/);
});

test('TC-GR-11 discovery exact-once wiring', () => {
  const root = path.join(__dirname, '..', '..');
  const slug = 'gumroad-net-revenue-calculator';
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
