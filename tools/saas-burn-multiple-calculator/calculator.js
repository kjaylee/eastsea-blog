(function (global, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  global.SaaSBurnMultipleCalculator = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const DEFAULT_INPUTS = {
    netBurn: 1200000,
    beginningArr: 4000000,
    endingArr: 5000000,
    targetBurnMultiple: 1.5,
  };

  const ASSUMPTION_NOTE = 'Assumption: this calculator is ARR-first. Enter beginning and ending ARR for the same period basis. If you only track MRR, annualize the numbers first or use the same period consistently outside this page.';
  const BENCHMARK_NOTE = 'Directional benchmark only: below 1.0x is elite, 1.0x to 2.0x is generally good for venture-stage SaaS, 2.0x to 3.0x needs improvement, and above 3.0x is high burn relative to net new ARR.';

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
    const values = {};
    const errors = [];

    ['netBurn', 'beginningArr', 'endingArr'].forEach(function (field) {
      const value = toFiniteNumber(source[field]);
      if (value == null || value < 0) {
        errors.push(field + ' must be a number at least 0.');
      } else {
        values[field] = value;
      }
    });

    const targetBurnMultiple = toFiniteNumber(source.targetBurnMultiple);
    if (targetBurnMultiple == null || !(targetBurnMultiple > 0)) {
      errors.push('targetBurnMultiple must be greater than 0.');
    } else {
      values.targetBurnMultiple = targetBurnMultiple;
    }

    if (errors.length) {
      return { ok: false, errors: errors, values: null };
    }

    return { ok: true, errors: [], values: values };
  }

  function deriveBurnMultipleState(netBurn, netNewArr) {
    if (netNewArr < 0) {
      return {
        burnMultiple: null,
        stateNote: 'Negative net new ARR makes burn multiple non-comparable',
      };
    }

    if (netNewArr === 0 && netBurn > 0) {
      return {
        burnMultiple: Infinity,
        stateNote: 'No net new ARR in the period',
      };
    }

    if (netNewArr === 0 && netBurn === 0) {
      return {
        burnMultiple: null,
        stateNote: 'No burn and no ARR movement',
      };
    }

    if (netBurn === 0 && netNewArr > 0) {
      return {
        burnMultiple: 0,
        stateNote: 'Breakeven or profitable growth',
      };
    }

    return {
      burnMultiple: netBurn / netNewArr,
      stateNote: '',
    };
  }

  function getHealthBand(burnMultiple, netNewArr, netBurn) {
    if (burnMultiple === Infinity) {
      return 'No net new ARR';
    }
    if (burnMultiple == null && netNewArr < 0) {
      return 'Contracting';
    }
    if (burnMultiple == null && netNewArr === 0 && netBurn === 0) {
      return 'No burn, no growth';
    }
    if (burnMultiple === 0) {
      return 'Breakeven or profitable growth';
    }
    if (burnMultiple < 1) {
      return 'Elite capital efficiency';
    }
    if (burnMultiple < 2) {
      return 'Good for venture-stage';
    }
    if (burnMultiple < 3) {
      return 'Needs improvement';
    }
    return 'High burn / risky';
  }

  function getTone(healthBand) {
    if (healthBand === 'Elite capital efficiency' || healthBand === 'Breakeven or profitable growth') {
      return 'good';
    }
    if (healthBand === 'Good for venture-stage') {
      return 'ok';
    }
    if (healthBand === 'Needs improvement') {
      return 'warn';
    }
    if (healthBand === 'High burn / risky' || healthBand === 'Contracting' || healthBand === 'No net new ARR') {
      return 'bad';
    }
    return 'neutral';
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  function formatNumber(value, digits) {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(value);
  }

  function formatMultiple(value) {
    if (value === Infinity) {
      return 'Infinity';
    }
    if (value == null) {
      return 'N/A';
    }
    return formatNumber(value, 2) + 'x';
  }

  function buildSummary(result) {
    const lines = [
      '[SaaS Burn Multiple Summary]',
      ASSUMPTION_NOTE,
      BENCHMARK_NOTE,
      'Burn multiple: ' + formatMultiple(result.burnMultiple),
      'Health band: ' + result.healthBand,
      'Net burn: ' + formatCurrency(result.input.netBurn),
      'Beginning ARR: ' + formatCurrency(result.input.beginningArr),
      'Ending ARR: ' + formatCurrency(result.input.endingArr),
      'Net new ARR: ' + formatCurrency(result.netNewArr),
      'Target burn multiple: ' + formatMultiple(result.targetBurnMultiple),
    ];

    if (result.additionalNetNewArrNeeded > 0) {
      lines.push('Target gap: add ' + formatCurrency(result.additionalNetNewArrNeeded) + ' of net new ARR to reach the selected burn multiple.');
    } else {
      lines.push('Target gap: current net new ARR already supports the selected burn multiple.');
    }

    if (result.burnReductionNeeded > 0) {
      lines.push('Alternative target gap: reduce net burn by ' + formatCurrency(result.burnReductionNeeded) + ' at the current ARR growth level.');
    }

    lines.push('Max burn at current ARR growth for target: ' + formatCurrency(result.maxBurnAtTarget));
    lines.push('Target ending ARR at selected multiple: ' + formatCurrency(result.targetEndingArr));

    if (result.stateNote) {
      lines.push('State note: ' + result.stateNote + '.');
    }

    return lines.join('\n');
  }

  function calculate(rawInput) {
    const validation = validateInputs(rawInput);
    if (!validation.ok) {
      return { result: null, error: validation.errors.join(' '), errors: validation.errors };
    }

    const input = validation.values;
    const netNewArr = input.endingArr - input.beginningArr;
    const ratioState = deriveBurnMultipleState(input.netBurn, netNewArr);
    const requiredNetNewArrAtTarget = input.netBurn / input.targetBurnMultiple;
    const additionalNetNewArrNeeded = Math.max(0, requiredNetNewArrAtTarget - netNewArr);
    const maxBurnAtTarget = input.targetBurnMultiple * Math.max(netNewArr, 0);
    const burnReductionNeeded = Math.max(0, input.netBurn - maxBurnAtTarget);
    const targetEndingArr = input.beginningArr + requiredNetNewArrAtTarget;
    const healthBand = getHealthBand(ratioState.burnMultiple, netNewArr, input.netBurn);

    const result = {
      input: input,
      assumptionNote: ASSUMPTION_NOTE,
      benchmarkNote: BENCHMARK_NOTE,
      netNewArr: roundTo(netNewArr, 6),
      burnMultiple: ratioState.burnMultiple == null || ratioState.burnMultiple === Infinity
        ? ratioState.burnMultiple
        : roundTo(ratioState.burnMultiple, 6),
      targetBurnMultiple: roundTo(input.targetBurnMultiple, 6),
      requiredNetNewArrAtTarget: roundTo(requiredNetNewArrAtTarget, 6),
      additionalNetNewArrNeeded: roundTo(additionalNetNewArrNeeded, 6),
      maxBurnAtTarget: roundTo(maxBurnAtTarget, 6),
      burnReductionNeeded: roundTo(burnReductionNeeded, 6),
      targetEndingArr: roundTo(targetEndingArr, 6),
      healthBand: healthBand,
      tone: getTone(healthBand),
      stateNote: ratioState.stateNote,
      meetsTargetByGrowth: additionalNetNewArrNeeded === 0,
      meetsTargetByBurn: burnReductionNeeded === 0,
    };

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
      netBurn: document.getElementById('netBurn'),
      beginningArr: document.getElementById('beginningArr'),
      endingArr: document.getElementById('endingArr'),
      targetBurnMultiple: document.getElementById('targetBurnMultiple'),
      errorBox: document.getElementById('errorBox'),
      errorText: document.getElementById('errorText'),
      burnMultiple: document.getElementById('burnMultipleOutput'),
      netNewArr: document.getElementById('netNewArrOutput'),
      additionalNetNewArrNeeded: document.getElementById('additionalNetNewArrNeededOutput'),
      burnReductionNeeded: document.getElementById('burnReductionNeededOutput'),
      maxBurnAtTarget: document.getElementById('maxBurnAtTargetOutput'),
      targetEndingArr: document.getElementById('targetEndingArrOutput'),
      netBurnDetail: document.getElementById('netBurnDetail'),
      beginningArrDetail: document.getElementById('beginningArrDetail'),
      endingArrDetail: document.getElementById('endingArrDetail'),
      targetBurnMultipleDetail: document.getElementById('targetBurnMultipleDetail'),
      requiredNetNewArrDetail: document.getElementById('requiredNetNewArrDetail'),
      healthBandDetail: document.getElementById('healthBandDetail'),
      stateNoteDetail: document.getElementById('stateNoteDetail'),
      statusCard: document.getElementById('statusCard'),
      statusTitle: document.getElementById('statusTitle'),
      statusDetail: document.getElementById('statusDetail'),
      summary: document.getElementById('summaryText'),
      copy: document.getElementById('copySummaryBtn'),
      copyStatus: document.getElementById('copyStatus'),
      reset: document.getElementById('resetDefaultsBtn'),
    };

    function readInput() {
      return {
        netBurn: fields.netBurn.value,
        beginningArr: fields.beginningArr.value,
        endingArr: fields.endingArr.value,
        targetBurnMultiple: fields.targetBurnMultiple.value,
      };
    }

    function resetDefaults() {
      setFieldValue(fields.netBurn, DEFAULT_INPUTS.netBurn);
      setFieldValue(fields.beginningArr, DEFAULT_INPUTS.beginningArr);
      setFieldValue(fields.endingArr, DEFAULT_INPUTS.endingArr);
      setFieldValue(fields.targetBurnMultiple, DEFAULT_INPUTS.targetBurnMultiple);
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

      fields.burnMultiple.textContent = formatMultiple(result.burnMultiple);
      fields.netNewArr.textContent = formatCurrency(result.netNewArr);
      fields.additionalNetNewArrNeeded.textContent = formatCurrency(result.additionalNetNewArrNeeded);
      fields.burnReductionNeeded.textContent = formatCurrency(result.burnReductionNeeded);
      fields.maxBurnAtTarget.textContent = formatCurrency(result.maxBurnAtTarget);
      fields.targetEndingArr.textContent = formatCurrency(result.targetEndingArr);

      fields.netBurnDetail.textContent = formatCurrency(result.input.netBurn);
      fields.beginningArrDetail.textContent = formatCurrency(result.input.beginningArr);
      fields.endingArrDetail.textContent = formatCurrency(result.input.endingArr);
      fields.targetBurnMultipleDetail.textContent = formatMultiple(result.targetBurnMultiple);
      fields.requiredNetNewArrDetail.textContent = formatCurrency(result.requiredNetNewArrAtTarget);
      fields.healthBandDetail.textContent = result.healthBand;
      fields.stateNoteDetail.textContent = result.stateNote || 'Standard ratio logic';

      fields.statusCard.dataset.tone = result.tone;
      fields.statusTitle.textContent = result.healthBand;

      if (result.stateNote) {
        fields.statusDetail.textContent = result.stateNote + '.';
      } else if (result.meetsTargetByGrowth && result.meetsTargetByBurn) {
        fields.statusDetail.textContent = 'Current burn and ARR growth already support the selected target burn multiple.';
      } else {
        fields.statusDetail.textContent = 'Use the ARR gap and burn reduction outputs as the two operating levers to reach the target burn multiple.';
      }

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
    BENCHMARK_NOTE: BENCHMARK_NOTE,
    validateInputs: validateInputs,
    deriveBurnMultipleState: deriveBurnMultipleState,
    getHealthBand: getHealthBand,
    calculate: calculate,
    formatCurrency: formatCurrency,
    formatMultiple: formatMultiple,
    initBrowser: initBrowser,
  };
});
