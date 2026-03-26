# Research — SubscribeStar Fee Calculator

## Goal
Ship one new exact-match monetization tool with low overlap: `subscribestar-fee-calculator`.

## Discovery surfaces checked
- Repo catalog search:
  - `tools/` directories: no `subscribestar` slug present.
  - `_data/tools-list.json`: no `SubscribeStar` entry present.
  - `tools/index.html`: no `SubscribeStar` card present.
  - `tools/index.md`: no `SubscribeStar` list entry present.
- External discovery surface:
  - Sublyna toolbox lists an exact-match `SubscribeStar Fee Calculator`, which confirms direct tool-shaped intent for this query family.
  - Source: `http://www.sublyna.com/toolbox`

## Why this slug
- Clear exact-match intent: users searching `subscribestar fee calculator` want take-home math, not a generic pricing article.
- Lower overlap than obvious repo-adjacent gaps like `kickstarter-fee-calculator`, because the repo already ships `kickstarter-net-proceeds-calculator`.
- Fits the existing creator monetization cluster without duplicating Patreon, OnlyFans, Ko-fi, Memberful, Sellfy, Ghost, or Skool work already shipped or recently heartbeat-shipped.

## Official facts to model
### SubscribeStar FAQ
Source: `https://www.subscribestar.com/help/`
- Service fee is `5%`.
- Average single transaction fee is `4.99% + $0.30`.
- For transactions over `$25`, average transaction fee is `6.22% + $0.30`.
- Transaction fees depend on processor, jurisdiction, and content type.

### SubscribeStar pricing page
Source: `https://www.subscribestar.com/pricing`
- Platform Service fee is `5%` for regular content providers.
- Payment processing fees are publicly framed as ranging from `3% + $0.30` to `7% + $0.40`.
- Creators can choose a transaction-fee model where processing is either covered by the content provider or passed onto the subscriber.
- International transactions may add `3.5%`.
- Rolling reserve: `10%` of earnings can apply in certain cases.
- Payout fees vary by method, country, and currency, so they should be modeled as editable assumptions, not hard-coded as one official default.

## Product direction
Recommended scope:
- Static client-side fee calculator.
- Input both fee model and operating assumptions.
- Expose cash-now math, not just nominal gross-to-net.
- Distinguish:
  - platform fee
  - creator-side processing fee
  - refund loss
  - reserve hold
  - payout drag
  - cash available now
  - economic net after reserve release

## Chosen modeling approach
- Default processor presets:
  - Creator covers average: `4.99% + $0.30`
  - Creator covers >$25 average charge: `6.22% + $0.30`
  - Creator covers floor range: `3.0% + $0.30`
  - Creator covers ceiling range: `7.0% + $0.40`
  - Subscriber covers processing: `0% + $0.00` on creator side
  - Custom
- Optional international surcharge toggle: `+3.5%`
- Optional rolling reserve toggle: default `10%`
- Editable payout drag inputs because SubscribeStar does not publish one universal payout fee

## Overlap assessment
- Existing nearby tools: Patreon, Memberful, Ko-fi, Buy Me a Coffee, OnlyFans, Sellfy, Substack, Ghost, Skool.
- Why overlap is acceptable:
  - platform-specific fee structure
  - public query intent already exists externally
  - official pricing mechanics differ materially: creator-vs-subscriber processing model, fee variability range, reserve hold

## Chosen slug
`subscribestar-fee-calculator`
