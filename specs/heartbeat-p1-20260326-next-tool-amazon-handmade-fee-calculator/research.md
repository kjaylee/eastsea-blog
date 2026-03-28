# Research — Amazon Handmade Fee Calculator

## Candidate selection
- Target slug: `amazon-handmade-fee-calculator`
- Intent class: exact-match marketplace fee query with transaction-level monetization/business planning intent.
- Why this one:
  - Existing repo coverage already includes adjacent marketplace tools such as `etsy-fee-calculator`, `ebay-fee-profit-calculator`, `facebook-marketplace-fee-profit-calculator`, `marketplace-fee-profit-calculator`, and `amazon-fba-profit-calculator`.
  - There was **no shipped Amazon Handmade-specific artifact in `HEAD`** even though discovery copy already referenced the topic.
  - Query intent is narrower than the generic marketplace calculator, so overlap is low: Handmade sellers care about the 15% referral fee / $0.30 minimum rule plus first-month Professional plan treatment.

## Repo inspection evidence
- `git cat-file -e HEAD:tools/amazon-handmade-fee-calculator/index.html` → missing in `HEAD`
- `git show HEAD:tools/manifest.json` → slug absent in `HEAD`
- `git show HEAD:tools/index.md` → slug already linked in discovery copy
- Conclusion: discovery had a placeholder/gap; this task should backfill a real shipped tool rather than polish an already-live page.

## Existing tool patterns reviewed
- `tools/etsy-fee-calculator/*`
  - Strong reference for marketplace-fee UX, co-located deterministic tests, and copy-ready summary output.
- `tools/marketplace-fee-profit-calculator/*`
  - Useful reference for generic marketplace terminology and avoiding overlap by picking a more exact-match fee rule.
- `tools/amazon-fba-profit-calculator/*`
  - Useful reference for Amazon-adjacent seller vocabulary while keeping Handmade distinct from FBA fee stacks.

## External evidence
### Official Amazon Handmade program page
Source fetched: `https://sell.amazon.com/programs/handmade` on 2026-03-26.

Key facts captured from the public page:
- Handmade deducts a referral fee of **15% or $0.30, whichever is greater**, for every unit shipped.
- The monthly Professional selling fee is waived for approved Handmade sellers **after the first month**.
- The page frames Handmade as a seller program for handcrafted goods, distinct from general Amazon/FBA economics.

### Search intent / SERP evidence
Brave results for `"amazon handmade fees"` returned informational pages from Reddit, A2X, Link My Books, and other fee explainers, but no dominant exact-match calculator brand was evident in the returned set. This supports a lightweight static calculator as a credible SEO backfill.

## Product decision
Ship a static `Amazon Handmade Fee Calculator` that models:
1. Buyer charge basis = product price + shipping charged to buyer + gift-wrap charged to buyer
2. Referral fee = max(15% of basis, $0.30)
3. Per-order variable costs (materials, packaging, actual shipping, ads)
4. Optional first-month Professional plan fee for onboarding-month planning
5. Monthly net profit, break-even product price, target-net product price, and required order count

## Scope boundaries
In scope:
- Public Handmade referral-fee rule
- Optional first-month Professional fee toggle
- Seller-side per-order cost planning
- Reverse pricing math for break-even and target monthly net
- Static page + deterministic Node tests + exact-once discovery verification

Out of scope:
- Tax remittance
- FBA / storage / returns / refund handling
- Region-specific regulatory or currency variations
- Promotional rebates / account-specific discounts
- Conversion-rate or traffic forecasting

## Risk notes
- Search volume is likely lower than Etsy-level head terms, so the win depends on exact-match specificity and low overlap.
- Amazon fee language changes would require copy refresh; public page citations should stay conservative and avoid implying deeper account-specific precision.
