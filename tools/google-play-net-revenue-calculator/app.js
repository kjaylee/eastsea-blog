(function () {
  'use strict';

  var tool = window.GooglePlayNetRevenueCalculator;
  if (!tool) return;

  function $(id) { return document.getElementById(id); }

  var refs = {
    grossCustomerSpend: $('grossCustomerSpend'),
    vatRate: $('vatRate'),
    refundRate: $('refundRate'),
    productType: $('productType'),
    enrolledTier15: $('enrolledTier15'),
    ytdEarnings: $('ytdEarnings'),
    thresholdCap: $('thresholdCap'),
    operatingCost: $('operatingCost'),
    uaSpend: $('uaSpend'),
    error: $('error'),
    summary: $('summary'),
    status: $('status'),
    copy: $('copy'),
    reset: $('reset'),
    feeBearingRevenue: $('feeBearingRevenue'),
    googleFeeAmount: $('googleFeeAmount'),
    blendedFeeRate: $('blendedFeeRate'),
    netProceedsBeforeCosts: $('netProceedsBeforeCosts'),
    netProfit: $('netProfit'),
    runway: $('runway'),
    grossCustomerSpendOut: $('grossCustomerSpendOut'),
    revenueExVat: $('revenueExVat'),
    feeBearingRevenueOut: $('feeBearingRevenueOut'),
    lowerTierRevenue: $('lowerTierRevenue'),
    upperTierRevenue: $('upperTierRevenue'),
    lowerTierFee: $('lowerTierFee'),
    upperTierFee: $('upperTierFee'),
    operatingCostOut: $('operatingCostOut'),
    uaSpendOut: $('uaSpendOut')
  };

  var defaults = {
    grossCustomerSpend: 250000,
    vatRate: 10,
    refundRate: 4,
    productType: 'standard',
    enrolledTier15: true,
    ytdEarnings: 300000,
    thresholdCap: 1000000,
    operatingCost: 15000,
    uaSpend: 40000
  };

  function formatMoney(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2
    }).format(Number.isFinite(value) ? value : 0);
  }

  function formatNumber(value, digits) {
    return Number(value).toLocaleString('en-US', { maximumFractionDigits: digits == null ? 2 : digits });
  }

  function getInput() {
    return {
      grossCustomerSpend: Number(refs.grossCustomerSpend.value),
      vatRate: Number(refs.vatRate.value),
      refundRate: Number(refs.refundRate.value),
      productType: refs.productType.value,
      enrolledTier15: refs.enrolledTier15.checked,
      ytdEarnings: Number(refs.ytdEarnings.value),
      thresholdCap: Number(refs.thresholdCap.value),
      operatingCost: Number(refs.operatingCost.value),
      uaSpend: Number(refs.uaSpend.value)
    };
  }

  function setError(message) {
    refs.error.textContent = message || '';
    refs.error.classList.toggle('show', Boolean(message));
  }

  function resetOutputs() {
    [
      'feeBearingRevenue', 'googleFeeAmount', 'blendedFeeRate', 'netProceedsBeforeCosts',
      'netProfit', 'runway', 'grossCustomerSpendOut', 'revenueExVat', 'feeBearingRevenueOut',
      'lowerTierRevenue', 'upperTierRevenue', 'lowerTierFee', 'upperTierFee', 'operatingCostOut', 'uaSpendOut'
    ].forEach(function (key) {
      refs[key].textContent = '-';
    });
    refs.summary.value = '';
  }

  function formatRunway(result) {
    if (result.runwayState === 'not_applicable') return 'Not used for subscriptions';
    if (result.runwayState === 'tier_disabled') return '15% tier not enabled';
    return result.exceededAmount > 0
      ? 'Exceeded by ' + formatMoney(result.exceededAmount)
      : 'Remaining ' + formatMoney(result.remainingTierRunway);
  }

  function render() {
    var input = getInput();
    var error = tool.validateInput(input);
    setError(error);

    if (error) {
      refs.status.innerHTML = '<span class="warn">●</span> Check your assumptions';
      resetOutputs();
      return;
    }

    var result = tool.compute(input);

    refs.feeBearingRevenue.textContent = formatMoney(result.feeBearingRevenue);
    refs.googleFeeAmount.textContent = formatMoney(result.googleFeeAmount);
    refs.blendedFeeRate.textContent = formatNumber(result.blendedFeeRate, 2) + '%';
    refs.netProceedsBeforeCosts.textContent = formatMoney(result.netProceedsBeforeCosts);
    refs.netProfit.textContent = formatMoney(result.netProfit);
    refs.runway.textContent = formatRunway(result);

    refs.grossCustomerSpendOut.textContent = formatMoney(result.grossCustomerSpend);
    refs.revenueExVat.textContent = formatMoney(result.revenueExVat);
    refs.feeBearingRevenueOut.textContent = formatMoney(result.feeBearingRevenue);
    refs.lowerTierRevenue.textContent = formatMoney(result.lowerTierRevenue);
    refs.upperTierRevenue.textContent = formatMoney(result.upperTierRevenue);
    refs.lowerTierFee.textContent = formatMoney(result.lowerTierFee);
    refs.upperTierFee.textContent = formatMoney(result.upperTierFee);
    refs.operatingCostOut.textContent = formatMoney(result.operatingCost);
    refs.uaSpendOut.textContent = formatMoney(result.uaSpend);

    refs.status.innerHTML = result.netProfit >= 0
      ? '<span class="ok">●</span> Projected net profit is positive'
      : '<span class="warn">●</span> Projected net profit is negative';

    refs.summary.value = [
      '[Google Play Net Revenue Summary]',
      'Product type: ' + (result.productType === 'subscription' ? 'Subscription' : 'Standard digital goods'),
      'Fee-bearing revenue: ' + formatMoney(result.feeBearingRevenue),
      'Google Play fee: ' + formatMoney(result.googleFeeAmount),
      'Blended fee rate: ' + formatNumber(result.blendedFeeRate, 2) + '%',
      'Net proceeds before costs: ' + formatMoney(result.netProceedsBeforeCosts),
      'Net profit after costs: ' + formatMoney(result.netProfit),
      'Tier runway: ' + formatRunway(result)
    ].join('\n');
  }

  refs.copy.addEventListener('click', function () {
    if (!refs.summary.value.trim()) return;
    navigator.clipboard.writeText(refs.summary.value)
      .then(function () { window.alert('Summary copied.'); })
      .catch(function () { window.alert('Clipboard unavailable. Please copy manually.'); });
  });

  refs.reset.addEventListener('click', function () {
    refs.grossCustomerSpend.value = defaults.grossCustomerSpend;
    refs.vatRate.value = defaults.vatRate;
    refs.refundRate.value = defaults.refundRate;
    refs.productType.value = defaults.productType;
    refs.enrolledTier15.checked = defaults.enrolledTier15;
    refs.ytdEarnings.value = defaults.ytdEarnings;
    refs.thresholdCap.value = defaults.thresholdCap;
    refs.operatingCost.value = defaults.operatingCost;
    refs.uaSpend.value = defaults.uaSpend;
    render();
  });

  [
    refs.grossCustomerSpend, refs.vatRate, refs.refundRate, refs.productType,
    refs.enrolledTier15, refs.ytdEarnings, refs.thresholdCap, refs.operatingCost, refs.uaSpend
  ].forEach(function (el) {
    var eventName = el.tagName === 'SELECT' || el.type === 'checkbox' ? 'change' : 'input';
    el.addEventListener(eventName, render);
    if (eventName !== 'change') el.addEventListener('change', render);
  });

  render();
}());
