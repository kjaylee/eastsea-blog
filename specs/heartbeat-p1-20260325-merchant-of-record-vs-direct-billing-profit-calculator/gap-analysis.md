# Gap Analysis — Merchant of Record vs Direct Billing Profit Calculator

## Closed in this implementation
- shipped the missing promised page at `/tools/merchant-of-record-vs-direct-billing-profit-calculator/`
- created deterministic calculator logic with Node-friendly exports
- added test coverage for both golden fixtures plus edge handling
- added exactly one manifest entry and corrected manifest declared count
- preserved exact-once references in:
  - `tools/index.html`
  - `tools/index.md`
  - `_data/tools-list.json`
  - sibling chip inside `app-store-vs-web-checkout-profit-calculator`

## Remaining gaps
### Product-model limits
v1 is still a planning calculator, not a provider-quote engine. It does **not** model:
- country-specific VAT/GST rules
- reverse-charge / B2B exemptions
- processor-specific refund fee clawbacks
- FX spread / payout delay / reserve timing
- provider-specific dispute coverage nuance

### Repo-level limits
The repo still has unrelated catalog debt:
- many `tools_list_missing_entries`
- stale landing-page count claims
- many tools missing analytics/meta description

Those were intentionally not touched in this slice.

## Biggest residual risk
The main remaining risk is false precision.
A user may mistake editable blended inputs for universal provider truth.

Mitigation already applied:
- hero notice explicitly frames this as an editable planning model
- all fee and burden assumptions remain user-editable
- output language stays comparative and operator-facing, not legal/accounting advice

## Shipped acceptance status
- page created: yes
- calculator engine created: yes
- deterministic tests created: yes
- manifest exact-once entry: yes
- verification run: yes
- local HTTP smoke: yes

## Next safe move
If the queue wants the next monetization slice immediately, pick another `tools-list.json` promised-but-missing fee/profit calculator and repeat the same narrow pattern.

Candidates still missing and monetization-aligned:
- `airbnb-host-fee-calculator`
- `amazon-handmade-fee-calculator`
- `kajabi-fee-calculator`
- `payhip-fee-calculator`
- `teachable-fee-calculator`
- `upwork-freelancer-fee-calculator`

## What not to do next
- do not broaden this slice into catalog cleanup
- do not bulk-regenerate discovery surfaces
- do not claim provider-specific legal/tax accuracy beyond editable planning assumptions
