# Test Cases — Stan Store Fee Calculator

## Pure-calculation tests
1. **TC-STAN-01 baseline Creator monthly + Stripe standard**
   - Verify gross, refund loss, processor fees, net profit, break-even price, required price, and Pro payback math.

2. **TC-STAN-02 annual Creator beats monthly Creator by exactly the effective fee delta**
   - Same inputs as baseline.
   - Expect annual monthly-equivalent net profit to exceed monthly by `$4`.

3. **TC-STAN-03 Creator Pro monthly payback requirement**
   - Verify extra orders and extra gross needed to offset the `$70` monthly fee gap vs Creator monthly.

4. **TC-STAN-04 Afterpay drag exceeds Stripe standard**
   - Same sales assumptions, but processor preset = Afterpay.
   - Expect higher processor fees and lower monthly net profit.

5. **TC-STAN-05 custom processor override**
   - Use custom rate/flat/international/recurring fees.
   - Expect custom effective rate to flow through all totals.

6. **TC-STAN-06 invalid inputs rejected**
   - Negative price, zero orders, invalid plan, invalid preset, out-of-range shares, invalid custom fees.

7. **TC-STAN-07 reverse outputs null when contribution margin <= 0**
   - Extreme custom processor rate should make reverse-price and reverse-order outputs return `null`.

8. **TC-STAN-08 summary includes decision-ready lines**
   - Summary must mention selected plan, processor preset, monthly net profit, best plan, required price, and Creator Pro uplift needed.

## Discovery/HTML tests
9. **TC-STAN-09 HTML scaffold anchors**
   - Confirm canonical, analytics include, summary textarea, comparison table body, and deferred calculator script.

10. **TC-STAN-10 exact-once discovery wiring**
   - Slug occurs exactly once in `tools/index.html`, `tools/index.md`, `_data/tools-list.json`, and `tools/manifest.json`.
