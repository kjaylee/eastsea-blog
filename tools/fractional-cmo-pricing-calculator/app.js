(function () {
  const calc = window.FractionalCmoPricingCalculator;
  if (!calc) {
    throw new Error('FractionalCmoPricingCalculator is not available.');
  }

  const inputIds = [
    'currentRetainer',
    'strategyHours',
    'leadershipHours',
    'channelReviewHours',
    'supportHours',
    'seniorRate',
    'supportRate',
    'toolBudget',
    'overhead',
    'scopeBufferPct',
    'paymentFeePct',
    'targetMarginPct',
    'onboardingHours',
    'contractMonths',
  ];

  const outputIds = [
    'monthlyDeliveryCost',
    'breakEvenRetainer',
    'recommendedRetainer',
    'suggestedOnboardingFee',
    'contractValue',
    'currentOperatingMarginPct',
    'marginGapPct',
    'netRealizedHourlyRate',
    'seniorBaseHours',
    'bufferedSeniorHours',
    'bufferedSupportHours',
    'totalDeliveryHours',
    'seniorLaborCost',
    'supportLaborCost',
    'currentOperatingProfit',
  ];

  const refs = {};
  inputIds.concat(outputIds).concat([
    'summary',
    'error',
    'status',
    'packageRows',
    'copyBtn',
    'resetBtn',
  ]).forEach((id) => {
    refs[id] = document.getElementById(id);
  });

  const money = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  });
  const num = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });

  function formatMoney(value) {
    return money.format(Number(value || 0));
  }

  function formatNumber(value) {
    return num.format(Number(value || 0));
  }

  function formatPercent(value) {
    return `${formatNumber(value)}%`;
  }

  function formatPoints(value) {
    return `${formatNumber(value)} pts`;
  }

  function getInput() {
    const input = {};
    inputIds.forEach((id) => {
      input[id] = Number(refs[id].value);
    });
    return input;
  }

  function setDefaults() {
    Object.entries(calc.DEFAULT_INPUTS).forEach(([key, value]) => {
      refs[key].value = value;
    });
  }

  function renderPackages(tiers) {
    refs.packageRows.innerHTML = tiers.map((tier) => `
      <tr>
        <td>${tier.name}</td>
        <td>${tier.focus}</td>
        <td>${formatNumber(tier.totalHours)} hrs</td>
        <td>${formatMoney(tier.deliveryCost)}</td>
        <td>${formatMoney(tier.suggestedRetainer)}</td>
      </tr>
    `).join('');
  }

  function renderStatus(result) {
    const tone = result.status === 'strong'
      ? 'strong'
      : result.status === 'balanced'
        ? 'balanced'
        : 'risky';
    const copy = result.status === 'strong'
      ? 'Current pricing already meets or exceeds your target margin.'
      : result.status === 'balanced'
        ? 'Current pricing is close to target, but buffer is thin.'
        : 'Current pricing is under target and likely fragile for sustained delivery.';

    refs.status.className = `status ${tone}`;
    refs.status.innerHTML = `
      <strong>${result.status.toUpperCase()}</strong>
      <span>${copy}</span>
    `;
  }

  function render() {
    const { result, error } = calc.calculate(getInput());

    if (error) {
      refs.error.textContent = error;
      refs.error.classList.add('show');
      refs.summary.value = '';
      refs.packageRows.innerHTML = '';
      refs.status.className = 'status risky';
      refs.status.innerHTML = '<strong>ERROR</strong><span>Fix the inputs to continue.</span>';
      outputIds.forEach((id) => {
        refs[id].textContent = '—';
      });
      return;
    }

    refs.error.textContent = '';
    refs.error.classList.remove('show');

    refs.monthlyDeliveryCost.textContent = formatMoney(result.monthlyDeliveryCost);
    refs.breakEvenRetainer.textContent = formatMoney(result.breakEvenRetainer);
    refs.recommendedRetainer.textContent = formatMoney(result.recommendedRetainer);
    refs.suggestedOnboardingFee.textContent = formatMoney(result.suggestedOnboardingFee);
    refs.contractValue.textContent = formatMoney(result.contractValue);
    refs.currentOperatingMarginPct.textContent = formatPercent(result.currentOperatingMarginPct);
    refs.marginGapPct.textContent = formatPoints(result.marginGapPct);
    refs.netRealizedHourlyRate.textContent = formatMoney(result.netRealizedHourlyRate);

    refs.seniorBaseHours.textContent = `${formatNumber(result.seniorBaseHours)} hrs`;
    refs.bufferedSeniorHours.textContent = `${formatNumber(result.bufferedSeniorHours)} hrs`;
    refs.bufferedSupportHours.textContent = `${formatNumber(result.bufferedSupportHours)} hrs`;
    refs.totalDeliveryHours.textContent = `${formatNumber(result.totalDeliveryHours)} hrs`;
    refs.seniorLaborCost.textContent = formatMoney(result.seniorLaborCost);
    refs.supportLaborCost.textContent = formatMoney(result.supportLaborCost);
    refs.currentOperatingProfit.textContent = formatMoney(result.currentOperatingProfit);

    refs.summary.value = result.summary;
    renderPackages(result.tiers);
    renderStatus(result);
  }

  refs.copyBtn.addEventListener('click', async function () {
    if (!refs.summary.value) {
      return;
    }

    try {
      await navigator.clipboard.writeText(refs.summary.value);
      refs.copyBtn.textContent = 'Copied';
      setTimeout(() => {
        refs.copyBtn.textContent = 'Copy Summary';
      }, 1200);
    } catch (err) {
      refs.summary.focus();
      refs.summary.select();
      document.execCommand('copy');
      refs.copyBtn.textContent = 'Copied';
      setTimeout(() => {
        refs.copyBtn.textContent = 'Copy Summary';
      }, 1200);
    }
  });

  refs.resetBtn.addEventListener('click', function () {
    setDefaults();
    render();
  });

  inputIds.forEach((id) => {
    refs[id].addEventListener('input', render);
  });

  setDefaults();
  render();
}());
