# Gap Analysis — Amazon Handmade Fee Calculator

## What is complete
- New exact-match Handmade fee/profit tool exists under `tools/amazon-handmade-fee-calculator/`.
- Public fee rule is modeled conservatively: 15% of buyer charge basis or $0.30 minimum.
- Monthly first-month Professional fee handling is optional and explicitly labeled.
- Deterministic tests cover both math and discovery wiring.
- SEO polish added: canonical + keywords metadata.

## Remaining gaps
1. **No account-specific fee variants**
   - This version intentionally avoids country- or program-specific exceptions.
2. **No refund/return modeling**
   - Could be a later v2 if query evidence supports it.
3. **Global catalog guard remains dirty**
   - Repo-wide tool-list mismatches are pre-existing and should be fixed separately; not a blocker for this slug-level ship.

## Decision
- Ship now.
- Reason: exact-match intent is good, overlap is low, and the current slice is already specific and verifiable.
