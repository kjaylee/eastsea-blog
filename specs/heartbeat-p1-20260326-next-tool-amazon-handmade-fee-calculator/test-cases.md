# Test Cases — Amazon Handmade Fee Calculator

## Pure-calculation tests
1. **TC-AH-01 baseline order economics**
   - Verify buyer charge basis, referral fee, effective referral rate, per-order net, monthly fixed cost, monthly net, required orders, break-even price, and target price.
2. **TC-AH-02 first-month fee toggle**
   - Turning on first-month Professional fee should reduce monthly net profit dollar-for-dollar.
3. **TC-AH-03 minimum referral fee floor**
   - Low-price order should hit the $0.30 floor and raise effective referral rate above 15%.
4. **TC-AH-04 buyer-paid shipping changes fee basis**
   - Higher shipping charged to buyer should increase basis, referral fee, and net profit if seller shipping cost stays constant.
5. **TC-AH-05 validation rejects invalid values**
   - Reject zero/negative product price, negative costs, non-integer or zero monthly orders, and negative target net.
6. **TC-AH-06 helper exports remain callable**
   - `computeOrderMetrics`, `getMonthlyFixedCosts`, and `solveProductPrice` stay usable from Node tests.
7. **TC-AH-07 defaults are valid**
   - `DEFAULTS` should produce a valid positive-profit scenario.

## HTML/discovery tests
8. **TC-AH-08 HTML scaffold anchors**
   - Page includes required inputs, summary area, analytics include, canonical, and official fee-copy anchors.
9. **TC-AH-09 exact-once discovery wiring**
   - `tools/index.html`, `tools/index.md`, `_data/tools-list.json`, and `tools/manifest.json` each reference the slug exactly once.
10. **TC-AH-10 discovery copy mentions $0.30 minimum fee**
   - Ensures exact-match pricing nuance survives catalog copy.
