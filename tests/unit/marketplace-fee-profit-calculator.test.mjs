import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const require = createRequire(import.meta.url);
const calc = require('../../tools/marketplace-fee-profit-calculator/calculator.js');

function approx(actual, expected, tolerance = 0.000001) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} ≈ ${expected} (±${tolerance})`);
}

describe('marketplace fee profit calculator', () => {
  it('tc_mfpc_01 default baseline scenario remains deterministic', () => {
    const { result, error } = calc.calculate(calc.DEFAULT_INPUTS);

    assert.equal(error, '');
    approx(result.marketFee, 5440);
    approx(result.paymentFee, 1464);
    approx(result.feeBurden, 6904);
    approx(result.expectedRevenue, 39480);
    approx(result.expectedReturnLoss, 270);
    approx(result.baseCost, 21000);
    approx(result.expectedProfit, 11306);
    approx(result.expectedMargin, 26.919048, 0.00001);
    approx(result.breakEvenPrice, 27652.284264, 0.00001);
    approx(result.targetPrice, 34153.605016, 0.00001);
    approx(result.kFactor, 0.788);
  });

  it('tc_mfpc_02 alternate healthy scenario computes correct values', () => {
    const { result, error } = calc.calculate({
      price: 25000,
      cogs: 10000,
      shipping: 2500,
      adSpend: 1800,
      marketRate: 10,
      marketFixed: 200,
      paymentRate: 2.9,
      paymentFixed: 100,
      returnRate: 2,
      returnLoss: 3000,
      targetMargin: 12,
    });

    assert.equal(error, '');
    approx(result.feeBurden, 3525);
    approx(result.expectedProfit, 6615);
    approx(result.expectedMargin, 26.46, 0.00001);
    approx(result.breakEvenPrice, 17226.792009, 0.00001);
    approx(result.targetPrice, 20054.719562, 0.00001);
  });

  it('tc_mfpc_03 validation rejects invalid inputs', () => {
    const invalidCases = [
      { price: 0 },
      { price: 10000, cogs: -1 },
      { price: 10000, marketRate: 100 },
      { price: 10000, paymentRate: 100 },
      { price: 10000, returnRate: 100 },
      { price: 10000, targetMargin: 95 },
    ];

    invalidCases.forEach((input) => {
      const { result, error } = calc.calculate(input);
      assert.equal(result, null);
      assert.notEqual(error, '');
    });
  });

  it('tc_mfpc_04 impossible break-even state returns user-facing error', () => {
    const { result, error } = calc.calculate({
      price: 10000,
      cogs: 3000,
      shipping: 1000,
      adSpend: 0,
      marketRate: 45,
      marketFixed: 500,
      paymentRate: 40,
      paymentFixed: 500,
      returnRate: 20,
      returnLoss: 1000,
      targetMargin: 10,
    });

    assert.equal(result, null);
    assert.match(error, /손익분기 계산이 불가능합니다/);
  });

  it('tc_mfpc_05 impossible target margin returns user-facing error', () => {
    const { result, error } = calc.calculate({
      price: 10000,
      cogs: 1000,
      shipping: 1000,
      adSpend: 500,
      marketRate: 10,
      marketFixed: 0,
      paymentRate: 5,
      paymentFixed: 0,
      returnRate: 10,
      returnLoss: 0,
      targetMargin: 80,
    });

    assert.equal(result, null);
    assert.match(error, /목표 마진이 너무 높아/);
  });

  it('tc_mfpc_06 summary contains decision-ready fields', () => {
    const { result, error } = calc.calculate(calc.DEFAULT_INPUTS);
    assert.equal(error, '');
    assert.match(result.summary, /\[Marketplace Fee Profit 요약\]/);
    assert.match(result.summary, /기대 실현매출\/주문:/);
    assert.match(result.summary, /기대 순이익\/주문:/);
    assert.match(result.summary, /기대 순마진:/);
    assert.match(result.summary, /주문당 총 수수료 부담:/);
    assert.match(result.summary, /손익분기 판매가:/);
    assert.match(result.summary, /목표 마진\(15.0%\) 판매가:/);
  });

  it('tc_mfpc_07 html scaffold has required anchors', () => {
    const html = readFileSync(resolve(process.cwd(), 'tools/marketplace-fee-profit-calculator/index.html'), 'utf8');
    for (const token of [
      'id="price"',
      'id="targetMargin"',
      'id="summary"',
      '/assets/analytics.js',
      './calculator.js',
    ]) {
      assert.ok(html.includes(token), token);
    }
    assert.ok(!html.includes('const refs = {'), 'inline calculator script should be removed');
  });

  it('tc_mfpc_08 catalog wiring remains exact-once', () => {
    const slug = 'marketplace-fee-profit-calculator';
    const url = `/tools/${slug}/`;
    const indexHtml = readFileSync(resolve(process.cwd(), 'tools/index.html'), 'utf8');
    const indexMd = readFileSync(resolve(process.cwd(), 'tools/index.md'), 'utf8');
    const toolsList = JSON.parse(readFileSync(resolve(process.cwd(), '_data/tools-list.json'), 'utf8'));
    const manifest = JSON.parse(readFileSync(resolve(process.cwd(), 'tools/manifest.json'), 'utf8'));

    assert.equal((indexHtml.match(/href="marketplace-fee-profit-calculator\//g) || []).length, 1, 'index.html exact-once');
    assert.equal((indexMd.match(/\]\(\.\/marketplace-fee-profit-calculator\/\)/g) || []).length, 1, 'index.md exact-once');
    assert.equal(toolsList.filter((entry) => entry.url === url).length, 1, 'tools-list exact-once');
    assert.equal(manifest.tools.filter((entry) => entry.slug === slug && entry.url === url).length, 1, 'manifest exact-once');
  });
});
