# Spec — Whatnot Seller Fee Calculator

## Objective
Build a static calculator that estimates Whatnot seller fees, payout after fees, and net profit under the public US-baseline fee model.

## Target path
- `tools/whatnot-seller-fee-calculator/index.html`
- `tools/whatnot-seller-fee-calculator/calculator.js`
- `tools/whatnot-seller-fee-calculator/calculator.test.js`

## Inputs
- Sale price (`salePrice`)
- Commission preset (`commissionPreset`)
  - standard = 8%
  - electronics = 5%
  - coins-money = 4%
  - custom = user-entered rate
- Commission rate % (`commissionRatePct`)
- Buyer-paid shipping (`buyerShipping`)
- Buyer-paid tax (`buyerTax`)
- Item cost (`itemCost`)
- Seller shipping subsidy (`sellerShippingSubsidy`)
- Packaging cost (`packagingCost`)
- Other cost (`otherCost`)

## Output contract
Calculator must return:
- `commissionFee`
- `processingBase`
- `processingFee`
- `whatnotFeeTotal`
- `payoutAfterFees`
- `sellerCostTotal`
- `totalCost`
- `netProfit`
- `netMargin`
- `netMarginPct`
- `effectiveFeeRate`
- `effectiveFeeRatePct`
- `breakEvenSalePrice`
- `maxSellerShippingSubsidyBeforeLoss`
- `maxItemCostBeforeLoss`
- `summary`

## Math
- `commissionFee = salePrice * commissionRate`
- `processingBase = salePrice + buyerShipping + buyerTax`
- `processingFee = processingBase * 0.029 + 0.30`
- `whatnotFeeTotal = commissionFee + processingFee`
- `payoutAfterFees = salePrice - whatnotFeeTotal`
- `sellerCostTotal = itemCost + sellerShippingSubsidy + packagingCost + otherCost`
- `totalCost = whatnotFeeTotal + sellerCostTotal`
- `netProfit = salePrice - totalCost`
- `netMargin = netProfit / salePrice`
- `effectiveFeeRate = whatnotFeeTotal / salePrice`
- `maxSellerShippingSubsidyBeforeLoss = payoutAfterFees - (itemCost + packagingCost + otherCost)`
- `maxItemCostBeforeLoss = payoutAfterFees - (sellerShippingSubsidy + packagingCost + otherCost)`

### Break-even formula
Solve for sale price directly:

`breakEvenSalePrice = (0.029 * (buyerShipping + buyerTax) + 0.30 + sellerCostTotal) / (1 - commissionRate - 0.029)`

If denominator `<= 0`, return `null`.

## Validation rules
- Sale price must be finite and `> 0`
- All money inputs must be finite and `>= 0`
- Commission preset must exist
- Custom commission rate must be finite and `>= 0` and `< 100`
- For non-custom presets, user-entered commission should be ignored and replaced by preset value

## UX requirements
- Responsive page
- Bilingual EN/KO labels via toggle
- Copy summary button
- Reset defaults button
- Visible disclaimer that this is a US-baseline estimate
- Assumptions box describing shipping/tax treatment
- KPI cards + detailed breakdown

## SEO / catalog requirements
- `<title>` and meta description optimized for Whatnot seller fee intent
- Include canonical URL
- Include `/assets/analytics.js`
- Add discovery wiring:
  - `_data/tools-list.json`
  - `tools/manifest.json` via rebuild
  - `tools/index.html`
  - `tools/index.md`

## Non-goals
- International VAT / FX handling
- Temporary Whatnot promotions
- Live label-cost estimation
- Marketplace-specific coupon creation flows
