# Spec — Chargeback Rate Threshold Calculator

## Goal
Ship one static calculator page at `tools/chargeback-rate-threshold-calculator/` that helps merchants understand whether current dispute volume is safely below common public threshold bands.

## User story
As a merchant / payments operator,
I want to enter my dispute volume and transaction counts,
so I can see my chargeback ratio under multiple denominator conventions and know how much headroom remains before common monitoring thresholds.

## Functional requirements
1. Accept numeric inputs for chargebacks, current-month transactions, previous-month transactions, average order value, chargeback fee, recovery rate, monitored threshold %, excessive threshold %, and monitored count threshold.
2. Validate required numeric ranges with human-readable messages.
3. Calculate same-month and lagged-denominator ratios.
4. Calculate maximum allowed disputes for the monitored and excessive thresholds under both denominator views.
5. Calculate dispute headroom / overage for each threshold view.
6. Calculate transactions required to get current chargebacks back under the monitored threshold for both denominator views.
7. Calculate gross disputed volume, unrecovered dispute revenue, fee burn, total monthly exposure, and annualized exposure.
8. Render decision-ready KPI cards, a detail table, and copyable summary text.
9. Include caveat copy that network / acquirer methods vary and this tool is an estimator, not legal advice.
10. Be responsive on mobile.

## Non-functional requirements
- No external API calls.
- Deterministic pure calculation module exportable to Node tests.
- Static HTML + JS only.
- Keep edits surgical: one tool folder, one unit test, one markdown index row, one HTML tool card, one tools-list entry, manifest rebuild.

## UI requirements
- Title: `Chargeback Rate Threshold Calculator`
- Subheadline must explain same-month vs lagged denominator logic.
- Left card: inputs + copy/reset + estimator note.
- Right card: KPI tiles + detail table.
- Visual status pill must show one of:
  - safely below monitored threshold
  - count threshold breached
  - ratio threshold breached
  - excessive threshold breached
- Include links back to `/tools/` and optionally to related chargeback tools.

## Calculation spec
### Inputs
- `chargebacks` >= 0 integer-ish number
- `transactionsCurrent` > 0
- `transactionsPrevious` > 0
- `averageOrderValue` >= 0
- `chargebackFee` >= 0
- `recoveryRate` between 0 and 100
- `monitoredRatePct` > 0 and < 100
- `excessiveRatePct` > monitoredRatePct and < 100
- `monitoredCountThreshold` >= 0

### Formulas
- `sameMonthRatePct = (chargebacks / transactionsCurrent) * 100`
- `laggedRatePct = (chargebacks / transactionsPrevious) * 100`
- `maxDisputesMonitoredCurrent = floor(transactionsCurrent * monitoredRatePct / 100)`
- `maxDisputesMonitoredLagged = floor(transactionsPrevious * monitoredRatePct / 100)`
- `maxDisputesExcessiveCurrent = floor(transactionsCurrent * excessiveRatePct / 100)`
- `maxDisputesExcessiveLagged = floor(transactionsPrevious * excessiveRatePct / 100)`
- `headroom = maxAllowed - chargebacks`
- `transactionsNeededForMonitoredCurrent = chargebacks / (monitoredRatePct / 100)`
- `transactionsNeededForMonitoredLagged = chargebacks / (monitoredRatePct / 100)`
- `grossDisputedVolume = chargebacks * averageOrderValue`
- `unrecoveredDisputedVolume = grossDisputedVolume * (1 - recoveryRate / 100)`
- `feeBurn = chargebacks * chargebackFee`
- `monthlyExposure = unrecoveredDisputedVolume + feeBurn`
- `annualizedExposure = monthlyExposure * 12`

### Status policy
- If `chargebacks >= monitoredCountThreshold`, include count-breach warning.
- If either ratio >= `excessiveRatePct`, status = excessive threshold breached.
- Else if either ratio >= `monitoredRatePct`, status = ratio threshold breached.
- Else if count threshold breached, status = count threshold breached.
- Else status = safely below monitored threshold.

## Content requirements
Summary textarea must include:
- same-month ratio
- lagged ratio
- monitored threshold comparison
- excessive threshold comparison
- count threshold comparison
- monthly exposure
- annualized exposure
- transactions needed for monitored band

## Discovery wiring requirements
- Add one entry in `tools/index.md`
- Add one card in `tools/index.html`
- Add one entry in `_data/tools-list.json`
- Rebuild `tools/manifest.json`

## Done definition
Done means:
- tool page loads locally
- deterministic Node unit test passes
- manifest rebuild passes
- catalog guard runs without fatal error
- discovery files reference the slug exactly once
- verification evidence written to `verification.md`
