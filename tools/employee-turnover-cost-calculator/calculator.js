(function (root) {
  var TEXT = {
    ko: {
      invalid: "입력값을 확인해주세요.",
      salaryErr: "연봉은 0보다 커야 합니다.",
      employeesErr: "총 직원 수는 1 이상이어야 합니다.",
      turnoverErr: "이직률은 0~100 범위여야 합니다.",
      rateErr: "비율 값은 0~100 범위여야 합니다.",
      moneyErr: "금액 입력값은 0 이상이어야 합니다.",
      daysErr: "일수는 0 이상이어야 합니다.",
      monthsErr: "개월 수는 0~24 범위여야 합니다.",
      interviewsErr: "면접 횟수는 0 이상이어야 합니다.",
      hoursErr: "면접 시간은 0 이상이어야 합니다.",
      copied: "요약이 복사되었습니다.",
      copyFail: "클립보드 권한이 없어 수동 복사가 필요합니다.",
      summaryTitle: "[직원 이직 비용 요약]",
      na: "N/A",
      catSeparation: "퇴직 처리 비용",
      catRecruitment: "채용 비용",
      catSelection: "선발 비용",
      catOnboarding: "온보딩/교육 비용",
      catVacancy: "공석 기간 생산성 손실",
      catRampUp: "적응 기간 생산성 손실"
    },
    en: {
      invalid: "Please review your inputs.",
      salaryErr: "Annual salary must be greater than zero.",
      employeesErr: "Total employees must be at least 1.",
      turnoverErr: "Turnover rate must be between 0 and 100.",
      rateErr: "Rate values must be between 0 and 100.",
      moneyErr: "All money fields must be zero or above.",
      daysErr: "Days must be zero or above.",
      monthsErr: "Ramp-up months must be between 0 and 24.",
      interviewsErr: "Interviews per hire must be zero or above.",
      hoursErr: "Hours per interview must be zero or above.",
      copied: "Summary copied.",
      copyFail: "Clipboard unavailable. Please copy manually.",
      summaryTitle: "[Employee Turnover Cost Summary]",
      na: "N/A",
      catSeparation: "Separation costs",
      catRecruitment: "Recruitment costs",
      catSelection: "Selection costs",
      catOnboarding: "Onboarding & training",
      catVacancy: "Vacancy productivity loss",
      catRampUp: "Ramp-up productivity loss"
    }
  };

  var WORKING_DAYS_PER_YEAR = 260;

  function round2(v) {
    return Math.round((v + Number.EPSILON) * 100) / 100;
  }

  function round4(v) {
    return Math.round((v + Number.EPSILON) * 10000) / 10000;
  }

  function fmt(v) {
    return v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function calculate(input, opts) {
    var lang = (opts && opts.lang) || "ko";
    var t = TEXT[lang] || TEXT.en;

    var annualSalary = Number(input.annualSalary);
    var totalEmployees = Number(input.totalEmployees);
    var turnoverRate = Number(input.turnoverRate);
    var jobPostingCost = Number(input.jobPostingCost);
    var recruiterFeeRate = Number(input.recruiterFeeRate);
    var referralBonus = Number(input.referralBonus);
    var interviewsPerHire = Number(input.interviewsPerHire);
    var hoursPerInterview = Number(input.hoursPerInterview);
    var interviewerHourlyRate = Number(input.interviewerHourlyRate);
    var backgroundCheckCost = Number(input.backgroundCheckCost);
    var trainingCost = Number(input.trainingCost);
    var adminCost = Number(input.adminCost);
    var vacancyDays = Number(input.vacancyDays);
    var rampUpMonths = Number(input.rampUpMonths);
    var rampUpProductivity = Number(input.rampUpProductivity);

    // Validation
    if (isNaN(annualSalary) || annualSalary <= 0) return { error: t.salaryErr, result: null };
    if (isNaN(totalEmployees) || totalEmployees < 1) return { error: t.employeesErr, result: null };
    if (isNaN(turnoverRate) || turnoverRate < 0 || turnoverRate > 100) return { error: t.turnoverErr, result: null };
    if (isNaN(recruiterFeeRate) || recruiterFeeRate < 0 || recruiterFeeRate > 100) return { error: t.rateErr, result: null };
    if (isNaN(rampUpProductivity) || rampUpProductivity < 0 || rampUpProductivity > 100) return { error: t.rateErr, result: null };
    if (isNaN(rampUpMonths) || rampUpMonths < 0 || rampUpMonths > 24) return { error: t.monthsErr, result: null };
    var moneyFields = [jobPostingCost, referralBonus, interviewerHourlyRate, backgroundCheckCost, trainingCost, adminCost];
    for (var i = 0; i < moneyFields.length; i++) {
      if (isNaN(moneyFields[i]) || moneyFields[i] < 0) return { error: t.moneyErr, result: null };
    }
    if (isNaN(vacancyDays) || vacancyDays < 0) return { error: t.daysErr, result: null };
    if (isNaN(interviewsPerHire) || interviewsPerHire < 0) return { error: t.interviewsErr, result: null };
    if (isNaN(hoursPerInterview) || hoursPerInterview < 0) return { error: t.hoursErr, result: null };

    // Calculations
    var dailySalary = annualSalary / WORKING_DAYS_PER_YEAR;

    var separationCost = round2(adminCost);
    var recruitmentCost = round2(jobPostingCost + (annualSalary * recruiterFeeRate / 100) + referralBonus);
    var selectionCost = round2((interviewsPerHire * hoursPerInterview * interviewerHourlyRate) + backgroundCheckCost);
    var onboardingCost = round2(trainingCost);
    var vacancyLoss = round2(vacancyDays * dailySalary);
    var rampUpLoss = round2((rampUpMonths * (annualSalary / 12)) * (1 - rampUpProductivity / 100));

    var costPerDeparture = round2(separationCost + recruitmentCost + selectionCost + onboardingCost + vacancyLoss + rampUpLoss);
    var departures = Math.round(totalEmployees * turnoverRate / 100);
    var annualTurnoverCost = round2(costPerDeparture * departures);
    var monthlyCost = round2(annualTurnoverCost / 12);
    var salaryMultiple = round4(costPerDeparture / annualSalary);

    // Savings scenarios
    var savings25 = round2(annualTurnoverCost * 0.25);
    var savings50 = round2(annualTurnoverCost * 0.50);

    // Breakdown
    var breakdown = [
      { category: t.catSeparation, amount: separationCost, pct: round2(costPerDeparture > 0 ? (separationCost / costPerDeparture) * 100 : 0) },
      { category: t.catRecruitment, amount: recruitmentCost, pct: round2(costPerDeparture > 0 ? (recruitmentCost / costPerDeparture) * 100 : 0) },
      { category: t.catSelection, amount: selectionCost, pct: round2(costPerDeparture > 0 ? (selectionCost / costPerDeparture) * 100 : 0) },
      { category: t.catOnboarding, amount: onboardingCost, pct: round2(costPerDeparture > 0 ? (onboardingCost / costPerDeparture) * 100 : 0) },
      { category: t.catVacancy, amount: vacancyLoss, pct: round2(costPerDeparture > 0 ? (vacancyLoss / costPerDeparture) * 100 : 0) },
      { category: t.catRampUp, amount: rampUpLoss, pct: round2(costPerDeparture > 0 ? (rampUpLoss / costPerDeparture) * 100 : 0) }
    ];

    // Summary text
    var lines = [
      t.summaryTitle,
      "",
      (lang === "ko" ? "연봉" : "Annual salary") + ": $" + fmt(annualSalary),
      (lang === "ko" ? "총 직원 수" : "Total employees") + ": " + totalEmployees,
      (lang === "ko" ? "이직률" : "Turnover rate") + ": " + turnoverRate + "%",
      (lang === "ko" ? "연간 퇴직자 수" : "Annual departures") + ": " + departures,
      "",
      (lang === "ko" ? "1인당 이직 비용" : "Cost per departure") + ": $" + fmt(costPerDeparture),
      (lang === "ko" ? "연봉 대비 배수" : "Salary multiple") + ": " + salaryMultiple + "×",
      (lang === "ko" ? "연간 총 이직 비용" : "Annual turnover cost") + ": $" + fmt(annualTurnoverCost),
      (lang === "ko" ? "월간 이직 비용" : "Monthly cost") + ": $" + fmt(monthlyCost),
      "",
      (lang === "ko" ? "--- 비용 내역 ---" : "--- Breakdown ---")
    ];
    for (var j = 0; j < breakdown.length; j++) {
      lines.push(breakdown[j].category + ": $" + fmt(breakdown[j].amount) + " (" + breakdown[j].pct + "%)");
    }
    lines.push("");
    lines.push((lang === "ko" ? "이직률 25% 절감 시 절약" : "Savings if turnover reduced by 25%") + ": $" + fmt(savings25));
    lines.push((lang === "ko" ? "이직률 50% 절감 시 절약" : "Savings if turnover reduced by 50%") + ": $" + fmt(savings50));

    return {
      error: "",
      result: {
        separationCost: separationCost,
        recruitmentCost: recruitmentCost,
        selectionCost: selectionCost,
        onboardingCost: onboardingCost,
        vacancyLoss: vacancyLoss,
        rampUpLoss: rampUpLoss,
        costPerDeparture: costPerDeparture,
        departures: departures,
        annualTurnoverCost: annualTurnoverCost,
        monthlyCost: monthlyCost,
        salaryMultiple: salaryMultiple,
        savings25: savings25,
        savings50: savings50,
        breakdown: breakdown,
        summary: lines.join("\n")
      }
    };
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { calculate: calculate, TEXT: TEXT };
  } else {
    root.TurnoverCalc = { calculate: calculate, TEXT: TEXT };
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
