(function (global, factory) {
  const api = factory(
    typeof require === 'function' ? require('../stockx-fee-profit-calculator/calculator.js') : global.StockXFeeProfitCalculator,
    typeof require === 'function' ? require('../goat-fee-calculator/calculator.js') : global.GoatFeeCalculator
  );

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  global.StockxVsGoatProfitCalculator = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (stockxApi, goatApi) {
  'use strict';

  const MAX_SEARCH_PRICE = 1000000;
  const SEARCH_ITERATIONS = 64;
  const TIE_EPSILON = 0.005;

  if (!stockxApi || !goatApi) {
    throw new Error('StockX and GOAT calculator dependencies are required.');
  }

  const DEFAULT_INPUTS = Object.freeze({
    salePrice: 260,
    itemCost: 170,
    shippingCost: 14,
    packagingCost: 1.5,
    otherCost: 0,
    stockxSellerLevel: 'level-2',
    goatFeePreset: 'goat-baseline',
    goatCustomFeeRatePct: 9.5,
    goatCustomFlatFee: 5,
    goatRefundLossRatePct: 2,
  });

  function toFiniteNumber(value) {
    if (typeof value === 'number') return Number.isFinite(value) ? value : null;
    const text = String(value == null ? '' : value).trim().replace(/,/g, '');
    if (!text) return null;
    const numeric = Number(text);
    return Number.isFinite(numeric) ? numeric : null;
  }

  function roundTo(value, digits) {
    const factor = 10 ** digits;
    return Math.round((value + Number.EPSILON) * factor) / factor;
  }

  function round2(value) {
    return roundTo(value, 2);
  }

  function formatCurrency(value) {
    if (!Number.isFinite(value)) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  function formatPercent(value) {
    if (!Number.isFinite(value)) return 'N/A';
    return `${new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)}%`;
  }

  function mergeWithDefaults(rawInput) {
    return Object.assign({}, DEFAULT_INPUTS, rawInput || {});
  }

  function normalizeInput(rawInput) {
    const input = mergeWithDefaults(rawInput);
    return {
      salePrice: toFiniteNumber(input.salePrice),
      itemCost: toFiniteNumber(input.itemCost),
      shippingCost: toFiniteNumber(input.shippingCost),
      packagingCost: toFiniteNumber(input.packagingCost),
      otherCost: toFiniteNumber(input.otherCost),
      stockxSellerLevel: input.stockxSellerLevel || DEFAULT_INPUTS.stockxSellerLevel,
      goatFeePreset: input.goatFeePreset || DEFAULT_INPUTS.goatFeePreset,
      goatCustomFeeRatePct: toFiniteNumber(input.goatCustomFeeRatePct),
      goatCustomFlatFee: toFiniteNumber(input.goatCustomFlatFee),
      goatRefundLossRatePct: toFiniteNumber(input.goatRefundLossRatePct),
    };
  }

  function getGoatPreset(input) {
    if (goatApi.PRESET_MAP && goatApi.PRESET_MAP[input.goatFeePreset]) {
      return goatApi.PRESET_MAP[input.goatFeePreset];
    }
    if (typeof goatApi.getPreset === 'function') {
      return goatApi.getPreset({ feePreset: input.goatFeePreset });
    }
    return null;
  }

  function buildStockxInput(input, salePriceOverride) {
    return {
      salePrice: salePriceOverride != null ? salePriceOverride : input.salePrice,
      sellerLevel: input.stockxSellerLevel,
      itemCost: input.itemCost,
      shippingToStockx: input.shippingCost,
      packagingCost: input.packagingCost,
      otherCost: input.otherCost,
    };
  }

  function buildGoatInput(input, options) {
    const opts = options || {};
    return {
      salePrice: opts.salePrice != null ? opts.salePrice : input.salePrice,
      feePreset: input.goatFeePreset,
      sellerFeeRatePct: input.goatCustomFeeRatePct,
      flatFeePerOrder: input.goatCustomFlatFee,
      itemCost: input.itemCost,
      sellerShippingCost: input.shippingCost,
      packagingCost: input.packagingCost,
      otherSellerCost: input.otherCost,
      refundLossRatePct: input.goatRefundLossRatePct,
      desiredNetProfit: opts.desiredNetProfit != null ? opts.desiredNetProfit : 0,
    };
  }

  function validateInputs(rawInput) {
    const input = normalizeInput(rawInput);
    const errors = [];
    const nonNegativeFields = [
      ['itemCost', input.itemCost],
      ['shippingCost', input.shippingCost],
      ['packagingCost', input.packagingCost],
      ['otherCost', input.otherCost],
      ['goatCustomFlatFee', input.goatCustomFlatFee],
    ];

    if (!Number.isFinite(input.salePrice) || input.salePrice <= 0) {
      errors.push('salePrice must be greater than 0.');
    }

    nonNegativeFields.forEach(function (entry) {
      if (!Number.isFinite(entry[1]) || entry[1] < 0) {
        errors.push(`${entry[0]} must be zero or above.`);
      }
    });

    if (!stockxApi.SELLER_LEVEL_MAP || !stockxApi.SELLER_LEVEL_MAP[input.stockxSellerLevel]) {
      errors.push('stockxSellerLevel is unsupported.');
    }

    if (!getGoatPreset(input)) {
      errors.push('goatFeePreset is unsupported.');
    }

    if (!Number.isFinite(input.goatCustomFeeRatePct) || input.goatCustomFeeRatePct < 0 || input.goatCustomFeeRatePct > 100) {
      errors.push('goatCustomFeeRatePct must be between 0 and 100.');
    }

    if (!Number.isFinite(input.goatRefundLossRatePct) || input.goatRefundLossRatePct < 0 || input.goatRefundLossRatePct > 100) {
      errors.push('goatRefundLossRatePct must be between 0 and 100.');
    }

    if (errors.length > 0) {
      return { ok: false, errors, input };
    }

    const stockxValidation = stockxApi.calculate(buildStockxInput(input), { lang: 'en' });
    if (stockxValidation.error) {
      errors.push(stockxValidation.error);
    }

    const goatValidation = goatApi.calculate(buildGoatInput(input), { lang: 'en' });
    if (goatValidation.error) {
      errors.push(goatValidation.error);
    }

    return {
      ok: errors.length === 0,
      errors,
      input,
    };
  }

  function getStockxNetProfitAtPrice(input, salePrice) {
    const response = stockxApi.calculate(buildStockxInput(input, salePrice), { lang: 'en' });
    return response.error ? null : response.result.netProfit;
  }

  function getGoatResultAtPrice(input, salePrice) {
    return goatApi.calculate(buildGoatInput(input, { salePrice: salePrice }), { lang: 'en' });
  }

  function getWinner(stockxNetProfit, goatNetProfit) {
    const delta = stockxNetProfit - goatNetProfit;
    if (Math.abs(delta) < TIE_EPSILON) {
      return {
        winnerPlatform: 'tie',
        winnerDelta: 0,
        winnerTitle: 'It’s effectively a tie',
        winnerBody: `Both platforms land within ${formatCurrency(0.01)} of net profit at this sale price.`,
      };
    }

    if (delta > 0) {
      return {
        winnerPlatform: 'stockx',
        winnerDelta: round2(delta),
        winnerTitle: 'Winner: StockX',
        winnerBody: `StockX leads by ${formatCurrency(delta)} in final net profit at the same list price.`,
      };
    }

    return {
      winnerPlatform: 'goat',
      winnerDelta: round2(Math.abs(delta)),
      winnerTitle: 'Winner: GOAT',
      winnerBody: `GOAT leads by ${formatCurrency(Math.abs(delta))} in final net profit at the same list price.`,
    };
  }

  function findStockxPriceForTargetNet(input, targetNetProfit) {
    if (!Number.isFinite(targetNetProfit)) return null;

    const lowPrice = 0.01;
    const lowNet = getStockxNetProfitAtPrice(input, lowPrice);
    if (!Number.isFinite(lowNet)) return null;

    const currentPrice = input.salePrice;
    const currentNet = getStockxNetProfitAtPrice(input, currentPrice);
    if (!Number.isFinite(currentNet)) return null;

    let low = lowPrice;
    let high = currentPrice;

    if (Math.abs(currentNet - targetNetProfit) < TIE_EPSILON) {
      return round2(currentPrice);
    }

    if (targetNetProfit < lowNet) {
      return round2(lowPrice);
    }

    if (targetNetProfit > currentNet) {
      high = Math.max(1, currentPrice);
      let highNet = currentNet;
      while (high < MAX_SEARCH_PRICE && highNet < targetNetProfit) {
        low = high;
        high = Math.min(MAX_SEARCH_PRICE, high * 2);
        highNet = getStockxNetProfitAtPrice(input, high);
        if (!Number.isFinite(highNet)) return null;
      }
      if (!Number.isFinite(highNet) || highNet < targetNetProfit) {
        return null;
      }
    }

    for (let i = 0; i < SEARCH_ITERATIONS; i += 1) {
      const mid = (low + high) / 2;
      const midNet = getStockxNetProfitAtPrice(input, mid);
      if (!Number.isFinite(midNet)) return null;
      if (midNet >= targetNetProfit) {
        high = mid;
      } else {
        low = mid;
      }
    }

    return round2(high);
  }

  function findGoatPriceForTargetNet(input, targetNetProfit) {
    if (!Number.isFinite(targetNetProfit)) return null;

    const lowPrice = 0.01;
    const lowResponse = getGoatResultAtPrice(input, lowPrice);
    if (lowResponse.error) return null;
    const lowNet = lowResponse.result.netProfit;

    const currentResponse = getGoatResultAtPrice(input, input.salePrice);
    if (currentResponse.error) return null;
    const currentResult = currentResponse.result;
    const currentNet = currentResult.netProfit;

    if (!Number.isFinite(currentResult.contributionMargin) || currentResult.contributionMargin <= 0) {
      return null;
    }

    let low = lowPrice;
    let high = input.salePrice;

    if (Math.abs(currentNet - targetNetProfit) < TIE_EPSILON) {
      return round2(input.salePrice);
    }

    if (targetNetProfit < lowNet) {
      return round2(lowPrice);
    }

    if (targetNetProfit > currentNet) {
      high = Math.max(1, input.salePrice);
      let highResponse = currentResponse;
      while (high < MAX_SEARCH_PRICE && highResponse.result.netProfit < targetNetProfit) {
        low = high;
        high = Math.min(MAX_SEARCH_PRICE, high * 2);
        highResponse = getGoatResultAtPrice(input, high);
        if (highResponse.error) return null;
      }
      if (highResponse.error || highResponse.result.netProfit < targetNetProfit) {
        return null;
      }
    }

    for (let i = 0; i < SEARCH_ITERATIONS; i += 1) {
      const mid = (low + high) / 2;
      const midResponse = getGoatResultAtPrice(input, mid);
      if (midResponse.error) return null;
      if (midResponse.result.netProfit >= targetNetProfit) {
        high = mid;
      } else {
        low = mid;
      }
    }

    return round2(high);
  }

  function buildSummary(result) {
    const winnerLine = result.winnerPlatform === 'tie'
      ? 'Winner: tie'
      : `Winner: ${result.winnerPlatform === 'stockx' ? 'StockX' : 'GOAT'} by ${formatCurrency(result.winnerDelta)}`;

    return [
      '[StockX vs GOAT Profit Summary]',
      `Sale price: ${formatCurrency(result.inputs.salePrice)}`,
      winnerLine,
      `StockX payout after fees: ${formatCurrency(result.stockx.payoutAfterFees)}`,
      `StockX fee total: ${formatCurrency(result.stockx.finalStockxFees)}`,
      `StockX net profit: ${formatCurrency(result.stockx.netProfit)} (${formatPercent(result.stockx.netMarginPct)})`,
      `GOAT payout before seller costs: ${formatCurrency(result.goat.payoutBeforeSellerCosts)}`,
      `GOAT total drag (fees + refund planning loss): ${formatCurrency(result.goat.totalDrag)}`,
      `GOAT net profit: ${formatCurrency(result.goat.netProfit)} (${formatPercent(result.goat.netMarginPct)})`,
      `Price needed on StockX to match GOAT: ${result.priceNeededOnStockxToMatchGoat == null ? 'N/A' : formatCurrency(result.priceNeededOnStockxToMatchGoat)}`,
      `Price needed on GOAT to match StockX: ${result.priceNeededOnGoatToMatchStockx == null ? 'N/A' : formatCurrency(result.priceNeededOnGoatToMatchStockx)}`,
      'Assumption note: StockX uses the shipped US public baseline by seller level; GOAT uses the shipped public baseline (or your custom override) plus optional refund-planning loss.',
    ].join('\n');
  }

  function calculate(rawInput) {
    const validation = validateInputs(rawInput);
    if (!validation.ok) {
      return {
        result: null,
        error: validation.errors[0],
      };
    }

    const input = validation.input;
    const stockxResponse = stockxApi.calculate(buildStockxInput(input), { lang: 'en' });
    const goatResponse = goatApi.calculate(buildGoatInput(input), { lang: 'en' });

    if (stockxResponse.error) {
      return { result: null, error: stockxResponse.error };
    }

    if (goatResponse.error) {
      return { result: null, error: goatResponse.error };
    }

    const stockx = stockxResponse.result;
    const goat = goatResponse.result;
    const goatTotalDrag = goat.platformFeeTotal + goat.refundLoss;
    const winner = getWinner(stockx.netProfit, goat.netProfit);

    const result = {
      inputs: input,
      stockx: {
        sellerLevelLabel: stockx.sellerLevelLabel,
        finalStockxFees: round2(stockx.finalStockxFees),
        payoutAfterFees: round2(stockx.payoutAfterFees),
        netProfit: round2(stockx.netProfit),
        netMarginPct: round2(stockx.netMarginPct),
        breakEvenSalePrice: stockx.breakEvenSalePrice == null ? null : round2(stockx.breakEvenSalePrice),
        effectiveFeeRatePct: round2(stockx.effectiveFeeRatePct),
      },
      goat: {
        presetLabel: goat.presetLabel,
        platformFeeTotal: round2(goat.platformFeeTotal),
        refundLoss: round2(goat.refundLoss),
        totalDrag: round2(goatTotalDrag),
        payoutBeforeSellerCosts: round2(goat.payoutBeforeSellerCosts),
        netProfit: round2(goat.netProfit),
        netMarginPct: input.salePrice > 0 ? round2((goat.netProfit / input.salePrice) * 100) : 0,
        breakEvenListingPrice: goat.breakEvenListingPrice == null ? null : round2(goat.breakEvenListingPrice),
        effectiveTakeRatePct: round2(goat.effectiveTakeRatePct),
        contributionMarginPct: round2(goat.contributionMargin * 100),
      },
      winnerPlatform: winner.winnerPlatform,
      winnerDelta: round2(winner.winnerDelta),
      winnerTitle: winner.winnerTitle,
      winnerBody: winner.winnerBody,
      priceNeededOnStockxToMatchGoat: findStockxPriceForTargetNet(input, goat.netProfit),
      priceNeededOnGoatToMatchStockx: findGoatPriceForTargetNet(input, stockx.netProfit),
    };

    result.summary = buildSummary(result);
    return { result, error: '' };
  }

  const api = {
    DEFAULT_INPUTS: DEFAULT_INPUTS,
    TIE_EPSILON: TIE_EPSILON,
    normalizeInput: normalizeInput,
    validateInputs: validateInputs,
    buildStockxInput: buildStockxInput,
    buildGoatInput: buildGoatInput,
    buildSummary: buildSummary,
    calculate: calculate,
    findStockxPriceForTargetNet: findStockxPriceForTargetNet,
    findGoatPriceForTargetNet: findGoatPriceForTargetNet,
  };

  if (typeof document === 'undefined') {
    return api;
  }

  const currencyFields = [
    ['stockxFees', function (result) { return result.stockx.finalStockxFees; }],
    ['stockxPayout', function (result) { return result.stockx.payoutAfterFees; }],
    ['stockxNet', function (result) { return result.stockx.netProfit; }],
    ['stockxBreakEven', function (result) { return result.stockx.breakEvenSalePrice; }],
    ['goatFees', function (result) { return result.goat.totalDrag; }],
    ['goatPayout', function (result) { return result.goat.payoutBeforeSellerCosts; }],
    ['goatNet', function (result) { return result.goat.netProfit; }],
    ['goatBreakEven', function (result) { return result.goat.breakEvenListingPrice; }],
    ['winnerDelta', function (result) { return result.winnerDelta; }],
    ['matchStockx', function (result) { return result.priceNeededOnStockxToMatchGoat; }],
    ['matchGoat', function (result) { return result.priceNeededOnGoatToMatchStockx; }],
  ];

  const percentFields = [
    ['stockxMargin', function (result) { return result.stockx.netMarginPct; }],
    ['stockxRate', function (result) { return result.stockx.effectiveFeeRatePct; }],
    ['goatMargin', function (result) { return result.goat.netMarginPct; }],
    ['goatRate', function (result) { return result.goat.effectiveTakeRatePct; }],
  ];

  const inputIds = [
    'salePrice',
    'itemCost',
    'shippingCost',
    'packagingCost',
    'otherCost',
    'stockxSellerLevel',
    'goatFeePreset',
    'goatCustomFeeRatePct',
    'goatCustomFlatFee',
    'goatRefundLossRatePct',
  ];

  const els = {
    error: document.getElementById('error'),
    status: document.getElementById('status'),
    summary: document.getElementById('summary'),
    winner: document.getElementById('winner'),
    winnerTitle: document.getElementById('winnerTitle'),
    winnerBody: document.getElementById('winnerBody'),
    copyBtn: document.getElementById('copyBtn'),
    resetBtn: document.getElementById('resetBtn'),
    results: document.getElementById('results'),
    goatCustomHint: document.getElementById('goatCustomHint'),
  };

  inputIds.forEach(function (id) {
    els[id] = document.getElementById(id);
  });

  currencyFields.forEach(function (entry) {
    els[entry[0]] = document.getElementById(entry[0]);
  });
  percentFields.forEach(function (entry) {
    els[entry[0]] = document.getElementById(entry[0]);
  });

  function getInputValue(id) {
    return els[id].value;
  }

  function setInputValue(id, value) {
    els[id].value = value;
  }

  function collectInput() {
    return {
      salePrice: getInputValue('salePrice'),
      itemCost: getInputValue('itemCost'),
      shippingCost: getInputValue('shippingCost'),
      packagingCost: getInputValue('packagingCost'),
      otherCost: getInputValue('otherCost'),
      stockxSellerLevel: getInputValue('stockxSellerLevel'),
      goatFeePreset: getInputValue('goatFeePreset'),
      goatCustomFeeRatePct: getInputValue('goatCustomFeeRatePct'),
      goatCustomFlatFee: getInputValue('goatCustomFlatFee'),
      goatRefundLossRatePct: getInputValue('goatRefundLossRatePct'),
    };
  }

  function applyDefaults() {
    Object.entries(DEFAULT_INPUTS).forEach(function (entry) {
      setInputValue(entry[0], entry[1]);
    });
  }

  function syncGoatCustomState() {
    const isCustom = getInputValue('goatFeePreset') === 'custom';
    els.goatCustomFeeRatePct.disabled = !isCustom;
    els.goatCustomFlatFee.disabled = !isCustom;
    els.goatCustomHint.textContent = isCustom
      ? 'Custom mode is active. Enter your own GOAT rate + flat fee.'
      : 'Custom fee fields are disabled while the public GOAT baseline preset is active.';

    if (!isCustom) {
      setInputValue('goatCustomFeeRatePct', DEFAULT_INPUTS.goatCustomFeeRatePct);
      setInputValue('goatCustomFlatFee', DEFAULT_INPUTS.goatCustomFlatFee);
    }
  }

  function renderError(message) {
    els.error.textContent = message;
    els.error.classList.add('show');
    els.status.textContent = message;
    els.status.className = 'status warn';
    els.results.hidden = true;
    els.winner.className = 'winner neutral';
    els.winnerTitle.textContent = 'Winner';
    els.winnerBody.textContent = 'Enter a valid scenario to compare both platforms.';
    els.summary.value = '';
  }

  function renderResult(result) {
    els.error.textContent = '';
    els.error.classList.remove('show');
    els.results.hidden = false;
    els.status.textContent = 'Comparison updated from the shipped StockX and GOAT fee models.';
    els.status.className = 'status';

    currencyFields.forEach(function (entry) {
      const value = entry[1](result);
      els[entry[0]].textContent = value == null ? 'N/A' : formatCurrency(value);
    });

    percentFields.forEach(function (entry) {
      const value = entry[1](result);
      els[entry[0]].textContent = value == null ? 'N/A' : formatPercent(value);
    });

    els.winner.className = `winner ${result.winnerPlatform}`;
    els.winnerTitle.textContent = result.winnerTitle;
    els.winnerBody.textContent = result.winnerBody;
    els.summary.value = result.summary;
  }

  function render() {
    syncGoatCustomState();
    const response = calculate(collectInput());
    if (response.error) {
      renderError(response.error);
      return;
    }
    renderResult(response.result);
  }

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(els.summary.value || '');
      els.status.textContent = 'Summary copied.';
      els.status.className = 'status ok';
    } catch (error) {
      els.status.textContent = 'Clipboard unavailable. Please copy manually.';
      els.status.className = 'status warn';
    }
  }

  applyDefaults();
  syncGoatCustomState();

  inputIds.forEach(function (id) {
    const eventName = id === 'stockxSellerLevel' || id === 'goatFeePreset' ? 'change' : 'input';
    els[id].addEventListener(eventName, render);
  });

  els.copyBtn.addEventListener('click', copySummary);
  els.resetBtn.addEventListener('click', function () {
    applyDefaults();
    render();
  });

  render();

  return api;
});
