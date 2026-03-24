# Research — Patreon Net Revenue Calculator (2026-03-25)

Objective: Ship a static calculator to estimate a creator’s monthly take‑home on Patreon after platform fees, payment processing, refunds, and payout drag. Keep assumptions explicit and user‑editable to avoid misrepresenting ever‑changing pricing.

What we know (assumptions to model, editable in UI):
- Patreon plan fee presets: Lite ~5%, Pro ~8%, Premium ~12%. We expose a custom rate as well.
- Payment processing: common public baseline uses a two‑tier model by charge amount (standard vs micro). Defaults we ship:
  - Standard: 2.9% + $0.30 per charge (assumed when charge > $3)
  - Micro: 5.0% + $0.10 per charge (assumed when charge ≤ $3)
  - Threshold: $3
  Users can override both tiers and threshold.
- Refund/chargeback drag: simple percent of gross charges (default 2%).
- Payout drag: flat per payout (default $0.25) and optional percent of payout amount (default 0%). Payouts per month default 1.
- Scope: Same‑currency estimate. We don’t model regional VAT/GST collection; creators typically receive amounts net of tax that platforms collect/remit as MoR.

Comparable internal tools reviewed for patterns:
- tools/memberful-fee-calculator: separate `calculator.js`, strong tests incl. catalog exact‑once.
- tools/gumroad-net-revenue-calculator: i18n, summary export, catalog tests.
- tools/app-store-net-revenue-calculator: single‑file style, also provides compute anchors.

Design implications:
- Export a deterministic pure `calculate(input, {lang})` from `calculator.js` for tests.
- Inputs grouped by revenue type: Monthly memberships, Annual memberships billed this period, One‑time purchases.
- Apply per‑charge processing math using the tier logic per bucket based on average charge in that bucket.
- Surface platform fee, processing fee, refund loss, payout drag, other fixed monthly cost.
- KPIs: Net revenue, total fees, effective fee rate, take‑home per monthly member, break‑even average monthly price for zero net (optional target net).
- Catalog wiring must touch `_data/tools-list.json` and `tools/manifest.json`; `tools/index.html` and `tools/index.md` already contain the slug.

Risks & mitigations:
- Fee schedules change: default as presets + override fields; add disclaimers and notes.
- Micro/standard boundary by $3 varies by region/provider: make threshold configurable.
- Payout % varies by method: include both flat and percent knobs.
- Locale/currency: default USD, allow currency code selection for formatting only.

