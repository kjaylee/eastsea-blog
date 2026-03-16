# Bond Yield Calculator - Test Cases (12)

## TC-01: Basic current yield (discount bond)
- Input: faceValue=1000, couponRate=5, currentPrice=950, yearsToMaturity=10, purchasePrice=950, taxRate=15, quantity=10
- Expected: currentYield=5.26, annualCouponPerBond=50, annualCouponIncome=500

## TC-02: YTM approximation (discount bond)
- Same input as TC-01
- Expected: ytmApprox=5.54
- Formula: [50 + (1000-950)/10] / [(1000+950)/2] * 100 = [50+5]/975 * 100 = 5.64... round2 = 5.64
- Correction: [50+5]/975 = 0.05641... * 100 = 5.64

## TC-03: After-tax annual income
- Same input as TC-01
- Expected: afterTaxAnnualIncome = 500 * 0.85 = 425

## TC-04: Capital gain (discount bond)
- Same input as TC-01
- Expected: capitalGainLoss = (1000 - 950) * 10 = 500

## TC-05: Total return
- Same input as TC-01
- Expected: totalCouponIncome = 500 * 10 = 5000, totalReturn = 5000 + 500 = 5500

## TC-06: Annualized return
- Same input as TC-01
- totalInvestment = 950 * 10 = 9500
- Expected: annualizedReturn = (5500/9500)/10 * 100 = 5.79

## TC-07: Premium bond (price > face value)
- Input: faceValue=1000, couponRate=7, currentPrice=1100, yearsToMaturity=5, purchasePrice=1100, taxRate=20, quantity=5
- annualCouponPerBond = 70
- currentYield = 70/1100*100 = 6.36
- ytmApprox = [70 + (1000-1100)/5] / [(1000+1100)/2] * 100 = [70-20]/1050*100 = 4.76
- capitalGainLoss = (1000-1100)*5 = -500

## TC-08: Par bond (price = face value)
- Input: faceValue=1000, couponRate=4, currentPrice=1000, yearsToMaturity=20, purchasePrice=1000, taxRate=0, quantity=1
- currentYield = 4.00, ytmApprox = 4.00, capitalGainLoss = 0

## TC-09: Zero coupon rate
- Input: faceValue=1000, couponRate=0, currentPrice=600, yearsToMaturity=10, purchasePrice=600, taxRate=15, quantity=1
- currentYield=0, annualCouponIncome=0, capitalGainLoss=400

## TC-10: Single bond, high coupon
- Input: faceValue=5000, couponRate=8, currentPrice=4800, yearsToMaturity=15, purchasePrice=4800, taxRate=25, quantity=1
- annualCouponPerBond = 400
- currentYield = 400/4800*100 = 8.33
- afterTaxAnnualIncome = 400*0.75 = 300

## TC-11: Projection year 1 and year 5
- Same as TC-01 base
- Year 1: cumulative = 500, Year 5: cumulative = 2500

## TC-12: Validation errors
- sharePrice <= 0 should throw
- yearsToMaturity = 0 should throw
- taxRate = 60 should throw
