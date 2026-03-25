const test = require('node:test');
const assert = require('node:assert/strict');

const { compute, PRODUCTS, DEFAULTS, SWEEP_MARGINS } = require('./calculator.js');

// TC-14: Classic T-Shirt at 20% margin
test('TC-14 Classic T-Shirt 20% margin — royalty, retail, efficiency', () => {
  const r = compute({ basePrice: 19.84, marginPct: 20, monthlySales: 5, activeDesigns: 10 });
  assert.equal(r.error, '');
  assert.equal(r.royaltyPerSale, 3.97);
  assert.equal(r.retailPrice, 23.81);
  assert.equal(r.marginEfficiency, 16.7);
});

// TC-15: Sticker (Small) at 50% margin
test('TC-15 Sticker (Small) 50% margin — royalty, retail', () => {
  const r = compute({ basePrice: 2.44, marginPct: 50, monthlySales: 1, activeDesigns: 1 });
  assert.equal(r.error, '');
  assert.equal(r.royaltyPerSale, 1.22);
  assert.equal(r.retailPrice, 3.66);
});

// TC-16: Monthly income projection
test('TC-16 monthly income 3.97 × 5 × 10 = 198.50', () => {
  const r = compute({ basePrice: 19.84, marginPct: 20, monthlySales: 5, activeDesigns: 10 });
  assert.equal(r.error, '');
  assert.equal(r.monthlyIncome, 198.50);
});

// Sweep table has correct length and default-margin row
test('sweep table includes 8 rows covering required margins', () => {
  const r = compute({ basePrice: 19.84, marginPct: 20, monthlySales: 5, activeDesigns: 10 });
  assert.equal(r.error, '');
  assert.equal(r.sweep.length, 8);
  const margins = r.sweep.map(row => row.marginPct);
  assert.deepEqual(margins, [5, 10, 15, 20, 25, 30, 40, 50]);
  const row20 = r.sweep.find(row => row.marginPct === 20);
  assert.equal(row20.royaltyPerSale, 3.97);
  assert.equal(row20.retailPrice, 23.81);
});

// DEFAULTS export shape
test('DEFAULTS has expected shape and values', () => {
  assert.equal(typeof DEFAULTS.basePrice, 'number');
  assert.equal(typeof DEFAULTS.marginPct, 'number');
  assert.equal(DEFAULTS.basePrice, 19.84);
  assert.equal(DEFAULTS.marginPct, 20);
  assert.equal(DEFAULTS.monthlySales, 5);
  assert.equal(DEFAULTS.activeDesigns, 10);
});

// PRODUCTS export
test('PRODUCTS contains 10 entries including Classic T-Shirt', () => {
  assert.equal(PRODUCTS.length, 10);
  assert.equal(PRODUCTS[0].name, 'Classic T-Shirt');
  assert.equal(PRODUCTS[0].basePrice, 19.84);
});

// Validation: base price <= 0
test('validation rejects base price <= 0', () => {
  const r = compute({ basePrice: 0, marginPct: 20, monthlySales: 5, activeDesigns: 10 });
  assert.notEqual(r.error, '');
});

// Validation: margin out of range
test('validation rejects margin > 100', () => {
  const r = compute({ basePrice: 19.84, marginPct: 110, monthlySales: 5, activeDesigns: 10 });
  assert.notEqual(r.error, '');
});

// Hoodie at 30%
test('Pullover Hoodie 30% margin', () => {
  const r = compute({ basePrice: 44.00, marginPct: 30, monthlySales: 3, activeDesigns: 5 });
  assert.equal(r.error, '');
  assert.equal(r.royaltyPerSale, 13.20);
  assert.equal(r.retailPrice, 57.20);
  assert.equal(r.monthlyIncome, round2(13.20 * 3 * 5));
});

function round2(v) {
  return Math.round((v + Number.EPSILON) * 100) / 100;
}
