# Spec — SubscribeStar Fee Calculator

## Slug
`subscribestar-fee-calculator`

## Title
SubscribeStar Fee Calculator | SubscribeStar 수수료 계산기

## Primary user
Creators evaluating how much cash they actually keep on SubscribeStar after the platform fee, creator-side processing, refunds, reserve hold, payout drag, and other monthly costs.

## Scope
Build one static calculator page that:
1. Models SubscribeStar public 5% platform fee.
2. Supports creator-covers vs subscriber-covers processing behavior.
3. Exposes reserve-hold and payout-drag assumptions explicitly.
4. Computes break-even gross and target gross for desired monthly cash.
5. Works fully client-side with deterministic tests.

## Inputs
- Monthly billed revenue
- Successful charges count
- Refund rate (%)
- Fee model preset
- Custom processing rate (%)
- Custom processing flat fee
- International surcharge toggle
- Rolling reserve toggle
- Rolling reserve rate (%)
- Payout fee rate (%)
- Payout flat fee
- Payout count per month
- Other monthly operating cost
- Desired monthly cash target

## Outputs
- Platform service fee
- Creator-side processing fee
- Refund loss
- Balance before reserve
- Reserve hold
- Payout fees
- Cash available now
- Economic net after reserve release
- Annualized cash-now net
- Average charge amount
- Effective cash-now keep rate
- Break-even billed revenue
- Required billed revenue for desired cash target
- Gap to target billed revenue
- Scenario table for core presets
- Copyable bilingual summary

## Core math
- `gross = monthlyBilledRevenue`
- `avgCharge = gross / successfulCharges`
- `platformFee = gross * 0.05`
- `processingFee = gross * creatorProcessingRate + successfulCharges * creatorProcessingFlat`
- `refundLoss = gross * refundRate`
- `balanceBeforeReserve = gross - platformFee - processingFee - refundLoss`
- `reserveHold = reserveEnabled ? max(balanceBeforeReserve, 0) * reserveRate : 0`
- `payoutBase = balanceBeforeReserve - reserveHold`
- `payoutFees = payoutBase * payoutFeeRate + payoutCount * payoutFlatFee`
- `cashAvailableNow = payoutBase - payoutFees - otherMonthlyCost`
- `economicNet = balanceBeforeReserve - payoutFees - otherMonthlyCost`
- `effectiveCashKeepRate = cashAvailableNow / gross`

Break-even/target billed revenue:
- Hold average charge amount constant.
- `flatFeeRate = successfulCharges > 0 && gross > 0 ? creatorProcessingFlat / avgCharge : null`
- `cashMarginRate = (1 - refundRate - 0.05 - creatorProcessingRate) * (1 - reserveRateIfEnabled) - payoutFeeRate - flatFeeRate`
- `breakEvenGross = (payoutCount * payoutFlatFee + otherMonthlyCost) / cashMarginRate`
- `targetGross = (desiredMonthlyCash + payoutCount * payoutFlatFee + otherMonthlyCost) / cashMarginRate`
- Return `null` for break-even/target if inputs make `cashMarginRate <= 0` or if `avgCharge <= 0`.

## Presets
- `creator-average`: `4.99% + $0.30`
- `creator-over-25`: `6.22% + $0.30`
- `creator-floor`: `3.00% + $0.30`
- `creator-ceiling`: `7.00% + $0.40`
- `subscriber-covers`: `0.00% + $0.00`
- `custom`

International toggle:
- Adds `3.5%` to creator-side percentage fees only when creator covers processing.

## UX requirements
- Responsive single page, no dependencies.
- Bilingual KO/EN toggle.
- Clear source note that published SubscribeStar fees vary by processor and jurisdiction.
- Explicit warning that reserve hold is a cash timing assumption, not a permanent loss.
- Explicit note that break-even math assumes current average charge amount remains constant.
- Back link to `/tools/`.

## Deliverables
- `tools/subscribestar-fee-calculator/index.html`
- `tools/subscribestar-fee-calculator/calculator.js`
- `tools/subscribestar-fee-calculator/calculator.test.js`
- `specs/heartbeat-p1-20260327-033334-subscribestar-fee-calculator/*`
- `_data/tools-list.json`
- `tools/index.html`
- `tools/index.md`
- `tools/manifest.json`
