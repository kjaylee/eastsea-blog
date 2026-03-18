# Solar Panel ROI Calculator — Spec

## Date: 2026-03-18
## Slug: `solar-panel-roi-calculator`

## Research
- High buyer intent: people considering $15-40K solar installation
- Search terms: "solar panel calculator", "solar ROI calculator", "is solar worth it", "solar payback period"
- Monetizable via solar installer lead-gen affiliates (highest commission category)
- No existing tool in the repo (confirmed: 0 matches across tools/, manifest, catalog)

## Target Users
- Homeowners evaluating solar panel purchase
- Real estate investors assessing property improvements
- Solar installers providing quick estimates to clients

## Inputs
1. **System size (kW)** — default 6 kW
2. **Cost per watt ($)** — default $2.80
3. **Federal tax credit (%)** — default 30% (IRA)
4. **State/local incentive ($)** — default $0
5. **Monthly electricity bill ($)** — default $150
6. **Electricity rate ($/kWh)** — default $0.15
7. **Annual rate increase (%)** — default 3%
8. **Sun hours per day** — default 5 (US avg)
9. **Panel degradation rate (%/year)** — default 0.5%
10. **System lifespan (years)** — default 25
11. **Loan interest rate (%)** — default 0 (cash purchase)
12. **Loan term (years)** — default 0

## Outputs (KPIs)
1. **Total system cost** (before incentives)
2. **Net cost** (after tax credit + incentives)
3. **Year 1 energy production** (kWh)
4. **Year 1 savings** ($)
5. **Simple payback period** (years)
6. **25-year net savings** ($)
7. **ROI** (%)
8. **Monthly loan payment** (if financed)

## Detailed Table
- Year-by-year breakdown: production, savings, cumulative savings, remaining balance

## Quality Checklist
- [ ] Bilingual EN/KO
- [ ] Dark theme matching site design
- [ ] Mobile responsive
- [ ] analytics.js included
- [ ] Copy summary button
- [ ] Reset button
- [ ] Auto-calculate on input change
- [ ] Input validation with error display
- [ ] Year-by-year table
- [ ] Status pill (profitable/not yet profitable)
- [ ] SEO meta tags
- [ ] Node --check passes
- [ ] Unit tests pass (6+ assertions)
