const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const htmlPath = path.join(__dirname, 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const match = html.match(/\/\* TESTABLE_COMPUTE_START \*\/([\s\S]*?)\/\* TESTABLE_COMPUTE_END \*\//);
if (!match) {
  throw new Error('Unable to find TESTABLE_COMPUTE block in index.html');
}

const context = {
  globalThis: {},
  console,
  Math,
  Number,
  String,
  Boolean,
  Object,
  Array,
  JSON,
};
vm.createContext(context);
vm.runInContext(match[1], context);

const api = context.globalThis.AppStoreVsGooglePlayNetRevenueCalculator;
if (!api || typeof api.compute !== 'function' || typeof api.validateInputs !== 'function') {
  throw new Error('Calculator API did not load from compute block.');
}

function approxEqual(actual, expected, tolerance = 0.01, label = 'value') {
  const diff = Math.abs(actual - expected);
  assert(
    diff <= tolerance,
    `${label}: expected ${expected}, got ${actual} (diff ${diff})`
  );
}

function runValidCase(label, input, expected) {
  const payload = api.compute(input);
  assert.strictEqual(payload.ok, true, `${label}: expected ok=true`);
  const result = payload.result;
  Object.keys(expected).forEach((key) => {
    const expectedValue = expected[key];
    const actualValue = result[key];
    if (typeof expectedValue === 'number') {
      approxEqual(actualValue, expectedValue, 0.01, `${label}.${key}`);
    } else {
      assert.strictEqual(actualValue, expectedValue, `${label}.${key}`);
    }
  });
}

runValidCase('case1_tie', {
  grossCustomerSpend: 250000,
  vatRate: 10,
  refundRate: 4,
  appleFeeMode: 'small-business',
  googleEnrolled: true,
  googleYtdEarnings: 300000,
  googleTierCap: 1000000,
  operatingCost: 15000,
  uaSpend: 40000,
  currencyCode: 'USD'
}, {
  feeBearingRevenue: 218181.82,
  appleFee: 32727.27,
  appleNetProceeds: 185454.55,
  appleNetProfit: 130454.55,
  googleFee: 32727.27,
  googleNetProceeds: 185454.55,
  googleNetProfit: 130454.55,
  profitDelta: 0,
  winner: 'Tie',
  googleLowerTierRevenue: 218181.82,
  googleUpperTierRevenue: 0
});

runValidCase('case2_google_wins', {
  grossCustomerSpend: 400000,
  vatRate: 10,
  refundRate: 5,
  appleFeeMode: 'standard',
  googleEnrolled: true,
  googleYtdEarnings: 200000,
  googleTierCap: 1000000,
  operatingCost: 20000,
  uaSpend: 50000,
  currencyCode: 'USD'
}, {
  feeBearingRevenue: 345454.55,
  appleFee: 103636.36,
  appleNetProceeds: 241818.18,
  appleNetProfit: 171818.18,
  googleFee: 51818.18,
  googleNetProceeds: 293636.36,
  googleNetProfit: 223636.36,
  profitDelta: 51818.18,
  winner: 'Google Play',
  googleLowerTierRevenue: 345454.55,
  googleUpperTierRevenue: 0
});

runValidCase('case3_partial_threshold', {
  grossCustomerSpend: 1500000,
  vatRate: 10,
  refundRate: 2,
  appleFeeMode: 'small-business',
  googleEnrolled: true,
  googleYtdEarnings: 950000,
  googleTierCap: 1000000,
  operatingCost: 60000,
  uaSpend: 120000,
  currencyCode: 'USD'
}, {
  feeBearingRevenue: 1336363.64,
  appleFee: 200454.55,
  appleNetProceeds: 1135909.09,
  appleNetProfit: 955909.09,
  googleTierRunwayBefore: 50000,
  googleLowerTierRevenue: 50000,
  googleUpperTierRevenue: 1286363.64,
  googleFee: 393409.09,
  googleNetProceeds: 942954.55,
  googleNetProfit: 762954.55,
  profitDelta: -192954.55,
  winner: 'Apple'
});

runValidCase('case4_not_enrolled', {
  grossCustomerSpend: 250000,
  vatRate: 10,
  refundRate: 4,
  appleFeeMode: 'small-business',
  googleEnrolled: false,
  googleYtdEarnings: 0,
  googleTierCap: 1000000,
  operatingCost: 15000,
  uaSpend: 40000,
  currencyCode: 'USD'
}, {
  feeBearingRevenue: 218181.82,
  appleNetProfit: 130454.55,
  googleFee: 65454.55,
  googleNetProceeds: 152727.27,
  googleNetProfit: 97727.27,
  profitDelta: -32727.27,
  winner: 'Apple',
  googleLowerTierRevenue: 0,
  googleUpperTierRevenue: 218181.82
});

['grossCustomerSpend', 'vatRate', 'refundRate', 'operatingCost', 'uaSpend'].forEach((field) => {
  const badInput = {
    grossCustomerSpend: 1000,
    vatRate: 10,
    refundRate: 5,
    appleFeeMode: 'small-business',
    googleEnrolled: true,
    googleYtdEarnings: 0,
    googleTierCap: 1000000,
    operatingCost: 0,
    uaSpend: 0,
    currencyCode: 'USD'
  };

  if (field === 'grossCustomerSpend') badInput[field] = 0;
  if (field === 'vatRate') badInput[field] = 101;
  if (field === 'refundRate') badInput[field] = -1;
  if (field === 'operatingCost') badInput[field] = -1;
  if (field === 'uaSpend') badInput[field] = -1;

  const validation = api.validateInputs(badInput);
  assert.strictEqual(validation.ok, false, `expected validation failure for ${field}`);
});

console.log('calculator.test.js: PASS');
