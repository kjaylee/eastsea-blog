# Research — YouTube Super Chat Revenue Calculator

## Goal
Ship one new exact-match monetization tool with clear user intent, low overlap against the existing `eastsea-blog` tool corpus, and exact-once discovery wiring.

## Discovery surfaces checked
Repo-only checks performed on 2026-03-27 KST:

- `tools/index.html`
- `tools/index.md`
- `_data/tools-list.json`
- `tools/manifest.json`
- adjacent shipped YouTube monetization tools:
  - `tools/youtube-ad-revenue-estimator/`
  - `tools/youtube-membership-break-even-calculator/`

## Exact-match gap evidence
Chosen slug:

- `youtube-super-chat-revenue-calculator`

Exact-match repo state before implementation:

- `tools/index.html` exact matches for `youtube-super-chat-revenue-calculator`: `0`
- `tools/index.md` exact matches for `youtube-super-chat-revenue-calculator`: `0`
- `_data/tools-list.json` exact URL matches for `/tools/youtube-super-chat-revenue-calculator/`: `0`
- `tools/manifest.json` exact slug matches for `youtube-super-chat-revenue-calculator`: `0`
- `tools/youtube-super-chat-revenue-calculator/`: missing

This is a clean new-slot opportunity rather than a duplicate or partial catalog repair.

## Overlap audit
Nearby shipped tools:

- `youtube-ad-revenue-estimator`
  - covers long-form/Shorts RPM and monetized playback
  - does not model live paid-message conversion or Super Chat take-home
- `youtube-membership-break-even-calculator`
  - covers recurring membership conversion, churn, and member ROI
  - does not model one-off live-stream donation behavior
- `twitch-revenue-calculator`
  - mixed-stream revenue estimator for Twitch subs/bits/ads
  - platform-specific, broader, and not exact-match to YouTube Super Chat intent

Conclusion:

- overlap is low because the chosen tool answers a distinct monetization question:
  - “How much monthly YouTube Super Chat revenue do I keep?”
  - “What paid-message rate or average Super Chat size do I need to hit my target?”

## Candidate rejects
Rejected candidate:

- `stan-store-fee-calculator`
  - search intent is clear, but the repo already has a dense cluster of creator/course/storefront fee tools: `kajabi-fee-calculator`, `podia-fee-calculator`, `teachable-fee-calculator`, `payhip-fee-calculator`, `gumroad-net-revenue-calculator`, `sellfy-pricing-calculator`
  - a new storefront-fee calculator would overlap more heavily with that cluster

Rejected candidate:

- `whop-fee-calculator`
  - also clear platform intent, but still sits close to the same storefront/community-platform fee cluster
  - higher policy-assumption risk than a creator-controlled revenue model

## Product direction
Build a bilingual, static planning calculator focused on live-stream donation economics:

- streams per month
- average live views per stream
- paying-viewer rate
- paid messages per paying viewer
- average Super Chat amount
- creator share
- refund/reversal rate
- withholding tax
- monthly live-stream operating cost
- target monthly net

Primary outputs:

- monthly live views
- monthly paying viewers
- monthly paid messages
- gross fan spend
- creator take-home before costs
- monthly net after costs
- take-home per stream
- take-home per 1,000 live views
- break-even paid messages
- target average Super Chat amount
- target paying-viewer rate

## Why this slug won
1. Exact-match gap across all discovery files: zero current coverage.
2. Clear monetization intent: creators searching this term are close to pricing or programming decisions.
3. Low overlap with the repo’s current YouTube coverage.
4. Safe deterministic implementation: no live APIs, no platform integration, no hidden dependencies.
