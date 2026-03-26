# Test Cases — Beacons Fee Calculator

## Compute
- TC-BE-01: Baseline Free + Stripe scenario matches expected Beacons fee, processor fee, net profit, and break-even output.
- TC-BE-02: Creator Plus monthly beats Free when monthly gross is high enough for 0% seller fees to offset the subscription.
- TC-BE-03: Annual plan preset improves net profit versus the equivalent monthly plan.
- TC-BE-04: Custom processor override changes processor drag deterministically.
- TC-BE-05: Invalid inputs return an error and null result.
- TC-BE-06: Extreme custom fee settings return `null` break-even fields instead of dividing by a non-positive contribution margin.

## UI / content
- TC-BE-07: HTML scaffold contains required IDs, summary area, table body, calculator script, and `/assets/analytics.js`.
- TC-BE-08: Summary text contains plan, processor, Beacons fees, processor fees, and net profit.

## Discovery integrity
- TC-BE-09: Slug appears exactly once in `tools/index.html`.
- TC-BE-10: Slug appears exactly once in `tools/index.md`.
- TC-BE-11: `_data/tools-list.json` contains exactly one matching URL.
- TC-BE-12: `tools/manifest.json` contains exactly one matching slug and URL after rebuild.

## Verification commands
1. `node --check tools/beacons-fee-calculator/calculator.js`
2. `node --check tools/beacons-fee-calculator/calculator.test.js`
3. `node --test tools/beacons-fee-calculator/calculator.test.js`
4. `bash scripts/build-manifests.sh`
5. `python3 -m http.server 4173` then request `/tools/beacons-fee-calculator/`

