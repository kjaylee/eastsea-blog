# Spec — Heartbeat Queue #103

## Proposed slug
`ecpm-calculator`

## Purpose
Answer the exact-match search intent behind `eCPM calculator` with a page that is:
- publisher-side, not advertiser-side
- narrowly focused on monetization yield math
- decision-ready rather than formula-only

## Exact-match SEO target
- Primary query: `eCPM calculator`

## Non-goals
- No creator platform fee modeling
- No course-platform payout modeling
- No SaaS efficiency metrics
- No full ad-ops optimization suite with pageview, viewability, or CTR modeling

## Audience
- Ad monetization managers
- Publisher ops teams
- Mobile app and game operators
- Newsletter / media operators using impression-based monetization

## Future deliverable shape
- Single static tool page under `tools/ecpm-calculator/`
- No backend required
- Deterministic calculation logic
- English/Korean copy is acceptable but not mandatory for the spec stage

## Inputs
Required base inputs:
- solve mode: `ecpm`, `revenue`, or `impressions`
- gross ad revenue
- monetized impressions
- target net eCPM

Optional monetization inputs:
- revenue share or mediation fee (%)
- fixed ad-serving cost
- currency/unit label

## Outputs
Primary outputs:
- gross eCPM
- net eCPM
- net revenue after fee drag

Decision outputs:
- revenue per 10,000 impressions
- revenue per 100,000 impressions
- revenue per 1,000,000 impressions
- revenue required to hit target net eCPM at current impressions
- impressions required to hit target revenue at current net eCPM
- target-gap delta (`current net eCPM - target net eCPM`)

## Formula direction
Let:
- `grossRevenue` = total ad revenue before share / fees
- `impressions` = monetized impressions
- `shareRate` = revenue-share or mediation fee rate as decimal
- `fixedCost` = optional fixed serving cost

Then:

```text
grossEcpm = (grossRevenue / impressions) * 1000
netRevenue = grossRevenue * (1 - shareRate) - fixedCost
netEcpm = (netRevenue / impressions) * 1000
revenueAtImpressions = (targetNetEcpm / 1000) * impressions
impressionsAtRevenue = (netRevenue / targetNetEcpm) * 1000
targetGap = netEcpm - targetNetEcpm
```

Reverse modes:
- If solving for revenue:
  - `requiredGrossRevenue = (targetEcpm / 1000) * impressions`
- If solving for impressions:
  - `requiredImpressions = (revenue / targetEcpm) * 1000`

## Validation rules
- Revenue must be `>= 0`
- Impressions must be `> 0`
- Fee/share rate must be `0-99.9`
- Fixed cost must be `>= 0`
- Target eCPM must be `> 0`
- If net revenue becomes negative, still show the result and flag it clearly instead of hiding the math

## UX notes for a future build
- The headline and canonical should stay exact-match: `eCPM Calculator`
- Explain the difference between CPM and eCPM in one short section
- Keep the interface narrower than `ad-rpm-optimizer`
- Surface monetization-ready outputs first, formula details second

## Acceptance target for a future implementation
- A user can compute gross and net eCPM in one interaction
- A user can reverse-solve revenue or impressions from a target eCPM
- The page remains clearly distinct from `cpm-calculator` and `ad-rpm-optimizer`
- Catalog wiring stays exact-once if implementation happens later

## This task's scope
This heartbeat task delivers artifact docs only. It does not create `tools/ecpm-calculator/` or modify catalog files.
