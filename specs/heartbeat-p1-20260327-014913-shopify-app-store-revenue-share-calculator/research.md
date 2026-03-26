# Research — shopify-app-store-revenue-share-calculator

## Goal
Ship one low-overlap, exact-match monetization tool with clear user intent for eastsea-blog.

## Discovery surfaces checked
- `_data/tools-list.json`
- `tools/index.html`
- `tools/index.md`
- `tools/manifest.json`
- on-disk `tools/<slug>/index.html` inventory

## Missing monetization candidates found
1. `affiliate-commission-calculator`
2. `amazon-handmade-fee-calculator`
3. `shopify-app-store-revenue-share-calculator`
4. `stock-option-profit-calculator`

## Why this slug won
- Exact-match intent is strong: users searching this phrase want a platform-specific payout calculator, not a generic Shopify merchant fee tool.
- Low overlap versus shipped tools:
  - existing `shopify-fee-calculator` is merchant-plan/payment-fee focused
  - existing App Store tools are Apple-focused, not Shopify partner revenue-share modeling
- `_data/tools-list.json` already advertises this exact tool, so implementing it closes a real discovery-to-destination gap.
- User promise is crisp from the catalog copy: first $1M 0% band, then 15% revenue share, plus refunds, processing, tax reserve, and operating cost.

## Repo facts
- `_data/tools-list.json` already contains:
  - title: `Shopify App Store Revenue Share Calculator | Shopify 앱스토어 수익 배분 계산기`
  - description: models first $1M at 0%, then 15% share, refunds, processing fees, tax reserve, and operating cost
- `tools/shopify-app-store-revenue-share-calculator/index.html` does not exist yet.
- `tools/index.html` does not link this slug yet.
- `tools/index.md` does not list this slug yet.
- `tools/manifest.json` does not contain this slug yet.

## Modeling choice
- Input monthly gross app revenue and YTD recognized revenue before the month.
- Convert gross to recognized revenue with refunds first.
- Split recognized revenue between:
  - remaining 0% threshold runway
  - post-threshold shareable revenue at 15%
- Apply processing fee on gross billings.
- Apply tax reserve on recognized revenue.
- Subtract fixed monthly operating cost.
- Solve break-even monthly gross revenue with a piecewise formula:
  - before threshold contribution
  - after-threshold contribution

## Scope boundary
- Implement only:
  - `tools/shopify-app-store-revenue-share-calculator/`
  - `tools/index.html`
  - `tools/index.md`
  - `tools/manifest.json`
  - this spec folder
- `_data/tools-list.json` already has the exact-match catalog row, so no change is required there unless verification reveals a data issue.
