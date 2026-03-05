# Research — fraud-prevention-roi-calculator

## Reference patterns reviewed

- `tools/pricing-uplift-roi-calculator/index.html`
  - Single-file calculator layout: header + two-column grid, input card + KPI card.
  - Inline JS handles parsing, validation, compute, render, copy summary.
  - KPI cards, status pill, and summary textarea for shareable output.

- `tools/api-minimum-commit-overage-profit-calculator/index.html`
  - Uses external `script.js`, analytics include, consistent styling variables, mobile grid collapse.
  - Buttons for copy/reset and error banner pattern.

- `tools/api-minimum-commit-overage-profit-calculator/script.js`
  - Structure: refs map → defaults → formatter helpers → parse/validate → compute → render.
  - Edge handling for invalid inputs and Infinity payback.

- `tools/index.html`
  - Tool discovery uses static `<a class="tool-card">` entries in a large grid.
  - Each card includes icon, title, short description, and tags.

- `tools/index.md`
  - Markdown index lists tools as bullets with 1-line summaries.

- `tools/manifest.json`
  - Alphabetized list of tool objects: `slug`, `title`, `url`, `size` (index.html byte size).
  - New tool should be inserted in slug order.

## UX conventions to follow
- Mobile-first: grid collapses to single column under ~860px.
- KPI cards with clear labels and number formatting (KRW and percentages).
- Validation prevents negative/invalid values and shows inline error banner.
- Copy summary button uses clipboard API with alert fallback.
