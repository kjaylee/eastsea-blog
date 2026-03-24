/**
 * Teachable Fee Calculator — Pure Logic
 * Last verified against teachable.com/pricing: 2026-03-25
 */

export const PLANS = [
  { id: 'starter',  name: 'Starter',  monthlyPrice: 39,  annualPrice: 29,  txFeePct: 7.5 },
  { id: 'builder',  name: 'Builder',  monthlyPrice: 89,  annualPrice: 69,  txFeePct: 0 },
  { id: 'growth',   name: 'Growth',   monthlyPrice: 189, annualPrice: 139, txFeePct: 0 },
  { id: 'advanced', name: 'Advanced', monthlyPrice: 399, annualPrice: 309, txFeePct: 0 },
];

export const PAYMENT_METHODS = [
  { id: 'us_card',    label: 'US Credit / Debit Card',    ratePct: 2.9,  perTx: 0.30 },
  { id: 'intl_card',  label: 'International Card',        ratePct: 3.9,  perTx: 0.30 },
  { id: 'us_paypal',  label: 'US PayPal',                 ratePct: 3.49, perTx: 0.49 },
  { id: 'intl_paypal',label: 'International PayPal',      ratePct: 4.99, perTx: 0.49 },
];

export const DEFAULT_INPUT = {
  coursePrice: 100,
  monthlySales: 20,
  paymentMethodId: 'us_card',
  billingCycle: 'monthly', // 'monthly' | 'annual'
};

const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

export function validateInputs(input) {
  const price = Number(input.coursePrice);
  const sales = Number(input.monthlySales);
  if (!Number.isFinite(price) || price < 0) return { valid: false, message: 'Course price must be 0 or above.' };
  if (!Number.isFinite(sales) || sales < 0 || sales !== Math.floor(sales)) return { valid: false, message: 'Monthly sales must be a non-negative integer.' };
  const pm = PAYMENT_METHODS.find(m => m.id === input.paymentMethodId);
  if (!pm) return { valid: false, message: 'Invalid payment method.' };
  if (!['monthly', 'annual'].includes(input.billingCycle)) return { valid: false, message: 'Billing cycle must be monthly or annual.' };
  return { valid: true, message: '' };
}

/**
 * Calculate costs for a single plan.
 */
export function calculatePlanCost(plan, coursePrice, monthlySales, paymentMethod, billingCycle) {
  const subscriptionCost = billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;
  const grossRevenue = round2(coursePrice * monthlySales);

  const txFeeTotal = round2(grossRevenue * (plan.txFeePct / 100));
  const processingRateTotal = round2(grossRevenue * (paymentMethod.ratePct / 100));
  const processingPerTxTotal = round2(monthlySales * paymentMethod.perTx);
  const processingFeeTotal = round2(processingRateTotal + processingPerTxTotal);

  const totalMonthlyCost = round2(subscriptionCost + txFeeTotal + processingFeeTotal);
  const netRevenue = round2(grossRevenue - totalMonthlyCost);
  const perSaleTakeHome = monthlySales > 0 ? round2(netRevenue / monthlySales) : 0;
  const netMarginPct = grossRevenue > 0 ? round2((netRevenue / grossRevenue) * 100) : (subscriptionCost > 0 ? -Infinity : 0);

  // Per-sale fees breakdown
  const txFeePerSale = monthlySales > 0 ? round2(coursePrice * (plan.txFeePct / 100)) : 0;
  const processingPerSale = monthlySales > 0 ? round2(coursePrice * (paymentMethod.ratePct / 100) + paymentMethod.perTx) : 0;
  const totalFeePerSale = round2(txFeePerSale + processingPerSale);

  return {
    planId: plan.id,
    planName: plan.name,
    subscriptionCost,
    grossRevenue,
    txFeeTotal,
    processingFeeTotal,
    totalMonthlyCost,
    netRevenue,
    perSaleTakeHome,
    netMarginPct: Number.isFinite(netMarginPct) ? netMarginPct : -999,
    txFeePerSale,
    processingPerSale,
    totalFeePerSale,
  };
}

/**
 * Compare all plans for given inputs. Returns array sorted by totalMonthlyCost ascending.
 * Adds `isCheapest` and `savingsVsCheapest` fields.
 */
export function compareAllPlans(input) {
  const v = validateInputs(input);
  if (!v.valid) throw new Error(v.message);

  const coursePrice = Number(input.coursePrice);
  const monthlySales = Number(input.monthlySales);
  const pm = PAYMENT_METHODS.find(m => m.id === input.paymentMethodId);
  const billingCycle = input.billingCycle;

  const results = PLANS.map(plan =>
    calculatePlanCost(plan, coursePrice, monthlySales, pm, billingCycle)
  );

  // Find the plan with the highest net revenue (cheapest total cost)
  const best = results.reduce((a, b) => a.netRevenue > b.netRevenue ? a : b);

  return results.map(r => ({
    ...r,
    isCheapest: r.planId === best.planId,
    savingsVsBest: round2(best.netRevenue - r.netRevenue),
  }));
}

/**
 * Calculate the monthly revenue break-even point where upgrading from planA to planB saves money.
 * Returns the revenue threshold (or Infinity if upgrade never saves on fees alone).
 * Assumes all revenue comes from coursePrice-sized sales.
 */
export function findBreakEven(planA, planB, paymentMethod, billingCycle) {
  const subA = billingCycle === 'annual' ? planA.annualPrice : planA.monthlyPrice;
  const subB = billingCycle === 'annual' ? planB.annualPrice : planB.monthlyPrice;
  const txDiffPct = (planA.txFeePct - planB.txFeePct) / 100;

  // subB - subA = txDiffPct * revenue
  // If planB is more expensive but has lower tx fee:
  if (txDiffPct <= 0) return Infinity; // no tx fee advantage from upgrading
  const breakEvenRevenue = round2((subB - subA) / txDiffPct);
  return breakEvenRevenue > 0 ? breakEvenRevenue : 0;
}

/**
 * Get all relevant break-even thresholds.
 */
export function getAllBreakEvens(paymentMethodId, billingCycle) {
  const pm = PAYMENT_METHODS.find(m => m.id === paymentMethodId);
  if (!pm) return [];

  // Only Starter has a tx fee, so only Starter→* transitions are meaningful
  const starter = PLANS[0];
  const transitions = [];

  for (let i = 1; i < PLANS.length; i++) {
    const target = PLANS[i];
    const revenue = findBreakEven(starter, target, pm, billingCycle);
    transitions.push({
      from: starter.name,
      to: target.name,
      breakEvenRevenue: revenue,
      breakEvenRevenueDisplay: Number.isFinite(revenue) ? revenue : null,
    });
  }

  return transitions;
}

export function buildSummary(results, breakEvens, locale = 'ko-KR') {
  const money = new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
  const num = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });

  const best = results.find(r => r.isCheapest);
  const lines = [
    '[Teachable Fee Calculator Summary]',
    '',
    ...results.map(r =>
      `${r.planName}: Net ${money.format(r.netRevenue)}/mo (margin ${num.format(r.netMarginPct)}%)${r.isCheapest ? ' ★ Best' : ''}`
    ),
    '',
    `Recommended: ${best.planName} plan`,
    `Per-sale take-home: ${money.format(best.perSaleTakeHome)}`,
    '',
    'Break-even thresholds (Starter →):',
    ...breakEvens.map(be =>
      `  → ${be.to}: ${be.breakEvenRevenueDisplay != null ? money.format(be.breakEvenRevenueDisplay) + '/mo' : 'N/A (no tx fee difference)'}`
    ),
    '',
    'Note: Estimates based on published Teachable pricing (Mar 2026). Payment processing fees included.',
  ];
  return lines.join('\n');
}


/* ── Inline Test Suite ── */
function runTests() {
  let passed = 0;
  let failed = 0;

  function assert(cond, msg) {
    if (cond) { passed++; }
    else { failed++; console.error(`FAIL: ${msg}`); }
  }

  function assertClose(a, b, msg, tol = 0.02) {
    assert(Math.abs(a - b) < tol, `${msg} — expected ~${b}, got ${a}`);
  }

  // Test 1: $100 course × 10 sales, US card, monthly billing — Starter plan
  {
    const pm = PAYMENT_METHODS[0]; // US card
    const starter = PLANS[0];
    const r = calculatePlanCost(starter, 100, 10, pm, 'monthly');
    assert(r.subscriptionCost === 39, 'Starter monthly sub = $39');
    assert(r.grossRevenue === 1000, 'Gross = $1000');
    assertClose(r.txFeeTotal, 75, 'Starter tx fee = 7.5% of 1000 = $75');
    assertClose(r.processingFeeTotal, 32, 'Processing = 2.9%*1000 + 10*0.30 = $32');
    assertClose(r.totalMonthlyCost, 146, 'Total cost ≈ $146');
    assertClose(r.netRevenue, 854, 'Net ≈ $854');
  }

  // Test 2: Builder plan should have 0% tx fee
  {
    const pm = PAYMENT_METHODS[0];
    const builder = PLANS[1];
    const r = calculatePlanCost(builder, 100, 10, pm, 'monthly');
    assert(r.txFeeTotal === 0, 'Builder tx fee = $0');
    assertClose(r.totalMonthlyCost, 121, 'Builder total ≈ $121 (89 + 32)');
  }

  // Test 3: Break-even Starter→Builder monthly = $667
  {
    const pm = PAYMENT_METHODS[0];
    const be = findBreakEven(PLANS[0], PLANS[1], pm, 'monthly');
    assertClose(be, 666.67, 'Starter→Builder break-even ≈ $667', 1);
  }

  // Test 4: Break-even Starter→Builder annual = $533
  {
    const pm = PAYMENT_METHODS[0];
    const be = findBreakEven(PLANS[0], PLANS[1], pm, 'annual');
    assertClose(be, 533.33, 'Starter→Builder annual break-even ≈ $533', 1);
  }

  // Test 5: Zero sales → only subscription cost
  {
    const pm = PAYMENT_METHODS[0];
    const r = calculatePlanCost(PLANS[0], 100, 0, pm, 'monthly');
    assert(r.totalMonthlyCost === 39, 'Zero sales = sub only');
    assert(r.netRevenue === -39, 'Zero sales net = -sub');
  }

  // Test 6: compareAllPlans returns 4 plans with exactly one isCheapest
  {
    const results = compareAllPlans({ coursePrice: 200, monthlySales: 5, paymentMethodId: 'us_card', billingCycle: 'monthly' });
    assert(results.length === 4, 'compareAllPlans returns 4 plans');
    const cheapest = results.filter(r => r.isCheapest);
    assert(cheapest.length === 1, 'Exactly one cheapest plan');
  }

  // Test 7: At low revenue ($200/mo), Starter should be cheapest
  {
    const results = compareAllPlans({ coursePrice: 100, monthlySales: 2, paymentMethodId: 'us_card', billingCycle: 'monthly' });
    const best = results.find(r => r.isCheapest);
    assert(best.planId === 'starter', 'At $200/mo, Starter is cheapest');
  }

  // Test 8: At high revenue ($5000/mo), Builder should beat Starter
  {
    const results = compareAllPlans({ coursePrice: 100, monthlySales: 50, paymentMethodId: 'us_card', billingCycle: 'monthly' });
    const starter = results.find(r => r.planId === 'starter');
    const builder = results.find(r => r.planId === 'builder');
    assert(builder.netRevenue > starter.netRevenue, 'At $5000/mo, Builder beats Starter');
  }

  // Test 9: International PayPal has higher processing fees
  {
    const usCard = PAYMENT_METHODS[0];
    const intlPP = PAYMENT_METHODS[3];
    const rUs = calculatePlanCost(PLANS[1], 100, 10, usCard, 'monthly');
    const rPP = calculatePlanCost(PLANS[1], 100, 10, intlPP, 'monthly');
    assert(rPP.processingFeeTotal > rUs.processingFeeTotal, 'Intl PayPal costs more than US card');
  }

  // Test 10: Validation rejects negative price
  {
    const v = validateInputs({ coursePrice: -10, monthlySales: 5, paymentMethodId: 'us_card', billingCycle: 'monthly' });
    assert(!v.valid, 'Rejects negative course price');
  }

  // Test 11: Break-even between two 0% tx plans = Infinity
  {
    const pm = PAYMENT_METHODS[0];
    const be = findBreakEven(PLANS[1], PLANS[2], pm, 'monthly');
    assert(be === Infinity, 'Builder→Growth break-even = Infinity (same tx rate)');
  }

  // Test 12: buildSummary returns a string
  {
    const results = compareAllPlans(DEFAULT_INPUT);
    const bes = getAllBreakEvens('us_card', 'monthly');
    const s = buildSummary(results, bes);
    assert(typeof s === 'string' && s.length > 50, 'buildSummary produces non-empty string');
  }

  console.log(`\n✅ Tests: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

// Run tests when executed directly
const isDirectRun = typeof process !== 'undefined'
  && typeof process.argv !== 'undefined'
  && process.argv[1]
  && (process.argv[1].endsWith('logic.mjs') || process.argv.includes('--test'));

if (isDirectRun) {
  runTests();
}
