# Test Cases — Payhip Fee Calculator

## Pure-calculation tests
1. **TC-PH-01 baseline Plus + Stripe scenario**
   - Inputs: $30 AOV, 120 orders, 2% refund, Plus plan, Stripe preset, $300 other fixed, $2,000 desired net.
   - Expect deterministic totals for gross sales, Payhip fees, processor fees, monthly net profit, required price, and upgrade thresholds.

2. **TC-PH-02 Free plan net profit**
   - Same baseline, but Free plan.
   - Expect higher variable fee, zero monthly plan fee, and lower net than Plus at this gross.

3. **TC-PH-03 Pro plan wins above Plus→Pro threshold**
   - Baseline gross is $3,600, above the $3,500 Plus→Pro threshold.
   - Expect recommendation/comparison winner = Pro.

4. **TC-PH-04 low-gross scenario recommends Free**
   - Use gross below $966.67.
   - Expect Free to beat Plus and Pro.

5. **TC-PH-05 custom processor scenario**
   - Use custom 4.1% + $0.60.
   - Expect processor fees to rise and required price to rise.

6. **TC-PH-06 reverse-price outputs null when contribution denominator <= 0**
   - Use extreme processor/refund rates.
   - Expect `breakEvenPrice` and `requiredPriceForTargetNet` to be null.

7. **TC-PH-07 validation rejects invalid inputs**
   - Negative price, zero orders, invalid plan, invalid preset, invalid refund rate, invalid custom fees.

8. **TC-PH-08 summary includes decision-ready lines**
   - Summary must include plan label, gross sales, Payhip fees, processor fees, monthly net profit, required price, and upgrade thresholds.

## Discovery/HTML tests
9. **TC-PH-09 HTML scaffold anchors**
   - Ensure page includes canonical, analytics include, summary textarea, comparison table body, and calculator script.

10. **TC-PH-10 exact-once discovery wiring**
    - `tools/index.html` contains the slug exactly once.
    - `tools/index.md` contains the slug exactly once.
    - `_data/tools-list.json` contains the Payhip URL exactly once.
    - `tools/manifest.json` contains the slug exactly once after rebuild.
