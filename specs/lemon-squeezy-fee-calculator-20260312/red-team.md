# Red Team — Lemon Squeezy Fee Calculator

## Risks & Attacks
- Negative take-home edge: ensure payout fees never credit losses (guarded).
- Piecewise reverse pricing: verify PayPal intl cap boundary (1000/order).
- Catalog duplication: assert exact-once across all surfaces.
- i18n: page keeps English default; Korean copy can be added incrementally.

## Mitigations
- Added non-negative payout fee guard and regression test.
- Tests cover Stripe intl and PayPal intl regimes.
- Node test asserts catalog exact-once.
