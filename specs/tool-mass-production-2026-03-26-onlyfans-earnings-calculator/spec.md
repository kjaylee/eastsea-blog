# Spec — OnlyFans Earnings Calculator

## Product
- **Slug:** `onlyfans-earnings-calculator`
- **URL:** `/tools/onlyfans-earnings-calculator/`
- **Title:** `OnlyFans Earnings Calculator | OnlyFans 실수령액 계산기`

## User problem
Creators want to know how much they actually keep from OnlyFans after the platform cut, refunds/chargebacks, payout timing drag, and their own promo / operating spend.

## Target query intent
- onlyfans earnings calculator
- onlyfans fee calculator
- how much does onlyfans take
- onlyfans 20% fee calculator
- onlyfans payout calculator

## Core promise
Enter your current subscriber and revenue mix, then instantly see:
1. gross monthly revenue,
2. OnlyFans fee drag,
3. take-home before ops,
4. true monthly net after promo / other costs,
5. subscriber target needed to reach your income goal.

## Inputs
1. Active subscribers (integer, >= 0)
2. Subscription price (USD, >= 0)
3. Monthly tips revenue (USD, >= 0)
4. Monthly PPV / message revenue (USD, >= 0)
5. Monthly custom / other revenue (USD, >= 0)
6. Refund / chargeback rate % (0 to <100)
7. Payout delay days (0 to 365)
8. Annual cash-cost rate % (0 to 100)
9. Monthly promo cost (USD, >= 0)
10. Other monthly operating cost (USD, >= 0)
11. Target monthly net income (USD, >= 0)

## Fixed v1 assumptions
- OnlyFans platform fee = **20% of fan payments**.
- Tool models public baseline only.
- Taxes, banking withdrawal fees, and agency splits are **not** modeled in v1.
- Payout drag is estimated as a working-capital cost, not a platform fee.

## Calculations
- `subscriptionRevenue = activeSubscribers * subscriptionPrice`
- `grossRevenue = subscriptionRevenue + tips + ppv + custom`
- `platformFee = grossRevenue * 20%`
- `refundLoss = grossRevenue * refundRate`
- `proceedsBeforeDrag = grossRevenue - platformFee - refundLoss`
- `payoutDrag = proceedsBeforeDrag * annualCashCostRate * payoutDelayDays / 365`
- `takeHomeBeforeOps = proceedsBeforeDrag - payoutDrag`
- `netIncome = takeHomeBeforeOps - promoCost - otherCost`
- `grossPerSubscriber = grossRevenue / activeSubscribers` when subscribers > 0
- `takeHomePerSubscriberBeforeOps = takeHomeBeforeOps / activeSubscribers` when subscribers > 0
- `requiredSubscribersForTarget = ceil((targetMonthlyNet + promoCost + otherCost) / takeHomePerSubscriberBeforeOps)` when per-subscriber contribution > 0
- `breakEvenSubscribers = ceil((promoCost + otherCost) / takeHomePerSubscriberBeforeOps)` when per-subscriber contribution > 0
- `requiredSubscriptionPriceAtCurrentSubs` assumes current non-subscription revenue stays fixed and solves for subscription price needed to hit target net.

## Outputs
### KPI cards
- Gross monthly revenue
- Take-home before ops
- Net monthly income
- Effective net keep rate

### Detail cards
- Subscription revenue
- Ancillary revenue (tips + PPV/messages + custom/other)
- OnlyFans platform fee
- Refund / chargeback loss
- Payout drag cost
- Promo cost
- Other operating cost
- Annualized net income
- Gross ARPU
- Take-home per subscriber before ops
- Required subscribers for target net
- Break-even subscribers
- Required subscription price at current subscriber count

### Summary block
- Copy-ready English/Korean summary with the most decision-useful numbers.

## UX requirements
- Single-page static HTML.
- Mobile-responsive.
- Bilingual toggle (EN/KR).
- Immediate recalculation on input changes.
- Clear disclaimer around assumptions and out-of-scope items.
- Related links to adjacent creator tools.

## File outputs required
- `tools/onlyfans-earnings-calculator/index.html`
- `tools/onlyfans-earnings-calculator/calculator.js`
- `tools/onlyfans-earnings-calculator/calculator.test.js`
- `tools/manifest.json` update
- `_data/tools-list.json` update
- `tools/index.html` update
- `tools/index.md` update

## Acceptance criteria
- Tool renders cleanly via local HTTP server.
- Pure calculator module exports testable functions.
- Unit tests cover baseline, validation, target subscriber math, and exact-once catalog wiring.
- Manifest integrity test passes after wiring updates.
- Page includes title, meta description, canonical, OG/Twitter tags, JSON-LD, and analytics script.
