# Plan — Brand Licensing Royalty Profit Calculator

1. Create tool folder `tools/brand-licensing-royalty-profit-calculator/` with `index.html` and `app.mjs` (UI + calculation logic).
2. Implement validation, KPI rendering, status messaging, and summary copy flow in `app.mjs`.
3. Wire tool into `tools/index.html` (new tool card) and `tools/index.md` (Markdown list entry).
4. Update `tools/manifest.json` with slug/title/url/size, increment `count`, refresh `updatedAt`.
5. Run verification: `node --check` for the JS module; run local HTTP server and confirm HTTP 200 for tool URL.
6. Record verification output in `verification.md`, then score against spec and write `gap-analysis.md`.
