# Test Cases — Skool Fee Calculator

## Pure-calculation tests
1. **TC-SK-01 baseline Pro scenario**
   - Inputs: $99 price, 80 billed members, 2% refund, Pro monthly, $500 other monthly cost, $5,000 target net.
   - Expect deterministic gross sales, fees, take-home, monthly net profit, break-even members, and target members.

2. **TC-SK-02 Hobby scenario is worse above upgrade threshold**
   - Same baseline but Hobby.
   - Expect lower monthly net profit than Pro.

3. **TC-SK-03 low-gross scenario recommends Hobby**
   - Use gross clearly below the Hobby→Pro threshold.
   - Expect recommendation = Hobby and Pro net lower because fixed fee dominates.

4. **TC-SK-04 Pro high-ticket rate applies at $900+**
   - Use price `>= 900`.
   - Expect Pro transaction rate = `3.9%` instead of `2.9%`.

5. **TC-SK-05 annual billing lowers fixed-cost drag**
   - Same scenario with `planBilling = annual`.
   - Expect lower monthly-equivalent plan fee than monthly billing.

6. **TC-SK-06 break-even / target members return null when contribution <= 0**
   - Use impossible economics (extreme refund rate combined with fee drag).
   - Expect `breakEvenMembers` and `requiredMembersForTargetNet` to be `null`.

7. **TC-SK-07 validation rejects invalid inputs**
   - Negative price, zero members, non-integer members, invalid tier, invalid billing mode, refund rate >= 100, negative costs, price above limit.

8. **TC-SK-08 summary includes decision-ready lines**
   - Summary must include selected plan, billing mode, subscription price, gross sales, transaction-fee rate, monthly net profit, break-even members, and upgrade threshold.

## Discovery / HTML tests
9. **TC-SK-09 HTML scaffold anchors**
   - Ensure page contains canonical, analytics include, summary textarea, comparison table body, calculator script, and key input IDs.

10. **TC-SK-10 exact-once discovery wiring**
   - `tools/index.html` contains `skool-fee-calculator` exactly once.
   - `tools/index.md` contains `skool-fee-calculator` exactly once.
   - `_data/tools-list.json` contains `/tools/skool-fee-calculator/` exactly once.
   - `tools/manifest.json` contains the slug exactly once after rebuild.
