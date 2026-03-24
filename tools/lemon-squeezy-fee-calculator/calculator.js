/* Lemon Squeezy Fee Calculator
 * Pure calculator API for tests + browser UI wiring for the static page.
 */
(function (root) {
  const DEFAULTS = {
    orderCount: 100,
    listPrice: 29,
    taxRate: 0,
    platformFeeRate: 5,
    platformFixedFee: 0.50,
    isInternationalPayment: false,
    internationalSurchargeRate: 1.5,
    paymentMethod: 'card',
    paypalSurchargeRate: 1.5,
    isSubscription: false,
    subscriptionSurchargeRate: 0.5,
    extraMarketingFeeRate: 0,
    payoutMethod: 'stripe',
    payoutRegion: 'us',
    payoutCount: 1,
    targetNetAfterPayoutPerOrder: 20
  };

  const TEXT = {
    copied: 'Summary copied.',
    copyFail: 'Clipboard unavailable. Please copy manually.',
    summaryTitle: '[Lemon Squeezy Fee Calculator Summary]',
    estimateNote: 'Planning estimate only. Lemon Squeezy pricing, payout fees, and regional handling can change over time.',
    assumptions: 'This v1 models Lemon Squeezy base fee plus optional international, PayPal, subscription, and extra marketing adders. Taxes are not creator revenue.'
  };

  const UI_TEXT = {
    en: {
      docTitle: 'Lemon Squeezy Fee Calculator | Net Revenue, Payout Fees & Target Price',
      backLink: '← Tools',
      langButton: 'KR',
      pageTitle: 'Lemon Squeezy Fee Calculator',
      pageSubtitle: 'Estimate tax-inclusive Lemon Squeezy fees, payout drag, and the list price you need to net a target amount after payout.',
      pageDisclaimer: 'Editable defaults model Lemon Squeezy public fee assumptions only. Taxes are collected from the customer and are not treated as creator revenue in this calculator.',
      inputsHeading: 'Inputs',
      totalsHeading: 'Key totals',
      detailsHeading: 'Details',
      summaryHeading: 'Summary',
      copySummary: 'Copy summary',
      resetDefaults: 'Reset defaults',
      labels: {
        orderCount: 'Orders (period)',
        listPrice: 'List price',
        taxRate: 'Tax rate (%)',
        platformFeeRate: 'Platform fee rate (%)',
        platformFixedFee: 'Platform fixed fee',
        paymentMethod: 'Payment method',
        isInternationalPayment: 'International payment?',
        isSubscription: 'Subscription?',
        internationalSurchargeRate: 'International surcharge (%)',
        paypalSurchargeRate: 'PayPal surcharge (%)',
        subscriptionSurchargeRate: 'Subscription surcharge (%)',
        extraMarketingFeeRate: 'Extra marketing fee (%)',
        payoutMethod: 'Payout method',
        payoutRegion: 'Payout region',
        payoutCount: 'Payout count (period)',
        targetNetAfterPayoutPerOrder: 'Target net after payout (per order)'
      },
      notes: {
        feeAssumption: 'Base platform fee and fixed fee are editable assumptions so you can match your own Lemon Squeezy setup.',
        taxBehavior: 'Fees are modeled on the tax-inclusive customer total, but taxes themselves are not counted as creator revenue.',
        payoutBehavior: 'International, PayPal, subscription, and payout-mode choices can materially change take-home.',
        marketingBehavior: 'Use the extra marketing fee field for abandoned-cart or affiliate-style fee drag when relevant.'
      },
      kpis: {
        combinedRate: 'Combined platform rate',
        takeHomePerOrder: 'Take-home per order',
        targetPrice: 'Target list price'
      },
      details: {
        customerTotalPerOrder: 'Customer total / order',
        taxAmountPerOrder: 'Tax / order',
        platformFeePerOrder: 'Platform fee / order',
        netBeforePayoutPerOrder: 'Net before payout / order',
        periodCustomerBillings: 'Period billings',
        periodTaxCollected: 'Period tax collected',
        periodPlatformFees: 'Period platform fees',
        periodNetBeforePayout: 'Period net before payout',
        periodPayoutFee: 'Period payout fee',
        periodNetAfterPayout: 'Period net after payout',
        effectiveTakeHomeRatePct: 'Effective take-home rate',
        targetCustomerTotal: 'Target customer total'
      },
      assumptions: TEXT.assumptions,
      summaryPlaceholder: 'Summary includes payout mode, take-home, and target pricing.',
      statusPrefix: 'Status',
      validationPrefix: 'Input error',
      statusGood: 'healthy margin',
      statusTight: 'tight margin',
      statusNegative: 'negative margin',
      copied: 'Summary copied.',
      copyFail: 'Clipboard unavailable. Please copy manually.',
      paymentMethodOptions: { card: 'Card', paypal: 'PayPal' },
      boolOptions: { false: 'No', true: 'Yes' },
      payoutMethodOptions: { stripe: 'Stripe', paypal: 'PayPal' },
      payoutRegionOptions: { us: 'US', intl: 'Non-US' },
      summaryLines: {
        title: '[Lemon Squeezy Fee Calculator Summary]',
        payout: 'Payout mode',
        combinedRate: 'Combined platform rate',
        customerTotal: 'Customer total per order',
        platformFee: 'Platform fee per order',
        netBefore: 'Net before payout per order',
        netAfter: 'Estimated net after payout per order',
        targetPrice: 'Target list price',
        targetCustomerTotal: 'Target customer total'
      }
    },
    ko: {
      docTitle: '레몬 스퀴지 수수료 계산기 | 실수령액·정산 수수료·목표 판매가',
      backLink: '← 도구',
      langButton: 'EN',
      pageTitle: '레몬 스퀴지 수수료 계산기',
      pageSubtitle: '세금 포함 주문 기준 Lemon Squeezy 수수료, 정산 드래그, 목표 실수령액을 맞추기 위한 판매가를 계산합니다.',
      pageDisclaimer: '기본값은 Lemon Squeezy 공개 수수료 가정을 반영한 계획용 모델입니다. 세금은 고객에게서 징수되며 창작자 매출로 보지 않습니다.',
      inputsHeading: '입력값',
      totalsHeading: '핵심 결과',
      detailsHeading: '상세 계산',
      summaryHeading: '요약',
      copySummary: '요약 복사',
      resetDefaults: '기본값 복원',
      labels: {
        orderCount: '주문 수 (기간)',
        listPrice: '판매가',
        taxRate: '세율 (%)',
        platformFeeRate: '플랫폼 수수료율 (%)',
        platformFixedFee: '플랫폼 고정 수수료',
        paymentMethod: '결제 수단',
        isInternationalPayment: '해외 결제인가요?',
        isSubscription: '구독 상품인가요?',
        internationalSurchargeRate: '해외 결제 가산율 (%)',
        paypalSurchargeRate: 'PayPal 가산율 (%)',
        subscriptionSurchargeRate: '구독 가산율 (%)',
        extraMarketingFeeRate: '추가 마케팅 수수료 (%)',
        payoutMethod: '정산 수단',
        payoutRegion: '정산 지역',
        payoutCount: '정산 횟수 (기간)',
        targetNetAfterPayoutPerOrder: '주문당 목표 실수령액'
      },
      notes: {
        feeAssumption: '기본 플랫폼 수수료와 고정 수수료는 계정 조건에 맞게 수정할 수 있는 가정값입니다.',
        taxBehavior: '수수료는 세금 포함 고객 결제총액 기준으로 계산하지만, 세금 자체는 창작자 매출로 넣지 않습니다.',
        payoutBehavior: '해외 결제·PayPal·구독·정산 방식 선택에 따라 최종 실수령액이 크게 달라질 수 있습니다.',
        marketingBehavior: '장바구니 복구나 제휴 수수료 같은 추가 비용이 있으면 extra marketing fee에 넣으세요.'
      },
      kpis: {
        combinedRate: '총 플랫폼 수수료율',
        takeHomePerOrder: '주문당 실수령액',
        targetPrice: '목표 판매가'
      },
      details: {
        customerTotalPerOrder: '주문당 고객 결제총액',
        taxAmountPerOrder: '주문당 세금',
        platformFeePerOrder: '주문당 플랫폼 수수료',
        netBeforePayoutPerOrder: '정산 전 주문당 순액',
        periodCustomerBillings: '기간 총 청구액',
        periodTaxCollected: '기간 총 세금 징수액',
        periodPlatformFees: '기간 총 플랫폼 수수료',
        periodNetBeforePayout: '기간 정산 전 순액',
        periodPayoutFee: '기간 정산 수수료',
        periodNetAfterPayout: '기간 정산 후 순액',
        effectiveTakeHomeRatePct: '실효 실수령률',
        targetCustomerTotal: '목표 고객 결제총액'
      },
      assumptions: '이 v1 계산기는 Lemon Squeezy 기본 수수료와 해외 결제·PayPal·구독·추가 마케팅 가산을 단순 모델링합니다. 세금은 창작자 매출이 아닙니다.',
      summaryPlaceholder: '정산 방식, 실수령액, 목표 판매가가 요약됩니다.',
      statusPrefix: '상태',
      validationPrefix: '입력 오류',
      statusGood: '마진 양호',
      statusTight: '마진 촉박',
      statusNegative: '마진 음수',
      copied: '요약을 복사했습니다.',
      copyFail: '클립보드를 사용할 수 없습니다. 수동으로 복사해 주세요.',
      paymentMethodOptions: { card: '카드', paypal: 'PayPal' },
      boolOptions: { false: '아니요', true: '예' },
      payoutMethodOptions: { stripe: 'Stripe', paypal: 'PayPal' },
      payoutRegionOptions: { us: '미국', intl: '미국 외' },
      summaryLines: {
        title: '[레몬 스퀴지 수수료 계산기 요약]',
        payout: '정산 모드',
        combinedRate: '총 플랫폼 수수료율',
        customerTotal: '주문당 고객 결제총액',
        platformFee: '주문당 플랫폼 수수료',
        netBefore: '정산 전 주문당 순액',
        netAfter: '정산 후 주문당 예상 실수령액',
        targetPrice: '목표 판매가',
        targetCustomerTotal: '목표 고객 결제총액'
      }
    }
  };

  function round(value, digits) {
    const factor = 10 ** digits;
    return Math.round((value + Number.EPSILON) * factor) / factor;
  }

  function r2(value) {
    return round(value, 2);
  }

  function num(value, fallback = NaN) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function bool(value) {
    return value === true || value === 'true' || value === '1' || value === 1 || value === 'on';
  }

  function normalize(input) {
    const source = input || {};
    return {
      orderCount: num(source.orderCount, DEFAULTS.orderCount),
      listPrice: num(source.listPrice, DEFAULTS.listPrice),
      taxRate: num(source.taxRate, DEFAULTS.taxRate),
      platformFeeRate: num(source.platformFeeRate, DEFAULTS.platformFeeRate),
      platformFixedFee: num(source.platformFixedFee, DEFAULTS.platformFixedFee),
      isInternationalPayment: bool(source.isInternationalPayment),
      internationalSurchargeRate: num(source.internationalSurchargeRate, DEFAULTS.internationalSurchargeRate),
      paymentMethod: source.paymentMethod === 'paypal' ? 'paypal' : 'card',
      paypalSurchargeRate: num(source.paypalSurchargeRate, DEFAULTS.paypalSurchargeRate),
      isSubscription: bool(source.isSubscription),
      subscriptionSurchargeRate: num(source.subscriptionSurchargeRate, DEFAULTS.subscriptionSurchargeRate),
      extraMarketingFeeRate: num(source.extraMarketingFeeRate, DEFAULTS.extraMarketingFeeRate),
      payoutMethod: source.payoutMethod === 'paypal' ? 'paypal' : 'stripe',
      payoutRegion: source.payoutRegion === 'intl' ? 'intl' : 'us',
      payoutCount: num(source.payoutCount, DEFAULTS.payoutCount),
      targetNetAfterPayoutPerOrder: num(source.targetNetAfterPayoutPerOrder, DEFAULTS.targetNetAfterPayoutPerOrder)
    };
  }

  function validate(input) {
    if (!Number.isFinite(input.orderCount) || !Number.isInteger(input.orderCount) || input.orderCount < 1) return 'orderCount must be an integer >= 1';
    if (!Number.isFinite(input.listPrice) || !(input.listPrice > 0)) return 'listPrice must be > 0';
    if (!Number.isFinite(input.taxRate) || input.taxRate < 0 || input.taxRate > 100) return 'taxRate percent must be 0..100';
    if (!Number.isFinite(input.platformFeeRate) || input.platformFeeRate < 0 || input.platformFeeRate > 100) return 'platformFeeRate must be 0..100';
    if (!Number.isFinite(input.platformFixedFee) || input.platformFixedFee < 0) return 'platformFixedFee must be >= 0';
    if (!Number.isFinite(input.internationalSurchargeRate) || input.internationalSurchargeRate < 0 || input.internationalSurchargeRate > 100) return 'internationalSurchargeRate must be 0..100';
    if (!Number.isFinite(input.paypalSurchargeRate) || input.paypalSurchargeRate < 0 || input.paypalSurchargeRate > 100) return 'paypalSurchargeRate must be 0..100';
    if (!Number.isFinite(input.subscriptionSurchargeRate) || input.subscriptionSurchargeRate < 0 || input.subscriptionSurchargeRate > 100) return 'subscriptionSurchargeRate must be 0..100';
    if (!Number.isFinite(input.extraMarketingFeeRate) || input.extraMarketingFeeRate < 0 || input.extraMarketingFeeRate > 100) return 'extraMarketingFeeRate must be 0..100';
    if (!Number.isFinite(input.payoutCount) || !Number.isInteger(input.payoutCount) || input.payoutCount < 1) return 'payoutCount must be an integer >= 1';
    if (!Number.isFinite(input.targetNetAfterPayoutPerOrder) || input.targetNetAfterPayoutPerOrder < 0) return 'targetNetAfterPayoutPerOrder must be >= 0';
    if (input.paymentMethod !== 'card' && input.paymentMethod !== 'paypal') return 'paymentMethod must be card|paypal';
    if (input.payoutMethod !== 'stripe' && input.payoutMethod !== 'paypal') return 'payoutMethod must be stripe|paypal';
    if (input.payoutRegion !== 'us' && input.payoutRegion !== 'intl') return 'payoutRegion must be us|intl';
    return '';
  }

  function combinedPlatformRatePct(input) {
    return input.platformFeeRate
      + (input.isInternationalPayment ? input.internationalSurchargeRate : 0)
      + (input.paymentMethod === 'paypal' ? input.paypalSurchargeRate : 0)
      + (input.isSubscription ? input.subscriptionSurchargeRate : 0)
      + input.extraMarketingFeeRate;
  }

  function payoutModeLabel(input) {
    if (input.payoutMethod === 'stripe' && input.payoutRegion === 'us') return 'Stripe / US bank';
    if (input.payoutMethod === 'stripe' && input.payoutRegion === 'intl') return 'Stripe / non-US bank';
    if (input.payoutMethod === 'paypal' && input.payoutRegion === 'us') return 'PayPal / US';
    return 'PayPal / non-US';
  }

  function buildApiSummary(result) {
    return [
      TEXT.summaryTitle,
      `Orders: ${result.inputs.orderCount}`,
      `Payout mode: ${result.payoutModeLabel}`,
      `Combined platform rate: ${r2(result.combinedPlatformRatePct)}%`,
      `Customer total per order: ${r2(result.customerTotalPerOrder)}`,
      `Platform fee per order: ${r2(result.platformFeePerOrder)}`,
      `Net before payout per order: ${r2(result.netBeforePayoutPerOrder)}`,
      `Estimated net after payout per order: ${r2(result.estimatedNetAfterPayoutPerOrder)}`,
      `Target list price to net ${r2(result.inputs.targetNetAfterPayoutPerOrder)}: ${Number.isFinite(result.targetListPriceForDesiredNetAfterPayout) ? r2(result.targetListPriceForDesiredNetAfterPayout) : '—'}`,
      TEXT.assumptions,
      TEXT.estimateNote
    ].join('\n');
  }

  function evaluate(rawInput) {
    const input = normalize(rawInput);
    const error = validate(input);
    if (error) return { result: null, error };

    const n = input.orderCount;
    const p = input.listPrice;
    const t = input.taxRate / 100;
    const ratePct = combinedPlatformRatePct(input);
    const rate = ratePct / 100;
    const fixedFee = input.platformFixedFee;

    const taxAmountPerOrder = p * t;
    const customerTotalPerOrder = p + taxAmountPerOrder;
    const platformFeePerOrder = customerTotalPerOrder * rate + fixedFee;
    const netBeforePayoutPerOrder = customerTotalPerOrder - taxAmountPerOrder - platformFeePerOrder;

    const periodCustomerBillings = customerTotalPerOrder * n;
    const periodTaxCollected = taxAmountPerOrder * n;
    const periodPlatformFees = platformFeePerOrder * n;
    const periodNetBeforePayout = netBeforePayoutPerOrder * n;

    let periodPayoutFee = 0;
    if (periodNetBeforePayout > 0) {
      if (input.payoutMethod === 'stripe' && input.payoutRegion === 'intl') {
        periodPayoutFee = periodNetBeforePayout * 0.01;
      } else if (input.payoutMethod === 'paypal' && input.payoutRegion === 'us') {
        periodPayoutFee = input.payoutCount * 0.50;
      } else if (input.payoutMethod === 'paypal' && input.payoutRegion === 'intl') {
        periodPayoutFee = input.payoutCount * Math.min((periodNetBeforePayout / input.payoutCount) * 0.03, 30);
      }
    }

    const periodNetAfterPayout = periodNetBeforePayout - periodPayoutFee;
    const estimatedNetAfterPayoutPerOrder = periodNetAfterPayout / n;
    const effectiveTakeHomeRatePct = periodCustomerBillings > 0 ? (periodNetAfterPayout / periodCustomerBillings) * 100 : 0;

    const targetAfterTotal = input.targetNetAfterPayoutPerOrder * n;
    const unitTakeHomeFactor = 1 - ((1 + t) * rate);
    let requiredNetBeforePayoutTotal = Infinity;

    if (targetAfterTotal === 0) {
      requiredNetBeforePayoutTotal = 0;
    } else if (unitTakeHomeFactor > 0) {
      if (input.payoutMethod === 'stripe' && input.payoutRegion === 'us') {
        requiredNetBeforePayoutTotal = targetAfterTotal;
      } else if (input.payoutMethod === 'stripe' && input.payoutRegion === 'intl') {
        requiredNetBeforePayoutTotal = targetAfterTotal / 0.99;
      } else if (input.payoutMethod === 'paypal' && input.payoutRegion === 'us') {
        requiredNetBeforePayoutTotal = targetAfterTotal + (input.payoutCount * 0.50);
      } else {
        const uncappedTotal = targetAfterTotal / 0.97;
        if ((uncappedTotal / input.payoutCount) <= 1000) {
          requiredNetBeforePayoutTotal = uncappedTotal;
        } else {
          requiredNetBeforePayoutTotal = targetAfterTotal + (input.payoutCount * 30);
        }
      }
    }

    let targetListPriceForDesiredNetAfterPayout = Infinity;
    let targetCustomerTotalForDesiredNetAfterPayout = Infinity;
    if (requiredNetBeforePayoutTotal === 0) {
      targetListPriceForDesiredNetAfterPayout = 0;
      targetCustomerTotalForDesiredNetAfterPayout = 0;
    } else if (Number.isFinite(requiredNetBeforePayoutTotal) && unitTakeHomeFactor > 0) {
      targetListPriceForDesiredNetAfterPayout = ((requiredNetBeforePayoutTotal / n) + fixedFee) / unitTakeHomeFactor;
      targetCustomerTotalForDesiredNetAfterPayout = targetListPriceForDesiredNetAfterPayout * (1 + t);
    }

    const roundedNetAfter = r2(estimatedNetAfterPayoutPerOrder);
    const status = roundedNetAfter > 0.01 ? 'good' : (roundedNetAfter >= -0.01 ? 'tight' : 'negative');

    const result = {
      inputs: input,
      payoutModeLabel: payoutModeLabel(input),
      combinedPlatformRatePct: r2(ratePct),
      taxAmountPerOrder: r2(taxAmountPerOrder),
      customerTotalPerOrder: r2(customerTotalPerOrder),
      platformFeePerOrder: r2(platformFeePerOrder),
      netBeforePayoutPerOrder: r2(netBeforePayoutPerOrder),
      periodCustomerBillings: r2(periodCustomerBillings),
      periodTaxCollected: r2(periodTaxCollected),
      periodPlatformFees: r2(periodPlatformFees),
      periodNetBeforePayout: r2(periodNetBeforePayout),
      periodPayoutFee: r2(periodPayoutFee),
      periodNetAfterPayout: r2(periodNetAfterPayout),
      estimatedNetAfterPayoutPerOrder: r2(estimatedNetAfterPayoutPerOrder),
      effectiveTakeHomeRatePct: r2(effectiveTakeHomeRatePct),
      targetListPriceForDesiredNetAfterPayout: Number.isFinite(targetListPriceForDesiredNetAfterPayout) ? r2(targetListPriceForDesiredNetAfterPayout) : Infinity,
      targetCustomerTotalForDesiredNetAfterPayout: Number.isFinite(targetCustomerTotalForDesiredNetAfterPayout) ? r2(targetCustomerTotalForDesiredNetAfterPayout) : Infinity,
      status
    };

    result.summary = buildApiSummary(result);
    return { result, error: '' };
  }

  const api = { DEFAULTS, TEXT, UI_TEXT, normalize, validate, combinedPlatformRatePct, payoutModeLabel, evaluate };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  root.LemonSqueezyFeeCalculator = api;

  if (typeof document === 'undefined') return;

  function $(id) {
    return document.getElementById(id);
  }

  function formatNumber(value, lang, digits) {
    const locale = lang === 'ko' ? 'ko-KR' : 'en-US';
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    }).format(value);
  }

  function formatPercent(value, lang) {
    return `${formatNumber(value, lang, 2)}%`;
  }

  function payoutModeLabelLocalized(result, lang) {
    if (lang !== 'ko') return result.payoutModeLabel;
    if (result.inputs.payoutMethod === 'stripe' && result.inputs.payoutRegion === 'us') return 'Stripe / 미국 은행';
    if (result.inputs.payoutMethod === 'stripe' && result.inputs.payoutRegion === 'intl') return 'Stripe / 미국 외 은행';
    if (result.inputs.payoutMethod === 'paypal' && result.inputs.payoutRegion === 'us') return 'PayPal / 미국';
    return 'PayPal / 미국 외';
  }

  function buildSummaryForUi(result, lang) {
    const ui = UI_TEXT[lang] || UI_TEXT.en;
    const lines = ui.summaryLines;
    return [
      lines.title,
      `${ui.labels.orderCount}: ${formatNumber(result.inputs.orderCount, lang, 0)}`,
      `${lines.payout}: ${payoutModeLabelLocalized(result, lang)}`,
      `${lines.combinedRate}: ${formatPercent(result.combinedPlatformRatePct, lang)}`,
      `${lines.customerTotal}: ${formatNumber(result.customerTotalPerOrder, lang, 2)}`,
      `${lines.platformFee}: ${formatNumber(result.platformFeePerOrder, lang, 2)}`,
      `${lines.netBefore}: ${formatNumber(result.netBeforePayoutPerOrder, lang, 2)}`,
      `${lines.netAfter}: ${formatNumber(result.estimatedNetAfterPayoutPerOrder, lang, 2)}`,
      `${lines.targetPrice}: ${Number.isFinite(result.targetListPriceForDesiredNetAfterPayout) ? formatNumber(result.targetListPriceForDesiredNetAfterPayout, lang, 2) : '—'}`,
      `${lines.targetCustomerTotal}: ${Number.isFinite(result.targetCustomerTotalForDesiredNetAfterPayout) ? formatNumber(result.targetCustomerTotalForDesiredNetAfterPayout, lang, 2) : '—'}`,
      ui.assumptions,
      lang === 'ko' ? '계획용 추정치입니다. 실제 Lemon Squeezy 수수료와 정산 정책은 변경될 수 있습니다.' : TEXT.estimateNote
    ].join('\n');
  }

  function initBrowser() {
    const refs = {
      docTitle: document.querySelector('title'),
      html: document.documentElement,
      backLink: $('backLink'),
      langBtn: $('langBtn'),
      pageTitle: $('pageTitle'),
      pageSubtitle: $('pageSubtitle'),
      pageDisclaimer: $('pageDisclaimer'),
      inputsHeading: $('inputsHeading'),
      totalsHeading: $('totalsHeading'),
      detailsHeading: $('detailsHeading'),
      summaryHeading: $('summaryHeading'),
      copySummary: $('copySummary'),
      resetDefaults: $('resetDefaults'),
      summary: $('summary'),
      assumptions: $('assumptions'),
      status: $('status'),
      note_feeAssumption: $('note_feeAssumption'),
      note_taxBehavior: $('note_taxBehavior'),
      note_payoutBehavior: $('note_payoutBehavior'),
      note_marketingBehavior: $('note_marketingBehavior'),
      orderCount: $('orderCount'),
      listPrice: $('listPrice'),
      taxRate: $('taxRate'),
      platformFeeRate: $('platformFeeRate'),
      platformFixedFee: $('platformFixedFee'),
      paymentMethod: $('paymentMethod'),
      isInternationalPayment: $('isInternationalPayment'),
      isSubscription: $('isSubscription'),
      internationalSurchargeRate: $('internationalSurchargeRate'),
      paypalSurchargeRate: $('paypalSurchargeRate'),
      subscriptionSurchargeRate: $('subscriptionSurchargeRate'),
      extraMarketingFeeRate: $('extraMarketingFeeRate'),
      payoutMethod: $('payoutMethod'),
      payoutRegion: $('payoutRegion'),
      payoutCount: $('payoutCount'),
      targetNetAfterPayoutPerOrder: $('targetNetAfterPayoutPerOrder'),
      outputs: {
        combinedPlatformRatePct: $('o_combinedPlatformRatePct'),
        taxAmountPerOrder: $('o_taxAmountPerOrder'),
        customerTotalPerOrder: $('o_customerTotalPerOrder'),
        platformFeePerOrder: $('o_platformFeePerOrder'),
        netBeforePayoutPerOrder: $('o_netBeforePayoutPerOrder'),
        periodCustomerBillings: $('o_periodCustomerBillings'),
        periodTaxCollected: $('o_periodTaxCollected'),
        periodPlatformFees: $('o_periodPlatformFees'),
        periodNetBeforePayout: $('o_periodNetBeforePayout'),
        periodPayoutFee: $('o_periodPayoutFee'),
        periodNetAfterPayout: $('o_periodNetAfterPayout'),
        estimatedNetAfterPayoutPerOrder: $('o_estimatedNetAfterPayoutPerOrder'),
        effectiveTakeHomeRatePct: $('o_effectiveTakeHomeRatePct'),
        targetListPriceForDesiredNetAfterPayout: $('o_targetListPrice'),
        targetCustomerTotalForDesiredNetAfterPayout: $('o_targetCustomerTotal')
      }
    };

    const labelIds = [
      'orderCount', 'listPrice', 'taxRate', 'platformFeeRate', 'platformFixedFee', 'paymentMethod',
      'isInternationalPayment', 'isSubscription', 'internationalSurchargeRate', 'paypalSurchargeRate',
      'subscriptionSurchargeRate', 'extraMarketingFeeRate', 'payoutMethod', 'payoutRegion',
      'payoutCount', 'targetNetAfterPayoutPerOrder'
    ];

    const detailIds = [
      'customerTotalPerOrder', 'taxAmountPerOrder', 'platformFeePerOrder', 'netBeforePayoutPerOrder',
      'periodCustomerBillings', 'periodTaxCollected', 'periodPlatformFees', 'periodNetBeforePayout',
      'periodPayoutFee', 'periodNetAfterPayout', 'effectiveTakeHomeRatePct', 'targetCustomerTotal'
    ];

    const inputNodes = [
      refs.orderCount,
      refs.listPrice,
      refs.taxRate,
      refs.platformFeeRate,
      refs.platformFixedFee,
      refs.paymentMethod,
      refs.isInternationalPayment,
      refs.isSubscription,
      refs.internationalSurchargeRate,
      refs.paypalSurchargeRate,
      refs.subscriptionSurchargeRate,
      refs.extraMarketingFeeRate,
      refs.payoutMethod,
      refs.payoutRegion,
      refs.payoutCount,
      refs.targetNetAfterPayoutPerOrder
    ];

    let currentLang = 'en';

    function setDefaults() {
      refs.orderCount.value = DEFAULTS.orderCount;
      refs.listPrice.value = DEFAULTS.listPrice;
      refs.taxRate.value = DEFAULTS.taxRate;
      refs.platformFeeRate.value = DEFAULTS.platformFeeRate;
      refs.platformFixedFee.value = DEFAULTS.platformFixedFee;
      refs.paymentMethod.value = DEFAULTS.paymentMethod;
      refs.isInternationalPayment.value = String(DEFAULTS.isInternationalPayment);
      refs.isSubscription.value = String(DEFAULTS.isSubscription);
      refs.internationalSurchargeRate.value = DEFAULTS.internationalSurchargeRate;
      refs.paypalSurchargeRate.value = DEFAULTS.paypalSurchargeRate;
      refs.subscriptionSurchargeRate.value = DEFAULTS.subscriptionSurchargeRate;
      refs.extraMarketingFeeRate.value = DEFAULTS.extraMarketingFeeRate;
      refs.payoutMethod.value = DEFAULTS.payoutMethod;
      refs.payoutRegion.value = DEFAULTS.payoutRegion;
      refs.payoutCount.value = DEFAULTS.payoutCount;
      refs.targetNetAfterPayoutPerOrder.value = DEFAULTS.targetNetAfterPayoutPerOrder;
    }

    function gather() {
      return {
        orderCount: refs.orderCount.value,
        listPrice: refs.listPrice.value,
        taxRate: refs.taxRate.value,
        platformFeeRate: refs.platformFeeRate.value,
        platformFixedFee: refs.platformFixedFee.value,
        paymentMethod: refs.paymentMethod.value,
        isInternationalPayment: refs.isInternationalPayment.value,
        isSubscription: refs.isSubscription.value,
        internationalSurchargeRate: refs.internationalSurchargeRate.value,
        paypalSurchargeRate: refs.paypalSurchargeRate.value,
        subscriptionSurchargeRate: refs.subscriptionSurchargeRate.value,
        extraMarketingFeeRate: refs.extraMarketingFeeRate.value,
        payoutMethod: refs.payoutMethod.value,
        payoutRegion: refs.payoutRegion.value,
        payoutCount: refs.payoutCount.value,
        targetNetAfterPayoutPerOrder: refs.targetNetAfterPayoutPerOrder.value
      };
    }

    function setSelectOptions(select, optionsMap) {
      Array.from(select.options).forEach((option) => {
        const translated = optionsMap[option.value];
        if (translated) option.textContent = translated;
      });
    }

    function applyStaticText() {
      const ui = UI_TEXT[currentLang] || UI_TEXT.en;
      refs.html.lang = currentLang;
      refs.docTitle.textContent = ui.docTitle;
      refs.backLink.textContent = ui.backLink;
      refs.langBtn.textContent = ui.langButton;
      refs.pageTitle.textContent = ui.pageTitle;
      refs.pageSubtitle.textContent = ui.pageSubtitle;
      refs.pageDisclaimer.textContent = ui.pageDisclaimer;
      refs.inputsHeading.textContent = ui.inputsHeading;
      refs.totalsHeading.textContent = ui.totalsHeading;
      refs.detailsHeading.textContent = ui.detailsHeading;
      refs.summaryHeading.textContent = ui.summaryHeading;
      refs.copySummary.textContent = ui.copySummary;
      refs.resetDefaults.textContent = ui.resetDefaults;
      refs.summary.placeholder = ui.summaryPlaceholder;
      refs.assumptions.textContent = ui.assumptions;
      refs.note_feeAssumption.textContent = ui.notes.feeAssumption;
      refs.note_taxBehavior.textContent = ui.notes.taxBehavior;
      refs.note_payoutBehavior.textContent = ui.notes.payoutBehavior;
      refs.note_marketingBehavior.textContent = ui.notes.marketingBehavior;
      $('kpiCombinedRate').textContent = ui.kpis.combinedRate;
      $('kpiTakeHomePerOrder').textContent = ui.kpis.takeHomePerOrder;
      $('kpiTargetPrice').textContent = ui.kpis.targetPrice;

      labelIds.forEach((id) => {
        const label = $(`label_${id}`);
        if (label) label.textContent = ui.labels[id];
      });

      detailIds.forEach((id) => {
        const label = $(`detail_${id}`);
        if (label) label.textContent = ui.details[id];
      });

      setSelectOptions(refs.paymentMethod, ui.paymentMethodOptions);
      setSelectOptions(refs.isInternationalPayment, ui.boolOptions);
      setSelectOptions(refs.isSubscription, ui.boolOptions);
      setSelectOptions(refs.payoutMethod, ui.payoutMethodOptions);
      setSelectOptions(refs.payoutRegion, ui.payoutRegionOptions);
    }

    function clearOutputs() {
      Object.values(refs.outputs).forEach((node) => {
        node.textContent = '—';
      });
      refs.summary.value = '';
    }

    function setStatus(message, kind) {
      refs.status.textContent = message;
      refs.status.className = kind ? `status ${kind}` : 'status';
    }

    function render() {
      const ui = UI_TEXT[currentLang] || UI_TEXT.en;
      const { result, error } = evaluate(gather());

      if (error) {
        clearOutputs();
        setStatus(`${ui.validationPrefix}: ${error}`, 'negative');
        return;
      }

      refs.outputs.combinedPlatformRatePct.textContent = formatPercent(result.combinedPlatformRatePct, currentLang);
      refs.outputs.taxAmountPerOrder.textContent = formatNumber(result.taxAmountPerOrder, currentLang, 2);
      refs.outputs.customerTotalPerOrder.textContent = formatNumber(result.customerTotalPerOrder, currentLang, 2);
      refs.outputs.platformFeePerOrder.textContent = formatNumber(result.platformFeePerOrder, currentLang, 2);
      refs.outputs.netBeforePayoutPerOrder.textContent = formatNumber(result.netBeforePayoutPerOrder, currentLang, 2);
      refs.outputs.periodCustomerBillings.textContent = formatNumber(result.periodCustomerBillings, currentLang, 2);
      refs.outputs.periodTaxCollected.textContent = formatNumber(result.periodTaxCollected, currentLang, 2);
      refs.outputs.periodPlatformFees.textContent = formatNumber(result.periodPlatformFees, currentLang, 2);
      refs.outputs.periodNetBeforePayout.textContent = formatNumber(result.periodNetBeforePayout, currentLang, 2);
      refs.outputs.periodPayoutFee.textContent = formatNumber(result.periodPayoutFee, currentLang, 2);
      refs.outputs.periodNetAfterPayout.textContent = formatNumber(result.periodNetAfterPayout, currentLang, 2);
      refs.outputs.estimatedNetAfterPayoutPerOrder.textContent = formatNumber(result.estimatedNetAfterPayoutPerOrder, currentLang, 2);
      refs.outputs.effectiveTakeHomeRatePct.textContent = formatPercent(result.effectiveTakeHomeRatePct, currentLang);
      refs.outputs.targetListPriceForDesiredNetAfterPayout.textContent = Number.isFinite(result.targetListPriceForDesiredNetAfterPayout)
        ? formatNumber(result.targetListPriceForDesiredNetAfterPayout, currentLang, 2)
        : '—';
      refs.outputs.targetCustomerTotalForDesiredNetAfterPayout.textContent = Number.isFinite(result.targetCustomerTotalForDesiredNetAfterPayout)
        ? formatNumber(result.targetCustomerTotalForDesiredNetAfterPayout, currentLang, 2)
        : '—';
      refs.summary.value = buildSummaryForUi(result, currentLang);

      const localizedStatus = result.status === 'good'
        ? ui.statusGood
        : (result.status === 'tight' ? ui.statusTight : ui.statusNegative);
      setStatus(`${ui.statusPrefix}: ${localizedStatus} · ${payoutModeLabelLocalized(result, currentLang)}`, result.status);
    }

    inputNodes.forEach((node) => {
      node.addEventListener('input', render);
      node.addEventListener('change', render);
    });

    refs.langBtn.addEventListener('click', () => {
      currentLang = currentLang === 'en' ? 'ko' : 'en';
      applyStaticText();
      render();
    });

    refs.copySummary.addEventListener('click', async () => {
      const ui = UI_TEXT[currentLang] || UI_TEXT.en;
      if (!refs.summary.value.trim()) {
        render();
      }
      try {
        await navigator.clipboard.writeText(refs.summary.value);
        setStatus(ui.copied, 'good');
      } catch (error) {
        setStatus(ui.copyFail, 'tight');
      }
    });

    refs.resetDefaults.addEventListener('click', () => {
      setDefaults();
      applyStaticText();
      render();
    });

    setDefaults();
    applyStaticText();
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBrowser, { once: true });
  } else {
    initBrowser();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
