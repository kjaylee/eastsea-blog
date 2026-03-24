# Verification — grailed-fee-profit-calculator-20260325

## Date
2026-03-25

## Files created

| File | Path |
|---|---|
| calculator.js | tools/grailed-fee-profit-calculator/calculator.js |
| calculator.test.js | tools/grailed-fee-profit-calculator/calculator.test.js |
| index.html | tools/grailed-fee-profit-calculator/index.html |

## Verification commands and results

### 1. Syntax check
```
node --check tools/grailed-fee-profit-calculator/calculator.js
→ syntax OK
```

### 2. Test suite (11/11 pass)
```
node --test tools/grailed-fee-profit-calculator/calculator.test.js

✔ TC-GR-01 baseline profitable (stripe-onboarded-domestic)
✔ TC-GR-02 international increases processing fee
✔ TC-GR-03 not-onboarded-domestic raises flat fee to $0.99
✔ TC-GR-04 offer discount 15% compresses profit
✔ TC-GR-05 maxOfferDiscountPct is bounded and accurate
✔ TC-GR-06 break-even returns null when unreachable
✔ TC-GR-07 invalid inputs are rejected
✔ TC-GR-08 summary includes all required fields
✔ DEFAULTS export has expected shape
✔ non-stripe-country-default uses 4.99% + $0.49 same as stripe-intl
✔ Korean language returns localized strings

tests 11 | pass 11 | fail 0
```

### 3. Manifest build
```
bash scripts/build-manifests.sh
→ tools/manifest.json: 634개
```

### 4. Manifest entry confirmed
```
grep -i grailed tools/manifest.json
→ "slug": "grailed-fee-profit-calculator"
→ "title": "Grailed Fee Profit Calculator"
→ "url": "/tools/grailed-fee-profit-calculator/"
```

## HTML anchor checks

| Anchor | Present |
|---|---|
| id="langBtn" | ✅ |
| id="listPrice" | ✅ |
| id="paymentProfile" | ✅ |
| id="summaryArea" | ✅ |
| analytics.js script | ✅ |
| calculator.js script | ✅ |
| Title: Grailed Fee Profit Calculator | ✅ |

## Formula validation (TC-GR-01 manual check)

- listPrice = 180, stripe-onboarded-domestic (3.49% + $0.49)
- grailedCommission = 180 × 0.09 = **$16.20** ✅
- processingFee = 180 × 0.0349 + 0.49 = 6.282 + 0.49 = **$6.77** ✅
- totalPlatformFees = 16.20 + 6.77 = **$22.97** ✅
- sellerCostTotal = 70 + 12 + 0.75 = **$82.75** ✅
- netProfit = 180 − 22.97 − 82.75 = **$74.28** ✅

## Status

PASS — all checks green.
