# Tasks — P1 Monetization Tools Trio (20260219-0946)

## 0. Preconditions
- [x] Existing tool inventory checked via `tools/manifest.json`
- [x] 3 non-duplicate slugs selected

## 1. SDD/TDD Documents
- [x] `spec.md` 작성
- [x] `plan.md` 작성
- [x] `test-cases.md` 작성
- [x] `tasks.md` 작성

## 2. Implementation — Tool Pages
- [x] Build `tools/saas-expansion-mrr-waterfall-calculator/index.html`
  - [x] bilingual heading/subtitle
  - [x] validation + compute + KPI + summary copy
  - [x] `href="/"` portal link
- [x] Build `tools/ecommerce-contribution-margin-stack-calculator/index.html`
  - [x] bilingual heading/subtitle
  - [x] margin stack formula implementation
  - [x] `href="/"` portal link
- [x] Build `tools/revenue-based-financing-cost-calculator/index.html`
  - [x] amortized repayment simulation + IRR approximation
  - [x] table preview + summary
  - [x] `href="/"` portal link

## 3. Integration Updates
- [x] Add 3 cards to `tools/index.html`
- [x] Add 3 entries to `tools/manifest.json`
- [x] Add 3 entries to `_data/tools-list.json`

## 4. Verification
- [x] Serve local: `python3 -m http.server`
- [x] Curl local URLs and confirm HTTP 200
- [ ] Git commit + push
- [ ] Verify live URLs HTTP 200 post deploy

## 5. Reporting
- [ ] Document final tool names + live URLs + commit hash
