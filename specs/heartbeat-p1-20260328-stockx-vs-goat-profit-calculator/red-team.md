# Red Team — StockX vs GOAT Profit Calculator

- [공격 1]: Comparing two platforms with different fee semantics could create false apples-to-apples certainty.
  - [방어/완화]: UI copy will explicitly label StockX `payout after fees` versus GOAT `payout before seller costs`, while the winner metric uses the only truly comparable number: final net profit.

- [공격 2]: Reusing sibling calculator modules in-browser could break if globals are not loaded in the right order.
  - [방어/완화]: `index.html` will load StockX and GOAT calculators before the comparison script; tests will also assert required script anchors.

- [공격 3]: Reverse-solve math can silently lie if one side cannot reach the target net profit.
  - [방어/완화]: unreachable states return `null` and are rendered as `N/A`, never coerced into fake prices.

- [공격 4]: Catalog wiring regressions are easy because this repo has multiple discovery artifacts.
  - [방어/완화]: test file will enforce exact-once checks across `tools/index.html`, `tools/index.md`, `_data/tools-list.json`, and `tools/manifest.json`.

- [공격 5]: This could be incremental polish rather than net-new catalog value.
  - [방어/완화]: pre-edit gap checks already confirmed the slug is absent from the tool directory and all discovery artifacts.

- [합의]: 🟢극복 — risk is real but manageable within one repo-bounded slice.
