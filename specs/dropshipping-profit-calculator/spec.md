# Spec: Dropshipping Profit Margin Calculator

## Tool ID
`dropshipping-profit-margin-calculator`

## Structure
- `tools/dropshipping-profit-margin-calculator/index.html` — full page
- `tools/dropshipping-profit-margin-calculator/calculator.js` — logic + i18n

## Inputs
| Field | ID | Default | Type |
|---|---|---|---|
| Product cost (supplier) | productCost | 8 | number |
| Selling price | sellingPrice | 29.99 | number |
| Shipping to customer | shippingCost | 3.50 | number |
| Shipping charged to buyer | shippingCharged | 0 | number |
| Platform fee % | platformFeeRate | 2 | number |
| Payment processing % | paymentRate | 2.9 | number |
| Payment flat fee | paymentFlat | 0.30 | number |
| Ad spend per order (CPA) | adCPA | 8 | number |
| Return rate % | returnRate | 5 | number |
| Monthly fixed costs | fixedCosts | 39 | number |
| Orders per month | ordersPerMonth | 100 | number |

## KPIs (6 boxes)
1. Net Profit / Order
2. Net Margin %
3. Monthly Net Profit
4. Break-even Orders/Month
5. Break-even Selling Price
6. ROAS (ad spend efficiency)

## Detail Table
- Gross revenue per order
- Platform fee
- Payment processing fee
- Product cost
- Shipping cost (net of buyer charge)
- Ad CPA
- Return cost per order
- Amortized fixed cost / order
- Total cost per order
- Effective fee rate

## Features
- KO/EN toggle
- Copy summary
- Reset defaults
- Auto-calculate on input change
- Mobile responsive
