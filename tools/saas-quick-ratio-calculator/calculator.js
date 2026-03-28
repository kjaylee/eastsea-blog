(function (global, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  global.SaaSQuickRatioCalculator = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const DEFAULT_INPUTS = {
    newMrr: 40000,
    expansionMrr: 20000,
    churnedMrr: 10000,
    contractionMrr: 5000,
    targetQuickRatio: 4,
  };

  const ASSUMPTION_NOTE = 'Assumption: this calculator is MRR-first. If you prefer ARR, use ARR consistently for all four revenue inputs and read the outputs as ARR-based recurring revenue. No auto-conversion is applied.';
  const PLANNING_NOTE = 'Planning outputs use the current period only. This v1 calculator does not forecast future periods or blend CAC, burn multiple, or Rule of 40 inputs.';

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
      'newMrr',
      'expansionMrr',
      'churnedMrr',
      'contractionMrr',
    ].forEach(function (field) {
      const value = toFiniteNumber(source[field]);
      if (value == null || value < 0) {
        errors.push(field + ' must be a number at least 0.');
      } else {
        values[field] = value;
      }
    });

    const targetQuickRatio = toFiniteNumber(source.targetQuickRatio);
    if (targetQuickRatio == null || !(targetQuickRatio > 0)) {
      errors.push('targetQuickRatio must be greater than 0.');
    } else {
      values.targetQuickRatio = targetQuickRatio;
    }

    if (errors.length) {
      return { ok: false, errors: errors, values: null };
    }

    return { ok: true, errors: [], values: values };
  }

  function deriveQuickRatio(grossMrrGain, grossMrrLoss) {
    if (grossMrrLoss === 0 && grossMrrGain > 0) {
      return {
        quickRatio: Infinity,
        stateNote: 'No MRR loss in the period',
      };
    }

    if (grossMrrLoss === 0 && grossMrrGain === 0) {
      return {
        quickRatio: null,
        stateNote: 'No activity in the period',
      };
    }

    return {
      quickRatio: grossMrrGain / grossMrrLoss,
      stateNote: '',
    };
  }

  function getHealthBand(quickRatio) {
    if (quickRatio == null) {
      return 'Insufficient activity';
    }
    if (quickRatio === Infinity) {
      return 'Exceptional, no loss in period';
    }
    if (quickRatio < 1) {
      return 'Shrinking';
    }
    if (quickRatio < 4) {
      return 'Needs improvement';
    }
    return 'Healthy';
  }

  function getTone(healthBand) {
    if (healthBand === 'Healthy' || healthBand === 'Exceptional, no loss in period') {
      return 'good';
    }
    if (healthBand === 'Needs improvement') {
      return 'warn';
    }
    if (healthBand === 'Shrinking') {
      return 'bad';
    }
    return 'neutral';
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

  function formatRatio(value) {
    if (value === Infinity) {
      return 'Infinity';
    }
    if (value == null) {
      return 'N/A';
    }
    return formatNumber(value, 2);
  }

  function formatRatioDisplay(value) {
    if (value === Infinity) {
      return '∞';
    }
    if (value == null) {
      return 'N/A';
    }
    return formatNumber(value, 2);
  }

  function buildSummary(result) {
    const targetLine = result.additionalGainNeeded > 0
      ? 'Target gap: add ' + formatCurrency(result.additionalGainNeeded) + ' in gross MRR gain to reach the ' + formatRatio(result.targetQuickRatio) + ' target quick ratio.'
      : 'Target gap: current quick ratio already meets or exceeds the ' + formatRatio(result.targetQuickRatio) + ' target.';

    const lines = [
      '[SaaS Quick Ratio Summary]',
      ASSUMPTION_NOTE,
      PLANNING_NOTE,
      'Quick ratio: ' + formatRatio(result.quickRatio),
      'Health band: ' + result.healthBand,
      'Gross MRR gained: ' + formatCurrency(result.grossMrrGain),
      'Gross MRR lost: ' + formatCurrency(result.grossMrrLoss),
      'Net new MRR: ' + formatCurrency(result.netNewMrr),
      'Target quick ratio: ' + formatRatio(result.targetQuickRatio),
      targetLine,
      'Max allowable MRR loss at target: ' + formatCurrency(result.maxAllowableLossAtCurrentGain),
    ];

    if (result.lossReductionNeeded > 0) {
      lines.push('Alternative target gap: reduce gross MRR loss by ' + formatCurrency(result.lossReductionNeeded) + ' at the current gain level.');
    }

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
    const grossMrrGain = input.newMrr + input.expansionMrr;
    const grossMrrLoss = input.churnedMrr + input.contractionMrr;
    const netNewMrr = grossMrrGain - grossMrrLoss;
    const ratioState = deriveQuickRatio(grossMrrGain, grossMrrLoss);
    const requiredGainAtCurrentLoss = input.targetQuickRatio * grossMrrLoss;
    const additionalGainNeeded = Math.max(0, requiredGainAtCurrentLoss - grossMrrGain);
    const maxAllowableLossAtCurrentGain = grossMrrGain / input.targetQuickRatio;
    const lossReductionNeeded = Math.max(0, grossMrrLoss - maxAllowableLossAtCurrentGain);
    const healthBand = getHealthBand(ratioState.quickRatio);

    const result = {
      input: input,
      assumptionNote: ASSUMPTION_NOTE,
      planningNote: PLANNING_NOTE,
      grossMrrGain: roundTo(grossMrrGain, 6),
      grossMrrLoss: roundTo(grossMrrLoss, 6),
      netNewMrr: roundTo(netNewMrr, 6),
      quickRatio: ratioState.quickRatio == null || ratioState.quickRatio === Infinity
        ? ratioState.quickRatio
        : roundTo(ratioState.quickRatio, 6),
      quickRatioDisplay: formatRatioDisplay(ratioState.quickRatio),
      targetQuickRatio: roundTo(input.targetQuickRatio, 6),
      requiredGainAtCurrentLoss: roundTo(requiredGainAtCurrentLoss, 6),
      additionalGainNeeded: roundTo(additionalGainNeeded, 6),
      maxAllowableLossAtCurrentGain: roundTo(maxAllowableLossAtCurrentGain, 6),
      lossReductionNeeded: roundTo(lossReductionNeeded, 6),
      healthBand: healthBand,
      tone: getTone(healthBand),
      stateNote: ratioState.stateNote,
      meetsTarget: additionalGainNeeded === 0,
      arrUseAllowedIfConsistent: true,
    };

    result.summary = buildSummary(result);
    return { result: result, error: '', errors: [] };
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
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
      newMrr: document.getElementById('newMrr'),
      expansionMrr: document.getElementById('expansionMrr'),
      churnedMrr: document.getElementById('churnedMrr'),
      contractionMrr: document.getElementById('contractionMrr'),
      targetQuickRatio: document.getElementById('targetQuickRatio'),
      errorBox: document.getElementById('errorBox'),
      errorText: document.getElementById('errorText'),
      quickRatio: document.getElementById('quickRatioOutput'),
      grossMrrGain: document.getElementById('grossMrrGainOutput'),
      grossMrrLoss: document.getElementById('grossMrrLossOutput'),
      netNewMrr: document.getElementById('netNewMrrOutput'),
      additionalGainNeeded: document.getElementById('additionalGainNeededOutput'),
      maxAllowableLossAtCurrentGain: document.getElementById('maxAllowableLossOutput'),
      newMrrDetail: document.getElementById('newMrrDetail'),
      expansionMrrDetail: document.getElementById('expansionMrrDetail'),
      churnedMrrDetail: document.getElementById('churnedMrrDetail'),
      contractionMrrDetail: document.getElementById('contractionMrrDetail'),
      targetQuickRatioDetail: document.getElementById('targetQuickRatioDetail'),
      lossReductionNeededDetail: document.getElementById('lossReductionNeededDetail'),
      healthBandDetail: document.getElementById('healthBandDetail'),
      requiredGainAtCurrentLossDetail: document.getElementById('requiredGainAtCurrentLossDetail'),
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
        newMrr: fields.newMrr.value,
        expansionMrr: fields.expansionMrr.value,
        churnedMrr: fields.churnedMrr.value,
        contractionMrr: fields.contractionMrr.value,
        targetQuickRatio: fields.targetQuickRatio.value,
      };
    }

    function resetDefaults() {
      setFieldValue(fields.newMrr, DEFAULT_INPUTS.newMrr);
      setFieldValue(fields.expansionMrr, DEFAULT_INPUTS.expansionMrr);
      setFieldValue(fields.churnedMrr, DEFAULT_INPUTS.churnedMrr);
      setFieldValue(fields.contractionMrr, DEFAULT_INPUTS.contractionMrr);
      setFieldValue(fields.targetQuickRatio, DEFAULT_INPUTS.targetQuickRatio);
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

      fields.quickRatio.textContent = result.quickRatioDisplay;
      fields.grossMrrGain.textContent = formatCurrency(result.grossMrrGain);
      fields.grossMrrLoss.textContent = formatCurrency(result.grossMrrLoss);
      fields.netNewMrr.textContent = formatCurrency(result.netNewMrr);
      fields.additionalGainNeeded.textContent = formatCurrency(result.additionalGainNeeded);
      fields.maxAllowableLossAtCurrentGain.textContent = formatCurrency(result.maxAllowableLossAtCurrentGain);

      fields.newMrrDetail.textContent = formatCurrency(result.input.newMrr);
      fields.expansionMrrDetail.textContent = formatCurrency(result.input.expansionMrr);
      fields.churnedMrrDetail.textContent = formatCurrency(result.input.churnedMrr);
      fields.contractionMrrDetail.textContent = formatCurrency(result.input.contractionMrr);
      fields.targetQuickRatioDetail.textContent = formatRatio(result.targetQuickRatio);
      fields.lossReductionNeededDetail.textContent = formatCurrency(result.lossReductionNeeded);
      fields.healthBandDetail.textContent = result.healthBand;
      fields.requiredGainAtCurrentLossDetail.textContent = formatCurrency(result.requiredGainAtCurrentLoss);
      fields.stateNoteDetail.textContent = result.stateNote || 'Standard denominator logic';

      fields.statusCard.dataset.tone = result.tone;
      fields.statusTitle.textContent = result.healthBand;
      fields.statusDetail.textContent = result.stateNote
        ? result.stateNote + '.'
        : (result.meetsTarget
          ? 'Current period performance already meets or exceeds the selected target quick ratio.'
          : 'Target gap planning shows how much more gain or how much less loss is needed at the current period mix.');

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
    validateInputs: validateInputs,
    deriveQuickRatio: deriveQuickRatio,
    getHealthBand: getHealthBand,
    calculate: calculate,
    formatCurrency: formatCurrency,
    formatRatio: formatRatio,
    escapeHtml: escapeHtml,
    initBrowser: initBrowser,
  };
});
