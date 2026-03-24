# Test Cases — Whatnot Seller Fee Calculator

## Reference fixture
Base input:
- salePrice = 50
- commissionPreset = standard
- commissionRatePct = 8
- buyerShipping = 8.20
- buyerTax = 3.50
- itemCost = 18
- sellerShippingSubsidy = 0
- packagingCost = 1.25
- otherCost = 0

## Deterministic cases
1. **TC-WN-01 baseline standard order**
   - commission = 4.00
   - processing fee = 2.09
   - total fees = 6.09
   - payout after fees = 43.91
   - net profit = 24.66
   - net margin ≈ 49.32%
   - break-even sale price ≈ 22.32

2. **TC-WN-02 electronics preset lowers fees**
   - commission preset electronics = 5%
   - total fees lower than standard
   - net profit higher than standard

3. **TC-WN-03 coins-money preset lowers fees further**
   - commission preset coins-money = 4%
   - total fees lower than electronics
   - net profit higher than electronics

4. **TC-WN-04 custom commission overrides preset**
   - custom 10%
   - commission fee must use 10%, not preset default

5. **TC-WN-05 seller shipping subsidy reduces profit**
   - set sellerShippingSubsidy = 5
   - net profit drops by exactly 5
   - max shipping subsidy before loss remains decision-ready

6. **TC-WN-06 invalid inputs fail**
   - salePrice <= 0
   - negative money values
   - unknown preset
   - custom commission >= 100

7. **TC-WN-07 break-even returns null when denominator is impossible**
   - custom commission 98%
   - breakEvenSalePrice = null

8. **TC-WN-08 summary fields present**
   - summary contains sale price, fee total, payout, net profit, break-even

9. **TC-WN-09 discovery exact-once**
   - slug appears exactly once in `tools/index.html`
   - slug appears exactly once in `tools/index.md`
   - manifest contains exactly one entry with correct URL

10. **TC-WN-10 HTML scaffold anchors present**
   - analytics script
   - calculator script
   - lang toggle
   - commission preset input
   - summary textarea
