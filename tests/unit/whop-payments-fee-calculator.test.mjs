import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  DEFAULT_INPUT,
  validateInputs,
  calculateProcessingFee,
  calculatePerTransaction,
  calculateMonthlyProjection,
  calculateWhopFees,
  solveRequiredGrossForTargetNet,
} from '../../tools/whop-payments-fee-calculator/logic.mjs';

function approx(actual, expected, tolerance = 1e-6) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} ≈ ${expected} (±${tolerance})`);
}

describe('whop payments fee calculator logic', () => {
  it('tc_whop_01 domestic cards with no payout allocation stays on simple 2.7% + $0.30 math', () => {
    const result = calculatePerTransaction(100, 'domestic_cards', 'hold_balance', 10);
    approx(result.processingFee, 3);
    approx(result.balanceAfterProcessing, 97);
    approx(result.payoutFeeAllocated, 0);
    approx(result.totalFees, 3);
    approx(result.netTakeHome, 97);
    approx(result.effectiveFeeRatePct, 3);
  });

  it('tc_whop_02 international fx plus instant bank payout amortizes payout drag across the batch', () => {
    const { result, error } = calculateWhopFees({
      amount: 100,
      paymentMethod: 'international_cards_fx',
      payoutMethod: 'instant_bank',
      transactionsPerPayout: 5,
      transactionsPerMonth: 12,
      targetNet: 80,
    });

    assert.equal(error, '');
    approx(result.perTransaction.processingFee, 5.5);
    approx(result.perTransaction.payoutFeeAllocated, 3.98, 0.00001);
    approx(result.perTransaction.netTakeHome, 90.52, 0.00001);
    approx(result.perTransaction.effectiveFeeRatePct, 9.48, 0.00001);
    approx(result.monthly.payoutFees, 48.36, 0.00001);
    approx(result.monthly.netTakeHome, 1085.64, 0.00001);
    assert.equal(result.monthly.payoutCount, 3);
  });

  it('tc_whop_03 ach fee respects the public $5 cap branch', () => {
    approx(calculateProcessingFee(500, 'ach_debit'), 5);
    const { result, error } = calculateWhopFees({
      amount: 500,
      paymentMethod: 'ach_debit',
      payoutMethod: 'hold_balance',
      transactionsPerPayout: 10,
      transactionsPerMonth: 20,
      targetNet: 450,
    });
    assert.equal(error, '');
    approx(result.perTransaction.processingFee, 5);
    approx(result.perTransaction.netTakeHome, 495);
    approx(result.targetGrossAmount, 455);
  });

  it('tc_whop_04 financing plus venmo payout remains deterministic', () => {
    const { result, error } = calculateWhopFees({
      amount: 200,
      paymentMethod: 'financing',
      payoutMethod: 'venmo',
      transactionsPerPayout: 4,
      transactionsPerMonth: 9,
      targetNet: 150,
    });

    assert.equal(error, '');
    approx(result.perTransaction.processingFee, 30);
    approx(result.perTransaction.payoutFeeAllocated, 8.75);
    approx(result.perTransaction.netTakeHome, 161.25);
    approx(result.monthly.payoutFees, 79.5);
    approx(result.targetGrossAmount, 186.07, 0.00001);
  });

  it('tc_whop_05 reverse solver finds a gross amount that lands on target net', () => {
    const gross = solveRequiredGrossForTargetNet(100, 'international_cards', 'next_day_ach', 8);
    const result = calculatePerTransaction(gross, 'international_cards', 'next_day_ach', 8);
    approx(result.netTakeHome, 100, 0.000001);
    approx(gross, 105.02348643006263, 0.000001);
  });

  it('tc_whop_06 validation rejects impossible inputs', () => {
    const invalidCases = [
      { ...DEFAULT_INPUT, amount: 0 },
      { ...DEFAULT_INPUT, amount: -1 },
      { ...DEFAULT_INPUT, paymentMethod: 'nope' },
      { ...DEFAULT_INPUT, payoutMethod: 'bad' },
      { ...DEFAULT_INPUT, transactionsPerPayout: 0 },
      { ...DEFAULT_INPUT, transactionsPerPayout: 1.5 },
      { ...DEFAULT_INPUT, transactionsPerMonth: -1 },
      { ...DEFAULT_INPUT, targetNet: -5 },
    ];

    invalidCases.forEach((input) => {
      const validation = validateInputs(input);
      assert.equal(validation.valid, false);
      const calculated = calculateWhopFees(input);
      assert.equal(calculated.ok, false);
      assert.notEqual(calculated.error, '');
    });
  });

  it('tc_whop_07 monthly projection uses exact full-batch plus remainder payout counts', () => {
    const monthly = calculateMonthlyProjection(100, 'domestic_cards', 'next_day_ach', 6, 13);
    approx(monthly.processingFees, 39);
    approx(monthly.payoutFees, 7.5);
    approx(monthly.totalFees, 46.5);
    approx(monthly.netTakeHome, 1253.5);
    assert.equal(monthly.payoutCount, 3);
  });

  it('tc_whop_08 html scaffold includes canonical, analytics, formula disclosure, and logic import', () => {
    const html = readFileSync(resolve(process.cwd(), 'tools/whop-payments-fee-calculator/index.html'), 'utf8');
    for (const token of [
      'https://eastsea.monster/tools/whop-payments-fee-calculator/',
      '/assets/analytics.js',
      'post-processing payout balance',
      "./logic.mjs",
      'Whop Payments Fee Calculator',
      'transactions per payout',
    ]) {
      assert.ok(html.includes(token), token);
    }
  });

  it('tc_whop_09 discovery wiring is exact-once across catalog surfaces', () => {
    const slug = 'whop-payments-fee-calculator';
    const url = `/tools/${slug}/`;
    const indexHtml = readFileSync(resolve(process.cwd(), 'tools/index.html'), 'utf8');
    const indexMd = readFileSync(resolve(process.cwd(), 'tools/index.md'), 'utf8');
    const toolsList = JSON.parse(readFileSync(resolve(process.cwd(), '_data/tools-list.json'), 'utf8'));
    const manifest = JSON.parse(readFileSync(resolve(process.cwd(), 'tools/manifest.json'), 'utf8'));

    assert.equal((indexHtml.match(new RegExp(slug, 'g')) || []).length, 1, 'tools/index.html exact-once');
    assert.equal((indexMd.match(new RegExp(slug, 'g')) || []).length, 1, 'tools/index.md exact-once');
    assert.equal(toolsList.filter((entry) => entry.url === url).length, 1, '_data/tools-list.json exact-once');
    assert.equal(manifest.tools.filter((entry) => entry.slug === slug && entry.url === url).length, 1, 'tools/manifest.json exact-once');
  });
});
