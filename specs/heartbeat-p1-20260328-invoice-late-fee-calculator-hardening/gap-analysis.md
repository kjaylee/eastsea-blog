# Gap Analysis — Invoice Late Fee Calculator Hardening

## Closed
- Discovery gap in `_data/tools-list.json`
- Discovery gap in `tools/index.md`
- Verification gap (new deterministic tests)
- Logic bug where fixed late fee applied even during non-late / grace-period states

## Remaining acceptable gaps
- Contract terms vary across jurisdictions and vendors; v1 still uses a single fixed-fee assumption.
- No toggle yet for “fixed fee applies immediately on first late day” vs “after grace only”.
- No localization beyond Korean-centric currency/summary presentation.

## Why acceptable now
This slice stays narrow, fixes a real billing logic issue, and restores search/discovery coverage without widening into a full invoicing policy engine.
