# Spec — Skool Fee Calculator

## Summary
Build a static calculator page at `tools/skool-fee-calculator/` that helps creators estimate real Skool take-home and decide whether Hobby or Pro is the better plan under their current pricing and member count.

## Primary user
- Creator / coach / indie educator running or planning a paid Skool community
- Already comparing Skool Hobby vs Pro economics
- Wants fast fee clarity, not a generic finance worksheet

## User stories
1. As a creator, I want to enter my Skool subscription price and billed members so I can see monthly gross sales and take-home.
2. As a creator, I want Hobby vs Pro compared side by side so I can decide which plan keeps more net profit.
3. As a creator, I want to include refunds and other operating costs so the output is closer to reality.
4. As a creator, I want to know the member-count or gross-sales threshold where Pro starts beating Hobby.
5. As a creator, I want a copyable summary I can paste into notes or planning docs.

## Page requirements
- Static HTML page with responsive layout
- No external build step required for the page itself
- `calculator.js` must export a pure API for deterministic Node tests
- Include canonical, description, OG/Twitter metadata, and WebApplication schema
- Include back link to `/tools/`
- Include related links to adjacent creator tools

## Inputs
- `subscriptionPrice` (USD, > 0, <= 100000)
- `billedMembers` (positive integer)
- `refundRatePct` (0 <= x < 100)
- `planTier` (`hobby` | `pro`)
- `planBilling` (`monthly` | `annual`)
- `otherMonthlyCost` (>= 0)
- `desiredMonthlyNetProfit` (>= 0)

## Official fee rules to model
### Hobby
- Fixed cost: `$9/month`
- Annual equivalent: 10 paid months / 12 = `$7.50/month` equivalent
- Transaction fee: `10% + $0.30 per transaction`

### Pro
- Fixed cost: `$99/month`
- Annual equivalent: 10 paid months / 12 = `$82.50/month` equivalent
- Transaction fee:
  - `2.9% + $0.30` when price is below `$900`
  - `3.9% + $0.30` when price is `>= $900` for v1 threshold handling

## Calculation rules
### Base values
- `monthlyGrossSales = subscriptionPrice * billedMembers`
- `refundLoss = monthlyGrossSales * refundRate`
- `transactionFees = monthlyGrossSales * transactionRate + billedMembers * 0.30`
- `takeHomeAfterSkool = monthlyGrossSales - refundLoss - transactionFees - planFixedFee`
- `monthlyNetProfit = takeHomeAfterSkool - otherMonthlyCost`
- `annualizedNetProfit = monthlyNetProfit * 12`

### Per-member contribution
- `contributionPerMember = subscriptionPrice * (1 - refundRate - transactionRate) - 0.30`

### Break-even members
- `breakEvenMembers = (planFixedFee + otherMonthlyCost) / contributionPerMember`
- Return `null` when contribution is `<= 0`

### Required members for target monthly net
- `requiredMembersForTargetNet = (planFixedFee + otherMonthlyCost + desiredMonthlyNetProfit) / contributionPerMember`
- Return `null` when contribution is `<= 0`

### Hobby → Pro upgrade threshold
Compare Hobby and Pro using the same selected billing mode and current subscription price.

Because refund rate, other monthly costs, and flat fee per transaction are identical across both tiers, the simplified gross threshold is:
- `upgradeBreakEvenGross = (proFixedFee - hobbyFixedFee) / (hobbyRate - proRate)`
- `upgradeBreakEvenMembers = upgradeBreakEvenGross / subscriptionPrice`

## Required outputs
### KPI cards
- Monthly gross sales
- Take-home after Skool
- Monthly net profit
- Effective Skool fee rate
- Break-even billed members
- Required billed members for target net

### Detail rows
- Selected plan fixed fee
- Selected transaction rate used
- Skool transaction fees
- Refund loss
- Annualized net profit
- Upgrade break-even gross
- Upgrade break-even billed members
- Target member gap vs current billed members

### Comparison table
For both Hobby and Pro, show:
- Plan label
- Fixed fee
- Transaction rate
- Transaction fees
- Take-home after Skool
- Monthly net profit

### Recommendation
- Recommend whichever plan produces higher monthly net profit under the same inputs

## Discovery wiring requirements
Must wire the slug exactly once into:
- `tools/index.html`
- `tools/index.md`
- `_data/tools-list.json`
- `tools/manifest.json` (via rebuild)

## Non-goals
- No churn simulator
- No member cohort projection
- No localized currencies
- No refund-fee reversal logic beyond conservative refund-loss line item
- No tax / VAT / income-tax calculator

## Done criteria
- Tool page exists and renders locally
- Node tests pass
- Manifest rebuilt and includes the new slug
- Local HTTP check returns 200 for the page
- Verification and gap-analysis artifacts are written
