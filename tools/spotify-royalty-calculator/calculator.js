(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.SpotifyRoyaltyCalculator = factory();
  }
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var DEFAULTS = {
    monthlyStreams: 120000,
    payoutPerStream: 0.0035,
    artistSharePct: 100,
    distributorFeePct: 0,
    collaboratorSplitPct: 0,
    fixedMonthlyCosts: 0,
    annualDistributionCost: 0,
    targetMonthlyTakeHome: 1000
  };

  function roundTo(value, decimals) {
    var factor = Math.pow(10, decimals);
    return Math.round((value + Number.EPSILON) * factor) / factor;
  }

  function round2(value) {
    return roundTo(value, 2);
  }

  function toNumber(value, fallback) {
    var parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function normalize(raw) {
    var src = raw || {};

    function pick(key) {
      if (src[key] === undefined || src[key] === null) {
        return DEFAULTS[key];
      }
      return toNumber(src[key], NaN);
    }

    return {
      monthlyStreams: pick('monthlyStreams'),
      payoutPerStream: pick('payoutPerStream'),
      artistSharePct: pick('artistSharePct'),
      distributorFeePct: pick('distributorFeePct'),
      collaboratorSplitPct: pick('collaboratorSplitPct'),
      fixedMonthlyCosts: pick('fixedMonthlyCosts'),
      annualDistributionCost: pick('annualDistributionCost'),
      targetMonthlyTakeHome: pick('targetMonthlyTakeHome')
    };
  }

  function validate(input) {
    if (!Number.isFinite(input.monthlyStreams) || input.monthlyStreams < 0 || Math.floor(input.monthlyStreams) !== input.monthlyStreams) {
      return 'Monthly streams must be an integer greater than or equal to 0.';
    }
    if (!Number.isFinite(input.payoutPerStream) || input.payoutPerStream <= 0) {
      return 'Estimated payout per stream must be greater than 0.';
    }
    if (!Number.isFinite(input.artistSharePct) || input.artistSharePct < 0 || input.artistSharePct > 100) {
      return 'Artist share must be between 0 and 100.';
    }
    if (!Number.isFinite(input.distributorFeePct) || input.distributorFeePct < 0 || input.distributorFeePct > 100) {
      return 'Distributor fee must be between 0 and 100.';
    }
    if (!Number.isFinite(input.collaboratorSplitPct) || input.collaboratorSplitPct < 0 || input.collaboratorSplitPct > 100) {
      return 'Collaborator split must be between 0 and 100.';
    }
    if (!Number.isFinite(input.fixedMonthlyCosts) || input.fixedMonthlyCosts < 0) {
      return 'Fixed monthly costs must be 0 or higher.';
    }
    if (!Number.isFinite(input.annualDistributionCost) || input.annualDistributionCost < 0) {
      return 'Annual distribution cost must be 0 or higher.';
    }
    if (!Number.isFinite(input.targetMonthlyTakeHome) || input.targetMonthlyTakeHome < 0) {
      return 'Target monthly take-home must be 0 or higher.';
    }
    return '';
  }

  function computeTakeHomeForPayout(input, payoutPerStream) {
    var grossMonthlyRoyalties = input.monthlyStreams * payoutPerStream;
    var artistGrossAfterShare = grossMonthlyRoyalties * (input.artistSharePct / 100);
    var distributorFee = artistGrossAfterShare * (input.distributorFeePct / 100);
    var afterDistributor = artistGrossAfterShare - distributorFee;
    var collaboratorPayout = afterDistributor * (input.collaboratorSplitPct / 100);
    var takeHomeBeforeFixed = afterDistributor - collaboratorPayout;
    var monthlyFixedCostLoad = input.fixedMonthlyCosts + (input.annualDistributionCost / 12);
    var takeHomeAfterFixed = takeHomeBeforeFixed - monthlyFixedCostLoad;

    return {
      grossMonthlyRoyalties: round2(grossMonthlyRoyalties),
      artistGrossAfterShare: round2(artistGrossAfterShare),
      distributorFee: round2(distributorFee),
      collaboratorPayout: round2(collaboratorPayout),
      takeHomeBeforeFixed: round2(takeHomeBeforeFixed),
      takeHomeAfterFixed: round2(takeHomeAfterFixed)
    };
  }

  function calculate(rawInput) {
    var input = normalize(rawInput);
    var error = validate(input);
    if (error) {
      return { result: null, error: error };
    }

    var core = computeTakeHomeForPayout(input, input.payoutPerStream);
    var monthlyFixedCostLoad = round2(input.fixedMonthlyCosts + (input.annualDistributionCost / 12));
    var annualTakeHomeAfterFixed = round2(core.takeHomeAfterFixed * 12);
    var estimatedAnnualStreams = input.monthlyStreams * 12;
    var gapToAnnualThreshold = Math.max(1000 - estimatedAnnualStreams, 0);
    var qualifiesForAnnualThreshold = gapToAnnualThreshold === 0;
    var effectiveTakeHomePerThousand = input.monthlyStreams > 0
      ? round2((core.takeHomeBeforeFixed / input.monthlyStreams) * 1000)
      : 0;

    var variableTakeHomePerStream = input.payoutPerStream *
      (input.artistSharePct / 100) *
      (1 - (input.distributorFeePct / 100)) *
      (1 - (input.collaboratorSplitPct / 100));

    var streamsNeededForTargetTakeHome = variableTakeHomePerStream > 0
      ? Math.ceil((input.targetMonthlyTakeHome + monthlyFixedCostLoad) / variableTakeHomePerStream)
      : null;

    var cautiousScenario = computeTakeHomeForPayout(input, input.payoutPerStream * 0.75).takeHomeAfterFixed;
    var baseScenario = core.takeHomeAfterFixed;
    var upsideScenario = computeTakeHomeForPayout(input, input.payoutPerStream * 1.25).takeHomeAfterFixed;

    var status;
    if (core.takeHomeAfterFixed > 0.01) {
      status = 'good';
    } else if (core.takeHomeAfterFixed >= -0.01) {
      status = 'warn';
    } else {
      status = 'bad';
    }

    var result = {
      inputs: input,
      grossMonthlyRoyalties: core.grossMonthlyRoyalties,
      artistGrossAfterShare: core.artistGrossAfterShare,
      distributorFee: core.distributorFee,
      collaboratorPayout: core.collaboratorPayout,
      takeHomeBeforeFixed: core.takeHomeBeforeFixed,
      monthlyFixedCostLoad: monthlyFixedCostLoad,
      takeHomeAfterFixed: core.takeHomeAfterFixed,
      annualTakeHomeAfterFixed: annualTakeHomeAfterFixed,
      effectiveTakeHomePerThousand: effectiveTakeHomePerThousand,
      estimatedAnnualStreams: estimatedAnnualStreams,
      gapToAnnualThreshold: gapToAnnualThreshold,
      qualifiesForAnnualThreshold: qualifiesForAnnualThreshold,
      streamsNeededForTargetTakeHome: streamsNeededForTargetTakeHome,
      cautiousScenario: round2(cautiousScenario),
      baseScenario: round2(baseScenario),
      upsideScenario: round2(upsideScenario),
      status: status
    };

    return {
      result: result,
      error: ''
    };
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2
    }).format(value);
  }

  function formatRate(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4,
      maximumFractionDigits: 6
    }).format(value);
  }

  function formatNumber(value) {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0
    }).format(value);
  }

  function buildSummary(result) {
    return [
      '[Spotify Royalty Calculator Summary]',
      'Monthly streams: ' + formatNumber(result.inputs.monthlyStreams),
      'Payout per stream: ' + formatRate(result.inputs.payoutPerStream),
      'Gross monthly royalties: ' + formatCurrency(result.grossMonthlyRoyalties),
      'Artist gross after share: ' + formatCurrency(result.artistGrossAfterShare),
      'Distributor fee drag: ' + formatCurrency(result.distributorFee),
      'Collaborator payout: ' + formatCurrency(result.collaboratorPayout),
      'Take-home before fixed costs: ' + formatCurrency(result.takeHomeBeforeFixed),
      'Monthly fixed-cost load: ' + formatCurrency(result.monthlyFixedCostLoad),
      'Take-home after fixed costs: ' + formatCurrency(result.takeHomeAfterFixed),
      'Annual take-home: ' + formatCurrency(result.annualTakeHomeAfterFixed),
      'Effective take-home per 1,000 streams: ' + formatCurrency(result.effectiveTakeHomePerThousand),
      'Estimated annual streams: ' + formatNumber(result.estimatedAnnualStreams),
      'Gap to 1,000 annual streams: ' + formatNumber(result.gapToAnnualThreshold),
      'Streams needed for target take-home: ' + (result.streamsNeededForTargetTakeHome === null ? 'N/A' : formatNumber(result.streamsNeededForTargetTakeHome))
    ].join('\n');
  }

  function initDom() {
    if (typeof document === 'undefined') {
      return;
    }

    var rootEl = document.getElementById('spotifyRoyaltyCalculator');
    if (!rootEl) {
      return;
    }

    var refs = {
      monthlyStreams: document.getElementById('monthlyStreams'),
      payoutPerStream: document.getElementById('payoutPerStream'),
      artistSharePct: document.getElementById('artistSharePct'),
      distributorFeePct: document.getElementById('distributorFeePct'),
      collaboratorSplitPct: document.getElementById('collaboratorSplitPct'),
      fixedMonthlyCosts: document.getElementById('fixedMonthlyCosts'),
      annualDistributionCost: document.getElementById('annualDistributionCost'),
      targetMonthlyTakeHome: document.getElementById('targetMonthlyTakeHome'),
      copyBtn: document.getElementById('copyBtn'),
      resetBtn: document.getElementById('resetBtn'),
      errorBox: document.getElementById('errorBox'),
      summaryOutput: document.getElementById('summaryOutput'),
      statusPill: document.getElementById('statusPill'),
      grossMonthlyRoyaltiesValue: document.getElementById('grossMonthlyRoyaltiesValue'),
      takeHomeAfterFixedValue: document.getElementById('takeHomeAfterFixedValue'),
      annualTakeHomeValue: document.getElementById('annualTakeHomeValue'),
      streamsNeededValue: document.getElementById('streamsNeededValue'),
      cautiousScenarioValue: document.getElementById('cautiousScenarioValue'),
      baseScenarioValue: document.getElementById('baseScenarioValue'),
      upsideScenarioValue: document.getElementById('upsideScenarioValue'),
      artistGrossAfterShareValue: document.getElementById('artistGrossAfterShareValue'),
      distributorFeeValue: document.getElementById('distributorFeeValue'),
      collaboratorPayoutValue: document.getElementById('collaboratorPayoutValue'),
      takeHomeBeforeFixedValue: document.getElementById('takeHomeBeforeFixedValue'),
      effectiveTakeHomePerThousandValue: document.getElementById('effectiveTakeHomePerThousandValue'),
      estimatedAnnualStreamsValue: document.getElementById('estimatedAnnualStreamsValue'),
      gapToThresholdValue: document.getElementById('gapToThresholdValue'),
      thresholdStatusValue: document.getElementById('thresholdStatusValue')
    };

    function readInput() {
      return {
        monthlyStreams: refs.monthlyStreams.value,
        payoutPerStream: refs.payoutPerStream.value,
        artistSharePct: refs.artistSharePct.value,
        distributorFeePct: refs.distributorFeePct.value,
        collaboratorSplitPct: refs.collaboratorSplitPct.value,
        fixedMonthlyCosts: refs.fixedMonthlyCosts.value,
        annualDistributionCost: refs.annualDistributionCost.value,
        targetMonthlyTakeHome: refs.targetMonthlyTakeHome.value
      };
    }

    function setDefaults() {
      refs.monthlyStreams.value = DEFAULTS.monthlyStreams;
      refs.payoutPerStream.value = DEFAULTS.payoutPerStream;
      refs.artistSharePct.value = DEFAULTS.artistSharePct;
      refs.distributorFeePct.value = DEFAULTS.distributorFeePct;
      refs.collaboratorSplitPct.value = DEFAULTS.collaboratorSplitPct;
      refs.fixedMonthlyCosts.value = DEFAULTS.fixedMonthlyCosts;
      refs.annualDistributionCost.value = DEFAULTS.annualDistributionCost;
      refs.targetMonthlyTakeHome.value = DEFAULTS.targetMonthlyTakeHome;
    }

    function render() {
      var evaluation = calculate(readInput());
      if (evaluation.error) {
        refs.errorBox.textContent = evaluation.error;
        refs.errorBox.classList.add('show');
        return;
      }

      refs.errorBox.textContent = '';
      refs.errorBox.classList.remove('show');

      var result = evaluation.result;
      refs.summaryOutput.value = buildSummary(result);

      refs.statusPill.className = 'status-pill ' + result.status;
      refs.statusPill.textContent = result.status === 'good'
        ? 'Healthy positive take-home'
        : (result.status === 'warn' ? 'Roughly break-even' : 'Negative after fixed costs');

      refs.grossMonthlyRoyaltiesValue.textContent = formatCurrency(result.grossMonthlyRoyalties);
      refs.takeHomeAfterFixedValue.textContent = formatCurrency(result.takeHomeAfterFixed);
      refs.annualTakeHomeValue.textContent = formatCurrency(result.annualTakeHomeAfterFixed);
      refs.streamsNeededValue.textContent = result.streamsNeededForTargetTakeHome === null
        ? 'N/A'
        : formatNumber(result.streamsNeededForTargetTakeHome);

      refs.cautiousScenarioValue.textContent = formatCurrency(result.cautiousScenario);
      refs.baseScenarioValue.textContent = formatCurrency(result.baseScenario);
      refs.upsideScenarioValue.textContent = formatCurrency(result.upsideScenario);
      refs.artistGrossAfterShareValue.textContent = formatCurrency(result.artistGrossAfterShare);
      refs.distributorFeeValue.textContent = formatCurrency(result.distributorFee);
      refs.collaboratorPayoutValue.textContent = formatCurrency(result.collaboratorPayout);
      refs.takeHomeBeforeFixedValue.textContent = formatCurrency(result.takeHomeBeforeFixed);
      refs.effectiveTakeHomePerThousandValue.textContent = formatCurrency(result.effectiveTakeHomePerThousand);
      refs.estimatedAnnualStreamsValue.textContent = formatNumber(result.estimatedAnnualStreams);
      refs.gapToThresholdValue.textContent = formatNumber(result.gapToAnnualThreshold);
      refs.thresholdStatusValue.textContent = result.qualifiesForAnnualThreshold
        ? 'At or above 1,000 annual streams'
        : 'Below threshold pace';
    }

    refs.copyBtn.addEventListener('click', function () {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(refs.summaryOutput.value);
      }
    });

    refs.resetBtn.addEventListener('click', function () {
      setDefaults();
      render();
    });

    [
      refs.monthlyStreams,
      refs.payoutPerStream,
      refs.artistSharePct,
      refs.distributorFeePct,
      refs.collaboratorSplitPct,
      refs.fixedMonthlyCosts,
      refs.annualDistributionCost,
      refs.targetMonthlyTakeHome
    ].forEach(function (el) {
      el.addEventListener('input', render);
      el.addEventListener('change', render);
    });

    setDefaults();
    render();
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initDom);
    } else {
      initDom();
    }
  }

  return {
    DEFAULTS: DEFAULTS,
    calculate: calculate,
    buildSummary: buildSummary,
    round2: round2
  };
}));
