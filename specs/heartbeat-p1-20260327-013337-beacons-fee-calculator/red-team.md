# Red Team — Beacons Fee Calculator

## Risk: Beacons pricing copy drifts
- Pricing pages and plan packaging can change.
- Mitigation: use editable custom plan fields and frame standard plans as current public defaults reviewed on 2026-03-27.

## Risk: Conflicting older Beacons store copy
- Older marketing pages mention Store Pro at $10/month with 0% transaction fees, while the current plans page shows Creator still at 9% seller fees and Creator Plus/Max at 0%.
- Mitigation: prefer the current `beacons.bio/i/plans` plan page for defaults, mention that creators should confirm current plan terms before relying on the estimate.

## Risk: Refund handling is approximate
- Processor fee reversals are not always complete and may depend on provider policy.
- Mitigation: keep refund rate editable and note that refund math is an estimate, not settlement accounting.

## Risk: Affiliate-share fee ordering
- Beacons-specific settlement details can vary by product flow.
- Mitigation: document the v1 assumption that affiliate payouts reduce the base before Beacons seller fees for paid-sale scenarios.

## Risk: Users may expect tax/VAT support
- This tool does not model tax remittance.
- Mitigation: explicitly state taxes are out of scope in-page.

