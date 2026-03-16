# Employee Cost Calculator - Implementation Plan

## Files to Create
1. `tools/employee-cost-calculator/calculator.js` - Core logic with module.exports
2. `tools/employee-cost-calculator/calculator.test.js` - 12 deterministic tests using node:test
3. `tools/employee-cost-calculator/index.html` - Standalone bilingual dark-theme UI

## Architecture
- Same UMD pattern as etsy-fee-profit-calculator reference
- `(function(root) { ... })(globalThis)` wrapper
- `module.exports` for Node.js, `root.EmployeeCostCalculator` for browser
- `calculate(input, options)` returns `{ result, error }`

## Implementation Steps
1. Create calculator.js with calculate function
2. Create calculator.test.js with 12 tests
3. Create index.html with full UI
4. Run tests, fix until all pass
5. Add to manifest.json and tools-list.json

## Key Calculations
- socialSecurityTax = min(salary, wageCap) * rate/100
- medicareTax = salary * rate/100
- futaTax = min(salary, futaWageCap) * futaRate/100
- sutaTax = min(salary, sutaWageCap) * sutaRate/100
- retirementMatch = salary * matchRate/100
- workersComp = salary * wcRate/100
- totalTax = ss + medicare + futa + suta
- totalBenefits = health + dental + retirement + workersComp
- totalOverhead = equipment + office + training + other
- totalCost = salary + totalTax + totalBenefits + totalOverhead
- monthlyCost = totalCost / 12
- productiveHours = (paidWeeks * hoursPerWeek) - (ptoDays * hoursPerWeek/5)
- effectiveHourlyCost = totalCost / productiveHours
- overheadMultiplier = totalCost / salary
