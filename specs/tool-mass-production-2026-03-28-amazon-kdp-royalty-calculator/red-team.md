# Red Team — Amazon KDP Royalty Calculator

🔴 Red Team:
- [공격 1]: “KDP royalty calculator” users may expect hardcover and Kindle Unlimited page-read support. Shipping only ebook + paperback could feel incomplete.
- [공격 2]: 70% ebook royalties have extra eligibility rules (territories, pricing-page compliance, public-domain exclusions, price-matching fallout). A naive calculator could over-promise.
- [공격 3]: Paperback print costs vary by page count, marketplace, and ink. Hardcoding print-cost tables would likely be wrong and age badly.
- [공격 4]: Marketplace thresholds for paperback 50% vs 60% could be misapplied if we collapse currencies or ignore the official breakpoint chart.
- [공격 5]: Manual catalog edits could create duplicate discovery entries and break “exact once” integrity.
- [방어/완화]:
  - v1 explicitly scopes to **ebook + paperback only**, and gap-analysis records hardcover/KU as next slices.
  - UI copy clearly states: verify 70% eligibility in KDP; this page estimates with public formulas only.
  - Printing cost is a required manual input sourced from KDP’s own estimator/pricing tab.
  - Paperback thresholds are stored as explicit marketplace constants taken from the official chart.
  - Exact-once catalog wiring is enforced in unit tests across `tools/index.html`, `tools/index.md`, `_data/tools-list.json`, and `tools/manifest.json`.
- [합의]: 🟢극복
