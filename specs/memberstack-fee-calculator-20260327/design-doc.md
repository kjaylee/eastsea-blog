# Design Doc — Memberstack Fee Calculator

## Product thesis
Turn Memberstack’s public pricing table into a decision-ready profitability calculator for paid-membership builders.

## User story
As a founder or no-code builder evaluating Memberstack, I want to enter members, revenue, charges, refunds, and fee assumptions so I can decide which plan leaves the most monthly net profit and when an upgrade is justified.

## UX shape
- One-page responsive calculator
- Left rail: inputs and assumptions
- Right rail: KPI cards, cost breakdown, plan comparison, upgrade-threshold table, copyable summary
- EN/KR language toggle
- Prominent note explaining that Stripe is a planning assumption and actual fees vary

## Core decisions
1. **Model monthly and yearly billing**
   - Yearly mode uses a 20% discount monthly equivalent because the official pricing page advertises “Yearly 20% OFF”.
2. **Use member caps as eligibility gates**
   - Plans that do not fit the entered active-member count are shown as over-cap rather than silently recommended.
3. **Keep processor options narrow**
   - Stripe domestic preset + custom override only.
4. **Recommend the best eligible plan**
   - Recommendation should optimize monthly net profit among plans whose member cap supports the scenario.

## Exact plan model
- Basic: $29/mo, 4%, max 1,000 members
- Professional: $49/mo, 2%, max 5,000 members
- Business: $99/mo, 0.9%, max 10,000 members for v1 planning
- Established: $499/mo, 0%, max 10,000+ / effectively uncapped for v1 planning

## Output priorities
1. Monthly net profit
2. Effective take rate
3. Best eligible plan
4. Upgrade thresholds
5. Break-even / target-net gross

## Risks
- Yearly pricing may be interpreted as exact annual billing behavior when the tool is only modeling monthly equivalents.
- Member-cap wording for Business / Established on the public page is broad (“10,000+ Members”), so v1 must label this as planning guidance.
- Recommendation logic must not suggest an over-cap plan.

## Mitigations
- Add explicit assumption note for yearly mode.
- Show cap status column in plan comparison.
- Only compute recommendation from eligible plans.
