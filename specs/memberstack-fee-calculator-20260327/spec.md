# Spec — Memberstack Fee Calculator

## Scope
Create a static calculator at `tools/memberstack-fee-calculator/` that models Memberstack public plan costs, transaction fees, Stripe baseline processing assumptions, refunds, and fixed costs.

## Functional requirements
1. The page must expose inputs for:
   - billing mode
   - active members
   - monthly gross sales
   - successful charges
   - current plan
   - refund rate
   - processor preset
   - custom processor rate
   - custom processor flat fee
   - other monthly cost
   - desired monthly net profit
2. The calculator must compute for the selected plan:
   - fixed plan fee
   - variable Memberstack fees
   - processor fees
   - refund loss
   - monthly net profit
   - annualized net profit
   - effective fee rate
   - average charge amount
   - break-even monthly gross
   - required gross for target net
   - target gap
3. The calculator must compute plan comparison rows for all public plans.
4. Comparison rows must include member-cap eligibility and headroom.
5. Recommendation must choose the highest-net **eligible** plan only.
6. Upgrade thresholds must be shown for adjacent plan pairs under the selected billing mode.
7. The page must expose a copyable plain-text summary.
8. The page must support English and Korean labels.

## Content requirements
- Mention public plan anchors in visible copy:
  - Basic $29 / 4%
  - Professional $49 / 2%
  - Business $99 / 0.9%
  - Established $499 / 0%
- Mention Yearly 20% OFF as a monthly-equivalent assumption.
- Mention Stripe domestic 2.9% + $0.30 as the baseline processor preset.

## Discovery requirements
Add the tool exactly once to:
- `tools/index.html`
- `tools/index.md`
- `_data/tools-list.json`
- `tools/manifest.json` via manifest rebuild

## Non-functional requirements
- Pure client-side JS
- No dependencies
- Responsive layout
- Accessible labels for all inputs
- Deterministic unit tests via Node

## Acceptance criteria
- `node --test tools/memberstack-fee-calculator/calculator.test.js` passes.
- Local HTTP page responds 200.
- Visible HTML contains required pricing anchors and assumption copy.
- Discovery surfaces contain the slug exactly once.
- Tool catalog guard passes.
