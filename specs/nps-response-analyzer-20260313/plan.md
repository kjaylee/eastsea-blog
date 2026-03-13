# Plan — NPS Response Analyzer

## Objective
Ship a static, mobile-responsive NPS analysis tool that converts raw pasted survey scores into a complete NPS breakdown and shareable summary.

## Implementation steps
1. **Create testable core logic** in `tools/nps-response-analyzer/calculator.js`
   - tokenization/parsing
   - validation
   - NPS classification
   - score aggregation
   - histogram counts
   - summary generation
2. **Create deterministic tests** in `tools/nps-response-analyzer/calculator.test.js`
   - valid parsing
   - invalid token handling
   - correct NPS formula
   - manifest presence
   - tool index presence
3. **Build UI** in `tools/nps-response-analyzer/index.html`
   - SEO/meta/JSON-LD
   - raw input textarea
   - error state
   - KPI cards
   - histogram
   - summary box + copy/reset/sample actions
   - FAQ/use cases
4. **Register the tool**
   - add one card to `tools/index.html`
   - add one entry to `tools/manifest.json`
5. **Verify**
   - run `node --test`
   - open page in browser and capture desktop/mobile screenshots
   - review git diff/status
6. **Gap analysis / quality loop**
   - compare against spec + test cases
   - fix gaps if score < 90
   - document evidence in report
7. **Commit** once verification is complete

## Surgical edit boundaries
- Only modify:
  - new directory `tools/nps-response-analyzer/`
  - `tools/index.html`
  - `tools/manifest.json`
  - `specs/nps-response-analyzer-20260313/*`

## Acceptance criteria
- New tool exists and loads as a standalone page.
- Works from pasted raw 0–10 responses.
- Shows NPS + segment math correctly.
- Passes deterministic Node tests.
- Appears in tool portal and manifest.
- Mobile screenshot confirms responsive layout.
