# Gap Analysis — Gumroad Net Revenue Calculator

## Closed gaps
- Closed a real catalog hole: discovery card existed but the tool page, manifest entry, and tools-list entry were missing.
- Delivered a deterministic calculator with transparent fee formulas for Gumroad direct/profile vs Discover sales.
- Added exact-once catalog wiring tests so the same broken-link state is less likely to recur.

## Remaining gaps
1. **Static label localization is partial**
   - Dynamic status/summary/copy feedback toggles language.
   - Most field labels are bilingual in-place rather than fully swapped per language.
   - Risk level: low.

2. **Processing presets are assumptions, not Gumroad platform fees**
   - The UI and summary clearly disclose this, but users may still confuse them.
   - Risk level: medium but mitigated by copy.

3. **No refund modeling in this version**
   - This was intentionally excluded because the research for this run did not establish a sufficiently clean official refund-fee rule.
   - Risk level: acceptable.

## Immediate next-best follow-up
If another heartbeat run continues this cluster, the best adjacent unshipped candidate is `patreon-net-revenue-calculator`, because `tools/index.html` already points to that slug but the actual page is still missing.
