(function (root) {
  const CONSTANTS = Object.freeze({
    MILL: 1000,
    LADDER_IMPRESSIONS: Object.freeze([10000, 100000, 1000000]),
    MAX_SHARE_RATE_PCT: 99.9
  });

  const DEFAULTS = Object.freeze({
    mode: 'ecpm',
    grossRevenue: 1250,
    impressions: 500000,
    targetEcpm: 2.75,
    shareRatePct: 20,
    fixedCost: 100,
    currencyLabel: 'USD'
  });

  const TEXT = Object.freeze({
    en: Object.freeze({
      invalid: 'Please review your inputs.',
      mode: 'Solve mode must be ecpm, revenue, or impressions.',
      grossRevenue: 'Gross revenue must be 0 or above.',
      impressions: 'Impressions must be greater than zero.',
      targetEcpm: 'Target eCPM must be greater than zero.',
      shareRatePct: 'Revenue share / mediation fee must stay between 0 and 99.9%.',
      fixedCost: 'Fixed cost must be 0 or above.',
      copied: 'Summary copied.',
      copyFail: 'Clipboard unavailable. Please copy manually.',
      waiting: 'Enter revenue, impressions, and target net eCPM to compare the current yield against the target.',
      belowTarget: 'Current net eCPM is below target. Increase revenue, reduce fee drag, or cut fixed serving cost.',
      onTarget: 'Current net eCPM is effectively on target.',
      aboveTarget: 'Current net eCPM is above target. Current monetization clears the target net yield.',
      negativeNetRevenue: 'Net revenue is negative after fee drag and fixed cost. The calculator keeps the math visible because the current setup is underwater.',
      impossibleImpressions: 'Positive target eCPM cannot be met from zero or negative current net revenue.',
      summaryTitle: '[eCPM Calculator Summary]'
    })
  });

  function round(value, digits) {
    const factor = 10 ** digits;
    return Math.round((value + Number.EPSILON) * factor) / factor;
  }

  function round2(value) {
    return round(value, 2);
  }

  function round4(value) {
    return round(value, 4);
  }

  function normalizeInput(input) {
    const source = input || {};
    return {
      mode: source.mode || DEFAULTS.mode,
      grossRevenue: Number(source.grossRevenue),
      impressions: Number(source.impressions),
      targetEcpm: Number(source.targetEcpm),
      shareRatePct: Number(source.shareRatePct),
      fixedCost: Number(source.fixedCost),
      currencyLabel: String(source.currencyLabel == null ? DEFAULTS.currencyLabel : source.currencyLabel).trim() || DEFAULTS.currencyLabel
    };
  }

  function validate(input, lang) {
    const t = TEXT[lang] || TEXT.en;
    if (!['ecpm', 'revenue', 'impressions'].includes(input.mode)) return t.mode;
    if (!Number.isFinite(input.grossRevenue) || input.grossRevenue < 0) return t.grossRevenue;
    if (!Number.isFinite(input.impressions) || input.impressions <= 0) return t.impressions;
    if (!Number.isFinite(input.targetEcpm) || input.targetEcpm <= 0) return t.targetEcpm;
    if (!Number.isFinite(input.shareRatePct) || input.shareRatePct < 0 || input.shareRatePct > CONSTANTS.MAX_SHARE_RATE_PCT) return t.shareRatePct;
    if (!Number.isFinite(input.fixedCost) || input.fixedCost < 0) return t.fixedCost;
    return '';
  }

  function computeGrossEcpm(grossRevenue, impressions) {
    return (grossRevenue / impressions) * CONSTANTS.MILL;
  }

  function computeNetRevenue(grossRevenue, shareRatePct, fixedCost) {
    return (grossRevenue * (1 - (shareRatePct / 100))) - fixedCost;
  }

  function computeRequiredGrossRevenue(targetEcpm, impressions, shareRatePct, fixedCost) {
    const requiredNetRevenue = (targetEcpm / CONSTANTS.MILL) * impressions;
    return (requiredNetRevenue + fixedCost) / (1 - (shareRatePct / 100));
  }

  function computeRequiredImpressions(netRevenue, targetEcpm) {
    return (netRevenue / targetEcpm) * CONSTANTS.MILL;
  }

  function buildRevenueLadder(ecpm) {
    return CONSTANTS.LADDER_IMPRESSIONS.map(function (impressions) {
      return {
        impressions: impressions,
        revenue: round2((ecpm / CONSTANTS.MILL) * impressions)
      };
    });
  }

  function formatPlainNumber(value, digits) {
    return round(value, digits == null ? 2 : digits).toFixed(digits == null ? 2 : digits);
  }

  function formatMoneyLabel(value, currencyLabel) {
    const sign = value < 0 ? '-' : '';
    const amount = Math.abs(round2(value)).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    const label = (currencyLabel || DEFAULTS.currencyLabel).trim();

    if (!label) {
      return sign + amount;
    }

    if (['$', '€', '£', '¥', '₩'].includes(label)) {
      return sign + label + amount;
    }

    if (/^[A-Za-z]{3,4}$/.test(label)) {
      return sign + label.toUpperCase() + ' ' + amount;
    }

    return sign + amount + ' ' + label;
  }

  function getTargetStatus(netEcpm, targetEcpm) {
    const delta = netEcpm - targetEcpm;
    if (Math.abs(delta) < 0.005) {
      return 'on-target';
    }
    return delta > 0 ? 'above' : 'below';
  }

  function buildStatus(result, lang) {
    const t = TEXT[lang] || TEXT.en;
    if (result.netRevenue < 0) {
      return t.negativeNetRevenue;
    }
    if (result.targetStatus === 'above') {
      return t.aboveTarget;
    }
    if (result.targetStatus === 'on-target') {
      return t.onTarget;
    }
    return t.belowTarget;
  }

  function buildSummary(result, lang) {
    const t = TEXT[lang] || TEXT.en;
    const ladderLine = result.netRevenueLadder.map(function (row) {
      return row.impressions.toLocaleString('en-US') + ': ' + formatMoneyLabel(row.revenue, result.inputs.currencyLabel);
    }).join(' | ');

    return [
      t.summaryTitle,
      'Mode: ' + result.inputs.mode,
      'Gross revenue input: ' + formatMoneyLabel(result.inputs.grossRevenue, result.inputs.currencyLabel),
      'Impressions: ' + result.inputs.impressions.toLocaleString('en-US'),
      'Revenue share / mediation fee: ' + formatPlainNumber(result.inputs.shareRatePct, 2) + '%',
      'Fixed cost: ' + formatMoneyLabel(result.inputs.fixedCost, result.inputs.currencyLabel),
      'Gross eCPM: ' + formatPlainNumber(result.grossEcpm, 2),
      'Net revenue: ' + formatMoneyLabel(result.netRevenue, result.inputs.currencyLabel),
      'Net eCPM: ' + formatPlainNumber(result.netEcpm, 2),
      'Target net eCPM: ' + formatPlainNumber(result.inputs.targetEcpm, 2),
      'Target gap: ' + formatPlainNumber(result.targetGap, 2) + ' (' + result.targetStatus + ')',
      'Required net revenue at current impressions: ' + formatMoneyLabel(result.requiredNetRevenue, result.inputs.currencyLabel),
      'Required gross revenue at current impressions: ' + formatMoneyLabel(result.requiredGrossRevenue, result.inputs.currencyLabel),
      'Required impressions at current net revenue: ' + (result.requiredImpressions == null ? 'Impossible while net revenue <= 0' : round2(result.requiredImpressions).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })),
      'Net revenue ladder: ' + ladderLine
    ].join('\n');
  }

  function calculate(input, options) {
    const lang = (options && options.lang) || 'en';
    const normalized = normalizeInput(input);
    const error = validate(normalized, lang);
    if (error) {
      return { result: null, error: error };
    }

    const grossEcpm = computeGrossEcpm(normalized.grossRevenue, normalized.impressions);
    const netRevenue = computeNetRevenue(normalized.grossRevenue, normalized.shareRatePct, normalized.fixedCost);
    const netEcpm = computeGrossEcpm(netRevenue, normalized.impressions);
    const targetGap = netEcpm - normalized.targetEcpm;
    const requiredNetRevenue = (normalized.targetEcpm / CONSTANTS.MILL) * normalized.impressions;
    const requiredGrossRevenue = computeRequiredGrossRevenue(
      normalized.targetEcpm,
      normalized.impressions,
      normalized.shareRatePct,
      normalized.fixedCost
    );
    const rawRequiredImpressions = computeRequiredImpressions(netRevenue, normalized.targetEcpm);
    const requiredImpressions = rawRequiredImpressions > 0 ? rawRequiredImpressions : null;
    const targetStatus = getTargetStatus(netEcpm, normalized.targetEcpm);

    const result = {
      inputs: normalized,
      grossEcpm: round4(grossEcpm),
      netRevenue: round2(netRevenue),
      netEcpm: round4(netEcpm),
      targetGap: round4(targetGap),
      targetStatus: targetStatus,
      shareDrag: round2(normalized.grossRevenue - (normalized.grossRevenue * (1 - (normalized.shareRatePct / 100)))),
      requiredNetRevenue: round2(requiredNetRevenue),
      requiredGrossRevenue: round2(requiredGrossRevenue),
      rawRequiredImpressions: round4(rawRequiredImpressions),
      requiredImpressions: requiredImpressions == null ? null : round4(requiredImpressions),
      grossRevenueLadder: buildRevenueLadder(grossEcpm),
      netRevenueLadder: buildRevenueLadder(netEcpm)
    };

    result.status = buildStatus(result, lang);
    result.impressionsStatus = result.requiredImpressions == null ? (TEXT[lang] || TEXT.en).impossibleImpressions : '';
    result.summary = buildSummary(result, lang);

    return { result: result, error: '' };
  }

  const api = {
    CONSTANTS: CONSTANTS,
    DEFAULTS: DEFAULTS,
    normalizeInput: normalizeInput,
    validate: validate,
    computeGrossEcpm: computeGrossEcpm,
    computeNetRevenue: computeNetRevenue,
    computeRequiredGrossRevenue: computeRequiredGrossRevenue,
    computeRequiredImpressions: computeRequiredImpressions,
    buildRevenueLadder: buildRevenueLadder,
    calculate: calculate
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  root.EcpmCalculator = api;

  if (typeof document === 'undefined') {
    return;
  }

  const elements = {
    form: document.getElementById('calculatorForm'),
    mode: document.getElementById('mode'),
    grossRevenue: document.getElementById('grossRevenue'),
    impressions: document.getElementById('impressions'),
    targetEcpm: document.getElementById('targetEcpm'),
    shareRatePct: document.getElementById('shareRatePct'),
    fixedCost: document.getElementById('fixedCost'),
    currencyLabel: document.getElementById('currencyLabel'),
    modeButtons: Array.from(document.querySelectorAll('#modeSwitch [data-mode]')),
    modeNote: document.getElementById('modeNote'),
    status: document.getElementById('status'),
    error: document.getElementById('error'),
    copyStatus: document.getElementById('copyStatus'),
    summary: document.getElementById('summary'),
    primaryLabel: document.getElementById('primaryLabel'),
    primaryValue: document.getElementById('primaryValue'),
    grossEcpmValue: document.getElementById('grossEcpmValue'),
    netEcpmValue: document.getElementById('netEcpmValue'),
    netRevenueValue: document.getElementById('netRevenueValue'),
    shareDragValue: document.getElementById('shareDragValue'),
    fixedCostValue: document.getElementById('fixedCostValue'),
    targetGapValue: document.getElementById('targetGapValue'),
    requiredGrossRevenueValue: document.getElementById('requiredGrossRevenueValue'),
    requiredNetRevenueValue: document.getElementById('requiredNetRevenueValue'),
    requiredImpressionsValue: document.getElementById('requiredImpressionsValue'),
    reverseRevenueValue: document.getElementById('reverseRevenueValue'),
    reverseImpressionsValue: document.getElementById('reverseImpressionsValue'),
    ladderBody: document.getElementById('ladderBody'),
    resetBtn: document.getElementById('resetBtn'),
    copyBtn: document.getElementById('copyBtn')
  };

  function formatDecimal(value, digits) {
    return Number(value).toLocaleString('en-US', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    });
  }

  function formatEcpm(value, currencyLabel) {
    return formatMoneyLabel(value, currencyLabel) + ' / 1k';
  }

  function formatImpressions(value) {
    return Number(value).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function readInput() {
    return {
      mode: elements.mode.value,
      grossRevenue: elements.grossRevenue.value,
      impressions: elements.impressions.value,
      targetEcpm: elements.targetEcpm.value,
      shareRatePct: elements.shareRatePct.value,
      fixedCost: elements.fixedCost.value,
      currencyLabel: elements.currencyLabel.value
    };
  }

  function setMode(mode) {
    elements.mode.value = mode;
    elements.modeButtons.forEach(function (button) {
      button.classList.toggle('active', button.dataset.mode === mode);
    });
    render();
  }

  function clearOutputs(message) {
    elements.error.textContent = message;
    elements.error.classList.add('show');
    elements.status.textContent = (TEXT.en || TEXT.en).waiting;
    elements.status.classList.remove('warn');
    elements.copyStatus.classList.remove('show');
    elements.copyStatus.textContent = '';
    [
      elements.primaryValue,
      elements.grossEcpmValue,
      elements.netEcpmValue,
      elements.netRevenueValue,
      elements.shareDragValue,
      elements.fixedCostValue,
      elements.targetGapValue,
      elements.requiredGrossRevenueValue,
      elements.requiredNetRevenueValue,
      elements.requiredImpressionsValue,
      elements.reverseRevenueValue,
      elements.reverseImpressionsValue
    ].forEach(function (node) {
      node.textContent = '—';
    });
    elements.ladderBody.innerHTML = '';
    elements.summary.value = '';
  }

  function render() {
    const { result, error } = calculate(readInput(), { lang: 'en' });
    if (error) {
      clearOutputs(error);
      return;
    }

    elements.error.classList.remove('show');
    elements.error.textContent = '';

    const currencyLabel = result.inputs.currencyLabel;
    elements.status.textContent = result.status;
    elements.status.classList.toggle('warn', result.netRevenue < 0 || result.targetStatus === 'below');

    if (result.inputs.mode === 'ecpm') {
      elements.primaryLabel.textContent = 'Current net eCPM';
      elements.primaryValue.textContent = formatEcpm(result.netEcpm, currencyLabel);
      elements.modeNote.textContent = 'Current view shows both gross and net eCPM, then compares current net yield against the target.';
    } else if (result.inputs.mode === 'revenue') {
      elements.primaryLabel.textContent = 'Gross revenue required for target net eCPM';
      elements.primaryValue.textContent = formatMoneyLabel(result.requiredGrossRevenue, currencyLabel);
      elements.modeNote.textContent = 'Revenue view reverse-solves the gross revenue required to hit the target net eCPM at the current impression baseline.';
    } else {
      elements.primaryLabel.textContent = 'Impressions required at current net revenue';
      elements.primaryValue.textContent = result.requiredImpressions == null
        ? 'Impossible while net revenue <= 0'
        : formatImpressions(result.requiredImpressions);
      elements.modeNote.textContent = 'Impressions view spreads current net revenue across the target net eCPM to show the impression requirement.';
    }

    elements.grossEcpmValue.textContent = formatEcpm(result.grossEcpm, currencyLabel);
    elements.netEcpmValue.textContent = formatEcpm(result.netEcpm, currencyLabel);
    elements.netRevenueValue.textContent = formatMoneyLabel(result.netRevenue, currencyLabel);
    elements.shareDragValue.textContent = formatMoneyLabel(result.shareDrag, currencyLabel);
    elements.fixedCostValue.textContent = formatMoneyLabel(result.inputs.fixedCost, currencyLabel);
    elements.targetGapValue.textContent = formatDecimal(result.targetGap, 2);
    elements.requiredGrossRevenueValue.textContent = formatMoneyLabel(result.requiredGrossRevenue, currencyLabel);
    elements.requiredNetRevenueValue.textContent = formatMoneyLabel(result.requiredNetRevenue, currencyLabel);
    elements.requiredImpressionsValue.textContent = result.requiredImpressions == null
      ? 'Impossible while net revenue <= 0'
      : formatImpressions(result.requiredImpressions);
    elements.reverseRevenueValue.textContent = formatMoneyLabel(result.requiredGrossRevenue, currencyLabel);
    elements.reverseImpressionsValue.textContent = result.requiredImpressions == null
      ? 'Impossible while net revenue <= 0'
      : formatImpressions(result.requiredImpressions);

    elements.ladderBody.innerHTML = result.netRevenueLadder.map(function (row, index) {
      const grossRow = result.grossRevenueLadder[index];
      return '<tr><td>' +
        row.impressions.toLocaleString('en-US') +
        '</td><td>' +
        formatMoneyLabel(grossRow.revenue, currencyLabel) +
        '</td><td>' +
        formatMoneyLabel(row.revenue, currencyLabel) +
        '</td></tr>';
    }).join('');

    elements.summary.value = result.summary;
  }

  elements.modeButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      setMode(button.dataset.mode);
    });
  });

  [
    elements.grossRevenue,
    elements.impressions,
    elements.targetEcpm,
    elements.shareRatePct,
    elements.fixedCost,
    elements.currencyLabel
  ].forEach(function (field) {
    field.addEventListener('input', render);
  });

  elements.resetBtn.addEventListener('click', function () {
    elements.mode.value = DEFAULTS.mode;
    elements.grossRevenue.value = DEFAULTS.grossRevenue;
    elements.impressions.value = DEFAULTS.impressions;
    elements.targetEcpm.value = DEFAULTS.targetEcpm;
    elements.shareRatePct.value = DEFAULTS.shareRatePct;
    elements.fixedCost.value = DEFAULTS.fixedCost;
    elements.currencyLabel.value = DEFAULTS.currencyLabel;
    elements.modeButtons.forEach(function (button) {
      button.classList.toggle('active', button.dataset.mode === DEFAULTS.mode);
    });
    render();
  });

  elements.copyBtn.addEventListener('click', async function () {
    try {
      await navigator.clipboard.writeText(elements.summary.value);
      elements.copyStatus.textContent = TEXT.en.copied;
      elements.copyStatus.classList.add('show');
    } catch (error) {
      elements.copyStatus.textContent = TEXT.en.copyFail;
      elements.copyStatus.classList.add('show');
    }
  });

  render();
})(typeof window !== 'undefined' ? window : globalThis);
