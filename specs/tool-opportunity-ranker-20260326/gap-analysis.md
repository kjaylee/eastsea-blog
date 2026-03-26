# Gap Analysis — tool-opportunity-ranker-20260326

## What this slice solved
- Added a deterministic selector for next P1 tool work.
- Converted vague catalog debt into a ranked, evidence-backed backlog.
- Identified the strongest immediate candidate: `marketplace-fee-profit-calculator`.

## What remains unfixed
- The script is read-only; it does not repair any tool pages or catalogs by itself.
- Repo-wide catalog debt is still large:
  - 190 missing tools-list entries
  - 585 tools without external logic files
  - 601 tools without automated tests
- Landing-page public counts remain stale (`650`/`664`) relative to the filesystem truth set (`681`).

## Best next move
1. Take rank #1 `marketplace-fee-profit-calculator`.
2. Extract its inline logic into `logic.mjs` or `calculator.js`.
3. Add a deterministic unit test.
4. Re-run this ranker and confirm the next candidate shifts automatically.

## Why I did not patch a tool in this cycle
The request prioritized identifying the highest-leverage missing/shippable opportunity **and** materially advancing the pipeline. The selector automation removes the repeated research bottleneck for every future heartbeat run; that leverage is larger than one isolated page patch in this cycle.
