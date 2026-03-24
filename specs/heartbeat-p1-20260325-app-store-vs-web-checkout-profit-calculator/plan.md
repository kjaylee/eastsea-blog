# Plan — App Store vs Web Checkout Profit Calculator

1. Create pure logic module `tools/app-store-vs-web-checkout-profit-calculator/calculator.js`
   - UMD export
   - defaults + validation + formula helpers + calculate()
2. Create focused node tests `calculator.test.js`
   - golden numbers
   - sensitivity cases
   - invalid input rejection
3. Build responsive `index.html`
   - SEO metadata
   - inputs, KPI cards, comparison table, insight copy
   - inline render script using calculator module
4. Add manifest entry surgically only if low-risk
   - avoid rebuilding manifest wholesale because repo already has unrelated in-flight changes
5. Run verification
   - `node --test tools/app-store-vs-web-checkout-profit-calculator/calculator.test.js`
   - targeted integration tests if relevant
   - local server + `curl`
6. Write verification, gap analysis, and quality-loop artifacts

## Deliverable boundaries
- exactly one tool shipped
- no index refactor
- no bulk manifest rebuild
- no changes outside `tools/app-store-vs-web-checkout-profit-calculator/`, optional `tools/manifest.json`, and this spec folder
