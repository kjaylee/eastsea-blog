(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }
  root.FreelancerFeeCalculator = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const DEFAULTS = {
    workMode: 'fixed-price',
    awardedAmount: 500,
    releasedAmount: 650,
    bonusAmount: 25,
    subcontractorCost: 180,
    softwareCost: 25,
    otherCost: 20,
    targetNetProfit: 200
  };

  const FIELD_IDS = Object.keys(DEFAULTS);
  const moneyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
  const percentFormatter = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  function normalize(raw) {
    return {
      workMode: String(raw.workMode || '').trim(),
      awardedAmount: Number(raw.awardedAmount),
      releasedAmount: Number(raw.releasedAmount),
      bonusAmount: Number(raw.bonusAmount),
      subcontractorCost: Number(raw.subcontractorCost),
      softwareCost: Number(raw.softwareCost),
      otherCost: Number(raw.otherCost),
      targetNetProfit: Number(raw.targetNetProfit)
    };
  }

  function validate(input) {
    if (!['fixed-price', 'hourly'].includes(input.workMode)) {
      return 'Choose fixed-price or hourly. / 고정가 또는 시급 모드를 선택하세요.';
    }

    const numericKeys = [
      'awardedAmount',
      'releasedAmount',
      'bonusAmount',
      'subcontractorCost',
      'softwareCost',
      'otherCost',
      'targetNetProfit'
    ];

    if (numericKeys.some((key) => !Number.isFinite(input[key]))) {
      return 'All numeric inputs must be valid numbers. / 모든 숫자 입력값을 확인해주세요.';
    }

    if (numericKeys.some((key) => input[key] < 0)) {
      return 'Money inputs must be 0 or higher. / 금액 입력값은 0 이상이어야 합니다.';
    }

    if (input.workMode === 'fixed-price' && input.awardedAmount <= 0) {
      return 'Awarded amount must be greater than 0 for fixed-price mode. / 고정가 모드에서는 낙찰 금액이 0보다 커야 합니다.';
    }

    return '';
  }

  function solveFixedPriceGrossRequired(awardedAmount, sellerCostTotal, targetNetProfit) {
    const baseProjectFee = awardedAmount > 0 ? Math.max(awardedAmount * 0.1, 5) : 0;
    const withinAward = sellerCostTotal + targetNetProfit + baseProjectFee;
    if (withinAward <= awardedAmount) {
      return withinAward;
    }
    return (sellerCostTotal + targetNetProfit + baseProjectFee - awardedAmount * 0.1) / 0.9;
  }

  function compute(raw) {
    const input = normalize(raw);
    const error = validate(input);
    if (error) {
      return { error };
    }

    const sellerCostTotal = input.subcontractorCost + input.softwareCost + input.otherCost;
    const grossCollected = input.releasedAmount + input.bonusAmount;

    let baseProjectFee = 0;
    let overagePayments = 0;
    let overageFee = 0;
    let bonusFee = input.bonusAmount * 0.1;
    let totalPlatformFee = 0;
    let breakEvenGrossRequired = 0;
    let targetGrossRequired = 0;

    if (input.workMode === 'fixed-price') {
      baseProjectFee = Math.max(input.awardedAmount * 0.1, 5);
      overagePayments = Math.max(input.releasedAmount - input.awardedAmount, 0);
      overageFee = overagePayments * 0.1;
      totalPlatformFee = baseProjectFee + overageFee + bonusFee;
      breakEvenGrossRequired = solveFixedPriceGrossRequired(input.awardedAmount, sellerCostTotal, 0);
      targetGrossRequired = solveFixedPriceGrossRequired(input.awardedAmount, sellerCostTotal, input.targetNetProfit);
    } else {
      baseProjectFee = input.releasedAmount * 0.1;
      totalPlatformFee = baseProjectFee + bonusFee;
      breakEvenGrossRequired = sellerCostTotal / 0.9;
      targetGrossRequired = (sellerCostTotal + input.targetNetProfit) / 0.9;
    }

    const payoutBeforeCosts = grossCollected - totalPlatformFee;
    const netProfit = payoutBeforeCosts - sellerCostTotal;
    const effectiveFeeRatePct = grossCollected > 0 ? (totalPlatformFee / grossCollected) * 100 : 0;

    return {
      error: '',
      workMode: input.workMode,
      awardedAmount: input.awardedAmount,
      releasedAmount: input.releasedAmount,
      bonusAmount: input.bonusAmount,
      subcontractorCost: input.subcontractorCost,
      softwareCost: input.softwareCost,
      otherCost: input.otherCost,
      targetNetProfit: input.targetNetProfit,
      grossCollected,
      baseProjectFee,
      overagePayments,
      overageFee,
      bonusFee,
      totalPlatformFee,
      payoutBeforeCosts,
      sellerCostTotal,
      netProfit,
      effectiveFeeRatePct,
      breakEvenGrossRequired,
      targetGrossRequired
    };
  }

  function money(value) {
    return moneyFormatter.format(Number.isFinite(value) ? value : 0);
  }

  function pct(value) {
    return percentFormatter.format(Number.isFinite(value) ? value : 0) + '%';
  }

  function summaryText(result) {
    return [
      '[Freelancer.com Fee Calculator Summary]',
      `Work mode: ${result.workMode}`,
      `Awarded amount: ${money(result.awardedAmount)}`,
      `Released amount: ${money(result.releasedAmount)}`,
      `Bonus amount: ${money(result.bonusAmount)}`,
      `Gross collected: ${money(result.grossCollected)}`,
      `Base project fee: ${money(result.baseProjectFee)}`,
      `Overage fee: ${money(result.overageFee)}`,
      `Bonus fee: ${money(result.bonusFee)}`,
      `Total Freelancer fee: ${money(result.totalPlatformFee)}`,
      `Payout before costs: ${money(result.payoutBeforeCosts)}`,
      `Seller costs: ${money(result.sellerCostTotal)}`,
      `Net profit: ${money(result.netProfit)}`,
      `Break-even gross required: ${money(result.breakEvenGrossRequired)}`,
      `Target gross required (${money(result.targetNetProfit)} net): ${money(result.targetGrossRequired)}`,
      `Effective fee rate: ${pct(result.effectiveFeeRatePct)}`,
      '',
      'Assumptions:',
      '- Fixed-price projects use 10% of awarded amount or $5 minimum, whichever is greater.',
      '- Project overage and bonuses are modeled at 10%.',
      '- Preferred Freelancer / Recruiter 15% projects are excluded from this version.'
    ].join('\n');
  }

  function initPage() {
    if (typeof document === 'undefined') {
      return;
    }

    const byId = (id) => document.getElementById(id);

    function readForm() {
      const out = {};
      FIELD_IDS.forEach((id) => {
        out[id] = byId(id).value;
      });
      return out;
    }

    function writeDefaults() {
      FIELD_IDS.forEach((id) => {
        byId(id).value = DEFAULTS[id];
      });
    }

    function setDash() {
      [
        'grossCollected',
        'totalPlatformFee',
        'payoutBeforeCosts',
        'netProfit',
        'breakEvenGrossRequired',
        'targetGrossRequired',
        'baseProjectFee',
        'overagePayments',
        'overageFee',
        'bonusFee',
        'sellerCostTotal',
        'effectiveFeeRatePct'
      ].forEach((id) => {
        byId(id).textContent = '—';
      });
      byId('summary').value = '';
    }

    function updateModeHint(mode) {
      const hint = byId('awardedHint');
      if (!hint) return;
      hint.textContent = mode === 'hourly'
        ? 'Ignored in hourly mode. Hourly fees use 10% of released payments. / 시급 모드에서는 이 값이 무시됩니다.'
        : 'For fixed-price projects, Freelancer charges 10% of the awarded amount or $5 minimum. / 고정가 프로젝트는 낙찰 금액 기준입니다.';
    }

    function render() {
      const result = compute(readForm());
      const errorEl = byId('error');
      const statusEl = byId('status');
      const currentMode = byId('workMode').value;
      updateModeHint(currentMode);

      if (result.error) {
        errorEl.textContent = result.error;
        errorEl.classList.add('show');
        statusEl.className = 'status warn';
        statusEl.textContent = 'Calculation blocked until inputs are valid. / 입력값이 유효해야 계산됩니다.';
        setDash();
        return;
      }

      errorEl.textContent = '';
      errorEl.classList.remove('show');

      byId('grossCollected').textContent = money(result.grossCollected);
      byId('totalPlatformFee').textContent = money(result.totalPlatformFee);
      byId('payoutBeforeCosts').textContent = money(result.payoutBeforeCosts);
      byId('netProfit').textContent = money(result.netProfit);
      byId('breakEvenGrossRequired').textContent = money(result.breakEvenGrossRequired);
      byId('targetGrossRequired').textContent = money(result.targetGrossRequired);
      byId('baseProjectFee').textContent = money(result.baseProjectFee);
      byId('overagePayments').textContent = money(result.overagePayments);
      byId('overageFee').textContent = money(result.overageFee);
      byId('bonusFee').textContent = money(result.bonusFee);
      byId('sellerCostTotal').textContent = money(result.sellerCostTotal);
      byId('effectiveFeeRatePct').textContent = pct(result.effectiveFeeRatePct);
      byId('summary').value = summaryText(result);

      statusEl.className = result.netProfit >= 0 ? 'status good' : 'status warn';
      statusEl.textContent = result.netProfit >= 0
        ? 'Current assumptions stay profitable. / 현재 가정에서는 흑자입니다.'
        : 'Current assumptions are underwater. / 현재 가정에서는 적자입니다.';
    }

    byId('copyBtn').addEventListener('click', async () => {
      const text = byId('summary').value.trim();
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        window.alert('Summary copied.');
      } catch (error) {
        window.alert('Clipboard unavailable. Please copy manually.');
      }
    });

    byId('resetBtn').addEventListener('click', () => {
      writeDefaults();
      render();
    });

    FIELD_IDS.forEach((id) => {
      byId(id).addEventListener('input', render);
      byId(id).addEventListener('change', render);
    });

    writeDefaults();
    render();
  }

  return {
    DEFAULTS,
    compute,
    solveFixedPriceGrossRequired,
    summaryText,
    initPage
  };
});

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', function () {
    if (globalThis.FreelancerFeeCalculator) {
      globalThis.FreelancerFeeCalculator.initPage();
    }
  });
}
