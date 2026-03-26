# Gap Analysis — LaunchPass Fee Calculator

## What this closes
- Adds a missing exact-match LaunchPass monetization tool to the repo
- Expands creator/community billing coverage without repeating recent heartbeat slugs
- Covers a documented fee edge case that nearby tools do not: fee loss on refunds

## Remaining intentional limitations
- No multi-community bundle modeling
- No rush payout fee modeling
- No tax/VAT remittance logic
- No coupon/free-trial or failed-payment recovery modeling
- No chargeback dispute fee modeling

## Why these were deferred
They add complexity and maintenance burden without changing the core user question:
“How much do I keep after LaunchPass and Stripe fees, and what sales volume do I need?”

## Next adjacent low-overlap candidate
`whop-fee-calculator`

Reason:
- strong platform-exact intent
- official fee docs exist
- adjacent to creator monetization, but still distinct from LaunchPass
