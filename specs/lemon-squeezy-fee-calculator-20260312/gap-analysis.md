# Gap Analysis — Lemon Squeezy Fee Calculator

## Round 1 review
### Score
- `88/100`

### Gaps found
1. Negative payout-fee artifact in loss scenarios could incorrectly credit results.
2. Missing regression coverage for that edge case.

### Fixes applied
- Guarded payout fees so they only apply when `periodNetBeforePayout > 0`.
- Added regression test: `negative take-home does not create a negative payout fee credit`.
- Re-ran `node --check`, `node --test`, and exact-once catalog assertions.

## Round 2 review
### Score
- `94/100`

### Remaining trade-offs
1. Reverse pricing still uses public/default fee assumptions rather than account-specific contracts.
2. Numeric outputs are intentionally currency-agnostic; the page formats numbers but does not model multi-currency FX conversion.

### Fixes applied
- Confirmed bilingual UI is present in v1 via English default + Korean toggle.
- Confirmed summary textarea/copy flow and payout mode labeling are wired in the shipped page.

## Round 3 review
### Score
- `97/100`

### Final residual risks
1. Lemon Squeezy public fee assumptions can change over time; the page mitigates this by keeping fee inputs editable and warning the user.
2. The calculator is deterministic by design and does not model bespoke enterprise payout agreements or FX spread.

## Pass / fail
- **Pass** — final score above the 90 threshold and verified with real local HTTP loading.
