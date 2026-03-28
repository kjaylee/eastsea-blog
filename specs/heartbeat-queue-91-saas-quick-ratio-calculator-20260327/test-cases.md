# Test Cases — SaaS Quick Ratio Calculator

## Pure-calculation tests
1. **TC-SQR-01 healthy baseline ratio**
   - Inputs: `newMrr = 40000`, `expansionMrr = 20000`, `churnedMrr = 10000`, `contractionMrr = 5000`, `targetQuickRatio = 4`
   - Expect:
     - `grossMrrGain = 60000`
     - `grossMrrLoss = 15000`
     - `netNewMrr = 45000`
     - `quickRatio = 4`
     - health band = `Healthy`
     - `additionalGainNeeded = 0`

2. **TC-SQR-02 weak ratio below one**
   - Inputs where loss exceeds gain, for example `newMrr = 8000`, `expansionMrr = 2000`, `churnedMrr = 9000`, `contractionMrr = 4000`
   - Expect:
     - `quickRatio < 1`
     - health band = `Shrinking`
     - positive `additionalGainNeeded`
     - positive `lossReductionNeeded`

3. **TC-SQR-03 mid-band ratio**
   - Inputs that produce `1 <= quickRatio < 4`
   - Expect health band = `Needs improvement`

4. **TC-SQR-04 zero-loss period returns Infinity**
   - Inputs: positive gain, zero churned MRR, zero contraction MRR
   - Expect:
     - `quickRatio = Infinity`
     - note = `No MRR loss in the period`
     - `lossReductionNeeded = 0`

5. **TC-SQR-05 zero-activity period returns null**
   - Inputs: all four MRR inputs = `0`
   - Expect:
     - `quickRatio = null`
     - note = `No activity in the period`
     - health band = `Insufficient activity`

6. **TC-SQR-06 target-gap math**
   - Use a ratio below the selected target.
   - Expect:
     - `requiredGainAtCurrentLoss = targetQuickRatio * grossMrrLoss`
     - `additionalGainNeeded` matches the difference
     - `maxAllowableLossAtCurrentGain` is computed correctly

7. **TC-SQR-07 validation rejects invalid inputs**
   - Negative MRR inputs
   - Zero or negative `targetQuickRatio`
   - Non-numeric values

8. **TC-SQR-08 summary text includes decision-ready details**
   - Summary must include:
     - quick ratio
     - health band
     - gross MRR gain
     - gross MRR loss
     - net new MRR
     - target ratio

## HTML and discovery tests for future implementation
9. **TC-SQR-09 HTML scaffold anchors**
   - Page contains canonical tag, analytics include, summary output, calculator script include, and key input IDs for the five required inputs.

10. **TC-SQR-10 exact-once discovery wiring**
   - `tools/index.html` contains `saas-quick-ratio-calculator` exactly once.
   - `tools/index.md` contains `saas-quick-ratio-calculator` exactly once.
   - `_data/tools-list.json` contains `/tools/saas-quick-ratio-calculator/` exactly once.
   - `tools/manifest.json` contains the slug exactly once after rebuild.

11. **TC-SQR-11 related-link sanity**
   - Related links point only to existing adjacent SaaS tool pages and avoid broken internal links.

12. **TC-SQR-12 FAQ clarity**
   - FAQ explicitly distinguishes SaaS quick ratio from the accounting liquidity quick ratio.
