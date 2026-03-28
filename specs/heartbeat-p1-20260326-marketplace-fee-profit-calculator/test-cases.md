# Test Cases — Marketplace Fee Profit Calculator Logic/Test Hardening

## TC-01 Default baseline scenario remains deterministic
Inputs:
- price 42000
- cogs 15000
- shipping 3200
- adSpend 2800
- marketRate 12
- marketFixed 400
- paymentRate 3.2
- paymentFixed 120
- returnRate 6
- returnLoss 4500
- targetMargin 15

Expect:
- marketFee = 5440
- paymentFee = 1464
- feeBurden = 6904
- expectedRevenue = 39480
- expectedReturnLoss = 270
- baseCost = 21000
- expectedProfit = 11306
- expectedMargin ≈ 26.919048
- breakEvenPrice ≈ 27652.284264
- targetPrice ≈ 34153.605016
- kFactor = 0.788

## TC-02 Alternate healthy scenario computes correct values
Inputs:
- price 25000
- cogs 10000
- shipping 2500
- adSpend 1800
- marketRate 10
- marketFixed 200
- paymentRate 2.9
- paymentFixed 100
- returnRate 2
- returnLoss 3000
- targetMargin 12

Expect:
- feeBurden = 3525
- expectedProfit = 6615
- expectedMargin = 26.46
- breakEvenPrice ≈ 17226.792009
- targetPrice ≈ 20054.719562

## TC-03 Validation rejects invalid inputs
Reject at least these cases:
- price <= 0
- negative cogs
- marketRate >= 100
- paymentRate >= 100
- returnRate >= 100
- targetMargin >= 95

## TC-04 Impossible break-even state throws user-facing error
Inputs with combined fee + return drag producing `kFactor <= 0` should return:
- no result object
- non-empty error mentioning break-even impossibility

## TC-05 Impossible target-margin state throws user-facing error
Inputs with valid `kFactor` but `targetMargin >= kFactor * 100` should return:
- no result object
- non-empty error mentioning target margin impossibility

## TC-06 Summary contains decision-ready fields
Summary must include:
- title line
- expected revenue
- expected profit
- expected margin
- fee burden
- break-even price
- target margin price

## TC-07 HTML scaffold has required anchors
`index.html` must contain:
- `id="price"`
- `id="targetMargin"`
- `id="summary"`
- `/assets/analytics.js`
- `./calculator.js`

## TC-08 Catalog wiring remains exact-once
`marketplace-fee-profit-calculator` exists exactly once in:
- `tools/index.html`
- `tools/index.md`
- `_data/tools-list.json`
- `tools/manifest.json`
- actual `tools/marketplace-fee-profit-calculator/` directory
