# Etsy Shipping Calculator - Test Cases

## TC-01: USPS Priority Mail baseline (Zone 5, 12 oz)
- Input: weight=12oz, dims=10x8x4, carrier=usps-priority, zone=5, itemPrice=35, qty=1
- Dimensional weight = ceil(320/166) = 2 oz (actual 12 oz wins)
- Expected: billableWeightOz=12, estimatedShippingCost=9.45, etsyShippingFee=0.61, totalShippingExpense=10.06

## TC-02: Dimensional weight exceeds actual weight
- Input: weight=8oz, dims=18x14x12, carrier=usps-priority, zone=5
- Dimensional weight = ceil(3024/166) = ceil(18.22) = 19 oz => 2 lbs
- Expected: billableWeightOz=19, dimWeight used

## TC-03: USPS First Class light package
- Input: weight=4oz, dims=6x4x2, carrier=usps-first-class, zone=3
- Expected: uses first-class rates, billableWeightOz=4

## TC-04: UPS Ground uses 139 dim factor
- Input: weight=16oz, dims=12x10x8, carrier=ups-ground, zone=5
- Dimensional weight = ceil(960/139) = ceil(6.91) = 7 oz => actual 16 wins
- Expected: billableWeightOz=16

## TC-05: FedEx Ground dimensional weight dominates
- Input: weight=8oz, dims=20x16x12, carrier=fedex-ground, zone=4
- Dimensional weight = ceil(3840/139) = ceil(27.63) = 28 oz
- Expected: billableWeightOz=28

## TC-06: Etsy 6.5% transaction fee on shipping
- Input: shippingCharged=10.00
- Expected: etsyShippingFee = 0.65

## TC-07: Free shipping comparison
- Input: itemPrice=35, shippingCost=9.45
- Expected: freeShippingProfitImpact = -(9.45 + 9.45*0.065) = -10.06

## TC-08: Suggested shipping price includes fee markup
- Input: shippingCost=9.45
- Expected: suggestedShippingPrice = 9.45 / (1 - 0.065) = 10.11

## TC-09: Multi-quantity order
- Input: qty=3, weight=12oz per item
- Expected: totalWeight = 36oz, shipping scales

## TC-10: Validation rejects invalid inputs
- weight=0, weight=-1, zone=0, zone=10, dims with 0
- Expected: error messages returned

## TC-11: Zone 1 (local) vs Zone 9 (cross-country) rate difference
- Same package, zone=1 vs zone=9
- Expected: zone 9 costs more

## TC-12: Summary contains required fields
- Expected: summary text includes all key metrics
