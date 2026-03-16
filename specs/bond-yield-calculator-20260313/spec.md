# Bond Yield Calculator - Specification

## Overview
A self-contained bond yield calculator that computes current yield, approximate yield to maturity (YTM), total return projections, and after-tax income for fixed-income securities.

## Inputs (7 fields)
| Field | Type | Default | Range | Description |
|-------|------|---------|-------|-------------|
| faceValue | number | 1000 | > 0 | Bond par/face value ($) |
| couponRate | number | 5 | 0-30 | Annual coupon rate (%) |
| currentPrice | number | 950 | > 0 | Current market price ($) |
| yearsToMaturity | number | 10 | 1-50 | Years until bond matures |
| purchasePrice | number | 950 | > 0 | Price paid for the bond ($) |
| taxRate | number | 15 | 0-50 | Tax rate on interest income (%) |
| quantity | integer | 10 | 1-10000 | Number of bonds held |

## Outputs (8 KPI cards)
1. **Current Yield** (%) - annualCoupon / currentPrice * 100
2. **YTM Approximation** (%) - [C + (F-P)/N] / [(F+P)/2] * 100
3. **Annual Coupon Income** ($) - faceValue * couponRate/100 * quantity
4. **After-Tax Annual Income** ($) - annualCouponIncome * (1 - taxRate/100)
5. **Total Coupon Income** ($) - annualCouponIncome * yearsToMaturity
6. **Capital Gain/Loss** ($) - (faceValue - purchasePrice) * quantity
7. **Total Return** ($) - totalCouponIncome + capitalGainLoss
8. **Annualized Return** (%) - (totalReturn / totalInvestment) / yearsToMaturity * 100

## Additional Features
- Premium/Discount/Par badge indicator
- Yield comparison bar vs benchmark (10-year Treasury ~4.25%)
- Year-by-year projection table showing cumulative income
- Copy summary button
- Bilingual EN/KO toggle

## Technical
- calculator.js: Node.js module with `module.exports = { calculate, round2 }`
- calculator.test.js: 12 tests using node:test
- index.html: standalone, no CDN, dark theme, responsive
