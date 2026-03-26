# Research

## Goal
Ship one new exact-match monetization tool with low overlap and clear user intent.

## Discovery surfaces reviewed
- `tools/manifest.json`
- `_data/tools-list.json`
- `tools/index.html`
- `tools/index.md`
- Existing monetization tool directories under `tools/`
- `scripts/README.md` for repo catalog and opportunity-ranking conventions

## Existing overlap check
Closest existing tools:
- `substack-fee-calculator`
- `substack-newsletter-revenue-calculator`
- `memberful-fee-calculator`
- `patreon-fee-calculator`
- `patreon-net-revenue-calculator`
- `creator-membership-platform-fee-comparator`

Why overlap is low enough:
- None of the current tools are an exact-match Ghost page.
- Existing pages model Substack, Patreon, Memberful, or a cross-platform comparison.
- Ghost user intent is platform-specific because Ghost’s monetization stack is meaningfully different:
  - Ghost claims 0% transaction fees.
  - Ghost(Pro) plan cost matters directly.
  - Ghost(Pro) Starter does not support paid subscriptions.
  - Self-hosted Ghost has different fixed-cost behavior from hosted creator platforms.

## External source checks
Checked on March 27, 2026:
- Ghost memberships help center: https://ghost.org/help/topic/memberships/
- Ghost pricing: https://ghost.org/pricing/

Key points used:
- Ghost positions memberships as a core product area.
- Ghost markets 0% transaction fees.
- Ghost(Pro) pricing page shows:
  - Starter: $18/mo billed yearly and no paid subscriptions
  - Publisher: $29/mo billed yearly and paid subscriptions
  - Business: $199/mo billed yearly

## Chosen slug
- `ghost-membership-fee-calculator`

## Why this slug won
- Exact-match query intent is strong.
- Overlap against current corpus is lower than another generic sponsorship-rate page.
- The page can add Ghost-specific decision logic instead of being a light reskin of Substack or Memberful.
