# Spec — SaaS Magic Number Calculator

## Summary
Future implementation should add a static tool at `tools/saas-magic-number-calculator/` that helps SaaS operators estimate sales-efficiency using quarter-over-quarter recurring revenue change and prior-quarter sales and marketing spend.

This queue task is docs-only. No implementation is part of this artifact set.

## Product goal
Answer the exact-match search intent behind `saas magic number calculator` with a page that is:
- easy to use in under a minute,
- explicit about assumptions,
- useful for budgeting and planning,
- and clearly distinct from existing EastSea SaaS metrics tools.

## Users
1. As a SaaS operator, I want to enter quarter-over-quarter recurring revenue and prior-quarter S&M spend so I can compute the magic number immediately.
2. As a finance lead, I want a target magic number input so I can see the revenue or spend gap to reach a better efficiency threshold.
3. As a founder, I want a quick interpretation band so I can tell whether current acquisition efficiency is weak, acceptable, or strong.
4. As an SEO visitor, I want the page to stay tightly scoped to the exact metric instead of turning into a generic dashboard.

## Scope
### In scope
- Single static page at `tools/saas-magic-number-calculator/index.html`
- Client-side calculator logic
- One exact-match SEO target: `saas magic number calculator`
- Clear formula explanation
- Planning outputs based on a target magic number
- Copyable summary text

### Out of scope
- Full SaaS KPI dashboard
- Gross-margin-adjusted variant in v1
- Multi-quarter cohort forecasting
- Forecasting pipeline or CAC blends
- Geographic benchmark data
- Discovery/catalog edits in this docs-only task

## Inputs
Required numeric inputs:
- `previousQuarterRecurringRevenue`
  - currency
  - minimum `0`
- `currentQuarterRecurringRevenue`
  - currency
  - minimum `0`
- `previousQuarterSalesMarketingSpend`
  - currency
  - must be `> 0`
- `targetMagicNumber`
  - decimal
  - minimum `0`
  - default `0.75`

Optional UX helper:
- `currencyCode`
  - selector or formatting preference only
  - does not affect math

## Formula
Use a narrow quarter-based definition for v1:

```text
recurringRevenueDelta = currentQuarterRecurringRevenue - previousQuarterRecurringRevenue
annualizedRecurringRevenueAdded = recurringRevenueDelta * 4
magicNumber = annualizedRecurringRevenueAdded / previousQuarterSalesMarketingSpend
```

Planning outputs:

```text
requiredAnnualizedRevenueAddedForTarget = targetMagicNumber * previousQuarterSalesMarketingSpend
requiredQuarterlyRevenueDeltaForTarget = requiredAnnualizedRevenueAddedForTarget / 4
requiredCurrentQuarterRecurringRevenue = previousQuarterRecurringRevenue + requiredQuarterlyRevenueDeltaForTarget
maxSalesMarketingSpendAtTarget = annualizedRecurringRevenueAdded / targetMagicNumber
```

Behavior notes:
- Allow negative `recurringRevenueDelta`; this should produce a negative magic number and a warning state.
- If `targetMagicNumber = 0`, set target-gap outputs to `0` or current-state equivalents and explain that zero is not an operational planning benchmark.
- If `previousQuarterSalesMarketingSpend <= 0`, block calculation and show validation feedback.

## Outputs
Primary KPIs:
- current magic number
- recurring revenue delta
- annualized recurring revenue added
- ARR created per `$1` of prior-quarter S&M spend
- efficiency band

Planning outputs:
- selected target magic number
- required current-quarter recurring revenue to hit target
- additional recurring revenue needed this quarter to hit target
- maximum prior-quarter S&M spend allowed at current revenue delta while still hitting target
- gap between current magic number and target magic number

Supporting outputs:
- plain-language interpretation sentence
- copyable summary block

## Interpretation bands
Use simple, explicit v1 bands:
- `< 0`: contraction
- `0` to `< 0.5`: weak efficiency
- `0.5` to `< 0.75`: below target
- `0.75` to `< 1.0`: acceptable
- `>= 1.0`: strong

These are product interpretation bands, not universal finance truth. Copy should say they are directional.

## Validation rules
- All currency inputs must be finite numbers.
- `previousQuarterRecurringRevenue >= 0`
- `currentQuarterRecurringRevenue >= 0`
- `previousQuarterSalesMarketingSpend > 0`
- `targetMagicNumber >= 0`
- Display currency consistently across all money outputs.

## UX/content requirements
- H1: `SaaS Magic Number Calculator`
- Above-the-fold section should include:
  - short definition
  - the three core inputs
  - target input
  - KPI row
- One short explainer should clarify:
  - this is a SaaS sales-efficiency metric
  - the page uses quarter-over-quarter recurring revenue change
  - the delta is annualized by multiplying by `4`
- Include a short FAQ:
  - What is a SaaS magic number?
  - How should I interpret the result?
  - Why can the number be negative?

## SEO requirements
- Canonical URL should be `/tools/saas-magic-number-calculator/`
- Title should lead with exact match:
  - `SaaS Magic Number Calculator | EastSea`
- Meta description should mention:
  - quarter-over-quarter recurring revenue
  - prior-quarter sales and marketing spend
  - target gap planning
- Body copy should avoid generic `magic number calculator` phrasing without the `SaaS` qualifier

## Future file targets
If implemented later, likely files are:
- `tools/saas-magic-number-calculator/index.html`
- `tools/saas-magic-number-calculator/calculator.js`
- `tools/saas-magic-number-calculator/calculator.test.js`

Discovery files likely touched later:
- `tools/index.html`
- `tools/index.md`
- `_data/tools-list.json`
- `tools/manifest.json`

## Non-goals and guardrails
- Do not expand v1 into Rule of 40, quick ratio, CAC payback, or burn multiple.
- Do not support multiple formula variants in the initial release.
- Do not imply authoritative benchmark data beyond the simple directional interpretation bands above.
- Do not mix quarter-based recurring revenue inputs with trailing-twelve-month metrics on the same screen.

## Acceptance criteria for a future build
1. A user can enter the three required values and get a deterministic result instantly.
2. The page explains the metric clearly enough to prevent input-basis confusion.
3. Negative or deteriorating revenue cases remain calculable and are labeled clearly.
4. The target-planning outputs help a user decide whether revenue must increase or spend must decrease.
5. The page stays narrowly focused on the exact-match intent rather than becoming a generic SaaS metrics hub.
