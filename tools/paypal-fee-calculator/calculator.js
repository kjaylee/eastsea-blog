(function (root) {
  'use strict';

  var CROSS_BORDER_RATE = 0.015;

  var RATES = {
    standard:  { rate: 0.0349, fixed: 0.49 },
    p2p:       { rate: 0.0299, fixed: 0.49 },
    ff_bank:   { rate: 0,      fixed: 0    },
    ff_card:   { rate: 0.0349, fixed: 0.49 },
    qr_high:   { rate: 0.019,  fixed: 0.10 },
    qr_low:    { rate: 0.024,  fixed: 0.05 },
    invoicing: { rate: 0.0349, fixed: 0.49 },
  };

  var DEFAULTS = {
    amount:        100,
    paymentType:   'standard',
    ffFunding:     'bank',
    international: false,
    mode:          'forward',
  };

  function round2(v) {
    return Math.round((Number(v) + Number.EPSILON) * 100) / 100;
  }

  function resolveRateKey(paymentType, ffFunding, amount, mode) {
    if (paymentType === 'ff') {
      return ffFunding === 'card' ? 'ff_card' : 'ff_bank';
    }
    if (paymentType === 'qr') {
      if (mode === 'reverse') {
        // Determine tier: check if charge via high-tier formula would exceed $10
        var hiCharge = (amount + RATES.qr_high.fixed) / (1 - RATES.qr_high.rate);
        return hiCharge > 10 ? 'qr_high' : 'qr_low';
      }
      return Number(amount) <= 10 ? 'qr_low' : 'qr_high';
    }
    return paymentType; // 'standard', 'p2p', 'invoicing'
  }

  function calculate(input) {
    var amount        = Number(input.amount        != null ? input.amount        : DEFAULTS.amount);
    var paymentType   = String(input.paymentType   != null ? input.paymentType   : DEFAULTS.paymentType);
    var ffFunding     = String(input.ffFunding     != null ? input.ffFunding     : DEFAULTS.ffFunding);
    var international = Boolean(input.international != null ? input.international : DEFAULTS.international);
    var mode          = String(input.mode          != null ? input.mode          : DEFAULTS.mode);

    if (!isFinite(amount) || amount < 0) {
      return { result: null, error: 'Amount must be a non-negative number.' };
    }

    var validTypes = ['standard', 'p2p', 'ff', 'qr', 'invoicing'];
    if (validTypes.indexOf(paymentType) === -1) {
      return { result: null, error: 'Invalid payment type.' };
    }

    var validModes = ['forward', 'reverse'];
    if (validModes.indexOf(mode) === -1) {
      return { result: null, error: 'Invalid mode. Use "forward" or "reverse".' };
    }

    var rateKey = resolveRateKey(paymentType, ffFunding, amount, mode);
    var rateInfo = RATES[rateKey];
    var rate = rateInfo.rate;
    var fixed = rateInfo.fixed;
    var crossBorderRate = international ? CROSS_BORDER_RATE : 0;
    var totalRate = rate + crossBorderRate;

    if (mode === 'reverse' && totalRate >= 1) {
      return { result: null, error: 'Total fee rate ≥ 100% — reverse calculation impossible.' };
    }

    var chargeAmount, pctFee, fixedFee, baseFee, crossBorderFee, totalFee, net;

    if (mode === 'forward') {
      chargeAmount   = amount;
      pctFee         = round2(chargeAmount * rate);
      fixedFee       = round2(fixed);
      baseFee        = round2(chargeAmount * rate + fixed);
      crossBorderFee = round2(chargeAmount * crossBorderRate);
      totalFee       = round2(chargeAmount * totalRate + fixed);
      net            = round2(chargeAmount - totalFee);
    } else {
      net            = amount;
      chargeAmount   = round2((net + fixed) / (1 - totalRate));
      pctFee         = round2(chargeAmount * rate);
      fixedFee       = round2(fixed);
      baseFee        = round2(chargeAmount * rate + fixed);
      crossBorderFee = round2(chargeAmount * crossBorderRate);
      totalFee       = round2(chargeAmount - net);
    }

    var effectiveRatePct = chargeAmount > 0
      ? round2((totalFee / chargeAmount) * 100)
      : 0;

    var qrTier = paymentType === 'qr'
      ? (rateKey === 'qr_low' ? 'low' : 'high')
      : null;

    return {
      result: {
        chargeAmount:    chargeAmount,
        pctFee:          pctFee,
        fixedFee:        fixedFee,
        baseFee:         baseFee,
        crossBorderFee:  crossBorderFee,
        totalFee:        totalFee,
        net:             net,
        effectiveRatePct: effectiveRatePct,
        qrTier:          qrTier,
        rateKey:         rateKey,
        rate:            rate,
        fixed:           fixed,
      },
      error: '',
    };
  }

  var exports_ = { calculate: calculate, RATES: RATES, DEFAULTS: DEFAULTS, CROSS_BORDER_RATE: CROSS_BORDER_RATE };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = exports_;
  } else {
    root.PayPalCalc = exports_;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
