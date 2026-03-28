# Research — ThriveCart vs SamCart Cost Calculator

## Goal
Ship one new, high-intent micro-tool in `eastsea-blog/tools/` that targets a real monetization/comparison query and can be verified with deterministic math.

## Chosen candidate
**`thrivecart-vs-samcart-cost-calculator`**

One-line wedge:
> A static calculator for creators comparing ThriveCart’s one-time-license model with SamCart’s recurring monthly pricing, including break-even month, cumulative platform cost, and lift required for a recurring subscription to pay for itself.

## Repo gap check
Evidence gathered inside the repo on 2026-03-29 KST:

- `_data/tools-list.json` does **not** contain `thrivecart-vs-samcart-cost-calculator`.
- `find tools -maxdepth 1 -type d | grep 'thrivecart'` returned no existing ThriveCart-specific tool.
- Adjacent creator/platform calculators already shipped:
  - `skool-fee-calculator`
  - `mighty-networks-fee-calculator`
  - `memberful-fee-calculator`
  - `circle-so-pricing-calculator`
  - `thinkific-fee-calculator`
  - `teachable-fee-calculator`
  - `whop-fee-calculator`

Conclusion: this is a real catalog gap, not a duplicate.

## Why this candidate wins now
1. **Strong search intent** — people searching “ThriveCart vs SamCart”, “ThriveCart vs SamCart pricing”, or “one-time vs monthly cart software” are close to a buying decision.
2. **Useful math** — the decision is naturally calculator-shaped: one-time cost vs recurring cost over a planning horizon.
3. **Fast static implementation** — the comparison can be modeled with transparent formulas and editable assumptions.
4. **Cluster fit** — the repo already ranks around creator/platform fee calculators, so internal linking is natural.

## Public-source facts used

### 1) Official ThriveCart comparison page
Source: `https://thrivecart.com/compare/thrivecart-vs-samcart/`

Facts extracted in this run:
- ThriveCart is positioned as a **one-time payment for lifetime access**.
- ThriveCart lists **no recurring platform fees** and **no revenue limits**.
- SamCart is described as **starting at $79/month** or **$59/mo billed annually ($710/yr)**.
- The same comparison page says SamCart pricing can rise as revenue crosses thresholds such as **$3k, $4k, $5k, $10k+**.
- The page also frames both products as compatible with common payment processors, so processor fee assumptions should stay user-editable rather than hard-coded as platform-specific truth.

### 2) Official SamCart pricing page metadata
Source: `https://www.samcart.com/pricing`

Facts extracted in this run:
- Title: **“SamCart Pricing | Plans Starting at $79/mo | Start Free Trial”**
- This confirms the public entry price floor but does **not** fully expose every revenue-linked step-up price in the fetched snapshot.

### 3) Search-result confirmation of commercial intent
Source: fallback search via SearXNG on 2026-03-29 KST

Relevant result patterns observed:
- Official ThriveCart comparison pages for `ThriveCart vs SamCart`
- Third-party comparison/review pages specifically discussing the pricing-model tradeoff

Interpretation:
- there is real comparison demand,
- the query is monetization-oriented,
- and a calculator gives more immediate value than another prose-only comparison page.

## Product decision
Ship a calculator that models:

1. **ThriveCart**
   - one-time upfront fee
   - optional annual add-on cost (editable)
   - no recurring platform fee by default

2. **SamCart**
   - recurring monthly fee (default public starting point: $79/mo)
   - optional extra monthly surcharge to model revenue-linked plan growth
   - optional monthly gross-sales lift assumption if the user believes SamCart’s features improve revenue

3. **Shared economics**
   - monthly gross sales
   - successful payments
   - refund rate
   - processor variable fee
   - processor flat fee
   - other monthly operating cost
   - planning horizon in months
   - target monthly net profit

4. **Outputs**
   - cumulative platform cost for each option
   - cumulative net after platform cost
   - break-even month when SamCart cumulative platform fees exceed ThriveCart upfront cost
   - gross-sales lift needed for SamCart to justify the extra recurring platform cost
   - required baseline gross sales to hit the target monthly net under each option

## Scope guardrails
- Use only public facts for the model shape.
- Keep unobservable pricing details **editable**, not hard-coded as universal truth.
- Clearly label the ThriveCart upfront default as a **market-observed example** rather than a guaranteed live quote.
- Keep everything fully static: HTML + JS only.

## Non-goals for v1
- No attempt to reconstruct SamCart’s hidden/partial revenue-tier schedule.
- No feature-by-feature product review.
- No processor-specific country tables.
- No tax/VAT engine.
- No checkout conversion benchmarking dataset.

## Success definition
v1 succeeds if it:
1. targets the branded comparison query directly,
2. exposes transparent break-even math,
3. uses editable assumptions where official pricing detail is incomplete,
4. ships with deterministic tests and exact-once catalog wiring.

## Research verdict
**Implement next.** The tool is narrow, monetizable, differentiable, and low-risk for a single static slice.