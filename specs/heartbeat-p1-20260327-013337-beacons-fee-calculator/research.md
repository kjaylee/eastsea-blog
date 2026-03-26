# Research — Beacons Fee Calculator

Date: 2026-03-27
Slug candidate: `beacons-fee-calculator`

## Goal
Ship one new exact-match creator monetization tool with low internal overlap and clear user intent: a Beacons store fee calculator for creators comparing 9% seller-fee plans against 0%-seller-fee paid plans.

## Discovery surfaces checked

### 1) Existing repo inventory
- `tools/` directory search for `beacons` returned zero existing tool directories.
- `_data/tools-list.json` search for `beacons` returned zero tool entries.
- `tools/index.html` and `tools/index.md` search for `beacons` returned zero discovery cards.
- `tools/manifest.json` search for `beacons` returned zero manifest entries.

Conclusion: the slug is new inside this repo and safe to add.

### 2) Nearby overlap review
Reviewed adjacent creator monetization tools already present in the repo:
- `tools/ko-fi-fee-calculator/`
- `tools/buy-me-a-coffee-fee-calculator/`
- `tools/gumroad-net-revenue-calculator/`
- `tools/memberful-fee-calculator/`
- `tools/sellfy-pricing-calculator/`
- `tools/onlyfans-earnings-calculator/`

Overlap is low because none of those tools model Beacons’ specific plan ladder, seller-fee changes, or affiliate-share handling.

### 3) External discovery surfaces
Searches run:
- `"Beacons fee calculator"`
- `"beacons store fees"`
- `"Beacons pricing"`
- `"how much did I pay in store fees" Beacons`

Observed pattern:
- Results were dominated by official Beacons pricing/help pages instead of a strong calculator SERP cluster.
- That is a workable gap for an exact-match utility page because the intent is explicit but the utility format is under-served.

## Source-backed assumptions

### Official Beacons pricing
Source: `https://beacons.bio/i/plans`
- Free plan shows `9% seller fees`.
- Creator plan shows `$10/mo` or `$100 billed annually`.
- Creator Plus shows `$30/mo` or `$300 billed annually`.
- Creator Max shows `$90/mo` or `$900 billed annually`.
- Creator Plus and Creator Max show `0% seller fees`.

### Official Beacons help on fee structure
Source: `https://help.beacons.ai/en/articles/4700097`
- Beacons states there are two fee types in store orders:
  - Beacons Store fee
  - payment processor transaction fee

### Official Beacons store marketing page
Source: `https://beacons.bio/i/app-pages/store`
- Confirms Store Free takes `9% transaction fee`.
- Confirms creators can upgrade to a paid tier to avoid platform fees.

### Official PayPal US pricing
Source: `https://www.paypal.com/us/business/pricing`
- Public baseline for PayPal/Venmo checkout currently shows `3.49% + $0.49` per transaction in USD.

## Product decision
Choose `beacons-fee-calculator`.

Why:
- Exact platform intent.
- Clear monetization utility.
- Lower overlap than another generic revenue/ROI calculator.
- Strong internal fit with the repo’s creator monetization cluster.

## Scope for v1
- Model Beacons store plans only.
- Model Beacons fee rate by plan.
- Model Stripe and PayPal processor presets plus custom override.
- Include optional affiliate-share rate because Beacons creators often sell through affiliates.
- Include refunds as an editable approximation.
- Output take-home, effective drag, break-even gross sales, and plan comparison.

## Out of scope
- Taxes/VAT/GST.
- Multi-currency logic beyond USD formatting.
- Chargebacks and payout-delay cash timing.
- Product-level order-bump funnels or membership churn modeling.

