(function (root) {
  const DEFAULTS = {
    nightlyRate: 150,
    numberOfNights: 3,
    cleaningFee: 45,
    hostServiceFeePct: 3,
    coHostSplitPct: 0,
    numberOfBookings: 8,
    occupancyTaxPct: 0,
    targetMonthlyNet: 2000
  };

  const TEXT = {
    en: {
      invalid: 'Please review your inputs.',
      negMoney: 'All money fields must be zero or above.',
      badRate: 'Fee percentage must be between 0 and 100.',
      badNights: 'Number of nights must be at least 1.',
      badBookings: 'Number of bookings must be at least 1.',
      badNightlyRate: 'Nightly rate must be greater than zero.',
      statusGood: 'Net income is positive under these assumptions.',
      statusWarn: 'Net income is zero or negative — check your fee settings.',
      summaryTitle: '[Airbnb Host Fee Summary]',
      na: 'N/A'
    },
    ko: {
      invalid: '입력값을 확인해주세요.',
      negMoney: '금액 입력값은 모두 0 이상이어야 합니다.',
      badRate: '수수료율은 0~100 범위여야 합니다.',
      badNights: '숙박 일수는 1 이상이어야 합니다.',
      badBookings: '예약 건수는 1 이상이어야 합니다.',
      badNightlyRate: '1박 요금은 0보다 커야 합니다.',
      statusGood: '현재 가정에서 순수입이 플러스입니다.',
      statusWarn: '순수입이 0 이하입니다 — 수수료 설정을 확인하세요.',
      summaryTitle: '[에어비앤비 호스트 수수료 요약]',
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
    if (n.nightlyRate <= 0) return t.badNightlyRate;
    if ([n.cleaningFee].some((v) => v < 0)) return t.negMoney;
    if (n.numberOfNights < 1) return t.badNights;
    if (n.numberOfBookings < 1) return t.badBookings;
    if (
      n.hostServiceFeePct < 0 || n.hostServiceFeePct > 100 ||
      n.coHostSplitPct < 0 || n.coHostSplitPct > 100 ||
      n.occupancyTaxPct < 0 || n.occupancyTaxPct > 100
    ) return t.badRate;
    if (n.targetMonthlyNet < 0) return t.negMoney;
    return '';
  }

  function computeCore(nightlyRate, numberOfNights, cleaningFee, hostServiceFeePct, coHostSplitPct, occupancyTaxPct) {
    const bookingSubtotal = round2(nightlyRate * numberOfNights);
    const grossBookingRevenue = round2(bookingSubtotal + cleaningFee);
    const airbnbHostFee = round2(bookingSubtotal * (hostServiceFeePct / 100));
    const hostPayoutBeforeCoHost = round2(grossBookingRevenue - airbnbHostFee);
    const coHostPayout = round2(hostPayoutBeforeCoHost * (coHostSplitPct / 100));
    const occupancyTaxTotal = round2(bookingSubtotal * (occupancyTaxPct / 100));
    const incomePerBooking = round2(hostPayoutBeforeCoHost - coHostPayout);
    const incomePerNight = round4(incomePerBooking / numberOfNights);
    const effectiveFeeRatePct = grossBookingRevenue > 0
      ? round4((airbnbHostFee / grossBookingRevenue) * 100)
      : 0;
    return {
      grossBookingRevenue,
      airbnbHostFee,
      coHostPayout,
      occupancyTaxTotal,
      incomePerBooking,
      incomePerNight,
      effectiveFeeRatePct
    };
  }

  function buildSummary(input, result, lang) {
    const t = TEXT[lang] || TEXT.en;
    const na = t.na;
    const req = result.requiredBookingsForTarget !== null
      ? String(result.requiredBookingsForTarget)
      : na;
    const lines = [
      t.summaryTitle,
      'Nightly rate: $' + Number(input.nightlyRate).toFixed(2),
      'Number of nights: ' + input.numberOfNights,
      'Cleaning fee: $' + Number(input.cleaningFee).toFixed(2),
      'Host service fee: ' + Number(input.hostServiceFeePct).toFixed(2) + '%',
      'Co-host split: ' + Number(input.coHostSplitPct).toFixed(2) + '%',
      'Occupancy tax rate: ' + Number(input.occupancyTaxPct).toFixed(2) + '%',
      'Gross booking revenue: $' + result.grossBookingRevenue.toFixed(2),
      'Airbnb host fee: $' + result.airbnbHostFee.toFixed(2),
      'Co-host payout: $' + result.coHostPayout.toFixed(2),
      'Occupancy tax total: $' + result.occupancyTaxTotal.toFixed(2),
      'Net host income (per booking): $' + result.incomePerBooking.toFixed(2),
      'Income per night: $' + result.incomePerNight.toFixed(4),
      'Net host income (' + input.numberOfBookings + ' bookings): $' + result.netHostIncome.toFixed(2),
      'Effective fee rate: ' + result.effectiveFeeRatePct.toFixed(2) + '%',
      'Required bookings for $' + Number(input.targetMonthlyNet).toFixed(2) + ' target: ' + req
    ];
    return lines.join('\n');
  }

  function calculate(input, opts) {
    const lang = (opts && opts.lang) || 'en';
    const t = TEXT[lang] || TEXT.en;
    const n = {
      nightlyRate: Number(input.nightlyRate),
      numberOfNights: Number(input.numberOfNights),
      cleaningFee: Number(input.cleaningFee),
      hostServiceFeePct: Number(input.hostServiceFeePct != null ? input.hostServiceFeePct : DEFAULTS.hostServiceFeePct),
      coHostSplitPct: Number(input.coHostSplitPct != null ? input.coHostSplitPct : DEFAULTS.coHostSplitPct),
      numberOfBookings: Number(input.numberOfBookings),
      occupancyTaxPct: Number(input.occupancyTaxPct != null ? input.occupancyTaxPct : DEFAULTS.occupancyTaxPct),
      targetMonthlyNet: Number(input.targetMonthlyNet != null ? input.targetMonthlyNet : DEFAULTS.targetMonthlyNet)
    };

    const err = validate(n, lang);
    if (err) return { result: null, error: err };

    const core = computeCore(
      n.nightlyRate, n.numberOfNights, n.cleaningFee,
      n.hostServiceFeePct, n.coHostSplitPct, n.occupancyTaxPct
    );

    const netHostIncome = round2(core.incomePerBooking * n.numberOfBookings);

    const requiredBookingsForTarget = (n.targetMonthlyNet > 0 && core.incomePerBooking > 0)
      ? Math.ceil(n.targetMonthlyNet / core.incomePerBooking)
      : (n.targetMonthlyNet === 0 ? 0 : null);

    const result = {
      ...core,
      netHostIncome,
      requiredBookingsForTarget,
      status: core.incomePerBooking > 0 ? t.statusGood : t.statusWarn
    };

    result.summary = buildSummary(n, result, lang);

    return { result, error: '' };
  }

  const exports = { calculate, DEFAULTS };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = exports;
  } else {
    root.AirbnbHostCalc = exports;
  }
}(typeof globalThis !== 'undefined' ? globalThis : this));
