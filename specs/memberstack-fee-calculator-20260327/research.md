# Research — Memberstack Fee Calculator

## Goal
Identify exactly one new shippable monetization utility for EastSea that is:
- exact-match searchable,
- commercially aligned with creator / membership revenue intent,
- absent from the current catalog,
- and deterministic enough to ship as a static calculator with local verification.

## Office-hours framing
### 1) 누구의 문제인가?
- Webflow / no-code builders, indie SaaS operators, agency teams, and membership-site creators using **Memberstack** for paid memberships.

### 2) 구체적 사례는?
- A builder is deciding whether to stay on Basic, upgrade to Professional, or move to Business as members and recurring revenue grow.
- The pricing page shows monthly fees and transaction-fee percentages, but it does **not** immediately answer the operational question: *"What do I actually keep after Memberstack + Stripe + refunds + fixed costs?"*

### 3) 지금 어떻게 해결하고 있나?
- Manually reading the pricing table.
- Spreadsheet math.
- Rough mental estimates that usually ignore either fixed plan cost, Stripe flat fees, or upgrade break-even thresholds.

### 4) 이상적 결과는?
- One exact-match page where a founder enters members, monthly gross, charge count, refund rate, and processor assumptions, then sees:
  - take-home,
  - plan comparison,
  - upgrade break-even gross,
  - member-cap eligibility,
  - and target-net required gross.

### 5) 제약 조건은?
- Static site only; no backend.
- Use public pricing only.
- Keep v1 deterministic and explain assumptions clearly.

### 6) 성공 지표는?
- New slug is absent from EastSea today and added exactly once to all discovery surfaces.
- Tool loads locally and computes deterministic outputs.
- Tests cover core plan math, upgrade thresholds, member-cap gating, and invalid input handling.

## Push-back / problem redefinition
The obvious request would be “make another pricing page.” That is too weak.

The real problem is:
**Memberstack users need a plan-decision calculator, not just a copied pricing table.**

The 10x wedge is not a generic comparison article. It is a compact decision engine that converts public pricing into concrete take-home and upgrade timing.

## Deterministic local gap audit
I checked the four EastSea discovery surfaces plus the expected tool directory:
- `tools/memberstack-fee-calculator/`
- `tools/index.html`
- `tools/index.md`
- `_data/tools-list.json`
- `tools/manifest.json`

### Result
`memberstack-fee-calculator` is absent from all of them.

Verification notes captured locally:
- `tools/memberstack-fee-calculator/` does **not** exist.
- `memberstack-fee-calculator` appears `0` times in `tools/index.html`, `tools/index.md`, `_data/tools-list.json`, and `tools/manifest.json`.

## Adjacent catalog coverage already live
EastSea already covers nearby creator and membership-platform economics:
- `memberful-fee-calculator`
- `patreon-fee-calculator`
- `patreon-net-revenue-calculator`
- `buy-me-a-coffee-fee-calculator`
- `substack-fee-calculator`
- `payhip-fee-calculator`
- `stan-store-fee-calculator`
- `podia-fee-calculator`
- `teachable-fee-calculator`
- `skool-fee-calculator`

This makes `memberstack-fee-calculator` a **cluster-completion** move, not a random new vertical.

## Gap found
Chosen exact-match slug: **`memberstack-fee-calculator`**

## Why this is a good gap
1. **Clean exact-match intent**
   - “Memberstack fee calculator” maps directly to a money question and a product decision.
   - It matches EastSea’s high-performing naming pattern: `{platform}-fee-calculator`.

2. **Commercially aligned audience**
   - Memberstack is used by paid-membership builders and agencies; these users are already thinking in pricing, take rate, and margin.

3. **Public pricing is formula-friendly**
   - Memberstack publicly discloses monthly plan prices and transaction-fee percentages.
   - Stripe publicly discloses a baseline domestic-card price useful for a transparent planning preset.

4. **Differentiation beyond a copied pricing table**
   - A useful calculator can show plan eligibility by member cap plus plan-comparison net profit under the same assumptions.

## Official source findings
Research captured on 2026-03-27 via browser extraction and web fetch from official pages.

### Source 1 — Memberstack pricing page
URL: `https://www.memberstack.com/pricing`

Captured from browser snapshot:
- **Basic**: `$29/mo`, `4% transaction fee`, `1,000 Members`
- **Professional**: `$49/mo`, `2% transaction fee`, `5,000 Members`
- **Business**: `$99/mo`, `0.9% transaction fee`, `10,000+ Members`
- **Established**: `$499/mo`, `ZERO transaction fees`, `10,000+ Members`
- Pricing page also exposes a **Yearly 20% OFF** toggle.

Implications for v1:
- We can model four public plans directly.
- We can support monthly billing plus yearly monthly-equivalent pricing using the page’s explicit 20% discount signal.
- We can show upgrade thresholds between adjacent plans.

### Source 2 — Stripe pricing page
URL: `https://stripe.com/pricing`

Captured from official pricing page:
- `2.9% + 30¢ per successful transaction for domestic cards`

Implications for v1:
- A safe default processor preset is Stripe domestic cards.
- We should also allow a custom processor override because actual card mix and country vary.

## Product decision
Chosen tool: **Memberstack Fee Calculator**

## Recommended v1 modeling scope
### Inputs
- billing mode (`monthly` | `yearly` monthly-equivalent)
- active members
- monthly gross sales
- successful charges per month
- current plan (`basic` | `professional` | `business` | `established`)
- refund rate
- processor preset (`stripe-domestic` | `custom`)
- custom processor rate
- custom processor flat fee
- other monthly fixed cost
- desired monthly net profit

### Outputs
- monthly gross sales
- Memberstack fixed plan cost
- Memberstack transaction fees
- processor fees
- refund loss
- monthly net profit
- annualized net profit
- effective all-in platform/payment take rate
- break-even monthly gross sales
- required gross for target net
- member-cap eligibility / headroom
- comparison across all public plans under the same assumptions
- adjacent upgrade thresholds (Basic→Professional, Professional→Business, Business→Established)

## Non-goals for v1
- No tax/VAT engine
- No churn or LTV modeling
- No multiple processor matrix beyond one public default + custom override
- No enterprise custom quotes beyond the published Established plan
- No annual prepay cashflow timing model; only monthly-equivalent comparison for yearly billing

## Approach options
### 1) Narrowest wedge — recommended
- Static calculator with plan comparison, upgrade thresholds, member caps, and target-net math.
- Why recommended: shippable today, exact-match intent, fully deterministic.

### 2) Balanced
- Add annual-vs-monthly cashflow visualization and processor mix presets.
- Better, but slower than needed for this heartbeat lane.

### 3) Full vision
- Build a broader “membership platform economics” hub comparing Memberstack, Memberful, Circle, Skool, and custom billing.
- Attractive long-term, but not needed for the first shipping slice.

## Confidence and caveats
- Confidence is **high** that `memberstack-fee-calculator` is a real EastSea catalog gap.
- Confidence is **high** on the public Memberstack monthly plan fees and transaction-rate structure because the pricing page exposes them directly.
- Confidence is **moderate** on universal processor assumptions because Stripe fees vary by geography and payment method.
- Therefore v1 should remain explicit: **public Memberstack plan math + one Stripe baseline + custom override + clear assumption copy**.
