# Test Cases — Limited-time Offer Profit Calculator

## Case 1: Positive lift, quick payback
Inputs:
- Sessions: 1000
- Baseline conv: 2%
- Target conv: 3%
- AOV: $50
- Gross margin: 60%
- Discount: 10%
- Offer share: 50%
- Extra fulfillment cost: $1
- Monthly promo cost: $200
- Setup cost: $0
- Months: 1

Expected (approx):
- Baseline orders: 20
- Target orders: 30
- Target net monthly: $610
- Baseline net monthly: $600
- Monthly net lift: ~$10
- Period net benefit: ~$10
- ROI: ~4.65%
- Break-even target conv: ~2.96%

## Case 2: Negative economics
Inputs:
- Sessions: 5000
- Baseline conv: 3%
- Target conv: 3.2%
- AOV: $30
- Gross margin: 40%
- Discount: 25%
- Offer share: 70%
- Extra fulfillment cost: $0.8
- Monthly promo cost: $2000
- Setup cost: $5000
- Months: 3

Expected (approx):
- Target net monthly: ~$-1009.6
- Monthly net lift: ~$-2809.6
- Period net benefit: ~$-13428.8
- ROI: ~-119%
- Payback: No payback
