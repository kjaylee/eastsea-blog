(function (root) {
  const KICKSTARTER_FEE_RATE = 0.05;
  const STATUS_TOLERANCE = 0.01;

  const DEFAULTS = {
    plannedFundingGoal: 25000,
    productionBudget: 12000,
    fulfillmentBudget: 3000,
    shippingBudget: 2000,
    marketingBudget: 1500,
    contingencyReserve: 500,
    failedPledgeRate: 4,
    paymentProcessingRate: 3.5,
    taxReserveRate: 8
  };

  const TEXT = {
    en: {
      pageTitle: 'Kickstarter Net Proceeds Calculator',
      pageTitleFull: 'Kickstarter Net Proceeds Calculator | Kickstarter 순수령액 계산기',
      subtitle: 'Plan a realistic Kickstarter funding goal after failed pledges, Kickstarter fees, payment processing, and a tax reserve.',
      heroNote: 'Kickstarter uses all-or-nothing funding. If the campaign misses the goal, creators receive no funds.',
      assumptionsTitle: 'Planning assumptions',
      assumptionsBody: 'This tool fixes Kickstarter at 5%, lets you adjust payment processing (roughly 3%–5% in many cases), and models taxes as a reserve assumption. It is not Kickstarter, Stripe, or tax advice.',
      sameCurrency: 'Use one consistent currency across every money input.',
      inputTitle: 'Campaign inputs',
      budgetTitle: 'Required budget',
      riskTitle: 'Loss assumptions',
      outputTitle: 'Funding outcome',
      summaryTitle: 'Decision summary',
      copy: 'Copy summary',
      reset: 'Reset defaults',
      copied: 'Summary copied.',
      copyFail: 'Clipboard unavailable. Please copy manually.',
      waiting: 'Adjust the inputs to estimate Kickstarter take-home.',
      invalid: 'Please review your inputs.',
      errPlannedGoal: 'Planned funding goal must be greater than 0.',
      errBudget: 'Budget inputs must be finite and 0 or above.',
      errRate: 'Rates must be between 0 and 100.',
      errFinite: 'All inputs must be finite numbers.',
      labelPlannedFundingGoal: 'Planned funding goal',
      labelProductionBudget: 'Production budget',
      labelFulfillmentBudget: 'Reward fulfillment budget',
      labelShippingBudget: 'Shipping / logistics budget',
      labelMarketingBudget: 'Marketing / launch budget',
      labelContingencyReserve: 'Contingency reserve',
      labelFailedPledgeRate: 'Failed pledge rate (%)',
      labelPaymentProcessingRate: 'Payment processing fee (%)',
      labelTaxReserveRate: 'Tax reserve (%)',
      labelKickstarterFee: 'Kickstarter fee (fixed)',
      valueKickstarterFee: '5%',
      statusSafe: 'Safe surplus',
      statusTight: 'Tight break-even',
      statusShortfall: 'Budget shortfall',
      safeHint: 'Expected net proceeds exceed the required budget under these assumptions.',
      tightHint: 'Expected net proceeds land roughly at break-even.',
      shortfallHint: 'Expected net proceeds do not fully cover the required budget.',
      totalBudget: 'Total budget',
      chargedAmount: 'Charged amount after failed pledges',
      kickstarterFee: 'Kickstarter fee',
      processingFee: 'Processing fee',
      taxReserveAmount: 'Tax reserve amount',
      netProceeds: 'Expected net proceeds',
      gapVsBudget: 'Surplus / shortfall vs budget',
      effectiveTakeHomeRatePct: 'Effective take-home rate',
      recommendedFundingGoal: 'Recommended funding goal',
      goalDelta: 'Goal delta vs current plan',
      takeHomeFactor: 'Take-home factor',
      summaryHeading: '[Kickstarter Net Proceeds Summary]',
      summaryGoal: 'Planned funding goal',
      summaryBudget: 'Total budget needed',
      summaryNet: 'Expected net proceeds',
      summaryGap: 'Surplus/shortfall vs budget',
      summaryRecommended: 'Recommended funding goal',
      summaryStatus: 'Status',
      summaryAssumption: 'Assumption',
      summaryAssumptionValue: 'Kickstarter 5% fee fixed; processing and taxes are planning inputs; all-or-nothing applies.',
      na: 'N/A'
    },
    ko: {
      pageTitle: 'Kickstarter 순수령액 계산기',
      pageTitleFull: 'Kickstarter 순수령액 계산기 | Kickstarter Net Proceeds Calculator',
      subtitle: '실패 결제율, Kickstarter 수수료, 결제 처리 수수료, 세금 준비율을 반영해 현실적인 Kickstarter 목표 금액을 계산합니다.',
      heroNote: 'Kickstarter는 올오어나싱 방식입니다. 목표 금액을 달성하지 못하면 창작자는 자금을 받지 못합니다.',
      assumptionsTitle: '가정과 주의사항',
      assumptionsBody: 'Kickstarter 수수료는 5%로 고정하고, 결제 처리 수수료는 일반적으로 3%~5% 수준의 계획 입력값으로 조정할 수 있으며, 세금은 준비금 가정으로 모델링합니다. Kickstarter·Stripe·세무 자문이 아닙니다.',
      sameCurrency: '모든 금액 입력은 동일 통화 기준으로 넣어주세요.',
      inputTitle: '캠페인 입력값',
      budgetTitle: '필수 예산',
      riskTitle: '차감 가정',
      outputTitle: '예상 결과',
      summaryTitle: '의사결정 요약',
      copy: '요약 복사',
      reset: '기본값 복원',
      copied: '요약을 복사했습니다.',
      copyFail: '클립보드 권한이 없어 수동 복사가 필요합니다.',
      waiting: '입력값을 조정하면 Kickstarter 실수령 추정치를 확인할 수 있습니다.',
      invalid: '입력값을 확인해주세요.',
      errPlannedGoal: '목표 금액은 0보다 커야 합니다.',
      errBudget: '예산 입력값은 모두 유한한 숫자이며 0 이상이어야 합니다.',
      errRate: '비율 입력값은 0~100 사이여야 합니다.',
      errFinite: '모든 입력값은 유한한 숫자여야 합니다.',
      labelPlannedFundingGoal: '계획 목표 금액',
      labelProductionBudget: '제작 예산',
      labelFulfillmentBudget: '리워드 이행 예산',
      labelShippingBudget: '배송 / 물류 예산',
      labelMarketingBudget: '마케팅 / 런칭 예산',
      labelContingencyReserve: '컨틴전시 준비금',
      labelFailedPledgeRate: '실패 결제율 (%)',
      labelPaymentProcessingRate: '결제 처리 수수료 (%)',
      labelTaxReserveRate: '세금 준비율 (%)',
      labelKickstarterFee: 'Kickstarter 수수료 (고정)',
      valueKickstarterFee: '5%',
      statusSafe: '여유 있음',
      statusTight: '간신히 충당',
      statusShortfall: '예산 부족',
      safeHint: '현재 가정에서는 예상 순수령액이 필수 예산을 초과합니다.',
      tightHint: '현재 가정에서는 예상 순수령액이 손익분기 수준에 가깝습니다.',
      shortfallHint: '현재 가정에서는 예상 순수령액이 필수 예산을 충분히 충당하지 못합니다.',
      totalBudget: '총 필요 예산',
      chargedAmount: '실패 결제 반영 후 실제 청구액',
      kickstarterFee: 'Kickstarter 수수료',
      processingFee: '결제 처리 수수료',
      taxReserveAmount: '세금 준비금',
      netProceeds: '예상 순수령액',
      gapVsBudget: '예산 대비 여유 / 부족',
      effectiveTakeHomeRatePct: '실효 수령률',
      recommendedFundingGoal: '권장 목표 금액',
      goalDelta: '현재 계획 대비 목표 차이',
      takeHomeFactor: '수령 계수',
      summaryHeading: '[Kickstarter 순수령액 요약]',
      summaryGoal: '계획 목표 금액',
      summaryBudget: '총 필요 예산',
      summaryNet: '예상 순수령액',
      summaryGap: '예산 대비 여유/부족',
      summaryRecommended: '권장 목표 금액',
      summaryStatus: '상태',
      summaryAssumption: '가정',
      summaryAssumptionValue: 'Kickstarter 수수료 5% 고정, 결제 처리와 세금은 계획 입력값, 올오어나싱 적용.',
      na: 'N/A'
    }
  };

  function round(value, digits) {
    const factor = 10 ** digits;
    return Math.round((value + Number.EPSILON) * factor) / factor;
  }

  function round2(value) {
    return round(value, 2);
  }

  function toNumber(value, fallback) {
    if (value == null || value === '') {
      return fallback;
    }
    return Number(value);
  }

  function normalizeInput(rawInput) {
    return {
      plannedFundingGoal: toNumber(rawInput.plannedFundingGoal, DEFAULTS.plannedFundingGoal),
      productionBudget: toNumber(rawInput.productionBudget, DEFAULTS.productionBudget),
      fulfillmentBudget: toNumber(rawInput.fulfillmentBudget, DEFAULTS.fulfillmentBudget),
      shippingBudget: toNumber(rawInput.shippingBudget, DEFAULTS.shippingBudget),
      marketingBudget: toNumber(rawInput.marketingBudget, DEFAULTS.marketingBudget),
      contingencyReserve: toNumber(rawInput.contingencyReserve, DEFAULTS.contingencyReserve),
      failedPledgeRate: toNumber(rawInput.failedPledgeRate, DEFAULTS.failedPledgeRate),
      paymentProcessingRate: toNumber(rawInput.paymentProcessingRate, DEFAULTS.paymentProcessingRate),
      taxReserveRate: toNumber(rawInput.taxReserveRate, DEFAULTS.taxReserveRate)
    };
  }

  function validate(input, lang) {
    const t = TEXT[lang] || TEXT.ko;
    const budgetFields = [
      input.productionBudget,
      input.fulfillmentBudget,
      input.shippingBudget,
      input.marketingBudget,
      input.contingencyReserve
    ];
    const rateFields = [
      input.failedPledgeRate,
      input.paymentProcessingRate,
      input.taxReserveRate
    ];
    const allFields = [input.plannedFundingGoal].concat(budgetFields, rateFields);

    if (allFields.some((value) => !Number.isFinite(value))) {
      return t.errFinite;
    }

    if (input.plannedFundingGoal <= 0) {
      return t.errPlannedGoal;
    }

    if (budgetFields.some((value) => value < 0)) {
      return t.errBudget;
    }

    if (rateFields.some((value) => value < 0 || value > 100)) {
      return t.errRate;
    }

    return '';
  }

  function resolveStatus(gapVsBudget) {
    const roundedGap = round2(gapVsBudget);
    if (Math.abs(roundedGap) <= STATUS_TOLERANCE) {
      return 'tight';
    }
    return roundedGap > 0 ? 'safe' : 'shortfall';
  }

  function formatAmount(value, lang) {
    const t = TEXT[lang] || TEXT.ko;
    if (!Number.isFinite(value)) {
      return t.na;
    }
    return value.toLocaleString(lang === 'ko' ? 'ko-KR' : 'en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function buildSummary(result, lang) {
    const t = TEXT[lang] || TEXT.ko;
    const statusMap = {
      safe: t.statusSafe,
      tight: t.statusTight,
      shortfall: t.statusShortfall
    };

    return [
      t.summaryHeading,
      `${t.summaryGoal}: ${formatAmount(result.input.plannedFundingGoal, lang)}`,
      `${t.summaryBudget}: ${formatAmount(result.totalBudget, lang)}`,
      `${t.summaryNet}: ${formatAmount(result.netProceeds, lang)}`,
      `${t.summaryGap}: ${formatAmount(result.gapVsBudget, lang)}`,
      `${t.summaryRecommended}: ${formatAmount(result.recommendedFundingGoal, lang)}`,
      `${t.summaryStatus}: ${statusMap[result.status]}`,
      `${t.summaryAssumption}: ${t.summaryAssumptionValue}`
    ].join('\n');
  }

  function calculate(rawInput, options) {
    const opts = options || {};
    const lang = opts.lang || 'ko';
    const input = normalizeInput(rawInput || {});
    const error = validate(input, lang);

    if (error) {
      return { result: null, error };
    }

    const failedRate = input.failedPledgeRate / 100;
    const processingRate = input.paymentProcessingRate / 100;
    const taxRate = input.taxReserveRate / 100;

    const totalBudget = round2(
      input.productionBudget +
      input.fulfillmentBudget +
      input.shippingBudget +
      input.marketingBudget +
      input.contingencyReserve
    );
    const chargedAmount = round2(input.plannedFundingGoal * (1 - failedRate));
    const kickstarterFee = round2(chargedAmount * KICKSTARTER_FEE_RATE);
    const processingFee = round2(chargedAmount * processingRate);
    const taxReserveAmount = round2(chargedAmount * taxRate);
    const netProceeds = round2(chargedAmount - kickstarterFee - processingFee - taxReserveAmount);
    const gapVsBudget = round2(netProceeds - totalBudget);
    const effectiveTakeHomeRatePct = input.plannedFundingGoal > 0
      ? round2((netProceeds / input.plannedFundingGoal) * 100)
      : 0;
    const takeHomeFactor = round((
      (1 - failedRate) *
      (1 - KICKSTARTER_FEE_RATE - processingRate - taxRate)
    ), 6);
    const recommendedFundingGoal = takeHomeFactor > 0
      ? round2(totalBudget / takeHomeFactor)
      : Infinity;
    const goalDelta = Number.isFinite(recommendedFundingGoal)
      ? round2(recommendedFundingGoal - input.plannedFundingGoal)
      : Infinity;
    const status = resolveStatus(gapVsBudget);

    const result = {
      input,
      totalBudget,
      chargedAmount,
      kickstarterFee,
      processingFee,
      taxReserveAmount,
      netProceeds,
      gapVsBudget,
      effectiveTakeHomeRatePct,
      recommendedFundingGoal,
      goalDelta,
      takeHomeFactor,
      status
    };

    result.summary = buildSummary(result, lang);

    return { result, error: '' };
  }

  function initPage() {
    if (!root.document) {
      return;
    }

    const inputIds = [
      'plannedFundingGoal',
      'productionBudget',
      'fulfillmentBudget',
      'shippingBudget',
      'marketingBudget',
      'contingencyReserve',
      'failedPledgeRate',
      'paymentProcessingRate',
      'taxReserveRate'
    ];
    const fieldMap = Object.fromEntries(inputIds.map((id) => [id, root.document.getElementById(id)]));
    const outputs = {
      totalBudget: root.document.getElementById('totalBudget'),
      netProceeds: root.document.getElementById('netProceeds'),
      recommendedFundingGoal: root.document.getElementById('recommendedFundingGoal'),
      chargedAmount: root.document.getElementById('chargedAmount'),
      kickstarterFee: root.document.getElementById('kickstarterFee'),
      processingFee: root.document.getElementById('processingFee'),
      taxReserveAmount: root.document.getElementById('taxReserveAmount'),
      gapVsBudget: root.document.getElementById('gapVsBudget'),
      effectiveTakeHomeRatePct: root.document.getElementById('effectiveTakeHomeRatePct'),
      goalDelta: root.document.getElementById('goalDelta'),
      takeHomeFactor: root.document.getElementById('takeHomeFactor'),
      statusValue: root.document.getElementById('statusValue'),
      statusHint: root.document.getElementById('statusHint'),
      summary: root.document.getElementById('summary'),
      error: root.document.getElementById('error'),
      resultPanel: root.document.getElementById('resultPanel')
    };
    const copyButton = root.document.getElementById('copyButton');
    const resetButton = root.document.getElementById('resetButton');
    const langButton = root.document.getElementById('langButton');
    let currentLang = 'ko';

    function text() {
      return TEXT[currentLang] || TEXT.ko;
    }

    function setStaticText() {
      const t = text();
      root.document.documentElement.lang = currentLang;
      root.document.title = t.pageTitleFull;
      const pageHeading = root.document.getElementById('pageHeading');
      if (pageHeading) {
        pageHeading.textContent = t.pageTitle;
      }
      root.document.querySelectorAll('[data-i18n]').forEach((node) => {
        const key = node.getAttribute('data-i18n');
        if (t[key]) {
          node.textContent = t[key];
        }
      });
      root.document.querySelectorAll('[data-i18n-placeholder]').forEach((node) => {
        const key = node.getAttribute('data-i18n-placeholder');
        if (t[key]) {
          node.setAttribute('placeholder', t[key]);
        }
      });
      langButton.textContent = currentLang === 'ko' ? 'EN' : 'KO';
    }

    function getInput() {
      const input = {};
      inputIds.forEach((id) => {
        input[id] = fieldMap[id] ? fieldMap[id].value : '';
      });
      return input;
    }

    function fillDefaults() {
      inputIds.forEach((id) => {
        if (fieldMap[id]) {
          fieldMap[id].value = DEFAULTS[id];
        }
      });
    }

    function render() {
      const t = text();
      const { result, error } = calculate(getInput(), { lang: currentLang });

      if (error) {
        outputs.error.textContent = error || t.invalid;
        outputs.error.hidden = false;
        outputs.resultPanel.dataset.status = 'invalid';
        outputs.statusValue.textContent = t.invalid;
        outputs.statusHint.textContent = t.waiting;
        outputs.summary.value = t.invalid;
        [
          'totalBudget',
          'netProceeds',
          'recommendedFundingGoal',
          'chargedAmount',
          'kickstarterFee',
          'processingFee',
          'taxReserveAmount',
          'gapVsBudget',
          'effectiveTakeHomeRatePct',
          'goalDelta',
          'takeHomeFactor'
        ].forEach((key) => {
          outputs[key].textContent = '—';
        });
        return;
      }

      outputs.error.hidden = true;
      outputs.resultPanel.dataset.status = result.status;
      outputs.statusValue.textContent = t[`status${result.status.charAt(0).toUpperCase()}${result.status.slice(1)}`];
      outputs.statusHint.textContent = t[`${result.status}Hint`];
      outputs.totalBudget.textContent = formatAmount(result.totalBudget, currentLang);
      outputs.netProceeds.textContent = formatAmount(result.netProceeds, currentLang);
      outputs.recommendedFundingGoal.textContent = formatAmount(result.recommendedFundingGoal, currentLang);
      outputs.chargedAmount.textContent = formatAmount(result.chargedAmount, currentLang);
      outputs.kickstarterFee.textContent = formatAmount(result.kickstarterFee, currentLang);
      outputs.processingFee.textContent = formatAmount(result.processingFee, currentLang);
      outputs.taxReserveAmount.textContent = formatAmount(result.taxReserveAmount, currentLang);
      outputs.gapVsBudget.textContent = formatAmount(result.gapVsBudget, currentLang);
      outputs.effectiveTakeHomeRatePct.textContent = `${result.effectiveTakeHomeRatePct.toFixed(2)}%`;
      outputs.goalDelta.textContent = formatAmount(result.goalDelta, currentLang);
      outputs.takeHomeFactor.textContent = Number.isFinite(result.takeHomeFactor)
        ? result.takeHomeFactor.toFixed(4)
        : t.na;
      outputs.summary.value = result.summary;
    }

    fillDefaults();
    setStaticText();
    render();

    inputIds.forEach((id) => {
      if (fieldMap[id]) {
        fieldMap[id].addEventListener('input', render);
      }
    });

    resetButton.addEventListener('click', () => {
      fillDefaults();
      render();
    });

    copyButton.addEventListener('click', async () => {
      const t = text();
      try {
        await root.navigator.clipboard.writeText(outputs.summary.value);
        root.alert(t.copied);
      } catch (error) {
        root.alert(t.copyFail);
      }
    });

    langButton.addEventListener('click', () => {
      currentLang = currentLang === 'ko' ? 'en' : 'ko';
      setStaticText();
      render();
    });
  }

  const api = {
    DEFAULTS,
    KICKSTARTER_FEE_RATE,
    TEXT,
    calculate,
    formatAmount
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.KickstarterNetProceedsCalculator = api;
    if (root.document) {
      if (root.document.readyState === 'loading') {
        root.document.addEventListener('DOMContentLoaded', initPage);
      } else {
        initPage();
      }
    }
  }
})(typeof globalThis !== 'undefined' ? globalThis : window);
