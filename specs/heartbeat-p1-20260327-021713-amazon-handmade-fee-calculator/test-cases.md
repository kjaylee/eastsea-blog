# Test Cases — Amazon Handmade Fee Calculator

1. `TC-AH-01 baseline 15% fee`
   - Item price high enough that the 15% referral fee exceeds `$1`.
   - Expect positive per-order and monthly profit.

2. `TC-AH-02 minimum fee floor`
   - Low item price where `max(itemPrice * 0.15, 1)` resolves to `$1`.
   - Expect effective referral rate above `15%`.

3. `TC-AH-03 first-month fee drag`
   - Same profitable order economics but with `includeFirstMonthProfessionalFee = true`.
   - Expect lower monthly profit and finite payback orders.

4. `TC-AH-04 ongoing monthly fee override`
   - Add a custom ongoing monthly fee.
   - Expect monthly net to drop by that exact amount.

5. `TC-AH-05 break-even price`
   - Verify returned break-even item price is below baseline profitable price.

6. `TC-AH-06 target monthly net pricing`
   - Required price for target monthly net should exceed baseline when target profit is higher than current output.

7. `TC-AH-07 invalid inputs`
   - Reject zero/negative item price, negative costs, fractional monthly orders, and negative target net.

8. `TC-AH-08 html includes`
   - HTML contains analytics include, language toggle, calculator script, and core labels.

9. `TC-AH-09 discovery exact once`
   - Each of `tools/index.html`, `tools/index.md`, `_data/tools-list.json`, and `tools/manifest.json` contains the slug exactly once.

10. `TC-AH-10 manifest size matches folder`
   - Manifest entry size matches the on-disk size for the tool directory.
