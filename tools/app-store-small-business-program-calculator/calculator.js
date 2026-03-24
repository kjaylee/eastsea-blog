/**
 * App Store Small Business Program Calculator — Pure Logic Module
 * All monetary values are USD proceeds (after Apple commission/tax adjustments).
 * This is a client-side estimate; it does not replace Apple's official statements.
 */

/* ── Constants ──────────────────────────────────────────────────── */
const SBP_THRESHOLD = 1_000_000;   // USD
const REDUCED_RATE  = 0.15;
const STANDARD_RATE = 0.30;
const WARNING_BUFFER = 50_000;      // USD — "near cap" zone

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

/* ── Core formula ───────────────────────────────────────────────── */
/**
 * @param {object} inputs
 * @param {number} inputs.priorYearProceedsUsd
 * @param {number} inputs.priorYearAssociatedUsd
 * @param {number} inputs.currentYearProceedsUsd
 * @param {number} inputs.currentYearAssociatedUsd
 * @param {number} inputs.monthlyForecastUsd   — expected proceeds/month for remaining months
 * @param {number} [inputs.warningBufferUsd]   — default 50000
 * @param {number} [inputs.thresholdUsd]       — default 1000000
 * @param {number} [inputs.reducedRate]        — default 0.15
 * @param {number} [inputs.standardRate]       — default 0.30
 * @param {number} [inputs.currentMonthIndex]  — 0-based (0=Jan … 11=Dec); default from Date
 * @returns {object} result
 */
function compute(inputs) {
  const {
    priorYearProceedsUsd   = 0,
    priorYearAssociatedUsd = 0,
    currentYearProceedsUsd = 0,
    currentYearAssociatedUsd = 0,
    monthlyForecastUsd     = 0,
    warningBufferUsd       = WARNING_BUFFER,
    thresholdUsd           = SBP_THRESHOLD,
    reducedRate            = REDUCED_RATE,
    standardRate           = STANDARD_RATE,
    currentMonthIndex      = new Date().getMonth(),  // 0-based
  } = inputs;

  /* ── Eligibility ───────────────────────────────────────────────── */
  const priorYearTotal   = priorYearProceedsUsd + priorYearAssociatedUsd;
  const currentYearTotal = currentYearProceedsUsd + currentYearAssociatedUsd;

  const eligiblePriorYear = priorYearTotal <= thresholdUsd;
  const eligibleNow       = eligiblePriorYear && (currentYearTotal <= thresholdUsd);

  /* ── Runway ────────────────────────────────────────────────────── */
  const remainingRunway = thresholdUsd - currentYearTotal;          // can be negative
  const nearCap = eligibleNow && remainingRunway <= warningBufferUsd && remainingRunway > 0;

  /* ── Commission delta (current rate vs full-year at each rate) ─── */
  const commissionRate  = eligibleNow ? reducedRate : standardRate;
  const commissionDelta = currentYearTotal * (standardRate - reducedRate);  // savings if SBP eligible

  /* ── Forecast: remaining months (currentMonthIndex is 0=Jan) ───── */
  // months still to run in the year (not counting current month, which is already in currentYearTotal)
  const remainingMonths = Math.max(0, 11 - currentMonthIndex);
  let crossMonth = null;   // name of month where threshold is crossed
  let forecastTotal = currentYearTotal;
  if (eligibleNow && monthlyForecastUsd > 0) {
    for (let i = 0; i < remainingMonths; i++) {
      forecastTotal += monthlyForecastUsd;
      if (forecastTotal > thresholdUsd) {
        crossMonth = MONTHS[currentMonthIndex + 1 + i] ?? "Dec";
        break;
      }
    }
  }

  /* ── State ─────────────────────────────────────────────────────── */
  let state;
  if (!eligiblePriorYear) {
    state = "over_threshold"; // prior year too high → not eligible this year
  } else if (currentYearTotal > thresholdUsd) {
    state = "over_threshold"; // already crossed
  } else if (nearCap) {
    state = "near_cap";
  } else if (crossMonth) {
    state = "forecast_cross";
  } else {
    state = eligibleNow ? "eligible" : "over_threshold";
  }

  /* ── Full-year commission projection ───────────────────────────── */
  const forecastYearTotal = forecastTotal + (crossMonth
    ? 0
    : (eligibleNow ? remainingMonths * monthlyForecastUsd : 0)
  );
  // if crossing happens, proceeds before cross at 15%, remainder at 30%
  const proceedsBeforeCross = crossMonth ? thresholdUsd : currentYearTotal;
  const proceedsAfterCross  = crossMonth ? (forecastTotal - thresholdUsd) : 0;
  const commissionIfEligible   = proceedsBeforeCross * reducedRate + proceedsAfterCross * standardRate;
  const commissionIfStandard   = (proceedsBeforeCross + proceedsAfterCross) * standardRate;
  const projectedSavings       = commissionIfStandard - commissionIfEligible;

  return {
    // raw derived
    priorYearTotal,
    currentYearTotal,
    eligiblePriorYear,
    eligibleNow,
    remainingRunway,
    nearCap,
    commissionRate,
    commissionDelta,
    remainingMonths,
    crossMonth,
    forecastTotal,
    state,
    projectedSavings,
    commissionIfEligible,
    commissionIfStandard,
    // passthrough for display
    thresholdUsd,
    reducedRate,
    standardRate,
    warningBufferUsd,
  };
}

/* ── Export ─────────────────────────────────────────────────────── */
if (typeof module !== "undefined") {
  module.exports = { compute, SBP_THRESHOLD, REDUCED_RATE, STANDARD_RATE, WARNING_BUFFER, MONTHS };
}
