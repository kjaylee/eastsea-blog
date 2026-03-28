# Research — Fractional CMO Pricing Calculator

## Goal
Ship one new high-intent business calculator in `eastsea-blog` that is not already shipped today and is not a duplicate of current tool inventory.

Chosen slug: `fractional-cmo-pricing-calculator`

## Why this tool
- Existing repo already covers generic freelance pricing, agency margin, AI retainers, and white-label retainers.
- The repo does **not** currently contain a dedicated fractional CMO pricing calculator.
- This keyword has clear commercial intent: founders and consultants use it near the quoting / proposal stage.
- It is monetizable through SEO capture, consulting lead-gen, or adjacent services.

## Today-duplication check
Checked repo status and same-day git log in `eastsea-blog`.
- Same-day committed tool: `ideal-body-weight-calculator`
- Untracked / in-progress tools today include marketplace / creator-fee tools such as `skool-fee-calculator`, `bandcamp-fee-calculator`, `merchant-cash-advance-calculator`, etc.
- No shipped or in-progress slug matching `fractional-cmo-pricing-calculator` was found in:
  - `tools/manifest.json`
  - `_data/tools-list.json`
  - `tools/index.md`
  - `tools/index.html`

## Repo patterns reviewed
### 1) `tools/white-label-agency-margin-calculator/index.html`
Observed:
- Single-page static HTML with embedded CSS.
- Uses `/assets/analytics.js`.
- Uses clear KPI cards + cost-driver table.
- Good precedent for premium-service pricing UX.

### 2) `tools/white-label-agency-margin-calculator/logic.mjs`
Observed:
- Deterministic validation + pure calculation function.
- Break-even and recommended-price outputs are first-class KPIs.
- Summary builder enables copy/paste handoff.

### 3) `tools/ai-retainer-profit-planner/logic.mjs`
Observed:
- Tier stack output is useful for service-offer merchandising.
- Churn/upsell concepts exist, but this tool is broader than the requested niche.
- We should keep the new tool narrower: pricing a fractional CMO retainer, not a general AI service package.

### 4) `tests/unit/marketplace-fee-profit-calculator.test.mjs`
Observed:
- Preferred verification pattern is deterministic unit tests using Node built-ins.
- Test should also verify catalog wiring and required HTML anchors.

### 5) `tools/index.md`, `tools/index.html`, `tools/manifest.json`, `_data/tools-list.json`
Observed:
- New tool must be wired in all four places.
- Exact-once catalog insertion is important.

## Product opportunity gap
Current repo has:
- generic freelance rate calculators
- white-label agency margin calculator
- AI retainer planner
- professional services utilization margin calculator

Missing:
- a dedicated **fractional executive / fractional CMO** pricing tool focused on:
  - senior strategy hours
  - leadership / stakeholder hours
  - channel review hours
  - support / analyst hours
  - scope buffer
  - onboarding fee
  - contract-value framing
  - package tier suggestions

This gives a more specific landing page than the generic freelance or agency calculators.

## Proposed calculator model
Inputs:
- current monthly retainer
- strategy hours / month
- leadership hours / month
- channel review hours / month
- support hours / month
- senior rate / hour
- support rate / hour
- tools / data budget per month
- overhead per month
- scope buffer %
- payment fee %
- target margin %
- onboarding hours
- expected contract months

Core outputs:
- total delivery hours
- delivery cost / month
- break-even retainer
- recommended monthly retainer
- suggested onboarding fee
- current operating margin
- margin gap vs target
- contract value estimate
- package ladder: advisor / growth / performance

## Formula direction
Let:
- senior base hours = strategy + leadership + channel review
- buffered senior hours = senior base hours × (1 + scope buffer)
- buffered support hours = support hours × (1 + scope buffer/2)
- monthly cost = senior hours × senior rate + support hours × support rate + tools + overhead
- break-even retainer = monthly cost / (1 - payment fee rate)
- recommended retainer = monthly cost / (1 - payment fee rate - target margin rate)
- onboarding fee = onboarding hours × senior rate / (1 - payment fee rate - target margin rate)
- contract value = recommended retainer × contract months + onboarding fee

Package ladder multipliers:
- Advisor: lower hours / lighter support
- Growth: baseline
- Performance: expanded scope and support

## UX direction
- Premium operator aesthetic, not consumer-health style.
- Immediate decision-ready summary.
- Small number of inputs, large pricing outputs.
- FAQ block for SEO intent capture.
- Copyable summary for sending into proposals.

## Constraints and risks
- Need to avoid overlapping too much with `white-label-agency-margin-calculator`.
  - Mitigation: explicitly frame around fractional CMO responsibilities and onboarding + contract value.
- Need surgical edits only because repo has many unrelated dirty files.
  - Mitigation: touch only the new tool, one new test, one spec folder, and exact catalog lines.
- Need verifiable completion.
  - Mitigation: unit tests, syntax check, local HTTP smoke, browser screenshot.

## Implementation decision
Proceed with `fractional-cmo-pricing-calculator` as a distinct premium-service pricing tool with a pure calculator module, separate UI script, and exact-once catalog wiring.
