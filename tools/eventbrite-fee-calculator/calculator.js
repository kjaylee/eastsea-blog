(function (root) {
  'use strict';

  const DEFAULTS = {
    ticketPrice: 50,
    numberOfTickets: 100,
    eventbriteFeeRatePct: 3.7,
    eventbriteFixedFee: 1.79,
    processingFeeRatePct: 2.9,
    processingFixedFee: 0.30,
    passFeesToAttendee: false,
    numberOfEvents: 1,
    targetNetRevenue: 5000
  };

  const TEXT = {
    ko: {
      negPrice: '티켓 가격은 0보다 커야 합니다.',
      negTickets: '티켓 수는 1 이상의 정수여야 합니다.',
      negRate: '수수료율은 0 이상이어야 합니다.',
      negFixed: '고정 수수료는 0 이상이어야 합니다.',
      negEvents: '이벤트 수는 1 이상의 정수여야 합니다.',
      negTarget: '목표 수익은 0 이상이어야 합니다.',
      statusGood: '현재 설정에서 주최자 순수익이 플러스입니다.',
      statusWarn: '현재 설정에서 주최자 순수익이 0 이하입니다.',
      summaryTitle: '[Eventbrite 수수료 계산기 요약]',
      na: 'N/A'
    },
    en: {
      negPrice: 'Ticket price must be greater than zero.',
      negTickets: 'Number of tickets must be a positive integer.',
      negRate: 'Fee rate must be zero or above.',
      negFixed: 'Fixed fee must be zero or above.',
      negEvents: 'Number of events must be a positive integer.',
      negTarget: 'Target net revenue must be zero or above.',
      statusGood: 'Net revenue to organizer is positive under these settings.',
      statusWarn: 'Net revenue to organizer is zero or negative.',
      summaryTitle: '[Eventbrite Fee Calculator Summary]',
      na: 'N/A'
    }
  };

  function round2(v) {
    return Math.round((v + Number.EPSILON) * 100) / 100;
  }

  function round4(v) {
    return Math.round((v + Number.EPSILON) * 10000) / 10000;
  }

  function validate(n, lang) {
    const t = TEXT[lang] || TEXT.en;
    if (n.ticketPrice <= 0) return t.negPrice;
    if (!Number.isInteger(n.numberOfTickets) || n.numberOfTickets < 1) return t.negTickets;
    if (n.eventbriteFeeRatePct < 0) return t.negRate;
    if (n.eventbriteFixedFee < 0) return t.negFixed;
    if (n.processingFeeRatePct < 0) return t.negRate;
    if (n.processingFixedFee < 0) return t.negFixed;
    if (!Number.isInteger(n.numberOfEvents) || n.numberOfEvents < 1) return t.negEvents;
    if (n.targetNetRevenue < 0) return t.negTarget;
    return '';
  }

  function computeCore(n) {
    const grossTicketRevenue = round2(n.ticketPrice * n.numberOfTickets);

    // Eventbrite service fee: per-ticket percentage + per-ticket fixed amount
    const eventbriteServiceFee = round2(
      (n.eventbriteFeeRatePct / 100 * n.ticketPrice + n.eventbriteFixedFee) * n.numberOfTickets
    );

    // Payment processing fee: percentage of gross + fixed per order
    const paymentProcessingFee = round2(
      n.processingFeeRatePct / 100 * grossTicketRevenue + n.processingFixedFee
    );

    const totalFees = round2(eventbriteServiceFee + paymentProcessingFee);

    // When fees are passed to attendees, organizer absorbs nothing
    const netRevenueToOrganizer = n.passFeesToAttendee
      ? grossTicketRevenue
      : round2(grossTicketRevenue - totalFees);

    const feePerTicket = round2(totalFees / n.numberOfTickets);

    // Attendee pays ticket price plus fees when passed through
    const effectiveTicketPrice = n.passFeesToAttendee
      ? round2(n.ticketPrice + feePerTicket)
      : n.ticketPrice;

    const effectiveFeeRatePct = grossTicketRevenue > 0
      ? round4(totalFees / grossTicketRevenue * 100)
      : 0;

    const revenuePerEvent = netRevenueToOrganizer;

    // Required tickets to reach targetNetRevenue (algebraic, per event)
    // When absorbing fees:
    //   net = n * ticketPrice * (1 - ebRatePct/100 - procRatePct/100) - n * ebFixed - procFixed
    //       = n * perTicketContrib - procFixed
    //   n = ceil((target + procFixed) / perTicketContrib)
    // When passing fees: net = n * ticketPrice
    //   n = ceil(target / ticketPrice)
    let requiredTicketsForTarget = null;
    if (n.passFeesToAttendee) {
      requiredTicketsForTarget = n.ticketPrice > 0
        ? Math.ceil(n.targetNetRevenue / n.ticketPrice)
        : null;
    } else {
      const perTicketContrib =
        n.ticketPrice * (1 - n.eventbriteFeeRatePct / 100 - n.processingFeeRatePct / 100)
        - n.eventbriteFixedFee;
      if (perTicketContrib > 0) {
        requiredTicketsForTarget = Math.ceil(
          (n.targetNetRevenue + n.processingFixedFee) / perTicketContrib
        );
      }
    }

    return {
      grossTicketRevenue,
      eventbriteServiceFee,
      paymentProcessingFee,
      totalFees,
      netRevenueToOrganizer,
      effectiveTicketPrice,
      feePerTicket,
      effectiveFeeRatePct,
      revenuePerEvent,
      requiredTicketsForTarget
    };
  }

  function buildSummary(input, result, lang) {
    const t = TEXT[lang] || TEXT.en;
    const na = t.na;
    const rq = result.requiredTicketsForTarget !== null
      ? String(result.requiredTicketsForTarget)
      : na;
    const lines = [
      t.summaryTitle,
      `Ticket price: $${Number(input.ticketPrice).toFixed(2)}`,
      `Number of tickets: ${input.numberOfTickets}`,
      `Pass fees to attendee: ${input.passFeesToAttendee ? 'Yes' : 'No'}`,
      `Gross ticket revenue: $${result.grossTicketRevenue.toFixed(2)}`,
      `Eventbrite service fee: $${result.eventbriteServiceFee.toFixed(2)}`,
      `Payment processing fee: $${result.paymentProcessingFee.toFixed(2)}`,
      `Total fees: $${result.totalFees.toFixed(2)}`,
      `Net revenue to organizer: $${result.netRevenueToOrganizer.toFixed(2)}`,
      `Fee per ticket: $${result.feePerTicket.toFixed(2)}`,
      `Effective ticket price (attendee): $${result.effectiveTicketPrice.toFixed(2)}`,
      `Effective fee rate: ${result.effectiveFeeRatePct.toFixed(2)}%`,
      `Required tickets for $${Number(input.targetNetRevenue).toFixed(2)} target: ${rq}`
    ];
    return lines.join('\n');
  }

  function normalizeInput(input) {
    return {
      ticketPrice: Number(input.ticketPrice),
      numberOfTickets: Math.round(Number(input.numberOfTickets)),
      eventbriteFeeRatePct: input.eventbriteFeeRatePct !== undefined
        ? Number(input.eventbriteFeeRatePct) : DEFAULTS.eventbriteFeeRatePct,
      eventbriteFixedFee: input.eventbriteFixedFee !== undefined
        ? Number(input.eventbriteFixedFee) : DEFAULTS.eventbriteFixedFee,
      processingFeeRatePct: input.processingFeeRatePct !== undefined
        ? Number(input.processingFeeRatePct) : DEFAULTS.processingFeeRatePct,
      processingFixedFee: input.processingFixedFee !== undefined
        ? Number(input.processingFixedFee) : DEFAULTS.processingFixedFee,
      passFeesToAttendee: Boolean(input.passFeesToAttendee),
      numberOfEvents: input.numberOfEvents !== undefined
        ? Math.round(Number(input.numberOfEvents)) : DEFAULTS.numberOfEvents,
      targetNetRevenue: input.targetNetRevenue !== undefined
        ? Number(input.targetNetRevenue) : DEFAULTS.targetNetRevenue
    };
  }

  function calculate(input, opts) {
    const lang = (opts && opts.lang) || 'en';
    const t = TEXT[lang] || TEXT.en;
    const n = normalizeInput(input);
    const err = validate(n, lang);
    if (err) return { result: null, error: err };

    const core = computeCore(n);
    const status = core.netRevenueToOrganizer > 0 ? t.statusGood : t.statusWarn;
    const summary = buildSummary(input, core, lang);

    return {
      result: { ...core, status, summary },
      error: ''
    };
  }

  const EventbriteCalc = { calculate, DEFAULTS };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = EventbriteCalc;
  } else {
    root.EventbriteCalc = EventbriteCalc;
  }
}(typeof globalThis !== 'undefined' ? globalThis : this));
