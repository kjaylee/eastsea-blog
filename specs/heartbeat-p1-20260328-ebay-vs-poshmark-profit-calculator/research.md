# Research — eBay vs Poshmark Profit Calculator

Date: 2026-03-28
Repo: `/Users/kjaylee/.openclaw/workspace/eastsea-blog`

## Goal
Ship one new monetizable resale comparison tool that is absent from the current EastSea catalog and can be verified in one build cycle.

Chosen slug: `ebay-vs-poshmark-profit-calculator`

## Gap confirmation before edits
I checked the repo and discovery surfaces before implementation.

- `tools/ebay-vs-poshmark-profit-calculator/` — missing
- `tools/index.html` — `0` matches for `ebay-vs-poshmark-profit-calculator`
- `tools/index.md` — `0` matches
- `_data/tools-list.json` — `0` matches
- `tools/manifest.json` — `0` matches

## Relevant files reviewed
### Existing platform calculators
- `tools/ebay-fee-profit-calculator/calculator.js`
- `tools/ebay-fee-profit-calculator/calculator.test.js`
- `tools/poshmark-fee-profit-calculator/calculator.js`
- `tools/poshmark-fee-profit-calculator/calculator.test.js`

### Existing comparison / catalog patterns
- `tools/stockx-vs-goat-profit-calculator/index.html`
- `tools/stockx-vs-goat-profit-calculator/calculator.js`
- `tools/stockx-vs-goat-profit-calculator/calculator.test.js`
- `tools/index.html`
- `tools/index.md`
- `_data/tools-list.json`
- `scripts/build-manifests.sh`

## Why this is a strong P1 candidate
1. **Direct seller decision intent**
   - Resellers frequently choose between eBay and Poshmark for the same apparel / closet inventory.
   - “Which platform leaves more money?” is a real pricing decision, not a vanity metric.

2. **New value, not a polish pass**
   - EastSea already has single-platform tools for:
     - eBay
     - Poshmark
     - Depop
     - GOAT / StockX / Grailed / Whatnot
   - But there is no shipped eBay-vs-Poshmark comparator.

3. **Low-risk composition path**
   - Both platforms already have deterministic, tested fee engines in-repo.
   - The new tool can compose those modules instead of inventing new math.

4. **Commercial SEO fit**
   - The comparison slug targets a clear transactional / planning query shape.
   - It broadens EastSea’s resale marketplace comparison cluster beyond sneaker-only comparisons.

## Formula truths already available in repo
### eBay module
The shipped eBay calculator already models:
- category-based final value fee presets
- buyer shipping included in revenue / fee basis
- estimated sales tax included in fee basis
- promoted listings ad rate
- optional insertion fee
- seller-side item / shipping / packaging costs
- break-even sold price

### Poshmark module
The shipped Poshmark calculator already models:
- `$2.95` fee below `$15`
- `20%` fee at `$15+`
- offer discount reducing realized sale price
- seller shipping discount
- seller-side item / packaging / other costs
- break-even list price
- max offer discount before loss

## Product decision
Build a side-by-side comparator that answers:
- which platform leaves more net profit for the same item,
- how much the winner leads by,
- and what price the losing platform would need to match the winner.

## Chosen scope
### Shared scenario inputs
- list price
- offer discount (%)
- item cost
- packaging cost
- other seller cost

### eBay-specific inputs
- buyer shipping charged
- actual shipping cost
- sales tax rate (%)
- category preset
- promoted listings ad rate (%)

### Poshmark-specific inputs
- seller shipping discount

## Comparison model
- Poshmark uses `listPrice` and `offerDiscountPct` directly.
- eBay uses the **same realized sale price** as the sold price so the comparison stays apples-to-apples on buyer-negotiated price.
- eBay keeps its own buyer shipping / tax / ad-rate assumptions explicit because those materially change payout.

## Expected outputs
- eBay fee total
- eBay payout after fees
- eBay net profit
- Poshmark fee total
- Poshmark payout after fees
- Poshmark net profit
- winner platform + profit delta
- eBay price needed to match current Poshmark net profit
- Poshmark list price needed to match current eBay net profit
- copy-ready summary

## Non-goals for v1
- no multi-item monthly portfolio model
- no regional fee overrides
- no store-subscription discounts or private seller tiers
- no shipping label purchase workflow modeling
- no localStorage / saved scenarios

## Office Hours — forced questions
### 1) 누구의 문제인가?
Small resale sellers deciding where to list the same clothing / closet item.

### 2) 구체적 사례는?
A seller has a $48 item, expects a 12% negotiated discount, pays $14 for inventory, and wants to know if eBay promoted listings still beats Poshmark after seller shipping discount.

### 3) 지금 어떻게 해결하고 있나?
Most sellers do rough math in their head, compare only headline fee rates, and miss shipping / ad-rate / threshold effects.

### 4) 이상적 결과는?
One page showing winner, profit delta, payout detail, and the required price to neutralize the gap.

### 5) 제약 조건은?
- must stay static
- must reuse proven local formulas
- must keep edits surgical
- must verify with deterministic Node tests and local HTTP render

### 6) 성공 지표는?
- new tool renders locally
- deterministic tests pass
- discovery wiring is exact-once
- seller can answer “where should I list this item?” in under 30 seconds
