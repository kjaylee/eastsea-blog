(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }
  root.ToolFormulaScaffoldApp = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const CONFIG = {
  "slug": "kick-subscription-payout-calculator",
  "title": "Kick Subscription Payout Calculator",
  "description": "Estimate Kick subscription revenue with editable creator share, refund, chargeback, and monthly-cost assumptions. Compare your take-home against another platform-share baseline.",
  "headline": "Kick Subscription Payout Calculator | Kick 구독 정산 계산기",
  "subheadline": "Model monthly recurring subs, gifted subs, creator revenue share, payout losses, and fixed costs. Then compare your take-home against another platform share baseline.",
  "currencyCode": "USD",
  "inputs": [
    {
      "id": "monthlySubs",
      "label": "Monthly recurring subscribers",
      "type": "number",
      "value": 250,
      "min": 0,
      "step": 1
    },
    {
      "id": "giftedSubs",
      "label": "Gifted subscribers this month",
      "type": "number",
      "value": 40,
      "min": 0,
      "step": 1
    },
    {
      "id": "subPrice",
      "label": "Subscription price (USD)",
      "type": "number",
      "value": 5,
      "min": 0.01,
      "step": 0.01
    },
    {
      "id": "creatorSharePct",
      "label": "Creator share (%)",
      "type": "number",
      "value": 95,
      "min": 0,
      "max": 100,
      "step": 0.1
    },
    {
      "id": "refundRatePct",
      "label": "Refund / failed charge rate (%)",
      "type": "number",
      "value": 2,
      "min": 0,
      "max": 100,
      "step": 0.1
    },
    {
      "id": "chargebackRatePct",
      "label": "Chargeback / clawback rate (%)",
      "type": "number",
      "value": 0.5,
      "min": 0,
      "max": 100,
      "step": 0.1
    },
    {
      "id": "fixedMonthlyCosts",
      "label": "Fixed monthly creator costs (USD)",
      "type": "number",
      "value": 300,
      "min": 0,
      "step": 0.01
    },
    {
      "id": "comparisonSharePct",
      "label": "Comparison platform share (%)",
      "type": "number",
      "value": 50,
      "min": 0,
      "max": 100,
      "step": 0.1
    }
  ],
  "formula": {
    "grossBillings": "(monthlySubs + giftedSubs) * subPrice",
    "creatorPayoutBeforeLosses": "grossBillings * (creatorSharePct / 100)",
    "lossMultiplier": "(1 - refundRatePct / 100) * (1 - chargebackRatePct / 100)",
    "creatorPayoutAfterLosses": "creatorPayoutBeforeLosses * lossMultiplier",
    "effectiveCreatorShare": "grossBillings > 0 ? (creatorPayoutAfterLosses / grossBillings) * 100 : 0",
    "monthlyNetAfterCosts": "creatorPayoutAfterLosses - fixedMonthlyCosts",
    "annualizedNetAfterCosts": "monthlyNetAfterCosts * 12",
    "comparisonPlatformPayout": "grossBillings * (comparisonSharePct / 100) * lossMultiplier",
    "upliftVsComparison": "creatorPayoutAfterLosses - comparisonPlatformPayout",
    "breakEvenPaidEquivalentSubs": "(subPrice * (creatorSharePct / 100) * lossMultiplier) > 0 ? fixedMonthlyCosts / (subPrice * (creatorSharePct / 100) * lossMultiplier) : 0"
  },
  "summaryLines": [
    {
      "label": "Gross subscription billings",
      "expr": "grossBillings",
      "format": "currency"
    },
    {
      "label": "Creator payout before losses",
      "expr": "creatorPayoutBeforeLosses",
      "format": "currency"
    },
    {
      "label": "Creator payout after losses",
      "expr": "creatorPayoutAfterLosses",
      "format": "currency"
    },
    {
      "label": "Effective creator share",
      "expr": "effectiveCreatorShare",
      "format": "percent"
    },
    {
      "label": "Monthly net after fixed costs",
      "expr": "monthlyNetAfterCosts",
      "format": "currency"
    },
    {
      "label": "Annualized net after fixed costs",
      "expr": "annualizedNetAfterCosts",
      "format": "currency"
    },
    {
      "label": "Uplift vs comparison platform",
      "expr": "upliftVsComparison",
      "format": "currency"
    },
    {
      "label": "Break-even paid-equivalent subscribers",
      "expr": "breakEvenPaidEquivalentSubs",
      "format": "number"
    }
  ],
  "faq": [
    {
      "q": "Does this model official Kick tax or payout timing rules?",
      "a": "No. This is a planning calculator using editable assumptions for creator share, refunds, and chargebacks. It is not an accounting or tax statement."
    },
    {
      "q": "Why include a comparison platform share input?",
      "a": "It keeps the tool reusable. You can compare Kick-style economics against any other creator platform baseline without hard-coding a single competitor assumption."
    },
    {
      "q": "How should I treat gifted subscribers?",
      "a": "Use the count of gift subs actually purchased in the month. The calculator treats them as paid-equivalent subscription units at the same subscription price."
    }
  ]
};
  const DEFAULTS = {
  "monthlySubs": 250,
  "giftedSubs": 40,
  "subPrice": 5,
  "creatorSharePct": 95,
  "refundRatePct": 2,
  "chargebackRatePct": 0.5,
  "fixedMonthlyCosts": 300,
  "comparisonSharePct": 50
};
  const SUMMARY_LINES = [
  {
    "label": "Gross subscription billings",
    "expr": "grossBillings",
    "format": "currency"
  },
  {
    "label": "Creator payout before losses",
    "expr": "creatorPayoutBeforeLosses",
    "format": "currency"
  },
  {
    "label": "Creator payout after losses",
    "expr": "creatorPayoutAfterLosses",
    "format": "currency"
  },
  {
    "label": "Effective creator share",
    "expr": "effectiveCreatorShare",
    "format": "percent"
  },
  {
    "label": "Monthly net after fixed costs",
    "expr": "monthlyNetAfterCosts",
    "format": "currency"
  },
  {
    "label": "Annualized net after fixed costs",
    "expr": "annualizedNetAfterCosts",
    "format": "currency"
  },
  {
    "label": "Uplift vs comparison platform",
    "expr": "upliftVsComparison",
    "format": "currency"
  },
  {
    "label": "Break-even paid-equivalent subscribers",
    "expr": "breakEvenPaidEquivalentSubs",
    "format": "number"
  }
];
  const FIELD_IDS = Object.keys(DEFAULTS);

  function normalize(raw) {
    const input = {};
    for (const field of CONFIG.inputs) {
      input[field.id] = Number(raw[field.id]);
    }
    return input;
  }

  function validate(input) {
    for (const field of CONFIG.inputs) {
      const value = input[field.id];
      if (!Number.isFinite(value)) {
        return field.label + ' must be a valid number.';
      }
      if (field.min != null && value < field.min) {
        return field.label + ' must be at least ' + field.min + '.';
      }
      if (field.max != null && value > field.max) {
        return field.label + ' must be at most ' + field.max + '.';
      }
    }
    return '';
  }

  function compute(raw) {
    const input = normalize(raw);
    const error = validate(input);
    if (error) {
      return { error: error };
    }
    const { monthlySubs, giftedSubs, subPrice, creatorSharePct, refundRatePct, chargebackRatePct, fixedMonthlyCosts, comparisonSharePct } = input;
    const grossBillings = (monthlySubs + giftedSubs) * subPrice;
    const creatorPayoutBeforeLosses = grossBillings * (creatorSharePct / 100);
    const lossMultiplier = (1 - refundRatePct / 100) * (1 - chargebackRatePct / 100);
    const creatorPayoutAfterLosses = creatorPayoutBeforeLosses * lossMultiplier;
    const effectiveCreatorShare = grossBillings > 0 ? (creatorPayoutAfterLosses / grossBillings) * 100 : 0;
    const monthlyNetAfterCosts = creatorPayoutAfterLosses - fixedMonthlyCosts;
    const annualizedNetAfterCosts = monthlyNetAfterCosts * 12;
    const comparisonPlatformPayout = grossBillings * (comparisonSharePct / 100) * lossMultiplier;
    const upliftVsComparison = creatorPayoutAfterLosses - comparisonPlatformPayout;
    const breakEvenPaidEquivalentSubs = (subPrice * (creatorSharePct / 100) * lossMultiplier) > 0 ? fixedMonthlyCosts / (subPrice * (creatorSharePct / 100) * lossMultiplier) : 0;
    return Object.assign({ error: '' }, input, {
      grossBillings: grossBillings,
      creatorPayoutBeforeLosses: creatorPayoutBeforeLosses,
      lossMultiplier: lossMultiplier,
      creatorPayoutAfterLosses: creatorPayoutAfterLosses,
      effectiveCreatorShare: effectiveCreatorShare,
      monthlyNetAfterCosts: monthlyNetAfterCosts,
      annualizedNetAfterCosts: annualizedNetAfterCosts,
      comparisonPlatformPayout: comparisonPlatformPayout,
      upliftVsComparison: upliftVsComparison,
      breakEvenPaidEquivalentSubs: breakEvenPaidEquivalentSubs
    });
  }

  function formatValue(value, format) {
    if (!Number.isFinite(value)) return '—';
    if (format === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: CONFIG.currencyCode,
        maximumFractionDigits: 2,
      }).format(value);
    }
    if (format === 'percent') {
      return new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 2,
      }).format(value) + '%';
    }
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 2,
    }).format(value);
  }

  function summaryText(result) {
    const lines = ['[' + CONFIG.headline + ' Summary]'];
    for (const line of SUMMARY_LINES) {
      lines.push(line.label + ': ' + formatValue(result[line.expr], line.format));
    }
    return lines.join('\n');
  }

  function initPage() {
    if (typeof document === 'undefined') {
      return;
    }

    const byId = (id) => document.getElementById(id);
    const refs = {
      error: byId('error'),
      summary: byId('summary'),
      status: byId('status'),
      copyBtn: byId('copyBtn'),
      resetBtn: byId('resetBtn'),
      summaryRow0: byId('summaryRow0'),
      summaryRow1: byId('summaryRow1'),
      summaryRow2: byId('summaryRow2'),
      summaryRow3: byId('summaryRow3'),
      summaryRow4: byId('summaryRow4'),
      summaryRow5: byId('summaryRow5'),
      summaryRow6: byId('summaryRow6'),
      summaryRow7: byId('summaryRow7')
    };

    for (const id of FIELD_IDS) {
      refs[id] = byId(id);
    }

    function readForm() {
      const raw = {};
      for (const id of FIELD_IDS) {
        raw[id] = refs[id].value;
      }
      return raw;
    }

    function clearOutputs() {
      refs.summaryRow0.textContent = '—';
      refs.summaryRow1.textContent = '—';
      refs.summaryRow2.textContent = '—';
      refs.summaryRow3.textContent = '—';
      refs.summaryRow4.textContent = '—';
      refs.summaryRow5.textContent = '—';
      refs.summaryRow6.textContent = '—';
      refs.summaryRow7.textContent = '—';
      refs.summary.value = '';
    }

    function applyDefaults() {
      for (const [key, value] of Object.entries(DEFAULTS)) {
        refs[key].value = value;
      }
    }

    function render() {
      const result = compute(readForm());
      if (result.error) {
        refs.error.textContent = result.error;
        refs.error.classList.add('show');
        refs.status.textContent = 'Validation blocked';
        refs.status.className = 'status warn';
        clearOutputs();
        return;
      }

      refs.error.textContent = '';
      refs.error.classList.remove('show');
      refs.summaryRow0.textContent = formatValue(result["grossBillings"], "currency");
      refs.summaryRow1.textContent = formatValue(result["creatorPayoutBeforeLosses"], "currency");
      refs.summaryRow2.textContent = formatValue(result["creatorPayoutAfterLosses"], "currency");
      refs.summaryRow3.textContent = formatValue(result["effectiveCreatorShare"], "percent");
      refs.summaryRow4.textContent = formatValue(result["monthlyNetAfterCosts"], "currency");
      refs.summaryRow5.textContent = formatValue(result["annualizedNetAfterCosts"], "currency");
      refs.summaryRow6.textContent = formatValue(result["upliftVsComparison"], "currency");
      refs.summaryRow7.textContent = formatValue(result["breakEvenPaidEquivalentSubs"], "number");
      refs.summary.value = summaryText(result);
      refs.status.textContent = 'Calculation complete';
      refs.status.className = 'status good';
    }

    refs.copyBtn.addEventListener('click', async function () {
      if (!refs.summary.value.trim()) return;
      try {
        await navigator.clipboard.writeText(refs.summary.value);
      } catch (_error) {
        window.alert('Clipboard unavailable.');
      }
    });

    refs.resetBtn.addEventListener('click', function () {
      applyDefaults();
      render();
    });

    for (const id of FIELD_IDS) {
      refs[id].addEventListener('input', render);
      refs[id].addEventListener('change', render);
    }

    applyDefaults();
    render();
  }

  return {
    CONFIG,
    DEFAULTS,
    SUMMARY_LINES,
    compute,
    summaryText,
    initPage,
  };
});

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', function () {
    if (globalThis.ToolFormulaScaffoldApp) {
      globalThis.ToolFormulaScaffoldApp.initPage();
    }
  });
}
