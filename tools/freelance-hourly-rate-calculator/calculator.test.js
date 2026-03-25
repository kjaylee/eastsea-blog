const { test } = require('node:test');
const assert = require('node:assert/strict');
const { computeFreelanceRate, DEFAULTS } = require('./calculator.js');

test('TC-14: default inputs produce expected outputs', () => {
  const r = computeFreelanceRate({
    desired_income: 60000, annual_expenses: 5000, tax_rate: 30,
    work_weeks: 48, billable_hours_week: 25, hours_per_day: 8, buffer_pct: 20
  });
  assert.equal(r.annual_gross, 92857, `annual_gross: ${r.annual_gross}`);
  assert.equal(r.billable_hours_year, 1200);
  assert.equal(r.base_rate, 77.38, `base_rate: ${r.base_rate}`);
  assert.equal(r.recommended_rate, 92.86, `recommended_rate: ${r.recommended_rate}`);
  assert.equal(r.monthly_revenue, 7738.08, `monthly_revenue: ${r.monthly_revenue}`);
});

test('TC-15: high-income scenario', () => {
  const r = computeFreelanceRate({
    desired_income: 120000, annual_expenses: 15000, tax_rate: 35,
    work_weeks: 46, billable_hours_week: 30, hours_per_day: 8, buffer_pct: 25
  });
  assert.equal(r.annual_gross, 207692, `annual_gross: ${r.annual_gross}`);
  assert.equal(r.base_rate, 150.5, `base_rate: ${r.base_rate}`);
});

test('TC-16: zero buffer means base_rate equals recommended_rate', () => {
  const r = computeFreelanceRate({
    desired_income: 60000, annual_expenses: 5000, tax_rate: 30,
    work_weeks: 48, billable_hours_week: 25, hours_per_day: 8, buffer_pct: 0
  });
  assert.equal(r.base_rate, r.recommended_rate, `With 0% buffer, base==recommended: ${JSON.stringify(r)}`);
});

test('DEFAULTS export has expected keys', () => {
  const keys = ['desired_income', 'annual_expenses', 'tax_rate', 'work_weeks', 'billable_hours_week', 'hours_per_day', 'buffer_pct'];
  for (const k of keys) assert.ok(k in DEFAULTS, `Missing default: ${k}`);
  assert.equal(DEFAULTS.desired_income, 60000);
  assert.equal(DEFAULTS.tax_rate, 30);
  assert.equal(DEFAULTS.buffer_pct, 20);
});

test('invalid income returns error', () => {
  const r = computeFreelanceRate({
    desired_income: 0, annual_expenses: 5000, tax_rate: 30,
    work_weeks: 48, billable_hours_week: 25, hours_per_day: 8, buffer_pct: 20
  });
  assert.ok(r.error, 'Expected error for zero income');
});

test('invalid work_weeks returns error', () => {
  const r = computeFreelanceRate({
    desired_income: 60000, annual_expenses: 5000, tax_rate: 30,
    work_weeks: 0, billable_hours_week: 25, hours_per_day: 8, buffer_pct: 20
  });
  assert.ok(r.error, 'Expected error for zero work_weeks');
});

test('high utilization warning fires above 45h/wk', () => {
  const r = computeFreelanceRate({
    desired_income: 60000, annual_expenses: 5000, tax_rate: 30,
    work_weeks: 48, billable_hours_week: 50, hours_per_day: 8, buffer_pct: 20
  });
  assert.ok(r.warnings.some(w => w.includes('utilization')), 'Expected utilization warning');
});

test('day_rate equals recommended_rate times hours_per_day', () => {
  const r = computeFreelanceRate({
    desired_income: 60000, annual_expenses: 5000, tax_rate: 30,
    work_weeks: 48, billable_hours_week: 25, hours_per_day: 8, buffer_pct: 20
  });
  assert.equal(r.day_rate, Math.round(r.recommended_rate * 8 * 100) / 100);
});
