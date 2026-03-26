# Spec — LaunchPass Fee Calculator

## Objective
Create a public tool page at `/tools/launchpass-fee-calculator/` that estimates actual LaunchPass creator take-home after the monthly plan fee, LaunchPass transaction fee, Stripe processing, refunds, and optional operating costs.

## User story
As a creator or community operator using LaunchPass, I want to know how much I actually keep each month and what sales volume I need to break even or hit a target net profit.

## Inputs

### Revenue assumptions
- `monthlyGrossSales` (USD, > 0)
- `successfulCharges` (integer, > 0)
- `refundRatePct` (0–100)

### LaunchPass assumptions
- `launchPassMonthlyFee` (USD, >= 0, default 29)
- `launchPassTransactionRatePct` (0–100, default 3.5)

### Processor assumptions
- `processorPreset` (`domestic`, `international`, `custom`)
- `customProcessorRatePct` (0–100)
- `customProcessorFlatFee` (USD, >= 0)

### Operating inputs
- `otherMonthlyCost` (USD, >= 0)
- `desiredMonthlyNetProfit` (USD, >= 0)

## Derived metrics

### Unit economics
- average charge amount
- refund loss
- LaunchPass monthly plan fee
- LaunchPass transaction fees
- Stripe processing fees
- take-home after platform fees
- monthly net profit
- annualized net profit
- effective fee drag percentage

### Planning outputs
- break-even monthly gross sales
- break-even successful charges
- required monthly gross sales for target net profit
- required successful charges for target net profit
- gross sales gap or buffer vs target

### Comparison output
- comparison table across processor presets using the same gross volume and charge count

## Formula definition

### Base math
- `averageChargeAmount = monthlyGrossSales / successfulCharges`
- `refundLoss = monthlyGrossSales * refundRatePct / 100`
- `launchPassTransactionFees = monthlyGrossSales * launchPassTransactionRatePct / 100`
- `processorFees = monthlyGrossSales * processorRatePct / 100 + successfulCharges * processorFlatFee`
- `takeHomeAfterPlatform = monthlyGrossSales - refundLoss - launchPassTransactionFees - processorFees - launchPassMonthlyFee`
- `monthlyNetProfit = takeHomeAfterPlatform - otherMonthlyCost`
- `annualizedNetProfit = monthlyNetProfit * 12`

### Margin model for break-even / target gross
Assume the current average charge amount remains constant as volume scales.

- `flatFeeRate = processorFlatFee / averageChargeAmount`
- `contributionMarginRate = 1 - refundRate - launchPassTransactionRate - processorRate - flatFeeRate`
- `breakEvenGross = (launchPassMonthlyFee + otherMonthlyCost) / contributionMarginRate`
- `requiredGrossForTargetNet = (launchPassMonthlyFee + otherMonthlyCost + desiredMonthlyNetProfit) / contributionMarginRate`

If `contributionMarginRate <= 0`, break-even and target-gross outputs are unavailable.

### Charge-count outputs
- `breakEvenSuccessfulCharges = breakEvenGross / averageChargeAmount`
- `requiredSuccessfulChargesForTargetNet = requiredGrossForTargetNet / averageChargeAmount`

## UX requirements
- Single responsive static page
- Inputs on the left and results on the right on desktop
- Stacked mobile layout
- Reset button and copy-summary button
- Error state for invalid inputs
- KPI cards, detailed breakdown, comparison table, and summary textarea
- Adjacent-tool links back to `/tools/` and related creator calculators
- Korean/English toggle

## SEO requirements
- title, description, canonical
- OG/Twitter tags
- JSON-LD `WebApplication`

## Test requirements
- golden default scenario with exact values
- higher refund rate lowers profit
- international processor preset lowers profit vs domestic
- custom processor override works
- break-even / target gross return null for impossible economics
- invalid inputs fail validation
- HTML scaffold contains required anchors
- discovery files contain the slug exactly once

## Acceptance
- Tool page exists and renders
- `node --check` passes on JS files
- `node --test` passes for the new tool
- discovery files updated exactly once
- localhost smoke returns the correct title
