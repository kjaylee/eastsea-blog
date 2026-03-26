(function (root) {
  const PLAN_MONTHLY_FEE = {
    hobby: 9,
    pro: 99
  };

  const HOBBY_RATE = 0.10;
  const HOBBY_FLAT_FEE = 0.30;
  const PRO_STANDARD_RATE = 0.029;
  const PRO_HIGH_TICKET_RATE = 0.039;
  const PRO_FLAT_FEE = 0.30;
  const PRO_HIGH_TICKET_THRESHOLD = 900;

  const DEFAULTS = {
    monthlyMembers: 60,
    monthlyPrice: 99,
    annualMembersBilled: 4,
    annualPrice: 900,
    oneTimePurchases: 2,
    oneTimePrice: 1200,
    refundRatePct: 3
  };

  const COPY = {
    title: 'Skool Fee Calculator',
    heading: '[Skool Fee Calculator Summary]',
    assumptions: 'Assumptions',
    assumptionValue: 'Skool Hobby uses $9/mo + 10% + $0.30. Skool Pro uses $99/mo + 2.9% + $0.30 below $900 and 3.9% + $0.30 for $900+ tickets in this model.',
    gross: 'Gross billed',
    hobbyNet: 'Hobby net',
    proNet: 'Pro net',
    delta: 'Pro vs Hobby delta',
    winner: 'Winner',
    breakEven: 'Pro break-even billed gross',
    na: 'N/A'
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
      monthlyMembers: toNumber(rawInput.monthlyMembers, DEFAULTS.monthlyMembers),
      monthlyPrice: toNumber(rawInput.monthlyPrice, DEFAULTS.monthlyPrice),
      annualMembersBilled: toNumber(rawInput.annualMembersBilled, DEFAULTS.annualMembersBilled),
      annualPrice: toNumber(rawInput.annualPrice, DEFAULTS.annualPrice),
      oneTimePurchases: toNumber(rawInput.oneTimePurchases, DEFAULTS.oneTimePurchases),
      oneTimePrice: toNumber(rawInput.oneTimePrice, DEFAULTS.oneTimePrice),
      refundRatePct: toNumber(rawInput.refundRatePct, DEFAULTS.refundRatePct)
    };
  }

  function isWholeNumber(value) {
    return Number.isInteger(value) && value >= 0;
  }

  function validate(input) {
    const wholeFields = [input.monthlyMembers, input.annualMembersBilled, input.oneTimePurchases];
    const priceFields = [input.monthlyPrice, input.annualPrice, input.oneTimePrice];

    if (!wholeFields.every(isWholeNumber)) {
      return 'Counts must be whole numbers at or above 0.';
    }

    if (!priceFields.every((value) => Number.isFinite(value) && value >= 0)) {
      return 'Prices must be finite numbers at or above 0.';
    }

    if (!Number.isFinite(input.refundRatePct) || input.refundRatePct < 0 || input.refundRatePct > 100) {
      return 'Refund or dispute drag must be between 0 and 100.';
    }

    return '';
  }

  function getProRate(price) {
    return price >= PRO_HIGH_TICKET_THRESHOLD ? PRO_HIGH_TICKET_RATE : PRO_STANDARD_RATE;
  }

  function buildBuckets(input) {
    return [
      {
        key: 'monthly',
        label: 'Monthly memberships',
        count: input.monthlyMembers,
        price: input.monthlyPrice
      },
      {
        key: 'annual',
        label: 'Annual memberships',
        count: input.annualMembersBilled,
        price: input.annualPrice
      },
      {
        key: 'oneTime',
        label: 'One-time purchases',
        count: input.oneTimePurchases,
        price: input.oneTimePrice
      }
    ];
  }

  function calculatePlan(plan, buckets, refundRatePct) {
    const monthlyFee = PLAN_MONTHLY_FEE[plan];
    const breakdown = [];
    let gross = 0;
    let transactionFees = 0;
    let variableFeeAmount = 0;
    let flatFeeAmount = 0;

    buckets.forEach((bucket) => {
      const bucketGross = round2(bucket.count * bucket.price);
      const rate = plan === 'hobby' ? HOBBY_RATE : getProRate(bucket.price);
      const flat = plan === 'hobby' ? HOBBY_FLAT_FEE : PRO_FLAT_FEE;
      const variableFee = round2(bucketGross * rate);
      const flatFee = round2(bucket.count * flat);
      const totalFee = round2(variableFee + flatFee);

      gross += bucketGross;
      transactionFees += totalFee;
      variableFeeAmount += variableFee;
      flatFeeAmount += flatFee;

      breakdown.push({
        key: bucket.key,
        label: bucket.label,
        count: bucket.count,
        price: bucket.price,
        gross: bucketGross,
        ratePct: round2(rate * 100),
        variableFee,
        flatFee,
        totalFee
      });
    });

    gross = round2(gross);
    transactionFees = round2(transactionFees);
    variableFeeAmount = round2(variableFeeAmount);
    flatFeeAmount = round2(flatFeeAmount);

    const refundLoss = round2(gross * (refundRatePct / 100));
    const totalCosts = round2(monthlyFee + transactionFees + refundLoss);
    const net = round2(gross - totalCosts);
    const effectiveFeeRatePct = gross > 0 ? round2((totalCosts / gross) * 100) : 0;

    return {
      plan,
      monthlyFee,
      gross,
      transactionFees,
      variableFeeAmount,
      flatFeeAmount,
      refundLoss,
      totalCosts,
      net,
      effectiveFeeRatePct,
      breakdown
    };
  }

  function computeBreakEvenGross(hobby, pro, gross) {
    if (gross <= 0) {
      return null;
    }

    const percentSavingsRate = (hobby.variableFeeAmount - pro.variableFeeAmount) / gross;
    if (!Number.isFinite(percentSavingsRate) || percentSavingsRate <= 0) {
      return null;
    }

    return round2((PLAN_MONTHLY_FEE.pro - PLAN_MONTHLY_FEE.hobby) / percentSavingsRate);
  }

  function formatCurrency(value) {
    if (!Number.isFinite(value)) {
      return COPY.na;
    }

    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function formatPercent(value) {
    if (!Number.isFinite(value)) {
      return COPY.na;
    }

    return `${value.toFixed(2)}%`;
  }

  function buildSummary(result) {
    return [
      COPY.heading,
      `${COPY.gross}: ${formatCurrency(result.gross)}`,
      `${COPY.hobbyNet}: ${formatCurrency(result.hobby.net)}`,
      `${COPY.proNet}: ${formatCurrency(result.pro.net)}`,
      `${COPY.delta}: ${formatCurrency(result.deltaProVsHobby)}`,
      `${COPY.winner}: ${result.winnerLabel}`,
      `${COPY.breakEven}: ${result.breakEvenGross == null ? COPY.na : formatCurrency(result.breakEvenGross)}`,
      `${COPY.assumptions}: ${COPY.assumptionValue}`
    ].join('\n');
  }

  function calculate(rawInput) {
    const input = normalizeInput(rawInput || {});
    const error = validate(input);

    if (error) {
      return { result: null, error };
    }

    const buckets = buildBuckets(input);
    const hobby = calculatePlan('hobby', buckets, input.refundRatePct);
    const pro = calculatePlan('pro', buckets, input.refundRatePct);
    const gross = hobby.gross;
    const deltaProVsHobby = round2(pro.net - hobby.net);
    const winner = deltaProVsHobby > 0 ? 'pro' : (deltaProVsHobby < 0 ? 'hobby' : 'tie');
    const winnerLabel = winner === 'pro' ? 'Pro' : (winner === 'hobby' ? 'Hobby' : 'Tie');
    const breakEvenGross = computeBreakEvenGross(hobby, pro, gross);
    const result = {
      input,
      buckets,
      gross,
      hobby,
      pro,
      deltaProVsHobby,
      winner,
      winnerLabel,
      breakEvenGross,
      summary: ''
    };

    result.summary = buildSummary(result);

    return { result, error: '' };
  }

  function createDomBindings(rootNode) {
    return {
      monthlyMembers: rootNode.getElementById('monthlyMembers'),
      monthlyPrice: rootNode.getElementById('monthlyPrice'),
      annualMembersBilled: rootNode.getElementById('annualMembersBilled'),
      annualPrice: rootNode.getElementById('annualPrice'),
      oneTimePurchases: rootNode.getElementById('oneTimePurchases'),
      oneTimePrice: rootNode.getElementById('oneTimePrice'),
      refundRatePct: rootNode.getElementById('refundRatePct'),
      error: rootNode.getElementById('error'),
      summary: rootNode.getElementById('summary'),
      gross: rootNode.getElementById('gross'),
      hobbyNet: rootNode.getElementById('hobbyNet'),
      proNet: rootNode.getElementById('proNet'),
      delta: rootNode.getElementById('delta'),
      winner: rootNode.getElementById('winner'),
      breakEven: rootNode.getElementById('breakEven'),
      hobbyFeeRate: rootNode.getElementById('hobbyFeeRate'),
      proFeeRate: rootNode.getElementById('proFeeRate'),
      hobbyPlanFee: rootNode.getElementById('hobbyPlanFee'),
      hobbyTxnFees: rootNode.getElementById('hobbyTxnFees'),
      hobbyRefundLoss: rootNode.getElementById('hobbyRefundLoss'),
      proPlanFee: rootNode.getElementById('proPlanFee'),
      proTxnFees: rootNode.getElementById('proTxnFees'),
      proRefundLoss: rootNode.getElementById('proRefundLoss'),
      insight: rootNode.getElementById('insight'),
      reset: rootNode.getElementById('reset'),
      copy: rootNode.getElementById('copy')
    };
  }

  function readInputFromDom(refs) {
    return {
      monthlyMembers: refs.monthlyMembers.value,
      monthlyPrice: refs.monthlyPrice.value,
      annualMembersBilled: refs.annualMembersBilled.value,
      annualPrice: refs.annualPrice.value,
      oneTimePurchases: refs.oneTimePurchases.value,
      oneTimePrice: refs.oneTimePrice.value,
      refundRatePct: refs.refundRatePct.value
    };
  }

  function writeDefaults(refs) {
    refs.monthlyMembers.value = String(DEFAULTS.monthlyMembers);
    refs.monthlyPrice.value = String(DEFAULTS.monthlyPrice);
    refs.annualMembersBilled.value = String(DEFAULTS.annualMembersBilled);
    refs.annualPrice.value = String(DEFAULTS.annualPrice);
    refs.oneTimePurchases.value = String(DEFAULTS.oneTimePurchases);
    refs.oneTimePrice.value = String(DEFAULTS.oneTimePrice);
    refs.refundRatePct.value = String(DEFAULTS.refundRatePct);
  }

  function render(refs) {
    const { result, error } = calculate(readInputFromDom(refs));

    if (error) {
      refs.error.style.display = 'block';
      refs.error.textContent = error;
      refs.summary.value = '';
      return;
    }

    refs.error.style.display = 'none';
    refs.error.textContent = '';
    refs.summary.value = result.summary;
    refs.gross.textContent = formatCurrency(result.gross);
    refs.hobbyNet.textContent = formatCurrency(result.hobby.net);
    refs.proNet.textContent = formatCurrency(result.pro.net);
    refs.delta.textContent = formatCurrency(result.deltaProVsHobby);
    refs.delta.dataset.positive = result.deltaProVsHobby > 0 ? 'true' : 'false';
    refs.winner.textContent = result.winnerLabel;
    refs.breakEven.textContent = result.breakEvenGross == null ? COPY.na : formatCurrency(result.breakEvenGross);
    refs.hobbyFeeRate.textContent = formatPercent(result.hobby.effectiveFeeRatePct);
    refs.proFeeRate.textContent = formatPercent(result.pro.effectiveFeeRatePct);
    refs.hobbyPlanFee.textContent = formatCurrency(result.hobby.monthlyFee);
    refs.hobbyTxnFees.textContent = formatCurrency(result.hobby.transactionFees);
    refs.hobbyRefundLoss.textContent = formatCurrency(result.hobby.refundLoss);
    refs.proPlanFee.textContent = formatCurrency(result.pro.monthlyFee);
    refs.proTxnFees.textContent = formatCurrency(result.pro.transactionFees);
    refs.proRefundLoss.textContent = formatCurrency(result.pro.refundLoss);
    refs.insight.textContent = result.winner === 'pro'
      ? `At the current mix, Pro keeps ${formatCurrency(result.deltaProVsHobby)} more than Hobby this month.`
      : (result.winner === 'hobby'
        ? `At the current mix, Hobby keeps ${formatCurrency(Math.abs(result.deltaProVsHobby))} more than Pro this month.`
        : 'At the current mix, both plans land at the same net take-home.');
  }

  function wireDom(rootNode) {
    const refs = createDomBindings(rootNode);
    writeDefaults(refs);
    render(refs);

    [
      refs.monthlyMembers,
      refs.monthlyPrice,
      refs.annualMembersBilled,
      refs.annualPrice,
      refs.oneTimePurchases,
      refs.oneTimePrice,
      refs.refundRatePct
    ].forEach((field) => {
      field.addEventListener('input', function () {
        render(refs);
      });
    });

    refs.reset.addEventListener('click', function () {
      writeDefaults(refs);
      render(refs);
    });

    refs.copy.addEventListener('click', async function () {
      if (!refs.summary.value) {
        return;
      }

      try {
        await navigator.clipboard.writeText(refs.summary.value);
        refs.copy.textContent = 'Copied';
        setTimeout(function () {
          refs.copy.textContent = 'Copy summary';
        }, 1200);
      } catch (error) {
        refs.copy.textContent = 'Copy failed';
        setTimeout(function () {
          refs.copy.textContent = 'Copy summary';
        }, 1200);
      }
    });
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      DEFAULTS,
      PLAN_MONTHLY_FEE,
      HOBBY_RATE,
      HOBBY_FLAT_FEE,
      PRO_STANDARD_RATE,
      PRO_HIGH_TICKET_RATE,
      PRO_FLAT_FEE,
      PRO_HIGH_TICKET_THRESHOLD,
      calculate,
      getProRate
    };
  }

  if (root && typeof root.document !== 'undefined') {
    root.SkoolFeeCalculator = {
      DEFAULTS,
      calculate
    };

    root.addEventListener('DOMContentLoaded', function () {
      wireDom(root.document);
    });
  }
}(typeof window !== 'undefined' ? window : globalThis));
