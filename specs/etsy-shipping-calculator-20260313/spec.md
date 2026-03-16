# Etsy Shipping Calculator - Specification

## Overview
A calculator that estimates shipping costs for Etsy sellers, including dimensional weight calculation, carrier rate estimation, Etsy's 6.5% transaction fee on shipping, and a comparison of charging shipping vs. offering free shipping (absorbed into item price).

## Inputs
| Field | Type | Default | Description |
|-------|------|---------|-------------|
| packageWeight | number | 12 | Actual package weight in oz |
| lengthIn | number | 10 | Package length (inches) |
| widthIn | number | 8 | Package width (inches) |
| heightIn | number | 4 | Package height (inches) |
| carrier | enum | usps-priority | Carrier + service level |
| zone | number | 5 | Shipping zone (1-9) |
| itemPrice | number | 35 | Item sale price |
| quantity | number | 1 | Number of items |

## Carrier Presets (estimated base rates)
| Carrier-Service | DimFactor | Base Rate Logic |
|----------------|-----------|-----------------|
| USPS First Class (< 13oz) | N/A | weight-based tiers |
| USPS Priority Mail | 166 | zone + weight tiers |
| USPS Ground Advantage | 166 | zone + weight tiers |
| UPS Ground | 139 | zone + weight tiers |
| FedEx Ground | 139 | zone + weight tiers |

## Outputs (KPIs)
1. **Billable weight** - max(actual, dimensional)
2. **Estimated shipping cost** - carrier rate estimate
3. **Etsy transaction fee on shipping** - 6.5% of shipping charged
4. **Total shipping expense** - shipping cost + transaction fee
5. **Free shipping impact** - profit reduction if shipping absorbed into price
6. **Suggested shipping price** - shipping cost + Etsy fee markup

## Formulas
- Dimensional weight (USPS) = ceil(L * W * H / 166)
- Dimensional weight (UPS/FedEx) = ceil(L * W * H / 139)
- Billable weight = max(actualWeight, dimensionalWeight)
- Etsy shipping fee = shippingCharged * 0.065
- Total shipping expense = shippingCost + etsyShippingFee
- Free shipping profit impact = -(shippingCost + shippingCost * 0.065)
- Suggested price = shippingCost / (1 - 0.065)

## Bilingual
- Korean and English toggle
- Dark theme matching site design
