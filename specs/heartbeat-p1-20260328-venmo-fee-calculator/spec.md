# Spec — Venmo Fee Calculator

## Goal
Ship a new static EastSea calculator at `tools/venmo-fee-calculator/` that models Venmo receiving fees and payout drag with deterministic, testable math.

## Deliverables
1. `tools/venmo-fee-calculator/index.html`
2. `tools/venmo-fee-calculator/calculator.js`
3. `tools/venmo-fee-calculator/calculator.test.js`
4. Discovery updates:
   - `tools/index.html`
   - `tools/index.md`
   - `tools/manifest.json`
   - `_data/tools-list.json`
5. Verification artifacts under `specs/heartbeat-p1-20260328-venmo-fee-calculator/`

## Functional requirements
1. The page must load as a fully static calculator with no backend.
2. The calculator must support these receiving modes:
   - `personalGoods`
   - `businessProfile`
   - `businessTapToPay`
   - `charityProfile`
3. Fee presets must match research:
   - personal goods: `2.99%`
   - business profile: `1.9% + $0.10`
   - business Tap to Pay: `2.29% + $0.09`
   - charity profile: `1.9% + $0.10`
4. Transfer method must support:
   - standard transfer = `$0`
   - instant transfer = `1.75%`, min `$0.25`, max `$25` per transfer
5. Inputs:
   - receiving mode
   - monthly payment count
   - average payment amount
   - refund rate pct
   - transfer method
   - transfer count per month
   - fixed monthly cost
   - desired monthly net profit
6. Outputs:
   - gross payment volume
   - successful revenue after refunds
   - Venmo fees total
   - transfer fees total
   - take-home before fixed cost
   - monthly net profit
   - effective fee rate
   - break-even payment count
   - required average payment for target monthly net
   - comparison table across all receiving modes
7. Summary text must be copy-ready and include assumptions.
8. The page must support EN/KR text toggle.
9. Validation must reject invalid inputs with human-readable errors.
10. The tool must work on mobile-width layouts.

## Non-goals
- No API integration
- No account-specific custom rate overrides in v1
- No tax or chargeback modeling
- No saved history/localStorage in v1

## Assumptions
1. Refunds reduce kept revenue and do not assume Venmo fee reversals.
2. Instant transfer fee is calculated per payout event using the provided transfer count.
3. If transfer count is `0`, transfer fees are `0` regardless of transfer method.

## Safety / quality constraints
- Keep logic deterministic and directly testable from Node.
- Keep edits surgical; no unrelated tool rewrites.
- Discovery wiring must include the slug exactly once in each required surface.

## Verification commands
```bash
node --check eastsea-blog/tools/venmo-fee-calculator/calculator.js
node --test eastsea-blog/tools/venmo-fee-calculator/calculator.test.js
python3 -m json.tool eastsea-blog/tools/manifest.json >/dev/null
python3 -m json.tool eastsea-blog/_data/tools-list.json >/dev/null
cd /Users/kjaylee/.openclaw/workspace/eastsea-blog && python3 -m http.server 8037
```
