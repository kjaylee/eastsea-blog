(function (global, factory) {
  const api = factory(global.CreatorMembershipPlatformFeeComparatorCalculator);
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  global.CreatorMembershipPlatformFeeComparatorApp = api;
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    window.addEventListener('DOMContentLoaded', function () {
      api.initBrowser();
    });
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function (calculator) {
  'use strict';

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  function formatPercent(value) {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value) + '%';
  }

  function formatSignedCurrency(value) {
    const rounded = Math.abs(value) < 0.005 ? 0 : value;
    const sign = rounded > 0 ? '+' : '';
    return sign + formatCurrency(rounded);
  }

  function formatSignedPercent(value) {
    const rounded = Math.abs(value) < 0.005 ? 0 : value;
    const sign = rounded > 0 ? '+' : '';
    return sign + formatPercent(rounded);
  }

  function toFieldValue(value, type) {
    if (type === 'checkbox') {
      return Boolean(value);
    }
    return String(value);
  }

  function buildSummaryText(result) {
    const lines = [
      'Creator Membership Platform Fee Comparator summary',
      'Monthly price: ' + formatCurrency(result.input.membershipPrice),
      'Active members: ' + result.input.activeMembers,
      'Gross billings: ' + formatCurrency(result.grossMonthlyBillings),
      'Refunded billings: ' + formatCurrency(result.refundedBillings),
      'Net billings after refunds: ' + formatCurrency(result.netBillingsAfterRefunds),
      'Winner: ' + result.bestPlatformLabel + ' (' + formatCurrency(result.bestPlatformNetTakeHome) + ' net take-home)',
      'Patreon delta vs direct: ' + formatSignedCurrency(result.patreonDeltaVsDirect) + ' / year ' + formatSignedCurrency(result.patreonAnnualDeltaVsDirect),
      'Substack delta vs direct: ' + formatSignedCurrency(result.substackDeltaVsDirect) + ' / year ' + formatSignedCurrency(result.substackAnnualDeltaVsDirect),
      'App Store delta vs direct: ' + formatSignedCurrency(result.appStoreDeltaVsDirect) + ' / year ' + formatSignedCurrency(result.appStoreAnnualDeltaVsDirect),
      'Patreon price to match direct: ' + formatCurrency(result.patreonPriceToMatchDirect),
      'Substack price to match direct: ' + formatCurrency(result.substackPriceToMatchDirect),
      'App Store price to match direct: ' + formatCurrency(result.appStorePriceToMatchDirect),
      '',
      'Notes:',
      '- Patreon and Substack defaults are editable baseline assumptions.',
      '- App Store output is an effective-rate approximation driven by Small Business status or long-term subscriber share.',
      '- Direct Stripe includes the direct ops cost you entered.',
    ];
    return lines.join('\n');
  }

  function renderPlatforms(container, result) {
    container.innerHTML = result.rankedPlatforms.map(function (platform) {
      const isWinner = platform.key === result.bestPlatform;
      const priceToMatchText = platform.key === 'directStripe'
        ? 'Baseline current price'
        : formatCurrency(platform.priceToMatchDirect);
      const liftText = platform.key === 'directStripe'
        ? 'Baseline 0.00%'
        : formatSignedPercent(platform.requiredPriceLiftPct);
      return '<article class="platform-card' + (isWinner ? ' platform-card--winner' : '') + '">' +
        '<div class="platform-card__top">' +
          '<div>' +
            '<h3>' + escapeHtml(platform.label) + '</h3>' +
            '<p class="platform-note">' + escapeHtml(platform.assumptionNote) + '</p>' +
          '</div>' +
          (isWinner ? '<span class="winner-badge">Best take-home</span>' : '') +
        '</div>' +
        '<dl class="platform-metrics">' +
          '<div><dt>Total fees</dt><dd>' + escapeHtml(formatCurrency(platform.totalFees)) + '</dd></div>' +
          '<div><dt>Net take-home</dt><dd>' + escapeHtml(formatCurrency(platform.netTakeHome)) + '</dd></div>' +
          '<div><dt>Delta vs direct</dt><dd>' + escapeHtml(formatSignedCurrency(platform.deltaVsDirect)) + '</dd></div>' +
          '<div><dt>Annual delta vs direct</dt><dd>' + escapeHtml(formatSignedCurrency(platform.annualDeltaVsDirect)) + '</dd></div>' +
          '<div><dt>Effective variable rate</dt><dd>' + escapeHtml(formatPercent(platform.variableRate)) + '</dd></div>' +
          '<div><dt>Per-member fixed fee</dt><dd>' + escapeHtml(formatCurrency(platform.fixedFeePerTxn)) + '</dd></div>' +
          '<div><dt>Price to match direct</dt><dd>' + escapeHtml(priceToMatchText) + '</dd></div>' +
          '<div><dt>Required price lift</dt><dd>' + escapeHtml(liftText) + '</dd></div>' +
        '</dl>' +
      '</article>';
    }).join('');
  }

  function initBrowser() {
    if (typeof document === 'undefined' || !calculator) {
      return;
    }

    const form = document.getElementById('calculatorForm');
    if (!form) return;

    const refs = {
      errorBox: document.getElementById('errorBox'),
      errorList: document.getElementById('errorList'),
      grossMonthlyBillings: document.getElementById('grossMonthlyBillings'),
      refundedBillings: document.getElementById('refundedBillings'),
      netBillingsAfterRefunds: document.getElementById('netBillingsAfterRefunds'),
      winnerBadge: document.getElementById('winnerBadge'),
      winnerNetTakeHome: document.getElementById('winnerNetTakeHome'),
      appStoreCommissionNote: document.getElementById('appStoreCommissionNote'),
      comparisonCards: document.getElementById('comparisonCards'),
      summaryText: document.getElementById('summaryText'),
      copySummaryBtn: document.getElementById('copySummaryBtn'),
      copyStatus: document.getElementById('copyStatus'),
      resetDefaultsBtn: document.getElementById('resetDefaultsBtn'),
    };

    const fields = Array.from(form.querySelectorAll('[data-field]'));

    function applyDefaults() {
      fields.forEach(function (field) {
        const key = field.getAttribute('data-field');
        const type = field.type;
        const defaultValue = calculator.DEFAULT_INPUTS[key];
        if (type === 'checkbox') {
          field.checked = toFieldValue(defaultValue, type);
        } else {
          field.value = toFieldValue(defaultValue, type);
        }
      });
    }

    function readInputs() {
      const input = {};
      fields.forEach(function (field) {
        const key = field.getAttribute('data-field');
        if (field.type === 'checkbox') {
          input[key] = field.checked;
        } else {
          input[key] = field.value;
        }
      });
      return input;
    }

    function setErrors(errors) {
      const visible = Array.isArray(errors) && errors.length > 0;
      refs.errorBox.classList.toggle('hidden', !visible);
      refs.errorList.innerHTML = visible
        ? errors.map(function (message) { return '<li>' + escapeHtml(message) + '</li>'; }).join('')
        : '';
    }

    function renderResult(result) {
      refs.grossMonthlyBillings.textContent = formatCurrency(result.grossMonthlyBillings);
      refs.refundedBillings.textContent = formatCurrency(result.refundedBillings);
      refs.netBillingsAfterRefunds.textContent = formatCurrency(result.netBillingsAfterRefunds);
      refs.winnerBadge.textContent = result.bestPlatformLabel + ' wins this scenario';
      refs.winnerNetTakeHome.textContent = formatCurrency(result.bestPlatformNetTakeHome);
      refs.appStoreCommissionNote.textContent = 'App Store effective commission: ' + formatPercent(result.appStoreEffectiveCommissionRate) + '.';
      renderPlatforms(refs.comparisonCards, result);
      refs.summaryText.value = buildSummaryText(result);
    }

    function render() {
      const result = calculator.calculateAll(readInputs());
      if (!result.ok) {
        setErrors(result.errors);
        return;
      }
      setErrors([]);
      renderResult(result);
    }

    form.addEventListener('input', function () {
      refs.copyStatus.textContent = '';
      render();
    });
    form.addEventListener('change', function () {
      refs.copyStatus.textContent = '';
      render();
    });

    refs.copySummaryBtn.addEventListener('click', async function () {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(refs.summaryText.value);
        } else {
          refs.summaryText.focus();
          refs.summaryText.select();
          document.execCommand('copy');
        }
        refs.copyStatus.textContent = 'Summary copied.';
      } catch (error) {
        refs.copyStatus.textContent = 'Copy failed. Select and copy manually.';
      }
    });

    refs.resetDefaultsBtn.addEventListener('click', function () {
      applyDefaults();
      refs.copyStatus.textContent = '';
      render();
    });

    applyDefaults();
    render();
  }

  return {
    initBrowser: initBrowser,
    buildSummaryText: buildSummaryText,
  };
});
