# Test Cases — Buy Me a Coffee Fee Calculator

## TC-01 Baseline scenario: creator covers card fee
Inputs:
- transaction count = `120`
- average support amount = `10.00`
- supporter covers card fee = `false`
- platform fee = `5%`
- processing = `2.9% + 0.30`
- payout fee = `0.5%`
- reward cost / transaction = `1.20`
- other monthly cost = `80`
- desired monthly net = `1000`

Expected:
- creator-priced gross support = `1200.00`
- supporter charge total = `1200.00`
- platform fees = `60.00`
- processing fees = `70.80`
- payout fees = `5.35`
- take-home before operating costs = `1063.85`
- reward costs = `144.00`
- monthly net profit = `839.85`
- effective creator fee drag ≈ `11.35%`
- break-even average support ≈ `2.36`
- target average support for `1000` monthly net ≈ `11.46`

## TC-02 Supporter covers card fee improves creator net
Same baseline inputs except:
- supporter covers card fee = `true`

Expected:
- creator-priced gross support = `1200.00`
- supporter charge total ≈ `1272.91`
- processing fees ≈ `72.91`
- platform fees = `60.00`
- payout fees = `5.70`
- take-home before operating costs = `1134.30`
- monthly net profit = `910.30`
- monthly net profit delta vs TC-01 ≈ `+70.45`
- break-even average support ≈ `1.97`
- target average support for `1000` monthly net ≈ `10.79`

## TC-03 Reward-cost sensitivity is linear
Same as TC-01 except:
- reward cost / transaction = `2.00`

Expected:
- reward costs increase by `96.00`
- monthly net profit decreases by exactly `96.00` vs TC-01

## TC-04 Fixed monthly cost reduces net dollar-for-dollar
Same as TC-01 except:
- other monthly cost = `180`

Expected:
- monthly net profit decreases by exactly `100.00` vs TC-01

## TC-05 Zero transactions returns safe outputs
Inputs:
- transaction count = `0`
- average support amount = `10`
- all other defaults

Expected:
- creator-priced gross support = `0`
- supporter charge total = `0`
- monthly net profit = `-otherMonthlyCost`
- break-even average support = `null`
- target average support = `null`
- no divide-by-zero or Infinity

## TC-06 Invalid input rejection
Reject or normalize safely:
- negative transaction count
- non-integer transaction count
- negative support amount
- platform fee `>= 100`
- processing rate `>= 100`
- negative processing fixed fee
- payout fee `>= 100`
- negative reward cost
- negative other monthly cost
- negative desired monthly net

## TC-07 Denominator guard for impossible fee structure
Inputs:
- transaction count = `10`
- average support amount = `5`
- supporter covers card fee = `false`
- platform fee = `60%`
- processing rate = `45%`
- payout fee = `1%`

Expected:
- denominator for break-even math is non-positive
- break-even average support = `null`
- target average support = `null`
- main scenario output still returns finite fee totals for the entered values

## TC-08 Alternate-scenario comparison block
Expected UI data for any valid input:
- current scenario label rendered
- alternate scenario label rendered
- alternate scenario monthly net rendered
- delta vs alternate rendered
- no mismatch between toggle state and current scenario title

## TC-09 Summary block includes decision-ready fields
Summary must include:
- transaction count
- average support amount
- whether supporters cover card fee
- platform fees
- processing fees
- payout fees
- reward costs
- monthly net profit
- break-even average support amount
- target average support amount

## TC-10 Required HTML anchors
`index.html` must contain at minimum:
- `transactionCount`
- `averageSupportAmount`
- `coverCardFeeFromSupporters`
- `platformFeeRatePct`
- `processingRatePct`
- `processingFixedFee`
- `payoutRatePct`
- `rewardCostPerTransaction`
- `otherMonthlyCost`
- `desiredMonthlyNetProfit`
- `summary`
- `alternateScenario`
- `script defer src="./calculator.js"`
- `/assets/analytics.js`

## TC-11 Discovery exact-once wiring after implementation
Post-implementation expectations:
- actual directory exists: `tools/buy-me-a-coffee-fee-calculator/`
- `tools/index.html` contains `buy-me-a-coffee-fee-calculator/` exactly once
- `tools/index.md` contains `./buy-me-a-coffee-fee-calculator/` exactly once
- `_data/tools-list.json` contains `/tools/buy-me-a-coffee-fee-calculator/` exactly once
- `tools/manifest.json` contains slug `buy-me-a-coffee-fee-calculator` exactly once

## TC-12 HTTP smoke
After implementation:
- local server returns `200 OK` for `/tools/buy-me-a-coffee-fee-calculator/`
- fetched HTML contains `Buy Me a Coffee Fee Calculator`
- fetched HTML contains visible reference to `5%`, `2.9% + $0.30`, and `0.5%`