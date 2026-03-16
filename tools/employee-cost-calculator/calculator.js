(function (root) {
  const TEXT = {
    ko: {
      invalid: "입력값을 확인해주세요.",
      salary: "연봉은 0보다 커야 합니다.",
      hours: "주당 근무시간은 1~168 범위여야 합니다.",
      weeks: "연간 유급 주 수는 1~52 범위여야 합니다.",
      rate: "비율 값은 0~100 범위여야 합니다.",
      money: "금액 입력값은 0 이상이어야 합니다.",
      pto: "유급휴가 일수는 0 이상이어야 합니다.",
      ptoExceed: "유급휴가 일수가 연간 근무일수를 초과합니다.",
      copied: "요약이 복사되었습니다.",
      copyFail: "클립보드 권한이 없어 수동 복사가 필요합니다.",
      waiting: "결과 계산 대기",
      summaryTitle: "[직원 총비용 요약]",
      na: "N/A"
    },
    en: {
      invalid: "Please review your inputs.",
      salary: "Annual salary must be greater than zero.",
      hours: "Working hours per week must be between 1 and 168.",
      weeks: "Paid weeks per year must be between 1 and 52.",
      rate: "Rate values must be between 0 and 100.",
      money: "All money fields must be zero or above.",
      pto: "PTO days must be zero or above.",
      ptoExceed: "PTO days exceed total working days in the year.",
      copied: "Summary copied.",
      copyFail: "Clipboard unavailable. Please copy manually.",
      waiting: "Waiting for calculation",
      summaryTitle: "[Employee Total Cost Summary]",
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
      annualSalary: Number(input.annualSalary),
      workingHoursPerWeek: Number(input.workingHoursPerWeek),
      paidWeeksPerYear: Number(input.paidWeeksPerYear),
      paidTimeOffDays: Number(input.paidTimeOffDays),
      socialSecurityRate: Number(input.socialSecurityRate),
      socialSecurityWageCap: Number(input.socialSecurityWageCap),
      medicareRate: Number(input.medicareRate),
      futaRate: Number(input.futaRate),
      futaWageCap: Number(input.futaWageCap),
      sutaRate: Number(input.sutaRate),
      sutaWageCap: Number(input.sutaWageCap),
      healthInsurance: Number(input.healthInsurance),
      dentalVision: Number(input.dentalVision),
      retirementMatchRate: Number(input.retirementMatchRate),
      workersCompRate: Number(input.workersCompRate),
      equipmentCost: Number(input.equipmentCost),
      officeCost: Number(input.officeCost),
      trainingCost: Number(input.trainingCost),
      otherOverhead: Number(input.otherOverhead)
    };
  }

  function validate(n, lang) {
    var t = TEXT[lang] || TEXT.en;

    if (!Number.isFinite(n.annualSalary) || n.annualSalary <= 0) {
      return t.salary;
    }
    if (!Number.isFinite(n.workingHoursPerWeek) || n.workingHoursPerWeek < 1 || n.workingHoursPerWeek > 168) {
      return t.hours;
    }
    if (!Number.isFinite(n.paidWeeksPerYear) || n.paidWeeksPerYear < 1 || n.paidWeeksPerYear > 52) {
      return t.weeks;
    }

    var rates = [
      n.socialSecurityRate, n.medicareRate, n.futaRate,
      n.sutaRate, n.retirementMatchRate, n.workersCompRate
    ];
    for (var i = 0; i < rates.length; i++) {
      if (!Number.isFinite(rates[i]) || rates[i] < 0 || rates[i] > 100) {
        return t.rate;
      }
    }

    var moneys = [
      n.socialSecurityWageCap, n.futaWageCap, n.sutaWageCap,
      n.healthInsurance, n.dentalVision, n.equipmentCost,
      n.officeCost, n.trainingCost, n.otherOverhead
    ];
    for (var j = 0; j < moneys.length; j++) {
      if (!Number.isFinite(moneys[j]) || moneys[j] < 0) {
        return t.money;
      }
    }

    if (!Number.isFinite(n.paidTimeOffDays) || n.paidTimeOffDays < 0) {
      return t.pto;
    }

    var workingDaysPerYear = n.paidWeeksPerYear * 5;
    if (n.paidTimeOffDays > workingDaysPerYear) {
      return t.ptoExceed;
    }

    return "";
  }

  function calculate(input, options) {
    var lang = (options && options.lang) || "en";
    var n = normalizeInput(input);
    var error = validate(n, lang);

    if (error) {
      return { result: null, error: error };
    }

    var salary = n.annualSalary;

    // Payroll taxes
    var socialSecurityTax = Math.min(salary, n.socialSecurityWageCap) * (n.socialSecurityRate / 100);
    var medicareTax = salary * (n.medicareRate / 100);
    var futaTax = Math.min(salary, n.futaWageCap) * (n.futaRate / 100);
    var sutaTax = Math.min(salary, n.sutaWageCap) * (n.sutaRate / 100);
    var payrollTaxTotal = socialSecurityTax + medicareTax + futaTax + sutaTax;

    // Benefits
    var retirementMatch = salary * (n.retirementMatchRate / 100);
    var workersComp = salary * (n.workersCompRate / 100);
    var benefitsTotal = n.healthInsurance + n.dentalVision + retirementMatch + workersComp;

    // Overhead
    var overheadTotal = n.equipmentCost + n.officeCost + n.trainingCost + n.otherOverhead;

    // Totals
    var totalAnnualCost = salary + payrollTaxTotal + benefitsTotal + overheadTotal;
    var monthlyCost = totalAnnualCost / 12;

    // Productive hours
    var hoursPerDay = n.workingHoursPerWeek / 5;
    var totalAnnualHours = n.paidWeeksPerYear * n.workingHoursPerWeek;
    var ptoHours = n.paidTimeOffDays * hoursPerDay;
    var productiveHours = totalAnnualHours - ptoHours;
    var effectiveHourlyCost = productiveHours > 0 ? totalAnnualCost / productiveHours : 0;

    // Multiplier
    var overheadMultiplier = totalAnnualCost / salary;

    // PTO imputed cost (salary portion allocated to PTO)
    var dailySalary = salary / (n.paidWeeksPerYear * 5);
    var ptoCost = n.paidTimeOffDays * dailySalary;

    var result = {
      inputs: n,
      socialSecurityTax: round2(socialSecurityTax),
      medicareTax: round2(medicareTax),
      futaTax: round2(futaTax),
      sutaTax: round2(sutaTax),
      payrollTaxTotal: round2(payrollTaxTotal),
      retirementMatch: round2(retirementMatch),
      workersComp: round2(workersComp),
      healthInsurance: round2(n.healthInsurance),
      dentalVision: round2(n.dentalVision),
      benefitsTotal: round2(benefitsTotal),
      equipmentCost: round2(n.equipmentCost),
      officeCost: round2(n.officeCost),
      trainingCost: round2(n.trainingCost),
      otherOverhead: round2(n.otherOverhead),
      overheadTotal: round2(overheadTotal),
      totalAnnualCost: round2(totalAnnualCost),
      monthlyCost: round2(monthlyCost),
      productiveHours: round2(productiveHours),
      effectiveHourlyCost: round2(effectiveHourlyCost),
      overheadMultiplier: round4(overheadMultiplier),
      overheadMultiplierPct: round2((overheadMultiplier - 1) * 100),
      ptoCost: round2(ptoCost),
      salaryPct: round2((salary / totalAnnualCost) * 100),
      taxPct: round2((payrollTaxTotal / totalAnnualCost) * 100),
      benefitsPct: round2((benefitsTotal / totalAnnualCost) * 100),
      overheadPct: round2((overheadTotal / totalAnnualCost) * 100)
    };

    result.summary = buildSummary(result, { lang: lang });

    return { result: result, error: "" };
  }

  function buildSummary(result, options) {
    var lang = (options && options.lang) || "en";
    var t = TEXT[lang] || TEXT.en;
    var locale = lang === "en" ? "en-US" : "ko-KR";
    var nf = new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    var lines = [
      t.summaryTitle,
      (lang === "en" ? "Annual salary" : "연봉") + ": " + nf.format(result.inputs.annualSalary),
      (lang === "en" ? "Total annual cost" : "연간 총비용") + ": " + nf.format(result.totalAnnualCost),
      (lang === "en" ? "Monthly cost" : "월 비용") + ": " + nf.format(result.monthlyCost),
      (lang === "en" ? "Effective hourly cost" : "실효 시급") + ": " + nf.format(result.effectiveHourlyCost),
      (lang === "en" ? "Overhead multiplier" : "오버헤드 배율") + ": " + result.overheadMultiplier.toFixed(2) + "x",
      (lang === "en" ? "Payroll taxes" : "급여세 합계") + ": " + nf.format(result.payrollTaxTotal),
      (lang === "en" ? "Benefits total" : "복리후생 합계") + ": " + nf.format(result.benefitsTotal)
    ];

    return lines.join("\n");
  }

  var api = {
    calculate: calculate,
    buildSummary: buildSummary,
    normalizeInput: normalizeInput,
    validate: validate
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  root.EmployeeCostCalculator = api;

  if (typeof document === "undefined") {
    return;
  }

  var I18N = {
    ko: {
      title: "👤 직원 총비용 계산기",
      subtitle: "연봉 외에 사회보험료, 복리후생, 장비, 사무실 비용 등을 포함한 직원 1인당 실제 총비용을 계산합니다.",
      back: "← Tools",
      inputHeader: "입력값",
      kpiHeader: "핵심 KPI",
      detailHeader: "세부 내역",
      aboutHeader: "가정 및 해설",
      copy: "요약 복사",
      reset: "기본값 복원",
      aboutCopy: "미국 기준 기본값: Social Security 6.2%(임금 상한 $168,600), Medicare 1.45%, FUTA 0.6%($7,000 상한), SUTA 2.7%($7,000 상한). 실제 세율은 주(州)와 상황에 따라 다릅니다. 복리후생과 간접비는 회사마다 크게 다르므로 실제 값을 입력하세요.",
      l_annualSalary: "연봉",
      l_workingHoursPerWeek: "주당 근무시간",
      l_paidWeeksPerYear: "연간 유급 주 수",
      l_paidTimeOffDays: "유급휴가 (일)",
      l_socialSecurityRate: "Social Security %",
      l_socialSecurityWageCap: "SS 임금 상한",
      l_medicareRate: "Medicare %",
      l_futaRate: "FUTA %",
      l_futaWageCap: "FUTA 임금 상한",
      l_sutaRate: "SUTA %",
      l_sutaWageCap: "SUTA 임금 상한",
      l_healthInsurance: "건강보험 (연간)",
      l_dentalVision: "치과/안과 (연간)",
      l_retirementMatchRate: "퇴직연금 매칭 %",
      l_workersCompRate: "산재보험 %",
      l_equipmentCost: "장비 비용 (연간)",
      l_officeCost: "사무실 비용 (연간)",
      l_trainingCost: "교육 비용 (연간)",
      l_otherOverhead: "기타 간접비 (연간)",
      k_totalAnnualCost: "연간 총비용",
      k_monthlyCost: "월 비용",
      k_effectiveHourlyCost: "실효 시급",
      k_overheadMultiplier: "오버헤드 배율",
      k_payrollTaxTotal: "급여세 합계",
      k_benefitsTotal: "복리후생 합계",
      d_socialSecurityTax: "Social Security",
      d_medicareTax: "Medicare",
      d_futaTax: "FUTA",
      d_sutaTax: "SUTA",
      d_healthInsurance: "건강보험",
      d_dentalVision: "치과/안과",
      d_retirementMatch: "퇴직연금 매칭",
      d_workersComp: "산재보험",
      d_equipmentCost: "장비",
      d_officeCost: "사무실",
      d_trainingCost: "교육",
      d_otherOverhead: "기타 간접비",
      d_productiveHours: "연간 실근무 시간",
      d_ptoCost: "유급휴가 비용 (귀속)",
      copied: TEXT.ko.copied,
      copyFail: TEXT.ko.copyFail,
      waiting: TEXT.ko.waiting,
      invalid: TEXT.ko.invalid,
      na: TEXT.ko.na
    },
    en: {
      title: "👤 Employee Cost Calculator",
      subtitle: "Calculate the true total cost of an employee including base salary, payroll taxes, benefits, equipment, office space, and other overhead.",
      back: "← Tools",
      inputHeader: "Inputs",
      kpiHeader: "Key KPIs",
      detailHeader: "Detail breakdown",
      aboutHeader: "Assumptions & notes",
      copy: "Copy Summary",
      reset: "Reset Defaults",
      aboutCopy: "US defaults: Social Security 6.2% (wage cap $168,600), Medicare 1.45%, FUTA 0.6% ($7,000 cap), SUTA 2.7% ($7,000 cap). Actual rates vary by state and situation. Benefits and overhead vary widely by company -- enter your actual values for the most accurate estimate.",
      l_annualSalary: "Annual salary",
      l_workingHoursPerWeek: "Working hours / week",
      l_paidWeeksPerYear: "Paid weeks / year",
      l_paidTimeOffDays: "Paid time off (days)",
      l_socialSecurityRate: "Social Security %",
      l_socialSecurityWageCap: "SS wage cap",
      l_medicareRate: "Medicare %",
      l_futaRate: "FUTA %",
      l_futaWageCap: "FUTA wage cap",
      l_sutaRate: "SUTA %",
      l_sutaWageCap: "SUTA wage cap",
      l_healthInsurance: "Health insurance (annual)",
      l_dentalVision: "Dental / vision (annual)",
      l_retirementMatchRate: "Retirement match %",
      l_workersCompRate: "Workers' comp %",
      l_equipmentCost: "Equipment (annual)",
      l_officeCost: "Office space (annual)",
      l_trainingCost: "Training (annual)",
      l_otherOverhead: "Other overhead (annual)",
      k_totalAnnualCost: "Total annual cost",
      k_monthlyCost: "Monthly cost",
      k_effectiveHourlyCost: "Effective hourly cost",
      k_overheadMultiplier: "Overhead multiplier",
      k_payrollTaxTotal: "Payroll tax total",
      k_benefitsTotal: "Benefits total",
      d_socialSecurityTax: "Social Security",
      d_medicareTax: "Medicare",
      d_futaTax: "FUTA",
      d_sutaTax: "SUTA",
      d_healthInsurance: "Health insurance",
      d_dentalVision: "Dental / vision",
      d_retirementMatch: "Retirement match",
      d_workersComp: "Workers' comp",
      d_equipmentCost: "Equipment",
      d_officeCost: "Office space",
      d_trainingCost: "Training",
      d_otherOverhead: "Other overhead",
      d_productiveHours: "Productive hours / year",
      d_ptoCost: "PTO cost (imputed)",
      copied: TEXT.en.copied,
      copyFail: TEXT.en.copyFail,
      waiting: TEXT.en.waiting,
      invalid: TEXT.en.invalid,
      na: TEXT.en.na
    }
  };

  function initBrowser() {
    var $ = function (id) { return document.getElementById(id); };
    var refs = {
      langBtn: $("langBtn"),
      backLink: $("backLink"),
      copy: $("copy"),
      reset: $("reset"),
      summary: $("summary"),
      error: $("error"),
      status: $("status")
    };

    if (!refs.langBtn) return;

    var fieldIds = [
      "annualSalary", "workingHoursPerWeek", "paidWeeksPerYear", "paidTimeOffDays",
      "socialSecurityRate", "socialSecurityWageCap", "medicareRate",
      "futaRate", "futaWageCap", "sutaRate", "sutaWageCap",
      "healthInsurance", "dentalVision", "retirementMatchRate", "workersCompRate",
      "equipmentCost", "officeCost", "trainingCost", "otherOverhead"
    ];

    var kpiIds = [
      "totalAnnualCost", "monthlyCost", "effectiveHourlyCost",
      "overheadMultiplier", "payrollTaxTotal", "benefitsTotal"
    ];

    var detailIds = [
      "socialSecurityTax", "medicareTax", "futaTax", "sutaTax",
      "healthInsurance_d", "dentalVision_d", "retirementMatch", "workersComp",
      "equipmentCost_d", "officeCost_d", "trainingCost_d", "otherOverhead_d",
      "productiveHours", "ptoCost"
    ];

    var detailKeys = [
      "socialSecurityTax", "medicareTax", "futaTax", "sutaTax",
      "healthInsurance", "dentalVision", "retirementMatch", "workersComp",
      "equipmentCost", "officeCost", "trainingCost", "otherOverhead",
      "productiveHours", "ptoCost"
    ];

    var defaults = {
      annualSalary: 75000,
      workingHoursPerWeek: 40,
      paidWeeksPerYear: 52,
      paidTimeOffDays: 15,
      socialSecurityRate: 6.2,
      socialSecurityWageCap: 168600,
      medicareRate: 1.45,
      futaRate: 0.6,
      futaWageCap: 7000,
      sutaRate: 2.7,
      sutaWageCap: 7000,
      healthInsurance: 7500,
      dentalVision: 600,
      retirementMatchRate: 4,
      workersCompRate: 1,
      equipmentCost: 3000,
      officeCost: 5000,
      trainingCost: 1000,
      otherOverhead: 0
    };

    var lang = "ko";

    function t(key) {
      return I18N[lang][key] || key;
    }

    function money(value) {
      var locale = lang === "en" ? "en-US" : "ko-KR";
      return new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number.isFinite(value) ? value : 0);
    }

    function applyLabels() {
      document.documentElement.lang = lang;
      $("title").textContent = t("title");
      $("subtitle").textContent = t("subtitle");
      $("backLink").textContent = t("back");
      $("inputHeader").textContent = t("inputHeader");
      $("kpiHeader").textContent = t("kpiHeader");
      $("detailHeader").textContent = t("detailHeader");
      $("aboutHeader").textContent = t("aboutHeader");
      $("aboutCopy").textContent = t("aboutCopy");
      refs.copy.textContent = t("copy");
      refs.reset.textContent = t("reset");
      refs.langBtn.textContent = lang === "ko" ? "EN" : "KO";

      fieldIds.forEach(function (id) {
        var label = $("l_" + id);
        if (label) label.textContent = t("l_" + id);
      });

      kpiIds.forEach(function (id) {
        var label = $("k_" + id);
        if (label) label.textContent = t("k_" + id);
      });

      detailIds.forEach(function (id, idx) {
        var label = $("d_" + detailKeys[idx]);
        if (label) label.textContent = t("d_" + detailKeys[idx]);
      });
    }

    function setEmpty() {
      kpiIds.forEach(function (id) { $(id).textContent = "-"; });
      detailIds.forEach(function (id) { $(id).textContent = "-"; });
      refs.summary.value = "";
    }

    function readValues() {
      var vals = {};
      fieldIds.forEach(function (id) {
        vals[id] = Number($(id).value);
      });
      return vals;
    }

    function render() {
      var payload = readValues();
      var out = calculate(payload, { lang: lang });

      refs.error.classList.toggle("show", Boolean(out.error));
      refs.error.textContent = out.error;

      if (out.error) {
        refs.status.textContent = t("invalid");
        setEmpty();
        return;
      }

      var r = out.result;
      $("totalAnnualCost").textContent = money(r.totalAnnualCost);
      $("monthlyCost").textContent = money(r.monthlyCost);
      $("effectiveHourlyCost").textContent = money(r.effectiveHourlyCost);
      $("overheadMultiplier").textContent = r.overheadMultiplier.toFixed(2) + "x";
      $("payrollTaxTotal").textContent = money(r.payrollTaxTotal);
      $("benefitsTotal").textContent = money(r.benefitsTotal);

      $("socialSecurityTax").textContent = money(r.socialSecurityTax);
      $("medicareTax").textContent = money(r.medicareTax);
      $("futaTax").textContent = money(r.futaTax);
      $("sutaTax").textContent = money(r.sutaTax);
      $("healthInsurance_d").textContent = money(r.healthInsurance);
      $("dentalVision_d").textContent = money(r.dentalVision);
      $("retirementMatch").textContent = money(r.retirementMatch);
      $("workersComp").textContent = money(r.workersComp);
      $("equipmentCost_d").textContent = money(r.equipmentCost);
      $("officeCost_d").textContent = money(r.officeCost);
      $("trainingCost_d").textContent = money(r.trainingCost);
      $("otherOverhead_d").textContent = money(r.otherOverhead);
      $("productiveHours").textContent = r.productiveHours.toLocaleString();
      $("ptoCost").textContent = money(r.ptoCost);

      refs.summary.value = r.summary;

      var pctText = (lang === "en" ? "Salary " : "급여 ") + r.salaryPct + "% | "
        + (lang === "en" ? "Tax " : "세금 ") + r.taxPct + "% | "
        + (lang === "en" ? "Benefits " : "복리후생 ") + r.benefitsPct + "% | "
        + (lang === "en" ? "Overhead " : "간접비 ") + r.overheadPct + "%";
      refs.status.innerHTML = '<span class="good">\u25CF</span> ' + pctText;
    }

    refs.langBtn.addEventListener("click", function () {
      lang = lang === "ko" ? "en" : "ko";
      applyLabels();
      render();
    });

    fieldIds.forEach(function (id) {
      var el = $(id);
      el.addEventListener("input", render);
      el.addEventListener("change", render);
    });

    refs.copy.addEventListener("click", function () {
      if (!refs.summary.value.trim()) return;
      try {
        navigator.clipboard.writeText(refs.summary.value).then(function () {
          alert(t("copied"));
        });
      } catch (e) {
        alert(t("copyFail"));
      }
    });

    refs.reset.addEventListener("click", function () {
      fieldIds.forEach(function (id) {
        $(id).value = defaults[id];
      });
      render();
    });

    applyLabels();
    refs.status.textContent = t("waiting");
    render();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initBrowser, { once: true });
  } else {
    initBrowser();
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
