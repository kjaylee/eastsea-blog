# Spec — affiliate-cookie-window-roi-calculator

## Product intent
Quantify whether extending affiliate attribution cookie window increases profit after commission, network fees, refunds, and program costs.

## Inputs
- Monthly affiliate clicks
- Current attributed CVR (%), Target attributed CVR (%)
- AOV, Gross margin (%), Commission rate (%), Network fee rate (%), Refund/cancel rate (%)
- Monthly program cost, One-time setup cost, Analysis months

## Core equations
- `currentOrders = clicks * currentCvr`
- `targetOrders = clicks * targetCvr`
- `incrementalOrders = targetOrders - currentOrders`
- `netSalesPerOrder = AOV * (1 - refundRate)`
- `contributionPerOrder = netSalesPerOrder * (grossMargin - commissionRate - networkFeeRate)`
- `incrementalContribution = incrementalOrders * contributionPerOrder`
- `monthlyNet = incrementalContribution - monthlyCost`
- `periodNet = monthlyNet * months - setupCost`
- `ROI = periodNet / (monthlyCost * months + setupCost)`
- Break-even target CVR and payback months from monthly economics.

## UX requirements
- Concise copy, mobile-friendly (single-column on narrow screens).
- Live recalculation on input.
- Summary copy button for planning docs.
- KO/EN label toggle.
