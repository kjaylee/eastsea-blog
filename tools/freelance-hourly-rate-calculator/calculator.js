// TESTABLE_COMPUTE_START
function computeFreelanceRate({
  desired_income,
  annual_expenses,
  tax_rate,
  work_weeks,
  billable_hours_week,
  hours_per_day,
  buffer_pct
}) {
  if (!desired_income || desired_income <= 0) return { error: 'Enter a valid income target' };
  if (!work_weeks || work_weeks < 1) return { error: 'Work weeks must be at least 1' };

  const tax_frac = tax_rate / 100;
  const annual_gross_raw = (desired_income + annual_expenses) / (1 - tax_frac);
  const annual_gross = Math.round(annual_gross_raw);
  const billable_hours_year = work_weeks * billable_hours_week;
  const base_rate = Math.round((annual_gross_raw / billable_hours_year) * 100) / 100;
  const recommended_rate = Math.round(base_rate * (1 + buffer_pct / 100) * 100) / 100;
  const day_rate = Math.round(recommended_rate * hours_per_day * 100) / 100;
  const monthly_revenue = Math.round((annual_gross / 12) * 100) / 100;

  const warnings = [];
  if (billable_hours_week > 45) warnings.push('High utilization — admin time may be squeezed');
  if (tax_rate > 50) warnings.push('Verify with a tax professional');
  if (base_rate < 20) warnings.push('Rate may be below minimum wage in some regions');

  return {
    annual_gross,
    billable_hours_year: Math.round(billable_hours_year),
    base_rate,
    recommended_rate,
    day_rate,
    monthly_revenue,
    warnings
  };
}
// TESTABLE_COMPUTE_END

const DEFAULTS = {
  desired_income: 60000,
  annual_expenses: 5000,
  tax_rate: 30,
  work_weeks: 48,
  billable_hours_week: 25,
  hours_per_day: 8,
  buffer_pct: 20
};

if (typeof module !== 'undefined') module.exports = { computeFreelanceRate, DEFAULTS };
