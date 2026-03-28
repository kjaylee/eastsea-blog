(function (root) {
  const DEFAULT_INPUTS = {
    currentQuotedMonthlyPrice: 4200,
    managedUsers: 25,
    managedEndpoints: 32,
    serversCriticalDevices: 3,
    includedSupportHours: 6,
    reactiveTicketHours: 5,
    onsiteHours: 2,
    vcioHours: 3,
    technicianLoadedCostPerHour: 65,
    seniorStrategyCostPerHour: 140,
    toolStackCostPerUser: 18,
    toolStackCostPerEndpoint: 6,
    fixedVendorCostPerMonth: 280,
    afterHoursIncidentHours: 1.5,
    afterHoursMultiplier: 1.75,
    travelExpensePerMonth: 90,
    paymentFeePct: 3,
    targetOperatingMarginPct: 22,
    onboardingHours: 10,
    implementationCostPerHour: 85
  };

  const PLANNING_NOTE = 'Planning model only. This calculator does not benchmark market rates and excludes tax, procurement, licensing true-ups, financing, and hardware resale margin.';
  const SOLVER_ASSUMPTION = 'Break-even managed user count assumes only per-user tool stack cost scales with user count. Endpoints, servers, labor bundle, onsite work, and fixed vendor spend stay fixed unless you edit those assumptions directly.';

  function round(value, digits) {
    const factor = 10 ** digits;
    return Math.round((value + Number.EPSILON) * factor) / factor;
  }

  function round2(value) {
    return round(value, 2);
  }

  function toNumber(value) {
    return Number(value);
  }

  function isWholeNumber(value) {
    return Number.isInteger(value) && value >= 0;
  }

  function normalizeInput(input) {
    const source = input || {};
    return {
      currentQuotedMonthlyPrice: toNumber(source.currentQuotedMonthlyPrice),
      managedUsers: toNumber(source.managedUsers),
      managedEndpoints: toNumber(source.managedEndpoints),
      serversCriticalDevices: toNumber(source.serversCriticalDevices),
      includedSupportHours: toNumber(source.includedSupportHours),
      reactiveTicketHours: toNumber(source.reactiveTicketHours),
      onsiteHours: toNumber(source.onsiteHours),
      vcioHours: toNumber(source.vcioHours),
      technicianLoadedCostPerHour: toNumber(source.technicianLoadedCostPerHour),
      seniorStrategyCostPerHour: toNumber(source.seniorStrategyCostPerHour),
      toolStackCostPerUser: toNumber(source.toolStackCostPerUser),
      toolStackCostPerEndpoint: toNumber(source.toolStackCostPerEndpoint),
      fixedVendorCostPerMonth: toNumber(source.fixedVendorCostPerMonth),
      afterHoursIncidentHours: toNumber(source.afterHoursIncidentHours),
      afterHoursMultiplier: toNumber(source.afterHoursMultiplier),
      travelExpensePerMonth: toNumber(source.travelExpensePerMonth),
      paymentFeePct: toNumber(source.paymentFeePct),
      targetOperatingMarginPct: toNumber(source.targetOperatingMarginPct),
      onboardingHours: toNumber(source.onboardingHours),
      implementationCostPerHour: toNumber(source.implementationCostPerHour)
    };
  }

  function validate(input) {
    const wholeNumberFields = ['managedUsers', 'managedEndpoints', 'serversCriticalDevices'];
    for (const key of wholeNumberFields) {
      if (!Number.isFinite(input[key]) || !isWholeNumber(input[key])) {
        return `${key} must be a whole number that is 0 or greater.`;
      }
    }

    const nonNegativeFields = [
      'currentQuotedMonthlyPrice',
      'includedSupportHours',
      'reactiveTicketHours',
      'onsiteHours',
      'vcioHours',
      'technicianLoadedCostPerHour',
      'seniorStrategyCostPerHour',
      'toolStackCostPerUser',
      'toolStackCostPerEndpoint',
      'fixedVendorCostPerMonth',
      'afterHoursIncidentHours',
      'travelExpensePerMonth',
      'onboardingHours',
      'implementationCostPerHour'
    ];

    for (const key of nonNegativeFields) {
      if (!Number.isFinite(input[key]) || input[key] < 0) {
        return `${key} must be 0 or greater.`;
      }
    }

    if (!Number.isFinite(input.afterHoursMultiplier) || input.afterHoursMultiplier < 1 || input.afterHoursMultiplier > 10) {
      return 'afterHoursMultiplier must be between 1 and 10.';
    }

    if (!Number.isFinite(input.paymentFeePct) || input.paymentFeePct < 0 || input.paymentFeePct >= 100) {
      return 'paymentFeePct must be between 0 and less than 100.';
    }

    if (!Number.isFinite(input.targetOperatingMarginPct) || input.targetOperatingMarginPct < 0 || input.targetOperatingMarginPct >= 100) {
      return 'targetOperatingMarginPct must be between 0 and less than 100.';
    }

    if (input.paymentFeePct + input.targetOperatingMarginPct >= 100) {
      return 'paymentFeePct plus targetOperatingMarginPct must stay below 100.';
    }

    return '';
  }

  function formatMoney(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  function formatNumber(value) {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value);
  }

  function formatPercentFromRate(rate) {
    if (rate == null || !Number.isFinite(rate)) {
      return 'N/A';
    }

    return `${formatNumber(rate * 100)}%`;
  }

  function buildSummary(result) {
    return [
      '[MSP Pricing Calculator Summary]',
      PLANNING_NOTE,
      `Solver assumption: ${SOLVER_ASSUMPTION}`,
      `Managed users: ${formatNumber(result.inputs.managedUsers)}`,
      `Managed endpoints: ${formatNumber(result.inputs.managedEndpoints)}`,
      `Servers / critical devices: ${formatNumber(result.inputs.serversCriticalDevices)}`,
      `Current quoted monthly price: ${result.inputs.currentQuotedMonthlyPrice > 0 ? formatMoney(result.inputs.currentQuotedMonthlyPrice) : 'N/A'}`,
      `Variable monthly cost: ${formatMoney(result.variableMonthlyCost)}`,
      `Fixed monthly cost: ${formatMoney(result.fixedMonthlyCost)}`,
      `Total monthly delivery cost: ${formatMoney(result.monthlyDeliveryCost)}`,
      `Break-even monthly MRR: ${formatMoney(result.breakEvenMonthlyMRR)}`,
      `Recommended monthly MRR: ${formatMoney(result.recommendedMonthlyMRR)}`,
      `Suggested onboarding fee: ${formatMoney(result.onboardingFee)}`,
      `Effective price per user: ${result.effectivePricePerUser == null ? 'N/A' : formatMoney(result.effectivePricePerUser)}`,
      `Gross margin at current quoted price: ${formatPercentFromRate(result.grossMarginAtCurrentQuote)}`,
      `Break-even managed users at current quote: ${result.breakEvenManagedUsers == null ? 'N/A' : formatNumber(result.breakEvenManagedUsers)}`,
      `Estimated 12-month contract value: ${formatMoney(result.contractValue12Months)}`,
      'Excluded from this model: tax treatment, procurement or licensing true-ups, financing, and hardware resale.'
    ].join('\n');
  }

  function calculate(rawInput) {
    const input = normalizeInput(Object.assign({}, DEFAULT_INPUTS, rawInput || {}));
    const error = validate(input);
    if (error) {
      return { result: null, error };
    }

    const paymentFeeRate = input.paymentFeePct / 100;
    const targetMarginRate = input.targetOperatingMarginPct / 100;
    const breakEvenDenominator = 1 - paymentFeeRate;
    const recommendedDenominator = 1 - paymentFeeRate - targetMarginRate;

    if (breakEvenDenominator <= 0) {
      return { result: null, error: 'Break-even monthly MRR is undefined with the current payment fee.' };
    }

    if (recommendedDenominator <= 0) {
      return { result: null, error: 'Recommended monthly MRR is undefined because payment fees plus target margin leave no room for delivery cost.' };
    }

    const variableLaborCost = (input.includedSupportHours + input.reactiveTicketHours) * input.technicianLoadedCostPerHour;
    const afterHoursCost = input.afterHoursIncidentHours * input.technicianLoadedCostPerHour * input.afterHoursMultiplier;
    const onsiteCost = input.onsiteHours * input.technicianLoadedCostPerHour + input.travelExpensePerMonth;
    const strategyCost = input.vcioHours * input.seniorStrategyCostPerHour;
    const perUserStackCost = input.managedUsers * input.toolStackCostPerUser;
    const perEndpointStackCost = input.managedEndpoints * input.toolStackCostPerEndpoint;

    const fixedMonthlyCost = input.fixedVendorCostPerMonth + strategyCost + onsiteCost;
    const variableMonthlyCost = variableLaborCost + afterHoursCost + perUserStackCost + perEndpointStackCost;
    const monthlyDeliveryCost = fixedMonthlyCost + variableMonthlyCost;

    const breakEvenMonthlyMRR = monthlyDeliveryCost / breakEvenDenominator;
    const recommendedMonthlyMRR = monthlyDeliveryCost / recommendedDenominator;
    const onboardingFee = (input.onboardingHours * input.implementationCostPerHour) / recommendedDenominator;
    const effectivePricePerUser = input.managedUsers > 0 ? recommendedMonthlyMRR / input.managedUsers : null;
    const grossMarginAtCurrentQuote = input.currentQuotedMonthlyPrice > 0
      ? (input.currentQuotedMonthlyPrice - input.currentQuotedMonthlyPrice * paymentFeeRate - monthlyDeliveryCost) / input.currentQuotedMonthlyPrice
      : null;
    const contractValue12Months = recommendedMonthlyMRR * 12 + onboardingFee;

    const quoteNetAfterFees = input.currentQuotedMonthlyPrice > 0
      ? input.currentQuotedMonthlyPrice * (1 - paymentFeeRate)
      : null;
    const currentQuotePerUser = input.currentQuotedMonthlyPrice > 0 && input.managedUsers > 0
      ? input.currentQuotedMonthlyPrice / input.managedUsers
      : null;
    const perUserUnitContribution = currentQuotePerUser != null
      ? currentQuotePerUser * (1 - paymentFeeRate) - input.toolStackCostPerUser
      : null;
    const fixedCostExcludingPerUser = monthlyDeliveryCost - perUserStackCost;
    const breakEvenManagedUsers = perUserUnitContribution != null && perUserUnitContribution > 0
      ? fixedCostExcludingPerUser / perUserUnitContribution
      : null;

    const result = {
      inputs: input,
      planningNote: PLANNING_NOTE,
      solverAssumption: SOLVER_ASSUMPTION,
      paymentFeeRate: round(paymentFeeRate, 4),
      targetMarginRate: round(targetMarginRate, 4),
      variableLaborCost: round2(variableLaborCost),
      afterHoursCost: round2(afterHoursCost),
      onsiteCost: round2(onsiteCost),
      strategyCost: round2(strategyCost),
      perUserStackCost: round2(perUserStackCost),
      perEndpointStackCost: round2(perEndpointStackCost),
      fixedMonthlyCost: round2(fixedMonthlyCost),
      variableMonthlyCost: round2(variableMonthlyCost),
      monthlyDeliveryCost: round2(monthlyDeliveryCost),
      breakEvenMonthlyMRR: round2(breakEvenMonthlyMRR),
      recommendedMonthlyMRR: round2(recommendedMonthlyMRR),
      onboardingFee: round2(onboardingFee),
      effectivePricePerUser: effectivePricePerUser == null ? null : round2(effectivePricePerUser),
      grossMarginAtCurrentQuote: grossMarginAtCurrentQuote == null ? null : round(grossMarginAtCurrentQuote, 4),
      grossMarginAtCurrentQuotePct: grossMarginAtCurrentQuote == null ? null : round2(grossMarginAtCurrentQuote * 100),
      contractValue12Months: round2(contractValue12Months),
      quoteNetAfterFees: quoteNetAfterFees == null ? null : round2(quoteNetAfterFees),
      currentQuotePerUser: currentQuotePerUser == null ? null : round2(currentQuotePerUser),
      perUserUnitContribution: perUserUnitContribution == null ? null : round2(perUserUnitContribution),
      fixedCostExcludingPerUser: round2(fixedCostExcludingPerUser),
      breakEvenManagedUsers: breakEvenManagedUsers == null ? null : round2(breakEvenManagedUsers)
    };

    result.summary = buildSummary(result);
    return { result, error: '' };
  }

  function createStatusCopy(result) {
    if (result.inputs.currentQuotedMonthlyPrice <= 0) {
      return {
        tone: 'neutral',
        title: 'No current quote modeled',
        detail: 'Use the recommended monthly MRR and onboarding fee as a first-pass internal planning baseline.'
      };
    }

    if (result.inputs.currentQuotedMonthlyPrice >= result.recommendedMonthlyMRR) {
      return {
        tone: 'good',
        title: 'Current quote clears the target margin',
        detail: 'The quoted monthly price sits at or above the model’s target-margin recommendation.'
      };
    }

    if (result.inputs.currentQuotedMonthlyPrice >= result.breakEvenMonthlyMRR) {
      return {
        tone: 'warn',
        title: 'Current quote covers delivery but misses target margin',
        detail: 'The quote appears above break-even after payment fees, but it does not reach the target operating margin.'
      };
    }

    return {
      tone: 'bad',
      title: 'Current quote is below break-even',
      detail: 'The quote does not cover the modeled delivery cost after payment fees under the current assumptions.'
    };
  }

  const api = {
    DEFAULT_INPUTS,
    PLANNING_NOTE,
    SOLVER_ASSUMPTION,
    normalizeInput,
    validate,
    calculate,
    buildSummary,
    formatMoney,
    formatNumber,
    formatPercentFromRate
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  root.MspPricingCalculator = api;

  if (typeof document === 'undefined') {
    return;
  }

  const inputIds = [
    'currentQuotedMonthlyPrice',
    'managedUsers',
    'managedEndpoints',
    'serversCriticalDevices',
    'includedSupportHours',
    'reactiveTicketHours',
    'onsiteHours',
    'vcioHours',
    'technicianLoadedCostPerHour',
    'seniorStrategyCostPerHour',
    'toolStackCostPerUser',
    'toolStackCostPerEndpoint',
    'fixedVendorCostPerMonth',
    'afterHoursIncidentHours',
    'afterHoursMultiplier',
    'travelExpensePerMonth',
    'paymentFeePct',
    'targetOperatingMarginPct',
    'onboardingHours',
    'implementationCostPerHour'
  ];

  const outputIds = [
    'variableMonthlyCost',
    'fixedMonthlyCost',
    'monthlyDeliveryCost',
    'breakEvenMonthlyMRR',
    'recommendedMonthlyMRR',
    'onboardingFee',
    'contractValue12Months',
    'effectivePricePerUser',
    'grossMarginAtCurrentQuote',
    'breakEvenManagedUsers',
    'variableLaborCost',
    'afterHoursCost',
    'onsiteCost',
    'strategyCost',
    'perUserStackCost',
    'perEndpointStackCost',
    'quoteNetAfterFees',
    'currentQuotePerUser',
    'perUserUnitContribution',
    'fixedCostExcludingPerUser'
  ];

  const refs = {};
  inputIds.concat(outputIds).concat([
    'summary',
    'error',
    'copySummary',
    'resetCalculator',
    'statusTitle',
    'statusDetail',
    'statusCard',
    'planningNote',
    'solverAssumption'
  ]).forEach(function (id) {
    refs[id] = document.getElementById(id);
  });

  function readInput() {
    const input = {};
    inputIds.forEach(function (id) {
      input[id] = refs[id].value;
    });
    return input;
  }

  function setDefaults() {
    Object.keys(DEFAULT_INPUTS).forEach(function (key) {
      refs[key].value = DEFAULT_INPUTS[key];
    });
  }

  function setOutput(id, value, formatter) {
    refs[id].textContent = value == null ? 'N/A' : formatter(value);
  }

  function render() {
    const outcome = calculate(readInput());

    refs.planningNote.textContent = PLANNING_NOTE;
    refs.solverAssumption.textContent = SOLVER_ASSUMPTION;

    if (outcome.error) {
      refs.error.textContent = outcome.error;
      refs.error.hidden = false;
      refs.summary.value = '';
      refs.statusCard.dataset.tone = 'bad';
      refs.statusTitle.textContent = 'Input error';
      refs.statusDetail.textContent = 'Review the assumptions before using the model.';
      outputIds.forEach(function (id) {
        refs[id].textContent = 'N/A';
      });
      return;
    }

    const result = outcome.result;
    const status = createStatusCopy(result);

    refs.error.textContent = '';
    refs.error.hidden = true;

    refs.statusCard.dataset.tone = status.tone;
    refs.statusTitle.textContent = status.title;
    refs.statusDetail.textContent = status.detail;

    setOutput('variableMonthlyCost', result.variableMonthlyCost, formatMoney);
    setOutput('fixedMonthlyCost', result.fixedMonthlyCost, formatMoney);
    setOutput('monthlyDeliveryCost', result.monthlyDeliveryCost, formatMoney);
    setOutput('breakEvenMonthlyMRR', result.breakEvenMonthlyMRR, formatMoney);
    setOutput('recommendedMonthlyMRR', result.recommendedMonthlyMRR, formatMoney);
    setOutput('onboardingFee', result.onboardingFee, formatMoney);
    setOutput('contractValue12Months', result.contractValue12Months, formatMoney);
    setOutput('effectivePricePerUser', result.effectivePricePerUser, formatMoney);
    setOutput('grossMarginAtCurrentQuote', result.grossMarginAtCurrentQuote, formatPercentFromRate);
    setOutput('breakEvenManagedUsers', result.breakEvenManagedUsers, formatNumber);
    setOutput('variableLaborCost', result.variableLaborCost, formatMoney);
    setOutput('afterHoursCost', result.afterHoursCost, formatMoney);
    setOutput('onsiteCost', result.onsiteCost, formatMoney);
    setOutput('strategyCost', result.strategyCost, formatMoney);
    setOutput('perUserStackCost', result.perUserStackCost, formatMoney);
    setOutput('perEndpointStackCost', result.perEndpointStackCost, formatMoney);
    setOutput('quoteNetAfterFees', result.quoteNetAfterFees, formatMoney);
    setOutput('currentQuotePerUser', result.currentQuotePerUser, formatMoney);
    setOutput('perUserUnitContribution', result.perUserUnitContribution, formatMoney);
    setOutput('fixedCostExcludingPerUser', result.fixedCostExcludingPerUser, formatMoney);

    refs.summary.value = result.summary;
  }

  inputIds.forEach(function (id) {
    refs[id].addEventListener('input', render);
  });

  refs.copySummary.addEventListener('click', async function () {
    if (!refs.summary.value) {
      return;
    }

    try {
      await navigator.clipboard.writeText(refs.summary.value);
      refs.copySummary.textContent = 'Copied';
      setTimeout(function () {
        refs.copySummary.textContent = 'Copy Summary';
      }, 1200);
    } catch (error) {
      refs.summary.focus();
      refs.summary.select();
      document.execCommand('copy');
      refs.copySummary.textContent = 'Copied';
      setTimeout(function () {
        refs.copySummary.textContent = 'Copy Summary';
      }, 1200);
    }
  });

  refs.resetCalculator.addEventListener('click', function () {
    setDefaults();
    render();
  });

  setDefaults();
  render();
}(typeof globalThis !== 'undefined' ? globalThis : this));
