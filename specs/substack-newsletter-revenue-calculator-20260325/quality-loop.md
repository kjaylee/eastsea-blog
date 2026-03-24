# Quality Loop — Substack Newsletter Revenue Calculator

Guardrails
- Deterministic math with `node:test`.
- Page includes `/assets/analytics.js` and descriptive meta.
- Catalog guard cleanliness: manifest count and slug set matches filesystem; no duplicate discovery entries.

Planned checks
- Re-run tests after any change to fee defaults or copy.
- Manual smoke via `python3 -m http.server` and `curl` for the tool URL.

Iteration hooks
- Add optional payout drag parameters if needed (flat + percent per payout), mirroring Patreon calculator, but keep defaults at zero to avoid breaking current intent.
- Add localization (KR) copy if requested; the UI labels are concise EN for now.
- Consider a simple chart for monthly‑equivalent net vs price sensitivity; non‑goal for this P1 patch.
