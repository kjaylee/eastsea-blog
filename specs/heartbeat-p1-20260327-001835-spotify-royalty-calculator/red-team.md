# Red Team

## Main failure modes

1. False authority on payout rate
   - Risk: implying Spotify has an official fixed per-stream rate.
   - Mitigation: editable assumption input + explicit disclaimer.

2. Overlap with existing eastsea tools
   - Risk: shipping a thin variant of existing YouTube or creator calculators.
   - Mitigation: platform-specific Spotify royalty framing and music-stream threshold KPI.

3. Broken discovery integration
   - Risk: duplicate slug or missing manifest entry.
   - Mitigation: exact-once assertions in tests.

4. Negative or nonsensical outputs
   - Risk: divide-by-zero, negative streams, invalid percentages.
   - Mitigation: validation and guarded zero-stream math.

5. Misleading take-home math
   - Risk: mixing fee order incorrectly.
   - Mitigation: document formula order in spec and test with explicit fixture values.

## Acceptable residual risk

- The payout-rate assumption remains user-managed because Spotify does not expose a fixed rate.
- Distributor economics vary by contract and are intentionally modeled as generic adjustable inputs.
