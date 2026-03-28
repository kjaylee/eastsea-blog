# Test Cases — Memberstack Fee Calculator

## Core math
- **TC-MS-01** baseline monthly Basic + Stripe domestic scenario calculates expected gross, platform fee, processor fee, refund loss, and net profit.
- **TC-MS-02** yearly billing lowers fixed cost versus monthly and can change recommendation / thresholds.
- **TC-MS-03** custom processor override increases fee drag and required gross appropriately.

## Recommendation and caps
- **TC-MS-04** recommendation never selects a plan whose member cap is below active members.
- **TC-MS-05** comparison rows expose eligibility/headroom correctly for 800, 3,000, 8,000, and 12,000 members.
- **TC-MS-06** adjacent upgrade thresholds match fixed-cost delta divided by transaction-rate delta.

## Validation
- **TC-MS-07** invalid gross, charges, refund rate, plan id, processor preset, custom rate, custom flat fee, other cost, desired net, and active members are rejected.
- **TC-MS-08** break-even / target gross return `null` when contribution denominator is not positive.

## UI and discovery
- **TC-MS-09** HTML scaffold contains required anchors and pricing copy.
- **TC-MS-10** summary includes decision-ready fields.
- **TC-MS-11** discovery surfaces contain the slug exactly once.
