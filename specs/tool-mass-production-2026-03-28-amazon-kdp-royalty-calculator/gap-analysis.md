# Gap Analysis — Amazon KDP Royalty Calculator

## What shipped
- eBook mode with public KDP 35% / 70% formulas
- Marketplace-specific delivery-cost presets
- Eligible-sales-share blending for 70% territory coverage
- Paperback mode with public 50% / 60% Amazon marketplace bands and 40% Expanded Distribution formula
- Exact-once catalog wiring in tool index + markdown + tools-list + manifest
- Deterministic unit tests

## Known gaps
1. **Hardcover not included**
   - Intent: keep this slice surgical and ship ebook + paperback first.
   - Next slice: add hardcover marketplace thresholds if official public docs are collected and scoped cleanly.

2. **Kindle Unlimited page-read payout not modeled**
   - Intent: KU payout is monthly fund-driven and a different mental model than list-price royalties.
   - Next slice: separate KU estimator if needed.

3. **70% eligibility rules are warned, not fully enforced**
   - The tool warns users to verify KDP pricing-page compliance rather than pretending to encode every edge case (price matching, public domain, territory/legal requirements).

4. **Printing cost is user-entered**
   - This is deliberate. KDP printing cost depends on page count, ink, and marketplace; hardcoding speculative print tables would be less trustworthy than manual input from KDP.

## Verdict
Good v1 scope. The tool solves the core pricing question without bluffing on KDP edge cases.
