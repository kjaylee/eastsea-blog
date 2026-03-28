(function (global, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  global.SaaSMagicNumberCalculator = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const DEFAULT_INPUTS = {
    previousQuarterRecurringRevenue: 100000,
    currentQuarterRecurringRevenue: 130000,
    previousQuarterSalesMarketingSpend: 120000,
    targetMagicNumber: 0.75,
  };

  const ASSUMPTION_NOTE = 'This v1 uses quarter-over-quarter recurring revenue change, annualized by multiplying the delta by 4, then dividing by prior-quarter sales and marketing spend.';
  const PLANNING_NOTE = 'Target planning keeps the prior-quarter spend base fixed and solves for the current-quarter recurring revenue needed to reach the selected magic number.';
  const ZERO_TARGET_NOTE = 'Target 0 is allowed only to avoid divide-by-zero states, but it is not a practical operating benchmark.';
  const SOURCE_NOTE = 'Public interpretation bands are directional only. Defaults are planning assumptions, not universal finance truth.';

  function roundTo(value, digits) {
    if (!Number.isFinite(value)) {
      return value;
    }
    const factor = Math.pow(10, digits);
    return Math.round((value + Number.EPSILON) * factor) / factor;
  }

  function toFiniteNumber(value) {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : null;
    }
    const text = String(value == null ? '' : value).trim().replace(/,/g, '');
    if (!text) {
      return null;
    }
    const numeric = Number(text);
    return Number.isFinite(numeric) ? numeric : null;
  }

  function mergeWithDefaults(rawInput) {
    return Object.assign({}, DEFAULT_INPUTS, rawInput || {});
  }

  function validateInputs(rawInput) {
    const source = mergeWithDefaults(rawInput);
    const errors = [];
    const values = {};

    [
      'previousQuarterRecurringRevenue',
      'currentQuarterRecurringRevenue',
    ].forEach(function (field) {
      const value = toFiniteNumber(source[field]);
      if (value == null || value < 0) {
        errors.push(field + ' must be a number at least 0.');
      } else {
        values[field] = value;
      }
    });

    const previousQuarterSalesMarketingSpend = toFiniteNumber(source.previousQuarterSalesMarketingSpend);
    if (previousQuarterSalesMarketingSpend == null || !(previousQuarterSalesMarketingSpend > 0)) {
      errors.push('previousQuarterSalesMarketingSpend must be greater than 0.');
    } else {
      values.previousQuarterSalesMarketingSpend = previousQuarterSalesMarketingSpend;
    }

    const targetMagicNumber = toFiniteNumber(source.targetMagicNumber);
    if (targetMagicNumber == null || targetMagicNumber < 0) {
      errors.push('targetMagicNumber must be a number at least 0.');
    } else {
      values.targetMagicNumber = targetMagicNumber;
    }

    if (errors.length) {
      return { ok: false, errors: errors, values: null };
    }

    return { ok: true, errors: [], values: values };
  }

  function getEfficiencyBand(magicNumber) {
    if (magicNumber < 0) {
      return 'Contraction';
    }
    if (magicNumber < 0.5) {
      return 'Weak efficiency';
    }
    if (magicNumber < 0.75) {
      return 'Below target';
    }
    if (magicNumber < 1) {
      return 'Acceptable';
    }
    return 'Strong';
  }

  function getTone(efficiencyBand) {
    if (efficiencyBand === 'Strong') {
      return 'good';
    }
    if (efficiencyBand === 'Acceptable') {
      return 'neutral';
    }
    if (efficiencyBand === 'Below target' || efficiencyBand === 'Weak efficiency') {
      return 'warn';
    }
    return 'bad';
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  function formatNumber(value, digits) {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(value);
  }

  function formatMagic(value) {
    return formatNumber(value, 2);
  }

  function describeTargetState(result) {
    if (result.targetMagicNumber === 0) {
      return ZERO_TARGET_NOTE;
    }
    if (result.magicNumber >= result.targetMagicNumber) {
      return 'Current magic number already meets or exceeds the selected target.';
    }
    return 'Current magic number is below target, so the planning outputs show the revenue gap to close.';
  }

  function buildInterpretation(result) {
    const base = [];

    if (result.efficiencyBand === 'Contraction') {
      base.push('Recurring revenue contracted quarter over quarter, so the magic number is negative.');
    } else if (result.efficiencyBand === 'Weak efficiency') {
      base.push('Growth exists, but each prior-quarter sales and marketing dollar is creating less than 0.5 annualized recurring revenue dollars.');
    } else if (result.efficiencyBand === 'Below target') {
      base.push('Efficiency is improving, but still below the common 0.75 directional threshold.');
    } else if (result.efficiencyBand === 'Acceptable') {
      base.push('The current result is in an acceptable range and is close to or above many planning targets.');
    } else {
      base.push('The current result is strong: annualized recurring revenue added exceeds prior-quarter sales and marketing spend.');
    }

    if (result.targetMagicNumber === 0) {
      base.push(ZERO_TARGET_NOTE);
      return base.join(' ');
    }

    if (result.additionalRecurringRevenueNeededThisQuarter > 0) {
      base.push('To hit the selected target, current-quarter recurring revenue needs to increase by ' + formatCurrency(result.additionalRecurringRevenueNeededThisQuarter) + '.');
    } else {
      base.push('At the selected target, no additional current-quarter recurring revenue is required.');
    }

    if (result.recurringRevenueDelta < 0) {
      base.push('Because the quarter-over-quarter delta is negative, no positive prior-quarter sales and marketing spend would satisfy a positive target at the current revenue trend.');
    }

    return base.join(' ');
  }

  function buildSummary(result) {
    const lines = [
      '[SaaS Magic Number Summary]',
      ASSUMPTION_NOTE,
      PLANNING_NOTE,
      SOURCE_NOTE,
      'Previous quarter recurring revenue: ' + formatCurrency(result.input.previousQuarterRecurringRevenue),
      'Current quarter recurring revenue: ' + formatCurrency(result.input.currentQuarterRecurringRevenue),
      'Prior-quarter sales & marketing spend: ' + formatCurrency(result.input.previousQuarterSalesMarketingSpend),
      'Recurring revenue delta: ' + formatCurrency(result.recurringRevenueDelta),
      'Annualized recurring revenue added: ' + formatCurrency(result.annualizedRecurringRevenueAdded),
      'Magic number: ' + formatMagic(result.magicNumber),
      'ARR created per $1 of spend: ' + formatMagic(result.arrCreatedPerDollar),
      'Efficiency band: ' + result.efficiencyBand,
      'Target magic number: ' + formatMagic(result.targetMagicNumber),
    ];

    if (result.targetMagicNumber === 0) {
      lines.push('Target-gap planning: disabled because target 0 is not a practical benchmark.');
    } else {
      lines.push('Required current-quarter recurring revenue at target: ' + formatCurrency(result.requiredCurrentQuarterRecurringRevenue));
      lines.push('Additional recurring revenue needed this quarter: ' + formatCurrency(result.additionalRecurringRevenueNeededThisQuarter));
      lines.push('Max prior-quarter S&M spend at current revenue delta while still hitting target: ' + formatCurrency(result.maxSalesMarketingSpendAtTarget));
      lines.push('Gap to target magic number: ' + formatMagic(result.magicNumberGapToTarget));
    }

    lines.push('Interpretation: ' + result.interpretation);
    return lines.join('\n');
  }

  function calculate(rawInput) {
    const validation = validateInputs(rawInput);
    if (!validation.ok) {
      return { result: null, error: validation.errors.join(' '), errors: validation.errors };
    }

    const input = validation.values;
    const recurringRevenueDelta = input.currentQuarterRecurringRevenue - input.previousQuarterRecurringRevenue;
    const annualizedRecurringRevenueAdded = recurringRevenueDelta * 4;
    const magicNumber = annualizedRecurringRevenueAdded / input.previousQuarterSalesMarketingSpend;
    const arrCreatedPerDollar = magicNumber;
    const efficiencyBand = getEfficiencyBand(magicNumber);

    let requiredAnnualizedRevenueAddedForTarget = 0;
    let requiredQuarterlyRevenueDeltaForTarget = 0;
    let requiredCurrentQuarterRecurringRevenue = input.currentQuarterRecurringRevenue;
    let additionalRecurringRevenueNeededThisQuarter = 0;
    let maxSalesMarketingSpendAtTargetRaw = 0;
    let maxSalesMarketingSpendAtTarget = 0;
    let magicNumberGapToTarget = 0;

    if (input.targetMagicNumber > 0) {
      requiredAnnualizedRevenueAddedForTarget = input.targetMagicNumber * input.previousQuarterSalesMarketingSpend;
      requiredQuarterlyRevenueDeltaForTarget = requiredAnnualizedRevenueAddedForTarget / 4;
      requiredCurrentQuarterRecurringRevenue = input.previousQuarterRecurringRevenue + requiredQuarterlyRevenueDeltaForTarget;
      additionalRecurringRevenueNeededThisQuarter = Math.max(0, requiredCurrentQuarterRecurringRevenue - input.currentQuarterRecurringRevenue);
      maxSalesMarketingSpendAtTargetRaw = annualizedRecurringRevenueAdded / input.targetMagicNumber;
      maxSalesMarketingSpendAtTarget = Math.max(0, maxSalesMarketingSpendAtTargetRaw);
      magicNumberGapToTarget = input.targetMagicNumber - magicNumber;
    }

    const result = {
      input: input,
      assumptionNote: ASSUMPTION_NOTE,
      planningNote: PLANNING_NOTE,
      zeroTargetNote: ZERO_TARGET_NOTE,
      sourceNote: SOURCE_NOTE,
      recurringRevenueDelta: roundTo(recurringRevenueDelta, 6),
      annualizedRecurringRevenueAdded: roundTo(annualizedRecurringRevenueAdded, 6),
      magicNumber: roundTo(magicNumber, 6),
      arrCreatedPerDollar: roundTo(arrCreatedPerDollar, 6),
      efficiencyBand: efficiencyBand,
      tone: getTone(efficiencyBand),
      targetMagicNumber: roundTo(input.targetMagicNumber, 6),
      requiredAnnualizedRevenueAddedForTarget: roundTo(requiredAnnualizedRevenueAddedForTarget, 6),
      requiredQuarterlyRevenueDeltaForTarget: roundTo(requiredQuarterlyRevenueDeltaForTarget, 6),
      requiredCurrentQuarterRecurringRevenue: roundTo(requiredCurrentQuarterRecurringRevenue, 6),
      additionalRecurringRevenueNeededThisQuarter: roundTo(additionalRecurringRevenueNeededThisQuarter, 6),
      maxSalesMarketingSpendAtTargetRaw: roundTo(maxSalesMarketingSpendAtTargetRaw, 6),
      maxSalesMarketingSpendAtTarget: roundTo(maxSalesMarketingSpendAtTarget, 6),
      magicNumberGapToTarget: roundTo(magicNumberGapToTarget, 6),
      targetState: '',
      interpretation: '',
    };

    result.targetState = describeTargetState(result);
    result.interpretation = buildInterpretation(result);
    result.summary = buildSummary(result);
    return { result: result, error: '', errors: [] };
  }

  function setFieldValue(field, value) {
    if (field) {
      field.value = value;
    }
  }

  function initBrowser() {
    if (typeof document === 'undefined') {
      return;
    }

    const fields = {
      form: document.getElementById('calculatorForm'),
      previousQuarterRecurringRevenue: document.getElementById('previousQuarterRecurringRevenue'),
      currentQuarterRecurringRevenue: document.getElementById('currentQuarterRecurringRevenue'),
      previousQuarterSalesMarketingSpend: document.getElementById('previousQuarterSalesMarketingSpend'),
      targetMagicNumber: document.getElementById('targetMagicNumber'),
      errorBox: document.getElementById('errorBox'),
      errorText: document.getElementById('errorText'),
      magicNumber: document.getElementById('magicNumberOutput'),
      recurringRevenueDelta: document.getElementById('recurringRevenueDeltaOutput'),
      annualizedRecurringRevenueAdded: document.getElementById('annualizedRecurringRevenueAddedOutput'),
      arrCreatedPerDollar: document.getElementById('arrCreatedPerDollarOutput'),
      targetGap: document.getElementById('targetGapOutput'),
      efficiencyBand: document.getElementById('efficiencyBandOutput'),
      requiredCurrentQuarterRecurringRevenue: document.getElementById('requiredCurrentQuarterRecurringRevenueOutput'),
      additionalRecurringRevenueNeededThisQuarter: document.getElementById('additionalRecurringRevenueNeededThisQuarterOutput'),
      maxSalesMarketingSpendAtTarget: document.getElementById('maxSalesMarketingSpendAtTargetOutput'),
      previousQuarterRecurringRevenueDetail: document.getElementById('previousQuarterRecurringRevenueDetail'),
      currentQuarterRecurringRevenueDetail: document.getElementById('currentQuarterRecurringRevenueDetail'),
      previousQuarterSalesMarketingSpendDetail: document.getElementById('previousQuarterSalesMarketingSpendDetail'),
      targetMagicNumberDetail: document.getElementById('targetMagicNumberDetail'),
      requiredQuarterlyRevenueDeltaForTargetDetail: document.getElementById('requiredQuarterlyRevenueDeltaForTargetDetail'),
      targetStateDetail: document.getElementById('targetStateDetail'),
      formulaBasisDetail: document.getElementById('formulaBasisDetail'),
      statusCard: document.getElementById('statusCard'),
      statusTitle: document.getElementById('statusTitle'),
      statusDetail: document.getElementById('statusDetail'),
      interpretation: document.getElementById('interpretationText'),
      summary: document.getElementById('summaryText'),
      copy: document.getElementById('copySummaryBtn'),
      copyStatus: document.getElementById('copyStatus'),
      reset: document.getElementById('resetDefaultsBtn'),
    };

    function readInput() {
      return {
        previousQuarterRecurringRevenue: fields.previousQuarterRecurringRevenue.value,
        currentQuarterRecurringRevenue: fields.currentQuarterRecurringRevenue.value,
        previousQuarterSalesMarketingSpend: fields.previousQuarterSalesMarketingSpend.value,
        targetMagicNumber: fields.targetMagicNumber.value,
      };
    }

    function resetDefaults() {
      setFieldValue(fields.previousQuarterRecurringRevenue, DEFAULT_INPUTS.previousQuarterRecurringRevenue);
      setFieldValue(fields.currentQuarterRecurringRevenue, DEFAULT_INPUTS.currentQuarterRecurringRevenue);
      setFieldValue(fields.previousQuarterSalesMarketingSpend, DEFAULT_INPUTS.previousQuarterSalesMarketingSpend);
      setFieldValue(fields.targetMagicNumber, DEFAULT_INPUTS.targetMagicNumber);
      render();
    }

    function showError(message) {
      fields.errorText.textContent = message;
      fields.errorBox.hidden = false;
    }

    function hideError() {
      fields.errorBox.hidden = true;
      fields.errorText.textContent = '';
    }

    function render() {
      const calculation = calculate(readInput());

      if (calculation.error) {
        showError(calculation.error);
        return;
      }

      hideError();
      const result = calculation.result;

      fields.magicNumber.textContent = formatMagic(result.magicNumber);
      fields.recurringRevenueDelta.textContent = formatCurrency(result.recurringRevenueDelta);
      fields.annualizedRecurringRevenueAdded.textContent = formatCurrency(result.annualizedRecurringRevenueAdded);
      fields.arrCreatedPerDollar.textContent = formatMagic(result.arrCreatedPerDollar) + 'x';
      fields.targetGap.textContent = result.targetMagicNumber === 0
        ? '0.00'
        : formatMagic(result.magicNumberGapToTarget);
      fields.efficiencyBand.textContent = result.efficiencyBand;
      fields.requiredCurrentQuarterRecurringRevenue.textContent = formatCurrency(result.requiredCurrentQuarterRecurringRevenue);
      fields.additionalRecurringRevenueNeededThisQuarter.textContent = formatCurrency(result.additionalRecurringRevenueNeededThisQuarter);
      fields.maxSalesMarketingSpendAtTarget.textContent = formatCurrency(result.maxSalesMarketingSpendAtTarget);

      fields.previousQuarterRecurringRevenueDetail.textContent = formatCurrency(result.input.previousQuarterRecurringRevenue);
      fields.currentQuarterRecurringRevenueDetail.textContent = formatCurrency(result.input.currentQuarterRecurringRevenue);
      fields.previousQuarterSalesMarketingSpendDetail.textContent = formatCurrency(result.input.previousQuarterSalesMarketingSpend);
      fields.targetMagicNumberDetail.textContent = formatMagic(result.targetMagicNumber);
      fields.requiredQuarterlyRevenueDeltaForTargetDetail.textContent = formatCurrency(result.requiredQuarterlyRevenueDeltaForTarget);
      fields.targetStateDetail.textContent = result.targetState;
      fields.formulaBasisDetail.textContent = 'Delta × 4 ÷ prior-quarter S&M spend';

      fields.statusCard.dataset.tone = result.tone;
      fields.statusTitle.textContent = result.efficiencyBand;
      fields.statusDetail.textContent = result.targetState;
      fields.interpretation.textContent = result.interpretation;
      fields.summary.value = result.summary;
      if (fields.copyStatus) {
        fields.copyStatus.textContent = '';
      }
    }

    if (fields.form) {
      fields.form.addEventListener('submit', function (event) {
        event.preventDefault();
        render();
      });
      fields.form.addEventListener('input', function () {
        render();
      });
    }

    if (fields.copy) {
      fields.copy.addEventListener('click', function () {
        const text = fields.summary.value;
        if (!text) {
          return;
        }

        function onSuccess() {
          fields.copyStatus.textContent = 'Summary copied.';
        }

        function onFailure() {
          fields.copyStatus.textContent = 'Copy failed. Select the summary and copy manually.';
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(onSuccess, onFailure);
          return;
        }

        try {
          fields.summary.focus();
          fields.summary.select();
          const copied = document.execCommand('copy');
          if (copied) {
            onSuccess();
          } else {
            onFailure();
          }
        } catch (error) {
          onFailure();
        }
      });
    }

    if (fields.reset) {
      fields.reset.addEventListener('click', function () {
        resetDefaults();
      });
    }

    resetDefaults();
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initBrowser);
    } else {
      initBrowser();
    }
  }

  return {
    DEFAULT_INPUTS: DEFAULT_INPUTS,
    ASSUMPTION_NOTE: ASSUMPTION_NOTE,
    PLANNING_NOTE: PLANNING_NOTE,
    ZERO_TARGET_NOTE: ZERO_TARGET_NOTE,
    SOURCE_NOTE: SOURCE_NOTE,
    validateInputs: validateInputs,
    getEfficiencyBand: getEfficiencyBand,
    calculate: calculate,
    formatCurrency: formatCurrency,
    formatMagic: formatMagic,
    initBrowser: initBrowser,
  };
});
