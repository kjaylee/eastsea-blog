'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  DEFAULTS,
  FIXED_FEE_ASSUMPTION,
  calculate,
  computeScenario,
  validateInput,
} = require('./calculator.js');

function approx(actual, expected, tolerance = 0.01) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} ≈ ${expected} (±${tolerance})`);
}

test('TC-ILF-00 exports defaults and assumption note', () => {
  assert.equal(DEFAULTS.amount, 5500000);
  assert.equal(DEFAULTS.daysLate, 26);
  assert.match(FIXED_FEE_ASSUMPTION, /유예기간 이후 최초 1회/);
});

test('TC-ILF-01 baseline default case', () => {
  const { result, error } = calculate(DEFAULTS);

  assert.equal(error, '');
  assert.equal(result.billableDays, 23);
  approx(result.dailyInterest, 1808.2191780821917, 0.0001);
  approx(result.lateInterest, 41589.04109589041, 0.0001);
  approx(result.feeWithTax, 110000, 0.0001);
  approx(result.totalDue, 5651589.041095891, 0.0001);
  approx(result.burdenRate, 2.7561643835616464, 0.0001);
  assert.equal(result.status.tone, 'mid');
});

test('TC-ILF-02 grace period blocks both interest and fixed fee', () => {
  const { result, error } = calculate({ ...DEFAULTS, daysLate: 2, grace: 3 });

  assert.equal(error, '');
  assert.equal(result.billableDays, 0);
  approx(result.lateInterest, 0);
  approx(result.feeWithTax, 0);
  approx(result.totalDue, DEFAULTS.amount);
  approx(result.burdenRate, 0);
  assert.equal(result.status.tone, 'up');
});

test('TC-ILF-03 invalid negative amount rejected', () => {
  const validation = validateInput({ ...DEFAULTS, amount: -1 });
  assert.equal(validation.ok, false);
  assert.match(validation.error, /원청구 금액/);

  const { result, error } = calculate({ ...DEFAULTS, amount: -1 });
  assert.equal(result, null);
  assert.match(error, /원청구 금액/);
});

test('TC-ILF-04 scenario override recalculates independently', () => {
  const base = computeScenario(DEFAULTS);
  const scenario90 = computeScenario(DEFAULTS, 90);

  assert.ok(scenario90.lateInterest > base.lateInterest);
  assert.ok(scenario90.totalDue > base.totalDue);
  assert.equal(scenario90.billableDays, 87);
});

test('TC-ILF-05 summary text includes decision-ready outputs', () => {
  const { result, error } = calculate(DEFAULTS);

  assert.equal(error, '');
  for (const token of [
    '[인보이스 연체료 요약]',
    '가정: ' + FIXED_FEE_ASSUMPTION,
    '원청구 금액:',
    '현재 연체일수:',
    '연체이율:',
    '누적 연체이자:',
    '연체수수료(부가세 포함):',
    '최종 청구금액:',
  ]) {
    assert.match(result.summary, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

test('TC-ILF-06 HTML scaffold anchors', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

  for (const token of [
    'Invoice Late Fee Calculator | 인보이스 연체료 계산기',
    'script src="./calculator.js"',
    '고정 연체수수료는 유예기간 이후 최초 1회 발생 가정',
    'scenarioBody',
    '/assets/analytics.js',
  ]) {
    assert.ok(html.includes(token), token);
  }
});

test('TC-ILF-07 catalog exact-once', () => {
  const root = path.join(__dirname, '..', '..');
  const slug = 'invoice-late-fee-calculator';
  const url = `/tools/${slug}/`;

  const toolsList = JSON.parse(fs.readFileSync(path.join(root, '_data', 'tools-list.json'), 'utf8'));
  const indexMd = fs.readFileSync(path.join(root, 'tools', 'index.md'), 'utf8');
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'manifest.json'), 'utf8'));

  assert.equal(toolsList.filter((entry) => entry.url === url).length, 1, 'tools-list exact-once');
  assert.equal((indexMd.match(new RegExp(`\\./${slug}/`, 'g')) || []).length, 1, 'index.md exact-once');
  assert.equal(manifest.tools.filter((entry) => entry.slug === slug && entry.url === url).length, 1, 'manifest exact-once');
});
