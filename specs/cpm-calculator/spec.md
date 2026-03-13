# CPM Calculator — Spec

## Features
1. Tri-mode solver: user picks which variable to solve (CPM / Cost / Impressions)
2. Inputs: two of three fields active based on solve mode
3. Real-time calculation on input change
4. Results card with: solved value, per-impression cost, daily budget estimator
5. Campaign comparison table: add multiple campaigns, compare CPM side-by-side
6. Mobile responsive, dark theme, bilingual title

## UI Layout
- Header with title + back link
- Mode selector (3 radio buttons)
- Input card (2 active fields)
- Result card (big number + supporting metrics)
- Campaign comparison section (add/remove rows)
- FAQ/guide section

## Tech
- Single index.html, no deps
- Analytics script: /js/analytics.js
- Design system: dark gradient, --accent blue
