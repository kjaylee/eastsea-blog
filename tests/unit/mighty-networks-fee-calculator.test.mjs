import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const require = createRequire(import.meta.url);
const calc = require('../../tools/mighty-networks-fee-calculator/calculator.js');

function approx(actual, expected, tolerance = 0.000001) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} ≈ ${expected} (±${tolerance})`);
}

describe('mighty networks fee calculator', () => {
  it('tc_mighty_01 baseline launch-dominant scenario is profitable', () => {
    const result = calc.compute(calc.DEFAULT_INPUTS);

    assert.equal(result.bestPlan.planId, 'launch');
    approx(result.bestPlan.netProfit, 4911, 0.00001);
    approx(result.bestPlan.takeHomeAfterPlatform, 5411, 0.00001);
    approx(result.bestPlan.effectiveFeeRatePct, 6.8166666667, 0.00001);
    approx(result.bestPlan.breakEvenGross, 632.7868852459, 0.00001);
    approx(result.bestPlan.requiredGrossForTargetNet, 2272.131147541, 0.00001);
    assert.match(result.summary, /Mighty Networks Fee Calculator Summary/);
  });

  it('tc_mighty_02 scale becomes best past launch-to-scale crossover', () => {
    const result = calc.compute({
      ...calc.DEFAULT_INPUTS,
      monthlyGrossSales: 12000
    });

    assert.equal(result.bestPlan.planId, 'scale');
    assert.ok(result.plans.find((plan) => plan.planId === 'scale').netProfit > result.plans.find((plan) => plan.planId === 'launch').netProfit);
  });

  it('tc_mighty_03 growth becomes best past scale-to-growth crossover', () => {
    const result = calc.compute({
      ...calc.DEFAULT_INPUTS,
      monthlyGrossSales: 40000
    });

    assert.equal(result.bestPlan.planId, 'growth');
    assert.ok(result.plans.find((plan) => plan.planId === 'growth').netProfit > result.plans.find((plan) => plan.planId === 'scale').netProfit);
  });

  it('tc_mighty_04 upgrade thresholds are pinned to public plan math', () => {
    const thresholds = calc.getUpgradeThresholds();

    approx(thresholds.launchToScaleGross, 10000, 0.00001);
    approx(thresholds.scaleToGrowthGross, 35000, 0.00001);
    approx(thresholds.launchToGrowthGross, 18333.333333333336, 0.00001);
  });

  it('tc_mighty_05 validation rejects impossible values', () => {
    assert.match(calc.validateInput({ ...calc.DEFAULT_INPUTS, monthlyGrossSales: 0 }), /Monthly gross sales/);
    assert.match(calc.validateInput({ ...calc.DEFAULT_INPUTS, successfulCharges: 0 }), /Successful charges/);
    assert.match(calc.validateInput({ ...calc.DEFAULT_INPUTS, refundRatePct: 100 }), /Refund rate/);
    assert.match(calc.validateInput({ ...calc.DEFAULT_INPUTS, processorRatePct: -1 }), /Processor fee rate/);
    assert.match(calc.validateInput({ ...calc.DEFAULT_INPUTS, processorFlatFee: -0.01 }), /Processor flat fee/);
  });

  it('tc_mighty_06 target gross remains above break-even gross', () => {
    const result = calc.compute(calc.DEFAULT_INPUTS);

    for (const plan of result.plans) {
      assert.ok(plan.requiredGrossForTargetNet > plan.breakEvenGross, `${plan.planName} target gross should exceed break-even gross`);
    }
  });

  it('tc_mighty_07 html scaffold includes required anchors', () => {
    const html = readFileSync(resolve(process.cwd(), 'tools/mighty-networks-fee-calculator/index.html'), 'utf8');
    for (const token of [
      'id="monthlyGrossSales"',
      'id="bestPlan"',
      'id="summary"',
      '/assets/analytics.js',
      './calculator.js',
      './app.js'
    ]) {
      assert.ok(html.includes(token), token);
    }
  });

  it('tc_mighty_08 catalog wiring remains exact-once', () => {
    const slug = 'mighty-networks-fee-calculator';
    const url = `/tools/${slug}/`;
    const indexHtml = readFileSync(resolve(process.cwd(), 'tools/index.html'), 'utf8');
    const indexMd = readFileSync(resolve(process.cwd(), 'tools/index.md'), 'utf8');
    const toolsList = JSON.parse(readFileSync(resolve(process.cwd(), '_data/tools-list.json'), 'utf8'));
    const manifest = JSON.parse(readFileSync(resolve(process.cwd(), 'tools/manifest.json'), 'utf8'));

    assert.equal((indexHtml.match(/href="mighty-networks-fee-calculator\//g) || []).length, 1, 'index.html exact-once');
    assert.equal((indexMd.match(/\]\(\.\/mighty-networks-fee-calculator\/\)/g) || []).length, 1, 'index.md exact-once');
    assert.equal(toolsList.filter((entry) => entry.url === url).length, 1, 'tools-list exact-once');
    assert.equal(manifest.tools.filter((entry) => entry.slug === slug && entry.url === url).length, 1, 'manifest exact-once');
  });
});
