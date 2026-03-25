(function (root) {
  const DEFAULTS = {
    contractValue: 500,
    numberOfContracts: 1,
    upworkFeePct: 10,
    currencyConversionPct: 0,
    freelancerPlusMonthlyCost: 0,
    targetMonthlyNet: 0
  };

  const TEXT = {
    ko: {
      invalid: "입력값을 확인해주세요.",
      negMoney: "금액 입력값은 모두 0 이상이어야 합니다.",
      badFeePct: "Upwork 수수료율은 0~100 범위여야 합니다.",
      badConvPct: "환전 수수료율은 0~100 범위여야 합니다.",
      badContracts: "계약 건수는 1 이상이어야 합니다.",
      badContractValue: "계약 금액은 0보다 커야 합니다.",
      statusGood: "현재 가정에서 순수익이 플러스입니다.",
      statusWarn: "현재 가정에서 순수익이 마이너스 또는 0입니다.",
      summaryTitle: "[Upwork 프리랜서 수수료·순수익 요약]",
      na: "N/A"
    },
    en: {
      invalid: "Please review your inputs.",
      negMoney: "All money fields must be zero or above.",
      badFeePct: "Upwork fee percentage must be between 0 and 100.",
      badConvPct: "Currency conversion percentage must be between 0 and 100.",
      badContracts: "Number of contracts must be at least 1.",
      badContractValue: "Contract value must be greater than zero.",
      statusGood: "Net take-home is positive under these assumptions.",
      statusWarn: "Net take-home is zero or negative under these assumptions.",
      summaryTitle: "[Upwork Freelancer Fee Summary]",
      na: "N/A"
    }
  };

  function round2(v) {
    return Math.round((v + Number.EPSILON) * 100) / 100;
  }

  function round4(v) {
    return Math.round((v + Number.EPSILON) * 10000) / 10000;
  }

  function computeCore(contractValue, numberOfContracts, upworkFeePct, currencyConversionPct, freelancerPlusMonthlyCost, targetMonthlyNet) {
    const grossEarnings = round2(contractValue * numberOfContracts);
    const upworkFee = round2(grossEarnings * (upworkFeePct / 100));
    const afterUpworkFee = round2(grossEarnings - upworkFee);
    const currencyConversionFee = round2(afterUpworkFee * (currencyConversionPct / 100));
    const totalFees = round2(upworkFee + currencyConversionFee);
    const freelancerPlusCost = round2(freelancerPlusMonthlyCost);
    const netTakeHome = round2(grossEarnings - totalFees - freelancerPlusCost);
    const effectiveFeeRatePct = grossEarnings > 0
      ? round4(((totalFees + freelancerPlusCost) / grossEarnings) * 100)
      : 0;
    const netPerContract = numberOfContracts > 0
      ? round2(netTakeHome / numberOfContracts)
      : 0;
    const requiredContractsForTarget = (targetMonthlyNet > 0 && netPerContract > 0)
      ? Math.ceil(targetMonthlyNet / netPerContract)
      : (targetMonthlyNet === 0 ? 0 : null);

    return {
      grossEarnings,
      upworkFee,
      currencyConversionFee,
      totalFees,
      freelancerPlusCost,
      netTakeHome,
      effectiveFeeRatePct,
      netPerContract,
      requiredContractsForTarget
    };
  }

  function buildSummary(input, result, lang) {
    const t = TEXT[lang] || TEXT.en;
    const na = t.na;
    const reqContracts = result.requiredContractsForTarget !== null
      ? String(result.requiredContractsForTarget)
      : na;
    const lines = [
      t.summaryTitle,
      `Contract value: $${Number(input.contractValue).toFixed(2)}`,
      `Number of contracts: ${Number(input.numberOfContracts)}`,
      `Gross earnings: $${result.grossEarnings.toFixed(2)}`,
      `Upwork fee (${Number(input.upworkFeePct)}%): $${result.upworkFee.toFixed(2)}`,
      `Currency conversion fee (${Number(input.currencyConversionPct)}%): $${result.currencyConversionFee.toFixed(2)}`,
      `Total fees: $${result.totalFees.toFixed(2)}`,
      `Freelancer Plus cost: $${result.freelancerPlusCost.toFixed(2)}`,
      `Net take-home: $${result.netTakeHome.toFixed(2)}`,
      `Effective fee rate: ${result.effectiveFeeRatePct.toFixed(2)}%`,
      `Net per contract: $${result.netPerContract.toFixed(2)}`,
      `Contracts needed for $${Number(input.targetMonthlyNet).toFixed(2)} target: ${reqContracts}`
    ];
    return lines.join('\n');
  }

  function normalizeInput(input) {
    return {
      contractValue: Number(input.contractValue),
      numberOfContracts: Number(input.numberOfContracts),
      upworkFeePct: Number(input.upworkFeePct),
      currencyConversionPct: Number(input.currencyConversionPct),
      freelancerPlusMonthlyCost: Number(input.freelancerPlusMonthlyCost),
      targetMonthlyNet: Number(input.targetMonthlyNet)
    };
  }

  function validate(n, lang) {
    const t = TEXT[lang] || TEXT.en;
    if (n.contractValue <= 0) return t.badContractValue;
    if (n.numberOfContracts < 1 || !Number.isInteger(n.numberOfContracts)) return t.badContracts;
    if (n.upworkFeePct < 0 || n.upworkFeePct > 100) return t.badFeePct;
    if (n.currencyConversionPct < 0 || n.currencyConversionPct > 100) return t.badConvPct;
    if (n.freelancerPlusMonthlyCost < 0) return t.negMoney;
    if (n.targetMonthlyNet < 0) return t.negMoney;
    return '';
  }

  function calculate(input, opts) {
    const lang = (opts && opts.lang) || 'en';
    const t = TEXT[lang] || TEXT.en;
    const n = normalizeInput(input);
    const err = validate(n, lang);
    if (err) return { result: null, error: err };

    const core = computeCore(
      n.contractValue, n.numberOfContracts,
      n.upworkFeePct, n.currencyConversionPct,
      n.freelancerPlusMonthlyCost, n.targetMonthlyNet
    );

    const result = {
      ...core,
      status: core.netTakeHome > 0 ? t.statusGood : t.statusWarn
    };

    result.summary = buildSummary(n, result, lang);

    return { result, error: '' };
  }

  const exports = { calculate, DEFAULTS };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = exports;
  } else {
    root.UpworkCalc = exports;
  }
}(typeof globalThis !== 'undefined' ? globalThis : this));
