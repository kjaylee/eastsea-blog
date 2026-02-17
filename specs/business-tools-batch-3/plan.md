# Plan: Business Tools Batch 3

## Architecture
- Standalone tools with no build step.
- Shared dark design language: radial gradients, glass cards, responsive two-column sections collapsing to one column on mobile.
- Utility helpers per page for:
  - URL normalization
  - proxy fetch fallback
  - CSV/markdown download
  - safe text escaping

## Logic Plan by Tool

1. **telegram-miniapp-tester**
   - URL sanitizer + iframe loader.
   - Device presets update iframe viewport container.
   - HTML source fetch via direct request + `r.jina.ai` fallback.
   - Parse viewport/touch/responsive hints and compute pass/warn/fail badges.
   - Render BotFather template + JS snippets with copy buttons.

2. **game-screenshot-generator**
   - Preview iframe in selected preset dimensions.
   - Screenshot source from `thum.io` image API to avoid cross-origin iframe capture limits.
   - Draw final PNG with canvas: cover-fit background + optional text overlay.
   - Batch generator loops all presets and prepares download links.

3. **sitemap-analyzer**
   - Fetch sitemap XML (direct + proxy fallback).
   - Parse `<urlset>` entries and derive metrics.
   - Run limited status checks using `r.jina.ai/http://...` warnings for HTTP error detection.
   - Fetch homepage links to mark orphan candidates.
   - Draw lastmod timeline on canvas and support CSV export.

4. **page-speed-estimator**
   - Analyze fetched or pasted HTML via DOMParser.
   - Count scripts/styles/images/fonts/fetch hints.
   - Estimate transfer weights heuristically by resource type and count.
   - Estimate FCP and compute sub-scores.
   - Render side-by-side comparison card for URL A/B.

5. **content-calendar-planner**
   - Maintain items in localStorage.
   - Calendar month grid generation with per-day chips.
   - CRUD modal/form behavior.
   - Streak/gap analytics from published dates.
   - Markdown export grouped by date.

## Test Cases (before implementation)

### Spec validation tests
1. New tool paths exist with functional controls and non-empty JS logic.
2. Required feature checklist per tool is implemented and interactive.
3. `tools/manifest.json` reflects new slugs and updated count.

### User scenario tests
1. **telegram-miniapp-tester**: enter a URL, switch devices, run validation, copy BotFather template.
2. **game-screenshot-generator**: set URL/title, create one preset PNG and run batch 4 output.
3. **sitemap-analyzer**: analyze EastSea sitemap URL, see stale/missing/orphan counts, export CSV.
4. **page-speed-estimator**: analyze URL A and B, and validate fallback with pasted HTML.
5. **content-calendar-planner**: add/edit/delete items, reload to confirm persistence, export markdown, verify streak/gap updates.

## Implementation Order
1. Create spec/plan/tasks docs.
2. Implement 5 tools.
3. Run local smoke checks.
4. Rebuild `tools/manifest.json`.
5. Commit and push.
6. Sync to MiniPC and regenerate production `tools-list.json`.
7. Verify deployed pages by title grep.
