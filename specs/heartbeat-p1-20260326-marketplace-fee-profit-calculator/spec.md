# Spec — Marketplace Fee Profit Calculator Logic/Test Hardening

## Task id
`heartbeat-p1-20260326-marketplace-fee-profit-calculator`

## Goal
Harden the shipped `marketplace-fee-profit-calculator` so its math becomes reusable, testable, and verifiable without changing the product scope.

## User promise
A seller should get the same on-page outputs as before, but the calculator logic must now live in a dedicated JS module with deterministic automated coverage.

## In scope
1. Create `tools/marketplace-fee-profit-calculator/calculator.js`
2. Move current inline calculation behavior into exported pure functions
3. Keep browser initialization in the external script so the page still works standalone
4. Replace the inline script in `index.html` with a script tag loading `calculator.js`
5. Add deterministic unit tests covering baseline math, validation, edge failures, HTML anchors, and catalog exact-once wiring

## Out of scope
- changing the slug
- changing catalog discoverability surfaces
- redesigning layout/copy beyond minimal script wiring needs
- adding backend or analytics changes

## Required behavior
### Inputs
- `price`
- `cogs`
- `shipping`
- `adSpend`
- `marketRate`
- `marketFixed`
- `paymentRate`
- `paymentFixed`
- `returnRate`
- `returnLoss`
- `targetMargin`

### Outputs
- `marketFee`
- `paymentFee`
- `feeBurden`
- `expectedRevenue`
- `expectedReturnLoss`
- `baseCost`
- `expectedProfit`
- `expectedMargin`
- `breakEvenPrice`
- `targetPrice`
- `kFactor`
- copyable summary block

### Math contract
For validated input values:
- `r = returnRate / 100`
- `mp = marketRate / 100`
- `pp = paymentRate / 100`
- `tm = targetMargin / 100`
- `marketFee = price * mp + marketFixed`
- `paymentFee = price * pp + paymentFixed`
- `feeBurden = marketFee + paymentFee`
- `expectedRevenue = price * (1 - r)`
- `expectedReturnLoss = r * returnLoss`
- `baseCost = cogs + shipping + adSpend`
- `expectedProfit = expectedRevenue - (baseCost + feeBurden + expectedReturnLoss)`
- `expectedMargin = (expectedProfit / price) * 100`
- `kFactor = (1 - r) - (mp + pp)`
- if `kFactor <= 0`, return an error for impossible break-even math
- `breakEvenPrice = (baseCost + marketFixed + paymentFixed + expectedReturnLoss) / kFactor`
- `targetDenom = kFactor - tm`
- if `targetDenom <= 0`, return an error for impossible target-price math
- `targetPrice = (baseCost + marketFixed + paymentFixed + expectedReturnLoss) / targetDenom`

## Validation contract
- `price` must be finite and > 0
- cost/fixed-fee fields must be finite and >= 0
- `marketRate`, `paymentRate`, `returnRate` must be finite and in `[0, 100)`
- `targetMargin` must be finite and in `[0, 95)`

## Technical requirements
- `calculator.js` must be loadable in the browser and importable from Node tests
- browser script must attach all existing event listeners and preserve reset/copy behavior
- `index.html` must include `/assets/analytics.js` and `./calculator.js`
- no new external dependencies

## Deliverables
- `tools/marketplace-fee-profit-calculator/index.html`
- `tools/marketplace-fee-profit-calculator/calculator.js`
- `tests/unit/marketplace-fee-profit-calculator.test.mjs`
- verification artifacts in `specs/heartbeat-p1-20260326-marketplace-fee-profit-calculator/`
