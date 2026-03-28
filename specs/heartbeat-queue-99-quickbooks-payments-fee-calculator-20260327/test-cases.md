# Test Cases — QuickBooks Payments Fee Calculator

## Repo-gap checks
1. Preflight slug audit returns zero matches outside this spec folder.
2. No `tools/quickbooks-payments-fee-calculator/` directory exists before implementation.
3. No catalog entry exists before implementation in:
   - `tools/manifest.json`
   - `_data/tools-list.json`
   - `tools/index.html`
   - `tools/index.md`

## Calculation tests
4. Invoice or digital-wallet mode at `$100` uses the default `2.99%` rate.
5. ACH mode at `$100` uses the default `1.00%` rate.
6. In-person mode at `$100` uses the default `2.50%` rate.
7. Keyed-in mode at `$100` uses the default `3.50%` rate.
8. International toggle adds `1.00%` only to eligible card or wallet modes.
9. Reverse mode correctly computes the gross amount needed to net a target amount.
10. Monthly transaction count multiplies per-transaction fees into monthly and annual totals.
11. Custom override mode replaces defaults cleanly without mutating the base presets.
12. Invalid amount or invalid custom rate returns a user-facing validation error.

## Content and UX tests
13. HTML contains exact-match `<title>` and `<h1>` for `QuickBooks Payments Fee Calculator`.
14. Page includes a caveat that rates can vary and defaults are editable.
15. FAQ contains QuickBooks-specific questions, not generic processor FAQ copy.
16. Summary output includes payment type, effective rate, fee, and net proceeds.

## Catalog tests for future implementation
17. `tools/index.html` contains the tool card exactly once.
18. `tools/index.md` contains the markdown entry exactly once.
19. `tools/manifest.json` contains the slug exactly once.
20. `_data/tools-list.json` contains the URL exactly once.

## Explicit verification commands
### Current docs-only
```bash
test -f specs/heartbeat-queue-99-quickbooks-payments-fee-calculator-20260327/research.md
test -f specs/heartbeat-queue-99-quickbooks-payments-fee-calculator-20260327/spec.md
test -f specs/heartbeat-queue-99-quickbooks-payments-fee-calculator-20260327/plan.md
test -f specs/heartbeat-queue-99-quickbooks-payments-fee-calculator-20260327/test-cases.md
rg -n "quickbooks-payments-fee-calculator|QuickBooks Payments Fee Calculator" \
  specs/heartbeat-queue-99-quickbooks-payments-fee-calculator-20260327
rg -n "quickbooks-payments-fee-calculator|quickbooks payments fee" \
  tools tools/manifest.json _data/tools-list.json specs \
  -g '!specs/heartbeat-queue-99-quickbooks-payments-fee-calculator-20260327/**'
```

### Future implementation
```bash
node --check tools/quickbooks-payments-fee-calculator/calculator.js
node --test tools/quickbooks-payments-fee-calculator/calculator.test.js
python3 -m http.server 4173
curl -I http://127.0.0.1:4173/tools/quickbooks-payments-fee-calculator/
```
