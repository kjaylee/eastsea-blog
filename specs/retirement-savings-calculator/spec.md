# Spec: Retirement Savings Calculator

## Tool ID
`retirement-savings-calculator`

## Purpose
Calculate whether current savings trajectory meets retirement income goals, with inflation-adjusted projections.

## Inputs
| Field | Type | Default | Description |
|-------|------|---------|-------------|
| currentAge | number | 30 | Current age |
| retirementAge | number | 65 | Target retirement age |
| lifeExpectancy | number | 85 | Expected lifespan |
| currentSavings | number | 50000000 | Current retirement savings (KRW) |
| monthlyContribution | number | 1000000 | Monthly savings contribution |
| annualReturnPre | number | 7 | Expected annual return before retirement (%) |
| annualReturnPost | number | 4 | Expected annual return after retirement (%) |
| inflationRate | number | 2.5 | Annual inflation rate (%) |
| desiredMonthlyIncome | number | 3000000 | Desired monthly income in retirement (today's KRW) |

## Outputs (KPIs)
1. **Projected Savings at Retirement** — future value at retirement age
2. **Required Savings** — lump sum needed to fund desired income through life expectancy
3. **Savings Gap / Surplus** — difference
4. **Sustainable Monthly Withdrawal** — what projected savings actually supports
5. **Real (inflation-adjusted) Monthly Income** — purchasing power at retirement
6. **Years of Coverage** — how many years savings will last at desired withdrawal

## Calculations
- FV accumulation: compound monthly contributions at annualReturnPre
- Required nest egg: PV of annuity (desiredMonthlyIncome inflation-adjusted) over (lifeExpectancy - retirementAge) years at annualReturnPost
- Gap = Projected - Required
- Sustainable withdrawal: PMT from projected savings over retirement years at annualReturnPost

## UI
- Dark theme matching existing catalog (--bg:#0d1424 palette)
- 2-column grid: inputs left, KPI results right
- Year-by-year projection table below
- Interpretation guide section
- Mobile responsive
- analytics.js included

## SEO
- Title: "Retirement Savings Calculator | 은퇴 자금 계산기"
- Meta: bilingual description
- H1 with emoji: 🏖️
