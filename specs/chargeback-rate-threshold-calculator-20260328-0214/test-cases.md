# Test Cases — Chargeback Rate Threshold Calculator

## Reference fixture
Base input:
- chargebacks = 85
- transactionsCurrent = 12000
- transactionsPrevious = 11000
- averageOrderValue = 82
- chargebackFee = 15
- recoveryRate = 28
- monitoredRatePct = 1
- excessiveRatePct = 1.5
- monitoredCountThreshold = 100

## Deterministic cases
1. **TC-CRT-01 baseline below monitored band**
   - sameMonthRate ≈ 0.7083%
   - laggedRate ≈ 0.7727%
   - status = safe
   - monthlyExposure = unrecovered disputed volume + fee burn

2. **TC-CRT-02 ratio breach without count breach**
   - chargebacks = 125
   - transactionsCurrent = 10000
   - transactionsPrevious = 10000
   - sameMonthRate = 1.25%
   - status = ratio threshold breached

3. **TC-CRT-03 excessive breach**
   - chargebacks = 190
   - transactionsCurrent = 10000
   - transactionsPrevious = 10000
   - sameMonthRate = 1.9%
   - status = excessive threshold breached

4. **TC-CRT-04 count-only breach**
   - chargebacks = 105
   - transactionsCurrent = 20000
   - transactionsPrevious = 20000
   - sameMonthRate = 0.525%
   - status = count threshold breached

5. **TC-CRT-05 validation rejects zero denominators and invalid thresholds**
   - transactionsCurrent <= 0
   - transactionsPrevious <= 0
   - monitoredRatePct <= 0
   - excessiveRatePct <= monitoredRatePct
   - recoveryRate outside 0..100

6. **TC-CRT-06 headroom math is exact**
   - with 12,000 current transactions and 1.0% threshold, max allowed = 120
   - if chargebacks = 85, headroom = 35

7. **TC-CRT-07 exposure math is exact**
   - grossDisputedVolume = chargebacks × AOV
   - unrecoveredDisputedVolume respects recoveryRate
   - feeBurn = chargebacks × chargebackFee
   - annualizedExposure = monthlyExposure × 12

8. **TC-CRT-08 summary contains operator-ready fields**
   - same-month ratio
   - lagged ratio
   - count threshold warning
   - monthly exposure
   - annualized exposure

9. **TC-CRT-09 HTML anchors present**
   - analytics script
   - calculator script
   - app script
   - summary textarea
   - status pill

10. **TC-CRT-10 discovery exact-once**
   - slug appears exactly once in `tools/index.html`
   - slug appears exactly once in `tools/index.md`
   - `_data/tools-list.json` contains exact URL once
   - `tools/manifest.json` contains exact slug/url once after rebuild
