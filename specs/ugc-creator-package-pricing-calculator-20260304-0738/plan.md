# Plan — ugc-creator-package-pricing-calculator

1. Create pure pricing module (`logic.mjs`)
   - `validateInputs(input)`
   - `calculatePackageQuote(input)`
   - `buildSummary(result, locale)`
2. Build UI shell (`index.html`) + controller (`app.mjs`)
   - input form
   - KPI cards + detailed breakdown
   - copy summary button
   - reset defaults button
   - localStorage save/load
3. Add deterministic unit tests
   - path: `tests/unit/ugc-creator-package-pricing-calculator.test.mjs`
4. Verification
   - `node --test tests/unit/ugc-creator-package-pricing-calculator.test.mjs`
   - `python3 -m http.server 4173` (repo root) +
   - `curl -s http://127.0.0.1:4173/tools/ugc-creator-package-pricing-calculator/ | grep -E "UGC Creator Package Pricing Calculator|크리에이터 UGC 패키지 단가 계산기"`
5. QA + quality loop
   - score against test-cases/spec
   - fix if score < 90
   - record iteration scores and launch notes
