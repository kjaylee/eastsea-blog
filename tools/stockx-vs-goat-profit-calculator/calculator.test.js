const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  calculate,
  DEFAULT_INPUTS,
  validateInputs,
  findStockxPriceForTargetNet,
  findGoatPriceForTargetNet,
} = require('./calculator.js');

function approx(actual, expected, tolerance = 0.01) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} ≈ ${expected} (±${tolerance})`);
}

test('TC-SVG-01 default baseline favors StockX with deterministic outputs', () => {
  const { result, error } = calculate(DEFAULT_INPUTS);

  assert.equal(error, '');
  assert.equal(result.winnerPlatform, 'stockx');
  approx(result.stockx.finalStockxFees, 29.9);
  approx(result.stockx.payoutAfterFees, 230.1);
  approx(result.stockx.netProfit, 44.6);
  approx(result.goat.platformFeeTotal, 29.7);
  approx(result.goat.refundLoss, 5.2);
  approx(result.goat.totalDrag, 34.9);
  approx(result.goat.payoutBeforeSellerCosts, 225.1);
  approx(result.goat.netProfit, 39.6);
  approx(result.winnerDelta, 5);
  approx(result.priceNeededOnStockxToMatchGoat, 254.34);
  approx(result.priceNeededOnGoatToMatchStockx, 265.64);
});

test('TC-SVG-02 low-price StockX case keeps the minimum fee floor visible', () => {
  const { result, error } = calculate({
    ...DEFAULT_INPUTS,
    salePrice: 20,
    itemCost: 10,
    shippingCost: 2,
    packagingCost: 1,
    stockxSellerLevel: 'level-1',
    goatRefundLossRatePct: 0,
  });

  assert.equal(error, '');
  approx(result.stockx.finalStockxFees, 5);
  approx(result.stockx.netProfit, 2);
  approx(result.goat.netProfit, 0.1);
  assert.equal(result.winnerPlatform, 'stockx');
});

test('TC-SVG-03 GOAT custom override can win deterministically', () => {
  const { result, error } = calculate({
    ...DEFAULT_INPUTS,
    goatFeePreset: 'custom',
    goatCustomFeeRatePct: 7,
    goatCustomFlatFee: 2,
    goatRefundLossRatePct: 0,
  });

  assert.equal(error, '');
  assert.equal(result.winnerPlatform, 'goat');
  approx(result.goat.netProfit, 54.3);
  approx(result.stockx.netProfit, 44.6);
  approx(result.winnerDelta, 9.7);
});

test('TC-SVG-04 tie scenario is detected within epsilon', () => {
  const { result, error } = calculate({
    ...DEFAULT_INPUTS,
    goatFeePreset: 'custom',
    goatCustomFeeRatePct: 9.5,
    goatCustomFlatFee: 5.2,
    goatRefundLossRatePct: 0,
  });

  assert.equal(error, '');
  assert.equal(result.winnerPlatform, 'tie');
  approx(result.stockx.netProfit, 44.6);
  approx(result.goat.netProfit, 44.6);
  approx(result.winnerDelta, 0);
});

test('TC-SVG-05 GOAT match price becomes unreachable when contribution margin is non-positive', () => {
  const scenario = {
    ...DEFAULT_INPUTS,
    goatFeePreset: 'custom',
    goatCustomFeeRatePct: 80,
    goatCustomFlatFee: 5,
    goatRefundLossRatePct: 20,
  };
  const { result, error } = calculate(scenario);

  assert.equal(error, '');
  assert.equal(result.priceNeededOnGoatToMatchStockx, null);
  assert.ok(result.goat.netProfit < 0);
  assert.equal(findGoatPriceForTargetNet(validateInputs(scenario).input, result.stockx.netProfit), null);
});

test('TC-SVG-06 direct reverse solver for StockX remains deterministic', () => {
  const normalized = validateInputs(DEFAULT_INPUTS).input;
  const target = 39.6;
  approx(findStockxPriceForTargetNet(normalized, target), 254.34);
});

test('TC-SVG-07 validation rejects invalid sale price and invalid GOAT custom rate', () => {
  const invalidPrice = validateInputs({ ...DEFAULT_INPUTS, salePrice: 0 });
  assert.equal(invalidPrice.ok, false);
  assert.match(invalidPrice.errors[0], /salePrice/);

  const { result, error } = calculate({
    ...DEFAULT_INPUTS,
    goatFeePreset: 'custom',
    goatCustomFeeRatePct: 101,
  });
  assert.equal(result, null);
  assert.match(error, /goatCustomFeeRatePct/);
});

test('TC-SVG-08 summary contains decision-ready winner and payout lines', () => {
  const { result, error } = calculate(DEFAULT_INPUTS);

  assert.equal(error, '');
  assert.match(result.summary, /\[StockX vs GOAT Profit Summary\]/);
  assert.match(result.summary, /Winner: StockX by \$5\.00/);
  assert.match(result.summary, /StockX payout after fees: \$230\.10/);
  assert.match(result.summary, /GOAT payout before seller costs: \$225\.10/);
  assert.match(result.summary, /Price needed on StockX to match GOAT: \$254\.34/);
  assert.match(result.summary, /Price needed on GOAT to match StockX: \$265\.64/);
});

test('TC-SVG-09 HTML scaffold contains required anchors and sibling scripts', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

  for (const token of [
    'StockX vs GOAT Profit Calculator',
    'link rel="canonical" href="https://eastsea.monster/tools/stockx-vs-goat-profit-calculator/"',
    '/assets/analytics.js',
    '../stockx-fee-profit-calculator/calculator.js',
    '../goat-fee-calculator/calculator.js',
    'id="winner"',
    'id="summary"',
    '/tools/stockx-fee-profit-calculator/',
    '/tools/goat-fee-calculator/',
    'StockX payout after fees',
    'GOAT payout before seller costs',
  ]) {
    assert.ok(html.includes(token), token);
  }
});

test('TC-SVG-10 exact-once discovery wiring', () => {
  const root = path.join(__dirname, '..', '..');
  const slug = 'stockx-vs-goat-profit-calculator';
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
