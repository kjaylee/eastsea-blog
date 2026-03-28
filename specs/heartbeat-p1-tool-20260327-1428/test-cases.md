# Test Cases — Fractional CMO Pricing Calculator

## Functional
1. Baseline defaults compute deterministic break-even, recommended retainer, onboarding fee, contract value, and package ladder.
2. Alternate higher-scope scenario computes higher monthly cost and higher recommended retainer.
3. Invalid numeric inputs return user-facing error and no result.
4. Impossible pricing state (`paymentFeePct + targetMarginPct >= 100`) returns error.
5. Summary text includes pricing, onboarding fee, contract value, and status.
6. Reset restores defaults.
7. Copy summary writes non-empty summary text.

## Wiring
8. `index.html` includes required anchors and external scripts.
9. `tools/index.html` includes the tool card exactly once.
10. `tools/index.md` includes the markdown entry exactly once.
11. `_data/tools-list.json` includes the tool metadata exactly once.
12. `tools/manifest.json` includes the tool manifest entry exactly once.

## Render
13. Page loads via local HTTP server without JS syntax errors.
14. Browser screenshot shows header, input form, and KPI outputs.

## Explicit verification commands
- `node --check tools/fractional-cmo-pricing-calculator/calculator.js`
- `node --check tools/fractional-cmo-pricing-calculator/app.js`
- `node --test tests/unit/fractional-cmo-pricing-calculator.test.mjs`
- `python3 -m http.server 4173`
- `curl -I http://127.0.0.1:4173/tools/fractional-cmo-pricing-calculator/`
- Browser open/snapshot/screenshot on the local URL
