# Research — App Store vs Web Checkout Profit Calculator

## Goal
Ship one missing, user-facing tool page for an already-discoverable slug with the least repo surface area and highest monetization relevance.

## Repo facts gathered

### 1) Discovery already exists, destination is missing
- `tools/index.html` contains a live card link to `app-store-vs-web-checkout-profit-calculator/`.
- `tools/index.md` contains a markdown entry for the same slug.
- `_data/tools-list.json` already contains a catalog record:
  - Title: `App Store vs Web Checkout Profit Calculator | 앱스토어 vs 웹 체크아웃 손익 계산기`
  - Description: compares App Store proceeds vs web checkout after conversion leakage, MoR/payment fees, fixed costs, monthly/annual delta, and break-even web capture rate.
- `tools/app-store-vs-web-checkout-profit-calculator/index.html` does **not** exist.
- `tools/manifest.json` does **not** currently include this slug.

### 2) Missing-gap inventory confirms this is a real broken catalog item
A repo scan comparing `_data/tools-list.json` URLs to actual `tools/<slug>/index.html` files found 28 missing tool pages. This slug is one of them.

### 3) Why this is the best P1 candidate
- Strong monetization intent: channel-margin comparison for app subscription businesses.
- Direct adjacency to existing App Store tooling already shipped in repo:
  - `tools/app-store-small-business-program-calculator/`
  - `tools/app-store-subscription-proceeds-calculator/`
  - `tools/app-store-vs-google-play-subscription-profit-comparator/`
- Strong adjacency to Master’s operating domain: indie iOS/app monetization.
- Clear formula surface from existing catalog copy; no need for broad product architecture changes.

## Implementation patterns observed in nearby tools

### Pattern A — pure calculator module + UI wrapper
Reference:
- `tools/app-store-vs-google-play-subscription-profit-comparator/calculator.js`
- `tools/app-store-vs-google-play-subscription-profit-comparator/index.html`

Useful conventions:
- UMD-style module export for both browser and Node tests.
- `DEFAULT_INPUTS`, `FIELD_META`, `validateInputs`, `calculate`, helper functions.
- Page script reads DOM → calls calculator → renders KPIs/tables/insight text.

### Pattern B — golden-number node tests next to tool
Reference:
- `tools/app-store-small-business-program-calculator/calculator.test.js`
- `tools/creator-membership-platform-fee-comparator/app.test.js`

Useful conventions:
- `node:test` + `node:assert/strict`
- tolerance helper for floating-point comparisons
- validate both happy-path arithmetic and rejection of invalid inputs

## Functional interpretation of the catalog promise
The page should let a user compare:
- App Store take-home
- Web checkout take-home after:
  - web conversion leakage (capture rate)
  - merchant-of-record fee (optional by setting 0 when unused)
  - payment processor variable fee
  - payment processor fixed fee per completed checkout
  - fixed monthly web stack cost

And should output:
- monthly delta
- annual delta
- break-even web capture rate
- required web price to match App Store under current capture

## Proposed modeling choices
To stay faithful to the catalog copy while remaining transparent and testable:
- Use `eligibleCustomers` as the common audience size for both channels.
- App Store assumes all eligible purchases complete in-app.
- Web checkout uses `webCaptureRatePct` to represent completed purchases after app-to-web friction.
- Allow different `appStoreRefundRatePct` and `webRefundRatePct`.
- Allow separate App Store and web prices, since many teams discount web plans to offset friction.
- Model web variable fees as:
  - recognized web billings × (`merchantOfRecordFeeRatePct` + `paymentFeeRatePct`)
  - plus `completedWebOrders × paymentFixedFee`
- Subtract `monthlyWebFixedCost` only from web.

## Non-goals for v1
- Tax jurisdiction modeling
- territory-specific fees
- family sharing
- installment plans
- chargeback dispute fee modeling
- server-to-server notification costs
- Apple reader-link / DMA / alternative billing edge cases

## Verification targets
- Unit test file for pure logic
- Local HTTP smoke test via simple static server + `curl`
- Manifest integrity preserved; add slug only if done surgically

## Surgical scope boundary
Only touch:
- `tools/app-store-vs-web-checkout-profit-calculator/`
- `tools/manifest.json` (only if adding the new slug surgically)
- `specs/heartbeat-p1-20260325-app-store-vs-web-checkout-profit-calculator/`

No unrelated refactors.
