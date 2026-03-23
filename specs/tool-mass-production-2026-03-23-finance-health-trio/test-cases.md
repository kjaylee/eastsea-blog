# Test Cases — Mortgage Extra Payment / BMI+BFP / CAGR Trio

## TC-01 Mortgage baseline payment is deterministic
- Principal: 300,000,000
- Rate: 4.2%
- Term: 30 years
- Expect base monthly payment around 1,467,052 KRW-equivalent numeric output and payoff at 360 months.

## TC-02 Mortgage extra payments reduce term and interest
- Same baseline
- Monthly extra: 200,000
- Annual lump sum: 1,000,000 in month 12
- Expect accelerated payoff months < 360 and interest saved > 0.

## TC-03 Mortgage zero-interest edge case works
- Rate: 0%
- Expect monthly payment = principal / months and interest totals = 0.

## TC-04 BMI calculation is deterministic
- Metric male: 175 cm, 72 kg
- Expect BMI ≈ 23.5 and category = normal.

## TC-05 US Navy male body-fat estimate is deterministic
- Male, 175 cm, neck 38 cm, waist 85 cm
- Expect valid body-fat % within realistic range and fat mass > 0.

## TC-06 US Navy female validation works
- Female with waist + hip <= neck equivalent invalid condition
- Expect validation error message instead of numeric output.

## TC-07 CAGR math is deterministic
- Start: 10,000,000
- End: 18,500,000
- Years: 3
- Expect CAGR ≈ 22.76%.

## TC-08 CAGR reverse planning produces valid target future value
- Start: 10,000,000
- Target CAGR: 15%
- Years: 5
- Expect projected end value > start value.

## TC-09 Catalog exact-once checks
- `mortgage-extra-payment-calculator` appears exactly once in each catalog surface.
- `bmi-bfp-calculator` appears exactly once in each catalog surface.
- `cagr-calculator` remains exactly once in each catalog surface after refresh.

## TC-10 HTTP smoke
- Local static server returns HTTP 200 for all three tool paths.
