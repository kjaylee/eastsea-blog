# Test Cases — Thinkific Fee Calculator

## Pure-calculation tests
1. **TC-TH-01 baseline Basic + third-party scenario**
   - Inputs: Basic monthly, 40 orders, $150 AOV, third-party gateway, default US card processing, 3% refund rate, $300 other monthly cost, $4,000 target net.
   - Expect deterministic gross sales, plan cost, processing fees, extra Thinkific gateway fee, take-home, monthly net profit, break-even orders, and required orders for target net.

2. **TC-TH-02 Basic → Start threshold flips recommendation**
   - Use third-party gateway with monthly gross clearly above the Basic→Start break-even threshold.
   - Expect Start net profit > Basic net profit.

3. **TC-TH-03 below-threshold scenario keeps Basic as winner**
   - Use third-party gateway with monthly gross clearly below the Basic→Start threshold.
   - Expect Basic net profit > Start net profit.

4. **TC-TH-04 Start → Grow threshold is respected**
   - Use high enough gross sales for Grow’s lower extra gateway fee to overcome its higher plan cost.
   - Expect Grow net profit > Start net profit once the threshold is crossed.

5. **TC-TH-05 Thinkific Payments removes extra gateway fee**
   - Same sales inputs as a third-party scenario, but switch `paymentSetup` to `thinkific-payments`.
   - Expect `thirdPartyGatewayFee = 0` and threshold outputs = `null`.

6. **TC-TH-06 partial $1M cap crossing**
   - Inputs: third-party gateway, `yearToDateThirdPartySales = 998000`, current-month gross = `10000`.
   - Expect only `2000` of current-month gross to incur the extra Thinkific gateway fee.

7. **TC-TH-07 already above cap**
   - Inputs: third-party gateway, `yearToDateThirdPartySales >= 1000000`.
   - Expect `thirdPartyGatewayFee = 0` for the current month.

8. **TC-TH-08 subscription surcharge applies only on Thinkific Payments**
   - Turn on `isSubscriptionOrPaymentPlan`.
   - Expect `+0.7%` surcharge only when `paymentSetup = thinkific-payments`.

9. **TC-TH-09 sales-tax solution fee toggle adds 0.5%**
   - Turn on `applySalesTaxVatSolutionFee`.
   - Expect effective processing rate to increase by `0.5%`.

10. **TC-TH-10 annual billing lowers fixed-plan drag**
    - Compare same plan under `monthly` vs `annual` billing.
    - Expect annual monthly-equivalent plan cost to be lower.

11. **TC-TH-11 contribution guard returns null on impossible economics**
    - Use extreme refund + fee assumptions that make contribution per order `<= 0`.
    - Expect `breakEvenOrders` and `requiredOrdersForTargetNet` to be `null`.

12. **TC-TH-12 validation rejects invalid inputs**
    - Reject negative AOV, zero orders, non-integer orders, invalid plan tier, invalid payment setup, negative YTD sales, refund rate >= 100, and negative fixed costs.

13. **TC-TH-13 summary text is decision-ready**
    - Summary must include plan tier, billing mode, gross sales, payment setup, processing assumptions, extra Thinkific gateway fee, monthly net profit, and threshold/cap insight.

## HTML / discovery tests
14. **TC-TH-14 HTML scaffold anchors**
    - Confirm canonical, analytics include, summary textarea, comparison table body, calculator script include, and key input IDs are present.

15. **TC-TH-15 exact-once discovery wiring**
    - `tools/index.html` contains `thinkific-fee-calculator` exactly once.
    - `tools/index.md` contains `thinkific-fee-calculator` exactly once.
    - `_data/tools-list.json` contains `/tools/thinkific-fee-calculator/` exactly once.
    - `tools/manifest.json` contains `thinkific-fee-calculator` exactly once after rebuild.

16. **TC-TH-16 related-link cluster coherence**
    - Related links should point to adjacent live tools such as `teachable-fee-calculator`, `kajabi-fee-calculator`, `stan-store-fee-calculator`, or `skool-fee-calculator`.
    - Prevent dead links or links to unshipped slugs.
