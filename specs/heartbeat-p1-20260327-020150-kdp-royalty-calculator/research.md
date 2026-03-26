# Research: `kdp-royalty-calculator`

## Discovery surfaces reviewed
- `_data/tools-list.json`
- `tools/manifest.json`
- `tools/index.md`
- `tools/index.html`

## Existing overlap scan
- The repo already has dense coverage for creator subscriptions, newsletter monetization, sponsorship pricing, marketplace seller fees, and creator platform payouts.
- Closest existing tools are `amazon-fba-profit-calculator`, `amazon-handmade-fee-calculator`, `redbubble-royalty-margin-calculator`, and `brand-licensing-royalty-profit-calculator`.
- None target Kindle Direct Publishing, KDP royalties, eBook royalty-plan math, or Kindle Unlimited page-read earnings.

## Candidate gap evaluation
- `medium-partner-program-earnings-calculator`
  - Pros: very low overlap, blog-adjacent intent.
  - Cons: payout model is opaque and unstable; hard to make exact and testable.
- `beehiiv-ad-network-revenue-calculator`
  - Pros: newsletter monetization intent is clear.
  - Cons: overlaps heavily with existing newsletter sponsorship/fill-rate/beehiiv tools.
- `ghost-membership-revenue-calculator`
  - Pros: clear creator monetization.
  - Cons: overlaps with existing membership and platform fee calculators.
- `kdp-royalty-calculator`
  - Pros: exact-match intent, low overlap, public royalty math, strong monetization use case, easy to test.
  - Cons: scope must be explicit because KDP covers eBooks, print, and KU.

## Chosen slug
- `kdp-royalty-calculator`

## Why this is the best fit
- It matches a direct, high-intent monetization query.
- It fills a true platform-specific gap rather than rephrasing an existing generic ROI tool.
- It can model both major digital KDP income streams without drifting into vague heuristics:
  - eBook royalty-plan math
  - Kindle Unlimited / KDP Select page-read earnings

## Official-source notes
- Amazon KDP’s current public guidance states:
  - eBooks offer `35%` and `70%` royalty options.
  - `70%` royalties apply only in eligible territories and are reduced by delivery costs.
  - sales outside eligible 70% territories fall back to `35%`.
  - KDP Select earnings come from the monthly Global Fund and pages-read payouts vary month to month.
- Source URLs used for planning:
  - `https://kdp.amazon.com/en_US/earn?lang=en-US`
  - `https://kdp.amazon.com/en_US/help/topic/G200644210`
  - `https://kdp.amazon.com/en_US/help/topic/G200641280`
  - `https://kdp.amazon.com/help/topic/G200634500`

## Scope decision
- Ship an eBook-focused KDP calculator, not a print calculator.
- Include KDP Select / KU pages-read earnings as an editable planning input.
- Avoid hard-coding unstable monthly KENP payout facts; treat KU payout per page as user-editable.
