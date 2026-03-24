# Plan — grailed-fee-profit-calculator-20260325

## Phase 1 — calculator.js
- Define PAYMENT_PROFILES map with rate/flat pairs
- Implement round2 / round4 helpers
- Implement computeCore(inputs) → all monetary outputs
- Implement findBreakEven via binary search (window 0..100000, 52 iterations)
- Implement findMaxOfferDiscount via binary search (0..100, 52 iterations)
- Implement buildSummary(input, result, lang)
- Implement validate(n, lang) → error string or ''
- Implement calculate(input, opts) → { result, error }
- Export { calculate, DEFAULTS }

## Phase 2 — calculator.test.js
- TC-GR-01: baseline profitable (stripe-onboarded-domestic)
- TC-GR-02: international increases fee
- TC-GR-03: not-onboarded-domestic increases flat fee
- TC-GR-04: offer discount compresses profit
- TC-GR-05: maxOfferDiscountPct bounds check
- TC-GR-06: break-even unreachable with extreme costs
- TC-GR-07: invalid inputs rejected
- TC-GR-08: summary contains required fields
- TC-GR-09: HTML scaffold anchors (static grep check)
- DEFAULTS shape check

## Phase 3 — index.html
- Dark-card layout following poshmark-fee-profit-calculator conventions
- paymentProfile <select> with all 5 preset options
- Bilingual STRINGS (en/ko)
- KPI row: net profit, net margin, break-even, max offer discount
- Status bar, detail table, summary textarea
- Copy Summary + Reset Defaults buttons
- Related tools links
- analytics.js + calculator.js script tags

## Phase 4 — Verification
- node --check calculator.js
- node --test calculator.test.js
- bash scripts/build-manifests.sh
- grep manifest for grailed slug
