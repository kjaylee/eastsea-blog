# Test Cases — p1-monetization-tools-trio-20260219-1100

## A. Common UI/UX
1. **Responsive layout**
   - Given viewport 390x844
   - When page loads
   - Then input/output sections should stack in 1 column

2. **Language toggle**
   - Given default KO
   - When user clicks EN
   - Then headings/labels/buttons/status text switch to English

3. **Copy summary**
   - Given valid computed result
   - When user clicks Copy Summary
   - Then summary textarea content is copied (or fallback alert displayed)

4. **Portal link rule**
   - Verify top navigation anchor uses `href="/"`

## B. SaaS Proration Revenue Leakage Calculator
1. **Valid calculation path**
   - Input: active=2400, upgrade=6%, days=14, oldMRR=59000, currentCredit=100%, targetCredit=40%, utilization=35%, cost=22000000
   - Expect: monthly upgrades > 0, current leakage > target leakage, recovered annual > 0

2. **Validation rule**
   - Input target credit > current credit
   - Expect validation error message and no KPI output

3. **Break-even policy**
   - With annual cost > 0
   - Expect break-even target credit policy (%) rendered numeric or N/A

## C. E-commerce Coupon Stack Margin Guardrail Calculator
1. **Leakage detection**
   - Input stack share and extra stack discount > 0
   - Expect monthly stack leakage > 0

2. **Guardrail effect**
   - Increase effectiveness from 20% to 60%
   - Expect monthly recovered profit increases proportionally

3. **Boundary case**
   - Set stacked share=0
   - Expect leakage=0, recovered=0

## D. Fintech Interchange vs Reward Spend Calculator
1. **Contribution sign test**
   - Conservative reward rate
   - Expect monthly contribution positive

2. **Aggressive reward rate**
   - Increase reward rate greatly
   - Expect contribution decreases, can become negative

3. **Break-even reward rate formula**
   - Verify break-even reward rate shown when redemptionRate > 0

## E. Integration
1. `tools/index.html` contains 3 new cards with correct href paths
2. `tools/manifest.json` includes 3 new objects with slug/url/size
3. `_data/tools-list.json` includes 3 new entries
4. Local `curl` returns HTTP 200 for all three tool URLs
5. Live `curl` returns HTTP 200 for all three tool URLs