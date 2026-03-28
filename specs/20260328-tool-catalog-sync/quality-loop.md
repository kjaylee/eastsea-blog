# Quality Loop — 2026-03-28 Tool Catalog Sync

## Iteration 1 — 82/100
### Gaps found
- invalid regex lookbehind for landing-page `numberOfItems` replacement
- title extraction preferred `og:title`, which produced wrong catalog titles on some polluted pages (`seo-meta-checker`)
- tag inference included fallback-description stopwords (`in`, `to`, `signup`)

### Fixes applied
- replaced variable-width lookbehind with capture-group substitution
- switched title extraction to prefer `<title>` and only fallback to `og:title`
- expanded stopword list for inferred tags

## Iteration 2 — 95/100
### Re-check
- focused reconciler unit tests passed
- catalog sync write succeeded
- catalog guard dropped from 3 error types + 8 warn types to 0 error types + 1 warn type
- remaining 21 warnings are outside this automation’s scope (`tool_missing_analytics_include` on individual pages)

### Result
Pass. No further auto-fix required for this slice.
