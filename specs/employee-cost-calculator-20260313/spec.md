# Employee Cost Calculator - Specification

## Overview
Calculate the true total cost of employing a person, including base salary, payroll taxes, benefits, and overhead costs. Bilingual EN/KO, dark theme, KPI cards.

## Inputs
| Field | Type | Default | Validation |
|-------|------|---------|------------|
| annualSalary | number | 75000 | > 0 |
| workingHoursPerWeek | number | 40 | 1-168 |
| paidWeeksPerYear | number | 52 | 1-52 |
| paidTimeOffDays | number | 15 | >= 0 |
| socialSecurityRate | number | 6.2 | 0-100 |
| socialSecurityWageCap | number | 168600 | >= 0 |
| medicareRate | number | 1.45 | 0-100 |
| futaRate | number | 0.6 | 0-100 |
| futaWageCap | number | 7000 | >= 0 |
| sutaRate | number | 2.7 | 0-100 |
| sutaWageCap | number | 7000 | >= 0 |
| healthInsurance | number | 7500 | >= 0 |
| dentalVision | number | 600 | >= 0 |
| retirementMatchRate | number | 4 | 0-100 |
| workersCompRate | number | 1.0 | 0-100 |
| equipmentCost | number | 3000 | >= 0 |
| officeCost | number | 5000 | >= 0 |
| trainingCost | number | 1000 | >= 0 |
| otherOverhead | number | 0 | >= 0 |

## Outputs / KPIs
1. Total Annual Cost
2. Monthly Cost
3. Effective Hourly Cost
4. Overhead Multiplier (total / salary)
5. Payroll Tax Total
6. Benefits Total

## Detail Table
- Social Security tax
- Medicare tax
- FUTA
- SUTA
- Health insurance
- Dental/vision
- Retirement match
- Workers' comp
- Equipment
- Office space
- Training
- Other overhead
- Productive hours/year
- PTO cost (imputed)

## Summary (clipboard)
Text block with all KPIs for easy sharing.

## Validation Rules
- annualSalary must be > 0
- workingHoursPerWeek must be 1-168
- paidWeeksPerYear must be 1-52
- All rate fields must be 0-100
- All money fields must be >= 0
