(function (global) {
  const DEFAULTS = {
    price: 79,
    promoSales: 18,
    marketplaceSales: 42,
    affiliateSales: 8,
    promoSharePct: 97,
    marketplaceSharePct: 37,
    affiliateSharePct: 25,
    refundRatePct: 6,
    fixedMonthlyCosts: 250,
    targetMonthlyNetIncome: 2500,
  };

  function toNumber(value) {
    const num = Number(value);
    return Number.isFinite(num) ? num : NaN;
  }

  function clampPercent(num) {
    return num / 100;
  }

  function validateInputs(raw) {
    const input = {
      price: toNumber(raw.price),
      promoSales: toNumber(raw.promoSales),
      marketplaceSales: toNumber(raw.marketplaceSales),
      affiliateSales: toNumber(raw.affiliateSales),
      promoSharePct: toNumber(raw.promoSharePct),
      marketplaceSharePct: toNumber(raw.marketplaceSharePct),
      affiliateSharePct: toNumber(raw.affiliateSharePct),
      refundRatePct: toNumber(raw.refundRatePct),
      fixedMonthlyCosts: toNumber(raw.fixedMonthlyCosts),
      targetMonthlyNetIncome: toNumber(raw.targetMonthlyNetIncome),
    };

    const finiteFields = Object.entries(input);
    for (const [key, value] of finiteFields) {
      if (!Number.isFinite(value)) {
        throw new Error(`Invalid number for ${key}`);
      }
    }

    const nonNegativeFields = [
      'price',
      'promoSales',
      'marketplaceSales',
      'affiliateSales',
      'fixedMonthlyCosts',
      'targetMonthlyNetIncome',
    ];

    for (const key of nonNegativeFields) {
      if (input[key] < 0) {
        throw new Error(`${key} must be 0 or higher`);
      }
    }

    if (input.price <= 0) {
      throw new Error('price must be greater than 0');
    }

    const integerishFields = ['promoSales', 'marketplaceSales', 'affiliateSales'];
    for (const key of integerishFields) {
      if (!Number.isInteger(input[key])) {
        throw new Error(`${key} must be a whole number`);
      }
    }

    const percentFields = ['promoSharePct', 'marketplaceSharePct', 'affiliateSharePct', 'refundRatePct'];
    for (const key of percentFields) {
      if (input[key] < 0 || input[key] > 100) {
        throw new Error(`${key} must be between 0 and 100`);
      }
    }

    return input;
  }

  function ceilSafe(value) {
    if (!Number.isFinite(value) || value <= 0) return 0;
    return Math.ceil(value);
  }

  function compute(raw) {
    const input = validateInputs(raw);
    const promoShare = clampPercent(input.promoSharePct);
    const marketplaceShare = clampPercent(input.marketplaceSharePct);
    const affiliateShare = clampPercent(input.affiliateSharePct);
    const refundRate = clampPercent(input.refundRatePct);

    const totalSales = input.promoSales + input.marketplaceSales + input.affiliateSales;
    const grossSales = input.price * totalSales;

    const promoRevenue = input.price * input.promoSales;
    const marketplaceRevenue = input.price * input.marketplaceSales;
    const affiliateRevenue = input.price * input.affiliateSales;

    const promoPayout = promoRevenue * promoShare;
    const marketplacePayout = marketplaceRevenue * marketplaceShare;
    const affiliatePayout = affiliateRevenue * affiliateShare;

    const grossPayoutBeforeRefunds = promoPayout + marketplacePayout + affiliatePayout;
    const refundLoss = grossPayoutBeforeRefunds * refundRate;
    const netPayoutAfterRefunds = grossPayoutBeforeRefunds - refundLoss;
    const netAfterFixedCosts = netPayoutAfterRefunds - input.fixedMonthlyCosts;

    const blendedSharePct = grossSales > 0 ? (grossPayoutBeforeRefunds / grossSales) * 100 : 0;
    const averageGrossPayoutPerSale = totalSales > 0 ? grossPayoutBeforeRefunds / totalSales : 0;
    const avgNetPerSaleAfterRefunds = totalSales > 0 ? netPayoutAfterRefunds / totalSales : 0;

    const breakEvenSalesNeeded = ceilSafe(input.fixedMonthlyCosts / avgNetPerSaleAfterRefunds);
    const targetSalesNeeded = ceilSafe((input.fixedMonthlyCosts + input.targetMonthlyNetIncome) / avgNetPerSaleAfterRefunds);
    const targetGap = netAfterFixedCosts - input.targetMonthlyNetIncome;

    const promoMixPct = totalSales > 0 ? (input.promoSales / totalSales) * 100 : 0;
    const marketplaceMixPct = totalSales > 0 ? (input.marketplaceSales / totalSales) * 100 : 0;
    const affiliateMixPct = totalSales > 0 ? (input.affiliateSales / totalSales) * 100 : 0;

    const modeledUpsidePerConvertedSale = input.price * (promoShare - marketplaceShare) * (1 - refundRate);
    const tenSaleChannelShiftUpside = Math.max(0, modeledUpsidePerConvertedSale * Math.min(10, input.marketplaceSales));

    return {
      ...input,
      totalSales,
      grossSales,
      promoRevenue,
      marketplaceRevenue,
      affiliateRevenue,
      promoPayout,
      marketplacePayout,
      affiliatePayout,
      grossPayoutBeforeRefunds,
      refundLoss,
      netPayoutAfterRefunds,
      netAfterFixedCosts,
      blendedSharePct,
      averageGrossPayoutPerSale,
      avgNetPerSaleAfterRefunds,
      breakEvenSalesNeeded,
      targetSalesNeeded,
      targetGap,
      promoMixPct,
      marketplaceMixPct,
      affiliateMixPct,
      modeledUpsidePerConvertedSale,
      tenSaleChannelShiftUpside,
    };
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  function formatNumber(value, digits) {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: digits || 0,
      maximumFractionDigits: digits || 0,
    }).format(value);
  }

  function formatPercent(value, digits) {
    return `${formatNumber(value, digits == null ? 1 : digits)}%`;
  }

  function buildSummary(result) {
    return [
      'Udemy Instructor Revenue Snapshot',
      `- Gross learner spend: ${formatCurrency(result.grossSales)}`,
      `- Gross payout before refunds: ${formatCurrency(result.grossPayoutBeforeRefunds)}`,
      `- Refund drag: ${formatCurrency(result.refundLoss)}`,
      `- Net payout after refunds: ${formatCurrency(result.netPayoutAfterRefunds)}`,
      `- Net after fixed monthly costs: ${formatCurrency(result.netAfterFixedCosts)}`,
      `- Blended instructor share: ${formatPercent(result.blendedSharePct, 1)}`,
      `- Break-even sales needed: ${formatNumber(result.breakEvenSalesNeeded)} sales`,
      `- Sales needed for target monthly net: ${formatNumber(result.targetSalesNeeded)} sales`,
    ].join('\n');
  }

  function setupDom() {
    if (typeof document === 'undefined') return;

    const ids = [
      'price', 'promoSales', 'marketplaceSales', 'affiliateSales',
      'promoSharePct', 'marketplaceSharePct', 'affiliateSharePct',
      'refundRatePct', 'fixedMonthlyCosts', 'targetMonthlyNetIncome',
    ];

    const $ = (id) => document.getElementById(id);
    const refs = Object.fromEntries(ids.map((id) => [id, $(id)]));
    const output = {
      grossSales: $('grossSales'),
      grossPayoutBeforeRefunds: $('grossPayoutBeforeRefunds'),
      netPayoutAfterRefunds: $('netPayoutAfterRefunds'),
      netAfterFixedCosts: $('netAfterFixedCosts'),
      blendedSharePct: $('blendedSharePct'),
      targetStatus: $('targetStatus'),
      status: $('status'),
      summary: $('summary'),
      error: $('error'),
      promoPayout: $('promoPayout'),
      marketplacePayout: $('marketplacePayout'),
      affiliatePayout: $('affiliatePayout'),
      refundLoss: $('refundLoss'),
      totalSales: $('totalSales'),
      averageNetPerSale: $('averageNetPerSale'),
      breakEvenSalesNeeded: $('breakEvenSalesNeeded'),
      targetSalesNeeded: $('targetSalesNeeded'),
      promoMix: $('promoMix'),
      marketplaceMix: $('marketplaceMix'),
      affiliateMix: $('affiliateMix'),
      channelShiftUpside: $('channelShiftUpside'),
    };

    function collectInput() {
      return Object.fromEntries(ids.map((id) => [id, refs[id].value]));
    }

    function setDefaults() {
      for (const [key, value] of Object.entries(DEFAULTS)) {
        refs[key].value = value;
      }
    }

    function setStatus(message, tone) {
      output.status.textContent = message;
      output.status.className = `status ${tone || ''}`.trim();
    }

    function render() {
      try {
        const result = compute(collectInput());
        output.error.classList.remove('show');
        output.error.textContent = '';

        output.grossSales.textContent = formatCurrency(result.grossSales);
        output.grossPayoutBeforeRefunds.textContent = formatCurrency(result.grossPayoutBeforeRefunds);
        output.netPayoutAfterRefunds.textContent = formatCurrency(result.netPayoutAfterRefunds);
        output.netAfterFixedCosts.textContent = formatCurrency(result.netAfterFixedCosts);
        output.blendedSharePct.textContent = formatPercent(result.blendedSharePct, 1);
        output.promoPayout.textContent = formatCurrency(result.promoPayout);
        output.marketplacePayout.textContent = formatCurrency(result.marketplacePayout);
        output.affiliatePayout.textContent = formatCurrency(result.affiliatePayout);
        output.refundLoss.textContent = formatCurrency(result.refundLoss);
        output.totalSales.textContent = `${formatNumber(result.totalSales)} sales`;
        output.averageNetPerSale.textContent = formatCurrency(result.avgNetPerSaleAfterRefunds);
        output.breakEvenSalesNeeded.textContent = `${formatNumber(result.breakEvenSalesNeeded)} sales`;
        output.targetSalesNeeded.textContent = `${formatNumber(result.targetSalesNeeded)} sales`;
        output.promoMix.textContent = formatPercent(result.promoMixPct, 1);
        output.marketplaceMix.textContent = formatPercent(result.marketplaceMixPct, 1);
        output.affiliateMix.textContent = formatPercent(result.affiliateMixPct, 1);
        output.channelShiftUpside.textContent = formatCurrency(result.tenSaleChannelShiftUpside);
        output.summary.value = buildSummary(result);

        if (result.targetGap >= 0) {
          output.targetStatus.textContent = `Above target by ${formatCurrency(result.targetGap)}`;
          setStatus('Healthy month: current mix clears your target after refunds and fixed costs.', 'good');
        } else if (result.netAfterFixedCosts >= 0) {
          output.targetStatus.textContent = `Below target by ${formatCurrency(Math.abs(result.targetGap))}`;
          setStatus('Profitable, but still under the target monthly net.', 'warn');
        } else {
          output.targetStatus.textContent = `Negative by ${formatCurrency(Math.abs(result.netAfterFixedCosts))}`;
          setStatus('Unprofitable month: refunds + channel mix + fixed costs are too heavy.', 'bad');
        }
      } catch (error) {
        output.error.textContent = error.message;
        output.error.classList.add('show');
        output.summary.value = '';
        setStatus('Please correct the invalid input values.', 'bad');
      }
    }

    setDefaults();
    render();

    ids.forEach((id) => refs[id].addEventListener('input', render));
    $('reset').addEventListener('click', () => {
      setDefaults();
      render();
    });
    $('copy').addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(output.summary.value);
        setStatus('Summary copied to clipboard.', 'good');
      } catch (_) {
        setStatus('Copy failed. You can still select and copy the summary manually.', 'warn');
      }
    });
  }

  const api = { DEFAULTS, validateInputs, compute, buildSummary };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  global.UdemyInstructorRevenueCalculator = api;

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setupDom);
    } else {
      setupDom();
    }
  }
})(typeof window !== 'undefined' ? window : globalThis);
