# Game Spec — ugc-creator-package-pricing-calculator

## Core Loop
- Input: Creator campaign assumptions (views, engagement, deliverables, production/revision costs, usage rights, whitelisting, agency fee, target margin).
- Action: Tool validates values and computes a package quote with cost stack + margin logic.
- Reward: Instant recommended quote, take-home, effective CPM, and copy-ready proposal summary.

## Systems
- Progression: User iterates assumptions to compare negotiation scenarios.
- Economy: Blended quote floor = max(reach-based value, margin-protected production floor), then adds licensing/whitelisting and agency-adjusted final quote.
- Save/Load: Inputs persisted to localStorage for quick recurring use.

## Constraints
- Single static route under `tools/ugc-creator-package-pricing-calculator/`.
- Mobile-first responsive UI (390x844 usable).
- No backend dependency; deterministic client-side formulas + unit-testable pure logic module.
