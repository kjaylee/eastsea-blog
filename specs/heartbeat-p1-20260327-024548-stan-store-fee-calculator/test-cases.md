# Test Cases — Stan Store Fee Calculator

## Logic
- `TC-STAN-01` Creator baseline with Stripe US preset returns expected gross, processor fees, and monthly net.
- `TC-STAN-02` Creator Pro baseline uses the higher `$99` monthly fee and lower take-home when uplift is zero.
- `TC-STAN-03` Positive Pro uplift flips the winner and produces positive monthly/annual delta.
- `TC-STAN-04` Break-even gross sales for Pro matches expected threshold when uplift is zero.
- `TC-STAN-05` Required uplift returns `null` or safe fallback when denominator is non-positive.
- `TC-STAN-06` PayPal preset uses its own baseline fee constants, not Stripe constants.
- `TC-STAN-07` Recurring Stripe share adds the recurring surcharge when applicable.
- `TC-STAN-08` International Stripe share adds the international surcharge when applicable.
- `TC-STAN-09` Invalid inputs are rejected:
  - non-positive order value
  - non-integer orders
  - refund rate outside range
  - unsupported preset
  - negative costs

## HTML / page contract
- `TC-STAN-10` HTML contains exact title, canonical path, analytics script, calculator script, and summary textarea.
- `TC-STAN-11` HTML contains visible copy for Creator vs Creator Pro, processor preset, and planning-model note.

## Discovery wiring
- `TC-STAN-12` slug appears exactly once in `tools/index.html`.
- `TC-STAN-13` slug appears exactly once in `tools/index.md`.
- `TC-STAN-14` URL appears exactly once in `_data/tools-list.json`.
- `TC-STAN-15` manifest contains exactly one matching slug/url pair.

## Manual smoke
- `TC-STAN-16` Page loads locally without console errors.
- `TC-STAN-17` Changing any input recomputes results instantly.
- `TC-STAN-18` Copy summary action returns a readable decision-ready summary.
