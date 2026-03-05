# Test Cases

1. **Default scenario renders KPIs**
   - Load the page with defaults.
   - Expect: KPI fields show numeric values (not '-') and status pill shows profitable/unprofitable.

2. **Invalid rate > 100 triggers error**
   - Set refundRate to 120.
   - Expect: error message visible; KPIs reset to '-'.

3. **Negative uplift handled**
   - Set targetAttachRate below currentAttachRate.
   - Expect: incremental contracts = 0; net profit equals -monthlyFixedCost; break-even target attach rate >= current.

4. **Contribution per contract <= 0**
   - Set claimRate high (e.g., 90%) and paymentFeeRate high (10%).
   - Expect: break-even target attach rate shows N/A.
