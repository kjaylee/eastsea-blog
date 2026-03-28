# Research — Creator Brand Deal Take-home Calculator

## Goal
Ship one new high-intent static monetization tool for `eastsea-blog/tools` that does not duplicate the current catalog and answers a closer-to-cash creator question than the existing rate-estimation pages.

## Office-hours framing
1. **Who has the problem?**
   - Creators, creator managers, and small agencies pricing branded-content deals.
2. **What specific scenario triggers it?**
   - A brand asks for a package with paid usage, whitelisting, or exclusivity and the creator needs to know the real take-home after rep splits and delivery costs.
3. **How are they solving it now?**
   - Ad hoc spreadsheet math, manual phone-calculator checks, or by underpricing because the deductions are not modeled together.
4. **What is the ideal outcome?**
   - In one screen, see the current brand quote, actual creator net, and the minimum quote needed to hit a target take-home.
5. **What constraints matter?**
   - Static/browser-only, deterministic formulas, same-currency inputs, no login, no external API dependency.
6. **How will success be measured?**
   - A user can answer two concrete questions immediately:
     - “What do I really keep from this deal?”
     - “What should I quote to net my target amount?”

## Repo gap check
Evidence gathered inside the repo on 2026-03-29 KST:

- `rg -n 'creator-brand-deal-take-home-calculator|brand-deal-take-home-calculator|creator brand deal|brand deal take home|brand deal calculator|influencer brand deal' tools/index.md _data/tools-list.json tools` returned no matching shipped page.
- Adjacent creator tools that already exist:
  - `tools/creator-sponsorship-rate-calculator/`
  - `tools/ugc-creator-package-pricing-calculator/`
  - `tools/ugc-whitelisting-attach-rate-roi-calculator/`
  - `tools/brand-licensing-royalty-profit-calculator/`
- Those adjacent pages solve different jobs:
  - `creator-sponsorship-rate-calculator` estimates a rate from audience performance.
  - `ugc-creator-package-pricing-calculator` estimates package pricing from views and CPM assumptions.
  - `ugc-whitelisting-attach-rate-roi-calculator` is a seller-side attach-rate ROI model, not a creator-side deal take-home model.
  - `brand-licensing-royalty-profit-calculator` models royalty contracts, minimum guarantees, and recoupment, not flat campaign deal economics.

Conclusion: `creator-brand-deal-take-home-calculator` is a real catalog gap, not a duplicate.

## Why this candidate wins
1. **High intent**
   - It sits at quote-time, not ideation-time. Users already have a live deal structure or target net amount.
2. **Monetizable utility**
   - This is direct pricing math for creators and reps, not a soft educational widget.
3. **Deterministic implementation**
   - The formulas are internal business arithmetic, so the tool stays stable without external dependencies or stale platform rules.
4. **Cluster fit**
   - It strengthens the repo’s creator-income lane while staying distinct from rate calculators and platform fee calculators.

## Product decision
Ship `creator-brand-deal-take-home-calculator` as a static browser calculator with these core inputs:

- deliverable count
- base fee per deliverable
- paid usage months + fee per month
- whitelisting months + fee per month
- exclusivity months + fee per month
- manager fee %
- agency fee %
- platform / escrow fee %
- payment processing % + fixed fee
- production / crew cost
- assistant / editor cost
- travel / props cost
- tax reserve %
- target creator net take-home

Core outputs:

- current brand quote
- creator net take-home
- total rights add-on value
- effective take-home rate
- total deductions and hard costs
- required quote to reach target net
- required base fee per deliverable to reach target net

## Scope guardrails
- Same-currency planning only; no FX engine in v1.
- No benchmark audience-rate estimation; that is already covered by the sponsorship-rate and UGC package tools.
- No contract generation or invoicing in v1.
- No tax-law advice; tax reserve is a user-supplied planning assumption.

## Acceptance-direction notes
- The page should explicitly state that it is a deal take-home calculator, not a rate estimator.
- The solver must stay honest when deductions make the target impossible; return an unavailable / infinite state instead of fake math.
- Catalog wiring must be exact-once across `tools/index.html`, `tools/index.md`, `_data/tools-list.json`, and generated `tools/manifest.json`.
