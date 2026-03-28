# Spec — Contribution Margin Calculator

## Outcome
Add a new production-grade calculator at `tools/contribution-margin-calculator/` that helps operators, founders, and finance-minded marketers estimate unit contribution and sales volume thresholds.

## Primary user jobs
- determine how much each unit contributes toward covering fixed costs
- check whether current unit economics can ever break even
- calculate units required to break even
- calculate units required to hit a target profit
- copy a clean summary into docs, email, or planning sheets

## Inputs
- selling price per unit
- variable cost per unit
- fixed costs
- target profit (optional, defaults to 0)
- language toggle or bilingual copy support in-page

## Outputs
- contribution margin dollars per unit
- contribution margin ratio
- break-even units
- target-profit units
- break-even revenue
- target-profit revenue
- status/explanation message
- copyable result summary

## Content sections
- hero with concise value proposition
- inputs panel
- KPI result panel
- formula block
- interpretation/details section
- worked examples section
- summary textarea with copy button

## Validation rules
- selling price per unit must be greater than 0
- variable cost per unit must be 0 or greater
- fixed costs must be 0 or greater
- target profit must be 0 or greater
- if contribution margin per unit is `<= 0`, ratio can still be shown but break-even and target-profit units/revenue must show as not achievable with explanatory copy

## Non-functional requirements
- static HTML/CSS/JS only
- no external dependencies
- mobile-friendly layout
- exact deterministic math in `calculator.js`
- at least one deterministic automated test using existing repo pattern
- include repo-standard analytics snippet
- update local discovery/catalog surfaces needed for exact-once discoverability

## SEO/content requirements
- title and description aligned to contribution margin search intent
- canonical, Open Graph, Twitter, and JSON-LD where practical
- tool title should be parseable by the manifest builder

## Acceptance criteria
- new page exists at `/tools/contribution-margin-calculator/`
- page calculates all required metrics correctly
- page contains formulas, examples, explanations, and copy summary
- `calculator.test.js` passes
- `tools/manifest.json` includes the new slug after rebuild
- `_data/tools-list.json`, `tools/index.html`, and `tools/index.md` include the slug exactly once
