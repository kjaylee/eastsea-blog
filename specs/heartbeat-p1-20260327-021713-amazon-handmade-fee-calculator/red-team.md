# Red Team — Amazon Handmade Fee Calculator

## Risks
- Users may assume shipping is part of Amazon Handmade’s official referral-fee base.
- Users may confuse the optional first-month `$39.99` planning toggle with an ongoing Handmade fee.
- Very low item prices can make the `$1` minimum fee dominate and surprise users.
- Discovery wiring could silently fail because two discovery files already mention the slug while two do not.
- Break-even and target-price roots can be wrong if the piecewise fee floor is handled poorly.

## Mitigations
1. State the assumption clearly: referral fee is modeled on item price only in v1.
2. Label the first-month fee as optional onboarding cash drag, not a permanent Handmade fee.
3. Surface the effective referral rate so users see when the $1 minimum fee bites.
4. Add exact-once assertions across `tools/index.html`, `tools/index.md`, `_data/tools-list.json`, and `tools/manifest.json`.
5. Use numeric root search instead of a brittle closed-form shortcut.

## Edge cases to defend
- `monthlyOrders = 0`
- `itemPrice < 6.67` where the fee floor dominates
- negative or NaN inputs
- impossible target-profit scenarios if monthly orders stay at `0`

## Decision
Proceed. The risks are manageable with explicit copy and deterministic tests.
