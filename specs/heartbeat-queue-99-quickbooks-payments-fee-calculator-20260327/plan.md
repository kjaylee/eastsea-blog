# Plan — QuickBooks Payments Fee Calculator

## Preflight
1. Confirm the slug remains absent outside this spec folder.
2. Re-read existing adjacent payment-fee tools for layout and test conventions only.
3. Keep the page narrowly scoped to QuickBooks Payments fee math, not generic processor switching.

## Implementation plan
1. Create:
   - `tools/quickbooks-payments-fee-calculator/index.html`
   - `tools/quickbooks-payments-fee-calculator/calculator.js`
   - `tools/quickbooks-payments-fee-calculator/calculator.test.js`
2. Implement pure fee math first with exported defaults, validation, and summary builder.
3. Add a compact UI with:
   - forward/reverse mode toggle
   - payment-type switcher
   - international toggle
   - optional monthly transaction count
   - editable override section
4. Add exact-match copy and FAQ.
5. Wire discovery once:
   - `tools/index.html`
   - `tools/index.md`
   - `tools/manifest.json`
   - `_data/tools-list.json`
6. Add deterministic tests for math, HTML anchors, and catalog exact-once behavior.

## Verification commands
### Current docs-only verification
```bash
test -d specs/heartbeat-queue-99-quickbooks-payments-fee-calculator-20260327
find specs/heartbeat-queue-99-quickbooks-payments-fee-calculator-20260327 -maxdepth 1 -type f | sort
rg -n "quickbooks-payments-fee-calculator|QuickBooks Payments Fee Calculator" \
  specs/heartbeat-queue-99-quickbooks-payments-fee-calculator-20260327
rg -n "quickbooks-payments-fee-calculator|quickbooks payments fee" \
  tools tools/manifest.json _data/tools-list.json specs \
  -g '!specs/heartbeat-queue-99-quickbooks-payments-fee-calculator-20260327/**'
```

### Future implementation verification
```bash
node --check tools/quickbooks-payments-fee-calculator/calculator.js
node --test tools/quickbooks-payments-fee-calculator/calculator.test.js
python3 -m http.server 4173
curl -I http://127.0.0.1:4173/tools/quickbooks-payments-fee-calculator/
curl -s http://127.0.0.1:4173/tools/quickbooks-payments-fee-calculator/ | \
  rg "QuickBooks Payments Fee Calculator|calculator.js|2.99%|1%|2.5%|3.5%"
```

## Red Team
- Attack: Intuit already owns the rate page, so this may be a weak SEO opportunity.
- Attack: official rates vary across plans, discounts, or merchant qualification, so a rigid calculator could mislead users.
- Attack: this could drift into a generic payment-fee page and overlap EastSea's existing payment tools.

Mitigation:
- Keep the page exact-match and provider-specific.
- Treat official public rates as editable defaults, not locked truths.
- Date-stamp the assumptions and call out custom-rate overrides.
- Keep the scope on QuickBooks fee estimation, not broader gateway migration ROI.

Decision:
- Proceed. The opportunity is moderate, but the gap is clean, commercially useful, and materially less crowded than another creator/course/SaaS-metric page.
