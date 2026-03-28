# Spec — Whop Fee Calculator

## Slug
`whop-fee-calculator`

## Objective
Create a static calculator that helps creators estimate actual take-home on Whop after payment fees, optional revenue-ops fees, payout fees, and their own operating costs.

## User
- Creator selling access, memberships, or digital products on Whop
- Operator comparing Whop take-home with another creator platform
- Small team pricing a Whop offer and checking margin before launch

## User stories
1. As a creator, I can estimate net payout on a typical Whop transaction.
2. As an operator, I can toggle international cards, FX conversion, billing, tax/remittance, and affiliate fees to see how take rate changes.
3. As a seller, I can include my own delivery costs and find a break-even price.
4. As a buyer of software / services, I can copy a summary for planning or internal review.

## In scope
- Single static page at `tools/whop-fee-calculator/index.html`
- Deterministic calculator logic in `calculator.js`
- Inputs and outputs that match the public Whop fee model conservatively
- SEO framing around `Whop Fee Calculator`
- Copyable summary
- FAQ with scope limits and assumption notes
- Standard EastSea discovery wiring after implementation

## Out of scope
- Tax filing advice
- Creator income-tax estimates
- Fraud-loss forecasting
- Dynamic fee syncing from Whop
- Full business valuation or MRR analytics
- Team-payout workflow management

## Inputs
- `salePrice`
- `transactions`
- `domesticSharePct`
- `internationalSharePct`
- `fxConversionSharePct`
- `billingEnabled`
- `taxRemittanceEnabled`
- `affiliateEnabled`
- `affiliateCommissionBasePct`
- `payoutMethod`
- `sellerCostPerSale`
- `monthlyFixedCost`

Optional advanced inputs:
- `processorDomesticPct` default `2.7`
- `processorFixedUsd` default `0.30`
- `internationalSurchargePct` default `1.5`
- `fxSurchargePct` default `1.0`
- `billingPct` default `0.5`
- `taxPct` default `0.5`
- `affiliateProcessingPct` default `1.25`
- payout-fee defaults based on selected method

## Outputs
- gross revenue
- total processor fees
- total international surcharge
- total FX surcharge
- total billing fee
- total tax/remittance fee
- total affiliate-processing fee
- total payout fee
- take-home before seller costs
- net profit after seller costs
- effective take rate
- net margin
- break-even sale price per transaction
- optional break-even transaction count for monthly fixed costs

## Formula direction
Let:
- `grossRevenue = salePrice * transactions`
- `domesticTransactions = transactions * domesticSharePct`
- `internationalTransactions = transactions * internationalSharePct`
- `processorBase = grossRevenue * processorDomesticPct + transactions * processorFixedUsd`
- `internationalFee = grossRevenue * internationalSharePct * internationalSurchargePct`
- `fxFee = grossRevenue * fxConversionSharePct * fxSurchargePct`
- `billingFee = billingEnabled ? grossRevenue * billingPct : 0`
- `taxFee = taxRemittanceEnabled ? grossRevenue * taxPct : 0`
- `affiliateFee = affiliateEnabled ? grossRevenue * affiliateProcessingPct : 0`
- `payoutFee = fee implied by payoutMethod`
- `totalPlatformAndProcessorFees = processorBase + internationalFee + fxFee + billingFee + taxFee + affiliateFee + payoutFee`
- `takeHomeBeforeSellerCosts = grossRevenue - totalPlatformAndProcessorFees`
- `sellerVariableCost = sellerCostPerSale * transactions`
- `netProfit = takeHomeBeforeSellerCosts - sellerVariableCost - monthlyFixedCost`

Break-even price:
- solve for per-transaction price where `netProfit = 0`
- if the fee stack makes the equation impossible, return `null` with a user-facing explanation

## Validation
- Numeric finite inputs only
- No negative price, cost, or transaction counts
- Domestic + international share must equal `100%`
- FX conversion share cannot exceed international share
- Percent inputs must stay within `0–100`
- Impossible combinations should fail gracefully with a readable error

## Content / SEO requirements
- Title contains `Whop Fee Calculator`
- Meta description includes Whop fees, payout, take-home, and break-even language
- Canonical URL points to `/tools/whop-fee-calculator/`
- JSON-LD `WebApplication`
- FAQ should answer:
  - how much does Whop take?
  - does Whop charge extra for international cards or currency conversion?
  - should payout fees be modeled separately?

## UX requirements
- Fast static page with mobile-safe layout
- Inputs grouped into:
  - transaction assumptions
  - optional Whop fee layers
  - payout assumptions
  - seller costs
- KPI-first result layout
- Summary box for copy/paste
- Clear assumption note that all fee constants must be re-verified at implementation time

## Adjacent internal links
Prefer creator-platform neighbors instead of resale neighbors:
- `skool-fee-calculator`
- `stan-store-fee-calculator`
- `kajabi-fee-calculator`
- `teachable-fee-calculator`
- `memberful-fee-calculator`

## Done criteria
- Repo gains only docs in this task
- Future implementation would create:
  - `tools/whop-fee-calculator/index.html`
  - `tools/whop-fee-calculator/calculator.js`
  - `tools/whop-fee-calculator/calculator.test.js`
- Discovery wiring should remain untouched until implementation
