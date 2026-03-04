# Research — ai-retainer-profit-planner

## Objective
Ship one new monetizable tool vertical slice in `eastsea-blog` that helps AI service operators set profitable retainer pricing immediately.

## Constraints from task
- Must ship now (no polishing pass)
- Must include tests + verification evidence
- Must follow gate: research → spec → plan → test-cases → implementation → verification → gap-analysis

## Repository patterns reviewed
1. `tools/llm-api-margin-calculator/{logic.mjs, app.mjs, index.html}`
   - Pattern: pure calculation module + DOM app module + single-page UI.
   - Testability pattern: export `validateInputs`, `calculate*`, `buildSummary` for unit tests.
2. `tests/unit/llm-api-margin-calculator.test.mjs`
   - Pattern: `node:test` + `assert/strict`, behavior-oriented cases (`higher X => higher/lower Y`).
3. `tools/manifest.json` + `scripts/build-manifests.sh`
   - Tool discoverability requires manifest rebuild after adding a new tool directory.

## Product direction selected
- Tool slug: `ai-retainer-profit-planner`
- Monetization angle: consultants/agencies can generate package prices (Starter/Growth/Scale) and break-even targets from live funnel + cost assumptions.
- Differentiator: combines conversion funnel, risk buffer, churn drag, and upsell attach into one sell-ready pricing output.

## Implementation scope
- `tools/ai-retainer-profit-planner/index.html`
- `tools/ai-retainer-profit-planner/app.mjs`
- `tools/ai-retainer-profit-planner/logic.mjs`
- `tests/unit/ai-retainer-profit-planner.test.mjs`
- `tools/manifest.json` refresh

## Verification commands planned
- `node --test tests/unit/ai-retainer-profit-planner.test.mjs`
- `node --check tools/ai-retainer-profit-planner/app.mjs`
- `bash scripts/build-manifests.sh`
- `python3 -m http.server 8134` + `curl -I http://127.0.0.1:8134/tools/ai-retainer-profit-planner/`
- `curl -s http://127.0.0.1:8134/tools/ai-retainer-profit-planner/ | rg "AI Retainer Profit Planner"`
