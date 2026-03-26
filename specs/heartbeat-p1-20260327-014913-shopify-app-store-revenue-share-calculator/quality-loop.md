# Quality Loop — shopify-app-store-revenue-share-calculator

## Pass 1 target
- Correct exact-match intent
- Deterministic formula module with tests
- Responsive UI
- Discovery consistency

## Review checklist
- Does the page read as Shopify App Store developer monetization, not merchant checkout fees?
- Is the threshold split explicit in both UI and math?
- Are negative or impossible scenarios handled without broken UI?
- Do discovery files mention the slug exactly once?

## Post-verification update
- Intent fit: pass
  - The page is explicitly Shopify App Store developer monetization, not merchant checkout fees.
- Formula confidence: pass
  - Piecewise threshold split is covered in unit tests for within-band, crossover, and fully post-threshold cases.
- Discovery consistency: pass
  - slug count is exact-once across tools list, index HTML, index markdown, and manifest.
- Local smoke: blocked
  - sandbox denied binding a localhost port, so smoke evidence is recorded as a blocker instead of silently skipped.
