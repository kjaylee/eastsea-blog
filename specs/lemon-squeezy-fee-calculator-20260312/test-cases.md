# Test Cases — Lemon Squeezy Fee Calculator

## TC-LS-01 Baseline card + US Stripe payout
**Purpose:** verify core fee math without surcharge or payout drag.

Input:
- orderCount = 100
- listPrice = 29
- taxRate = 0
- platformFeeRate = 5
- platformFixedFee = 0.50
- isInternationalPayment = false
- internationalSurchargeRate = 1.5
- paymentMethod = card
- paypalSurchargeRate = 1.5
- isSubscription = false
- subscriptionSurchargeRate = 0.5
- extraMarketingFeeRate = 0
- payoutMethod = stripe
- payoutRegion = us
- payoutCount = 1
- targetNetAfterPayoutPerOrder = 20

Expected:
- combinedPlatformRatePct = 5
- customerTotalPerOrder = 29.00
- platformFeePerOrder = 1.95
- estimatedNetAfterPayoutPerOrder = 27.05
- periodPayoutFee = 0
- targetListPriceForDesiredNetAfterPayout = 21.58 (rounded)

## TC-LS-02 International PayPal subscription + PayPal intl payout
**Purpose:** verify surcharge stacking and capped/uncapped payout handling.

Input:
- orderCount = 40
- listPrice = 49
- taxRate = 20
- platformFeeRate = 5
- isInternationalPayment = true
- internationalSurchargeRate = 1.5
- paymentMethod = paypal
- paypalSurchargeRate = 1.5
- isSubscription = true
- subscriptionSurchargeRate = 0.5
- extraMarketingFeeRate = 3
- payoutMethod = paypal
- payoutRegion = intl
- payoutCount = 2

Expected checks:
- combinedPlatformRatePct = 11.5
- customerTotalPerOrder = 58.80
- payout fee > 0
- estimatedNetAfterPayoutPerOrder remains finite
- status should remain `good` if current defaults still leave positive take-home

## TC-LS-03 Reverse pricing respects payout mode
**Purpose:** ensure desired net-after-payout price target changes by payout regime.

Method:
- compute result for Stripe US
- compute result for Stripe intl or PayPal intl with same target net

Expected:
- target list price under payout-fee regime is higher than Stripe US baseline

## TC-LS-04 Invalid numeric inputs rejected
Invalid examples:
- orderCount = 0
- payoutCount = 0
- listPrice = -1
- taxRate = 101
- platformFixedFee = -0.01
- extraMarketingFeeRate = 120

Expected:
- `result === null`
- `error` is non-empty

## TC-LS-05 Catalog integration exact-once
Expected:
- `tools/index.html` contains `href="lemon-squeezy-fee-calculator/"` exactly once
- `tools/index.md` contains `./lemon-squeezy-fee-calculator/` exactly once
- `tools/manifest.json` contains one matching slug/url entry
- `_data/tools-list.json` contains one matching URL entry
