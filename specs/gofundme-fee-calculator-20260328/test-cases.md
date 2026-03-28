# Test Cases — GoFundMe Fee Calculator

## TC-01 Baseline one-time fundraiser
- donations: 50
- avg donation: 40
- fee: 2.9% + 0.30
- campaign costs: 150
- target net: 3000

Expected:
- gross donations = 2000.00
- transaction fees = 73.00
- organizer net before costs = 1927.00
- campaign net after costs = 1777.00
- effective organizer fee rate = 3.65%
- break-even average donation ≈ 3.398558
- target average donation ≈ 65.190525

## TC-02 Recurring mode
Same as TC-01 but recurring enabled.

Expected:
- donor extra recurring fee = 100.00
- donor checkout total = 2100.00
- organizer net before costs unchanged = 1927.00

## TC-03 Cost sensitivity
- raising campaign costs by 200 lowers campaign net by exactly 200.

## TC-04 Zero donations
- gross = 0
- transaction fees = 0
- campaign net = -campaignCosts
- break-even = null
- target = null

## TC-05 Validation
Reject negative counts, negative amounts, and percentages >= 100.

## TC-06 HTML anchors
`index.html` must include all primary input IDs, `summary`, `script defer src="./calculator.js"`, and `/assets/analytics.js`.

## TC-07 Manifest wiring
After rebuild, `tools/manifest.json` contains `gofundme-fee-calculator` exactly once.

## TC-08 HTTP smoke
Local page returns 200 and contains `GoFundMe Fee Calculator`, `2.9% + $0.30`, `5% fee`, and `0% platform fee` markers.
