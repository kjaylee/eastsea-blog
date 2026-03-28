/**
 * Facebook Marketplace Fee Calculator — pure compute module.
 * Node-importable: `const { calculate } = require('./calculator.js');`
 * Browser: attaches to window.FBMarketplaceCalc
 */
(function (exports) {
  'use strict';

  /* ---------- defaults ---------- */
  var DEFAULTS = {
    orderMode: 'shipped',        // 'shipped' | 'pickup'
    salePrice: 0,
    shippingChargedToBuyer: 0,
    customFeeOverride: false,
    customFeeRatePct: 10,
    customMinimumFee: 0.80,
    processingRatePct: 0,
    processingFlatFee: 0,
    targetPayout: 0
  };

  /* ---------- helpers ---------- */
  function round2(n) { return Math.round(n * 100) / 100; }

  function validate(input) {
    var errors = [];
    if (typeof input.salePrice !== 'number' || input.salePrice <= 0) {
      errors.push('salePrice must be > 0');
    }
    if (!input.orderMode || (input.orderMode !== 'shipped' && input.orderMode !== 'pickup')) {
      errors.push('orderMode must be "shipped" or "pickup"');
    }
    if (input.orderMode === 'pickup' && input.shippingChargedToBuyer > 0) {
      errors.push('pickup mode cannot have shippingChargedToBuyer > 0');
    }
    if (typeof input.shippingChargedToBuyer === 'number' && input.shippingChargedToBuyer < 0) {
      errors.push('shippingChargedToBuyer cannot be negative');
    }
    if (input.customFeeOverride) {
      if (typeof input.customFeeRatePct === 'number' && input.customFeeRatePct < 0) {
        errors.push('customFeeRatePct cannot be negative');
      }
      if (typeof input.customFeeRatePct === 'number' && input.customFeeRatePct >= 100) {
        errors.push('customFeeRatePct must be < 100');
      }
      if (typeof input.customMinimumFee === 'number' && input.customMinimumFee < 0) {
        errors.push('customMinimumFee cannot be negative');
      }
    }
    if (typeof input.processingRatePct === 'number' && input.processingRatePct < 0) {
      errors.push('processingRatePct cannot be negative');
    }
    if (typeof input.processingRatePct === 'number' && input.processingRatePct >= 100) {
      errors.push('processingRatePct must be < 100');
    }
    if (typeof input.processingFlatFee === 'number' && input.processingFlatFee < 0) {
      errors.push('processingFlatFee cannot be negative');
    }
    // combined rate guard
    if (input.customFeeOverride) {
      var combinedRate = (input.customFeeRatePct || 0) + (input.processingRatePct || 0);
      if (combinedRate >= 100) {
        errors.push('customFeeRatePct + processingRatePct must be < 100');
      }
    }
    return errors;
  }

  /* ---------- main ---------- */
  function calculate(userInput) {
    // merge defaults
    var input = {};
    for (var k in DEFAULTS) { input[k] = DEFAULTS[k]; }
    for (var k2 in userInput) { if (userInput.hasOwnProperty(k2)) input[k2] = userInput[k2]; }

    var errors = validate(input);
    if (errors.length > 0) {
      return { error: true, errors: errors };
    }

    var salePrice = input.salePrice;
    var shipping = input.orderMode === 'pickup' ? 0 : (input.shippingChargedToBuyer || 0);
    var grossCollected = round2(salePrice + shipping);

    // marketplace fee
    var marketplaceFee = 0;
    if (input.orderMode === 'shipped') {
      var feeRatePct = input.customFeeOverride ? input.customFeeRatePct : 10;
      var minimumFee = input.customFeeOverride ? input.customMinimumFee : 0.80;
      var computedFee = grossCollected * (feeRatePct / 100);
      marketplaceFee = round2(Math.max(computedFee, minimumFee));
    }
    // pickup: marketplaceFee stays 0

    // processing fee
    var processingFee = 0;
    if (input.processingRatePct > 0 || input.processingFlatFee > 0) {
      processingFee = round2(grossCollected * (input.processingRatePct / 100) + input.processingFlatFee);
    }

    var totalFees = round2(marketplaceFee + processingFee);
    var sellerPayout = round2(grossCollected - totalFees);
    var effectiveFeeRatePct = grossCollected > 0 ? round2((totalFees / grossCollected) * 100) : 0;

    // target payout solver
    var requiredSalePriceForTargetPayout = null;
    if (input.targetPayout > 0) {
      if (input.orderMode === 'pickup' && input.processingRatePct === 0 && input.processingFlatFee === 0) {
        // no fees at all
        requiredSalePriceForTargetPayout = input.targetPayout;
      } else {
        // For shipped: target = (salePrice + shipping) - max((salePrice + shipping) * feeRate, minFee) - processing
        // We solve for salePrice:
        // Let gross = salePrice + shipping
        // target = gross - max(gross * feeRate, minFee) - (gross * procRate + procFlat)
        // Case 1: gross * feeRate >= minFee → target = gross(1 - feeRate - procRate) - procFlat
        //   gross = (target + procFlat) / (1 - feeRate - procRate)
        //   salePrice = gross - shipping
        // Case 2: gross * feeRate < minFee → target = gross - minFee - gross * procRate - procFlat
        //   gross = (target + minFee + procFlat) / (1 - procRate)
        //   salePrice = gross - shipping
        // Check which case applies and validate
        var feeRate = input.orderMode === 'shipped'
          ? (input.customFeeOverride ? input.customFeeRatePct : 10) / 100
          : 0;
        var minFee = input.orderMode === 'shipped'
          ? (input.customFeeOverride ? input.customMinimumFee : 0.80)
          : 0;
        var procRate = (input.processingRatePct || 0) / 100;
        var procFlat = input.processingFlatFee || 0;

        // Try case 1 first (percentage fee applies)
        var denom1 = 1 - feeRate - procRate;
        if (denom1 > 0) {
          var gross1 = (input.targetPayout + procFlat) / denom1;
          if (gross1 * feeRate >= minFee) {
            requiredSalePriceForTargetPayout = round2(Math.max(gross1 - shipping, 0));
          }
        }

        // If case 1 didn't apply, try case 2 (minimum fee applies)
        if (requiredSalePriceForTargetPayout === null) {
          var denom2 = 1 - procRate;
          if (denom2 > 0) {
            var gross2 = (input.targetPayout + minFee + procFlat) / denom2;
            requiredSalePriceForTargetPayout = round2(Math.max(gross2 - shipping, 0));
          } else {
            requiredSalePriceForTargetPayout = null; // unsolvable
          }
        }
      }
    }

    // fee model label
    var feeModelLabel;
    if (input.orderMode === 'pickup') {
      feeModelLabel = 'Local pickup — 0% Marketplace fee baseline';
    } else if (input.customFeeOverride) {
      feeModelLabel = 'Custom: ' + input.customFeeRatePct + '% fee, $' + input.customMinimumFee.toFixed(2) + ' minimum';
    } else {
      feeModelLabel = 'Shipped — 10% seller fee, $0.80 minimum';
    }

    // summary
    var lines = [
      'Facebook Marketplace Fee Calculator',
      '====================================',
      'Order mode: ' + input.orderMode,
      'Fee model: ' + feeModelLabel,
      '',
      'Sale price:        $' + salePrice.toFixed(2),
      'Shipping (buyer):  $' + shipping.toFixed(2),
      'Gross collected:   $' + grossCollected.toFixed(2),
      '',
      'Marketplace fee:   $' + marketplaceFee.toFixed(2),
      'Processing fee:    $' + processingFee.toFixed(2),
      'Total fees:        $' + totalFees.toFixed(2),
      '',
      'Seller payout:     $' + sellerPayout.toFixed(2),
      'Effective fee rate: ' + effectiveFeeRatePct.toFixed(2) + '%'
    ];
    if (requiredSalePriceForTargetPayout !== null) {
      lines.push('');
      lines.push('Target payout:     $' + input.targetPayout.toFixed(2));
      lines.push('Required sale price: $' + requiredSalePriceForTargetPayout.toFixed(2));
    }
    var summary = lines.join('\n');

    return {
      error: false,
      grossCollected: grossCollected,
      marketplaceFee: marketplaceFee,
      processingFee: processingFee,
      totalFees: totalFees,
      sellerPayout: sellerPayout,
      effectiveFeeRatePct: effectiveFeeRatePct,
      requiredSalePriceForTargetPayout: requiredSalePriceForTargetPayout,
      feeModelLabel: feeModelLabel,
      summary: summary
    };
  }

  exports.calculate = calculate;
  exports.DEFAULTS = DEFAULTS;

  /* ---------- Browser UI wiring (only when DOM is present) ---------- */
  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () {
      var form = document.getElementById('calculatorForm');
      if (!form) return;

      function getField(id) {
        var el = document.getElementById(id);
        return el ? el : null;
      }

      function setDefaults() {
        var d = DEFAULTS;
        var salePriceEl = getField('salePrice');
        if (salePriceEl) salePriceEl.value = '45';
        var shippingEl = getField('shippingChargedToBuyer');
        if (shippingEl) shippingEl.value = '8';
        var modeEl = getField('orderMode');
        if (modeEl) modeEl.value = 'shipped';
        var customToggle = getField('customFeeOverride');
        if (customToggle) customToggle.checked = false;
        var customRate = getField('customFeeRatePct');
        if (customRate) customRate.value = '10';
        var customMin = getField('customMinimumFee');
        if (customMin) customMin.value = '0.80';
        var procRate = getField('processingRatePct');
        if (procRate) procRate.value = '0';
        var procFlat = getField('processingFlatFee');
        if (procFlat) procFlat.value = '0';
        var targetEl = getField('targetPayout');
        if (targetEl) targetEl.value = '40';
        toggleCustomFields();
        run();
      }

      function toggleCustomFields() {
        var customToggle = getField('customFeeOverride');
        var customGroup = document.getElementById('customFeeGroup');
        if (customGroup && customToggle) {
          customGroup.style.display = customToggle.checked ? 'grid' : 'none';
        }
      }

      function run() {
        var modeEl = getField('orderMode');
        var customToggle = getField('customFeeOverride');

        var input = {
          orderMode: modeEl ? modeEl.value : 'shipped',
          salePrice: parseFloat((getField('salePrice') || {}).value) || 0,
          shippingChargedToBuyer: parseFloat((getField('shippingChargedToBuyer') || {}).value) || 0,
          customFeeOverride: customToggle ? customToggle.checked : false,
          customFeeRatePct: parseFloat((getField('customFeeRatePct') || {}).value) || 10,
          customMinimumFee: parseFloat((getField('customMinimumFee') || {}).value) || 0.80,
          processingRatePct: parseFloat((getField('processingRatePct') || {}).value) || 0,
          processingFlatFee: parseFloat((getField('processingFlatFee') || {}).value) || 0,
          targetPayout: parseFloat((getField('targetPayout') || {}).value) || 0
        };

        var result = calculate(input);
        var errorBox = document.getElementById('errorBox');
        var errorText = document.getElementById('errorText');

        if (result.error) {
          if (errorBox) { errorBox.hidden = false; }
          if (errorText) { errorText.textContent = result.errors.join('; '); }
          // clear outputs
          var ids = ['grossCollected','marketplaceFee','processingFee','totalFees','sellerPayout','effectiveFeeRatePct','requiredSalePrice'];
          ids.forEach(function(id) { var el = document.getElementById(id); if (el) el.textContent = '—'; });
          var sumEl = document.getElementById('summaryText');
          if (sumEl) sumEl.value = '';
          return;
        }

        if (errorBox) { errorBox.hidden = true; }

        function $(id) { return document.getElementById(id); }
        function fmt(n) { return '$' + n.toFixed(2); }

        if ($('grossCollected')) $('grossCollected').textContent = fmt(result.grossCollected);
        if ($('marketplaceFee')) $('marketplaceFee').textContent = fmt(result.marketplaceFee);
        if ($('processingFee')) $('processingFee').textContent = fmt(result.processingFee);
        if ($('totalFees')) $('totalFees').textContent = fmt(result.totalFees);
        if ($('sellerPayout')) $('sellerPayout').textContent = fmt(result.sellerPayout);
        if ($('effectiveFeeRatePct')) $('effectiveFeeRatePct').textContent = result.effectiveFeeRatePct.toFixed(2) + '%';
        if ($('requiredSalePrice')) {
          $('requiredSalePrice').textContent = result.requiredSalePriceForTargetPayout !== null
            ? fmt(result.requiredSalePriceForTargetPayout) : '—';
        }
        if ($('summaryText')) $('summaryText').value = result.summary;
      }

      // event listeners
      form.addEventListener('input', function () {
        toggleCustomFields();
        run();
      });
      form.addEventListener('change', function () {
        toggleCustomFields();
        run();
      });

      var resetBtn = document.getElementById('resetDefaultsBtn');
      if (resetBtn) resetBtn.addEventListener('click', setDefaults);

      var copyBtn = document.getElementById('copySummaryBtn');
      if (copyBtn) {
        copyBtn.addEventListener('click', function () {
          var sumEl = document.getElementById('summaryText');
          if (sumEl && sumEl.value) {
            if (navigator.clipboard && navigator.clipboard.writeText) {
              navigator.clipboard.writeText(sumEl.value).then(function () {
                var st = document.getElementById('copyStatus');
                if (st) { st.textContent = 'Copied!'; setTimeout(function () { st.textContent = ''; }, 2000); }
              });
            } else {
              sumEl.select(); document.execCommand('copy');
              var st2 = document.getElementById('copyStatus');
              if (st2) { st2.textContent = 'Copied!'; setTimeout(function () { st2.textContent = ''; }, 2000); }
            }
          }
        });
      }

      // init
      setDefaults();
    });
  }

})(typeof module !== 'undefined' && module.exports ? module.exports : (window.FBMarketplaceCalc = {}));
