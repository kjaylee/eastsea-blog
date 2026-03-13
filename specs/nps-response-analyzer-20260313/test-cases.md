# Test Cases — NPS Response Analyzer

## Core logic

### TC-01 Valid mixed responses
Input: `10, 9, 8, 7, 6, 5, 0`
Expected:
- validCount = 7
- promoters = 2
- passives = 2
- detractors = 3
- NPS = round((2/7 - 3/7) * 100) = -14
- averageScore = 45 / 7

### TC-02 Promoter-only set
Input: `9 9 10 10`
Expected:
- NPS = 100
- detractors = 0
- promoterPercent = 100

### TC-03 Detractor-only set
Input: `0,1,2,3,4,5,6`
Expected:
- NPS = -100
- promoters = 0
- detractorPercent = 100

### TC-04 Invalid tokens reported
Input: `10, 9, foo, 11, -1, 6`
Expected:
- valid responses parsed = [10, 9, 6]
- invalid tokens contain `foo`, `11`, `-1`
- results still compute from valid responses

### TC-05 Empty input rejected
Input: ``
Expected:
- validation error
- no result object

### TC-06 Histogram counts
Input: `10,10,8,8,8,0`
Expected:
- histogram[10] = 2
- histogram[8] = 3
- histogram[0] = 1
- all other scores = 0

## Integration / registry

### TC-07 Tool portal listing exists
Expected:
- `tools/index.html` contains exactly one reference to `nps-response-analyzer/`
- card title/description mention NPS analyzer intent

### TC-08 Manifest entry exists
Expected:
- `tools/manifest.json` contains exactly one tool with slug `nps-response-analyzer`

## Manual UI verification

### TC-09 Desktop render
Expected:
- Inputs and results visible without layout breakage
- histogram bars visible
- summary textarea populated from sample input

### TC-10 Mobile render
Expected:
- Layout collapses to one column
- controls remain tappable
- summary and KPI cards readable without horizontal overflow

## Verification commands
- `node --test tools/nps-response-analyzer/calculator.test.js`
- Browser screenshot at desktop width
- Browser screenshot at mobile width
