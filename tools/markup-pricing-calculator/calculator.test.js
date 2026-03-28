// Markup Pricing Calculator — Test Suite (Node.js built-in test runner)
'use strict';
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  round2, round4,
  priceFromMarkup, markupFromPrice, costFromMarkup,
  markupToMargin, marginToMarkup, markupTable
} = require('./calculator.js');

/* ─── Helper ─── */
function near(val, expected, eps, msg) {
  assert.ok(Math.abs(val - expected) <= eps,
    `${msg}: expected ~${expected}, got ${val}`);
}

/* ─── TC-1: priceFromMarkup basic ─── */
describe('priceFromMarkup', () => {
  it('cost=100, markup=50% → price=150, profit=50, margin=33.33%', () => {
    const r = priceFromMarkup(100, 50);
    assert.strictEqual(r.sellingPrice, 150);
    assert.strictEqual(r.profit, 50);
    near(r.marginPct, 33.3333, 0.01, 'marginPct');
  });

  it('cost=80, markup=100% → price=160, margin=50%', () => {
    const r = priceFromMarkup(80, 100);
    assert.strictEqual(r.sellingPrice, 160);
    assert.strictEqual(r.profit, 80);
    near(r.marginPct, 50, 0.01, 'marginPct');
  });

  it('cost=0 → price=0, profit=0', () => {
    const r = priceFromMarkup(0, 50);
    assert.strictEqual(r.sellingPrice, 0);
    assert.strictEqual(r.profit, 0);
  });

  it('markup=0% → price=cost', () => {
    const r = priceFromMarkup(200, 0);
    assert.strictEqual(r.sellingPrice, 200);
    assert.strictEqual(r.profit, 0);
    assert.strictEqual(r.marginPct, 0);
  });

  it('negative markup → price < cost', () => {
    const r = priceFromMarkup(100, -20);
    assert.strictEqual(r.sellingPrice, 80);
    assert.strictEqual(r.profit, -20);
  });

  it('negative cost returns error', () => {
    const r = priceFromMarkup(-10, 50);
    assert.ok(r.error);
  });

  it('large markup 500% → correct', () => {
    const r = priceFromMarkup(10, 500);
    assert.strictEqual(r.sellingPrice, 60);
    assert.strictEqual(r.profit, 50);
    near(r.marginPct, 83.3333, 0.01, 'marginPct');
  });
});

/* ─── TC-2: markupFromPrice ─── */
describe('markupFromPrice', () => {
  it('cost=100, price=150 → markup=50%', () => {
    const r = markupFromPrice(100, 150);
    assert.strictEqual(r.markupPct, 50);
    near(r.marginPct, 33.3333, 0.01, 'marginPct');
  });

  it('cost=100, price=100 → markup=0%', () => {
    const r = markupFromPrice(100, 100);
    assert.strictEqual(r.markupPct, 0);
  });

  it('cost=100, price=80 → markup=-20%', () => {
    const r = markupFromPrice(100, 80);
    assert.strictEqual(r.markupPct, -20);
  });

  it('cost=0, price=0 → all zeros', () => {
    const r = markupFromPrice(0, 0);
    assert.strictEqual(r.markupPct, 0);
  });

  it('cost=0, price>0 → error (infinite markup)', () => {
    const r = markupFromPrice(0, 50);
    assert.ok(r.error);
  });
});

/* ─── TC-3: costFromMarkup ─── */
describe('costFromMarkup', () => {
  it('price=150, markup=50% → cost=100', () => {
    const r = costFromMarkup(150, 50);
    assert.strictEqual(r.cost, 100);
    assert.strictEqual(r.profit, 50);
  });

  it('price=200, markup=100% → cost=100', () => {
    const r = costFromMarkup(200, 100);
    assert.strictEqual(r.cost, 100);
  });

  it('markup=-100% → error (division by zero)', () => {
    const r = costFromMarkup(100, -100);
    assert.ok(r.error);
  });

  it('markup=-150% → error', () => {
    const r = costFromMarkup(100, -150);
    assert.ok(r.error);
  });
});

/* ─── TC-4: markupToMargin / marginToMarkup ─── */
describe('markup ↔ margin conversion', () => {
  it('markup 50% → margin 33.33%', () => {
    const r = markupToMargin(50);
    near(r.marginPct, 33.3333, 0.01, 'marginPct');
  });

  it('markup 100% → margin 50%', () => {
    const r = markupToMargin(100);
    near(r.marginPct, 50, 0.01, 'marginPct');
  });

  it('margin 50% → markup 100%', () => {
    const r = marginToMarkup(50);
    near(r.markupPct, 100, 0.01, 'markupPct');
  });

  it('margin 33.33% → markup ~50%', () => {
    const r = marginToMarkup(33.33);
    near(r.markupPct, 49.99, 0.1, 'markupPct');
  });

  it('margin 0% → markup 0%', () => {
    const r = marginToMarkup(0);
    assert.strictEqual(r.markupPct, 0);
  });

  it('margin 100% → error', () => {
    const r = marginToMarkup(100);
    assert.ok(r.error);
  });

  it('markup -100% → error', () => {
    const r = markupToMargin(-100);
    assert.ok(r.error);
  });

  it('round-trip: markup → margin → markup', () => {
    const m1 = markupToMargin(75);
    const m2 = marginToMarkup(m1.marginPct);
    near(m2.markupPct, 75, 0.01, 'round-trip');
  });
});

/* ─── TC-5: markupTable ─── */
describe('markupTable', () => {
  it('generates correct table for cost=100', () => {
    const rows = markupTable(100, [25, 50, 75, 100]);
    assert.strictEqual(rows.length, 4);
    assert.strictEqual(rows[0].sellingPrice, 125);
    assert.strictEqual(rows[1].sellingPrice, 150);
    assert.strictEqual(rows[2].sellingPrice, 175);
    assert.strictEqual(rows[3].sellingPrice, 200);
  });

  it('negative cost → error', () => {
    const r = markupTable(-5, [10]);
    assert.ok(r.error);
  });
});

/* ─── TC-6: Edge cases / precision ─── */
describe('Edge cases', () => {
  it('very small cost: 0.01 with 100% markup', () => {
    const r = priceFromMarkup(0.01, 100);
    assert.strictEqual(r.sellingPrice, 0.02);
  });

  it('very large cost: 1e9 with 10% markup', () => {
    const r = priceFromMarkup(1e9, 10);
    assert.strictEqual(r.sellingPrice, 1.1e9);
  });

  it('fractional markup: 33.33%', () => {
    const r = priceFromMarkup(100, 33.33);
    near(r.sellingPrice, 133.33, 0.01, 'price');
  });

  it('Infinity cost → error', () => {
    const r = priceFromMarkup(Infinity, 50);
    assert.ok(r.error);
  });

  it('NaN markup → error', () => {
    const r = priceFromMarkup(100, NaN);
    assert.ok(r.error);
  });
});

/* ─── TC-7: Real-world scenario — Amazon seller ─── */
describe('Real-world: Amazon seller pricing', () => {
  it('Product cost $12, want 80% markup → price $21.60, margin 44.44%', () => {
    const r = priceFromMarkup(12, 80);
    assert.strictEqual(r.sellingPrice, 21.6);
    assert.strictEqual(r.profit, 9.6);
    near(r.marginPct, 44.4444, 0.01, 'marginPct');
  });

  it('Reverse: price $21.60, cost $12 → markup 80%', () => {
    const r = markupFromPrice(12, 21.60);
    assert.strictEqual(r.markupPct, 80);
  });
});
