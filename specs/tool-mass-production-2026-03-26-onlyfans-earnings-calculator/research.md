# Research — OnlyFans Earnings Calculator

## Goal
Ship one new high-ROI static tool slice adjacent to the existing creator / membership / fee calculator cluster.

## Repo scan findings
- Existing adjacent tools already cover Patreon, Substack, Ko-fi, Buy Me a Coffee, Gumroad, Memberful, Lemon Squeezy, Payhip, Kajabi, Podia, Teachable, itch.io, and creator membership comparisons.
- Repo check on 2026-03-26 found **no existing `onlyfans` tool directory** and **no OnlyFans entry in `_data/tools-list.json`**.
- This means there is a clean gap in the current creator take-home cluster.

## Adjacent inventory already shipped
- `tools/patreon-fee-calculator/`
- `tools/patreon-net-revenue-calculator/`
- `tools/substack-fee-calculator/`
- `tools/substack-newsletter-revenue-calculator/`
- `tools/ko-fi-fee-calculator/`
- `tools/buy-me-a-coffee-fee-calculator/`
- `tools/memberful-fee-calculator/`
- `tools/gumroad-net-revenue-calculator/`
- `tools/creator-membership-platform-fee-comparator/`

## Search-intent signal
Brave web search run on 2026-03-26 (US/en):

### Query: `OnlyFans fee calculator`
Top results included:
1. `onlyfansearningscalculator.com` — dedicated competitor result titled **OnlyFans Earnings Calculator**.
2. Multiple pricing / earnings guide articles targeting creator monetization queries.
3. Reddit pricing discussion with creator planning intent.

Interpretation:
- There is direct commercial search demand for a calculator, not just informational blog content.
- A dedicated standalone calculator already ranking is strong evidence the query has tool-shaped intent.

### Official fee baseline evidence
Search results for `site:onlyfans.com OnlyFans creators 20% fee` returned:
- `https://onlyfans.com/terms` with snippet: **“Our Fee is calculated as 20% of the total Fan Payment and will be deducted from each Fan Payment.”**
- `https://start.onlyfans.com/` with snippet: **“OnlyFans creators ... keep 80% of all earnings.”**

Interpretation:
- We have a clean, stable public baseline for v1 math: creator keeps 80%, platform fee is 20% of fan payments.
- This is well suited for a static calculator with transparent assumptions.

## Why this tool is the right slice
1. **Strong adjacency**: fits the already-proven creator take-home cluster.
2. **Fast to ship**: simple fee model compared with multi-plan marketplaces.
3. **Clear official baseline**: 20% creator fee avoids ambiguous rate trees.
4. **Useful beyond fees**: users also care about monthly net after refunds, payout drag, promo spend, and required subscriber count.

## Proposed product angle
Ship as **OnlyFans Earnings Calculator** rather than a narrow fee-only page.

Reasoning:
- Search results show “earnings calculator” as the likely user phrasing.
- We can still expose the fee breakdown clearly.
- This makes the tool more decision-ready than a simple 20% deduction widget.

## v1 scope recommendation
### Inputs
- Active subscribers
- Monthly subscription price
- Monthly tips revenue
- Monthly PPV / messages revenue
- Monthly custom / other revenue
- Refund / chargeback rate
- Payout delay days
- Annual cash-cost rate
- Monthly promo cost
- Other monthly operating cost
- Target monthly net income

### Outputs
- Subscription revenue
- Total gross revenue
- OnlyFans platform fee (20%)
- Refund / chargeback loss
- Payout drag cost
- Take-home before operating costs
- Net income after promo / other cost
- Effective take-home rate
- Gross ARPU and take-home per subscriber
- Required subscribers for target net
- Break-even subscribers
- Required subscription price at current subscriber count

## Template / implementation references in repo
- `tools/patreon-fee-calculator/` — bilingual fee-style calculator with summary copy.
- `tools/gumroad-net-revenue-calculator/` — modern creator take-home page layout and disclaimer framing.
- `tools/memberful-fee-calculator/` — strong pattern for pure calculator module + DOM wiring + exact-once catalog test.
- `tests/integration/manifest-integrity.test.mjs` — new tool must be added to `tools/manifest.json`.

## Constraints
- Keep implementation surgical.
- No unrelated refactors.
- Static browser-only tool.
- Must update manifest/catalog wiring and ship with explicit verification evidence.

## Decision
Proceed with:
- **Slug:** `onlyfans-earnings-calculator`
- **Primary title:** `OnlyFans Earnings Calculator | OnlyFans 실수령액 계산기`
- **Positioning:** creator take-home / earnings / fee breakdown calculator
