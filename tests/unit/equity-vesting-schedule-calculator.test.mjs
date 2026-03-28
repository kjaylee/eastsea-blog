import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_INPUT,
  validateInputs,
  calculateVestingSchedule,
  buildSummary,
  buildCsv,
} from '../../tools/equity-vesting-schedule-calculator/logic.mjs';

describe('equity vesting schedule calculator logic', () => {
  it('tc_l1_validation_rejects_non_positive_units', () => {
    const validation = validateInputs({
      ...DEFAULT_INPUT,
      totalUnits: 0,
    });

    assert.equal(validation.valid, false);
    assert.match(validation.message, /totalUnits/);
  });

  it('tc_l2_reference_case_matches_standard_four_year_schedule', () => {
    const result = calculateVestingSchedule({
      totalUnits: 4800,
      startDate: '2024-01-01',
      totalMonths: 48,
      cliffMonths: 12,
      vestingCadence: 'Monthly',
      unitLabel: 'Shares',
    });

    assert.equal(result.firstVestingDate, '2025-01-01');
    assert.equal(result.cliffVestingUnits, 1200);
    assert.equal(result.lastVestingDate, '2028-01-01');
    assert.equal(result.totalEvents, 37);
    assert.equal(result.schedule[1].vestedThisEvent, 100);
    assert.equal(result.schedule[result.schedule.length - 1].cumulativeVested, 4800);
  });

  it('tc_l3_zero_cliff_quarterly_schedule_respects_month_end_adjustment', () => {
    const result = calculateVestingSchedule({
      totalUnits: 1000,
      startDate: '2024-01-31',
      totalMonths: 12,
      cliffMonths: 0,
      vestingCadence: 'Quarterly',
      unitLabel: 'Options',
    });

    assert.equal(result.firstVestingDate, '2024-04-30');
    assert.equal(result.lastVestingDate, '2025-01-31');
    assert.equal(result.totalEvents, 4);
    assert.deepEqual(result.schedule.map((event) => event.vestedThisEvent), [250, 250, 250, 250]);
  });

  it('tc_l4_full_cliff_vests_all_units_once', () => {
    const result = calculateVestingSchedule({
      totalUnits: 1200,
      startDate: '2024-06-15',
      totalMonths: 12,
      cliffMonths: 12,
      vestingCadence: 'Monthly',
      unitLabel: 'RSUs',
    });

    assert.equal(result.firstVestingDate, '2025-06-15');
    assert.equal(result.lastVestingDate, '2025-06-15');
    assert.equal(result.totalEvents, 1);
    assert.equal(result.schedule[0].vestedThisEvent, 1200);
  });

  it('tc_l5_partial_cliff_schedule_allocates_linear_events_after_cliff', () => {
    const result = calculateVestingSchedule({
      totalUnits: 1000,
      startDate: '2024-01-10',
      totalMonths: 10,
      cliffMonths: 3,
      vestingCadence: 'Monthly',
      unitLabel: 'Shares',
    });

    assert.equal(result.firstVestingDate, '2024-04-10');
    assert.equal(result.schedule[0].vestedThisEvent, 300);
    assert.equal(result.schedule.length, 8);
    assert.equal(result.schedule[result.schedule.length - 1].date, '2024-11-10');
    assert.equal(result.schedule[result.schedule.length - 1].cumulativeVested, 1000);
  });

  it('tc_l6_rounding_case_keeps_total_exact', () => {
    const result = calculateVestingSchedule({
      totalUnits: 100,
      startDate: '2024-02-15',
      totalMonths: 6,
      cliffMonths: 0,
      vestingCadence: 'Monthly',
      unitLabel: 'Shares',
    });

    const sum = result.schedule.reduce((total, event) => total + event.vestedThisEvent, 0);

    assert.equal(result.schedule.length, 6);
    assert.ok(Math.abs(sum - 100) < 1e-8);
    assert.equal(result.schedule[result.schedule.length - 1].cumulativeVested, 100);
  });

  it('tc_l7_summary_and_csv_include_key_fields', () => {
    const result = calculateVestingSchedule(DEFAULT_INPUT);
    const summary = buildSummary(result);
    const csv = buildCsv(result);

    assert.match(summary, /Equity Vesting Schedule/);
    assert.match(summary, /First Vesting Date/);
    assert.match(csv, /Date,Months Since Start/);
    assert.match(csv, /2025-01-01/);
  });
});
