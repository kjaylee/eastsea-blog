(function (root) {
  const DEFAULTS = {
    saleAmount: 12,
    tier: 'standard15',
    paymentMethod: 'creditCard',
    trailingTwelveMonthSales: 2400,
    sellerCost: 1.5,
    targetNet: 8,
    currency: 'USD'
  };

  const TIER_PRESETS = {
    standard15: {
      rate: 15,
      label: 'Standard tier · 15% revenue share'
    },
    reduced10: {
      rate: 10,
      label: 'Reduced tier · 10% revenue share'
    }
  };

  const PROCESSOR_PRESETS = {
    creditCard: {
      rate: 2.2,
      fixedFee: 0.30,
      label: 'Credit card · 2.2% + $0.30'
    },
    paypal: {
      rate: 1.9,
      fixedFee: 0.30,
      label: 'PayPal · 1.9% + $0.30'
    },
    giftCard: {
      rate: 2.9,
      fixedFee: 0.30,
      label: 'Gift card · 2.9% + $0.30'
    }
  };

  const SMALL_TX_THRESHOLD = 8.07;
  const SMALL_TX_RATE = 5;
  const SMALL_TX_FIXED = 0.05;
  const REDUCED_TIER_THRESHOLD = 5000;
  const BANDCAMP_FEE_CAP = 100;

  function round(value, digits) {
    const factor = 10 ** digits;
    return Math.round((value + Number.EPSILON) * factor) / factor;
  }

  function round2(value) {
    return round(value, 2);
  }

  function normalizeInput(input) {
    return {
      saleAmount: Number(input.saleAmount),
      tier: String(input.tier || DEFAULTS.tier),
      paymentMethod: String(input.paymentMethod || DEFAULTS.paymentMethod),
      trailingTwelveMonthSales: Number(input.trailingTwelveMonthSales),
      sellerCost: Number(input.sellerCost),
      targetNet: Number(input.targetNet),
      currency: input.currency || DEFAULTS.currency
    };
  }

  function validate(input) {
    if (!Number.isFinite(input.saleAmount) || input.saleAmount <= 0) return 'Sale amount must be greater than 0.';
    if (!TIER_PRESETS[input.tier]) return 'Choose a valid Bandcamp fee tier.';
    if (!PROCESSOR_PRESETS[input.paymentMethod]) return 'Choose a valid payment method.';
    if (!Number.isFinite(input.trailingTwelveMonthSales) || input.trailingTwelveMonthSales < 0) return 'Trailing 12-month sales must be 0 or greater.';
    if (!Number.isFinite(input.sellerCost) || input.sellerCost < 0) return 'Seller cost must be 0 or greater.';
    if (!Number.isFinite(input.targetNet) || input.targetNet < 0) return 'Target net must be 0 or greater.';
    return '';
  }

  function getTierInfo(tierKey) {
    return TIER_PRESETS[tierKey] || TIER_PRESETS.standard15;
  }

  function computeBandcampFee(input) {
    const tier = getTierInfo(input.tier);
    const feeBasis = Math.min(input.saleAmount, BANDCAMP_FEE_CAP);
    const fee = feeBasis * (tier.rate / 100);
    return {
      feeBasis,
      feeRatePct: tier.rate,
      fee,
      tierLabel: tier.label
    };
  }

  function computeProcessorFee(saleAmount, paymentMethod) {
    if (saleAmount < SMALL_TX_THRESHOLD) {
      return {
        feeRatePct: SMALL_TX_RATE,
        fixedFee: SMALL_TX_FIXED,
        fee: saleAmount * (SMALL_TX_RATE / 100) + SMALL_TX_FIXED,
        label: 'Alternate processor rate · 5% + $0.05 (under $8.07)',
        usesAlternateRate: true
      };
    }

    const preset = PROCESSOR_PRESETS[paymentMethod] || PROCESSOR_PRESETS.creditCard;
    return {
      feeRatePct: preset.rate,
      fixedFee: preset.fixedFee,
      fee: saleAmount * (preset.rate / 100) + preset.fixedFee,
      label: preset.label,
      usesAlternateRate: false
    };
  }

  function computeResult(normalized) {
    const bandcamp = computeBandcampFee(normalized);
    const processor = computeProcessorFee(normalized.saleAmount, normalized.paymentMethod);
    const totalFees = bandcamp.fee + processor.fee;
    const payoutAfterFees = normalized.saleAmount - totalFees;
    const netAfterSellerCost = payoutAfterFees - normalized.sellerCost;
    const effectiveFeeRatePct = normalized.saleAmount > 0 ? (totalFees / normalized.saleAmount) * 100 : 0;
    const takeHomeRatePct = normalized.saleAmount > 0 ? (payoutAfterFees / normalized.saleAmount) * 100 : 0;
    const salesRemainingToReducedTier = Math.max(REDUCED_TIER_THRESHOLD - normalized.trailingTwelveMonthSales, 0);

    return {
      inputs: normalized,
      bandcampFeeBasis: round2(bandcamp.feeBasis),
      bandcampFeeRatePct: bandcamp.feeRatePct,
      bandcampFee: round2(bandcamp.fee),
      tierLabel: bandcamp.tierLabel,
      processorFeeRatePct: processor.feeRatePct,
      processorFixedFee: round2(processor.fixedFee),
      processorFee: round2(processor.fee),
      processorLabel: processor.label,
      usesAlternateProcessorRate: processor.usesAlternateRate,
      totalFees: round2(totalFees),
      payoutAfterFees: round2(payoutAfterFees),
      netAfterSellerCost: round2(netAfterSellerCost),
      effectiveFeeRatePct: round2(effectiveFeeRatePct),
      takeHomeRatePct: round2(takeHomeRatePct),
      salesRemainingToReducedTier: round2(salesRemainingToReducedTier),
      reducedTierUnlocked: salesRemainingToReducedTier <= 0
    };
  }

  function solvePriceForTargetNet(input, targetNet) {
    if (!Number.isFinite(targetNet) || targetNet < 0) return null;
    const normalized = normalizeInput(input);
    normalized.saleAmount = Number(normalized.saleAmount);
    const baseValidation = validate({ ...normalized, targetNet });
    if (baseValidation) return null;

    const netAt = (saleAmount) => computeResult({ ...normalized, saleAmount }).netAfterSellerCost;

    if (targetNet === 0) return 0.01;
    if (netAt(0.01) >= targetNet) return 0.01;

    let low = 0.01;
    let high = Math.max(normalized.saleAmount, 1);
    while (netAt(high) < targetNet && high < 1000000) {
      high *= 2;
    }
    if (netAt(high) < targetNet) return null;

    for (let i = 0; i < 80; i += 1) {
      const mid = (low + high) / 2;
      if (netAt(mid) >= targetNet) {
        high = mid;
      } else {
        low = mid;
      }
    }

    return round2(high);
  }

  function formatMoney(value, currency) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  function formatPercent(value) {
    return `${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)}%`;
  }

  function buildSummary(result) {
    const targetPrice = result.targetPrice == null ? 'N/A' : formatMoney(result.targetPrice, result.inputs.currency);
    return [
      '[Bandcamp Fee Calculator Summary]',
      `Sale amount: ${formatMoney(result.inputs.saleAmount, result.inputs.currency)}`,
      `Current fee tier: ${result.tierLabel}`,
      `Bandcamp fee basis: ${formatMoney(result.bandcampFeeBasis, result.inputs.currency)} (first $100 cap modeled)`,
      `Bandcamp revenue share: ${formatMoney(result.bandcampFee, result.inputs.currency)} (${formatPercent(result.bandcampFeeRatePct)})`,
      `Processor fee: ${formatMoney(result.processorFee, result.inputs.currency)} via ${result.processorLabel}`,
      `Total fees: ${formatMoney(result.totalFees, result.inputs.currency)}`,
      `Payout after fees: ${formatMoney(result.payoutAfterFees, result.inputs.currency)}`,
      `Seller cost: ${formatMoney(result.inputs.sellerCost, result.inputs.currency)}`,
      `Net after seller cost: ${formatMoney(result.netAfterSellerCost, result.inputs.currency)}`,
      `Effective fee rate: ${formatPercent(result.effectiveFeeRatePct)}`,
      `Sales remaining to reduced tier helper: ${formatMoney(result.salesRemainingToReducedTier, result.inputs.currency)}`,
      `Target price to net ${formatMoney(result.inputs.targetNet, result.inputs.currency)}: ${targetPrice}`,
      'Bandcamp digital-sales-only v1: physical items, taxes, collection society deductions, and monthly PayPal bulk-payout fees are excluded.',
      'The reduced 10% tier is modeled as your current tier selection in v1. Exact threshold crossover timing for an individual sale is not inferred here.'
    ].join('\n');
  }

  function calculate(input) {
    const normalized = normalizeInput(input);
    const error = validate(normalized);
    if (error) {
      return { result: null, error };
    }

    const result = computeResult(normalized);
    result.targetPrice = solvePriceForTargetNet(normalized, normalized.targetNet);
    result.targetPriceDelta = result.targetPrice == null ? null : round2(result.targetPrice - normalized.saleAmount);
    result.summary = buildSummary(result);
    return { result, error: '' };
  }

  const api = {
    DEFAULTS,
    TIER_PRESETS,
    PROCESSOR_PRESETS,
    SMALL_TX_THRESHOLD,
    SMALL_TX_RATE,
    SMALL_TX_FIXED,
    REDUCED_TIER_THRESHOLD,
    BANDCAMP_FEE_CAP,
    normalizeInput,
    validate,
    getTierInfo,
    computeBandcampFee,
    computeProcessorFee,
    solvePriceForTargetNet,
    calculate
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  root.BandcampFeeCalculator = api;

  if (typeof document === 'undefined') {
    return;
  }

  const fieldIds = [
    'saleAmount',
    'tier',
    'paymentMethod',
    'trailingTwelveMonthSales',
    'sellerCost',
    'targetNet'
  ];

  const fields = Object.fromEntries(fieldIds.map((id) => [id, document.getElementById(id)]));
  const outputIds = {
    kpiNet: document.getElementById('kpiNet'),
    kpiTakeHome: document.getElementById('kpiTakeHome'),
    kpiTargetPrice: document.getElementById('kpiTargetPrice'),
    detBandcampFee: document.getElementById('detBandcampFee'),
    detProcessorFee: document.getElementById('detProcessorFee'),
    detTotalFees: document.getElementById('detTotalFees'),
    detPayout: document.getElementById('detPayout'),
    detFeeBasis: document.getElementById('detFeeBasis'),
    detTierLabel: document.getElementById('detTierLabel'),
    detProcessorRule: document.getElementById('detProcessorRule'),
    detRemainingToReduced: document.getElementById('detRemainingToReduced'),
    detTargetDelta: document.getElementById('detTargetDelta'),
    summary: document.getElementById('summary'),
    errorBox: document.getElementById('errorBox')
  };

  const resetBtn = document.getElementById('resetBtn');
  const copyBtn = document.getElementById('copyBtn');

  function readValues() {
    return {
      saleAmount: fields.saleAmount.value,
      tier: fields.tier.value,
      paymentMethod: fields.paymentMethod.value,
      trailingTwelveMonthSales: fields.trailingTwelveMonthSales.value,
      sellerCost: fields.sellerCost.value,
      targetNet: fields.targetNet.value,
      currency: 'USD'
    };
  }

  function setDefaults() {
    Object.entries(DEFAULTS).forEach(([key, value]) => {
      if (fields[key]) {
        fields[key].value = String(value);
      }
    });
    render();
  }

  function showError(message) {
    if (!outputIds.errorBox) return;
    outputIds.errorBox.textContent = message || '';
    outputIds.errorBox.classList.toggle('show', Boolean(message));
  }

  function render() {
    const { result, error } = calculate(readValues());
    if (error) {
      showError(error);
      return;
    }

    showError('');
    const currency = result.inputs.currency;
    outputIds.kpiNet.textContent = formatMoney(result.netAfterSellerCost, currency);
    outputIds.kpiTakeHome.textContent = formatPercent(result.takeHomeRatePct);
    outputIds.kpiTargetPrice.textContent = result.targetPrice == null ? 'N/A' : formatMoney(result.targetPrice, currency);
    outputIds.detBandcampFee.textContent = `${formatMoney(result.bandcampFee, currency)} · ${formatPercent(result.bandcampFeeRatePct)}`;
    outputIds.detProcessorFee.textContent = formatMoney(result.processorFee, currency);
    outputIds.detTotalFees.textContent = formatMoney(result.totalFees, currency);
    outputIds.detPayout.textContent = formatMoney(result.payoutAfterFees, currency);
    outputIds.detFeeBasis.textContent = formatMoney(result.bandcampFeeBasis, currency);
    outputIds.detTierLabel.textContent = result.tierLabel;
    outputIds.detProcessorRule.textContent = result.processorLabel;
    outputIds.detRemainingToReduced.textContent = result.reducedTierUnlocked
      ? 'Already at/above $5,000 trailing sales helper threshold'
      : formatMoney(result.salesRemainingToReducedTier, currency);
    outputIds.detTargetDelta.textContent = result.targetPriceDelta == null
      ? 'N/A'
      : `${result.targetPriceDelta >= 0 ? '+' : ''}${formatMoney(result.targetPriceDelta, currency)}`;
    outputIds.summary.value = result.summary;
  }

  fieldIds.forEach((id) => {
    const node = fields[id];
    if (!node) return;
    node.addEventListener('input', render);
    node.addEventListener('change', render);
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', setDefaults);
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const text = outputIds.summary.value;
      try {
        await navigator.clipboard.writeText(text);
        copyBtn.textContent = 'Copied';
        setTimeout(() => {
          copyBtn.textContent = 'Copy summary';
        }, 1200);
      } catch (err) {
        showError('Clipboard unavailable. Please copy the summary manually.');
      }
    });
  }

  render();
})(typeof globalThis !== 'undefined' ? globalThis : this);
