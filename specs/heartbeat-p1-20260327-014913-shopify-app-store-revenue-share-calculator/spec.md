# Spec — shopify-app-store-revenue-share-calculator

## Problem
eastsea-blog already advertises an exact-match Shopify App Store revenue-share calculator in `_data/tools-list.json`, but the destination page is missing. That creates a discovery gap for a high-intent monetization query.

## Deliverable
Ship `tools/shopify-app-store-revenue-share-calculator/` with:
- `index.html`
- `calculator.js`
- `app.js`
- `calculator.test.js`

## Required behavior
- Accept YTD recognized revenue before the month, monthly gross app revenue, refund rate, processing fee rate, tax reserve rate, monthly operating cost, threshold, and post-threshold revenue-share rate.
- Show whether the current month stays inside the 0% band, crosses it, or is fully above it.
- Output:
  - recognized revenue
  - zero-share recognized revenue
  - shared recognized revenue
  - Shopify revenue-share fee
  - processing fees
  - tax reserve
  - total modeled cost
  - monthly take-home
  - take-home margin
  - effective total take rate
  - break-even monthly gross revenue
- Provide copyable summary text.
- Work on mobile and desktop without layout breakage.

## Discovery updates
- Add one tool card in `tools/index.html`.
- Add one markdown row in `tools/index.md`.
- Add one manifest entry in `tools/manifest.json`.
- Do not touch unrelated discovery files.

## Non-goals
- Contract-specific exceptions
- chargeback modeling
- territory-specific tax logic
- payout timing rules
- legal/tax advice
