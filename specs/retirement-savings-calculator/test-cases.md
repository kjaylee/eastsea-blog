# Test Cases: Retirement Savings Calculator

## TC-1: Default values produce valid output
- Input: all defaults (age 30, retire 65, 50M savings, 1M/mo contribution, 7% return)
- Expected: projected savings > 0, gap/surplus calculated, no NaN/Infinity

## TC-2: Already retired (currentAge >= retirementAge)
- Input: currentAge=66, retirementAge=65
- Expected: graceful handling, shows withdrawal-only scenario from current savings

## TC-3: Zero contributions
- Input: monthlyContribution=0, currentSavings=100000000
- Expected: growth from investment returns only, no errors

## TC-4: Zero current savings
- Input: currentSavings=0, monthlyContribution=2000000
- Expected: accumulation from contributions only

## TC-5: High inflation scenario
- Input: inflationRate=8
- Expected: significantly higher required savings, larger gap

## TC-6: Edge case — life expectancy equals retirement age
- Input: retirementAge=65, lifeExpectancy=65
- Expected: no retirement period needed, surplus = projected savings

## TC-7: File structure checks
- index.html exists in tools/retirement-savings-calculator/
- Contains analytics.js script tag
- Contains proper meta tags
- Has responsive viewport meta

## TC-8: Node syntax check
- `node --check` equivalent: HTML is well-formed, no script syntax errors
