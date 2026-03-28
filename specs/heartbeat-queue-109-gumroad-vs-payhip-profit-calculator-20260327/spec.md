# Spec — queue #109 Gumroad vs Payhip Profit Calculator

## Summary
Ship `tools/gumroad-vs-payhip-profit-calculator/` as a fully discoverable exact-match creator monetization tool.

## User
A digital-product creator currently selling on Gumroad who wants to know whether Payhip Free, Plus, or Pro would leave more take-home after fees and whether migration cost pays back.

## In scope
- Existing static page at `tools/gumroad-vs-payhip-profit-calculator/index.html`
- Existing calculation module at `tools/gumroad-vs-payhip-profit-calculator/calculator.js`
- Deterministic tests in `tools/gumroad-vs-payhip-profit-calculator/calculator.test.js`
- Exact-once discovery wiring in:
  - `tools/index.html`
  - `tools/index.md`
  - `_data/tools-list.json`
- `tools/manifest.json` rebuild
- Localhost smoke verification

## Out of scope
- Reworking the calculator formula unless verification exposes a real defect
- Broad catalog cleanup outside this slug
- Any external research beyond what is already encoded in the page copy

## Functional requirements
- Exact-match title remains `Gumroad vs Payhip Profit Calculator`
- Calculator returns deterministic outputs for the default scenario and selected edge cases
- HTML contains required anchors for summary output, related links, analytics include, and exact-match copy
- Discovery surfaces contain the slug exactly once
- Manifest contains exactly one structured object for this slug and URL after rebuild

## SEO / discovery requirements
- Canonical: `https://eastsea.monster/tools/gumroad-vs-payhip-profit-calculator/`
- `_data/tools-list.json` entry should use creator-monetization language and exact-match slug URL
- `tools/index.html` and `tools/index.md` should expose the tool near adjacent Gumroad / Payhip creator tools

## Done criteria
- Node syntax checks pass
- Node test file passes
- Structured exact-once discovery counts pass
- Localhost smoke returns `200 OK` and key page tokens
