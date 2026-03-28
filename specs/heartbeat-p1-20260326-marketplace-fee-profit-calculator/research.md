# Research — Marketplace Fee Profit Calculator Logic/Test Hardening

## Goal
Start one concrete P1 tool-mass-production slice that can ship fastest without polishing games. Chosen slice: harden the already-published `marketplace-fee-profit-calculator` by externalizing its inline calculation logic into a reusable JS module and adding deterministic automated tests.

## Why this candidate
Source: `specs/tool-opportunity-ranker-20260326/artifacts/opportunities.md`
- Rank #1 candidate: `marketplace-fee-profit-calculator`
- Score: **124**
- Recommendation: "Externalize logic and add deterministic tests before the next publish cycle."
- Reasons captured by the ranker:
  - already declared in `tools/manifest.json`
  - already discoverable in `_data/tools-list.json`
  - has large inline script surface (`6447` inline script chars)
  - no external JS logic module found
  - no deterministic automated test coverage found
  - monetization intent keywords present: fee, profit, marketplace

Conclusion: this is the fastest surgical P1 slice because the page already exists and is discoverable; the main missing pieces are verifiable logic extraction and test coverage.

## Files inspected before implementation
- `tools/marketplace-fee-profit-calculator/index.html`
  - Existing UI is already functional.
  - Math is embedded as inline script at the bottom of the page.
  - Inputs/outputs are stable and therefore good candidates for extraction.
- `tests/unit/facebook-marketplace-fee-profit-calculator.test.mjs`
  - Confirms repo pattern for deterministic calculator coverage using Node built-in test runner.
- `tools/facebook-marketplace-fee-profit-calculator/calculator.js`
  - Provides a local reference for UMD/CommonJS-compatible browser calculator modules.
- `tests/setup.mjs`
  - Confirms test environment is plain Node with no extra dependencies.
- `tools/manifest.json`, `_data/tools-list.json`
  - Confirm the slug is already in the catalog; no discovery expansion is needed for this slice.

## Existing product behavior to preserve
Current page computes:
- marketplace fee = `price * marketRate + marketFixed`
- payment fee = `price * paymentRate + paymentFixed`
- fee burden = marketplace fee + payment fee
- expected revenue = `price * (1 - returnRate)`
- expected return loss = `returnRate * returnLoss`
- base cost = `cogs + shipping + adSpend`
- expected profit = expected revenue - (base cost + fee burden + expected return loss)
- expected margin = expected profit / price
- k-factor = `(1 - returnRate) - (marketRate + paymentRate)`
- break-even price = `(base cost + marketFixed + paymentFixed + expected return loss) / kFactor`
- target price = `(base cost + marketFixed + paymentFixed + expected return loss) / (kFactor - targetMargin)`

Important edge conditions already expressed inline and must remain true:
- sale price must be greater than zero
- cost inputs must be non-negative
- percentage inputs must stay below 100
- target margin must stay below 95
- if `kFactor <= 0`, break-even math is impossible
- if `kFactor - targetMargin <= 0`, target price is impossible

## Why this slice is valuable
- Reduces regression risk on a monetization page that is already live in the catalog.
- Creates a reusable calculator-module pattern for similar fee/profit tools.
- Adds explicit verification evidence instead of relying on manual browser confidence.
- Keeps edits surgical: one tool page, one JS module, one unit test file, one spec folder.

## Scope chosen for this pass
In scope:
1. Extract inline calculator logic to `tools/marketplace-fee-profit-calculator/calculator.js`
2. Update `index.html` to load the external script instead of inline logic
3. Add deterministic unit coverage in `tests/unit/marketplace-fee-profit-calculator.test.mjs`
4. Verify exact-once catalog wiring still holds

Out of scope:
- redesigning the UI
- adding new catalog entries
- localization rewrite
- broader refactors across other tool pages

## Chosen task id
`heartbeat-p1-20260326-marketplace-fee-profit-calculator`
