import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const require = createRequire(import.meta.url);
const calc = require('../../tools/facebook-marketplace-fee-profit-calculator/calculator.js');

function approx(actual, expected, tolerance = 0.000001) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} ≈ ${expected} (±${tolerance})`);
}

describe('facebook marketplace fee profit calculator', () => {
  it('tc_fbmp_01 shipped baseline returns deterministic fee, payout, margin, and target pricing', () => {
    const { result, error } = calc.calculate({
      salePrice: 45,
      orderMode: 'shipped',
      shippingChargedToBuyer: 8,
      shippingLabelCost: 7.25,
      itemCost: 18,
      packagingCost: 1.2,
      boostCost: 2,
      otherCost: 0,
      useCustomFee: false,
      customFeeRatePct: 10,
      customMinimumFee: 0.8,
      processingRatePct: 0,
      processingFlatFee: 0,
      targetProfit: 15,
    });

    assert.equal(error, '');
    approx(result.grossCollected, 53);
    approx(result.marketplaceFee, 5.3);
    approx(result.payoutAfterFees, 47.7);
    approx(result.sellerCosts, 28.45);
    approx(result.netProfit, 19.25);
    approx(result.netMarginPct, 36.320755, 0.00001);
    approx(result.breakEvenSalePrice, 23.611111, 0.00001);
    approx(result.requiredSalePriceForTargetProfit, 40.277778, 0.00001);
    approx(result.pickupDelta.profitDeltaVsPickup, 4.55);
  });

  it('tc_fbmp_02 minimum fee branch works on low-ticket shipped orders', () => {
    const { result, error } = calc.calculate({
      salePrice: 2,
      orderMode: 'shipped',
      shippingChargedToBuyer: 0,
      shippingLabelCost: 0,
      itemCost: 0.5,
      packagingCost: 0.1,
      boostCost: 0,
      otherCost: 0,
      useCustomFee: false,
      customFeeRatePct: 10,
      customMinimumFee: 0.8,
      processingRatePct: 0,
      processingFlatFee: 0,
      targetProfit: 1,
    });

    assert.equal(error, '');
    approx(result.marketplaceFee, 0.8);
    approx(result.effectiveFeeRatePct, 40);
    approx(result.netProfit, 0.6);
    approx(result.breakEvenSalePrice, 1.4);
    approx(result.requiredSalePriceForTargetProfit, 2.4);
  });

  it('tc_fbmp_03 pickup baseline removes marketplace fee and shipping label cost', () => {
    const { result, error } = calc.calculate({
      salePrice: 35,
      orderMode: 'pickup',
      shippingChargedToBuyer: 0,
      shippingLabelCost: 0,
      itemCost: 12,
      packagingCost: 0.5,
      boostCost: 1,
      otherCost: 0,
      useCustomFee: false,
      customFeeRatePct: 10,
      customMinimumFee: 0.8,
      processingRatePct: 0,
      processingFlatFee: 0,
      targetProfit: 8,
    });

    assert.equal(error, '');
    approx(result.marketplaceFee, 0);
    approx(result.processingFee, 0);
    approx(result.sellerCosts, 13.5);
    approx(result.netProfit, 21.5);
    approx(result.breakEvenSalePrice, 13.5);
    approx(result.requiredSalePriceForTargetProfit, 21.5);
    assert.equal(result.feeModel.feeModelLabel, 'Local pickup baseline: 0% marketplace fee');
  });

  it('tc_fbmp_04 custom fee override plus processing drag applies correctly', () => {
    const { result, error } = calc.calculate({
      salePrice: 60,
      orderMode: 'shipped',
      shippingChargedToBuyer: 6,
      shippingLabelCost: 5,
      itemCost: 20,
      packagingCost: 1,
      boostCost: 3,
      otherCost: 2,
      useCustomFee: true,
      customFeeRatePct: 12.5,
      customMinimumFee: 1.5,
      processingRatePct: 2.9,
      processingFlatFee: 0.3,
      targetProfit: 20,
    });

    assert.equal(error, '');
    approx(result.marketplaceFee, 8.25);
    approx(result.processingFee, 2.214, 0.00001);
    approx(result.netProfit, 24.536, 0.00001);
    approx(result.effectiveFeeRatePct, 15.854545, 0.00001);
    approx(result.requiredSalePriceForTargetProfit, 54.638298, 0.00001);
    assert.equal(result.feeModel.feeModelLabel, 'Custom fee override');
  });

  it('tc_fbmp_05 validation rejects impossible inputs', () => {
    const invalidCases = [
      { salePrice: 0 },
      { salePrice: 10, orderMode: 'unknown' },
      { salePrice: 10, orderMode: 'pickup', shippingChargedToBuyer: 1 },
      { salePrice: 10, processingRatePct: 100 },
      { salePrice: 10, customFeeRatePct: 99, processingRatePct: 2, useCustomFee: true },
      { salePrice: 10, itemCost: -1 },
    ];

    invalidCases.forEach((input) => {
      const { result, error } = calc.calculate(input);
      assert.equal(result, null);
      assert.notEqual(error, '');
    });
  });

  it('tc_fbmp_06 summary contains decision-ready fields', () => {
    const { result, error } = calc.calculate(calc.DEFAULT_INPUTS);
    assert.equal(error, '');
    assert.match(result.summary, /\[Facebook Marketplace Fee & Profit Calculator Summary\]/);
    assert.match(result.summary, /Order mode:/);
    assert.match(result.summary, /Marketplace fee:/);
    assert.match(result.summary, /Break-even sale price:/);
    assert.match(result.summary, /Sale price for target profit:/);
    assert.match(result.summary, /Pickup delta vs current scenario:/);
  });

  it('tc_fbmp_07 html scaffold has required anchors and baseline copy', () => {
    const html = readFileSync(resolve(process.cwd(), 'tools/facebook-marketplace-fee-profit-calculator/index.html'), 'utf8');
    for (const token of [
      'calculatorForm',
      'orderMode',
      'useCustomFee',
      'customFeeFields',
      'summary',
      './calculator.js',
      '/assets/analytics.js',
      '10% seller fee with a $0.80 minimum',
      'local pickup has a 0% Marketplace fee baseline'
    ]) {
      assert.ok(html.includes(token), token);
    }
  });

  it('tc_fbmp_08 discovery wiring is exact-once across index, manifest, and tools list', () => {
    const slug = 'facebook-marketplace-fee-profit-calculator';
    const url = `/tools/${slug}/`;
    const indexHtml = readFileSync(resolve(process.cwd(), 'tools/index.html'), 'utf8');
    const indexMd = readFileSync(resolve(process.cwd(), 'tools/index.md'), 'utf8');
    const toolsList = JSON.parse(readFileSync(resolve(process.cwd(), '_data/tools-list.json'), 'utf8'));
    const manifest = JSON.parse(readFileSync(resolve(process.cwd(), 'tools/manifest.json'), 'utf8'));

    assert.equal((indexHtml.match(new RegExp(slug, 'g')) || []).length, 1, 'index.html exact-once');
    assert.equal((indexMd.match(new RegExp(slug, 'g')) || []).length, 1, 'index.md exact-once');
    assert.equal(toolsList.filter((entry) => entry.url === url).length, 1, 'tools-list exact-once');
    assert.equal(manifest.tools.filter((entry) => entry.slug === slug && entry.url === url).length, 1, 'manifest exact-once');
  });
});
