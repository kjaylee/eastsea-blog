# Test Cases — OnlyFans Earnings Calculator

## Unit tests
1. **Baseline scenario**
   - Input representative creator numbers.
   - Assert gross revenue, 20% platform fee, refund loss, payout drag, take-home before ops, and final net income.
2. **Target subscriber math**
   - Assert required subscribers for a monthly target net income.
3. **Break-even math**
   - Assert break-even subscribers from fixed costs and per-subscriber contribution.
4. **Required subscription price math**
   - Assert solved subscription price at current subscriber count.
5. **Validation rejection**
   - Reject negative money values, refund >= 100, payout delay > 365, annual cash-cost > 100.
6. **Zero-subscriber edge case**
   - No divide-by-zero.
   - Per-subscriber outputs become null.
   - Target-subscriber outputs become null when scaling assumption is impossible.
7. **Net-income sensitivity**
   - Higher promo cost lowers net income dollar-for-dollar.
   - Higher refund rate lowers net income and keep rate.
8. **HTML scaffold checks**
   - Required IDs exist in HTML.
   - `analytics.js` and `calculator.js` are wired.
9. **Catalog exact-once checks**
   - `tools/index.html`
   - `tools/index.md`
   - `_data/tools-list.json`
   - `tools/manifest.json`

## Integration / verification tests
1. `node --test tools/onlyfans-earnings-calculator/calculator.test.js`
2. `node --test tests/integration/manifest-integrity.test.mjs`
3. Local HTTP smoke:
   - GET `/tools/onlyfans-earnings-calculator/`
   - confirm 200
   - confirm title / canonical markers appear in HTML

## Manual QA checklist
- Language toggle changes visible copy.
- Inputs recalc instantly.
- Summary copy button is present.
- Layout remains readable on narrow width.
- Disclaimer clearly states assumptions and non-goals.
