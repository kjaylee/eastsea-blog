(function (global, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  global.SubstackNewsletterRevenue = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const DEFAULTS = {
    derivePaidFromAudience: false,
    audienceSize: 50000,
    paidConversionRatePct: 2,
    paidSubscribers: 1000,
    annualSharePct: 35,
    monthlyPrice: 8,
    annualPrice: 80,
    foundingMembers: 20,
    foundingPrice: 150,
    refundRatePct: 2,
    substackPlatformFeeRatePct: 10,
    processingFeeRatePct: 2.9,
    processingFixedFee: 0.30,
    recurringBillingFeeRatePct: 0.7,
  };

  function toFiniteNumber(value) {
    if (typeof value === 'number') return Number.isFinite(value) ? value : null;
    const text = String(value == null ? '' : value).trim().replace(/,/g, '');
    if (!text) return null;
    const num = Number(text);
    return Number.isFinite(num) ? num : null;
  }

  function roundTo(value, digits) {
    const f = Math.pow(10, digits);
    return Math.round((value + Number.EPSILON) * f) / f;
  }

  function mergeWithDefaults(raw) {
    return Object.assign({}, DEFAULTS, raw || {});
  }

  function validate(raw) {
    const v = mergeWithDefaults(raw);
    const errors = [];

    function reqInt(name, min) {
      const n = toFiniteNumber(v[name]);
      if (!(Number.isFinite(n) && Number.isInteger(n) && n >= min)) errors.push(name + ' must be an integer ≥ ' + min + '.');
      return n;
    }
    function reqMoney(name, min) {
      const n = toFiniteNumber(v[name]);
      if (!(Number.isFinite(n) && n >= min)) errors.push(name + ' must be ≥ ' + min + '.');
      return n;
    }
    function reqRate(name) {
      const n = toFiniteNumber(v[name]);
      if (!(Number.isFinite(n) && n >= 0 && n <= 100)) errors.push(name + ' must be between 0 and 100.');
      return n;
    }

    const derivePaidFromAudience = Boolean(v.derivePaidFromAudience);
    const audienceSize = reqInt('audienceSize', 0);
    const paidConversionRatePct = reqRate('paidConversionRatePct');
    let paidSubscribers = reqInt('paidSubscribers', 0);
    if (derivePaidFromAudience) {
      paidSubscribers = Math.round(audienceSize * (paidConversionRatePct / 100));
    }

    const annualSharePct = reqRate('annualSharePct');
    const monthlyPrice = reqMoney('monthlyPrice', 0);
    const annualPrice = reqMoney('annualPrice', 0);
    const foundingMembers = reqInt('foundingMembers', 0);
    const foundingPrice = reqMoney('foundingPrice', 0);
    const refundRatePct = reqRate('refundRatePct');
    const substackPlatformFeeRatePct = reqRate('substackPlatformFeeRatePct');
    const processingFeeRatePct = reqRate('processingFeeRatePct');
    const processingFixedFee = reqMoney('processingFixedFee', 0);
    const recurringBillingFeeRatePct = reqRate('recurringBillingFeeRatePct');

    if (errors.length) return { ok: false, errors, values: null };

    return {
      ok: true,
      errors: [],
      values: {
        derivePaidFromAudience,
        audienceSize,
        paidConversionRatePct,
        paidSubscribers,
        annualSharePct,
        monthlyPrice,
        annualPrice,
        foundingMembers,
        foundingPrice,
        refundRatePct,
        substackPlatformFeeRatePct,
        processingFeeRatePct,
        processingFixedFee,
        recurringBillingFeeRatePct,
      },
    };
  }

  function calculate(raw) {
    const res = validate(raw);
    if (!res.ok) return { result: null, error: res.errors.join(' '), errors: res.errors };
    const x = res.values;

    const monthlyPaid = Math.round(x.paidSubscribers * (1 - x.annualSharePct / 100));
    const annualPaid = x.paidSubscribers - monthlyPaid;

    const gMonthly = x.monthlyPrice * monthlyPaid;
    const gAnnualEq = (x.annualPrice * annualPaid) / 12;
    const gFoundingEq = (x.foundingPrice * x.foundingMembers) / 12;
    const grossEq = gMonthly + gAnnualEq + gFoundingEq;

    const refundLossEq = grossEq * (x.refundRatePct / 100);
    const netAfterRefundsEq = grossEq - refundLossEq;

    const platformFeeEq = netAfterRefundsEq * (x.substackPlatformFeeRatePct / 100);
    const processorVarFeeEq = netAfterRefundsEq * (x.processingFeeRatePct / 100);

    const subsGrossEq = gMonthly + gAnnualEq;
    const subsRefundEq = subsGrossEq * (x.refundRatePct / 100);
    const recurringFeeEq = (subsGrossEq - subsRefundEq) * (x.recurringBillingFeeRatePct / 100);

    const fixedMonthlyEq = monthlyPaid * x.processingFixedFee;
    const fixedAnnualEq = (annualPaid / 12) * x.processingFixedFee;
    const fixedFoundingEq = (x.foundingMembers / 12) * x.processingFixedFee;
    const fixedFeeEq = fixedMonthlyEq + fixedAnnualEq + fixedFoundingEq;

    const totalFeesExRefundEq = platformFeeEq + processorVarFeeEq + recurringFeeEq + fixedFeeEq;
    const netEq = grossEq - refundLossEq - totalFeesExRefundEq;
    const effectiveFeeRatePct = grossEq > 0 ? (totalFeesExRefundEq / grossEq) * 100 : 0;

    const result = {
      input: x,
      monthlyPaid,
      annualPaid,
      grossEq: roundTo(grossEq, 6),
      refundLossEq: roundTo(refundLossEq, 6),
      netAfterRefundsEq: roundTo(netAfterRefundsEq, 6),
      platformFeeEq: roundTo(platformFeeEq, 6),
      processorVarFeeEq: roundTo(processorVarFeeEq, 6),
      recurringFeeEq: roundTo(recurringFeeEq, 6),
      fixedFeeEq: roundTo(fixedFeeEq, 6),
      totalFeesExRefundEq: roundTo(totalFeesExRefundEq, 6),
      netEq: roundTo(netEq, 6),
      effectiveFeeRatePct: roundTo(effectiveFeeRatePct, 6),
      summary: buildSummary({
        paidSubscribers: x.paidSubscribers,
        monthlyPaid,
        annualPaid,
        grossEq,
        refundLossEq,
        platformFeeEq,
        processorVarFeeEq,
        recurringFeeEq,
        fixedFeeEq,
        totalFeesExRefundEq,
        netEq,
        effectiveFeeRatePct,
      }),
    };

    return { result, error: '', errors: [] };
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  }
  function formatPercent(value) {
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value) + '%';
  }
  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function buildSummary(x) {
    return [
      '[Substack Newsletter Revenue — Monthly‑equiv]',
      'Paid base: ' + x.paidSubscribers + ' (M=' + x.monthlyPaid + ', A=' + x.annualPaid + ')',
      'Gross (eq/mo): ' + formatCurrency(x.grossEq),
      'Refund loss: ' + formatCurrency(x.refundLossEq),
      'Platform fee: ' + formatCurrency(x.platformFeeEq),
      'Processor variable: ' + formatCurrency(x.processorVarFeeEq),
      'Recurring billing fee: ' + formatCurrency(x.recurringFeeEq),
      'Fixed fees: ' + formatCurrency(x.fixedFeeEq),
      'Total fees (excl refunds): ' + formatCurrency(x.totalFeesExRefundEq),
      'Net take‑home (eq/mo): ' + formatCurrency(x.netEq),
      'Effective fee rate: ' + formatPercent(x.effectiveFeeRatePct),
    ].join('\n');
  }

  function initBrowser() {
    if (typeof document === 'undefined') return;

    const ids = {
      derive: 'derive',
      audienceSize: 'audienceSize',
      paidConv: 'paidConv',
      paidSubs: 'paidSubs',
      annualShare: 'annualShare',
      mPrice: 'mPrice',
      aPrice: 'aPrice',
      foundingCnt: 'foundingCnt',
      foundingPrice: 'foundingPrice',
      refund: 'refund',
      platform: 'platform',
      procVar: 'procVar',
      procFixed: 'procFixed',
      recurring: 'recurring',
      audienceRow: 'audienceRow',
      paidRow: 'paidRow',
      kGross: 'kGross',
      kRefund: 'kRefund',
      kFees: 'kFees',
      kNet: 'kNet',
      kEff: 'kEff',
      kMix: 'kMix',
      copy: 'copy',
      reset: 'reset',
      error: 'error',
      summary: 'summary',
    };
    const el = Object.keys(ids).reduce((acc, k) => { acc[k] = document.getElementById(ids[k]); return acc; }, {});

    function applyDefaults() {
      el.derive.checked = DEFAULTS.derivePaidFromAudience;
      el.audienceSize.value = String(DEFAULTS.audienceSize);
      el.paidConv.value = String(DEFAULTS.paidConversionRatePct);
      el.paidSubs.value = String(DEFAULTS.paidSubscribers);
      el.annualShare.value = String(DEFAULTS.annualSharePct);
      el.mPrice.value = String(DEFAULTS.monthlyPrice);
      el.aPrice.value = String(DEFAULTS.annualPrice);
      el.foundingCnt.value = String(DEFAULTS.foundingMembers);
      el.foundingPrice.value = String(DEFAULTS.foundingPrice);
      el.refund.value = String(DEFAULTS.refundRatePct);
      el.platform.value = String(DEFAULTS.substackPlatformFeeRatePct);
      el.procVar.value = String(DEFAULTS.processingFeeRatePct);
      el.procFixed.value = String(DEFAULTS.processingFixedFee);
      el.recurring.value = String(DEFAULTS.recurringBillingFeeRatePct);
      updateMode();
    }

    function collect() {
      return {
        derivePaidFromAudience: el.derive.checked,
        audienceSize: el.audienceSize.value,
        paidConversionRatePct: el.paidConv.value,
        paidSubscribers: el.paidSubs.value,
        annualSharePct: el.annualShare.value,
        monthlyPrice: el.mPrice.value,
        annualPrice: el.aPrice.value,
        foundingMembers: el.foundingCnt.value,
        foundingPrice: el.foundingPrice.value,
        refundRatePct: el.refund.value,
        substackPlatformFeeRatePct: el.platform.value,
        processingFeeRatePct: el.procVar.value,
        processingFixedFee: el.procFixed.value,
        recurringBillingFeeRatePct: el.recurring.value,
      };
    }

    function updateMode() {
      const derived = el.derive.checked;
      el.audienceRow.style.display = derived ? 'grid' : 'none';
      el.paidRow.style.display = derived ? 'none' : 'grid';
    }

    function setError(msg) {
      const on = Boolean(msg);
      el.error.style.display = on ? 'block' : 'none';
      el.error.textContent = on ? msg : '';
    }

    function render() {
      const { result, error } = calculate(collect());
      if (error) {
        setError(error);
        el.summary.value = '';
        return;
      }
      setError('');
      el.kGross.textContent = formatCurrency(result.grossEq);
      el.kRefund.textContent = formatCurrency(result.refundLossEq);
      el.kFees.textContent = formatCurrency(result.totalFeesExRefundEq);
      el.kNet.textContent = formatCurrency(result.netEq);
      el.kEff.textContent = formatPercent(result.effectiveFeeRatePct);
      el.kMix.textContent = result.monthlyPaid + ' / ' + result.annualPaid + ' / ' + result.input.foundingMembers;
      el.summary.value = result.summary;
    }

    el.derive.addEventListener('change', () => { updateMode(); render(); });
    ['input','change'].forEach((evt) => {
      document.addEventListener(evt, (e) => {
        const t = e.target;
        if (!t || !t.id) return;
        if (Object.values(ids).includes(t.id)) render();
      });
    });

    el.copy.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(el.summary.value); el.copy.textContent = 'Copied'; setTimeout(() => el.copy.textContent = 'Copy summary', 1200); }
      catch { el.copy.textContent = 'Copy failed'; setTimeout(() => el.copy.textContent = 'Copy summary', 1200); }
    });

    el.reset.addEventListener('click', () => { applyDefaults(); render(); });

    applyDefaults();
    render();
  }

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    window.addEventListener('DOMContentLoaded', initBrowser);
  }

  return {
    DEFAULTS,
    toFiniteNumber,
    roundTo,
    mergeWithDefaults,
    validate,
    calculate,
    formatCurrency,
    formatPercent,
    escapeHtml,
    initBrowser,
  };
});
