# Gap Analysis — Whatnot Seller Fee Calculator

## Closed gaps
- Anti-dup check completed before slug selection
- Deterministic fee formulas implemented
- Bilingual static UI shipped
- Copy summary and reset controls shipped
- Discovery wiring completed in list, manifest, HTML index, and markdown index
- Verification evidence captured with tests and HTTP smoke

## Known scope limits
- US-baseline only
- Temporary Whatnot commission promotions excluded
- International FX / VAT logic excluded
- Buyer shipping is intentionally not treated as seller revenue in v1

## Remaining risk posture
- Low for the intended v1 use case
- Main future change risk is Whatnot fee-policy updates, not implementation instability
