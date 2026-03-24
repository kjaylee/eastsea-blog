# Research — Whatnot Seller Fee Calculator

Date: 2026-03-19 08:02 KST
Slug candidate: `whatnot-seller-fee-calculator`

## Goal
Ship one new static monetizable tool with clear seller-intent search demand: a Whatnot seller fee / payout / profit calculator.

## Anti-duplication proof
Checked four surfaces before locking the slug.

### 1) `tools/` directory
- Command intent: search tool directory names for `whatnot`
- Result: **zero matches**

### 2) `_data/tools-list.json`
- Checked for: `whatnot`, `whatnot seller fee`, `whatnot fee calculator`, `whatnot seller fees`
- Result: **zero matches**

### 3) `tools/manifest.json`
- Checked for: `whatnot`, `whatnot seller fee`, `whatnot fee calculator`, `whatnot seller fees`
- Result: **zero matches**

### 4) `/Users/kjaylee/.openclaw/workspace/memory/subagent-log.md`
- Checked for: `whatnot`, `whatnot seller fee`, `whatnot fee calculator`, `whatnot seller fees`
- Result: **zero matches today** (and zero direct matches overall in the current file snapshot)

Conclusion: `whatnot-seller-fee-calculator` is currently safe to ship.

## Why this tool
- Strong buyer/seller intent: sellers actively search for payout, fees, and profitability before listing.
- Commercial adjacency: marketplace sellers are high-intent users for monetization, SaaS, inventory, and shipping offers.
- Deterministic math with public-fee signals reduces hallucination risk.
- Fits EastSea’s existing proven cluster: marketplace fee calculators monetize well and convert reliably.

## Evidence / public source snippets
Using search-result snippets from official Whatnot help pages because direct fetch is Cloudflare-blocked.

1. Official help center result: **Whatnot Seller Fees and Commissions Schedule**
   - Snippet states a payment processing fee is calculated on the **total order value**.
   - Snippet states this **includes final item price + shipping + buyer-paid tax**.

2. Official help center result: **Marketplace-Only Sellers FAQs**
   - Snippet states marketplace listings use the same fees as live selling.
   - Snippet states **8% commission on sold price** and **2.9% + 30 cents/pence payment processing per transaction**.

3. Official help center result: **Reduced Commission on Electronics**
   - Snippet states Electronics commission is **5%** plus usual processing fee.

4. Official help center result: **Reduced Commission on Coins & Money**
   - Snippet states Coins & Money commission is **4%** plus usual processing fee.

5. Official help center result: **Seller Coupon Terms & Conditions**
   - Snippet states commission and processing apply to the **final sale price** where a coupon is applied.
   - Product implication: calculator should ask for the effective sold price, not pre-coupon sticker price.

## Product scope decisions
- Model **US baseline** only for clarity and determinism.
- Use these presets:
  - Standard: 8%
  - Electronics: 5%
  - Coins & Money: 4%
  - Custom: manual override
- Processing fee formula: `2.9% * (sale price + buyer shipping + buyer tax) + $0.30`
- Commission formula: `commissionRate * sale price`
- Treat buyer-paid shipping as part of processing base, **not seller revenue** in the estimator.
- Add optional seller-side shipping subsidy / free-shipping cost as a separate expense.

## Core outputs
- Commission fee
- Processing fee
- Total Whatnot fees
- Payout after Whatnot fees
- Net profit after seller costs
- Net margin %
- Effective fee rate %
- Break-even sale price
- Max seller-paid shipping subsidy before loss
- Max item cost before loss

## UX constraints
- Single static page with local JS only
- Fast mobile-first layout
- English/Korean toggle
- Copyable summary
- Clear assumptions / scope note

## Risks
- Whatnot fee programs can change by category or promotion.
- High-value promotional reduced-commission programs exist, but are temporary / conditional.
- To stay deterministic, v1 will exclude temporary promotions and position itself as a US-baseline estimator.
