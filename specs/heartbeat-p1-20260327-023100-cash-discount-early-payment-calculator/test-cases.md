# Test Cases — cash-discount-early-payment-calculator

1. `TC-CD-01 baseline positive ROI`
   - Use defaults.
   - Expect positive monthly net impact, positive period net impact, finite ROI, finite payback, and a sub-100 break-even adoption rate.

2. `TC-CD-02 zero adoption collapses variable costs and benefits`
   - Set projected adoption to `0`.
   - Expect adopted volume, discount cost, processing fees, financing benefit, and bad-debt savings to be `0`.

3. `TC-CD-03 higher discount worsens economics`
   - Compare baseline vs higher discount rate.
   - Expect monthly net impact and ROI to decrease.

4. `TC-CD-04 shorter early-pay terms improve financing benefit`
   - Reduce early-pay terms while keeping other assumptions constant.
   - Expect financing benefit to increase.

5. `TC-CD-05 impossible break-even state`
   - Force contribution per adopted dollar to be non-positive with very high discount and processing costs.
   - Expect break-even adoption to be unavailable and payback to be unavailable or negative economics.

6. `TC-CD-06 validation guards`
   - Reject:
     - monthly invoice volume `<= 0`
     - average invoice amount `<= 0`
     - early-pay terms `>=` current terms
     - percentages outside supported ranges
     - negative money values

7. `TC-CD-07 summary text`
   - Summary includes eligible volume, adopted volume, monthly net impact, period net impact, ROI, payback, and break-even adoption.

8. `TC-CD-08 HTML scaffold`
   - HTML includes required input ids, summary textarea, language toggle, analytics include, and `calculator.js`.

9. `TC-CD-09 discovery exact-once`
   - Slug/url appears exactly once in `tools/index.html`, `tools/index.md`, `_data/tools-list.json`, and `tools/manifest.json`.

