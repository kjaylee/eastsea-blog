# Gap Analysis — Skool Fee Calculator

## What shipped
- Static tool bundle at `tools/skool-fee-calculator/`
- Pure calculator module with deterministic exports and tests
- Responsive HTML page with metadata, KPI cards, detail rows, comparison table, and copyable summary
- Discovery wiring in `tools/index.html`, `tools/index.md`, `_data/tools-list.json`
- Manifest entry rebuilt into `tools/manifest.json`

## Remaining gaps
1. **No country-specific payout / FX model**
   - Skool pays out in local currency, but v1 keeps the calculator in USD.
   - Good enough for pricing decisions, not enough for treasury planning.

2. **No payout-delay cashflow model**
   - Weekly payout timing is documented in research but not modeled.
   - This is a profitability tool, not a cash-conversion-cycle tool.

3. **Refund fee-reversal treatment is conservative**
   - The FAQ does not fully specify how all fees behave on refunds.
   - v1 subtracts refund loss separately and keeps fee modeling simple.

4. **High-ticket threshold interpretation is simplified**
   - v1 uses `>= $900` to trigger Pro’s 3.9% rate.
   - If Skool documents exact cent-level cutoff behavior later, the threshold logic can be tightened.

5. **Repo-wide catalog debt remains**
   - `tool-catalog-guard.py` still reports many unrelated missing tools-list entries and stale landing-page counts.
   - This Skool tool is wired correctly, but the repository as a whole is not yet fully clean.

## If iterating next
- Add a payout-currency / FX drag toggle
- Add optional dispute-rate modeling next to refund rate
- Add a reverse solver for required subscription price at a fixed member count
- Pair with a future `ghost-membership-revenue-calculator` or `thinkific-fee-calculator` to continue creator-platform cluster coverage
