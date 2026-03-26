# Red Team — YouTube Super Chat Revenue Calculator

## Risks
1. Platform policy drift
   - Creator share or payout timing can change.
   - Mitigation: make all payout assumptions editable and present the page as a planning model, not a policy mirror.

2. User-model mismatch
   - Some creators think in concurrent viewers, not average live views.
   - Mitigation: explain the input as average live views per stream and keep the model transparent.

3. Overlap with existing YouTube tools
   - Users may confuse this with ad revenue or memberships.
   - Mitigation: title, copy, and related links explicitly separate Super Chat from ads and recurring memberships.

4. Over-precision
   - Donation behavior is volatile and spiky.
   - Mitigation: include target and break-even outputs as directional planning metrics rather than guarantees.

## Accepted tradeoff
- v1 stays deterministic and lightweight instead of adding scenario presets, historical seasonality, or per-stream variance simulation.
