# Test Cases

## Functional

1. Low-ticket monthly-only case where Hobby still wins because billed volume is below Pro break-even.
2. Mixed monthly + annual + one-time case where Pro wins and the delta is positive.
3. `$900` ticket threshold case uses the higher Pro transaction rate.
4. Zero-volume case returns zero gross and no meaningful break-even winner beyond plan fee drag.
5. Invalid negative counts, prices, or refund rate above 100 are rejected.

## Discovery

6. `skool-fee-calculator` appears exactly once in `tools/index.html`.
7. `skool-fee-calculator` appears exactly once in `tools/index.md`.
8. `/tools/skool-fee-calculator/` appears exactly once in `_data/tools-list.json`.
9. `skool-fee-calculator` appears exactly once in `tools/manifest.json`.

## Smoke

10. Page loads over localhost with no missing script errors.
