'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');

const { calculate, DEFAULTS } = require('./calculator.js');

function approx(actual, expected, tol = 0.02) {
  assert.ok(
    Math.abs(actual - expected) <= tol,
    `expected ${actual} ≈ ${expected} (±${tol})`
  );
}

// TC-01: baseline event — organizer absorbs fees
test('TC-01 baseline event organizer absorbs fees', () => {
  // ticketPrice=50, n=100, feeRatePct=3.7, fixed=1.79, procPct=2.9, procFixed=0.30
  // grossRevenue = 5000
  // ebFee = (0.037*50 + 1.79)*100 = (1.85+1.79)*100 = 364.00
  // procFee = 0.029*5000 + 0.30 = 145.30
  // totalFees = 509.30
  // netRevenue = 5000 - 509.30 = 4490.70
  const { result, error } = calculate({
    ticketPrice: 50,
    numberOfTickets: 100,
    passFeesToAttendee: false,
    targetNetRevenue: 5000
  }, { lang: 'en' });

  assert.equal(error, '');
  approx(result.grossTicketRevenue, 5000.00);
  approx(result.eventbriteServiceFee, 364.00);
  approx(result.paymentProcessingFee, 145.30);
  approx(result.totalFees, 509.30);
  approx(result.netRevenueToOrganizer, 4490.70);
  approx(result.feePerTicket, 5.09, 0.05);
  approx(result.effectiveFeeRatePct, 10.19, 0.1);
  assert.equal(result.effectiveTicketPrice, 50); // fees absorbed, attendee pays face value
  assert.ok(result.requiredTicketsForTarget !== null);
  assert.ok(result.requiredTicketsForTarget > 100, 'need more than 100 tickets to net $5000');
});

// TC-02: pass fees to attendee — organizer keeps full revenue
test('TC-02 pass fees to attendee — organizer nets full gross', () => {
  const { result, error } = calculate({
    ticketPrice: 50,
    numberOfTickets: 100,
    passFeesToAttendee: true,
    targetNetRevenue: 5000
  }, { lang: 'en' });

  assert.equal(error, '');
  approx(result.grossTicketRevenue, 5000.00);
  approx(result.netRevenueToOrganizer, 5000.00); // organizer keeps all
  assert.ok(result.effectiveTicketPrice > 50, 'attendee pays more than face value');
  // requiredTickets = ceil(5000/50) = 100
  assert.equal(result.requiredTicketsForTarget, 100);
});

// TC-03: single ticket sanity check
test('TC-03 single ticket fee calculation', () => {
  // ticketPrice=25, n=1
  // ebFee = (0.037*25 + 1.79)*1 = (0.925+1.79) = 2.715 → 2.72
  // procFee = 0.029*25 + 0.30 = 0.725+0.30 = 1.025 → 1.03
  // totalFees ≈ 3.75
  // netRevenue ≈ 25 - 3.75 = 21.25
  const { result, error } = calculate({
    ticketPrice: 25,
    numberOfTickets: 1,
    passFeesToAttendee: false,
    targetNetRevenue: 100
  }, { lang: 'en' });

  assert.equal(error, '');
  approx(result.grossTicketRevenue, 25.00);
  approx(result.eventbriteServiceFee, 2.72, 0.02);
  approx(result.paymentProcessingFee, 1.03, 0.02);
  approx(result.netRevenueToOrganizer, 21.25, 0.10);
});

// TC-04: requiredTicketsForTarget algebraic correctness
test('TC-04 requiredTicketsForTarget algebraic correctness', () => {
  const target = 1000;
  const { result, error } = calculate({
    ticketPrice: 30,
    numberOfTickets: 50,
    passFeesToAttendee: false,
    targetNetRevenue: target
  }, { lang: 'en' });

  assert.equal(error, '');
  const n = result.requiredTicketsForTarget;
  assert.ok(n !== null, 'should be computable');

  // Verify: n tickets should yield >= target net revenue
  const gross = 30 * n;
  const ebFee = (0.037 * 30 + 1.79) * n;
  const procFee = 0.029 * gross + 0.30;
  const net = gross - ebFee - procFee;
  assert.ok(net >= target - 0.02, `${n} tickets should yield net >= target`);

  // n-1 should yield < target
  if (n > 1) {
    const gross2 = 30 * (n - 1);
    const ebFee2 = (0.037 * 30 + 1.79) * (n - 1);
    const procFee2 = 0.029 * gross2 + 0.30;
    const net2 = gross2 - ebFee2 - procFee2;
    assert.ok(net2 < target + 0.02, `${n - 1} tickets should yield net < target`);
  }
});

// TC-05: Korean language output
test('TC-05 Korean language status and summary', () => {
  const { result, error } = calculate({
    ticketPrice: 50,
    numberOfTickets: 100,
    passFeesToAttendee: false,
    targetNetRevenue: 5000
  }, { lang: 'ko' });

  assert.equal(error, '');
  assert.match(result.status, /순수익/);
  assert.match(result.summary, /Eventbrite 수수료 계산기 요약/);
  assert.match(result.summary, /Ticket price:.*50/);
  assert.match(result.summary, /Net revenue to organizer:/);
});

// TC-06: invalid inputs rejected
test('TC-06 invalid inputs are rejected', () => {
  const base = {
    ticketPrice: 50,
    numberOfTickets: 100,
    passFeesToAttendee: false,
    targetNetRevenue: 5000
  };

  const badCases = [
    { ...base, ticketPrice: 0 },
    { ...base, ticketPrice: -10 },
    { ...base, numberOfTickets: 0 },
    { ...base, numberOfTickets: -5 },
    { ...base, eventbriteFeeRatePct: -1 },
    { ...base, processingFeeRatePct: -0.5 },
    { ...base, targetNetRevenue: -100 },
    { ...base, numberOfEvents: 0 }
  ];

  badCases.forEach((input) => {
    const { result, error } = calculate(input, { lang: 'en' });
    assert.equal(result, null, `should reject: ${JSON.stringify(input)}`);
    assert.notEqual(error, '', 'error message should be non-empty');
  });
});

// TC-07: DEFAULTS export has expected shape and values
test('TC-07 DEFAULTS export shape and values', () => {
  assert.equal(typeof DEFAULTS, 'object');
  assert.equal(DEFAULTS.ticketPrice, 50);
  assert.equal(DEFAULTS.numberOfTickets, 100);
  assert.equal(DEFAULTS.eventbriteFeeRatePct, 3.7);
  assert.equal(DEFAULTS.eventbriteFixedFee, 1.79);
  assert.equal(DEFAULTS.processingFeeRatePct, 2.9);
  assert.equal(DEFAULTS.processingFixedFee, 0.30);
  assert.equal(DEFAULTS.passFeesToAttendee, false);
  assert.equal(DEFAULTS.numberOfEvents, 1);
  assert.equal(DEFAULTS.targetNetRevenue, 5000);
});

// TC-08: summary contains all required output fields
test('TC-08 summary contains all required output fields', () => {
  const { result, error } = calculate({
    ticketPrice: 50,
    numberOfTickets: 100,
    passFeesToAttendee: false,
    targetNetRevenue: 5000
  }, { lang: 'en' });

  assert.equal(error, '');
  assert.match(result.summary, /Gross ticket revenue:/);
  assert.match(result.summary, /Eventbrite service fee:/);
  assert.match(result.summary, /Payment processing fee:/);
  assert.match(result.summary, /Total fees:/);
  assert.match(result.summary, /Net revenue to organizer:/);
  assert.match(result.summary, /Fee per ticket:/);
  assert.match(result.summary, /Effective ticket price/);
  assert.match(result.summary, /Effective fee rate:/);
  assert.match(result.summary, /Required tickets/);
});
