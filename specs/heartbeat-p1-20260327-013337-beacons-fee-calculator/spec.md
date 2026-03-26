# Spec — Beacons Fee Calculator

- Slug: `beacons-fee-calculator`
- URL: `/tools/beacons-fee-calculator/`
- Primary query: `beacons fee calculator`
- Secondary queries:
  - `beacons pricing calculator`
  - `beacons seller fee`
  - `beacons store fees`
  - `how much does beacons take`

## User
Creators selling digital products, memberships, appointments, or courses through Beacons who need to know what they actually keep under each plan.

## User job
Before choosing a plan or publishing a product, estimate:
- monthly take-home
- total Beacons fees
- processor drag
- whether a higher paid plan beats the free 9% seller-fee plan

## Inputs
- Monthly gross sales
- Successful sales count
- Refund rate %
- Affiliate share %
- Beacons plan preset
- Custom Beacons fee rate % when custom plan is selected
- Custom monthly plan cost when custom plan is selected
- Processor preset
- Custom processor rate %
- Custom processor flat fee
- Other monthly costs
- Target monthly net profit

## Plan presets
- Free: $0 monthly, 9% seller fee
- Creator monthly: $10 monthly, 9% seller fee
- Creator annual: $100/year -> monthly equivalent
- Creator Plus monthly: $30 monthly, 0% seller fee
- Creator Plus annual: $300/year -> monthly equivalent
- Creator Max monthly: $90 monthly, 0% seller fee
- Creator Max annual: $900/year -> monthly equivalent
- Custom

## Processor presets
- Stripe: 2.9% + $0.30
- PayPal US: 3.49% + $0.49
- Custom

## Core formulas
- `refundLoss = gross * refundRate`
- `recognizedSales = gross - refundLoss`
- `affiliatePayout = recognizedSales * affiliateRate`
- `beaconsFeeBase = max(recognizedSales - affiliatePayout, 0)`
- `beaconsFees = beaconsFeeBase * beaconsFeeRate`
- `processorFees = recognizedSales * processorRate + successfulSales * processorFlatFee`
- `monthlyNetProfit = recognizedSales - affiliatePayout - beaconsFees - processorFees - monthlyPlanCost - otherMonthlyCost`

Break-even uses current average order value so fixed transaction fees scale with volume.

## Outputs
- Monthly net profit
- Take-home rate
- Break-even monthly gross sales
- Required monthly gross for target net
- Beacons fees
- Processor fees
- Refund loss
- Affiliate payout
- Plan monthly cost
- Annualized net profit
- Comparison table across standard Beacons plans
- Copyable summary

## UX notes
- Single static page.
- Compact, trustworthy utility layout.
- English/Korean toggle.
- First screen shows the primary calculator immediately.
- Notes section makes assumptions explicit.

## Implementation files
- `tools/beacons-fee-calculator/index.html`
- `tools/beacons-fee-calculator/calculator.js`
- `tools/beacons-fee-calculator/calculator.test.js`
- `specs/heartbeat-p1-20260327-013337-beacons-fee-calculator/*`

