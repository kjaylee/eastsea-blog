# Research — Buy Me a Coffee Fee Calculator

## Goal
Select one next unshipped, high-opportunity creator-monetization tool for `eastsea-blog` and de-risk it through the required build gate artifacts before implementation.

## First-party backlog evidence
The strongest catalog-gap candidate is `buy-me-a-coffee-fee-calculator`.

Current repo state for this exact slug:
- `tools/index.html`: **1** existing tool card already promises the page.
- `tools/index.md`: **1** existing markdown list item already promises the page.
- `_data/tools-list.json`: **1** existing URL entry already promises the page.
- `tools/buy-me-a-coffee-fee-calculator/`: **missing**.
- `tools/manifest.json`: **0** entries for this slug.
- `specs/**/*.md`: **0** prior mentions.

Conclusion: this is not a brainstormed idea. It is an already-advertised first-party backlog gap that has not actually been shipped.

## Why this candidate won
### 1) It matches the current P1 priority exactly
The task explicitly biases toward **creator monetization / fee / pricing / payout calculators**. Buy Me a Coffee is a direct creator monetization platform, and the tool angle is pure fee / payout / take-home math.

### 2) It has stronger first-party evidence than a net-new idea
`buy-me-a-coffee-fee-calculator` is already present in catalog surfaces but lacks the actual tool directory and manifest entry. That makes it a cleaner P1 than inventing a new slug.

### 3) It is simpler than nearby unshipped alternatives
Nearby missing creator-economy slugs include:
- `ko-fi-fee-calculator`
- `payhip-fee-calculator`
- `kajabi-fee-calculator`
- `podia-fee-calculator`
- `teachable-fee-calculator`
- `substack-newsletter-revenue-calculator`

Why Buy Me a Coffee wins this round:
- simpler pricing model than Kajabi / Podia / Teachable / Payhip tier matrices
- cleaner official fee facts than Ko-fi’s multi-product-mode complexity
- less overlap than `substack-newsletter-revenue-calculator`, because `tools/substack-fee-calculator/` already exists
- one strong static slice with obvious buyer intent: “what do I actually keep?”

### 4) It fits the existing shipped cluster
Already shipped adjacent creator-fee / take-home tools in the repo include:
- `gumroad-net-revenue-calculator`
- `memberful-fee-calculator`
- `lemon-squeezy-fee-calculator`
- `creator-membership-platform-fee-comparator`
- `patreon-net-revenue-calculator`

So the site already has a monetization cluster. This candidate extends that cluster without needing backend work.

## Official source facts to model
### Buy Me a Coffee fee article
Source: `https://help.buymeacoffee.com/en/articles/8105744-how-to-calculate-charges-on-your-payment`

Observed facts:
- No monthly fee.
- Platform fee is **5% per transaction**.
- Stripe processing baseline is **2.9% + $0.30** per successful transaction.
- Stripe payout processing adds **0.5%**.
- Creators can choose whether to cover the card fee themselves or pass it through to supporters.

### Buy Me a Coffee credit-card-fee toggle article
Source: `https://help.buymeacoffee.com/en/articles/8105320-how-to-eliminate-the-credit-card-fee-from-your-earnings`

Observed facts:
- When the creator enables the setting, supporters can cover the card fee.
- Example in the help doc shows a supporter paying more than the face contribution so the creator’s intended contribution amount is preserved.
- This creates a clear high-value calculator angle: compare creator-covered vs supporter-covered processing drag.

### Buy Me a Coffee payout timing article
Source: `https://help.buymeacoffee.com/en/articles/9770774-understanding-your-payouts-on-buy-me-a-coffee-through-stripe-express`

Observed facts:
- First payout may take **7–14 days**.
- Subsequent payouts generally process within **1–2 business days** after reaching Stripe, then typically **3–5 business days** to bank after transfer.
- These are informational notes, not core calculator math.

## Recommended product shape
Ship a static single-page calculator focused on monthly creator take-home for support / donation style revenue.

### Core inputs
- monthly transaction count
- average support amount
- whether supporters cover card fee
- platform fee % (default 5)
- card processing rate % (default 2.9)
- card processing fixed fee (default 0.30)
- payout processing rate % (default 0.5)
- reward / fulfillment cost per transaction
- other fixed monthly cost
- desired monthly net profit

### Core outputs
- creator-priced support volume
- actual supporter charge total
- platform fee total
- card processing fee total
- payout drag total
- reward / fulfillment cost total
- take-home before operating costs
- monthly net profit
- effective creator fee drag
- break-even average support amount
- required average support amount for target monthly net
- delta between “creator covers card fee” vs “supporter covers card fee”
- copyable summary block

## Calculation assumptions
### Scenario A — creator covers card fee
Definitions:
- `gross = transactionCount * averageSupportAmount`
- `platformFees = gross * platformFeeRate`
- `processingFees = gross * processingRate + transactionCount * processingFixedFee`
- `prePayoutTakeHome = gross - platformFees - processingFees`
- `payoutFees = prePayoutTakeHome * payoutRate`
- `takeHomeBeforeOperatingCosts = prePayoutTakeHome - payoutFees`
- `rewardCosts = transactionCount * rewardCostPerTransaction`
- `monthlyNetProfit = takeHomeBeforeOperatingCosts - rewardCosts - otherMonthlyCost`

### Scenario B — supporter covers card fee
Reverse-price the supporter total so that card processing no longer reduces the creator’s intended contribution base.

Definitions:
- `gross = transactionCount * averageSupportAmount`
- `supporterChargeTotal = (gross + transactionCount * processingFixedFee) / (1 - processingRate)`
- `processingFees = supporterChargeTotal * processingRate + transactionCount * processingFixedFee`
- creator receives `gross` after card processing
- `platformFees = gross * platformFeeRate`
- `prePayoutTakeHome = gross - platformFees`
- `payoutFees = prePayoutTakeHome * payoutRate`
- `takeHomeBeforeOperatingCosts = prePayoutTakeHome - payoutFees`
- `rewardCosts = transactionCount * rewardCostPerTransaction`
- `monthlyNetProfit = takeHomeBeforeOperatingCosts - rewardCosts - otherMonthlyCost`

### Break-even / target average support amount
With transaction count held constant:

If creator covers card fee:
- `breakEvenAvgSupport = (otherMonthlyCost + rewardCosts + transactionCount * processingFixedFee * (1 - payoutRate)) / (transactionCount * (1 - platformFeeRate - processingRate) * (1 - payoutRate))`
- `targetAvgSupport = (desiredMonthlyNetProfit + otherMonthlyCost + rewardCosts + transactionCount * processingFixedFee * (1 - payoutRate)) / (transactionCount * (1 - platformFeeRate - processingRate) * (1 - payoutRate))`

If supporter covers card fee:
- `breakEvenAvgSupport = (otherMonthlyCost + rewardCosts) / (transactionCount * (1 - platformFeeRate) * (1 - payoutRate))`
- `targetAvgSupport = (desiredMonthlyNetProfit + otherMonthlyCost + rewardCosts) / (transactionCount * (1 - platformFeeRate) * (1 - payoutRate))`

Return `null` for break-even / target outputs when transaction count is zero or the denominator is non-positive.

## UX implications
- This should be a compact bilingual calculator, not a long-form pricing explainer.
- The cover-card-fee toggle is the centerpiece because it changes actual creator economics.
- Include a concise note that rates are editable because platform and processor policies can change.
- Include a short informational payout note, but do not over-model payout scheduling in the math.

## Internal implementation references
Useful internal patterns to reuse in a future implementation run:
- `tools/memberful-fee-calculator/` — deterministic calculator module + exact-once catalog testing style
- `tools/gumroad-net-revenue-calculator/` — bilingual summary/output framing
- `tools/patreon-net-revenue-calculator/` — fee-preset and editable-assumption pattern

## Chosen slug
`buy-me-a-coffee-fee-calculator`

## Decision
This is the best next P1 slice because it is already promised in EastSea’s catalog, directly matches the monetization priority, has simple official fee facts, and is ready for a low-risk implementation pass.