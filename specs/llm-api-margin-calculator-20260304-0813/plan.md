# Plan — llm-api-margin-calculator

1. Build pure economics logic module (`tools/llm-api-margin-calculator/logic.mjs`)
   - `DEFAULT_INPUT`
   - `validateInputs(input)`
   - `calculateLlmMargin(input)`
   - `buildSummary(result, locale)`
2. Build static tool UI (`index.html`) and controller (`app.mjs`)
   - grouped inputs, KPI cards, cost table
   - copy summary / reset defaults
   - localStorage restore/save
3. Add deterministic unit tests
   - `tests/unit/llm-api-margin-calculator.test.mjs`
4. Verification commands
   - `node --test tests/unit/llm-api-margin-calculator.test.mjs`
   - `node --check tools/llm-api-margin-calculator/logic.mjs`
   - `node --check tools/llm-api-margin-calculator/app.mjs`
   - `bash scripts/build-manifests.sh`
   - `python3 -m http.server 4185` + curl title check
5. Quality loop
   - score against spec + test-cases
   - document gaps and iterate until >=90 (max 3 rounds)
