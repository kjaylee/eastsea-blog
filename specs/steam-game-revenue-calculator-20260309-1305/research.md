# Research — steam-game-revenue-calculator

## Goal
Ship one new static Steam-focused monetization tool for `eastsea-blog` that estimates take-home revenue for a premium game after launch discounting, VAT/GST removal, refunds, Steam revenue share, per-copy support cost, and fixed launch spend.

## Files reviewed before implementation
1. `AGENTS.md`
   - Confirms the mandatory build gate: Research → Spec → Plan → Test Cases → Implementation → Verification → Gap Analysis → Iterate.
2. `eastsea-blog/tools/app-store-net-revenue-calculator/index.html`
   - Reuse target for bilingual shell, responsive two-card layout, copy/reset controls, live validation, and summary textarea pattern.
3. `eastsea-blog/tools/google-play-net-revenue-calculator/index.html`
   - Best current sibling for a platform take-home calculator with `TESTABLE_COMPUTE` markers and browser-free verification via extracted compute logic.
4. `eastsea-blog/tools/index.html`
   - Confirms the landing-card markup pattern for adding one discoverable catalog card.
5. `eastsea-blog/tools/manifest.json`
   - Confirms manifest is generated from `tools/*/index.html` and that the new slug is not yet present because the Steam directory has no `index.html`.
6. `eastsea-blog/_data/tools-list.json`
   - Confirms manual catalog copy format for title + description + canonical `/tools/<slug>/` URL.
7. `eastsea-blog/scripts/build-manifests.sh`
   - Confirms manifest regeneration is the correct path for size/count metadata.
8. `eastsea-blog/scripts/tool-catalog-guard.py`
   - Provides a deterministic, browser-free integrity audit for manifest and tools-list coverage.

## Findings
- `tools/steam-game-revenue-calculator/` already exists as an empty directory, so implementation can stay surgical.
- The exact current P1 batch spec package referenced by the sibling Google Play research is not present in the working tree, so the closest reliable contract must be inferred from adjacent shipped platform net-revenue tools plus the requested slug.
- Steam economics differ from App Store / Google Play: premium game revenue is better modeled from unit sales and realized selling price rather than installs or subscription retention.
- A practical v1 should avoid external platform APIs and avoid overlap with broader game LTV tools (`MAU`, `ARPDAU`, ad mix, battle pass, wishlist funnel). Focus on unit-sales take-home only.

## Proposed v1 scope
- Inputs: units sold, list price (tax inclusive), average discount, VAT/GST, refund rate, Steam fee rate, per-copy support/ops cost, fixed launch cost.
- Outputs: gross sales after discount, revenue ex tax, refund leakage, Steam fee amount, Steam net proceeds, total cost, net profit, net margin, take-home per copy, break-even copies.
- Single-file static implementation with KO/EN toggle, live recalculation, copy-summary, reset-defaults, and validation reset behavior.
- Verification: `curl` local HTTP 200 + title smoke, extracted `compute(v)` checks via Node, manifest rebuild, tools-list presence, and tool-catalog-guard audit.
