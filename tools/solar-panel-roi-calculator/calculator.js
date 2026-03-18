/* Solar Panel ROI Calculator — calculator.js */

/* ── Core Calculation (pure, no DOM) ────────────────────── */
function solarCalculate(p) {
  var systemSizeW = p.systemSizeKw * 1000;
  var totalCost = systemSizeW * p.costPerWatt;
  var federalCredit = totalCost * (p.federalTaxCredit / 100);
  var netCost = totalCost - federalCredit - p.stateIncentive;
  if (netCost < 0) netCost = 0;

  var year1Production = p.systemSizeKw * p.sunHoursPerDay * 365;

  var monthlyPayment = 0;
  var totalInterest = 0;
  var hasLoan = p.loanInterestRate > 0 && p.loanTermYears > 0;
  if (hasLoan) {
    var r = p.loanInterestRate / 100 / 12;
    var n = p.loanTermYears * 12;
    monthlyPayment = netCost * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    totalInterest = monthlyPayment * n - netCost;
  }
  var totalFinancedCost = hasLoan ? netCost + totalInterest : netCost;

  var yearly = [];
  var cumSavings = 0;
  var paybackYear = null;
  var currentRate = p.electricityRate;

  for (var y = 1; y <= p.lifespanYears; y++) {
    var degradationFactor = Math.pow(1 - p.degradationRate / 100, y - 1);
    var production = year1Production * degradationFactor;
    var savings = production * currentRate;

    var annualBill = p.monthlyBill * 12 * Math.pow(1 + p.annualRateIncrease / 100, y - 1);
    if (savings > annualBill) savings = annualBill;

    cumSavings += savings;

    if (paybackYear === null && cumSavings >= totalFinancedCost) {
      paybackYear = y;
    }

    yearly.push({
      year: y,
      production: Math.round(production),
      rate: currentRate,
      savings: Math.round(savings),
      cumulative: Math.round(cumSavings)
    });

    currentRate *= (1 + p.annualRateIncrease / 100);
  }

  var year1Savings = yearly.length > 0 ? yearly[0].savings : 0;
  var totalSavings = cumSavings;
  var netSavings = totalSavings - totalFinancedCost;
  var roi = totalFinancedCost > 0 ? (netSavings / totalFinancedCost) * 100 : 0;

  return {
    totalCost: totalCost,
    federalCredit: federalCredit,
    netCost: netCost,
    year1Production: year1Production,
    year1Savings: year1Savings,
    paybackYear: paybackYear,
    totalSavings: totalSavings,
    netSavings: netSavings,
    roi: roi,
    monthlyPayment: monthlyPayment,
    totalInterest: totalInterest,
    hasLoan: hasLoan,
    totalFinancedCost: totalFinancedCost,
    yearly: yearly
  };
}

/* ── Export for Node.js tests ───────────────────────────── */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { calculate: solarCalculate };
}

/* ── Browser UI (only runs in DOM context) ──────────────── */
if (typeof document !== 'undefined') {
(function () {
  'use strict';

  var calculate = solarCalculate;

  /* ── i18n ─────────────────────────────────────────────── */
  const T = {
    ko: {
      title: '☀️ 태양광 패널 투자수익률 계산기',
      subtitle: '시스템 규모, 전기요금, 연방/지방 세액공제, 대출 조건, 패널 성능저하율을 반영하여 태양광 패널 투자 회수 기간과 25년 누적 절감액 및 ROI를 계산합니다.',
      back: '포털로 돌아가기',
      inputs_heading: '입력값',
      sec_system: '☀️ 시스템',
      sec_electricity: '⚡ 전기요금',
      sec_incentives: '💰 인센티브',
      sec_financing: '🏦 대출',
      systemSizeKw: '시스템 규모 (kW)',
      costPerWatt: '와트당 비용 ($)',
      sunHoursPerDay: '일일 일조 시간',
      degradationRate: '연간 성능저하 (%)',
      lifespanYears: '시스템 수명 (년)',
      monthlyBill: '월 전기요금 ($)',
      electricityRate: '전기 단가 ($/kWh)',
      annualRateIncrease: '연간 요금 인상 (%)',
      federalTaxCredit: '연방 세액공제 (%)',
      stateIncentive: '지방/주 인센티브 ($)',
      loanInterestRate: '대출 이자율 (%, 0=현금)',
      loanTermYears: '대출 기간 (년, 0=현금)',
      copy: '요약 복사',
      reset: '기본값 복원',
      note: '이 계산기는 추정치이며, 실제 태양광 견적을 대체하지 않습니다. 지역 일조량, 지붕 방향, 그늘 등에 따라 결과가 달라질 수 있습니다.',
      kpi_heading: '핵심 KPI',
      k_totalCost: '총 시스템 비용',
      k_netCost: '세액공제 후 순비용',
      k_year1Production: '연간 발전량 (Year 1)',
      k_year1Savings: '1년차 절감액',
      k_paybackPeriod: '투자 회수 기간',
      k_totalSavings: '총 누적 절감액',
      k_netSavings: '순 이익 (절감 - 비용)',
      k_roi: '투자수익률 (ROI)',
      k_monthlyPayment: '월 대출 상환액',
      k_totalInterest: '총 이자 비용',
      waiting: '결과 계산 대기',
      profitable: '✅ 투자 회수 완료 — 수익 구간 진입',
      notYetProfitable: '⚠️ 수명 내 회수 불가 — 조건 재검토 권장',
      yearly_heading: '연도별 상세',
      th_year: '년도',
      th_production: '발전량 (kWh)',
      th_rate: '단가 ($/kWh)',
      th_savings: '절감액 ($)',
      th_cumulative: '누적 절감 ($)',
      err_positive: '시스템 규모, 비용, 전기요금은 양수여야 합니다.',
      copied: '✅ 복사 완료',
      copy_fail: '❌ 복사 실패'
    },
    en: {
      title: '☀️ Solar Panel ROI Calculator',
      subtitle: 'Calculate solar panel payback period, 25-year savings, and ROI factoring in federal/state tax credits, financing, and panel degradation.',
      back: 'Back to Portal',
      inputs_heading: 'Inputs',
      sec_system: '☀️ SYSTEM',
      sec_electricity: '⚡ ELECTRICITY',
      sec_incentives: '💰 INCENTIVES',
      sec_financing: '🏦 FINANCING',
      systemSizeKw: 'System Size (kW)',
      costPerWatt: 'Cost per Watt ($)',
      sunHoursPerDay: 'Sun Hours per Day',
      degradationRate: 'Annual Degradation (%)',
      lifespanYears: 'System Lifespan (yrs)',
      monthlyBill: 'Monthly Electricity Bill ($)',
      electricityRate: 'Electricity Rate ($/kWh)',
      annualRateIncrease: 'Annual Rate Increase (%)',
      federalTaxCredit: 'Federal Tax Credit (%)',
      stateIncentive: 'State/Local Incentive ($)',
      loanInterestRate: 'Loan Interest (%, 0=cash)',
      loanTermYears: 'Loan Term (yrs, 0=cash)',
      copy: 'Copy Summary',
      reset: 'Reset Defaults',
      note: 'This calculator provides estimates only and does not replace a professional solar quote. Results vary based on location, roof orientation, shading, and other factors.',
      kpi_heading: 'Key KPIs',
      k_totalCost: 'Total System Cost',
      k_netCost: 'Net Cost (after credits)',
      k_year1Production: 'Year 1 Production',
      k_year1Savings: 'Year 1 Savings',
      k_paybackPeriod: 'Payback Period',
      k_totalSavings: 'Total Cumulative Savings',
      k_netSavings: 'Net Profit (savings − cost)',
      k_roi: 'Return on Investment',
      k_monthlyPayment: 'Monthly Loan Payment',
      k_totalInterest: 'Total Interest Paid',
      waiting: 'Waiting for calculation',
      profitable: '✅ Investment recovered — profit zone',
      notYetProfitable: '⚠️ Not recovered within lifespan — review inputs',
      yearly_heading: 'Yearly Breakdown',
      th_year: 'Year',
      th_production: 'Production (kWh)',
      th_rate: 'Rate ($/kWh)',
      th_savings: 'Savings ($)',
      th_cumulative: 'Cumulative ($)',
      err_positive: 'System size, cost, and electricity rate must be positive.',
      copied: '✅ Copied',
      copy_fail: '❌ Copy failed'
    }
  };

  let lang = 'ko';
  function applyLang() {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (T[lang][key] !== undefined) el.textContent = T[lang][key];
    });
    document.getElementById('lang').textContent = lang === 'ko' ? 'EN' : 'KO';
    document.documentElement.lang = lang;
  }

  document.getElementById('lang').addEventListener('click', function () {
    lang = lang === 'ko' ? 'en' : 'ko';
    applyLang();
    calc();
  });

  /* ── Defaults ─────────────────────────────────────────── */
  var DEFAULTS = {
    systemSizeKw: 6, costPerWatt: 2.80, sunHoursPerDay: 5,
    degradationRate: 0.5, lifespanYears: 25, monthlyBill: 150,
    electricityRate: 0.15, annualRateIncrease: 3,
    federalTaxCredit: 30, stateIncentive: 0,
    loanInterestRate: 0, loanTermYears: 0
  };

  var IDS = Object.keys(DEFAULTS);

  function $(id) { return document.getElementById(id); }
  function v(id) { return parseFloat($(id).value) || 0; }
  function fmt(n) { return n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }); }
  function fmtD(n, d) { return n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }); }

  /* ── DOM Update ───────────────────────────────────────── */
  function calc() {
    var errEl = $('error');
    errEl.classList.remove('show');

    var p = {
      systemSizeKw: v('systemSizeKw'),
      costPerWatt: v('costPerWatt'),
      sunHoursPerDay: v('sunHoursPerDay'),
      degradationRate: v('degradationRate'),
      lifespanYears: Math.max(1, Math.round(v('lifespanYears'))),
      monthlyBill: v('monthlyBill'),
      electricityRate: v('electricityRate'),
      annualRateIncrease: v('annualRateIncrease'),
      federalTaxCredit: v('federalTaxCredit'),
      stateIncentive: v('stateIncentive'),
      loanInterestRate: v('loanInterestRate'),
      loanTermYears: Math.round(v('loanTermYears'))
    };

    if (p.systemSizeKw <= 0 || p.costPerWatt <= 0 || p.electricityRate <= 0) {
      errEl.textContent = T[lang].err_positive;
      errEl.classList.add('show');
      return;
    }

    var r = calculate(p);

    $('totalCost').textContent = '$' + fmt(r.totalCost);
    $('netCost').textContent = '$' + fmt(r.netCost);
    $('year1Production').textContent = fmt(Math.round(r.year1Production)) + ' kWh';
    $('year1Savings').textContent = '$' + fmt(r.year1Savings);
    $('paybackPeriod').textContent = r.paybackYear !== null
      ? r.paybackYear + (lang === 'ko' ? '년' : ' yrs')
      : (lang === 'ko' ? '수명 초과' : '> lifespan');
    $('totalSavings').textContent = '$' + fmt(Math.round(r.totalSavings));
    $('netSavings').textContent = '$' + fmt(Math.round(r.netSavings));
    $('roi').textContent = fmtD(r.roi, 1) + '%';

    // Loan display
    var loanRow = $('loanPaymentRow');
    if (r.hasLoan) {
      loanRow.style.display = '';
      $('monthlyPayment').textContent = '$' + fmtD(r.monthlyPayment, 2);
      $('totalInterest').textContent = '$' + fmt(Math.round(r.totalInterest));
    } else {
      loanRow.style.display = 'none';
    }

    // Status pill
    var statusEl = $('status');
    if (r.paybackYear !== null) {
      statusEl.textContent = T[lang].profitable;
      statusEl.className = 'pill ok';
    } else {
      statusEl.textContent = T[lang].notYetProfitable;
      statusEl.className = 'pill warn';
    }

    // Yearly table
    var tbody = $('yearlyBody');
    tbody.innerHTML = '';
    r.yearly.forEach(function (row) {
      var tr = document.createElement('tr');
      tr.innerHTML = '<td>' + row.year + '</td>' +
        '<td>' + fmt(row.production) + '</td>' +
        '<td>' + fmtD(row.rate, 3) + '</td>' +
        '<td>' + fmt(row.savings) + '</td>' +
        '<td>' + fmt(row.cumulative) + '</td>';
      if (r.paybackYear !== null && row.year === r.paybackYear) {
        tr.style.background = 'rgba(52,211,153,.12)';
      }
      tbody.appendChild(tr);
    });

    // Summary
    var lines = [
      '═══ Solar Panel ROI ═══',
      'System: ' + p.systemSizeKw + ' kW @ $' + p.costPerWatt + '/W',
      'Total Cost: $' + fmt(r.totalCost),
      'Federal Credit (' + p.federalTaxCredit + '%): -$' + fmt(r.federalCredit),
      'State Incentive: -$' + fmt(p.stateIncentive),
      'Net Cost: $' + fmt(r.netCost),
      '',
      'Year 1 Production: ' + fmt(Math.round(r.year1Production)) + ' kWh',
      'Year 1 Savings: $' + fmt(r.year1Savings),
      'Payback Period: ' + (r.paybackYear !== null ? r.paybackYear + ' years' : '> lifespan'),
      p.lifespanYears + '-Year Savings: $' + fmt(Math.round(r.totalSavings)),
      'Net Profit: $' + fmt(Math.round(r.netSavings)),
      'ROI: ' + fmtD(r.roi, 1) + '%'
    ];
    if (r.hasLoan) {
      lines.push('', 'Monthly Payment: $' + fmtD(r.monthlyPayment, 2));
      lines.push('Total Interest: $' + fmt(Math.round(r.totalInterest)));
    }
    $('summary').value = lines.join('\n');
  }

  /* ── Event Listeners ──────────────────────────────────── */
  IDS.forEach(function (id) {
    $(id).addEventListener('input', calc);
  });

  $('copy').addEventListener('click', function () {
    var text = $('summary').value;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        $('copy').textContent = T[lang].copied;
        setTimeout(function () { $('copy').textContent = T[lang].copy; }, 1500);
      }).catch(function () {
        $('copy').textContent = T[lang].copy_fail;
      });
    } else {
      $('summary').select();
      document.execCommand('copy');
      $('copy').textContent = T[lang].copied;
      setTimeout(function () { $('copy').textContent = T[lang].copy; }, 1500);
    }
  });

  $('reset').addEventListener('click', function () {
    IDS.forEach(function (id) { $(id).value = DEFAULTS[id]; });
    calc();
  });

  /* ── Init ─────────────────────────────────────────────── */
  applyLang();
  calc();

})();
} /* end if (typeof document !== 'undefined') */
