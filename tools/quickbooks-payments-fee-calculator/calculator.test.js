const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const toolDir = __dirname;
const repoRoot = path.resolve(toolDir, '..', '..');
const slug = 'quickbooks-payments-fee-calculator';
const url = `/tools/${slug}/`;
const html = fs.readFileSync(path.join(toolDir, 'index.html'), 'utf8');

const {
  RATE_SOURCE_DATE,
  DEFAULT_ASSUMPTIONS,
  DEFAULT_INPUTS,
  calculate
} = require('./calculator.js');

function approx(actual, expected, tolerance = 0.01) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `expected ${actual} ≈ ${expected} (±${tolerance})`
  );
}

test('TC-QB-01 default invoice or digital wallet fee on $100 uses 2.99%', () => {
  const { result, error } = calculate({ amount: 100, paymentType: 'invoice', mode: 'forward' });
  assert.equal(error, '');
  approx(result.fee, 2.99);
  approx(result.net, 97.01);
  approx(result.effectiveFeeRate * 100, 2.99, 0.001);
});

test('TC-QB-02 ACH mode on $100 uses 1.00%', () => {
  const { result, error } = calculate({ amount: 100, paymentType: 'ach', mode: 'forward' });
  assert.equal(error, '');
  approx(result.fee, 1.0);
  approx(result.net, 99.0);
});

test('TC-QB-03 in-person mode on $100 uses 2.50%', () => {
  const { result, error } = calculate({ amount: 100, paymentType: 'inPerson', mode: 'forward' });
  assert.equal(error, '');
  approx(result.fee, 2.5);
  approx(result.net, 97.5);
});

test('TC-QB-04 keyed-in mode on $100 uses 3.50%', () => {
  const { result, error } = calculate({ amount: 100, paymentType: 'keyed', mode: 'forward' });
  assert.equal(error, '');
  approx(result.fee, 3.5);
  approx(result.net, 96.5);
});

test('TC-QB-05 international surcharge adds 1.00% only to eligible methods', () => {
  const invoiceIntl = calculate({
    amount: 100,
    paymentType: 'invoice',
    mode: 'forward',
    international: true
  });
  const achIntl = calculate({
    amount: 100,
    paymentType: 'ach',
    mode: 'forward',
    international: true
  });

  assert.equal(invoiceIntl.error, '');
  assert.equal(achIntl.error, '');

  approx(invoiceIntl.result.fee, 3.99);
  approx(invoiceIntl.result.net, 96.01);
  approx(achIntl.result.fee, 1.0);
  approx(achIntl.result.internationalRate, 0);
});

test('TC-QB-06 reverse mode finds gross charge required to net target amount', () => {
  const { result, error } = calculate({
    amount: 100,
    paymentType: 'invoice',
    mode: 'reverse'
  });

  assert.equal(error, '');
  approx(result.grossCharge, 103.08);
  approx(result.fee, 3.08);
  approx(result.net, 100);
});

test('TC-QB-07 monthly and annual fee drag uses transaction count', () => {
  const { result, error } = calculate({
    amount: 100,
    paymentType: 'keyed',
    mode: 'forward',
    monthlyTransactionCount: 40
  });

  assert.equal(error, '');
  approx(result.monthlyFees, 140);
  approx(result.annualFees, 1680);
});

test('TC-QB-08 custom total rate override replaces selected method total rate without mutating defaults', () => {
  const snapshot = JSON.stringify(DEFAULT_ASSUMPTIONS);
  const { result, error } = calculate(
    {
      amount: 100,
      paymentType: 'invoice',
      mode: 'forward',
      customTotalRate: 0.05
    },
    DEFAULT_ASSUMPTIONS
  );

  assert.equal(error, '');
  approx(result.totalRate, 0.05, 0.0001);
  approx(result.fee, 5);
  approx(result.net, 95);
  assert.equal(JSON.stringify(DEFAULT_ASSUMPTIONS), snapshot);
});

test('TC-QB-09 invalid amount, monthly count, and custom total rate return validation errors', () => {
  const invalidCases = [
    { input: { amount: 0 }, message: 'Amount must be a finite number greater than 0.' },
    { input: { amount: 50, monthlyTransactionCount: 2.5 }, message: 'Monthly transaction count must be an integer-like number at or above 0.' },
    { input: { amount: 50, customTotalRate: 1 }, message: 'Custom total rate override must be a finite rate between 0% and under 100%.' }
  ];

  invalidCases.forEach(({ input, message }) => {
    const { result, error } = calculate(input);
    assert.equal(result, null);
    assert.equal(error, message);
  });
});

test('TC-QB-10 reverse mode blocks impossible total fee rate states', () => {
  const { result, error } = calculate(
    {
      amount: 100,
      paymentType: 'invoice',
      mode: 'reverse',
      customTotalRate: 1
    },
    DEFAULT_ASSUMPTIONS
  );

  assert.equal(result, null);
  assert.equal(error, 'Custom total rate override must be a finite rate between 0% and under 100%.');
});

test('TC-QB-11 summary includes payment type, effective rate, fee, and net proceeds', () => {
  const { result, error } = calculate({
    amount: 100,
    paymentType: 'invoice',
    mode: 'forward',
    monthlyTransactionCount: 25
  });

  assert.equal(error, '');
  assert.match(result.summary, /Payment type: Invoice or digital wallet/);
  assert.match(result.summary, /Effective fee rate: 2\.99%/);
  assert.match(result.summary, /Total fee: \$2\.99/);
  assert.match(result.summary, /Net proceeds: \$97\.01/);
  assert.match(result.summary, new RegExp(`Assumption source date: ${RATE_SOURCE_DATE}`));
});

test('TC-QB-12 HTML contains required title, H1, caveat, FAQ, and related links', () => {
  [
    '<title>QuickBooks Payments Fee Calculator | QuickBooks 결제 수수료 계산기</title>',
    '<h1>QuickBooks Payments Fee Calculator</h1>',
    'Rates can vary by plan, discount, or negotiated terms.',
    'What are QuickBooks Payments fees?',
    'Does QuickBooks charge extra for international cards?',
    'Is ACH cheaper than card payments in QuickBooks?',
    'Why should the rates be editable?',
    '/tools/stripe-fee-calculator/',
    '/tools/paypal-fee-calculator/',
    '/tools/square-fee-calculator/',
    'calculator.js'
  ].forEach((token) => {
    assert.ok(html.includes(token), token);
  });
});

test('TC-QB-13 catalog integration is exact-once across discovery surfaces', () => {
  const toolsIndexHtml = fs.readFileSync(path.join(repoRoot, 'tools', 'index.html'), 'utf8');
  const toolsIndexMd = fs.readFileSync(path.join(repoRoot, 'tools', 'index.md'), 'utf8');
  const manifest = JSON.parse(fs.readFileSync(path.join(repoRoot, 'tools', 'manifest.json'), 'utf8'));
  const toolsList = JSON.parse(fs.readFileSync(path.join(repoRoot, '_data', 'tools-list.json'), 'utf8'));

  const htmlMatches = (toolsIndexHtml.match(new RegExp(`href="${slug}/"`, 'g')) || []).length;
  const mdMatches = (toolsIndexMd.match(new RegExp(`\\(\\./${slug}/\\)`, 'g')) || []).length;
  const manifestMatches = manifest.tools.filter((entry) => entry.slug === slug && entry.url === url).length;
  const listMatches = toolsList.filter((entry) => entry.url === url).length;

  assert.equal(htmlMatches, 1, 'tools/index.html should link to the tool exactly once');
  assert.equal(mdMatches, 1, 'tools/index.md should reference the tool exactly once');
  assert.equal(manifestMatches, 1, 'tools/manifest.json should include the tool exactly once');
  assert.equal(listMatches, 1, '_data/tools-list.json should include the tool exactly once');
});

test('TC-QB-14 defaults preserve narrow QuickBooks-specific scope', () => {
  assert.equal(DEFAULT_INPUTS.paymentType, 'invoice');
  assert.equal(DEFAULT_INPUTS.mode, 'forward');
  assert.equal(DEFAULT_ASSUMPTIONS.invoiceRate, 0.0299);
  assert.equal(DEFAULT_ASSUMPTIONS.achRate, 0.01);
});
