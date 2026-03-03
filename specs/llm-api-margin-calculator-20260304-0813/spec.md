# Spec — llm-api-margin-calculator

## Core Loop
- Input: MAU, request behavior, token profile, model pricing, retry/cache behavior, fees, support/fixed costs.
- Action: calculator computes revenue, variable cost stack, contribution margin, operating profit, and break-even targets.
- Reward: operator gets immediate decision metrics for pricing and growth strategy.

## Key Outputs
1. Monthly gross revenue
2. Net revenue after payment fees
3. Total model token cost (input/output split)
4. Variable cost total
5. Contribution margin + contribution margin %
6. Operating profit + operating margin %
7. Break-even price per active user
8. Break-even active users at current price
9. Target-margin required price per active user

## UX Requirements
- Single static page under `tools/llm-api-margin-calculator/`
- Mobile-first responsive layout (390px width without horizontal scroll)
- Live recalculation on input changes
- Copyable executive summary
- Input persistence via localStorage

## Technical Constraints
- Pure logic in `logic.mjs` (no DOM dependencies)
- UI orchestration in `app.mjs`
- Unit tests cover validation + directional financial behavior
- No backend/network dependency
