(function (global, factory) {
  const api = factory(
    typeof require === 'function' ? require('../ebay-fee-profit-calculator/calculator.js') : global.EbayFeeProfitCalculator,
    typeof require === 'function' ? require('../poshmark-fee-profit-calculator/calculator.js') : global.PoshmarkCalc
  );

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  global.EbayVsPoshmarkProfitCalculator = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (ebayApi, poshmarkApi) {
  'use strict';

  const MAX_SEARCH_PRICE = 1000000;
  const SEARCH_ITERATIONS = 64;
  const TIE_EPSILON = 0.005;

  if (!ebayApi || !poshmarkApi) {
    throw new Error('eBay and Poshmark calculator dependencies are required.');
  }

  const DEFAULT_INPUTS = Object.freeze({
    listPrice: 48,
    offerDiscountPct: 10,
    itemCost: 14,
    packagingCost: 1,
    otherCost: 0,
    ebayShippingCharged: 7.95,
    ebayActualShippingCost: 6.2,
    ebaySalesTaxRatePct: 8,
    ebayCategoryPreset: 'most',
    ebayPromotedRatePct: 3,
    poshmarkSellerShippingDiscount: 0,
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
      listPrice: toFiniteNumber(input.listPrice),
      offerDiscountPct: toFiniteNumber(input.offerDiscountPct),
      itemCost: toFiniteNumber(input.itemCost),
      packagingCost: toFiniteNumber(input.packagingCost),
      otherCost: toFiniteNumber(input.otherCost),
      ebayShippingCharged: toFiniteNumber(input.ebayShippingCharged),
      ebayActualShippingCost: toFiniteNumber(input.ebayActualShippingCost),
      ebaySalesTaxRatePct: toFiniteNumber(input.ebaySalesTaxRatePct),
      ebayCategoryPreset: input.ebayCategoryPreset || DEFAULT_INPUTS.ebayCategoryPreset,
      ebayPromotedRatePct: toFiniteNumber(input.ebayPromotedRatePct),
      poshmarkSellerShippingDiscount: toFiniteNumber(input.poshmarkSellerShippingDiscount),
    };
  }

  function getRealizedSalePrice(listPrice, offerDiscountPct) {
    return round2(listPrice * (1 - offerDiscountPct / 100));
  }

  function buildEbayInput(input, options) {
    const opts = options || {};
    const soldPrice = opts.soldPrice != null ? opts.soldPrice : getRealizedSalePrice(input.listPrice, input.offerDiscountPct);
    return {
      soldPrice,
      shippingCharged: input.ebayShippingCharged,
      salesTaxRatePct: input.ebaySalesTaxRatePct,
      itemCost: input.itemCost,
      actualShippingCost: input.ebayActualShippingCost,
      packagingCost: input.packagingCost + input.otherCost,
      categoryPreset: input.ebayCategoryPreset,
      customLowRatePct: ebayApi.DEFAULTS ? ebayApi.DEFAULTS.customLowRatePct : 13.6,
      customThreshold: ebayApi.DEFAULTS ? ebayApi.DEFAULTS.customThreshold : 7500,
      customOverRatePct: ebayApi.DEFAULTS ? ebayApi.DEFAULTS.customOverRatePct : 2.35,
      customPerOrderExempt: ebayApi.DEFAULTS ? ebayApi.DEFAULTS.customPerOrderExempt : false,
      promotedRatePct: input.ebayPromotedRatePct,
      chargeInsertionFee: false,
      insertionFeeAmount: ebayApi.DEFAULTS ? ebayApi.DEFAULTS.insertionFeeAmount : 0.35,
    };
  }

  function buildPoshmarkInput(input, options) {
    const opts = options || {};
    return {
      listPrice: opts.listPrice != null ? opts.listPrice : input.listPrice,
      offerDiscountPct: input.offerDiscountPct,
      itemCost: input.itemCost,
      sellerShippingDiscount: input.poshmarkSellerShippingDiscount,
      packagingCost: input.packagingCost,
      otherCost: input.otherCost,
    };
  }

  function validateInputs(rawInput) {
    const input = normalizeInput(rawInput);
    const errors = [];

    const moneyFields = [
      ['listPrice', input.listPrice],
      ['itemCost', input.itemCost],
      ['packagingCost', input.packagingCost],
      ['otherCost', input.otherCost],
      ['ebayShippingCharged', input.ebayShippingCharged],
      ['ebayActualShippingCost', input.ebayActualShippingCost],
      ['poshmarkSellerShippingDiscount', input.poshmarkSellerShippingDiscount],
    ];

    moneyFields.forEach(function (entry) {
      if (!Number.isFinite(entry[1]) || entry[1] < 0) {
        errors.push(`${entry[0]} must be zero or above.`);
      }
    });

    const pctFields = [
      ['offerDiscountPct', input.offerDiscountPct],
      ['ebaySalesTaxRatePct', input.ebaySalesTaxRatePct],
      ['ebayPromotedRatePct', input.ebayPromotedRatePct],
    ];

    pctFields.forEach(function (entry) {
      if (!Number.isFinite(entry[1]) || entry[1] < 0 || entry[1] > 100) {
        errors.push(`${entry[0]} must be between 0 and 100.`);
      }
    });

    if (!ebayApi.presetMap || !ebayApi.presetMap[input.ebayCategoryPreset]) {
      errors.push('ebayCategoryPreset is unsupported.');
    }

    const realizedSalePrice = getRealizedSalePrice(input.listPrice, input.offerDiscountPct);
    if (!Number.isFinite(realizedSalePrice) || realizedSalePrice <= 0) {
      errors.push('Realized sale price must be greater than 0.');
    }

    if (errors.length > 0) {
      return { ok: false, errors, input };
    }

    const ebayValidation = ebayApi.calculate(buildEbayInput(input), { lang: 'en' });
    if (ebayValidation.error) {
      errors.push(ebayValidation.error);
    }

    const poshmarkValidation = poshmarkApi.calculate(buildPoshmarkInput(input), { lang: 'en' });
    if (poshmarkValidation.error) {
      errors.push(poshmarkValidation.error);
    }

    return {
      ok: errors.length === 0,
      errors,
      input,
    };
  }

  function getEbayResultAtSoldPrice(input, soldPrice) {
    return ebayApi.calculate(buildEbayInput(input, { soldPrice }), { lang: 'en' });
  }

  function getPoshmarkResultAtListPrice(input, listPrice) {
    return poshmarkApi.calculate(buildPoshmarkInput(input, { listPrice }), { lang: 'en' });
  }

  function getWinner(ebayNetProfit, poshmarkNetProfit) {
    const delta = ebayNetProfit - poshmarkNetProfit;
    if (Math.abs(delta) < TIE_EPSILON) {
      return {
        winnerPlatform: 'tie',
        winnerDelta: 0,
        winnerTitle: 'It’s effectively a tie',
        winnerBody: `Both platforms land within ${formatCurrency(0.01)} of net profit under this scenario.`,
      };
    }

    if (delta > 0) {
      return {
        winnerPlatform: 'ebay',
        winnerDelta: round2(delta),
        winnerTitle: 'Winner: eBay',
        winnerBody: `eBay leads by ${formatCurrency(delta)} in net profit for the same realized item price.`,
      };
    }

    return {
      winnerPlatform: 'poshmark',
      winnerDelta: round2(Math.abs(delta)),
      winnerTitle: 'Winner: Poshmark',
      winnerBody: `Poshmark leads by ${formatCurrency(Math.abs(delta))} in net profit for the same item scenario.`,
    };
  }

  function findEbaySoldPriceForTargetNet(input, targetNetProfit) {
    if (!Number.isFinite(targetNetProfit)) return null;

    const lowPrice = 0.01;
    const lowResponse = getEbayResultAtSoldPrice(input, lowPrice);
    if (lowResponse.error) return null;
    const lowNet = lowResponse.result.netProfit;

    const currentSoldPrice = getRealizedSalePrice(input.listPrice, input.offerDiscountPct);
    const currentResponse = getEbayResultAtSoldPrice(input, currentSoldPrice);
    if (currentResponse.error) return null;
    const currentNet = currentResponse.result.netProfit;

    let low = lowPrice;
    let high = currentSoldPrice;

    if (Math.abs(currentNet - targetNetProfit) < TIE_EPSILON) {
      return round2(currentSoldPrice);
    }

    if (targetNetProfit < lowNet) {
      return round2(lowPrice);
    }

    if (targetNetProfit > currentNet) {
      high = Math.max(1, currentSoldPrice);
      let highResponse = currentResponse;
      while (high < MAX_SEARCH_PRICE && highResponse.result.netProfit < targetNetProfit) {
        low = high;
        high = Math.min(MAX_SEARCH_PRICE, high * 2);
        highResponse = getEbayResultAtSoldPrice(input, high);
        if (highResponse.error) return null;
      }
      if (highResponse.error || highResponse.result.netProfit < targetNetProfit) {
        return null;
      }
    }

    for (let i = 0; i < SEARCH_ITERATIONS; i += 1) {
      const mid = (low + high) / 2;
      const midResponse = getEbayResultAtSoldPrice(input, mid);
      if (midResponse.error) return null;
      if (midResponse.result.netProfit >= targetNetProfit) {
        high = mid;
      } else {
        low = mid;
      }
    }

    return round2(high);
  }

  function findPoshmarkListPriceForTargetNet(input, targetNetProfit) {
    if (!Number.isFinite(targetNetProfit)) return null;

    const lowPrice = 0.01;
    const lowResponse = getPoshmarkResultAtListPrice(input, lowPrice);
    if (lowResponse.error) return null;
    const lowNet = lowResponse.result.netProfit;

    const currentResponse = getPoshmarkResultAtListPrice(input, input.listPrice);
    if (currentResponse.error) return null;
    const currentNet = currentResponse.result.netProfit;

    let low = lowPrice;
    let high = input.listPrice;

    if (Math.abs(currentNet - targetNetProfit) < TIE_EPSILON) {
      return round2(input.listPrice);
    }

    if (targetNetProfit < lowNet) {
      return round2(lowPrice);
    }

    if (targetNetProfit > currentNet) {
      high = Math.max(1, input.listPrice);
      let highResponse = currentResponse;
      while (high < MAX_SEARCH_PRICE && highResponse.result.netProfit < targetNetProfit) {
        low = high;
        high = Math.min(MAX_SEARCH_PRICE, high * 2);
        highResponse = getPoshmarkResultAtListPrice(input, high);
        if (highResponse.error) return null;
      }
      if (highResponse.error || highResponse.result.netProfit < targetNetProfit) {
        return null;
      }
    }

    for (let i = 0; i < SEARCH_ITERATIONS; i += 1) {
      const mid = (low + high) / 2;
      const midResponse = getPoshmarkResultAtListPrice(input, mid);
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
      : `Winner: ${result.winnerPlatform === 'ebay' ? 'eBay' : 'Poshmark'} by ${formatCurrency(result.winnerDelta)}`;

    return [
      '[eBay vs Poshmark Profit Summary]',
      `List price: ${formatCurrency(result.inputs.listPrice)}`,
      `Offer discount: ${formatPercent(result.inputs.offerDiscountPct)}`,
      `Realized sale price: ${formatCurrency(result.realizedSalePrice)}`,
      winnerLine,
      `eBay fee total: ${formatCurrency(result.ebay.ebayFeeTotal)}`,
      `eBay payout after fees: ${formatCurrency(result.ebay.payoutAfterEbayFees)}`,
      `eBay net profit: ${formatCurrency(result.ebay.netProfit)} (${formatPercent(result.ebay.netMarginPct)})`,
      `Poshmark fee: ${formatCurrency(result.poshmark.poshmarkFee)}`,
      `Poshmark payout after fee: ${formatCurrency(result.poshmark.payoutAfterPoshmarkFee)}`,
      `Poshmark net profit: ${formatCurrency(result.poshmark.netProfit)} (${formatPercent(result.poshmark.netMarginPct)})`,
      `eBay sold price needed to match Poshmark: ${result.priceNeededOnEbayToMatchPoshmark == null ? 'N/A' : formatCurrency(result.priceNeededOnEbayToMatchPoshmark)}`,
      `Poshmark list price needed to match eBay: ${result.priceNeededOnPoshmarkToMatchEbay == null ? 'N/A' : formatCurrency(result.priceNeededOnPoshmarkToMatchEbay)}`,
      'Assumption note: eBay uses the same realized item price as Poshmark, while eBay buyer shipping / tax / promoted-rate assumptions remain explicit. eBay lacks a dedicated other-cost field in the shipped module, so this comparator folds other seller cost into the eBay packaging-cost lane.',
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
    const realizedSalePrice = getRealizedSalePrice(input.listPrice, input.offerDiscountPct);
    const ebayResponse = getEbayResultAtSoldPrice(input, realizedSalePrice);
    const poshmarkResponse = getPoshmarkResultAtListPrice(input, input.listPrice);

    if (ebayResponse.error) {
      return { result: null, error: ebayResponse.error };
    }

    if (poshmarkResponse.error) {
      return { result: null, error: poshmarkResponse.error };
    }

    const ebay = ebayResponse.result;
    const poshmark = poshmarkResponse.result;
    const winner = getWinner(ebay.netProfit, poshmark.netProfit);

    const result = {
      inputs: input,
      realizedSalePrice: round2(realizedSalePrice),
      ebay: {
        feeLabel: ebay.presetLabel,
        ebayFeeTotal: round2(ebay.ebayFeeTotal),
        payoutAfterEbayFees: round2(ebay.payoutAfterEbayFees),
        netProfit: round2(ebay.netProfit),
        netMarginPct: round2(ebay.netMarginPct),
        effectiveEbayFeeRatePct: round2(ebay.effectiveEbayFeeRatePct),
        breakEvenSoldPrice: ebay.breakEvenSoldPrice == null ? null : round2(ebay.breakEvenSoldPrice),
        maxPromotedAdRateBeforeLossPct: ebay.maxPromotedAdRateBeforeLossPct == null ? null : round2(ebay.maxPromotedAdRateBeforeLossPct),
      },
      poshmark: {
        poshmarkFee: round2(poshmark.poshmarkFee),
        payoutAfterPoshmarkFee: round2(poshmark.payoutAfterPoshmarkFee),
        netProfit: round2(poshmark.netProfit),
        netMarginPct: round2(poshmark.netMarginPct),
        effectivePoshmarkFeeRatePct: round2(poshmark.effectivePoshmarkFeeRatePct),
        breakEvenListPrice: poshmark.breakEvenListPrice == null ? null : round2(poshmark.breakEvenListPrice),
        maxOfferDiscountPct: poshmark.maxOfferDiscountPct == null ? null : round2(poshmark.maxOfferDiscountPct),
      },
      winnerPlatform: winner.winnerPlatform,
      winnerDelta: round2(winner.winnerDelta),
      winnerTitle: winner.winnerTitle,
      winnerBody: winner.winnerBody,
      priceNeededOnEbayToMatchPoshmark: findEbaySoldPriceForTargetNet(input, poshmark.netProfit),
      priceNeededOnPoshmarkToMatchEbay: findPoshmarkListPriceForTargetNet(input, ebay.netProfit),
    };

    result.summary = buildSummary(result);
    return { result, error: '' };
  }

  const api = {
    DEFAULT_INPUTS,
    TIE_EPSILON,
    normalizeInput,
    validateInputs,
    getRealizedSalePrice,
    buildEbayInput,
    buildPoshmarkInput,
    buildSummary,
    calculate,
    findEbaySoldPriceForTargetNet,
    findPoshmarkListPriceForTargetNet,
  };

  if (typeof document === 'undefined') {
    return api;
  }

  const currencyFields = [
    ['realizedSalePrice', function (result) { return result.realizedSalePrice; }],
    ['ebayFees', function (result) { return result.ebay.ebayFeeTotal; }],
    ['ebayPayout', function (result) { return result.ebay.payoutAfterEbayFees; }],
    ['ebayNet', function (result) { return result.ebay.netProfit; }],
    ['ebayBreakEven', function (result) { return result.ebay.breakEvenSoldPrice; }],
    ['poshmarkFees', function (result) { return result.poshmark.poshmarkFee; }],
    ['poshmarkPayout', function (result) { return result.poshmark.payoutAfterPoshmarkFee; }],
    ['poshmarkNet', function (result) { return result.poshmark.netProfit; }],
    ['poshmarkBreakEven', function (result) { return result.poshmark.breakEvenListPrice; }],
    ['winnerDelta', function (result) { return result.winnerDelta; }],
    ['matchEbay', function (result) { return result.priceNeededOnEbayToMatchPoshmark; }],
    ['matchPoshmark', function (result) { return result.priceNeededOnPoshmarkToMatchEbay; }],
  ];

  const percentFields = [
    ['ebayMargin', function (result) { return result.ebay.netMarginPct; }],
    ['ebayRate', function (result) { return result.ebay.effectiveEbayFeeRatePct; }],
    ['ebayAdHeadroom', function (result) { return result.ebay.maxPromotedAdRateBeforeLossPct; }],
    ['poshmarkMargin', function (result) { return result.poshmark.netMarginPct; }],
    ['poshmarkRate', function (result) { return result.poshmark.effectivePoshmarkFeeRatePct; }],
    ['poshmarkMaxOffer', function (result) { return result.poshmark.maxOfferDiscountPct; }],
  ];

  const inputIds = [
    'listPrice',
    'offerDiscountPct',
    'itemCost',
    'packagingCost',
    'otherCost',
    'ebayShippingCharged',
    'ebayActualShippingCost',
    'ebaySalesTaxRatePct',
    'ebayCategoryPreset',
    'ebayPromotedRatePct',
    'poshmarkSellerShippingDiscount',
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
      listPrice: getInputValue('listPrice'),
      offerDiscountPct: getInputValue('offerDiscountPct'),
      itemCost: getInputValue('itemCost'),
      packagingCost: getInputValue('packagingCost'),
      otherCost: getInputValue('otherCost'),
      ebayShippingCharged: getInputValue('ebayShippingCharged'),
      ebayActualShippingCost: getInputValue('ebayActualShippingCost'),
      ebaySalesTaxRatePct: getInputValue('ebaySalesTaxRatePct'),
      ebayCategoryPreset: getInputValue('ebayCategoryPreset'),
      ebayPromotedRatePct: getInputValue('ebayPromotedRatePct'),
      poshmarkSellerShippingDiscount: getInputValue('poshmarkSellerShippingDiscount'),
    };
  }

  function applyDefaults() {
    Object.entries(DEFAULT_INPUTS).forEach(function (entry) {
      setInputValue(entry[0], entry[1]);
    });
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
    els.status.textContent = 'Comparison updated from the shipped eBay and Poshmark fee models.';
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

  if (els.ebayCategoryPreset && ebayApi.PRESETS) {
    els.ebayCategoryPreset.innerHTML = ebayApi.PRESETS.map(function (preset) {
      return `<option value="${preset.id}">${preset.label.en}</option>`;
    }).join('');
  }

  applyDefaults();

  inputIds.forEach(function (id) {
    const eventName = id === 'ebayCategoryPreset' ? 'change' : 'input';
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
