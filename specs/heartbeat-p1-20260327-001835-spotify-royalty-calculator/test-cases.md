# Test Cases

## Functional math

1. Baseline profitable artist-owned catalog
   - Monthly streams: 120,000
   - Payout/stream: 0.0035
   - Artist share: 100%
   - Distributor fee: 0%
   - Collaborator split: 0%
   - Expect gross royalties = take-home before fixed = 420.00

2. Label/distributor/collab drag
   - Monthly streams: 250,000
   - Payout/stream: 0.0038
   - Artist share: 65%
   - Distributor fee: 10%
   - Collaborator split: 20%
   - Expect positive but materially reduced take-home

3. Fixed costs drive net negative
   - Low streams, meaningful annual distro cost
   - Expect positive gross but negative take-home after fixed costs

4. Zero streams
   - Expect all money outputs = 0 or negative only by fixed costs
   - No `NaN` or `Infinity`

5. Threshold helper
   - 60 monthly streams => 720 annual streams => 280 gap to 1,000

6. Reverse target streams
   - Known inputs should solve to finite required streams

## Validation

7. Negative monthly streams rejected
8. Payout per stream <= 0 rejected
9. Percentages outside 0..100 rejected
10. Non-numeric input rejected

## Discovery integrity

11. `_data/tools-list.json` contains slug exactly once
12. `tools/index.html` contains slug exactly once
13. `tools/index.md` contains slug exactly once
14. `tools/manifest.json` contains slug exactly once
