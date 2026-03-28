# Spec — Amazon Handmade Fee Calculator

## Slug
`amazon-handmade-fee-calculator`

## Title
Amazon Handmade Fee Calculator | 아마존 핸드메이드 수수료 계산기

## Primary user
Amazon Handmade sellers who need quick per-order and monthly take-home planning before listing or repricing handcrafted products.

## Scope
Build a static calculator that:
1. Uses the public Handmade referral-fee rule: 15% of buyer charge basis or $0.30 minimum.
2. Lets users include shipping and gift-wrap charged to the buyer in the fee basis.
3. Lets users model material, packaging, actual shipping, ad, and monthly fixed costs.
4. Lets users optionally include the first-month Professional plan fee.
5. Outputs monthly net profit, net profit per order, effective referral rate, break-even price, target-net price, and required orders.
6. Works fully client-side with deterministic tests.

## Inputs
- Product price
- Shipping charged to buyer
- Gift-wrap charged to buyer
- Material cost per order
- Packaging cost per order
- Actual shipping cost per order
- Ad cost per order
- Monthly orders
- Include first-month Professional fee (boolean)
- First-month Professional fee
- Other monthly fixed cost
- Target monthly net profit
- Currency (default USD)

## Outputs
- Buyer charge basis
- Referral fee per order
- Effective referral rate
- Variable cost per order
- Net profit per order
- Monthly fixed costs
- Monthly net profit
- Required monthly orders for target net
- Break-even product price
- Target product price
- Copyable summary block

## Math
Definitions:
- `buyerChargeBasis = productPrice + shippingChargedToBuyer + giftWrapChargedToBuyer`
- `referralFeePerOrder = max(buyerChargeBasis * 0.15, 0.30)`
- `variableCostPerOrder = materialCost + packagingCost + shippingCost + adCostPerOrder`
- `netProfitPerOrder = buyerChargeBasis - referralFeePerOrder - variableCostPerOrder`
- `monthlyFixedCosts = otherMonthlyCost + (includeFirstMonthProfessionalFee ? firstMonthProfessionalFee : 0)`
- `monthlyNetProfit = netProfitPerOrder * monthlyOrders - monthlyFixedCosts`
- `requiredMonthlyOrders = ceil((targetMonthlyNet + monthlyFixedCosts) / netProfitPerOrder)` when `netProfitPerOrder > 0`, else `null`
- Reverse price solver returns the smallest product price that achieves target monthly net at the current order count, or `null` if no finite solution is found.

## UX requirements
- Responsive single-page layout.
- Clear explanation that shipping and gift-wrap charged to the buyer are included in the fee basis modeled here.
- Clear note that the Professional fee toggle is for first-month/onboarding planning only.
- Copy summary button.
- Back link to `/tools/`.
- Analytics include and SEO-ready head metadata.

## SEO/meta
- Title includes `Amazon Handmade Fee Calculator` exact match.
- Description mentions 15% referral fee, $0.30 minimum, and first-month Professional fee.
- Keywords include `amazon handmade fee calculator` and adjacent terms.
- Canonical points to `/tools/amazon-handmade-fee-calculator/`.

## Deliverables
- `tools/amazon-handmade-fee-calculator/index.html`
- `tools/amazon-handmade-fee-calculator/calculator.js`
- `tools/amazon-handmade-fee-calculator/calculator.test.js`
- discovery/catalog presence exactly once in:
  - `tools/index.html`
  - `tools/index.md`
  - `_data/tools-list.json`
  - `tools/manifest.json`
