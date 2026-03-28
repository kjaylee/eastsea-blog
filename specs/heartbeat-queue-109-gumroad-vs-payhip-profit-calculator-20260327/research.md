# Research — queue #109 Gumroad vs Payhip Profit Calculator

Date: 2026-03-27
Repo: `/Users/kjaylee/.openclaw/workspace/eastsea-blog`

## Goal
Ship exactly one new exact-match monetization tool end-to-end with deterministic tests, exact-once discovery wiring, and localhost smoke verification.

Chosen slug: `gumroad-vs-payhip-profit-calculator`

## Why this lane
- It is an exact-match creator monetization query with clear buyer intent: compare current take-home on Gumroad versus Payhip before migrating.
- It is not in the excluded recent-heartbeat topics:
  - `beehiiv`
  - `fanfix`
  - `udemy`
  - `goat`
  - `whop`
  - `msp pricing`
  - `upwork`
  - `stan-store`
  - `amazon-handmade`
  - `onlyfans`
  - `printful`
  - `shutterstock`
  - `circle`
- It is not one of the already-shipped recent lanes to avoid:
  - `saas quick ratio`
  - `saas magic number`
  - `thinkific`
  - `quickbooks payments`
  - `ecpm`

## Gap confirmed before edits
- Tool bundle already exists on disk:
  - `tools/gumroad-vs-payhip-profit-calculator/index.html`
  - `tools/gumroad-vs-payhip-profit-calculator/calculator.js`
  - `tools/gumroad-vs-payhip-profit-calculator/calculator.test.js`
- Structured discovery state before edits:
  - `tools/index.html`: `0`
  - `tools/index.md`: `0`
  - `_data/tools-list.json`: `0`
  - `tools/manifest.json`: `1`

## Existing quality signals
- `node --test tools/gumroad-vs-payhip-profit-calculator/calculator.test.js` already passes for deterministic core math.
- The page already has exact-match title/canonical/meta scaffolding and adjacent creator-tool links.

## Required recovery work
1. Add missing discovery entry to `tools/index.html`
2. Add missing discovery entry to `tools/index.md`
3. Add missing discovery entry to `_data/tools-list.json`
4. Expand the tool test to cover:
   - HTML anchors
   - exact-once discovery counts by structure
5. Rebuild `tools/manifest.json`
6. Re-verify with Node commands and localhost smoke

## Constraints
- Keep edits surgical.
- Do not touch unrelated tool bundles.
- Do not claim success from the existing partial bundle without fresh verification.
