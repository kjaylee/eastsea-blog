# Test Cases — Memberful Fee Calculator

## TC-01 Baseline domestic-card scenario
- Gross sales: 5,000
- Successful charges: 120
- Refund rate: 3%
- Processor preset: Stripe domestic 2.9% + 0.30
- Other monthly cost: 600
- Desired monthly net: 1,000
- Expect:
  - Memberful fixed fee = 49.00
  - Memberful transaction fees = 245.00
  - Processor fees = 181.00
  - Refund loss = 150.00
  - Take-home after platform = 4,375.00
  - Net profit = 3,775.00
  - Average charge amount = 41.67
  - Effective fee rate = 9.50%
  - Break-even gross ≈ 733.50
  - Target gross for 1,000 net ≈ 1,863.70

## TC-02 International-card preset increases fee drag
- Same baseline but processor preset = international
- Expect:
  - Processor fees = 256.00
  - Net profit = 3,700.00
  - Effective fee rate > domestic baseline

## TC-03 Custom processor override works
- Same baseline but processor = custom 3.7% + 0.45
- Expect:
  - Processor fees = 239.00
  - Net profit = 3,717.00
  - Custom math exactly matches formula

## TC-04 Other fixed costs reduce profit dollar-for-dollar
- Same baseline with other monthly cost = 850
- Expect net profit = baseline net profit - 250

## TC-05 Target-gross and target-gap behave correctly
- Baseline desired monthly net = 5,000
- Expect target gross > current gross and positive target gap

## TC-06 Validation rejects invalid inputs
- Negative gross sales
- Successful charges <= 0
- Refund rate >= 100
- Unsupported processor preset
- Custom processor rate >= 100
- Negative custom flat fee
- Negative other monthly cost
- Negative desired monthly net

## TC-07 Break-even returns null when contribution margin is invalid
- Use custom processor rate 97 with flat 0 and refund 3
- Expect contribution margin <= 0 and break-even/target gross = null

## TC-08 Summary includes decision-ready fields
- Summary includes monthly gross, Memberful fixed fee, Memberful transaction fees, processor fees, refund loss, net profit, break-even gross, and recommended processor label.

## TC-09 HTML scaffold has required anchors
- `langBtn`
- `processorPreset`
- `customProcessorRatePct`
- `summary`
- `comparisonBody`
- `script defer src="./calculator.js"`
- `/assets/analytics.js`

## TC-10 Discovery exact-once wiring
- Slug exists exactly once in:
  - `_data/tools-list.json`
  - `tools/manifest.json`
  - `tools/index.html`
  - `tools/index.md`
  - actual `tools/memberful-fee-calculator/` directory
