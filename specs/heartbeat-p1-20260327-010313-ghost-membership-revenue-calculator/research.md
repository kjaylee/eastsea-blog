# Research

## Goal
Ship one new exact-match monetization tool with low overlap and clear search intent.

## Discovery Surfaces Reviewed
- `tools/`
- `_data/tools-list.json`
- `tools/index.html`
- `tools/index.md`
- `tools/manifest.json`

## Existing Coverage Snapshot
- Strong existing coverage for creator fees and payouts:
  - Patreon
  - Substack
  - Ko-fi
  - Buy Me a Coffee
  - Gumroad
  - Lemon Squeezy
  - Memberful
  - Sellfy
  - Twitch / YouTube / newsletter sponsorship
- Strong existing coverage for generic monetization ROI:
  - paywall
  - upgrade conversion
  - newsletter paid upgrade
  - creator membership churn
  - affiliate / marketplace / ad monetization

## Exact-Ones / Collision Check
- `_data/tools-list.json` currently has 500 tool URLs and 500 unique slugs.
- No existing discovery entry or tool folder for `ghost-membership-revenue-calculator`.

## Candidate Slugs Considered
1. `ghost-membership-revenue-calculator`
- Pros: exact Ghost intent, blog/newsletter monetization fit, no existing Ghost monetization tool, low overlap with current catalog.
- Cons: must avoid hard-coding unstable Ghost pricing tables.

2. `ghost-vs-substack-profit-calculator`
- Pros: explicit comparison intent.
- Cons: overlap is materially higher with `beehiiv-vs-substack-profit-calculator` and `creator-membership-platform-fee-comparator`.

3. `mediavine-rpm-revenue-calculator`
- Pros: exact blog monetization intent.
- Cons: overlap with `adsense-revenue-simulator` and `ad-rpm-optimizer`; network-specific framing is more temporally unstable.

## Selection
Chosen slug: `ghost-membership-revenue-calculator`

## Why This Is The Lowest-Overlap Fit
- It fills a real platform hole: Ghost is not represented in existing monetization tools.
- It targets a direct, platform-specific search phrase instead of another generic ROI frame.
- It stays useful without live network data by using editable Ghost plan cost and Stripe assumptions.

## Implementation Direction
- Model monthly-equivalent membership economics for Ghost.
- Inputs:
  - monthly members
  - annual members
  - monthly price
  - annual price
  - Ghost monthly plan cost
  - Stripe percent / fixed fee
  - refund rate
  - support cost per member
  - target monthly net income
- Outputs:
  - monthly-equivalent gross
  - monthly-equivalent net
  - annualized net run-rate
  - effective cost rate
  - members needed to cover plan cost
  - active members needed to hit target net at current mix
