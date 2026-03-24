const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const toolDir = __dirname;
const repoRoot = path.resolve(toolDir, '..', '..');
const slug = 'wise-fee-calculator';
const url = `/tools/${slug}/`;
const html = fs.readFileSync(path.join(toolDir, 'index.html'), 'utf8');

function approx(actual, expected, tolerance = 0.01) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} ≈ ${expected} (±${tolerance})`);
}

function loadCompute() {
  const startMarker = '<!-- TESTABLE_COMPUTE_START -->';
  const endMarker = '// TESTABLE_COMPUTE_END';
  const start = html.indexOf(startMarker);
  const end = html.indexOf(endMarker);

  assert.ok(start !== -1, 'start marker should exist');
  assert.ok(end !== -1 && end > start, 'end marker should exist after start marker');

  const source = html
    .slice(start + startMarker.length, end + endMarker.length)
    .replace(/<script>/, '')
    .trim();

  const context = {
    module: { exports: {} },
    exports: {},
    console,
    Math,
  };

  vm.createContext(context);
  vm.runInContext(`${source}\nmodule.exports = { WISE_FEES, CARD_LIMIT, calcForward, calcReverse, calcBankWire, r2 };`, context);
  return context.module.exports;
}

const { WISE_FEES, CARD_LIMIT, calcForward, calcReverse, calcBankWire } = loadCompute();

function getMethod(results, method) {
  const match = results.find((item) => item.method === method);
  assert.ok(match, `missing method: ${method}`);
  return match;
}

test('TC-WISE-01 exports expected fee tables and card limit', () => {
  assert.equal(CARD_LIMIT, 15000);
  assert.equal(WISE_FEES.EUR.bank.fixed, 0.87);
  assert.equal(WISE_FEES.CAD.debit.pct, 0.0066);
  assert.equal(WISE_FEES.MXN.credit.fixed, 1.3);
});

test('TC-WISE-02 forward EUR bank baseline matches spec', () => {
  const bank = getMethod(calcForward(1000, 'EUR'), 'bank');

  approx(bank.feeUSD, 4.97);
  approx(bank.netUSD, 995.03);
  approx(bank.feePct, 0.497);
});

test('TC-WISE-03 forward GBP all methods match spec baselines', () => {
  const results = calcForward(2000, 'GBP');
  const bank = getMethod(results, 'bank');
  const debit = getMethod(results, 'debit');
  const credit = getMethod(results, 'credit');
  const wire = getMethod(results, 'wire');

  approx(bank.feeUSD, 9.07);
  approx(bank.netUSD, 1990.93);
  approx(debit.feeUSD, 9.07);
  approx(credit.feeUSD, 41.07);
  approx(credit.netUSD, 1958.93);
  approx(wire.feeUSD, 87.8);
  approx(wire.netUSD, 1912.2);
});

test('TC-WISE-04 reverse EUR target receive math matches spec', () => {
  const bank = getMethod(calcReverse(900, 'EUR'), 'bank');
  const credit = getMethod(calcReverse(900, 'EUR'), 'credit');

  approx(bank.sendAmount, 904.58);
  approx(bank.feeUSD, 4.58);
  approx(bank.netUSD, 900);
  approx(credit.sendAmount, 919.35);
  approx(credit.feeUSD, 19.35);
});

test('TC-WISE-05 reverse JPY bank amount matches spec baseline', () => {
  const bank = getMethod(calcReverse(5000, 'JPY'), 'bank');

  approx(bank.sendAmount, 5031.56);
  approx(bank.feeUSD, 31.56);
  approx(bank.netUSD, 5000);
});

test('TC-WISE-06 comparison bank wire helper is deterministic', () => {
  approx(calcBankWire(1000), 65);
  approx(calcBankWire(2000), 95);
});

test('TC-WISE-07 page contains required UI and metadata anchors', () => {
  for (const token of [
    '<title>Wise Fee Calculator — TransferWise International Transfer Costs</title>',
    'id="amountInput"',
    'id="currencySelect"',
    'id="cardWarn"',
    'id="methodGrid"',
    'comparison-grid',
    'Bank Transfer',
    'Debit Card',
    'Credit Card',
    'Wire / SWIFT',
    '/assets/analytics.js',
    'Related Tools',
    '/tools/stripe-fee-calculator/',
    '/tools/payment-gateway-fee-margin-calculator/'
  ]) {
    assert.ok(html.includes(token), token);
  }
});

test('TC-WISE-08 catalog integration is exact-once across discovery surfaces', () => {
  const toolsIndexHtml = fs.readFileSync(path.join(repoRoot, 'tools', 'index.html'), 'utf8');
  const toolsIndexMd = fs.readFileSync(path.join(repoRoot, 'tools', 'index.md'), 'utf8');
  const manifest = JSON.parse(fs.readFileSync(path.join(repoRoot, 'tools', 'manifest.json'), 'utf8'));
  const toolsList = JSON.parse(fs.readFileSync(path.join(repoRoot, '_data', 'tools-list.json'), 'utf8'));

  const htmlMatches = (toolsIndexHtml.match(new RegExp(`href="${slug}/"`, 'g')) || []).length;
  const mdMatches = (toolsIndexMd.match(new RegExp(`\(\./${slug}/\)`, 'g')) || []).length;
  const manifestMatches = manifest.tools.filter((entry) => entry.slug === slug && entry.url === url).length;
  const listMatches = toolsList.filter((entry) => entry.url === url).length;

  assert.equal(htmlMatches, 1, 'tools/index.html should link to the tool exactly once');
  assert.equal(mdMatches, 1, 'tools/index.md should reference the tool exactly once');
  assert.equal(manifestMatches, 1, 'tools/manifest.json should include the tool exactly once');
  assert.equal(listMatches, 1, '_data/tools-list.json should include the tool exactly once');
});
