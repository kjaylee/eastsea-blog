# Spec: Employee Turnover Cost Calculator

## Slug
`employee-turnover-cost-calculator`

## Purpose
Calculate the true total cost of employee turnover across all cost categories: separation, recruitment, selection, onboarding, lost productivity (vacancy + ramp-up). Provides per-departure cost, annual total, salary multiple, and retention savings scenario.

## Inputs
| Field | ID | Type | Default | Validation |
|-------|-----|------|---------|------------|
| Annual salary | annualSalary | number | 65000 | >0 |
| Total employees | totalEmployees | number | 100 | ≥1 |
| Annual turnover rate (%) | turnoverRate | number | 15 | 0-100 |
| Job posting costs | jobPostingCost | number | 500 | ≥0 |
| Recruiter fee (% of salary) | recruiterFeeRate | number | 0 | 0-100 |
| Referral bonus | referralBonus | number | 0 | ≥0 |
| Interviews per hire | interviewsPerHire | number | 5 | ≥0 |
| Hours per interview | hoursPerInterview | number | 1 | ≥0 |
| Interviewer hourly rate | interviewerHourlyRate | number | 50 | ≥0 |
| Background check cost | backgroundCheckCost | number | 100 | ≥0 |
| Training & onboarding cost | trainingCost | number | 3000 | ≥0 |
| Admin/HR processing cost | adminCost | number | 500 | ≥0 |
| Vacancy days | vacancyDays | number | 40 | ≥0 |
| Ramp-up months | rampUpMonths | number | 3 | 0-24 |
| Avg ramp-up productivity (%) | rampUpProductivity | number | 50 | 0-100 |

## Calculations
```
dailySalary = annualSalary / 260 (working days)

separationCost = adminCost
recruitmentCost = jobPostingCost + (annualSalary × recruiterFeeRate/100) + referralBonus
selectionCost = (interviewsPerHire × hoursPerInterview × interviewerHourlyRate) + backgroundCheckCost
onboardingCost = trainingCost
vacancyLoss = vacancyDays × dailySalary
rampUpLoss = (rampUpMonths × (annualSalary/12)) × (1 - rampUpProductivity/100)

costPerDeparture = separationCost + recruitmentCost + selectionCost + onboardingCost + vacancyLoss + rampUpLoss
departures = Math.round(totalEmployees × turnoverRate / 100)
annualTurnoverCost = costPerDeparture × departures
salaryMultiple = costPerDeparture / annualSalary
monthlyCost = annualTurnoverCost / 12
```

## Outputs (KPIs)
- Cost per departure
- Annual departures
- Annual turnover cost
- Monthly turnover cost
- Cost as salary multiple (×)
- Breakdown table (6 categories with amounts and %)
- Savings if turnover reduced by 25% and 50%

## Bilingual
Korean (default) / English toggle.

## Files
- `tools/employee-turnover-cost-calculator/index.html`
- `tools/employee-turnover-cost-calculator/calculator.js`
- `tools/employee-turnover-cost-calculator/calculator.test.js`
