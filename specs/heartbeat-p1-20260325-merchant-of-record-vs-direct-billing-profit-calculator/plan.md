# Plan — Merchant of Record vs Direct Billing Profit Calculator

## Execution intent
Keep this implementation surgical. The discovery promise already exists; the missing piece is the actual tool page plus manifest backfill.

## Step 1 — Preflight gap confirmation
Confirm all of the following before coding:
- `tools/merchant-of-record-vs-direct-billing-profit-calculator/` is absent
- `tools/manifest.json` has zero entries for the slug
- `tools/index.html`, `tools/index.md`, `_data/tools-list.json` each contain the slug exactly once
- `tools/app-store-vs-web-checkout-profit-calculator/index.html` contains the existing sibling chip exactly once

Reason: this prevents duplicate discovery edits.

## Step 2 — Create calculator engine
Create:
- `tools/merchant-of-record-vs-direct-billing-profit-calculator/calculator.js`

Implementation shape:
- UMD or Node-friendly export pattern like `app-store-vs-web-checkout-profit-calculator/calculator.js`
- centralized defaults object
- field metadata + validation helpers
- pure `calculate()` function returning `{ ok, errors, input, result }`
- formatted summary string for UI reuse

## Step 3 — Create page shell
Create:
- `tools/merchant-of-record-vs-direct-billing-profit-calculator/index.html`

Required page elements:
- SEO-safe `<title>` and meta description
- `/assets/analytics.js`
- input groups matching the spec
- result cards + breakdown table
- concise bilingual assumption note
- sibling chips to the four related payment tools

## Step 4 — Add deterministic tests
Create:
- `tools/merchant-of-record-vs-direct-billing-profit-calculator/calculator.test.js`

Tests must cover:
- baseline MoR-wins golden fixture with exact numbers
- lean direct-billing fixture with exact numbers
- break-even fee threshold behavior
- invalid input rejection
- exact-once catalog contract
- required title / analytics / related-link markers in HTML

## Step 5 — Backfill manifest only
Edit:
- `tools/manifest.json`

Rules:
- add the slug exactly once
- do not edit `tools/index.html`, `tools/index.md`, or `_data/tools-list.json` unless verification proves they are wrong
- keep ordering/style consistent with surrounding manifest entries

## Step 6 — Verification run
After implementation, run the exact commands from `verification.md`:
- `node --check`
- `node --test`
- deterministic discovery-count Python check
- optional repo-wide guard run with `--fail-on none` to ensure the new slug no longer appears as a `tools_list_extra_entries` example

## Planned changed files
### New
- `tools/merchant-of-record-vs-direct-billing-profit-calculator/index.html`
- `tools/merchant-of-record-vs-direct-billing-profit-calculator/calculator.js`
- `tools/merchant-of-record-vs-direct-billing-profit-calculator/calculator.test.js`

### Existing
- `tools/manifest.json`

## Explicit non-plan
- no broad catalog cleanup
- no tools landing-page rewrite
- no tools-list regeneration pass
- no provider-specific MoR branching explosion in v1

## Queue/heartbeat-safe next step
If this task is handed off for implementation, the safest next move is:
1. scaffold the three tool files under `tools/merchant-of-record-vs-direct-billing-profit-calculator/`
2. reuse the `app-store-vs-web-checkout-profit-calculator` calculator/test shape
3. add **one** manifest entry
4. stop and verify before touching any other discovery surface