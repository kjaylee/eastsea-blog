# Test Cases — GOAT Fee Calculator

These are future implementation tests only. This task does not create code.

## Pure-calculation tests
1. **TC-GOAT-01 baseline preset computes payout**
   - Inputs: valid sale price, baseline GOAT preset, non-zero item cost, shipping, packaging.
   - Expect platform fee, payout before seller costs, and net profit to compute deterministically.

2. **TC-GOAT-02 higher sale price increases payout**
   - Hold fee rates and seller costs constant, raise sale price.
   - Expect platform fee amount to rise and net profit to rise.

3. **TC-GOAT-03 higher seller costs reduce net**
   - Hold sale price constant, increase seller shipping or packaging cost.
   - Expect lower net profit and higher break-even price.

4. **TC-GOAT-04 custom lower fee rate improves take-home**
   - Compare baseline preset vs lower custom fee rate with all else equal.
   - Expect lower platform fee and higher net profit under the custom scenario.

5. **TC-GOAT-05 refund-loss input reduces payout**
   - Add non-zero refund / return loss rate.
   - Expect payout before seller costs and net profit to decline.

6. **TC-GOAT-06 reverse solver returns null on invalid margin**
   - Use fee rate + refund loss rate that makes `contributionMargin <= 0`.
   - Expect `breakEvenListingPrice` and `requiredListingPriceForTargetNet` to return `null`.

7. **TC-GOAT-07 validation rejects invalid inputs**
   - Negative price, negative cost, unknown preset, and malformed percentages.
   - Expect validation errors instead of silent math.

8. **TC-GOAT-08 summary contains decision-ready lines**
   - Summary should include sale price, platform fees, seller costs, net profit, and break-even price.

## UI/content tests
9. **TC-GOAT-09 page contains required assumption copy**
   - HTML should include canonical, analytics include, visible baseline-assumption note, disclaimer, summary output, and related-links section.

10. **TC-GOAT-10 adjacent links favor existing resale tools**
    - Related links should reference live adjacent tools such as `stockx-fee-profit-calculator`, `grailed-fee-profit-calculator`, `mercari-fee-calculator`, and `whatnot-seller-fee-calculator`.

## Discovery tests for the future ship task
11. **TC-GOAT-11 exact-once discovery wiring**
    - After implementation, `tools/index.html` should contain `goat-fee-calculator` exactly once.
    - `tools/index.md` should contain `goat-fee-calculator` exactly once.
    - `_data/tools-list.json` should contain `/tools/goat-fee-calculator/` exactly once.
    - `tools/manifest.json` should contain `goat-fee-calculator` exactly once after rebuild.

12. **TC-GOAT-12 docs-only task left discovery untouched**
    - For this task specifically, discovery counts for `goat-fee-calculator` should remain `0` because no implementation shipped.
