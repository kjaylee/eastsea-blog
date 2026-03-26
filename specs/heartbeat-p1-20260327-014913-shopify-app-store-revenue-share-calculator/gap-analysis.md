# Gap Analysis — shopify-app-store-revenue-share-calculator

## Gap closed
- Exact-match discovery row existed in `_data/tools-list.json`, but there was no destination page.
- `tools/index.html`, `tools/index.md`, and `tools/manifest.json` also lacked the slug.

## Why this is still low overlap after shipping
- Merchant-side Shopify plan economics remain in `shopify-fee-calculator`.
- Developer-side platform revenue-share modeling now has its own exact-match page.
- The formula surface is different enough that combining the two would dilute search intent and usability.

## Remaining adjacent gaps after this ship
- `amazon-handmade-fee-calculator`
- `affiliate-commission-calculator`
- `stock-option-profit-calculator`
