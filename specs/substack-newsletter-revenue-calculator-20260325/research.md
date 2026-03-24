# Research — Substack Newsletter Revenue Calculator

Scope
- Fill an existing discovery-card gap: catalog already links `/tools/substack-newsletter-revenue-calculator/` in `tools/index.html`, `tools/index.md`, and `_data/tools-list.json`, but the tool page and manifest entry are missing.
- Deliver a static, client-only calculator that models monthly-equivalent net revenue for a Substack newsletter given paid subscriber mix (monthly vs annual) and optional founding-members one‑time support.

Nearby references in this repo
- `tools/substack-fee-calculator/` — robust, node-testable compute module + UI. Uses defaults: Substack 10%, processor 2.9% + $0.30, recurring billing 0.7%, refunds, summary export. Pattern to reuse for validation, formatting, export, `node:test` harness, and `/assets/analytics.js` include.
- `tools/creator-membership-platform-fee-comparator/` — contains Substack fee knobs used for cross‑platform comparisons; confirms recurring billing fee usage and naming.
- `tools/newsletter-paid-upgrade-revenue-calculator/` — newsletter‑adjacent KPI layout/tones.
- Catalog guard: `scripts/tool-catalog-guard.py` enforces that for each filesystem tool slug there is exactly one entry in `tools/manifest.json`, `_data/tools-list.json`, and that each tool page includes a `<title>`, meta description, and `/assets/analytics.js`.

Assumption posture (static, offline)
- Use editable fee defaults consistent with the Substack fee model already present in `substack-fee-calculator`:
  - Platform fee: 10%
  - Processing: 2.9% + $0.30 per charge
  - Recurring billing fee: 0.7% (applies to recurring subscriptions only)
  - Refunds: percent of gross
- Compute target is a “monthly‑equivalent” snapshot when monthly and annual subscriptions both exist. Annual/founding charges are converted to 1/12 equivalents for monthly rollup. Fixed per‑charge fees are treated per charge and 1/12 for annual/founding.

What this tool adds vs substack-fee-calculator
- fee-calculator: focuses on a single billing cycle at a time and solves for required subscribers for a target net.
- newsletter-revenue-calculator (this work): mixes monthly + annual + optional founding members in one snapshot and reports monthly‑equivalent gross, refunds, fees, and net; also supports estimating paid base from audience and paid conversion rate.

Success signals
- Deterministic compute covered by `node:test`.
- Page renders with a compact two‑panel layout, includes `/assets/analytics.js`.
- Catalog guard passes: manifest updated and no duplicate entries.

Out of scope
- Trials, coupons, regional tax/VAT, chargebacks, payout drag, multi‑currency.
