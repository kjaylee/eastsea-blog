# Spec — SaaS Quick Ratio Calculator

## Summary
Create a future static tool page at `tools/saas-quick-ratio-calculator/` that lets SaaS operators measure recurring-revenue growth efficiency from new MRR, expansion MRR, churned MRR, and contraction MRR.

This task is docs-only. No implementation is part of queue task `#91`.

## Primary user
- SaaS founder, finance lead, RevOps lead, or investor
- Already tracking recurring revenue and churn
- Needs a fast exact-match calculator rather than a broad dashboard

## User stories
1. As a SaaS operator, I want to enter the four core MRR components so I can compute the quick ratio immediately.
2. As a finance lead, I want to see gain, loss, and net-new MRR together so I can explain the ratio to teammates.
3. As an operator, I want a health interpretation so I can tell whether the current ratio is weak, acceptable, or strong.
4. As a planner, I want a target quick ratio input so I can see how much additional MRR gain or how much lower MRR loss is needed.
5. As a user, I want a copyable summary for board notes, weekly KPI reviews, or operating docs.

## Page requirements
- Static HTML page with no framework dependency
- Pure calculation module with deterministic exports for Node tests
- Responsive layout with concise explanatory copy
- Metadata:
  - canonical
  - meta description
  - OG and Twitter tags
  - `WebApplication` schema
- Include back link to `/tools/`
- Include related links to adjacent SaaS tools already in the repo

## Inputs
- `newMrr` (>= 0)
- `expansionMrr` (>= 0)
- `churnedMrr` (>= 0)
- `contractionMrr` (>= 0)
- `targetQuickRatio` (> 0, default `4`)

## Calculation rules
### Base values
- `grossMrrGain = newMrr + expansionMrr`
- `grossMrrLoss = churnedMrr + contractionMrr`
- `netNewMrr = grossMrrGain - grossMrrLoss`

### Core ratio
- `quickRatio = grossMrrGain / grossMrrLoss`

### Edge handling
- If `grossMrrLoss = 0` and `grossMrrGain > 0`, return:
  - `quickRatio = Infinity`
  - state note: `No MRR loss in the period`
- If `grossMrrLoss = 0` and `grossMrrGain = 0`, return:
  - `quickRatio = null`
  - state note: `No activity in the period`

### Target planning outputs
- `requiredGainAtCurrentLoss = targetQuickRatio * grossMrrLoss`
- `additionalGainNeeded = max(0, requiredGainAtCurrentLoss - grossMrrGain)`
- `maxAllowableLossAtCurrentGain = grossMrrGain / targetQuickRatio`
- `lossReductionNeeded = max(0, grossMrrLoss - maxAllowableLossAtCurrentGain)`

## Health-band rules
- `quickRatio < 1`
  - `Shrinking`
- `1 <= quickRatio < 4`
  - `Needs improvement`
- `quickRatio >= 4`
  - `Healthy`
- `Infinity`
  - `Exceptional, no loss in period`
- `null`
  - `Insufficient activity`

## Required outputs
### KPI cards
- Quick ratio
- Gross MRR gained
- Gross MRR lost
- Net new MRR
- Additional gain needed to hit target
- Max allowable MRR loss at target

### Detail rows
- New MRR
- Expansion MRR
- Churned MRR
- Contraction MRR
- Selected target quick ratio
- Loss reduction needed to hit target
- Health-band label

### Summary block
Must generate a copyable text summary that includes:
- current quick ratio
- health band
- gross gain and loss
- net new MRR
- target ratio
- either additional gain needed or confirmation that target is already met

## UX and content direction
- Position the page as a narrow SaaS KPI calculator, not a full dashboard.
- Include one short explainer clarifying that this is different from the traditional liquidity quick ratio.
- Keep the form short and the outputs decision-ready.
- Add a compact FAQ covering:
  - what counts as expansion MRR
  - difference between churn and contraction
  - why `4.0` is a common benchmark
  - what happens if loss is zero

## Related-link candidates
- `/tools/saas-nrr-calculator/`
- `/tools/saas-unit-economics-calculator/`
- `/tools/saas-expansion-mrr-waterfall-calculator/`
- `/tools/cac-payback-period-calculator/`

## Discovery wiring requirements for future implementation
Wire the slug exactly once into:
- `tools/index.html`
- `tools/index.md`
- `_data/tools-list.json`
- `tools/manifest.json`

## Non-goals
- No multi-period forecasting in v1
- No cohort analysis
- No CAC blending
- No rule-of-40 or burn-multiple combo calculator
- No ARR/MRR auto-conversion wizard
- No external SaaS data import

## Done criteria for future implementation
- Tool page exists at `tools/saas-quick-ratio-calculator/`
- Pure calculation API is testable in Node
- Edge cases for zero loss and zero activity are explicit
- Discovery surfaces include the slug exactly once
- Local tests and HTTP smoke checks pass

## Done criteria for this queue task
- `research.md`, `spec.md`, `plan.md`, and `test-cases.md` exist in one new task folder under `specs/`
- No unrelated repo files are edited
