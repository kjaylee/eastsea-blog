import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const require = createRequire(import.meta.url);
const calc = require('../../tools/chargeback-rate-threshold-calculator/calculator.js');

function approx(actual, expected, tolerance = 0.000001) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} ≈ ${expected} (±${tolerance})`);
}

describe('chargeback rate threshold calculator', () => {
  it('tc_crt_01 default baseline stays below monitored ratio and count thresholds', () => {
    const result = calc.compute(calc.DEFAULT_INPUTS);

    approx(result.sameMonthRatePct, 0.7083333333, 0.00001);
    approx(result.laggedRatePct, 0.7727272727, 0.00001);
    approx(result.grossDisputedVolume, 6970, 0.00001);
    approx(result.unrecoveredDisputedVolume, 5018.4, 0.00001);
    approx(result.feeBurn, 1275, 0.00001);
    approx(result.monthlyExposure, 6293.4, 0.00001);
    approx(result.annualizedExposure, 75520.8, 0.00001);
    assert.equal(result.maxDisputesMonitoredCurrent, 120);
    assert.equal(result.maxDisputesMonitoredLagged, 110);
    assert.equal(result.headroomMonitoredCurrent, 35);
    assert.equal(result.headroomMonitoredLagged, 25);
    assert.equal(result.countHeadroom, 15);
    assert.equal(result.statusKey, 'safe');
  });

  it('tc_crt_02 monitored ratio breach returns ratio warning even before excessive band', () => {
    const result = calc.compute({
      ...calc.DEFAULT_INPUTS,
      chargebacks: 125,
      transactionsCurrent: 10000,
      transactionsPrevious: 10000,
      monitoredCountThreshold: 200
    });

    approx(result.sameMonthRatePct, 1.25, 0.00001);
    assert.equal(result.statusKey, 'ratio');
    assert.equal(result.headroomMonitoredCurrent, -25);
  });

  it('tc_crt_03 excessive breach takes priority over monitored and count warnings', () => {
    const result = calc.compute({
      ...calc.DEFAULT_INPUTS,
      chargebacks: 190,
      transactionsCurrent: 10000,
      transactionsPrevious: 10000
    });

    approx(result.sameMonthRatePct, 1.9, 0.00001);
    assert.equal(result.statusKey, 'excessive');
    assert.equal(result.headroomExcessiveCurrent, -40);
  });

  it('tc_crt_04 count-only breach is detected when ratios remain low', () => {
    const result = calc.compute({
      ...calc.DEFAULT_INPUTS,
      chargebacks: 105,
      transactionsCurrent: 20000,
      transactionsPrevious: 20000
    });

    approx(result.sameMonthRatePct, 0.525, 0.00001);
    assert.equal(result.statusKey, 'count');
    assert.equal(result.countHeadroom, -5);
  });

  it('tc_crt_05 validation rejects impossible thresholds and denominators', () => {
    assert.match(calc.validateInput({ ...calc.DEFAULT_INPUTS, transactionsCurrent: 0 }), /Current-month card transactions/);
    assert.match(calc.validateInput({ ...calc.DEFAULT_INPUTS, transactionsPrevious: 0 }), /Previous-month card transactions/);
    assert.match(calc.validateInput({ ...calc.DEFAULT_INPUTS, recoveryRate: 120 }), /Recovery rate/);
    assert.match(calc.validateInput({ ...calc.DEFAULT_INPUTS, monitoredRatePct: 0 }), /Monitored threshold/);
    assert.match(calc.validateInput({ ...calc.DEFAULT_INPUTS, excessiveRatePct: 1 }), /Excessive threshold/);
  });

  it('tc_crt_06 summary is operator-ready', () => {
    const result = calc.compute(calc.DEFAULT_INPUTS);
    assert.match(result.summary, /Chargeback Threshold Summary/);
    assert.match(result.summary, /Same-month ratio:/);
    assert.match(result.summary, /Lagged ratio:/);
    assert.match(result.summary, /Monthly exposure:/);
    assert.match(result.summary, /Annualized exposure:/);
    assert.match(result.summary, /Status:/);
  });

  it('tc_crt_07 html scaffold includes required anchors', () => {
    const html = readFileSync(resolve(process.cwd(), 'tools/chargeback-rate-threshold-calculator/index.html'), 'utf8');
    for (const token of [
      'id="chargebacks"',
      'id="sameMonthRatePct"',
      'id="summary"',
      '/assets/analytics.js',
      './calculator.js',
      './app.js'
    ]) {
      assert.ok(html.includes(token), token);
    }
  });

  it('tc_crt_08 catalog wiring remains exact-once', () => {
    const slug = 'chargeback-rate-threshold-calculator';
    const url = `/tools/${slug}/`;
    const indexHtml = readFileSync(resolve(process.cwd(), 'tools/index.html'), 'utf8');
    const indexMd = readFileSync(resolve(process.cwd(), 'tools/index.md'), 'utf8');
    const toolsList = JSON.parse(readFileSync(resolve(process.cwd(), '_data/tools-list.json'), 'utf8'));
    const manifest = JSON.parse(readFileSync(resolve(process.cwd(), 'tools/manifest.json'), 'utf8'));

    assert.equal((indexHtml.match(/href="chargeback-rate-threshold-calculator\//g) || []).length, 1, 'index.html exact-once');
    assert.equal((indexMd.match(/\]\(\.\/chargeback-rate-threshold-calculator\/\)/g) || []).length, 1, 'index.md exact-once');
    assert.equal(toolsList.filter((entry) => entry.url === url).length, 1, 'tools-list exact-once');
    assert.equal(manifest.tools.filter((entry) => entry.slug === slug && entry.url === url).length, 1, 'manifest exact-once');
  });
});
