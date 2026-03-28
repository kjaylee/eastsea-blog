# Test Cases — Heartbeat Queue #103

## Docs-only gate
1. Artifact folder exists at `specs/heartbeat-queue-103-ecpm-calculator-20260327/`.
2. Required files exist:
   - `research.md`
   - `spec.md`
   - `plan.md`
   - `test-cases.md`
3. `tools/ecpm-calculator/` does not exist after this task.
4. `tools/index.html`, `tools/index.md`, `tools/manifest.json`, and `_data/tools-list.json` still contain `0` matches for `ecpm-calculator`.

## Future calculator test cases
### TC-01 Gross eCPM baseline
- Inputs:
  - mode = `ecpm`
  - gross revenue = `1250`
  - impressions = `500000`
  - share rate = `0`
  - fixed cost = `0`
- Expected:
  - gross eCPM = `2.50`
  - net eCPM = `2.50`
  - net revenue = `1250`

### TC-02 Net eCPM after revenue share
- Inputs:
  - mode = `ecpm`
  - gross revenue = `1250`
  - impressions = `500000`
  - share rate = `20`
  - fixed cost = `0`
- Expected:
  - gross eCPM = `2.50`
  - net revenue = `1000`
  - net eCPM = `2.00`

### TC-03 Net eCPM after share and fixed cost
- Inputs:
  - mode = `ecpm`
  - gross revenue = `1250`
  - impressions = `500000`
  - share rate = `20`
  - fixed cost = `100`
- Expected:
  - net revenue = `900`
  - net eCPM = `1.80`

### TC-04 Reverse solve revenue from target eCPM
- Inputs:
  - mode = `revenue`
  - target eCPM = `3.20`
  - impressions = `750000`
- Expected:
  - required revenue = `2400`

### TC-05 Reverse solve impressions from current revenue
- Inputs:
  - mode = `impressions`
  - revenue = `1800`
  - target eCPM = `4.50`
- Expected:
  - required impressions = `400000`

### TC-06 Revenue ladder outputs
- Inputs:
  - net eCPM = `3.40`
- Expected:
  - revenue at `10,000` impressions = `34`
  - revenue at `100,000` impressions = `340`
  - revenue at `1,000,000` impressions = `3400`

### TC-07 Target-gap indicator
- Inputs:
  - current net eCPM = `2.10`
  - target net eCPM = `2.75`
- Expected:
  - target gap = `-0.65`
  - UI should label the scenario as below target

### TC-08 Validation: zero impressions
- Inputs:
  - impressions = `0`
- Expected:
  - validation error
  - no division-by-zero output

### TC-09 Validation: impossible fee rate
- Inputs:
  - share rate = `100`
- Expected:
  - validation error
  - no net eCPM result rendered
