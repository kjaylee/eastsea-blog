# Test Cases: Dropshipping Profit Margin Calculator

## TC1: Default values
- Input: productCost=8, sellingPrice=29.99, shippingCost=3.50, shippingCharged=0, platformFeeRate=2, paymentRate=2.9, paymentFlat=0.30, adCPA=8, returnRate=5, fixedCosts=39, ordersPerMonth=100
- Revenue = 29.99
- Platform fee = 29.99 * 0.02 = 0.5998
- Payment fee = 29.99 * 0.029 + 0.30 = 1.16971
- Net shipping = 3.50 - 0 = 3.50
- Return cost = (8 + 3.50) * 0.05 = 0.575
- Amortized fixed = 39 / 100 = 0.39
- Total cost = 8 + 3.50 + 0.5998 + 1.16971 + 8 + 0.575 + 0.39 = 22.23451
- Net profit/order = 29.99 - 22.23451 = 7.75549
- Net margin = 7.75549 / 29.99 * 100 ≈ 25.86%
- Monthly profit = 7.75549 * 100 = 775.549
- ROAS = 29.99 / 8 ≈ 3.75x

## TC2: Zero ad spend
- adCPA=0, rest default
- Total cost = 8 + 3.50 + 0.5998 + 1.16971 + 0 + 0.575 + 0.39 = 14.23451
- Net profit/order = 29.99 - 14.23451 = 15.75549
- ROAS = N/A or ∞

## TC3: High return rate (30%)
- returnRate=30
- Return cost = 11.50 * 0.30 = 3.45
- Should show warning for high return rate

## TC4: Break-even orders
- When net profit per order is positive, break-even orders = fixedCosts / profitBeforeFixed
- profitBeforeFixed = 29.99 - (8 + 3.50 + 0.5998 + 1.16971 + 8 + 0.575) = 8.14549
- breakEvenOrders = ceil(39 / 8.14549) ≈ 5

## TC5: Negative margin scenario
- sellingPrice=12, productCost=8, adCPA=8
- Should show negative profit with warning styling
