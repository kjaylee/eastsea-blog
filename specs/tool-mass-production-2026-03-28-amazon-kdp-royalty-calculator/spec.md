# Spec — Amazon KDP Royalty Calculator

## Summary
Build a static calculator at `tools/amazon-kdp-royalty-calculator/` that helps self-publishing authors estimate Amazon KDP royalties for **eBooks** and **paperbacks** using public KDP formulas.

## Users
- Indie authors pricing Kindle eBooks
- Paperback self-publishers checking KDP print margins
- Creator-economy researchers comparing publishing channels

## User stories
1. As an author, I can estimate **35% vs 70% eBook royalties** after VAT and delivery costs.
2. As an author, I can model how much of my sales qualify for 70% territories using an **eligible-sales share** input.
3. As a paperback seller, I can estimate **Amazon marketplace** royalties and **Expanded Distribution** royalties separately.
4. As a user, I can copy a concise summary for pricing notes.
5. As a visitor from search, I can immediately understand the formulas and caveats without reading docs elsewhere.

## Inputs
### Global
- `format`: `ebook | paperback`

### eBook mode
- `ebookMarket`: marketplace preset with currency + delivery cost / MB
- `ebookListPrice`: numeric, same currency as selected market
- `ebookUnitsSold`: monthly units sold
- `ebookRoyaltyPlan`: `35 | 70`
- `ebookFileSizeMb`: numeric MB
- `ebookVatRatePct`: numeric VAT percentage
- `ebookEligibleSalesPct`: percentage of sales in 70%-eligible territories

### Paperback mode
- `paperbackMarket`: marketplace preset with 50%/60% threshold
- `paperbackListPrice`: numeric, same currency as selected market
- `paperbackPrintingCost`: numeric printing cost per copy
- `paperbackAmazonUnits`: units sold on Amazon marketplace
- `paperbackExpandedUnits`: units sold via Expanded Distribution

## Core formulas
### eBook
- `vatAmount = listPrice - (listPrice / (1 + vatRate))`
- `exclusivePrice = listPrice - vatAmount`
- `royalty35PerSale = 0.35 × exclusivePrice`
- `deliveryCost = max(minDeliveryCost, fileSizeMb × deliveryCostPerMb)` (with market-specific rules)
- `royalty70EligiblePerSale = 0.70 × (exclusivePrice - deliveryCost)`
- `blendedRoyaltyPerSale = eligibleShare × royalty70EligiblePerSale + nonEligibleShare × royalty35PerSale` when plan = 70
- `monthlyRoyalty = blendedRoyaltyPerSale × unitsSold`

### Paperback
- `amazonRate = 50% or 60%` depending on marketplace threshold
- `amazonRoyaltyPerSale = (amazonRate × listPrice) - printingCost`
- `expandedRoyaltyPerSale = (0.40 × listPrice) - printingCost`
- `monthlyRoyalty = amazonUnits × amazonRoyaltyPerSale + expandedUnits × expandedRoyaltyPerSale`
- `effectiveBlendedRate = monthlyRoyalty / totalGrossSales`

## Outputs
### eBook KPIs
- Royalty per sale
- Monthly royalty
- Effective royalty rate
- 35% vs 70% monthly delta

### eBook details
- VAT amount
- Exclusive list price
- Delivery cost per sale
- Monthly delivery drag
- 35% royalty per sale
- 70% royalty per eligible sale
- Positive-70%-royalty minimum list price

### Paperback KPIs
- Amazon royalty per sale
- Expanded royalty per sale
- Total monthly royalty
- Effective blended royalty rate

### Paperback details
- Current Amazon royalty band (50% / 60%)
- Amazon royalty rate
- Break-even list price on Amazon
- Break-even list price on Expanded Distribution
- Marketplace threshold to enter 60% band
- Total gross sales / total units

## UX requirements
- Fully static, responsive page.
- SEO metadata: title, description, canonical, OG/Twitter, JSON-LD `WebApplication`.
- Clear note that inputs are estimates and users should verify printing cost / eligibility inside KDP.
- Copy-summary button.
- Inline validation and warnings.
- `aria-live="polite"` results region.

## Validation rules
- Numeric inputs must be finite and non-negative.
- Percentages must stay in `[0, 100]`.
- Units sold must be integers `>= 0`.
- 70%-plan list prices outside a common public baseline range (e.g. US $2.99–$9.99) should show a **warning**, not block calculation.

## File plan
- `tools/amazon-kdp-royalty-calculator/index.html`
- `tools/amazon-kdp-royalty-calculator/logic.mjs`
- `tools/amazon-kdp-royalty-calculator/app.mjs`
- `tests/unit/amazon-kdp-royalty-calculator.test.mjs`
- `tools/index.html`
- `tools/index.md`
- `_data/tools-list.json`
- `tools/manifest.json` (generated)

## Acceptance criteria
1. Tool exists and renders at `/tools/amazon-kdp-royalty-calculator/`.
2. eBook formulas match official 35% / 70% public math with delivery-cost deduction.
3. Paperback formulas match official 50% / 60% / 40% public math.
4. Catalog wiring exists exactly once in `tools/index.html`, `tools/index.md`, `_data/tools-list.json`, and `tools/manifest.json`.
5. Deterministic unit tests pass.
6. Local HTTP verification proves the page loads and exposes expected KDP language.
