/**
 * Node test suite for App Store SBP Calculator
 * Run: node --test calculator.test.js
 */
const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const { compute } = require("./calculator.js");

const MONTH_JAN = 0;
const MONTH_JUN = 5;
const MONTH_OCT = 9;

/* ── Fixture 1: Below threshold ──────────────────────────────────── */
describe("below threshold", () => {
  test("eligible when prior and current both under 1M", () => {
    const r = compute({
      priorYearProceedsUsd: 400_000,
      priorYearAssociatedUsd: 100_000,
      currentYearProceedsUsd: 200_000,
      currentYearAssociatedUsd: 50_000,
      monthlyForecastUsd: 20_000,
      currentMonthIndex: MONTH_JUN,
    });
    assert.equal(r.eligiblePriorYear, true);
    assert.equal(r.eligibleNow, true);
    assert.equal(r.state, "eligible");
    assert.ok(r.remainingRunway > 0);
    assert.ok(r.commissionDelta >= 0);
  });

  test("commission delta equals 15% savings on current proceeds", () => {
    const r = compute({
      priorYearProceedsUsd: 300_000,
      priorYearAssociatedUsd: 0,
      currentYearProceedsUsd: 600_000,
      currentYearAssociatedUsd: 0,
      monthlyForecastUsd: 0,
      currentMonthIndex: MONTH_OCT,
    });
    // delta = 600000 * (0.30 - 0.15) = 90000
    assert.equal(r.commissionDelta, 90_000);
    assert.equal(r.state, "eligible");
  });
});

/* ── Fixture 2: Exactly at threshold ─────────────────────────────── */
describe("exactly at threshold", () => {
  test("still eligible when currentYearTotal == threshold", () => {
    const r = compute({
      priorYearProceedsUsd: 900_000,
      priorYearAssociatedUsd: 0,
      currentYearProceedsUsd: 1_000_000,
      currentYearAssociatedUsd: 0,
      monthlyForecastUsd: 0,
      currentMonthIndex: MONTH_OCT,
    });
    // priorYearTotal = 900k <= 1M → eligible prior year
    // currentYearTotal = 1M <= 1M → eligible now
    assert.equal(r.eligibleNow, true);
    assert.equal(r.remainingRunway, 0);
  });

  test("prior year exactly at threshold still qualifies", () => {
    const r = compute({
      priorYearProceedsUsd: 1_000_000,
      priorYearAssociatedUsd: 0,
      currentYearProceedsUsd: 500_000,
      currentYearAssociatedUsd: 0,
      monthlyForecastUsd: 0,
      currentMonthIndex: MONTH_JAN,
    });
    assert.equal(r.eligiblePriorYear, true);
    assert.equal(r.eligibleNow, true);
  });
});

/* ── Fixture 3: Forecasted threshold cross ────────────────────────── */
describe("forecasted threshold cross", () => {
  test("crossMonth is set when monthly forecast pushes over threshold", () => {
    const r = compute({
      priorYearProceedsUsd: 500_000,
      priorYearAssociatedUsd: 0,
      currentYearProceedsUsd: 900_000,
      currentYearAssociatedUsd: 0,
      monthlyForecastUsd: 60_000,       // 900k + 60k = 960k (ok), +60k = 1.02M → crosses
      currentMonthIndex: MONTH_JAN,     // still 10 months left
    });
    assert.equal(r.eligibleNow, true);
    assert.notEqual(r.crossMonth, null);
    assert.equal(r.state, "forecast_cross");
  });

  test("no crossMonth when forecast never reaches threshold", () => {
    const r = compute({
      priorYearProceedsUsd: 200_000,
      priorYearAssociatedUsd: 0,
      currentYearProceedsUsd: 100_000,
      currentYearAssociatedUsd: 0,
      monthlyForecastUsd: 10_000,
      currentMonthIndex: MONTH_OCT,    // only 2 months left: 100k + 20k = 120k
    });
    assert.equal(r.crossMonth, null);
    assert.equal(r.state, "eligible");
  });
});

/* ── Fixture 4: Associated-account push-over ──────────────────────── */
describe("associated-account threshold breach", () => {
  test("associated proceeds push currentYearTotal over threshold → over_threshold", () => {
    const r = compute({
      priorYearProceedsUsd: 400_000,
      priorYearAssociatedUsd: 0,
      currentYearProceedsUsd: 800_000,
      currentYearAssociatedUsd: 300_000,  // 800k + 300k = 1.1M > 1M
      monthlyForecastUsd: 0,
      currentMonthIndex: MONTH_JUN,
    });
    assert.equal(r.currentYearTotal, 1_100_000);
    assert.equal(r.eligibleNow, false);
    assert.equal(r.state, "over_threshold");
  });

  test("associated prior-year proceeds push total over threshold → not eligible", () => {
    const r = compute({
      priorYearProceedsUsd: 700_000,
      priorYearAssociatedUsd: 400_000,   // total = 1.1M > 1M
      currentYearProceedsUsd: 200_000,
      currentYearAssociatedUsd: 0,
      monthlyForecastUsd: 0,
      currentMonthIndex: MONTH_JUN,
    });
    assert.equal(r.eligiblePriorYear, false);
    assert.equal(r.eligibleNow, false);
    assert.equal(r.state, "over_threshold");
  });

  test("near_cap state fires within warning buffer", () => {
    const r = compute({
      priorYearProceedsUsd: 300_000,
      priorYearAssociatedUsd: 0,
      currentYearProceedsUsd: 970_000,
      currentYearAssociatedUsd: 0,
      monthlyForecastUsd: 0,
      warningBufferUsd: 50_000,
      currentMonthIndex: MONTH_JUN,
    });
    // runway = 1M - 970k = 30k < 50k buffer
    assert.equal(r.nearCap, true);
    assert.equal(r.state, "near_cap");
  });
});
