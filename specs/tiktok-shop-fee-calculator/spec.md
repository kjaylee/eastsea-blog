# Spec — TikTok Shop Fee Calculator

## Goal
Create a single‑page, no‑dependency calculator that estimates TikTok Shop referral fees and net payout per order, with a monthly projection. Provide standard 6% and promo 3% presets plus custom rate.

## Inputs
- Item price (USD)
- Shipping charged to customer (USD)
- Tax collected (USD)
- Platform discount (TikTok‑funded, USD)
- Referral fee rate mode: Standard 6% / New Seller Promo 3% / Custom
- Custom referral fee rate (%)
- Payment processing fee rate (%) — optional
- Payment processing fixed fee (USD) — optional
- Orders per month (count)

## Outputs
Per order:
- Customer payment total
- Referral fee base (Customer Payment + Platform Discount − Tax)
- Referral fee
- Processing fee
- Total fees
- Net payout
- Effective fee rate

Monthly:
- Gross customer payments
- Total referral fees
- Total processing fees
- Net payout

## Calculation rules
- `customerPayment = itemPrice + shipping + tax − platformDiscount`
- `referralBase = customerPayment + platformDiscount − tax`
  - Equivalent to `itemPrice + shipping` when platform discount is TikTok‑funded.
- `referralFee = referralBase × referralRate`
- `processingFee = customerPayment × processingRate + processingFixed`
- `totalFees = referralFee + processingFee`
- `netPayout = customerPayment − totalFees`
- `effectiveFeeRate = totalFees / customerPayment`

## UX/UI requirements
- Single HTML file with embedded CSS + JS (module allowed).
- Responsive layout, clear labeling, no external libraries.
- Explicit note: referral fees vary by category/region; user should verify their actual fee schedule.
- Provide a “Reset to defaults” button.

## Non‑functional
- No external network calls.
- Works in modern browsers.
