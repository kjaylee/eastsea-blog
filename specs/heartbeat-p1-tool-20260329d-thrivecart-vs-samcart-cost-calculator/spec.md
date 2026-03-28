# Spec — ThriveCart vs SamCart Cost Calculator

## Objective
Create a static tool at `tools/thrivecart-vs-samcart-cost-calculator/` that helps creators compare a one-time checkout-platform purchase against an ongoing monthly subscription.

## User story
As a creator or digital-product seller evaluating checkout software,
I want to compare ThriveCart and SamCart over my own planning horizon,
so I can see which option leaves me with higher take-home and how much lift a recurring subscription would need to justify itself.

## Inputs
- `monthlyGrossSales` — current baseline monthly gross sales
- `successfulPayments` — successful monthly payments/orders
- `planningMonths` — planning horizon in months
- `refundRatePct` — refund rate
- `processorRatePct` — processor % fee
- `processorFlatFee` — processor flat fee per successful payment
- `otherMonthlyCost` — other operating costs shared by both scenarios
- `targetMonthlyNetProfit` — monthly target net profit
- `thrivecartUpfrontFee` — editable upfront fee example
- `thrivecartAnnualAddonCost` — optional annual add-on cost for ThriveCart
- `samcartMonthlyFee` — recurring SamCart base monthly fee
- `samcartGrowthSurcharge` — optional extra monthly platform cost for higher-revenue plans
- `samcartRevenueLiftPct` — optional uplift to monthly gross sales under SamCart

## Outputs
### KPI outputs
- winner by cumulative net take-home
- cumulative take-home delta
- break-even month
- required SamCart gross lift to justify recurring platform cost
- ThriveCart required baseline gross for target monthly net
- SamCart required baseline gross for target monthly net

### Detailed scenario outputs
For both ThriveCart and SamCart:
- projected monthly gross sales
- projected monthly successful payments
- monthly refund loss
- monthly processor fees
- total platform cost over horizon
- effective monthly platform cost
- cumulative net after platform cost
- effective platform-cost rate vs cumulative gross
- required baseline gross for target monthly net

## Formula requirements
1. Use a stable contribution-margin model:
   - average payment = `monthlyGrossSales / successfulPayments`
   - flat-fee rate = `processorFlatFee / averagePayment`
   - contribution-margin rate = `1 - refundRate - processorRate - flatFeeRate`
2. ThriveCart cumulative platform cost:
   - `thrivecartUpfrontFee + thrivecartAnnualAddonCost * (planningMonths / 12)`
3. SamCart cumulative platform cost:
   - `(samcartMonthlyFee + samcartGrowthSurcharge) * planningMonths`
4. Scenario gross-sales multiplier:
   - ThriveCart = `1`
   - SamCart = `1 + samcartRevenueLiftPct / 100`
5. Break-even month:
   - earliest month `m` where SamCart cumulative platform cost at `m` is >= ThriveCart cumulative platform cost at `m`
6. Required SamCart monthly gross lift:
   - extra monthly platform cost difference divided by contribution-margin rate

## UX requirements
- Single responsive static page.
- Clear formula note near the top.
- Explicit disclaimer that ThriveCart upfront default is only an editable market example.
- Copy-summary action.
- Reset-defaults action.
- Local persistence via `localStorage`.
- Related-tool links for internal linking.

## SEO requirements
- Unique `<title>` and meta description targeting “ThriveCart vs SamCart Cost Calculator”.
- Canonical URL.
- `WebApplication` schema.
- Visible on-page references to one-time vs monthly model and break-even comparison.

## Test requirements
- Unit tests for:
  - baseline break-even month
  - target-gross calculation
  - required lift calculation
  - invalid input rejection
- Structural test for HTML metadata tokens.
- Exact-once discovery wiring test for:
  - `tools/index.html`
  - `tools/index.md`
  - `_data/tools-list.json`
  - `tools/manifest.json`

## Out of scope
- Reconstructing SamCart’s exact revenue-tier billing ladder.
- Feature comparison scoring.
- Tax/VAT logic.
- Currency conversion.
- Multi-processor mixes.