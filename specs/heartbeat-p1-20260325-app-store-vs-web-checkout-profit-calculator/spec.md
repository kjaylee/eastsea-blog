# Spec — App Store vs Web Checkout Profit Calculator

## Objective
Create a public tool page at `/tools/app-store-vs-web-checkout-profit-calculator/` that turns an already-linked but missing catalog item into a working calculator.

## User story
As an app founder deciding whether to send users through App Store checkout or web checkout, I want to estimate which channel leaves more net revenue after fees, conversion leakage, refunds, and web fixed costs.

## Inputs

### Core commercial inputs
- `appStorePrice` (USD, > 0)
- `webPrice` (USD, > 0)
- `eligibleCustomers` (integer, >= 0)
- `webCaptureRatePct` (0–100)
- `appStoreRefundRatePct` (0–100)
- `webRefundRatePct` (0–100)

### App Store assumptions
- `appStoreFeeRatePct` (0–100)

### Web billing assumptions
- `merchantOfRecordFeeRatePct` (0–100)
- `paymentFeeRatePct` (0–100)
- `paymentFixedFee` (USD, >= 0)
- `monthlyWebFixedCost` (USD, >= 0)

## Derived metrics

### App Store channel
- gross billings
- refunded amount
- recognized billings
- fee amount
- net take-home
- take-home rate vs gross billings

### Web channel
- completed checkouts
- gross billings
- refunded amount
- recognized billings
- variable fee amount
- fixed payment fees
- fixed monthly web cost
- total fees + costs
- net take-home
- take-home rate vs gross billings

### Decision outputs
- monthly delta = `webNetTakeHome - appStoreNetTakeHome`
- annual delta = `monthly delta * 12`
- break-even web capture rate (minimum capture rate required for web to match App Store at current web price)
- required web price to match App Store at current capture
- short insight sentence explaining winner and why

## Formula definition

### App Store
- `appGross = eligibleCustomers * appStorePrice`
- `appRefunded = appGross * appStoreRefundRatePct / 100`
- `appRecognized = appGross - appRefunded`
- `appFee = appRecognized * appStoreFeeRatePct / 100`
- `appNet = appRecognized - appFee`

### Web
- `completedWebOrders = eligibleCustomers * webCaptureRatePct / 100`
- `webGross = completedWebOrders * webPrice`
- `webRefunded = webGross * webRefundRatePct / 100`
- `webRecognized = webGross - webRefunded`
- `webVariableFeeRatePct = merchantOfRecordFeeRatePct + paymentFeeRatePct`
- `webVariableFees = webRecognized * webVariableFeeRatePct / 100`
- `webFixedPaymentFees = completedWebOrders * paymentFixedFee`
- `webTotalCosts = webVariableFees + webFixedPaymentFees + monthlyWebFixedCost`
- `webNet = webRecognized - webTotalCosts`

### Break-even capture rate
Solve for capture `c` where web net equals app net:
- `appNet = eligibleCustomers * c * unitWebNetBeforeFixed - monthlyWebFixedCost`
- `unitWebNetBeforeFixed = webPrice * (1 - webRefundRate) * (1 - webVariableFeeRate) - paymentFixedFee`
- `c = (appNet + monthlyWebFixedCost) / (eligibleCustomers * unitWebNetBeforeFixed)`

If denominator <= 0 or eligibleCustomers = 0, break-even capture is unavailable.

### Required web price
Solve for `webPrice` where web net equals app net at current capture.
If denominator <= 0, required price is unavailable.

## UX requirements
- Single responsive static page.
- Hero copy clearly explains App Store vs web tradeoff.
- Form panel on left, result panel on right on desktop; stacked on mobile.
- Reset-example button.
- Error box for invalid inputs.
- KPI cards + comparison table + concise decision insight.
- Link to `/tools/` and adjacent app monetization tools.

## SEO requirements
- `<title>` and `<meta name="description">`
- canonical URL
- OG/Twitter tags
- JSON-LD `WebApplication`

## Test requirements
- golden default scenario with precise expected values
- web capture rate meaningfully changes net outcome
- break-even capture math behaves correctly
- required web price rises when current web setup under-earns
- validation rejects impossible inputs

## Acceptance
- Tool page exists and renders
- Node unit tests pass
- Local HTTP smoke via `curl` returns expected title string
- Repo changes remain surgical
