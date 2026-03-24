# Test Cases: Employee Turnover Cost Calculator

## TC-01: Baseline — mid-level $65k, 15% turnover, 100 employees
- departures = round(100 × 0.15) = 15
- dailySalary = 65000/260 = 250
- separation = 500
- recruitment = 500 + 0 + 0 = 500
- selection = (5 × 1 × 50) + 100 = 350
- onboarding = 3000
- vacancyLoss = 40 × 250 = 10000
- rampUpLoss = (3 × 65000/12) × (1 - 0.50) = 3 × 5416.67 × 0.50 = 8125
- costPerDeparture = 500 + 500 + 350 + 3000 + 10000 + 8125 = 22475
- annualCost = 22475 × 15 = 337125
- salaryMultiple = 22475 / 65000 ≈ 0.3458

## TC-02: High earner with recruiter — $150k, recruiter 20%
- recruitment = 500 + 30000 + 0 = 30500
- costPerDeparture should be much higher

## TC-03: Zero turnover rate — should produce 0 departures, $0 annual cost
- departures = 0
- annualCost = 0

## TC-04: No vacancy, no ramp-up — only hard costs
- vacancyDays = 0, rampUpMonths = 0
- vacancyLoss = 0, rampUpLoss = 0

## TC-05: 100% turnover — all employees leave
- turnoverRate = 100
- departures = totalEmployees

## TC-06: Validation — salary must be > 0
## TC-07: Validation — turnover rate must be 0-100
## TC-08: Validation — totalEmployees must be ≥ 1
## TC-09: Summary text contains key fields
## TC-10: Ramp-up productivity 0% = full salary loss during ramp
## TC-11: Ramp-up productivity 100% = zero ramp loss
## TC-12: Savings calculations — 25% and 50% reduction
