# Payroll Tax Calculator - Specification

## Purpose
Calculate US payroll taxes (Social Security, Medicare, FUTA, SUTA) for both employer and employee sides given annual gross wages and configurable rates.

## Inputs
| Field | Type | Default | Range |
|-------|------|---------|-------|
| annualGrossWages | number | 75000 | > 0 |
| numberOfEmployees | integer | 1 | >= 1 |
| socialSecurityRate | number | 6.2 | 0-50 |
| socialSecurityWageBase | number | 176100 | >= 0 |
| medicareRate | number | 1.45 | 0-50 |
| additionalMedicareRate | number | 0.9 | 0-50 |
| additionalMedicareThreshold | number | 200000 | >= 0 |
| futaRate | number | 0.6 | 0-50 |
| futaWageBase | number | 7000 | >= 0 |
| sutaRate | number | 2.7 | 0-50 |
| sutaWageBase | number | 7000 | >= 0 |

## Outputs
| Field | Description |
|-------|-------------|
| employeeSocialSecurity | Employee SS tax (6.2% up to wage base) |
| employerSocialSecurity | Employer SS tax (same) |
| employeeMedicare | Employee Medicare (1.45% all wages) |
| employerMedicare | Employer Medicare (same) |
| employeeAdditionalMedicare | Additional Medicare on wages > threshold |
| totalEmployeeTax | Sum of employee taxes |
| totalEmployerTax | Sum of employer taxes (SS + Medicare + FUTA + SUTA) |
| futaTax | FUTA tax (employer only) |
| sutaTax | SUTA tax (employer only) |
| totalPayrollTax | Employee + Employer combined |
| netTakeHome | Gross - employee taxes (before income tax) |
| effectiveEmployeeRate | totalEmployeeTax / grossWages * 100 |
| effectiveEmployerRate | totalEmployerTax / grossWages * 100 |
| totalCostToEmployer | grossWages + totalEmployerTax |
| annualTotals | All above multiplied by numberOfEmployees |

## KPI Cards (6)
1. Total Payroll Tax (combined)
2. Employee Tax Burden
3. Employer Tax Burden
4. Net Take-Home (pre-income-tax)
5. Effective Employee Rate
6. Total Cost to Employer

## Detail Table
- Social Security (employee/employer)
- Medicare (employee/employer)
- Additional Medicare (employee only)
- FUTA (employer only)
- SUTA (employer only)

## Bilingual
- Korean / English toggle
