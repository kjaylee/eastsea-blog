# Bond Yield Calculator - Implementation Plan

## Step 1: calculator.js
- Implement `round2()` helper
- Implement `calculate(opts)` with full validation
- Compute all 8 KPI values
- Generate year-by-year projection array
- Export via `module.exports`

## Step 2: calculator.test.js
- 12 deterministic test cases using node:test
- Cover: basic yield, YTM, premium/discount/par, zero coupon edge, after-tax, projections, validation errors

## Step 3: index.html
- Dark theme matching codebase pattern
- 7 input fields with real-time calculation
- 8 KPI cards with color coding
- Comparison bar vs Treasury benchmark
- Projection table
- Bilingual EN/KO toggle
- Copy summary button
- Fully self-contained (no CDN)

## Step 4: Verification
- Run all 12 tests
- Validate HTML structure
- Wire into manifest.json and tools-list.json
