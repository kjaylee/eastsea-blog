# Research — Skool Fee Calculator

## Goal
Ship exactly one high-intent creator monetization tool with low overlap against the existing EastSea catalog.

## Catalog overlap audit
I inspected the local catalog before implementation via `_data/tools-list.json`, `tools/index.html`, `tools/index.md`, and direct slug checks.

### Existing creator / membership monetization coverage
- `memberful-fee-calculator`
- `stan-store-fee-calculator`
- `substack-newsletter-revenue-calculator`
- `creator-membership-tier-revenue-calculator`
- `creator-membership-platform-fee-comparator`
- `patreon-fee-calculator`
- `ko-fi-fee-calculator`
- `onlyfans-earnings-calculator`
- `sellfy-vs-gumroad-profit-calculator`
- `podia-fee-calculator`
- `teachable-fee-calculator`
- `kajabi-fee-calculator`

### Gap found
- No `skool-fee-calculator` directory exists.
- No `skool-fee-calculator` entry exists in `tools/index.html`, `tools/index.md`, `tools/manifest.json`, or `_data/tools-list.json`.
- No existing local tool mentions “Skool” in adjacent membership/comparator tools checked.

## Why Skool is a good P1 target
1. **Clear monetization intent**: users search for “Skool pricing”, “Skool fees”, “Skool 2.9% + 30c”, “Skool Hobby vs Pro”.
2. **Useful for creators / indies**: community/course builders deciding whether to stay on Hobby or upgrade to Pro.
3. **Low overlap**: the repo already covers Patreon/Memberful/Stan/Substack, but not Skool.
4. **Formula clarity**: Skool publishes pricing and payment FAQ details clearly enough for a deterministic calculator.

## Pricing / formula sources

### Source 1 — Official Skool pricing page
URL: `https://www.skool.com/pricing`
Fetched via `web_fetch` on 2026-03-27.

Key facts captured:
- Hobby: `$9/month`
- Pro: `$99/month`
- Annual billing headline: `2 months free`
- Hobby transaction fee: `10%`
- Pro transaction fee: `2.9%`

Interpretation for calculator:
- Model annual billing as a monthly equivalent with 10 paid months / 12 months.
- Use Hobby and Pro fixed monthly cost plus transaction-fee logic in the calculator.

### Source 2 — Official Skool Payments FAQ
URL: `https://help.skool.com/article/86-subscriptions-faq`
Fetched via `web_fetch` on 2026-03-27.

Key facts captured:
- **Pro plan**
  - `2.9% + 30c / transaction` up to `$899`
  - `3.9% + 30c / transaction` above `$900`
- **Hobby plan**
  - `10% + 30c / transaction` for all transactions
- Transaction limit: up to `$100,000 USD` per charge
- All subscription prices are in `USD`
- Skool is merchant of record and handles EU VAT / sales tax
- Payouts are generally weekly

Interpretation for calculator:
- Core fee model should be based on **per-charge price** and **billed member count**.
- VAT should be informational only, not modeled as a creator expense, because Skool adds/remits it as merchant of record.
- Refund handling is not fully specified for fee reversals, so the calculator should treat refund loss conservatively as a separate drag line item.

## Product decision
Chosen tool: **Skool Fee Calculator**

### Decision rationale
A narrow Skool-focused calculator is better than a broad “community platform comparator” for this slot because:
- it matches a clear search intent,
- avoids overlap with the existing generic membership comparator,
- and can add a specific insight competitors often miss: **the Hobby → Pro upgrade break-even point**.

## v1 modeling choices
1. Inputs are based on a billed period (monthly planning view):
   - subscription price
   - billed members this period
   - refund rate
   - Skool plan tier
   - Skool billing mode (monthly vs annual equivalent)
   - other monthly operating cost
   - desired monthly net profit
2. Output should include:
   - gross sales
   - Skool transaction fees
   - refund loss
   - fixed Skool plan cost
   - take-home after Skool
   - monthly net profit
   - break-even billed members
   - required billed members for target profit
   - Hobby vs Pro comparison
   - upgrade break-even gross / member threshold
3. Non-goals for v1:
   - currency localization
   - tax jurisdiction modeling
   - failed-payment retry modeling
   - historical cohort retention / churn simulation

## Confidence and caveats
- Confidence is high on fixed plan price and transaction-fee formulas because they come from official Skool pages.
- Confidence is moderate on annual-plan monthly-equivalent modeling because the public pricing page says “2 months free” but does not expose a separate annual SKU number in the fetched text; using `10/12` monthly-equivalent is the cleanest faithful interpretation.
- Refund fee reversals are not modeled because the FAQ does not specify exact treatment. Conservative choice: subtract refund loss separately while keeping transaction fees on billed volume.
