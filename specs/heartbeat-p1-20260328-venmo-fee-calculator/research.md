# Research — Venmo Fee Calculator

## Goal
Ship exactly one new EastSea utility tool that is:
- missing from the current catalog,
- aligned with the repo’s proven fee-calculator pattern,
- supported by public official fee tables,
- and small enough to verify in one cycle.

## Repo pattern audit
I reviewed EastSea’s current production pattern for monetization calculators:
- `tools/buy-me-a-coffee-fee-calculator/`
- `tools/amazon-handmade-fee-calculator/`
- `tools/beacons-fee-calculator/`
- discovery surfaces:
  - `tools/index.html`
  - `tools/index.md`
  - `tools/manifest.json`
  - `_data/tools-list.json`

### Pattern observed
A shippable EastSea calculator usually includes:
1. `tools/<slug>/index.html`
2. `tools/<slug>/calculator.js`
3. `tools/<slug>/calculator.test.js`
4. exact-once discovery wiring in the 4 catalog surfaces above
5. deterministic math + Node test coverage

## Local gap audit
I checked whether `venmo-fee-calculator` already exists in the repo or discovery surfaces.

### Result
`venmo-fee-calculator` is absent from all required surfaces:
- `tools/venmo-fee-calculator/` — missing before this task
- `tools/index.html` — no `venmo-fee-calculator` match
- `tools/index.md` — no `venmo-fee-calculator` match
- `tools/manifest.json` — no `venmo-fee-calculator` match
- `_data/tools-list.json` — no `venmo-fee-calculator` match

## Official source findings
Primary official source used:
- `https://venmo.com/resources/our-fees/`

I extracted the public fee table through browser DOM inspection because generic fetch/search output was partial.

### Fee facts confirmed from the official Venmo fee page
1. **Personal account — goods and services payments**
   - Label: `Receive payments in your personal Venmo account that are identified by the sender as for goods and services`
   - Fee: `2.99%`

2. **Charity profile payments**
   - Label: `Receive payments in your charity profile`
   - Fee: `1.9% + $0.10`

3. **Business profile payments**
   - Label: `Receive payments in your business profile`
   - Fee: `1.9% + $0.10 or 2.29% + $0.09`
   - Note on page: standard business profile payments use `1.9% + $0.10`; `Tap to Pay` uses `2.29% + $0.09`

4. **Transfers out of Venmo**
   - Label: `Electronic withdrawal (standard or Instant Transfer)`
   - Fee: `$0.00 or 1.75% (minimum $0.25 fee, maximum $25 fee)`
   - Meaning: standard transfer is free; instant transfer has a capped percentage fee

## Why this is a good EastSea opportunity
1. **Exact-match intent is clean**
   - `venmo fee calculator` is a direct query shape with commercial intent.
   - The tool title can match the query exactly.

2. **Strong fit with existing catalog pattern**
   - EastSea already performs well with marketplace / creator / payout fee calculators.
   - Venmo fits the same “what do I actually keep?” intent.

3. **Public deterministic formulas**
   - The core fee schedule is public and simple.
   - No fragile API or scraping dependency is needed for v1.

4. **Useful differentiation within one page**
   - The tool can compare 4 real receiving modes under identical assumptions:
     - personal goods & services
     - business profile
     - business profile Tap to Pay
     - charity profile
   - This is more useful than a one-number fee lookup.

## Office Hours — forced questions
### 1) 누구의 문제인가?
Primary user: small seller, creator, side hustler, or organizer using Venmo to receive payments and wanting a fast answer to “how much do I keep?”

### 2) 구체적 사례는?
A seller takes 80 Venmo payments a month and is deciding whether to keep using a personal goods-and-services flow, move to a business profile, or use Tap to Pay at in-person events.

### 3) 지금 어떻게 해결하고 있나?
Most users manually multiply percentage fees, forget fixed fees, and ignore the instant-transfer cap/minimum. The result is usually wrong or incomplete.

### 4) 이상적 결과는?
One page, one glance: gross volume, Venmo fee drag, transfer fee drag, take-home, effective fee rate, break-even count, and target-price math — plus side-by-side scenario comparison.

### 5) 제약 조건은?
- Must stay surgical
- Must use only public fee data
- Must fit EastSea’s static HTML/JS pattern
- Must be verifiable with Node tests and a local browser render

### 6) 성공 지표는?
- tool page works locally without console errors
- deterministic tests pass
- discovery surfaces contain the slug exactly once
- the page gives a materially better answer than raw fee tables

## Push back / problem redefinition
The naive request is “make a Venmo fee calculator.”

The real need is narrower and better:
**build a Venmo payout-planning calculator for people receiving payments, not just a static fee table mirror.**

That means the page should not stop at “2.99%.” It should answer:
- net take-home,
- effect of refunds,
- standard vs instant transfer drag,
- target payment amount for a desired monthly net,
- and comparison across Venmo receiving modes.

## Approach options
### 1) Narrowest wedge — recommended
- One page static calculator
- Inputs: receiving mode, payment count, average payment, refund rate, transfer method, transfer count, fixed monthly cost, target net
- Outputs: gross, Venmo fees, transfer fees, take-home, effective fee rate, break-even metrics, all-mode comparison
- Time: same cycle
- Risk: low
- Recommendation: **Yes**

### 2) Balanced
- Add saved presets + recent scenarios in localStorage
- Add shareable query-string state
- Time: 1–2 extra sessions
- Risk: medium
- Recommendation: later, not now

### 3) Full vision
- Multi-platform payout comparator (Venmo vs Cash App vs PayPal vs Square)
- More SEO surface but higher research and maintenance cost
- Time: multi-cycle
- Risk: higher scope creep
- Recommendation: not for this cycle

## Product decision
Chosen tool: **Venmo Fee Calculator**

## Recommended v1 scope
### Inputs
- receiving mode:
  - personal goods & services (`2.99%`)
  - business profile (`1.9% + $0.10`)
  - business profile Tap to Pay (`2.29% + $0.09`)
  - charity profile (`1.9% + $0.10`)
- monthly payment count
- average payment amount
- refund rate
- transfer speed: standard or instant
- transfer count per month
- fixed monthly operating cost
- target monthly net profit

### Outputs
- gross payment volume
- successful payment volume after refunds
- Venmo transaction fees
- transfer fees
- take-home before fixed cost
- monthly net profit
- effective fee rate
- break-even payment count
- required average payment amount for target monthly net
- comparison table across all receiving modes

## Assumptions for v1
- Refunds reduce kept revenue but do not assume fee reversals.
- Instant transfer fee is modeled per payout using the official 1.75% fee with $0.25 minimum and $25 maximum.
- When `transferCount = 0`, transfer fees are treated as zero.
- Currency is USD only.

## Non-goals
- no tax handling
- no chargeback modeling
- no payout timing forecast beyond transfer-fee mode
- no external API calls in the shipped page

## 🔴 Red Team
- [공격 1]: Venmo’s fee page covers multiple account/payment contexts; a sloppy tool could mix them incorrectly.
- [공격 2]: Instant transfer min/max is per transfer, so a naive monthly percentage-only model would mislead users.
- [공격 3]: Refund handling is ambiguous if fee reversals differ by case.
- [방어/완화]: Keep fee modes explicit, model instant transfer per payout count, and state the conservative refund assumption clearly in-page and in tests.
- [합의]: 🟢극복
