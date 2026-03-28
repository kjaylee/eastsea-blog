# Test Cases — Contribution Margin Calculator

## TC-CM-01 Baseline profitable unit economics
- Input: selling price `120`, variable cost `45`, fixed costs `18000`, target profit `12000`
- Expect:
  - contribution margin per unit `75`
  - contribution margin ratio `62.5%`
  - break-even units `240`
  - target-profit units `400`

## TC-CM-02 Exact break-even denominator with rounding up
- Input: selling price `49`, variable cost `17`, fixed costs `10000`, target profit `2500`
- Expect:
  - contribution margin per unit `32`
  - break-even units `313`
  - target-profit units `391`

## TC-CM-03 Optional target profit defaults to zero
- Input omits target profit
- Expect:
  - calculation succeeds
  - target-profit units equals break-even units

## TC-CM-04 Zero fixed costs
- Input: fixed costs `0`, profitable unit economics
- Expect:
  - break-even units `0`
  - target-profit units based only on target profit

## TC-CM-05 Non-viable unit economics
- Input: selling price `30`, variable cost `30`, fixed costs `5000`
- Expect:
  - contribution margin per unit `0`
  - contribution margin ratio `0%`
  - break-even units `null`
  - target-profit units `null`
  - error-free but with explanatory status

## TC-CM-06 Invalid input validation
- Cases:
  - selling price `0`
  - variable cost `< 0`
  - fixed costs `< 0`
  - target profit `< 0`
- Expect:
  - `result = null`
  - non-empty error message

## TC-CM-07 Summary output is copy-ready
- Expect summary to include:
  - selling price
  - variable cost
  - fixed costs
  - contribution margin per unit
  - contribution margin ratio
  - break-even units
  - target-profit units

## TC-CM-08 Discovery exact-once
- After catalog updates and manifest rebuild:
  - `_data/tools-list.json` contains `/tools/contribution-margin-calculator/` exactly once
  - `tools/index.html` contains `contribution-margin-calculator` exactly once
  - `tools/index.md` contains `contribution-margin-calculator` exactly once
  - `tools/manifest.json` contains slug + canonical URL exactly once
