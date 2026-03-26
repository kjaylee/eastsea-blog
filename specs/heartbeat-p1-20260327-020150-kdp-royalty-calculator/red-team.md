# Red Team: `kdp-royalty-calculator`

## Risk: overpromising precision
- KDP Select payouts vary monthly.
- Mitigation: make KU payout per page editable and label it as a planning assumption.

## Risk: users misread 70% as universal
- KDP’s 70% plan does not pay 70% in every territory.
- Mitigation: require explicit eligible-territory share input and show blended per-sale royalty.

## Risk: VAT confusion
- KDP royalty math uses list price without VAT.
- Mitigation: include VAT toggle/rate and expose net list price clearly.

## Risk: overlap with existing Amazon tools
- Could feel like another Amazon seller page.
- Mitigation: keep copy tightly focused on authors, ebooks, royalties, KU pages, and KDP.

## Risk: discovery duplication
- New slug could appear more than once or counts could drift.
- Mitigation: add exact-once tests against all four required discovery files.
