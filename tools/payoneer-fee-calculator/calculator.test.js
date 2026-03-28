'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  DEFAULT_INPUTS,
  LOCAL_WITHDRAWAL_FIXED_FEES,
  calculate,
  getReceivePreset,
  getWithdrawalPreset,
  validateInputs,
} = require('./calculator.js');

function approx(actual, expected, tolerance = 0.01) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} ≈ ${expected} (±${tolerance})`);
}

test('TC-PAYO-00 exports defaults and local withdrawal fixed-fee map', () => {
  assert.equal(DEFAULT_INPUTS.grossAmount, 1000);
  assert.equal(DEFAULT_INPUTS.receiveMethod, 'clientCard');
  assert.equal(LOCAL_WITHDRAWAL_FIXED_FEES.USD, 1.5);
  assert.equal(LOCAL_WITHDRAWAL_FIXED_FEES.HKD, 12);
});

test('TC-PAYO-01 default baseline composes client-card receive fee and local withdrawal fee', () => {
  const { result, error } = calculate(DEFAULT_INPUTS);

  assert.equal(error, '');
  approx(result.receiveFee, 39.9, 0.0001);
  approx(result.balanceAfterReceive, 960.1, 0.0001);
  approx(result.withdrawalFee, 1.5, 0.0001);
  approx(result.bankNet, 958.6, 0.0001);
  approx(result.totalFees, 41.4, 0.0001);
  approx(result.effectiveTotalFeeRatePct, 4.14, 0.0001);
});

test('TC-PAYO-02 PayPal preset adds fixed receive fee before same-currency withdrawal', () => {
  const { result, error } = calculate({
    grossAmount: 1000,
    targetNetAmount: 900,
    currency: 'USD',
    receiveMethod: 'paypalUs',
    withdrawalMode: 'sameCurrencyLocal',
  });

  assert.equal(error, '');
  approx(result.receiveFee, 40.39, 0.0001);
  approx(result.balanceAfterReceive, 959.61, 0.0001);
  approx(result.withdrawalFee, 1.5, 0.0001);
  approx(result.bankNet, 958.11, 0.0001);
  approx(result.totalFees, 41.89, 0.0001);
});

test('TC-PAYO-03 local-currency receiving account stays free before local fixed-fee withdrawal', () => {
  const { result, error } = calculate({
    grossAmount: 1000,
    targetNetAmount: 900,
    currency: 'EUR',
    receiveMethod: 'receivingLocal',
    withdrawalMode: 'sameCurrencyLocal',
  });

  assert.equal(error, '');
  approx(result.receiveFee, 0, 0.0001);
  approx(result.balanceAfterReceive, 1000, 0.0001);
  approx(result.withdrawalFee, 1.5, 0.0001);
  approx(result.bankNet, 998.5, 0.0001);
  approx(result.totalFees, 1.5, 0.0001);
  approx(result.effectiveTotalFeeRatePct, 0.15, 0.0001);
});

test('TC-PAYO-04 foreign-currency receiving baseline plus variable withdrawal composes two percentage fees', () => {
  const { result, error } = calculate({
    grossAmount: 1000,
    targetNetAmount: 900,
    currency: 'USD',
    receiveMethod: 'receivingForeign',
    withdrawalMode: 'variableRate',
  });

  assert.equal(error, '');
  approx(result.receiveFee, 10, 0.0001);
  approx(result.balanceAfterReceive, 990, 0.0001);
  approx(result.withdrawalFee, 19.8, 0.0001);
  approx(result.bankNet, 970.2, 0.0001);
  approx(result.totalFees, 29.8, 0.0001);
  approx(result.effectiveTotalFeeRatePct, 2.98, 0.0001);
});

test('TC-PAYO-05 target-net reverse solver reproduces ACH no-withdrawal target', () => {
  const targetNetAmount = 1000;
  const first = calculate({
    grossAmount: 0,
    targetNetAmount,
    currency: 'USD',
    receiveMethod: 'achBankDebit',
    withdrawalMode: 'none',
  });

  assert.equal(first.error, '');
  approx(first.result.targetGrossForNet, 1010.101010, 0.0001);

  const second = calculate({
    grossAmount: first.result.targetGrossForNet,
    targetNetAmount,
    currency: 'USD',
    receiveMethod: 'achBankDebit',
    withdrawalMode: 'none',
  });

  assert.equal(second.error, '');
  approx(second.result.bankNet, targetNetAmount, 0.001);
});

test('TC-PAYO-06 invalid negative amount is rejected', () => {
  const validation = validateInputs({ ...DEFAULT_INPUTS, grossAmount: -1 });
  assert.equal(validation.ok, false);
  assert.match(validation.errors.join(' '), /grossAmount/);

  const { result, error } = calculate({ ...DEFAULT_INPUTS, grossAmount: -1 });
  assert.equal(result, null);
  assert.match(error, /grossAmount/);
});

test('TC-PAYO-07 invalid enum values are rejected', () => {
  const validation = validateInputs({ ...DEFAULT_INPUTS, receiveMethod: 'wrong' });
  assert.equal(validation.ok, false);
  assert.match(validation.errors.join(' '), /receiveMethod/);

  const validation2 = validateInputs({ ...DEFAULT_INPUTS, withdrawalMode: 'wrong' });
  assert.equal(validation2.ok, false);
  assert.match(validation2.errors.join(' '), /withdrawalMode/);
});

test('TC-PAYO-08 preset helpers expose expected public-baseline assumptions', () => {
  const receivePreset = getReceivePreset('paypalUs');
  const withdrawalPreset = getWithdrawalPreset('sameCurrencyLocal', 'GBP');

  assert.equal(receivePreset.feeRatePct, 3.99);
  assert.equal(receivePreset.fixedFee, 0.49);
  assert.equal(withdrawalPreset.feeRatePct, 0);
  assert.equal(withdrawalPreset.fixedFee, 1.5);
});

test('TC-PAYO-09 HTML scaffold anchors exist', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

  for (const token of [
    'Payoneer Fee Calculator | 페이오니아 수수료 계산기',
    'script defer src="./calculator.js"',
    'id="balanceAfterReceive"',
    'id="bankNet"',
    '/assets/analytics.js',
  ]) {
    assert.ok(html.includes(token), token);
  }
});

test('TC-PAYO-10 discovery exact-once in tools index files', () => {
  const root = path.join(__dirname, '..', '..');
  const slug = 'payoneer-fee-calculator';
  const toolsIndexHtml = fs.readFileSync(path.join(root, 'tools', 'index.html'), 'utf8');
  const toolsIndexMd = fs.readFileSync(path.join(root, 'tools', 'index.md'), 'utf8');

  assert.equal((toolsIndexHtml.match(new RegExp(`href="${slug}/"`, 'g')) || []).length, 1, 'tools/index.html exact-once');
  assert.equal((toolsIndexMd.match(new RegExp(`\./${slug}/`, 'g')) || []).length, 1, 'tools/index.md exact-once');
});

test('TC-PAYO-11 tools-list exact-once', () => {
  const root = path.join(__dirname, '..', '..');
  const url = '/tools/payoneer-fee-calculator/';
  const toolsList = JSON.parse(fs.readFileSync(path.join(root, '_data', 'tools-list.json'), 'utf8'));

  assert.equal(toolsList.filter((entry) => entry.url === url).length, 1, 'tools-list exact-once');
});

test('TC-PAYO-12 manifest exact-once', () => {
  const root = path.join(__dirname, '..', '..');
  const slug = 'payoneer-fee-calculator';
  const url = '/tools/payoneer-fee-calculator/';
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'manifest.json'), 'utf8'));

  assert.equal(manifest.tools.filter((entry) => entry.slug === slug && entry.url === url).length, 1, 'manifest exact-once');
});
