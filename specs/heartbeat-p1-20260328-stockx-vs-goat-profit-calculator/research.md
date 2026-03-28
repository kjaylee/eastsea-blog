# Research — heartbeat P1 StockX vs GOAT Profit Calculator

Date: 2026-03-28
Repo: `/Users/kjaylee/.openclaw/workspace/eastsea-blog`

## Goal
Ship one new high-intent resale comparison tool that is not already in the EastSea catalog and can be validated in one run.

Chosen slug: `stockx-vs-goat-profit-calculator`

## Gap confirmation before edits
Filesystem / catalog checks completed before implementation:
- `tools/stockx-vs-goat-profit-calculator/` does not exist
- `_data/tools-list.json` does not mention `stockx-vs-goat-profit-calculator`
- `tools/index.md` does not mention `stockx-vs-goat-profit-calculator`
- `tools/index.html` does not mention `stockx-vs-goat-profit-calculator`

## Why this lane
- Clear resale intent: sellers frequently decide where to list the same pair/item between StockX and GOAT.
- Strong monetization fit: direct fee / payout / net-profit comparison, not a vanity metric.
- Fast, surgical implementation path because the repo already contains validated building blocks for both platforms.
- New value instead of polishing an existing calculator: existing tools are single-platform only.

## Relevant files reviewed
### Existing platform calculators
- `tools/stockx-fee-profit-calculator/calculator.js`
- `tools/stockx-fee-profit-calculator/calculator.test.js`
- `tools/goat-fee-calculator/calculator.js`
- `tools/goat-fee-calculator/calculator.test.js`

### Existing comparison / catalog patterns
- `tools/patreon-vs-memberful-profit-calculator/calculator.js`
- `tests/unit/marketplace-fee-profit-calculator.test.mjs`
- `scripts/build-manifests.sh`
- `tools/index.md`
- `tools/index.html`
- `_data/tools-list.json`

## Reusable formula truths already present in repo
### StockX baseline already modeled
From the shipped StockX calculator module:
- seller-level transaction fee: 9.0% → 7.0% by level
- payment processing: 3%
- US minimum seller fee floor: `$5`
- seller cost stack: item cost + shipping to StockX + packaging + other cost

### GOAT baseline already modeled
From the shipped GOAT calculator module:
- public baseline preset: 9.5% commission + `$5` flat seller fee
- optional custom override already supported in underlying logic
- optional refund / return planning loss rate
- seller cost stack: item cost + seller shipping + packaging + other seller cost

## Product decision
Build a side-by-side comparator that:
1. accepts one shared resale scenario,
2. evaluates the same scenario on both platforms using the existing formula modules,
3. shows payout, fees, net profit, margin, and winner,
4. computes the extra price one platform would need to match the other,
5. keeps StockX-specific and GOAT-specific assumptions explicit.

## Scope boundaries
In scope:
- comparison for one sale scenario
- public-baseline assumptions already modeled in repo
- copy-ready summary
- catalog discovery wiring
- deterministic tests

Out of scope for v1:
- live fee scraping
- taxes / FX / regional exceptions
- advanced GOAT penalty states / Canadian variants
- StockX Flex / storage / special programs
- browser screenshots

## Implementation approach
- Create a new tool bundle that composes the existing StockX and GOAT calculators rather than rewriting both fee engines.
- In browser: load sibling calculators first, then run the comparison layer.
- In Node tests: require the same modules directly for deterministic assertions.
- Rebuild `tools/manifest.json` after discovery wiring.

## Verification targets
- `node --check` passes on new JS files
- `node --test` passes on the tool test file
- exact-once checks pass for `tools/index.html`, `tools/index.md`, `_data/tools-list.json`, `tools/manifest.json`
- localhost `curl` confirms the new page renders expected anchor copy
