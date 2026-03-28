(function (global, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  global.SaaSRuleOf40Calculator = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const DEFAULT_INPUTS = {
    previousArr: 4000000,
    currentArr: 5200000,
    profitMarginPercent: 12,
    targetRuleOf40: 40,
  };

  const ASSUMPTION_NOTE = 'Assumption: this v1 uses period-over-period ARR growth rate plus a user-entered profit margin percentage. If you track revenue instead of ARR, keep the basis consistent across both periods.';
  const PLANNING_NOTE = 'Target planning solves the Rule of 40 gap in two simple ways: required ARR growth at the current margin, and required margin at the current growth rate.';
  const BENCHMARK_NOTE = 'Directional benchmark only: 40+ is generally healthy, 50+ is elite, and sub-20 scores usually mean growth and profitability are both under pressure.';

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

    const previousArr = toFiniteNumber(source.previousArr);
    if (previousArr == null || !(previousArr > 0)) {
      errors.push('previousArr must be greater than 0.');
    } else {
      values.previousArr = previousArr;
    }

    const currentArr = toFiniteNumber(source.currentArr);
    if (currentArr == null || currentArr < 0) {
      errors.push('currentArr must be a number at least 0.');
    } else {
      values.currentArr = currentArr;
    }

    const profitMarginPercent = toFiniteNumber(source.profitMarginPercent);
    if (profitMarginPercent == null) {
      errors.push('profitMarginPercent must be a finite number.');
    } else {
      values.profitMarginPercent = profitMarginPercent;
    }

    const targetRuleOf40 = toFiniteNumber(source.targetRuleOf40);
    if (targetRuleOf40 == null) {
      errors.push('targetRuleOf40 must be a finite number.');
    } else {
      values.targetRuleOf40 = targetRuleOf40;
    }

    if (errors.length) {
      return { ok: false, errors: errors, values: null };
    }

    return { ok: true, errors: [], values: values };
  }

  function getHealthBand(ruleOf40Score) {
    if (ruleOf40Score >= 50) {
      return 'Elite';
    }
    if (ruleOf40Score >= 40) {
      return 'Healthy';
    }
    if (ruleOf40Score >= 20) {
      return 'Mixed';
    }
    if (ruleOf40Score >= 0) {
      return 'Fragile';
    }
    return 'Underwater';
  }

  function getTone(healthBand) {
    if (healthBand === 'Elite' || healthBand === 'Healthy') {
      return 'good';
    }
    if (healthBand === 'Mixed') {
      return 'neutral';
    }
    if (healthBand === 'Fragile') {
      return 'warn';
    }
    return 'bad';
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  function formatPercent(value) {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value) + '%';
  }

  function formatScore(value) {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  function buildPlanningState(result) {
    if (result.meetsTarget) {
      return 'Current Rule of 40 already meets or exceeds the selected target.';
    }

    const needsArr = result.additionalArrNeeded > 0;
    const needsMargin = result.marginImprovementNeeded > 0;

    if (needsArr && needsMargin) {
      return 'Current score is below target. Use ARR growth and profit margin as the two operating levers to close the gap.';
    }
    if (needsArr) {
      return 'Current score is below target because ARR growth is too low at the current margin.';
    }
    if (needsMargin) {
      return 'Current score is below target because profit margin is too low at the current ARR growth rate.';
    }
    return 'Current score is below target.';
  }

  function buildInterpretation(result) {
    const lines = [];

    if (result.healthBand === 'Elite') {
      lines.push('Growth and margin combine into a top-tier Rule of 40 score.');
    } else if (result.healthBand === 'Healthy') {
      lines.push('The business clears the common 40-point benchmark.');
    } else if (result.healthBand === 'Mixed') {
      lines.push('There is some efficiency, but the company is still below the common 40-point benchmark.');
    } else if (result.healthBand === 'Fragile') {
      lines.push('The business is above zero, but not yet operating at a strong SaaS efficiency level.');
    } else {
      lines.push('Growth and profitability currently combine into a negative Rule of 40 score.');
    }

    if (result.additionalArrNeeded > 0) {
      lines.push('At the current margin, ARR must increase by ' + formatCurrency(result.additionalArrNeeded) + ' to reach the selected target.');
    } else {
      lines.push('At the current margin, no additional ARR is required for the selected target.');
    }

    if (result.marginImprovementNeeded > 0) {
      lines.push('At the current ARR growth rate, profit margin must improve by ' + formatPercent(result.marginImprovementNeeded) + '.');
    } else {
      lines.push('At the current ARR growth rate, no margin improvement is required for the selected target.');
    }

    return lines.join(' ');
  }

  function buildSummary(result) {
    const lines = [
      '[SaaS Rule of 40 Summary]',
      ASSUMPTION_NOTE,
      PLANNING_NOTE,
      BENCHMARK_NOTE,
      'Previous ARR: ' + formatCurrency(result.input.previousArr),
      'Current ARR: ' + formatCurrency(result.input.currentArr),
      'ARR delta: ' + formatCurrency(result.arrDelta),
      'ARR growth rate: ' + formatPercent(result.growthRatePercent),
      'Profit margin: ' + formatPercent(result.input.profitMarginPercent),
      'Rule of 40 score: ' + formatScore(result.ruleOf40Score),
      'Health band: ' + result.healthBand,
      'Target Rule of 40: ' + formatScore(result.targetRuleOf40),
      'Gap to target: ' + formatScore(result.scoreGapToTarget),
      'Required ARR growth rate at target: ' + formatPercent(result.requiredGrowthRateAtTarget),
      'Required profit margin at target: ' + formatPercent(result.requiredProfitMarginAtTarget),
      'Required current ARR at target: ' + formatCurrency(result.requiredCurrentArrAtTarget),
    ];

    if (result.additionalArrNeeded > 0) {
      lines.push('Target gap: add ' + formatCurrency(result.additionalArrNeeded) + ' of ARR at the current margin.');
    } else {
      lines.push('Target gap: no additional ARR required at the current margin.');
    }

    if (result.marginImprovementNeeded > 0) {
      lines.push('Alternative target gap: improve profit margin by ' + formatPercent(result.marginImprovementNeeded) + ' at the current ARR growth rate.');
    } else {
      lines.push('Alternative target gap: no margin improvement required at the current ARR growth rate.');
    }

    lines.push('Planning state: ' + result.planningState);
    return lines.join('\n');
  }

  function calculate(rawInput) {
    const validation = validateInputs(rawInput);
    if (!validation.ok) {
      return { result: null, error: validation.errors.join(' '), errors: validation.errors };
    }

    const input = validation.values;
    const arrDelta = input.currentArr - input.previousArr;
    const growthRatePercent = (arrDelta / input.previousArr) * 100;
    const ruleOf40Score = growthRatePercent + input.profitMarginPercent;
    const scoreGapToTarget = input.targetRuleOf40 - ruleOf40Score;
    const requiredGrowthRateAtTarget = input.targetRuleOf40 - input.profitMarginPercent;
    const requiredProfitMarginAtTarget = input.targetRuleOf40 - growthRatePercent;
    const requiredCurrentArrAtTarget = input.previousArr * (1 + (requiredGrowthRateAtTarget / 100));
    const additionalArrNeeded = Math.max(0, requiredCurrentArrAtTarget - input.currentArr);
    const marginImprovementNeeded = Math.max(0, requiredProfitMarginAtTarget - input.profitMarginPercent);
    const healthBand = getHealthBand(ruleOf40Score);

    const result = {
      input: input,
      assumptionNote: ASSUMPTION_NOTE,
      planningNote: PLANNING_NOTE,
      benchmarkNote: BENCHMARK_NOTE,
      arrDelta: roundTo(arrDelta, 6),
      growthRatePercent: roundTo(growthRatePercent, 6),
      ruleOf40Score: roundTo(ruleOf40Score, 6),
      targetRuleOf40: roundTo(input.targetRuleOf40, 6),
      scoreGapToTarget: roundTo(scoreGapToTarget, 6),
      requiredGrowthRateAtTarget: roundTo(requiredGrowthRateAtTarget, 6),
      requiredProfitMarginAtTarget: roundTo(requiredProfitMarginAtTarget, 6),
      requiredCurrentArrAtTarget: roundTo(requiredCurrentArrAtTarget, 6),
      additionalArrNeeded: roundTo(additionalArrNeeded, 6),
      marginImprovementNeeded: roundTo(marginImprovementNeeded, 6),
      healthBand: healthBand,
      tone: getTone(healthBand),
      meetsTarget: ruleOf40Score >= input.targetRuleOf40,
      planningState: '',
      interpretation: '',
      summary: '',
    };

    result.planningState = buildPlanningState(result);
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
      previousArr: document.getElementById('previousArr'),
      currentArr: document.getElementById('currentArr'),
      profitMarginPercent: document.getElementById('profitMarginPercent'),
      targetRuleOf40: document.getElementById('targetRuleOf40'),
      errorBox: document.getElementById('errorBox'),
      errorText: document.getElementById('errorText'),
      ruleOf40Score: document.getElementById('ruleOf40ScoreOutput'),
      growthRate: document.getElementById('growthRateOutput'),
      profitMargin: document.getElementById('profitMarginOutput'),
      targetGap: document.getElementById('targetGapOutput'),
      additionalArrNeeded: document.getElementById('additionalArrNeededOutput'),
      marginImprovementNeeded: document.getElementById('marginImprovementNeededOutput'),
      previousArrDetail: document.getElementById('previousArrDetail'),
      currentArrDetail: document.getElementById('currentArrDetail'),
      arrDeltaDetail: document.getElementById('arrDeltaDetail'),
      targetRuleOf40Detail: document.getElementById('targetRuleOf40Detail'),
      requiredGrowthRateDetail: document.getElementById('requiredGrowthRateDetail'),
      requiredProfitMarginDetail: document.getElementById('requiredProfitMarginDetail'),
      requiredCurrentArrDetail: document.getElementById('requiredCurrentArrDetail'),
      healthBandDetail: document.getElementById('healthBandDetail'),
      statusCard: document.getElementById('statusCard'),
      statusTitle: document.getElementById('statusTitle'),
      statusDetail: document.getElementById('statusDetail'),
      interpretationText: document.getElementById('interpretationText'),
      summaryText: document.getElementById('summaryText'),
      copySummaryBtn: document.getElementById('copySummaryBtn'),
      copyStatus: document.getElementById('copyStatus'),
      resetDefaultsBtn: document.getElementById('resetDefaultsBtn'),
    };

    function readInput() {
      return {
        previousArr: fields.previousArr.value,
        currentArr: fields.currentArr.value,
        profitMarginPercent: fields.profitMarginPercent.value,
        targetRuleOf40: fields.targetRuleOf40.value,
      };
    }

    function resetDefaults() {
      setFieldValue(fields.previousArr, DEFAULT_INPUTS.previousArr);
      setFieldValue(fields.currentArr, DEFAULT_INPUTS.currentArr);
      setFieldValue(fields.profitMarginPercent, DEFAULT_INPUTS.profitMarginPercent);
      setFieldValue(fields.targetRuleOf40, DEFAULT_INPUTS.targetRuleOf40);
      render();
    }

    function showError(message) {
      fields.errorText.textContent = message;
      fields.errorBox.hidden = false;
    }

    function hideError() {
      fields.errorText.textContent = '';
      fields.errorBox.hidden = true;
    }

    function render() {
      const calculation = calculate(readInput());
      if (calculation.error) {
        showError(calculation.error);
        return;
      }

      hideError();
      const result = calculation.result;

      fields.ruleOf40Score.textContent = formatScore(result.ruleOf40Score);
      fields.growthRate.textContent = formatPercent(result.growthRatePercent);
      fields.profitMargin.textContent = formatPercent(result.input.profitMarginPercent);
      fields.targetGap.textContent = formatScore(result.scoreGapToTarget);
      fields.additionalArrNeeded.textContent = formatCurrency(result.additionalArrNeeded);
      fields.marginImprovementNeeded.textContent = formatPercent(result.marginImprovementNeeded);

      fields.previousArrDetail.textContent = formatCurrency(result.input.previousArr);
      fields.currentArrDetail.textContent = formatCurrency(result.input.currentArr);
      fields.arrDeltaDetail.textContent = formatCurrency(result.arrDelta);
      fields.targetRuleOf40Detail.textContent = formatScore(result.targetRuleOf40);
      fields.requiredGrowthRateDetail.textContent = formatPercent(result.requiredGrowthRateAtTarget);
      fields.requiredProfitMarginDetail.textContent = formatPercent(result.requiredProfitMarginAtTarget);
      fields.requiredCurrentArrDetail.textContent = formatCurrency(result.requiredCurrentArrAtTarget);
      fields.healthBandDetail.textContent = result.healthBand;

      fields.statusCard.dataset.tone = result.tone;
      fields.statusTitle.textContent = result.healthBand;
      fields.statusDetail.textContent = result.planningState;
      fields.interpretationText.textContent = result.interpretation;
      fields.summaryText.value = result.summary;
      fields.copyStatus.textContent = '';
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

    if (fields.copySummaryBtn) {
      fields.copySummaryBtn.addEventListener('click', function () {
        const text = fields.summaryText.value;
        if (!text) {
          return;
        }

        function onSuccess() {
          fields.copyStatus.textContent = 'Summary copied.';
        }

        function onFailure() {
          fields.copyStatus.textContent = 'Copy failed. Copy manually from the summary box.';
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(onSuccess, onFailure);
          return;
        }

        try {
          fields.summaryText.focus();
          fields.summaryText.select();
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

    if (fields.resetDefaultsBtn) {
      fields.resetDefaultsBtn.addEventListener('click', function () {
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
    BENCHMARK_NOTE: BENCHMARK_NOTE,
    validateInputs: validateInputs,
    getHealthBand: getHealthBand,
    calculate: calculate,
    formatCurrency: formatCurrency,
    formatPercent: formatPercent,
    formatScore: formatScore,
    initBrowser: initBrowser,
  };
});
