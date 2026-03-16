(function (root) {
  const DEFAULTS = {
    annualGrossWages: 75000,
    numberOfEmployees: 1,
    socialSecurityRate: 6.2,
    socialSecurityWageBase: 176100,
    medicareRate: 1.45,
    additionalMedicareRate: 0.9,
    additionalMedicareThreshold: 200000,
    futaRate: 0.6,
    futaWageBase: 7000,
    sutaRate: 2.7,
    sutaWageBase: 7000
  };

  const TEXT = {
    ko: {
      invalid: "입력값을 확인해주세요.",
      wagesPositive: "연간 총 급여는 0보다 커야 합니다.",
      employeesPositive: "직원 수는 1 이상의 정수여야 합니다.",
      ratesRange: "세율은 0~50 범위여야 합니다.",
      basesNonNeg: "과세 기준 금액은 0 이상이어야 합니다.",
      copied: "요약이 복사되었습니다.",
      copyFail: "클립보드 권한이 없어 수동 복사가 필요합니다.",
      waiting: "결과 계산 대기",
      summaryTitle: "[급여세 계산 요약]",
      na: "N/A"
    },
    en: {
      invalid: "Please review your inputs.",
      wagesPositive: "Annual gross wages must be greater than zero.",
      employeesPositive: "Number of employees must be an integer >= 1.",
      ratesRange: "Tax rates must be between 0 and 50.",
      basesNonNeg: "Wage bases must be zero or above.",
      copied: "Summary copied.",
      copyFail: "Clipboard unavailable. Please copy manually.",
      waiting: "Waiting for calculation",
      summaryTitle: "[Payroll Tax Summary]",
      na: "N/A"
    }
  };

  function round2(value) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  function round4(value) {
    return Math.round((value + Number.EPSILON) * 10000) / 10000;
  }

  function normalizeInput(input) {
    return {
      annualGrossWages: Number(input.annualGrossWages),
      numberOfEmployees: Number(input.numberOfEmployees),
      socialSecurityRate: Number(input.socialSecurityRate),
      socialSecurityWageBase: Number(input.socialSecurityWageBase),
      medicareRate: Number(input.medicareRate),
      additionalMedicareRate: Number(input.additionalMedicareRate),
      additionalMedicareThreshold: Number(input.additionalMedicareThreshold),
      futaRate: Number(input.futaRate),
      futaWageBase: Number(input.futaWageBase),
      sutaRate: Number(input.sutaRate),
      sutaWageBase: Number(input.sutaWageBase)
    };
  }

  function validate(n, lang) {
    var t = TEXT[lang] || TEXT.en;

    if (!Number.isFinite(n.annualGrossWages) || n.annualGrossWages <= 0) {
      return t.wagesPositive;
    }

    if (!Number.isInteger(n.numberOfEmployees) || n.numberOfEmployees < 1) {
      return t.employeesPositive;
    }

    var rates = [
      n.socialSecurityRate, n.medicareRate, n.additionalMedicareRate,
      n.futaRate, n.sutaRate
    ];
    for (var i = 0; i < rates.length; i++) {
      if (!Number.isFinite(rates[i]) || rates[i] < 0 || rates[i] > 50) {
        return t.ratesRange;
      }
    }

    var bases = [
      n.socialSecurityWageBase, n.additionalMedicareThreshold,
      n.futaWageBase, n.sutaWageBase
    ];
    for (var j = 0; j < bases.length; j++) {
      if (!Number.isFinite(bases[j]) || bases[j] < 0) {
        return t.basesNonNeg;
      }
    }

    return "";
  }

  function computePerEmployee(n) {
    var wages = n.annualGrossWages;

    var ssTaxableWages = Math.min(wages, n.socialSecurityWageBase);
    var employeeSS = ssTaxableWages * (n.socialSecurityRate / 100);
    var employerSS = employeeSS;

    var employeeMedicare = wages * (n.medicareRate / 100);
    var employerMedicare = employeeMedicare;

    var additionalMedicareWages = Math.max(0, wages - n.additionalMedicareThreshold);
    var employeeAdditionalMedicare = additionalMedicareWages * (n.additionalMedicareRate / 100);

    var futaTaxableWages = Math.min(wages, n.futaWageBase);
    var futaTax = futaTaxableWages * (n.futaRate / 100);

    var sutaTaxableWages = Math.min(wages, n.sutaWageBase);
    var sutaTax = sutaTaxableWages * (n.sutaRate / 100);

    var totalEmployeeTax = employeeSS + employeeMedicare + employeeAdditionalMedicare;
    var totalEmployerTax = employerSS + employerMedicare + futaTax + sutaTax;
    var totalPayrollTax = totalEmployeeTax + totalEmployerTax;
    var netTakeHome = wages - totalEmployeeTax;
    var effectiveEmployeeRate = wages > 0 ? (totalEmployeeTax / wages) * 100 : 0;
    var effectiveEmployerRate = wages > 0 ? (totalEmployerTax / wages) * 100 : 0;
    var totalCostToEmployer = wages + totalEmployerTax;

    return {
      annualGrossWages: wages,
      employeeSocialSecurity: round2(employeeSS),
      employerSocialSecurity: round2(employerSS),
      employeeMedicare: round2(employeeMedicare),
      employerMedicare: round2(employerMedicare),
      employeeAdditionalMedicare: round2(employeeAdditionalMedicare),
      futaTax: round2(futaTax),
      sutaTax: round2(sutaTax),
      totalEmployeeTax: round2(totalEmployeeTax),
      totalEmployerTax: round2(totalEmployerTax),
      totalPayrollTax: round2(totalPayrollTax),
      netTakeHome: round2(netTakeHome),
      effectiveEmployeeRate: round2(effectiveEmployeeRate),
      effectiveEmployerRate: round2(effectiveEmployerRate),
      totalCostToEmployer: round2(totalCostToEmployer)
    };
  }

  function buildSummary(result, options) {
    var lang = (options && options.lang) || "en";
    var t = TEXT[lang] || TEXT.en;
    var locale = lang === "ko" ? "ko-KR" : "en-US";
    var nf = new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    var pct = new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    var lines = [
      t.summaryTitle,
      (lang === "ko" ? "연간 총 급여" : "Annual gross wages") + ": " + nf.format(result.perEmployee.annualGrossWages),
      (lang === "ko" ? "직원 수" : "Employees") + ": " + result.numberOfEmployees,
      (lang === "ko" ? "직원 부담 세금" : "Employee tax") + ": " + nf.format(result.perEmployee.totalEmployeeTax),
      (lang === "ko" ? "고용주 부담 세금" : "Employer tax") + ": " + nf.format(result.perEmployee.totalEmployerTax),
      (lang === "ko" ? "총 급여세" : "Total payroll tax") + ": " + nf.format(result.perEmployee.totalPayrollTax),
      (lang === "ko" ? "세후 수령액 (소득세 전)" : "Net take-home (pre-income-tax)") + ": " + nf.format(result.perEmployee.netTakeHome),
      (lang === "ko" ? "실효 직원 세율" : "Effective employee rate") + ": " + pct.format(result.perEmployee.effectiveEmployeeRate) + "%",
      (lang === "ko" ? "고용주 총 비용" : "Total cost to employer") + ": " + nf.format(result.perEmployee.totalCostToEmployer)
    ];

    if (result.numberOfEmployees > 1) {
      lines.push("");
      lines.push((lang === "ko" ? "--- 전체 직원 합계 ---" : "--- All Employees Total ---"));
      lines.push((lang === "ko" ? "총 급여세 합계" : "Total payroll tax (all)") + ": " + nf.format(result.annual.totalPayrollTax));
      lines.push((lang === "ko" ? "고용주 총 비용 합계" : "Total employer cost (all)") + ": " + nf.format(result.annual.totalCostToEmployer));
    }

    return lines.join("\n");
  }

  function calculate(input, options) {
    var lang = (options && options.lang) || "en";
    var n = normalizeInput(input);
    var error = validate(n, lang);

    if (error) {
      return { result: null, error: error };
    }

    var perEmployee = computePerEmployee(n);

    var annual = {
      totalEmployeeTax: round2(perEmployee.totalEmployeeTax * n.numberOfEmployees),
      totalEmployerTax: round2(perEmployee.totalEmployerTax * n.numberOfEmployees),
      totalPayrollTax: round2(perEmployee.totalPayrollTax * n.numberOfEmployees),
      totalWages: round2(perEmployee.annualGrossWages * n.numberOfEmployees),
      totalCostToEmployer: round2(perEmployee.totalCostToEmployer * n.numberOfEmployees)
    };

    var result = {
      inputs: n,
      numberOfEmployees: n.numberOfEmployees,
      perEmployee: perEmployee,
      annual: annual
    };

    result.summary = buildSummary(result, { lang: lang });

    return { result: result, error: "" };
  }

  var api = {
    DEFAULTS: DEFAULTS,
    calculate: calculate,
    buildSummary: buildSummary,
    normalizeInput: normalizeInput,
    validate: validate,
    computePerEmployee: computePerEmployee
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  root.PayrollTaxCalculator = api;

  if (typeof document === "undefined") {
    return;
  }

  var I18N = {
    ko: {
      title: "급여세 계산기 | Payroll Tax Calculator",
      subtitle: "미국 급여세(Social Security, Medicare, FUTA, SUTA)를 직원 부담분과 고용주 부담분으로 나누어 계산합니다. 소득세는 별도입니다.",
      back: "← Tools",
      inputHeader: "입력값",
      kpiHeader: "핵심 KPI",
      detailHeader: "세부 내역",
      aboutHeader: "가정 및 해설",
      copy: "요약 복사",
      reset: "기본값 복원",
      aboutCopy: "본 계산기는 2025년 기준 미국 급여세율(Social Security 6.2%, Medicare 1.45%, Additional Medicare 0.9%)을 사용합니다. FUTA 실효세율은 0.6%(주정부 세금 납부 시 5.4% 공제 적용 후), SUTA는 주별 상이하며 기본 2.7%를 사용합니다. 연방/주 소득세 원천징수는 W-4 양식 변수가 필요하므로 본 계산에 포함되지 않습니다.",
      l_annualGrossWages: "연간 총 급여 ($)",
      l_numberOfEmployees: "직원 수",
      l_socialSecurityRate: "Social Security 세율 (%)",
      l_socialSecurityWageBase: "SS 과세 한도 ($)",
      l_medicareRate: "Medicare 세율 (%)",
      l_additionalMedicareRate: "추가 Medicare 세율 (%)",
      l_additionalMedicareThreshold: "추가 Medicare 기준 ($)",
      l_futaRate: "FUTA 세율 (%)",
      l_futaWageBase: "FUTA 과세 한도 ($)",
      l_sutaRate: "SUTA 세율 (%)",
      l_sutaWageBase: "SUTA 과세 한도 ($)",
      k_totalPayrollTax: "총 급여세",
      k_totalEmployeeTax: "직원 부담 세금",
      k_totalEmployerTax: "고용주 부담 세금",
      k_netTakeHome: "세후 수령액",
      k_effectiveEmployeeRate: "실효 직원 세율",
      k_totalCostToEmployer: "고용주 총 비용",
      d_employeeSS: "Social Security (직원)",
      d_employerSS: "Social Security (고용주)",
      d_employeeMedicare: "Medicare (직원)",
      d_employerMedicare: "Medicare (고용주)",
      d_additionalMedicare: "추가 Medicare (직원)",
      d_futa: "FUTA (고용주)",
      d_suta: "SUTA (고용주)",
      statusGood: "직원 실효 세율이 15% 미만입니다.",
      statusWarn: "고소득으로 추가 Medicare세가 적용됩니다.",
      copied: "요약이 복사되었습니다.",
      copyFail: "클립보드 권한이 없어 수동 복사가 필요합니다.",
      waiting: "결과 계산 대기"
    },
    en: {
      title: "Payroll Tax Calculator",
      subtitle: "Calculate US payroll taxes (Social Security, Medicare, FUTA, SUTA) split between employee and employer. Income tax withholding is separate.",
      back: "← Tools",
      inputHeader: "Inputs",
      kpiHeader: "Key KPIs",
      detailHeader: "Detailed Breakdown",
      aboutHeader: "Assumptions & Notes",
      copy: "Copy Summary",
      reset: "Reset Defaults",
      aboutCopy: "This calculator uses 2025 US payroll tax rates: Social Security at 6.2%, Medicare at 1.45%, and Additional Medicare at 0.9% on wages above $200,000. The effective FUTA rate is 0.6% (after the 5.4% state credit) on the first $7,000. SUTA varies by state; the default 2.7% is a common new-employer rate. Federal and state income tax withholding is not included as it depends on W-4 form variables.",
      l_annualGrossWages: "Annual gross wages ($)",
      l_numberOfEmployees: "Number of employees",
      l_socialSecurityRate: "Social Security rate (%)",
      l_socialSecurityWageBase: "SS wage base ($)",
      l_medicareRate: "Medicare rate (%)",
      l_additionalMedicareRate: "Additional Medicare rate (%)",
      l_additionalMedicareThreshold: "Additional Medicare threshold ($)",
      l_futaRate: "FUTA rate (%)",
      l_futaWageBase: "FUTA wage base ($)",
      l_sutaRate: "SUTA rate (%)",
      l_sutaWageBase: "SUTA wage base ($)",
      k_totalPayrollTax: "Total Payroll Tax",
      k_totalEmployeeTax: "Employee Tax Burden",
      k_totalEmployerTax: "Employer Tax Burden",
      k_netTakeHome: "Net Take-Home",
      k_effectiveEmployeeRate: "Effective Employee Rate",
      k_totalCostToEmployer: "Total Cost to Employer",
      d_employeeSS: "Social Security (Employee)",
      d_employerSS: "Social Security (Employer)",
      d_employeeMedicare: "Medicare (Employee)",
      d_employerMedicare: "Medicare (Employer)",
      d_additionalMedicare: "Additional Medicare (Employee)",
      d_futa: "FUTA (Employer)",
      d_suta: "SUTA (Employer)",
      statusGood: "Effective employee tax rate is below 15%.",
      statusWarn: "High income triggers Additional Medicare Tax.",
      copied: "Summary copied.",
      copyFail: "Clipboard unavailable. Please copy manually.",
      waiting: "Waiting for calculation"
    }
  };

  function initBrowser() {
    var $ = function (id) { return document.getElementById(id); };
    var refs = {
      langBtn: $("langBtn"),
      backLink: $("backLink"),
      annualGrossWages: $("annualGrossWages"),
      numberOfEmployees: $("numberOfEmployees"),
      socialSecurityRate: $("socialSecurityRate"),
      socialSecurityWageBase: $("socialSecurityWageBase"),
      medicareRate: $("medicareRate"),
      additionalMedicareRate: $("additionalMedicareRate"),
      additionalMedicareThreshold: $("additionalMedicareThreshold"),
      futaRate: $("futaRate"),
      futaWageBase: $("futaWageBase"),
      sutaRate: $("sutaRate"),
      sutaWageBase: $("sutaWageBase"),
      copy: $("copy"),
      reset: $("reset"),
      summary: $("summary"),
      error: $("error"),
      status: $("status"),
      totalPayrollTax: $("totalPayrollTax"),
      totalEmployeeTax: $("totalEmployeeTax"),
      totalEmployerTax: $("totalEmployerTax"),
      netTakeHome: $("netTakeHome"),
      effectiveEmployeeRate: $("effectiveEmployeeRate"),
      totalCostToEmployer: $("totalCostToEmployer"),
      employeeSS: $("employeeSS"),
      employerSS: $("employerSS"),
      employeeMedicare: $("employeeMedicare"),
      employerMedicare: $("employerMedicare"),
      additionalMedicare: $("additionalMedicare"),
      futa: $("futa"),
      suta: $("suta")
    };

    if (!refs.langBtn) return;

    var lang = "ko";

    var labelIds = [
      "title", "subtitle", "inputHeader", "kpiHeader", "detailHeader",
      "aboutHeader", "aboutCopy", "copy", "reset", "backLink"
    ];

    var fieldIds = [
      "annualGrossWages", "numberOfEmployees", "socialSecurityRate",
      "socialSecurityWageBase", "medicareRate", "additionalMedicareRate",
      "additionalMedicareThreshold", "futaRate", "futaWageBase", "sutaRate", "sutaWageBase"
    ];

    var kpiIds = [
      "totalPayrollTax", "totalEmployeeTax", "totalEmployerTax",
      "netTakeHome", "effectiveEmployeeRate", "totalCostToEmployer"
    ];

    var detailIds = [
      "employeeSS", "employerSS", "employeeMedicare", "employerMedicare",
      "additionalMedicare", "futa", "suta"
    ];

    function t(key) {
      return I18N[lang][key] || key;
    }

    function applyLabels() {
      document.documentElement.lang = lang;
      labelIds.forEach(function (id) {
        var node = $(id);
        if (!node) return;
        if (id === "backLink") {
          node.textContent = t("back");
        } else {
          node.textContent = t(id);
        }
      });
      fieldIds.forEach(function (id) {
        var label = $("l_" + id);
        if (label) label.textContent = t("l_" + id);
      });
      kpiIds.forEach(function (id) {
        var label = $("k_" + id);
        if (label) label.textContent = t("k_" + id);
      });
      detailIds.forEach(function (id) {
        var label = $("d_" + id);
        if (label) label.textContent = t("d_" + id);
      });
      refs.langBtn.textContent = lang === "ko" ? "EN" : "KO";
    }

    function money(value) {
      var locale = lang === "en" ? "en-US" : "ko-KR";
      return new Intl.NumberFormat(locale, { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number.isFinite(value) ? value : 0);
    }

    function percent(value) {
      var locale = lang === "en" ? "en-US" : "ko-KR";
      return new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number.isFinite(value) ? value : 0) + "%";
    }

    function setEmpty() {
      kpiIds.forEach(function (k) { refs[k].textContent = "-"; });
      detailIds.forEach(function (k) { refs[k].textContent = "-"; });
      refs.summary.value = "";
    }

    function readValues() {
      return {
        annualGrossWages: Number(refs.annualGrossWages.value),
        numberOfEmployees: Number(refs.numberOfEmployees.value),
        socialSecurityRate: Number(refs.socialSecurityRate.value),
        socialSecurityWageBase: Number(refs.socialSecurityWageBase.value),
        medicareRate: Number(refs.medicareRate.value),
        additionalMedicareRate: Number(refs.additionalMedicareRate.value),
        additionalMedicareThreshold: Number(refs.additionalMedicareThreshold.value),
        futaRate: Number(refs.futaRate.value),
        futaWageBase: Number(refs.futaWageBase.value),
        sutaRate: Number(refs.sutaRate.value),
        sutaWageBase: Number(refs.sutaWageBase.value)
      };
    }

    function render() {
      var payload = readValues();
      var out = calculate(payload, { lang: lang });

      refs.error.classList.toggle("show", Boolean(out.error));
      refs.error.textContent = out.error;

      if (out.error) {
        refs.status.textContent = t("waiting");
        setEmpty();
        return;
      }

      var r = out.result.perEmployee;
      refs.totalPayrollTax.textContent = money(r.totalPayrollTax);
      refs.totalEmployeeTax.textContent = money(r.totalEmployeeTax);
      refs.totalEmployerTax.textContent = money(r.totalEmployerTax);
      refs.netTakeHome.textContent = money(r.netTakeHome);
      refs.effectiveEmployeeRate.textContent = percent(r.effectiveEmployeeRate);
      refs.totalCostToEmployer.textContent = money(r.totalCostToEmployer);

      refs.employeeSS.textContent = money(r.employeeSocialSecurity);
      refs.employerSS.textContent = money(r.employerSocialSecurity);
      refs.employeeMedicare.textContent = money(r.employeeMedicare);
      refs.employerMedicare.textContent = money(r.employerMedicare);
      refs.additionalMedicare.textContent = money(r.employeeAdditionalMedicare);
      refs.futa.textContent = money(r.futaTax);
      refs.suta.textContent = money(r.sutaTax);

      refs.summary.value = out.result.summary;

      var hasAdditionalMedicare = r.employeeAdditionalMedicare > 0;
      refs.status.innerHTML = hasAdditionalMedicare
        ? '<span class="warn">&#9679;</span> ' + t("statusWarn")
        : '<span class="good">&#9679;</span> ' + t("statusGood");
    }

    refs.langBtn.addEventListener("click", function () {
      lang = lang === "ko" ? "en" : "ko";
      applyLabels();
      render();
    });

    fieldIds.forEach(function (id) {
      var el = refs[id];
      if (el) {
        el.addEventListener("input", render);
        el.addEventListener("change", render);
      }
    });

    refs.copy.addEventListener("click", function () {
      if (!refs.summary.value.trim()) return;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(refs.summary.value).then(function () {
          alert(t("copied"));
        }).catch(function () {
          alert(t("copyFail"));
        });
      } else {
        alert(t("copyFail"));
      }
    });

    refs.reset.addEventListener("click", function () {
      refs.annualGrossWages.value = DEFAULTS.annualGrossWages;
      refs.numberOfEmployees.value = DEFAULTS.numberOfEmployees;
      refs.socialSecurityRate.value = DEFAULTS.socialSecurityRate;
      refs.socialSecurityWageBase.value = DEFAULTS.socialSecurityWageBase;
      refs.medicareRate.value = DEFAULTS.medicareRate;
      refs.additionalMedicareRate.value = DEFAULTS.additionalMedicareRate;
      refs.additionalMedicareThreshold.value = DEFAULTS.additionalMedicareThreshold;
      refs.futaRate.value = DEFAULTS.futaRate;
      refs.futaWageBase.value = DEFAULTS.futaWageBase;
      refs.sutaRate.value = DEFAULTS.sutaRate;
      refs.sutaWageBase.value = DEFAULTS.sutaWageBase;
      render();
    });

    applyLabels();
    render();
  }

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initBrowser, { once: true });
    } else {
      initBrowser();
    }
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
