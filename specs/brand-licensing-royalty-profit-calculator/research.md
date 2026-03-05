# Research — Brand Licensing Royalty Profit Calculator

## Existing tool patterns
- `tools/in-app-tip-jar-profit-calculator/index.html` + `app.mjs` use a dark, two-column KPI layout with summary textarea, copy/reset buttons, validation errors, and status messaging. Analytics loaded via `/assets/analytics.js`.
- `tools/index.html` is a static grid of `<a class="tool-card">` entries with icon, name, description, tags, and `data-tags` for search.
- `tools/index.md` is a concise Markdown list: `[Tool Name](./slug/) — short description`.
- `tools/manifest.json` stores `{slug,title,url,size}` for each tool. `size` equals `wc -c` of the tool’s `index.html`.

## Integration requirements
- New tool folder must live at `tools/brand-licensing-royalty-profit-calculator/` with `index.html` and an external JS module (`app.mjs`) for logic.
- Add a tool card to `tools/index.html` and a list entry to `tools/index.md`.
- Append a new manifest entry and update `count` + `updatedAt` in `tools/manifest.json`.
- Verification must include `node --check` for the JS module and an HTTP 200 check for `/tools/brand-licensing-royalty-profit-calculator/`.

## UX/Content expectations
- Mobile-first: 2-column desktop → 1-column at ≤900px.
- Concise, monetization-focused copy emphasizing royalties, minimum guarantees, and advance recoupment.
- KPIs should highlight royalty due, cash received, net profit, ROI, and break-even sales.
