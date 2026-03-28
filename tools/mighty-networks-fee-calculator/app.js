(function () {
  'use strict';

  var tool = window.MightyNetworksFeeCalculator;
  if (!tool) return;

  function $(id) { return document.getElementById(id); }

  var refs = {
    monthlyGrossSales: $('monthlyGrossSales'),
    successfulCharges: $('successfulCharges'),
    refundRatePct: $('refundRatePct'),
    processorRatePct: $('processorRatePct'),
    processorFlatFee: $('processorFlatFee'),
    otherMonthlyCost: $('otherMonthlyCost'),
    desiredMonthlyNetProfit: $('desiredMonthlyNetProfit'),
    error: $('error'),
    status: $('status'),
    copy: $('copyBtn'),
    reset: $('resetBtn'),
    bestPlan: $('bestPlan'),
    monthlyNetProfit: $('monthlyNetProfit'),
    takeHomeAfterPlatform: $('takeHomeAfterPlatform'),
    effectiveFeeRate: $('effectiveFeeRate'),
    breakEvenGross: $('breakEvenGross'),
    requiredGrossForTargetNet: $('requiredGrossForTargetNet'),
    planFee: $('planFee'),
    mightyTransactionFees: $('mightyTransactionFees'),
    processorFees: $('processorFees'),
    refundLoss: $('refundLoss'),
    annualizedNetProfit: $('annualizedNetProfit'),
    avgChargeAmount: $('avgChargeAmount'),
    launchToScaleGross: $('launchToScaleGross'),
    scaleToGrowthGross: $('scaleToGrowthGross'),
    launchToGrowthGross: $('launchToGrowthGross'),
    comparisonBody: $('comparisonBody'),
    summary: $('summary')
  };

  function money(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2
    }).format(Number.isFinite(value) ? value : 0);
  }

  function number(value, digits) {
    return Number(value).toLocaleString('en-US', {
      maximumFractionDigits: digits == null ? 2 : digits
    });
  }

  function getInput() {
    return {
      monthlyGrossSales: Number(refs.monthlyGrossSales.value),
      successfulCharges: Number(refs.successfulCharges.value),
      refundRatePct: Number(refs.refundRatePct.value),
      processorRatePct: Number(refs.processorRatePct.value),
      processorFlatFee: Number(refs.processorFlatFee.value),
      otherMonthlyCost: Number(refs.otherMonthlyCost.value),
      desiredMonthlyNetProfit: Number(refs.desiredMonthlyNetProfit.value)
    };
  }

  function setError(message) {
    refs.error.textContent = message || '';
    refs.error.classList.toggle('show', Boolean(message));
  }

  function clearOutputs() {
    [
      'bestPlan', 'monthlyNetProfit', 'takeHomeAfterPlatform', 'effectiveFeeRate',
      'breakEvenGross', 'requiredGrossForTargetNet', 'planFee', 'mightyTransactionFees',
      'processorFees', 'refundLoss', 'annualizedNetProfit', 'avgChargeAmount',
      'launchToScaleGross', 'scaleToGrowthGross', 'launchToGrowthGross'
    ].forEach(function (key) {
      refs[key].textContent = '—';
    });
    refs.comparisonBody.innerHTML = '';
    refs.summary.value = '';
  }

  function renderComparison(plans, bestPlanId) {
    refs.comparisonBody.innerHTML = plans.map(function (plan) {
      var bestBadge = plan.planId === bestPlanId ? ' <span class="best-pill">Best</span>' : '';
      return '<tr>' +
        '<td><strong>' + plan.planName + '</strong>' + bestBadge + '</td>' +
        '<td>' + money(plan.monthlyFee) + '</td>' +
        '<td>' + number(plan.transactionRatePct, 2) + '%</td>' +
        '<td>' + money(plan.processorFees) + '</td>' +
        '<td>' + money(plan.netProfit) + '</td>' +
        '<td>' + number(plan.effectiveFeeRatePct, 2) + '%</td>' +
        '<td>' + (plan.breakEvenGross == null ? 'N/A' : money(plan.breakEvenGross)) + '</td>' +
        '</tr>';
    }).join('');
  }

  function render() {
    var input = getInput();
    var error = tool.validateInput(input);
    setError(error);

    if (error) {
      refs.status.innerHTML = '<span class="tone tone-warn"></span> Check the inputs and try again.';
      clearOutputs();
      return;
    }

    var result = tool.compute(input);
    var best = result.bestPlan;
    refs.bestPlan.textContent = best.planName;
    refs.monthlyNetProfit.textContent = money(best.netProfit);
    refs.takeHomeAfterPlatform.textContent = money(best.takeHomeAfterPlatform);
    refs.effectiveFeeRate.textContent = number(best.effectiveFeeRatePct, 2) + '%';
    refs.breakEvenGross.textContent = best.breakEvenGross == null ? 'N/A' : money(best.breakEvenGross);
    refs.requiredGrossForTargetNet.textContent = best.requiredGrossForTargetNet == null ? 'N/A' : money(best.requiredGrossForTargetNet);
    refs.planFee.textContent = money(best.monthlyFee);
    refs.mightyTransactionFees.textContent = money(best.mightyTransactionFees);
    refs.processorFees.textContent = money(best.processorFees);
    refs.refundLoss.textContent = money(best.refundLoss);
    refs.annualizedNetProfit.textContent = money(best.annualizedNetProfit);
    refs.avgChargeAmount.textContent = money(best.avgChargeAmount);
    refs.launchToScaleGross.textContent = money(result.upgradeThresholds.launchToScaleGross);
    refs.scaleToGrowthGross.textContent = money(result.upgradeThresholds.scaleToGrowthGross);
    refs.launchToGrowthGross.textContent = money(result.upgradeThresholds.launchToGrowthGross);
    refs.summary.value = result.summary;
    refs.status.innerHTML = best.netProfit >= 0
      ? '<span class="tone tone-good"></span> ' + best.planName + ' currently leaves the most monthly profit.'
      : '<span class="tone tone-warn"></span> All three plans are negative under the current assumptions; re-check price, refunds, or costs.';

    renderComparison(result.plans, best.planId);
  }

  refs.copy.addEventListener('click', function () {
    if (!refs.summary.value.trim()) return;
    navigator.clipboard.writeText(refs.summary.value)
      .then(function () { window.alert('Summary copied.'); })
      .catch(function () { window.alert('Clipboard unavailable. Please copy manually.'); });
  });

  refs.reset.addEventListener('click', function () {
    Object.keys(tool.DEFAULT_INPUTS).forEach(function (key) {
      refs[key].value = tool.DEFAULT_INPUTS[key];
    });
    render();
  });

  [
    refs.monthlyGrossSales,
    refs.successfulCharges,
    refs.refundRatePct,
    refs.processorRatePct,
    refs.processorFlatFee,
    refs.otherMonthlyCost,
    refs.desiredMonthlyNetProfit
  ].forEach(function (el) {
    el.addEventListener('input', render);
    el.addEventListener('change', render);
  });

  Object.keys(tool.DEFAULT_INPUTS).forEach(function (key) {
    refs[key].value = tool.DEFAULT_INPUTS[key];
  });
  render();
}());
