# Plan — Marketplace Fee Profit Calculator Logic/Test Hardening

## Build steps
1. Create a browser + CommonJS-compatible calculator module that exposes defaults, validation, pure math, summary formatting, and DOM initialization.
2. Replace the inline `<script>` block in `tools/marketplace-fee-profit-calculator/index.html` with a single external script tag to `./calculator.js`.
3. Add deterministic unit coverage in `tests/unit/marketplace-fee-profit-calculator.test.mjs` for:
   - baseline default scenario
   - alternate scenario math
   - validation failures
   - impossible break-even state (`kFactor <= 0`)
   - impossible target margin state (`targetDenom <= 0`)
   - summary output
   - HTML anchors
   - exact-once catalog wiring
4. Run explicit verification commands.
5. Record verification, gap analysis, and quality-loop score.

## Verification commands
- `node --check tools/marketplace-fee-profit-calculator/calculator.js`
- `node --test tests/unit/marketplace-fee-profit-calculator.test.mjs`
- `python3 - <<'PY' ... exact-once checks ... PY`
- `python3 -m http.server 4173 >/tmp/marketplace-tool-http.log 2>&1 & SERVER=$!; sleep 2; curl -I http://127.0.0.1:4173/tools/marketplace-fee-profit-calculator/; kill $SERVER; wait $SERVER 2>/dev/null || true`

## Success criteria
- Page still works with the same IDs and user-visible outputs.
- Inline logic is removed from HTML.
- Deterministic Node tests pass.
- Catalog wiring remains exact-once across manifest, tools list, and portal index files.
- Verification evidence is written to the spec folder.
