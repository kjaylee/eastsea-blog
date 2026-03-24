# Spec — Lemon Squeezy Fee Calculator

## 1) Objective
Ship one new static tool at:
- `eastsea-blog/tools/lemon-squeezy-fee-calculator/`

The tool must help creators estimate:
1. Lemon Squeezy platform fees on tax-inclusive order totals
2. payout drag under Stripe vs PayPal and US vs non-US payout settings
3. take-home per order and per period
4. the list price required to net a desired amount after payout

## 2) Non-duplication requirement
This tool must remain clearly distinct from:
- `gumroad-net-revenue-calculator` — Gumroad direct vs Discover split
- `merchant-of-record-vs-direct-billing-profit-calculator` — MoR-vs-direct operating model comparison
- `paypal-fee-calculator` — PayPal payment-processing and reverse-fee math

This page is specifically for **Lemon Squeezy fee estimation** and **creator payout take-home planning**.

## 3) Deliverables
Create:
- `eastsea-blog/tools/lemon-squeezy-fee-calculator/index.html`
- `eastsea-blog/tools/lemon-squeezy-fee-calculator/calculator.js`
- `eastsea-blog/tools/lemon-squeezy-fee-calculator/calculator.test.js`

Update:
- `eastsea-blog/tools/index.html`
- `eastsea-blog/tools/index.md`
- `eastsea-blog/tools/manifest.json`
- `eastsea-blog/_data/tools-list.json`

Create process artifacts:
- `specs/lemon-squeezy-fee-calculator-20260312/plan.md`
- `specs/lemon-squeezy-fee-calculator-20260312/test-cases.md`
- `specs/lemon-squeezy-fee-calculator-20260312/verification.md`
- `specs/lemon-squeezy-fee-calculator-20260312/gap-analysis.md`
- `specs/lemon-squeezy-fee-calculator-20260312/quality-loop.md`

## 4) UX requirements
- single static HTML page
- English default with Korean toggle
- responsive layout for mobile and desktop
- visible notes explaining that Lemon Squeezy fee defaults can change
- explicit explanation that taxes are collected from the customer and not treated as creator revenue
- summary textarea + copy button
- no backend, no API dependency, no external runtime dependency beyond the existing analytics script

## 5) Inputs
Required inputs:
- `orderCount` (integer, `>= 1`)
- `listPrice` (number, `> 0`)
- `taxRate` (percent, `0..100`)
- `platformFeeRate` (percent, `0..100`, default `5`)
- `platformFixedFee` (number, `>= 0`, default `0.50`)
- `isInternationalPayment` (boolean)
- `internationalSurchargeRate` (percent, `0..100`, default `1.5`)
- `paymentMethod` (`card` or `paypal`)
- `paypalSurchargeRate` (percent, `0..100`, default `1.5`)
- `isSubscription` (boolean)
- `subscriptionSurchargeRate` (percent, `0..100`, default `0.5`)
- `extraMarketingFeeRate` (percent, `0..100`, default `0`)
- `payoutMethod` (`stripe` or `paypal`)
- `payoutRegion` (`us` or `intl`)
- `payoutCount` (integer, `>= 1`)
- `targetNetAfterPayoutPerOrder` (number, `>= 0`)

## 6) Output contract
The calculator must return these numeric outputs:
- `combinedPlatformRatePct`
- `taxAmountPerOrder`
- `customerTotalPerOrder`
- `platformFeePerOrder`
- `netBeforePayoutPerOrder`
- `periodCustomerBillings`
- `periodTaxCollected`
- `periodPlatformFees`
- `periodNetBeforePayout`
- `periodPayoutFee`
- `periodNetAfterPayout`
- `estimatedNetAfterPayoutPerOrder`
- `effectiveTakeHomeRatePct`
- `targetListPriceForDesiredNetAfterPayout`
- `targetCustomerTotalForDesiredNetAfterPayout`

Additional qualitative output:
- `payoutModeLabel`
- `status` where value is one of `good`, `tight`, `negative`

## 7) Formula contract
Let:
- `n = orderCount`
- `p = listPrice`
- `t = taxRate / 100`
- `baseRate = platformFeeRate`
- `intlRate = isInternationalPayment ? internationalSurchargeRate : 0`
- `paypalRate = paymentMethod === 'paypal' ? paypalSurchargeRate : 0`
- `subRate = isSubscription ? subscriptionSurchargeRate : 0`
- `extraRate = extraMarketingFeeRate`
- `combinedPlatformRatePct = baseRate + intlRate + paypalRate + subRate + extraRate`
- `r = combinedPlatformRatePct / 100`
- `f = platformFixedFee`

Then:
- `taxAmountPerOrder = p * t`
- `customerTotalPerOrder = p + taxAmountPerOrder`
- `platformFeePerOrder = customerTotalPerOrder * r + f`
- `netBeforePayoutPerOrder = customerTotalPerOrder - taxAmountPerOrder - platformFeePerOrder`
- `periodCustomerBillings = customerTotalPerOrder * n`
- `periodTaxCollected = taxAmountPerOrder * n`
- `periodPlatformFees = platformFeePerOrder * n`
- `periodNetBeforePayout = netBeforePayoutPerOrder * n`

### Payout formulas
- Stripe / US: `periodPayoutFee = 0`
- Stripe / intl: `periodPayoutFee = periodNetBeforePayout * 0.01`
- PayPal / US: `periodPayoutFee = payoutCount * 0.50`
- PayPal / intl: `periodPayoutFee = payoutCount * min((periodNetBeforePayout / payoutCount) * 0.03, 30)`

Then:
- `periodNetAfterPayout = periodNetBeforePayout - periodPayoutFee`
- `estimatedNetAfterPayoutPerOrder = periodNetAfterPayout / n`
- `effectiveTakeHomeRatePct = periodCustomerBillings > 0 ? (periodNetAfterPayout / periodCustomerBillings) * 100 : 0`

### Reverse-pricing contract
Target quantity:
- `targetAfterTotal = targetNetAfterPayoutPerOrder * n`

Let `unitTakeHomeFactor = 1 - ((1 + t) * r)`.
If `unitTakeHomeFactor <= 0`, reverse target price is `Infinity`.
Otherwise solve the implied `requiredNetBeforePayoutTotal` by payout regime:
- Stripe / US: `requiredNetBeforePayoutTotal = targetAfterTotal`
- Stripe / intl: `requiredNetBeforePayoutTotal = targetAfterTotal / 0.99`
- PayPal / US: `requiredNetBeforePayoutTotal = targetAfterTotal + (payoutCount * 0.50)`
- PayPal / intl uncapped case: `requiredNetBeforePayoutTotal = targetAfterTotal / 0.97`, valid only when `(requiredNetBeforePayoutTotal / payoutCount) <= 1000`
- PayPal / intl capped case: `requiredNetBeforePayoutTotal = targetAfterTotal + (payoutCount * 30)`, valid only when `(requiredNetBeforePayoutTotal / payoutCount) > 1000`

Then:
- `targetListPriceForDesiredNetAfterPayout = ((requiredNetBeforePayoutTotal / n) + f) / unitTakeHomeFactor`
- `targetCustomerTotalForDesiredNetAfterPayout = targetListPriceForDesiredNetAfterPayout * (1 + t)`

## 8) Status rules
- `good` when `estimatedNetAfterPayoutPerOrder > 0`
- `tight` when `estimatedNetAfterPayoutPerOrder` is between `-0.01` and `0.01` inclusive after rounding tolerance
- `negative` when `estimatedNetAfterPayoutPerOrder < 0`

## 9) Validation rules
- numeric inputs must be finite except explicitly returned `Infinity` reverse outputs
- `orderCount` and `payoutCount` must be integers `>= 1`
- `listPrice` must be `> 0`
- `targetNetAfterPayoutPerOrder` must be `>= 0`
- percent inputs must be within `0..100`
- invalid inputs return `{ result: null, error: string }`

## 10) Content requirements
Page copy must explicitly mention:
- Lemon Squeezy base platform fee as an editable assumption
- tax-inclusive fee calculation behavior
- optional international / PayPal / subscription surcharges from public docs
- payout method and region changing final take-home
- optional extra marketing fee for abandoned-cart or affiliate-style scenarios

## 11) Discovery requirements
- `tools/index.html` must link to the new tool exactly once
- `tools/index.md` must reference the new tool exactly once
- `tools/manifest.json` must contain exactly one entry for slug `lemon-squeezy-fee-calculator`
- `_data/tools-list.json` must contain exactly one URL `/tools/lemon-squeezy-fee-calculator/`

## 12) Done definition
Done means:
1. page exists and loads over local HTTP
2. calculator JS passes `node --check`
3. unit tests pass with `node --test`
4. catalog surfaces contain the slug/url exactly once
5. verification evidence is written down
6. gap analysis and quality-loop files are written with final iteration score `>= 90`
