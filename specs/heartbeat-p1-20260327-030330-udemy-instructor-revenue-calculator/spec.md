# Spec

## Slug

`udemy-instructor-revenue-calculator`

## Goal

Ship one static, browser-only calculator that helps Udemy instructors estimate monthly and annual take-home across the main payout channels they actually see in revenue reports.

## Scope

Create:

- `tools/udemy-instructor-revenue-calculator/index.html`
- `tools/udemy-instructor-revenue-calculator/calculator.js`
- `tools/udemy-instructor-revenue-calculator/calculator.test.js`

Update only:

- `_data/tools-list.json`
- `tools/index.html`
- `tools/index.md`
- `tools/manifest.json`

## Inputs

- Instructor-promotion net sales
- Marketplace / organic net sales
- Partner / external-affiliate net sales
- Partner share percentage
- Total monthly subscription revenue
- Subscription instructor-pool percentage
- Your share of subscription minutes
- Other monthly operating cost
- Target monthly take-home

## Outputs

- Monthly take-home
- Annualized take-home
- Total instructor payout
- Channel-by-channel payout breakdown
- Effective blended payout rate
- Share mix by channel
- Required extra instructor-promotion sales to hit target monthly take-home
- Text summary for copy/export

## Formula Rules

- Instructor-promotion payout = instructor-promotion net sales x 97%
- Marketplace payout = marketplace net sales x 37%
- Partner payout = partner net sales x partner share %
- Subscription payout = total subscription revenue x instructor pool % x your minutes share %
- Monthly take-home = total payout - other monthly operating cost
- Annual take-home = monthly take-home x 12
- Required extra instructor-promotion sales for target = max(0, target - current monthly take-home) / 0.97

## Assumptions

- Transactional sales inputs are Net Amount style inputs, meaning taxes/store-fee deductions are already excluded before revenue share.
- Subscription math is scenario-based because instructors usually need to estimate the total subscription base and their consumption share.
- Partner / external-affiliate share is editable because the current public official rate is not clearly surfaced in the same support pages as the 97% / 37% rules.

## UX

- Bilingual EN/KO toggle.
- Fast-scan utility layout consistent with existing calculator pages.
- Clear note that results are estimates, not official Udemy statements.

## Acceptance

- `node --check tools/udemy-instructor-revenue-calculator/calculator.js` passes.
- `node --test tools/udemy-instructor-revenue-calculator/calculator.test.js` passes.
- Discovery files contain the slug exactly once.
- Local HTTP smoke returns 200 if a local server can be started.
