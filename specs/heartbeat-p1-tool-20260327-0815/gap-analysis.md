# Gap Analysis — Whop Payments Fee Calculator

## What is complete
- New tool shipped in isolated worktree.
- Pure logic module added and covered by deterministic tests.
- Catalog wiring added exactly once across all required surfaces.
- Local HTTP smoke and exact-once checks recorded.

## Remaining risks
1. **Public fee schedule drift**
   - Whop may change processing or payout fees.
   - Mitigation: UI notes explicitly say to verify current Whop terms before pricing decisions.

2. **Payout percentage basis assumption**
   - Tool models percentage payout fees against the post-processing payout balance.
   - This is documented clearly, but it remains a modeling assumption rather than an executable contract from Whop.

3. **Repo-global catalog debt**
   - `tool-catalog-guard` still fails because the repo already has many filesystem tools missing from `_data/tools-list.json`.
   - Not caused by this task, but it reduces confidence in whole-repo catalog hygiene.

## Not pursued on purpose
- Country-specific international local bank payout estimation
- Non-public or variable platform-commercial arrangements
- Full repo-wide catalog cleanup
