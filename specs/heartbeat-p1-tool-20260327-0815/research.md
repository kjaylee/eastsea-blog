# Research — heartbeat-p1-tool-20260327-0815

## Chosen opportunity
**Whop Payments Fee Calculator | Whop 수수료 계산기**

## Why this tool
- **Fast-shippable P1**: the formula surface is compact and mostly public-rate based.
- **Clear SEO intent**: “Whop fees”, “Whop payment fee”, “Whop payout fee”, and “Whop calculator” are direct commercial-intent queries from creators choosing a platform or pricing a product.
- **Catalog fit**: eastsea-blog already performs well with fee / net revenue / payout calculators for creator and commerce platforms.
- **Gap in current catalog**: tracked `origin/master` has no `whop` slug in `tools/`, `tools/manifest.json`, or `_data/tools-list.json`.

## Repo/corpus observations
- Clean worktree created from `origin/master` at:
  - branch: `heartbeat/p1-whop-payments-fee-20260327-0815`
  - worktree: `/Users/kjaylee/.openclaw/workspace/eastsea-blog/.worktrees/heartbeat-p1-whop-payments-fee-20260327-0815`
- Existing conventions favor:
  - standalone `tools/<slug>/index.html`
  - optional pure logic module (`logic.mjs`) for deterministic testing
  - exact-once discovery wiring in:
    - `tools/index.html`
    - `tools/index.md`
    - `tools/manifest.json`
    - `_data/tools-list.json`
- Reference implementations inspected:
  - `tools/tiktok-shop-fee-calculator/index.html`
  - `tools/tiktok-shop-fee-calculator/logic.mjs`
  - `tests/unit/tiktok-shop-fee-calculator.test.mjs`
  - `tools/stripe-fee-calculator/index.html`
  - `tools/facebook-marketplace-fee-profit-calculator/index.html`

## External rate research
### Official source used
1. **Whop Docs — Fees**: `https://docs.whop.com/fees`
   - Extracted via `requests + BeautifulSoup` because generic fetch/search tooling was rate-limited or blocked.
   - Relevant publicly visible rates found in the document text:
     - Cards and wallets: **2.7% + $0.30** per successful domestic card transaction
     - International cards: **+1.5%**
     - Currency conversion: **+1% if currency conversion is required**
     - ACH debit: **1.5%**, **maximum fee $5**
     - Financing: **15%**
     - Next-day ACH payout: **$2.50** per successful payout
     - Instant bank deposit: **4% + $1.00** per successful payout
     - Crypto payout: **5% + $1.00** per successful payout
     - Venmo payout: **5% + $1.00** per successful payout
     - Bank wire payout: **$23.00** per successful payout
     - International local banks: **varies by country** (exclude from deterministic calculator)
2. Search fallback (`scripts/search-fallback.sh`) also surfaced the official `docs.whop.com/fees` page, confirming discoverability.

## Product decision
Scope the tool as **Whop Payments Fee Calculator**, not a generic “all Whop fees” simulator.

Reason:
- The official docs clearly expose **payment-processing** and **payout** fees.
- They do **not** give a fully stable, one-size-fits-all “platform fee” model suitable for deterministic modeling in the same way.
- Narrowing the scope reduces hallucination risk and keeps the tool trustworthy.

## Formula strategy
Per transaction:
1. Compute processing fee based on selected payment rail.
2. Compute post-processing balance.
3. Compute payout fee on the payout balance, amortized across a configurable number of transactions bundled into one payout.
4. Output:
   - processing fee
   - allocated payout fee per transaction
   - total fee
   - net take-home
   - effective take rate
   - required gross sale amount to hit target net
5. Monthly projection:
   - sales per month
   - payout batch size
   - exact batch-based payout fee total using full-batch + remainder-batch logic

## Key assumptions to disclose in UI
- Percentage payout fees are modeled against the **post-processing payout balance**, not the original gross charge.
- Payout fixed fees are **amortized** across `transactions per payout`.
- “International local banks” are excluded because the official docs say the fee varies by country.
- Users should verify current Whop terms before committing pricing decisions.

## Implementation guardrails
- Keep edits surgical.
- Add one pure logic module plus one deterministic unit test file.
- Wire the slug into the catalog exactly once.
- Verify with:
  - `node --check`
  - `node --test`
  - local HTTP smoke via `python3 -m http.server` + `curl`
  - exact-once catalog checks in test coverage
