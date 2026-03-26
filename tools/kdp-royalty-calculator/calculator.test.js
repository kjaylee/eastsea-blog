const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  ROYALTY_PLANS,
  DEFAULTS,
  getNetListPrice,
  getEligibleShare,
  getBlendedCoefficient,
  getBlendedDeliveryDeduction,
  calculate
} = require('./calculator.js');

function approx(actual, expected, tolerance = 0.01) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} ≈ ${expected} (±${tolerance})`);
}

const baseInput = {
  royaltyPlan: '70',
  listPrice: 9.99,
  priceIncludesVat: true,
  vatRatePct: 10,
  monthlyUnitsSold: 250,
  eligibleTerritorySharePct: 80,
  deliveryCostPerSale: 0.2,
  kuPagesRead: 50000,
  kuPayoutPerPage: 0.004,
  targetMonthlyRoyalty: 1500,
  targetRoyaltyPerSale: 3
};

test('exports required KDP constants', () => {
  assert.equal(DEFAULTS.royaltyPlan, '70');
  assert.equal(ROYALTY_PLANS.length, 2);
  assert.equal(ROYALTY_PLANS[0].id, '35');
  assert.equal(ROYALTY_PLANS[1].id, '70');
  approx(getNetListPrice(baseInput), 9.0818, 0.0001);
  approx(getEligibleShare(baseInput), 0.8, 0.000001);
  approx(getBlendedCoefficient(baseInput), 0.63, 0.000001);
  approx(getBlendedDeliveryDeduction(baseInput), 0.16, 0.000001);
});

test('TC-KDP-01 baseline 70% scenario with KU and territory mix', () => {
  const { result, error } = calculate(baseInput, { lang: 'en' });

  assert.equal(error, '');
  approx(result.netListPrice, 9.0818, 0.0001);
  approx(result.royaltyPerEligibleSale, 6.1573, 0.0001);
  approx(result.royaltyPerFallbackSale, 3.1786, 0.0001);
  approx(result.eligibleUnits, 200, 0.0001);
  approx(result.fallbackUnits, 50, 0.0001);
  approx(result.blendedRoyaltyPerSale, 5.5615, 0.0001);
  approx(result.ebookRoyalty, 1390.39, 0.01);
  approx(result.kuRoyalty, 200, 0.01);
  approx(result.totalRoyalty, 1590.39, 0.01);
  approx(result.effectiveRoyaltyRatePct, 61.24, 0.01);
  approx(result.unitsNeededForTargetMonthlyRoyalty, 233.74, 0.01);
  approx(result.requiredListPrice, 5.52, 0.01);
  approx(result.deliveryCostCeiling, 3.1786, 0.0001);
  approx(result.eligibleAdvantagePerSale, 2.9786, 0.0001);
  assert.equal(result.statusTone, 'good');
});

test('TC-KDP-02 35% plan ignores delivery cost and territory split', () => {
  const { result, error } = calculate({
    ...baseInput,
    royaltyPlan: '35',
    eligibleTerritorySharePct: 10,
    deliveryCostPerSale: 5
  }, { lang: 'en' });

  assert.equal(error, '');
  approx(result.royaltyPerEligibleSale, result.royaltyPerFallbackSale, 0.000001);
  approx(result.royaltyPerEligibleSale, 3.1786, 0.0001);
  approx(result.eligibleUnits, 0, 0.0001);
  approx(result.fallbackUnits, 250, 0.0001);
  approx(result.ebookRoyalty, 794.66, 0.01);
  approx(result.totalRoyalty, 994.66, 0.01);
  assert.equal(result.statusTone, 'neutral');
});

test('TC-KDP-03 VAT-inclusive pricing reduces net price and royalty per sale', () => {
  const withVat = calculate(baseInput, { lang: 'en' }).result;
  const withoutVat = calculate({ ...baseInput, priceIncludesVat: false, vatRatePct: 10 }, { lang: 'en' }).result;

  assert.ok(withVat.netListPrice < withoutVat.netListPrice);
  assert.ok(withVat.blendedRoyaltyPerSale < withoutVat.blendedRoyaltyPerSale);
  approx(withoutVat.netListPrice, 9.99, 0.0001);
  approx(withoutVat.blendedRoyaltyPerSale, 6.1337, 0.0001);
});

test('TC-KDP-04 high delivery cost can erase the 70% advantage', () => {
  const { result, error } = calculate({
    ...baseInput,
    deliveryCostPerSale: 3.6
  }, { lang: 'en' });

  assert.equal(error, '');
  assert.ok(result.eligibleAdvantagePerSale < 0);
  assert.equal(result.statusTone, 'warn');
});

test('TC-KDP-05 target monthly royalty respects KU offset', () => {
  const withKu = calculate(baseInput, { lang: 'en' }).result;
  const noKu = calculate({ ...baseInput, kuPagesRead: 0 }, { lang: 'en' }).result;

  assert.ok(withKu.unitsNeededForTargetMonthlyRoyalty < noKu.unitsNeededForTargetMonthlyRoyalty);
  approx(noKu.unitsNeededForTargetMonthlyRoyalty, 269.71, 0.01);
});

test('TC-KDP-06 required list price rises with higher target royalty per sale', () => {
  const low = calculate({ ...baseInput, targetRoyaltyPerSale: 2 }, { lang: 'en' }).result;
  const high = calculate({ ...baseInput, targetRoyaltyPerSale: 4 }, { lang: 'en' }).result;

  assert.ok(high.requiredListPrice > low.requiredListPrice);
  approx(low.requiredListPrice, 3.77, 0.01);
  approx(high.requiredListPrice, 7.27, 0.01);
});

test('TC-KDP-07 validation rejects invalid inputs', () => {
  const invalidCases = [
    { ...baseInput, royaltyPlan: 'bad' },
    { ...baseInput, listPrice: 0 },
    { ...baseInput, vatRatePct: -1 },
    { ...baseInput, vatRatePct: 101 },
    { ...baseInput, monthlyUnitsSold: -1 },
    { ...baseInput, monthlyUnitsSold: 1.5 },
    { ...baseInput, eligibleTerritorySharePct: 101 },
    { ...baseInput, deliveryCostPerSale: -0.01 },
    { ...baseInput, kuPagesRead: -1 },
    { ...baseInput, kuPagesRead: 2.2 },
    { ...baseInput, kuPayoutPerPage: -0.01 },
    { ...baseInput, targetMonthlyRoyalty: -1 },
    { ...baseInput, targetRoyaltyPerSale: -1 }
  ];

  invalidCases.forEach((input) => {
    const { result, error } = calculate(input, { lang: 'en' });
    assert.equal(result, null);
    assert.notEqual(error, '');
  });
});

test('TC-KDP-08 summary includes decision-ready fields', () => {
  const { result, error } = calculate(baseInput, { lang: 'en' });

  assert.equal(error, '');
  assert.match(result.summary, /\[KDP Royalty Calculator Summary\]/);
  assert.match(result.summary, /Royalty plan: 70% royalty option/);
  assert.match(result.summary, /Monthly eBook royalty: \$1,390\.39/);
  assert.match(result.summary, /Monthly KU royalty: \$200\.00/);
  assert.match(result.summary, /Total monthly royalty: \$1,590\.39/);
  assert.match(result.summary, /Required list price for target royalty \/ sale: \$5\.52/);
});

test('TC-KDP-09 HTML scaffold has required anchors and SEO copy', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

  for (const token of ['langBtn', 'royaltyPlan', 'kuPayoutPerPage', 'summary', 'script defer src="./calculator.js"', '/assets/analytics.js']) {
    assert.ok(html.includes(token), token);
  }

  assert.match(html, /KDP Royalty Calculator/);
  assert.match(html, /Kindle Unlimited/);
  assert.match(html, /70% plan uses 70% minus delivery costs/);
});

test('TC-KDP-10 exact-once discovery wiring', () => {
  const root = path.join(__dirname, '..', '..');
  const slug = 'kdp-royalty-calculator';
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
