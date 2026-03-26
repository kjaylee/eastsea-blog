# Research

## Discovery surfaces checked

- Repo inventory: `rg -n "skool|kajabi|podia|teachable|memberful|creator-membership-platform-fee-comparator" tools _data/tools-list.json tools/index.html tools/index.md`
- Opportunity inventory: `python3 scripts/tool-opportunity-ranker.py --root . --limit 80`
- Live exact-match discovery:
  - Skool pricing: https://www.skool.com/pricing
  - Skool payments FAQ: https://help.skool.com/article/86-payments-faq
  - Skool analytics definitions: https://help.skool.com/article/216-analytics-definitions
  - Exact-match competitor surface: https://www.sublyna.com/pt/toolbox/skool-fee-calculator.html

## What exists already

- The repo already has many creator-platform monetization calculators: Kajabi, Podia, Teachable, Payhip, Patreon, Memberful, Gumroad, Lemon Squeezy, OnlyFans, Substack, Sellfy, Ko-fi, Buy Me a Coffee.
- There is no existing `skool` slug in `tools/`, `_data/tools-list.json`, `tools/index.html`, or `tools/index.md`.
- Closest overlaps are fixed-plan creator platform calculators, but none model Skool’s specific Hobby vs Pro fee crossover.

## Official fee facts used

- Skool pricing page currently shows:
  - Hobby: `$9/month`, `10%` transaction fee
  - Pro: `$99/month`, `2.9%` transaction fee
- Skool payments FAQ currently shows:
  - Pro: `2.9% + 30c` per transaction up to `$899 USD`
  - Pro: `3.9% + 30c` per transaction above `$900 USD`
  - Hobby: `10% + 30c` per transaction for all transactions
  - Subscription prices are in USD; payouts land in the creator’s local currency
- Skool analytics definitions confirms annual subscriptions appear in the month charged, which supports a “billed this month” calculator model.

## Inference

- The help copy says Pro is `2.9% + 30c` “up to $899” and `3.9% + 30c` “above $900”.
- For implementation, the threshold is treated as `>= $900` for the high-ticket rate because the official wording leaves a gap between `$899` and `$900`.
- This inference is surfaced in-page and in the spec so the ambiguity is explicit.

## Chosen slug

- `skool-fee-calculator`

## Why this is the best fit

- Exact-match intent is clear: users searching “skool fee calculator” want take-home math, not a generic pricing essay.
- Repo overlap is low at the slug/query level even though creator-platform calculators exist.
- The official fee structure creates a strong monetization decision tool:
  - Hobby vs Pro take-home
  - Low-ticket vs high-ticket Pro fee behavior
  - Break-even gross volume where Pro becomes rational
