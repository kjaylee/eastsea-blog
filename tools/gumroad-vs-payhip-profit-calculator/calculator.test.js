const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  DEFAULT_INPUTS,
  calculate,
  chooseBestPlan,
  roundTo,
} = require('./calculator.js');

function close(actual, expected, digits = 2) {
  assert.equal(roundTo(actual, digits), roundTo(expected, digits));
}

test('baseline default inputs return a valid result and select the best plan', () => {
  const { ok, errors, result } = calculate(DEFAULT_INPUTS);
  assert.equal(ok, true);
  assert.deepEqual(errors, []);
  assert.equal(result.bestPlanId, 'pro');
  close(result.grossSales, 3600);
  close(result.recognizedRevenue, 3528);
  close(result.gumroadNet, 2953.8);
  close(result.bestPayhipNet, 3290.69);
  close(result.bestMonthlyDelta, 336.89);
  close(result.paybackMonths, 0.89);
  assert.match(result.summary, /Best Payhip plan: Pro/);
});

test('invalid average order value is rejected', () => {
  const { ok, errors, result } = calculate({ ...DEFAULT_INPUTS, averageOrderValue: 0 });
  assert.equal(ok, false);
  assert.equal(result, null);
  assert.match(errors.join(' '), /averageOrderValue/i);
});

test('payback is null when no Payhip plan beats Gumroad', () => {
  const { ok, result } = calculate({
    averageOrderValue: 20,
    monthlyOrders: 60,
    refundRatePct: 0,
    gumroadDiscoverSharePct: 0,
    processorPreset: 'custom',
    customProcessorRatePct: 6,
    customProcessorFlatFee: 1,
    migrationCost: 300,
  });
  assert.equal(ok, true);
  assert.ok(result.bestMonthlyDelta < 0);
  assert.equal(result.paybackMonths, null);
});

test('chooseBestPlan prefers higher net and lower fee total as tiebreaker', () => {
  const best = chooseBestPlan([
    { id: 'a', net: 100, totalFees: 50 },
    { id: 'b', net: 100, totalFees: 40 },
    { id: 'c', net: 98, totalFees: 10 },
  ]);
  assert.equal(best.id, 'b');
});

test('break-even vs Gumroad is finite for plans with better unit economics but monthly fee drag', () => {
  const { result } = calculate(DEFAULT_INPUTS);
  const plus = result.planRows.find((row) => row.id === 'plus');
  assert.ok(plus.breakEvenGrossVsGumroad > 0);
  close(plus.breakEvenGrossVsGumroad, 285.77);
});

test('break-even vs Gumroad is null when a plan never catches up', () => {
  const { result } = calculate({
    averageOrderValue: 20,
    monthlyOrders: 60,
    refundRatePct: 0,
    gumroadDiscoverSharePct: 0,
    processorPreset: 'custom',
    customProcessorRatePct: 6,
    customProcessorFlatFee: 1,
    migrationCost: 300,
  });
  const free = result.planRows.find((row) => row.id === 'free');
  assert.equal(free.breakEvenGrossVsGumroad, null);
});

test('custom processor path changes outcomes deterministically', () => {
  const baseline = calculate(DEFAULT_INPUTS).result;
  const custom = calculate({
    ...DEFAULT_INPUTS,
    processorPreset: 'custom',
    customProcessorRatePct: 4.5,
    customProcessorFlatFee: 0.6,
  }).result;
  assert.ok(custom.bestPayhipNet < baseline.bestPayhipNet);
  assert.equal(custom.processorId, 'custom');
  close(custom.processorRatePct, 4.5);
  close(custom.processorFlatFee, 0.6);
});

test('HTML scaffold exposes required exact-match anchors', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

  for (const token of [
    'Gumroad vs Payhip Profit Calculator',
    'https://eastsea.monster/tools/gumroad-vs-payhip-profit-calculator/',
    '/assets/analytics.js',
    'id="summary"',
    '/tools/gumroad-net-revenue-calculator/',
    '/tools/payhip-fee-calculator/',
    'Best Payhip plan',
    'Gumroad net',
  ]) {
    assert.ok(html.includes(token), token);
  }
});

test('discovery wiring is exact-once across indexes, tools list, and manifest', () => {
  const root = path.join(__dirname, '..', '..');
  const slug = 'gumroad-vs-payhip-profit-calculator';
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
