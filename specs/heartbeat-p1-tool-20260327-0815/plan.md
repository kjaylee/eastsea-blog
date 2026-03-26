# Plan — Whop Payments Fee Calculator

1. **Scaffold logic module**
   - Define defaults, payment/payout presets, validators, fee calculators, monthly batching, reverse solver.
2. **Build tool page**
   - Single-file HTML + imported `logic.mjs`
   - Inputs, KPI cards, details table, monthly projection, notes, FAQ, related tools.
3. **Wire discovery**
   - Insert exact-once entries in `tools/index.html`, `tools/index.md`, `tools/manifest.json`, `_data/tools-list.json`.
4. **Add deterministic tests**
   - Logic + catalog coverage in `tests/unit/whop-payments-fee-calculator.test.mjs`.
5. **Verify**
   - `node --check tools/whop-payments-fee-calculator/logic.mjs`
   - `node --check tests/unit/whop-payments-fee-calculator.test.mjs`
   - `node --test tests/unit/whop-payments-fee-calculator.test.mjs`
   - local HTTP smoke with `python3 -m http.server`
   - exact-once catalog grep / test proof
6. **Commit**
   - Single surgical commit in the clean worktree branch.
