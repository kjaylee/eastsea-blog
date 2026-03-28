# Test Cases — SaaS Magic Number Calculator

## Current docs-only task checks
1. Artifact folder exists at `specs/heartbeat-queue-95-saas-magic-number-calculator-20260327/`.
2. Required files exist:
   - `research.md`
   - `spec.md`
   - `plan.md`
   - `test-cases.md`
3. The chosen slug is consistent across all four docs:
   - `saas-magic-number-calculator`
4. No tool implementation exists yet:
   - `tools/saas-magic-number-calculator/` remains absent
5. No discovery surface contains the slug yet:
   - `tools/index.html` contains `0` matches
   - `tools/index.md` contains `0` matches
   - `tools/manifest.json` contains `0` matches
   - `_data/tools-list.json` contains `0` matches
6. `plan.md` includes:
   - explicit verification commands
   - a short `Red Team` section
7. `research.md` includes:
   - nearby creator/course exclusions
   - conservative opportunity reasoning
   - repo-local verification evidence

## Future implementation logic tests
1. Base positive case
   - Inputs:
     - previous quarter recurring revenue = `100000`
     - current quarter recurring revenue = `130000`
     - previous quarter S&M spend = `120000`
     - target magic number = `0.75`
   - Expect:
     - recurring revenue delta = `30000`
     - annualized recurring revenue added = `120000`
     - magic number = `1.0`
     - efficiency band = `strong`

2. Below-target case
   - Inputs:
     - previous quarter recurring revenue = `200000`
     - current quarter recurring revenue = `220000`
     - previous quarter S&M spend = `160000`
     - target magic number = `0.75`
   - Expect:
     - annualized recurring revenue added = `80000`
     - magic number = `0.5`
     - required current-quarter recurring revenue is greater than actual current-quarter recurring revenue

3. Contraction case
   - Inputs:
     - previous quarter recurring revenue = `150000`
     - current quarter recurring revenue = `140000`
     - previous quarter S&M spend = `100000`
   - Expect:
     - recurring revenue delta is negative
     - annualized recurring revenue added is negative
     - magic number is negative
     - interpretation state indicates contraction or deterioration

4. Zero growth case
   - Inputs:
     - previous quarter recurring revenue = `90000`
     - current quarter recurring revenue = `90000`
     - previous quarter S&M spend = `45000`
   - Expect:
     - recurring revenue delta = `0`
     - magic number = `0`
     - max allowable S&M spend at target `> 0` only when target is `0`

5. Invalid spend case
   - Inputs:
     - previous quarter recurring revenue = `100000`
     - current quarter recurring revenue = `120000`
     - previous quarter S&M spend = `0`
   - Expect:
     - validation failure
     - no calculated KPI output

6. Target-zero case
   - Inputs:
     - target magic number = `0`
   - Expect:
     - calculator does not divide by zero in target-gap outputs
     - UI explains that target `0` is not a practical benchmark

## Future implementation content and UX tests
1. Page title and H1 both contain `SaaS Magic Number Calculator`.
2. Above-the-fold area includes all four user inputs before any long-form explanation.
3. Formula copy clearly states that quarter-over-quarter recurring revenue change is annualized by multiplying by `4`.
4. Copy distinguishes this metric from broader SaaS KPI pages rather than mixing in quick ratio, Rule of 40, or burn multiple.
5. Summary export includes:
   - magic number
   - annualized recurring revenue added
   - prior-quarter S&M spend
   - target gap

## Future implementation discovery tests
1. After implementation:
   - `tools/saas-magic-number-calculator/index.html` exists
   - `tools/saas-magic-number-calculator/calculator.js` exists
   - `tools/saas-magic-number-calculator/calculator.test.js` exists
2. Discovery surfaces contain the slug exactly once:
   - `tools/index.html`
   - `tools/index.md`
   - `_data/tools-list.json`
   - `tools/manifest.json`
3. Localhost smoke test returns `200 OK` for `/tools/saas-magic-number-calculator/`.
4. The page source includes visible labels for:
   - previous quarter recurring revenue
   - current quarter recurring revenue
   - previous quarter sales and marketing spend
   - target magic number
