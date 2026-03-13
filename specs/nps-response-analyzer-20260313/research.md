# Research — NPS Response Analyzer

## Task
Create one new, high-utility web tool inside `eastsea-blog/tools` with full verification. Chosen concept: **NPS Response Analyzer**.

## Why this tool
- `tools/manifest.json` currently contains **586** tools but no slug or title match for `nps`.
- The repo has many ROI/pricing calculators, but fewer practical analytics helpers for operators who already have raw survey exports.
- NPS is widely used across SaaS, support, e-commerce, creator products, and internal ops. A fast local analyzer for pasted scores is useful and broadly monetizable/searchable.
- A stronger utility than a simple calculator is to support **raw pasted responses** (comma/newline/space-separated), not just three counts.

## Relevant existing repo patterns reviewed

### 1) `tools/app-store-subscription-proceeds-calculator/index.html`
Observed patterns:
- Single self-contained HTML page with inline styles and inline rendering logic.
- Mobile-responsive 2-column layout collapsing to 1 column.
- Clear SEO tags: title, description, canonical, JSON-LD `WebApplication`.
- Validation + summary copy + FAQ + usage notes.
- Exposes a pure `compute()` block in a way that is easy to reason about.

Reusable decisions:
- Keep the tool a static HTML page with no build step.
- Include structured data and concise FAQ for SEO.
- Keep responsive card layout and copy-to-clipboard summary.

### 2) `tools/affiliate-cookie-window-roi-calculator/calculator.js`
Observed patterns:
- Logic separated into a testable module.
- Validation returns human-readable errors.
- UMD-style export supports both browser and Node tests.

Reusable decisions:
- Put parsing/validation/calculation in a separate `calculator.js` for deterministic tests.
- Export browser API to avoid duplicating logic between HTML and tests.

### 3) `tools/affiliate-cookie-window-roi-calculator/calculator.test.js`
Observed patterns:
- Uses `node:test` + `node:assert/strict`.
- Tests business logic directly, not through browser automation.

Reusable decisions:
- Add deterministic tests for parsing, NPS math, segment counts, average score, and error handling.

### 4) `tools/index.html`
Observed patterns:
- Discoverability depends on manually adding a `.tool-card` entry.
- Search depends on title/description/tags on the card.

Reusable decisions:
- Add one new card near analytics/marketing/productivity-style tools.
- Use English + Korean title/description and search tags for NPS / customer satisfaction / promoter / detractor.

### 5) `tools/manifest.json`
Observed patterns:
- Tool catalog includes slug, title, url, size.
- Some tests in other tools assert presence in manifest.

Reusable decisions:
- Add the new tool entry to `tools/manifest.json`.
- Include a test assertion that the manifest contains exactly one matching slug.

## Functional scope chosen
The tool should let users:
1. Paste raw NPS scores (0–10) separated by comma/newline/space.
2. See parsed response count and invalid token count.
3. Calculate:
   - Promoters (9–10)
   - Passives (7–8)
   - Detractors (0–6)
   - NPS score
   - Average score
   - Promoter / passive / detractor percentages
4. Generate a concise shareable summary.
5. View a simple histogram for 0–10 distribution.
6. Work well on mobile.

## Validation and UX requirements
- Reject empty input.
- Ignore surrounding punctuation/whitespace where possible, but clearly flag invalid tokens.
- Only allow integers 0–10.
- Show a clear error when no valid responses exist.
- Keep all processing fully local in-browser.

## Verification plan decided during research
Deterministic verification should include:
- `node --test tools/nps-response-analyzer/calculator.test.js`
- Manifest and tool index inclusion assertions in tests
- Screenshot evidence of the rendered page at desktop and mobile widths
- Git diff/status check before commit

## Non-goals
- No backend, no API calls, no persistence layer.
- No complex chart library; simple CSS/DOM histogram is sufficient.
- No unrelated portal refactor or tool index redesign.

## Proposed file set
- `tools/nps-response-analyzer/index.html`
- `tools/nps-response-analyzer/calculator.js`
- `tools/nps-response-analyzer/calculator.test.js`
- `specs/nps-response-analyzer-20260313/plan.md`
- `specs/nps-response-analyzer-20260313/test-cases.md`
- `specs/nps-response-analyzer-20260313/report.md`

## Quality target
- Ship a genuinely new, useful static tool.
- Deterministic business-logic tests must pass.
- Mobile layout must be visibly functional.
- Keep changes surgical: one new tool + minimal catalog updates only.
