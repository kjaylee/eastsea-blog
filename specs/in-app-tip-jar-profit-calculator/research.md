# Research — In-app Tip Jar Profit Calculator

## Existing tool patterns
- `tools/ad-free-upgrade-roi-calculator/index.html` uses dark UI, two-column grid, summary textarea, copy/reset buttons, and external JS modules (`app.mjs`, `logic.mjs`). Analytics loaded via `/assets/analytics.js`.
- `tools/marketing-roi-calculator/index.html` shows a compact KPI grid, validation errors, status pill, and summary copy flow.
- `tools/index.html` lists tool cards as static `<a class="tool-card">` blocks with icon, name, description, tags, and `data-tags`. Counts auto-update by DOM query.
- `tools/index.md` maintains a simple Markdown list with Korean name + short description + tool link.
- `tools/manifest.json` contains `slug`, `title`, `url`, and `size` fields. `size` equals `wc -c` of the tool’s `index.html` (verified with `marketing-roi-calculator`).

## Integration requirements
- New tool folder must be under `tools/<slug>/` with at least `index.html`.
- Tool must be wired into `tools/index.html`, `tools/index.md`, and `tools/manifest.json`.
- Verification requires `node --check` on a JS module and HTTP 200 check for `/tools/<slug>/`.

## UX expectations
- Mobile-friendly: responsive grid collapses to one column at <= 900px.
- Concise copy: short subtitles and brief tool card description.
- ROI/profit calculators generally expose monthly net profit, ROI, payback, and break-even metrics.
