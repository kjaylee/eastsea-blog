# Gap Analysis — Creator Brand Deal Take-home Calculator

## Shipped in v1
- deterministic brand-deal take-home math
- rights add-ons for paid usage, whitelisting, and exclusivity
- rep/platform/payment deductions
- hard-cost and tax-reserve modeling
- reverse solver for target creator net
- exact-once catalog wiring and manifest generation

## Not shipped yet
- multi-currency presets or FX support
- contract export / proposal PDF generation
- audience benchmark presets or niche-rate suggestions
- platform-specific deal templates (for example marketplace-managed creator campaigns)
- VAT / withholding tax handling by jurisdiction
- separate creator vs agency-margin views for multi-party deal packaging

## Highest-value next slice
1. Add optional quote presets for common creator deal structures:
   - organic only
   - organic + paid usage
   - organic + whitelisting + exclusivity
2. Add a second solver for “brand budget ceiling → max creator net”.
3. Add currency selector plus locale-aware formatting without changing the underlying same-currency math model.

## Known repo-level blockers outside this slice
- broader manifest/link tests currently fail on pre-existing `posts.json` and `novels/manifest.json` drift
- those issues were not modified here and should be handled in a separate cleanup cycle
