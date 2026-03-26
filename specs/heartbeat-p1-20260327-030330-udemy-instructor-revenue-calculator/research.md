# Research

## Discovery Surfaces Checked

- Repo discovery pages already expose `udemy-instructor-revenue-calculator` in [tools/index.md](/tmp/eastsea-hb-p1-20260327-030330/tools/index.md#L31), but there is no corresponding `tools/udemy-instructor-revenue-calculator/` directory.
- The slug does not appear in `_data/tools-list.json`, `tools/index.html`, or `tools/manifest.json`.
- Adjacent monetization tools already shipped in this repo include:
  - `teachable-fee-calculator`
  - `kajabi-fee-calculator`
  - `podia-fee-calculator`
  - `sellfy-pricing-calculator`
  - `patreon-net-revenue-calculator`
  - `onlyfans-earnings-calculator`
- Compared with those tools, Udemy is lower-overlap because its instructor payout model is channel-share based rather than a simple storefront platform fee.

## External Assumptions

Primary sources:

- Udemy support: Instructor Revenue Share
  - 97% for instructor coupon/referral-link sales.
  - 37% for sales without instructor promotion.
  - Net Amount excludes taxes and app-store fees before revenue share.
  - Source: https://support.udemy.com/hc/en-us/articles/229605008-Instructor-Revenue-Share
- Udemy support: How do I Earn Revenue From Udemy Business and Personal Plan?
  - Subscription revenue is engagement-based.
  - The instructor pool changed to 15% in January 2026.
  - Source: https://support.udemy.com/hc/en-us/articles/115013221767-How-do-I-Earn-Revenue-From-Udemy-Business-and-Personal-Plan

Inference:

- The repo’s existing discovery stub mentioned an affiliate share number, but the official pages above do not give a clean current public rate for that channel.
- To avoid hard-coding a brittle claim, the tool will model the partner / external affiliate channel as an editable share percentage with a conservative default, and the copy will mark it as customizable.

## Candidate Choice

Chosen slug: `udemy-instructor-revenue-calculator`

Why this one:

1. It already has explicit discovery intent in the repo.
2. The page is missing, so shipping it closes a catalog gap instead of duplicating a recent heartbeat tool.
3. The payout model is distinct enough from Teachable/Kajabi/Podia/Sellfy to avoid obvious overlap.
4. Search intent is exact-match and monetization-specific.
