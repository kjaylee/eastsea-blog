# Design Doc — Venmo Fee Calculator

## One-line concept
A static EastSea calculator that turns Venmo’s public fee table into decision-ready take-home math for sellers, business profiles, charities, and Tap to Pay use cases.

## User promise
Answer one question fast: **"If I use Venmo to receive payments, how much do I actually keep?"**

## Core UX
- one-screen calculator
- mobile-safe layout
- fast inputs on the left, results on the right
- bilingual toggle (EN/KR) to match EastSea pattern
- copy-ready summary for decision sharing
- scenario comparison table across all Venmo receiving modes

## Inputs
- receiving mode
- monthly payment count
- average payment amount
- refund rate
- transfer method (standard / instant)
- monthly transfer count
- fixed monthly cost
- target monthly net profit

## Key outputs
- gross volume
- refund loss
- Venmo transaction fees
- transfer fees
- take-home before fixed cost
- monthly net profit
- effective fee rate
- break-even payment count
- required average payment for target net
- all-mode comparison

## Formula decisions
### Receiving modes
- personal goods & services: `2.99%`
- business profile: `1.9% + $0.10`
- business Tap to Pay: `2.29% + $0.09`
- charity profile: `1.9% + $0.10`

### Transfer fees
- standard: `0`
- instant: `1.75%`, minimum `$0.25`, maximum `$25` per transfer

### Refund handling
Conservative by default:
- refunds reduce kept revenue
- no fee reversal assumed

## Real need vs requested feature
Requested feature: a plain Venmo fee calculator.

Actual product need: a **take-home and payout-planning calculator**. A raw fee table is not enough; users need net outcomes and threshold math.

## Recommendation
Ship the narrowest wedge now. It is exact-match SEO friendly, commercially useful, and easy to verify without hidden assumptions.

## Next step
Proceed to spec → plan → red-team → test-cases → implementation.

## Embedded Red Team
- [공격 1]: Query intent may be broader than receiving payments alone.
- [공격 2]: Too many receiving modes could confuse users if labels are vague.
- [공격 3]: Transfer math could be overfit if users actually cash out more or less frequently than assumed.
- [방어/완화]: Use plain labels, show assumptions inline, expose transfer count as an input, and compare all modes on the same assumptions.
- [합의]: 🟢극복
