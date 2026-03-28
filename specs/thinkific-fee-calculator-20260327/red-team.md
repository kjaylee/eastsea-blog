# Red Team — Thinkific Fee Calculator

## Attack 1
Thinkific Payments pricing varies by country, payment method, and payment type. A fake "universal" calculator would look precise while being wrong.

### Mitigation
- Keep v1 card-first with public presets only: `us-card`, `uk-card`, `eea-card`, `custom`
- Scope copy clearly states that Plus, BNPL, and non-card regional flows are out of scope
- Preserve a custom override for users outside the default presets

## Attack 2
This could devolve into another generic course-platform fee clone and add low-signal catalog clutter.

### Mitigation
- Center the page on Thinkific-specific economics:
  - extra third-party gateway fee by plan
  - the first `$1,000,000` annual cap
  - Thinkific Payments removing that extra fee
- Add threshold math for `Basic -> Start` and `Start -> Grow`

## Attack 3
The partial-cap logic is easy to misread and easy to implement incorrectly.

### Mitigation
- Test all three cap states explicitly:
  - below cap
  - crossing cap mid-period
  - already above cap
- Expose `feeExposedGross` and remaining cap in the UI so the user can audit the result

## Attack 4
Discovery wiring can silently drift even when the page itself works.

### Mitigation
- Add exact-once assertions in `tools/thinkific-fee-calculator/calculator.test.js`
- Rebuild `tools/manifest.json`
- Verify exact matches across:
  - `tools/index.html`
  - `tools/index.md`
  - `_data/tools-list.json`
  - `tools/manifest.json`

## Verdict
Acceptable for v1. The remaining risk is repo-global catalog debt, not Thinkific-specific logic.
