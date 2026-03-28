# Test Cases — Venmo Fee Calculator

## TC-01 Preset correctness
Given the default fee presets, the calculator exposes the exact official percentages/fixed fees for all receiving modes.

## TC-02 Baseline personal goods + standard transfer
Input:
- personal goods
- 80 payments
- $45 average payment
- 2% refund rate
- standard transfer
- 1 transfer/month
- $120 fixed monthly cost
Expected:
- gross = `$3600.00`
- Venmo fees = `$107.64`
- refund loss = `$72.00`
- transfer fees = `$0.00`
- take-home before fixed cost = `$3420.36`
- monthly net = `$3300.36`

## TC-03 Business profile + instant transfer mid-band
Input:
- business profile
- 120 payments
- $30 average payment
- 0% refunds
- instant transfer
- 4 transfers/month
Expected:
- per-transfer balance uses the official 1.75% rule without min/max clipping
- transfer fees > 0
- business profile keeps more than personal-goods mode under the same assumptions

## TC-04 Instant transfer minimum
A tiny balance with 2 instant payouts applies the `$0.25` minimum per payout.

## TC-05 Instant transfer maximum
A very large balance with 3 instant payouts applies the `$25` maximum per payout.

## TC-06 Charity vs business standard
Under identical assumptions, charity profile and business profile standard have equal fee math.

## TC-07 Break-even guard
If fixed monthly cost is too high and unit contribution is non-positive, break-even count returns `null`.

## TC-08 Target average payment search
Required average payment for target monthly net is above the current average when the target exceeds the current net.

## TC-09 Invalid inputs
Negative counts, negative fees, refund pct >= 100, and non-integer counts are rejected.

## TC-10 Discovery exact-once wiring
`venmo-fee-calculator` appears exactly once in:
- `tools/index.html`
- `tools/index.md`
- `tools/manifest.json`
- `_data/tools-list.json`
