# Research — Lemon Squeezy Fee Calculator

## Goal
Ship one net-new, high-intent static calculator in `eastsea-blog/` that targets creators searching for Lemon Squeezy fee math and payout take-home estimates.

## Why this tool
- Search intent is commercial and immediate: creators want to know what Lemon Squeezy fees do to take-home.
- Repo review shows adjacent tools exist for Gumroad, Patreon, PayPal, and Merchant of Record comparisons, but no dedicated Lemon Squeezy calculator exists yet.
- Lemon Squeezy has a public fee model with enough deterministic rules to support a static browser-only calculator.

## Files and sources reviewed before implementation
### Workspace / repo files
- `/Users/kjaylee/.openclaw/workspace/AGENTS.md`
- `/Users/kjaylee/.openclaw/workspace/SOUL.md`
- `/Users/kjaylee/.openclaw/workspace/tools/index.md`
- `/Users/kjaylee/.openclaw/workspace/eastsea-blog/tools/index.html`
- `/Users/kjaylee/.openclaw/workspace/eastsea-blog/tools/index.md`
- `/Users/kjaylee/.openclaw/workspace/eastsea-blog/tools/manifest.json`
- `/Users/kjaylee/.openclaw/workspace/eastsea-blog/_data/tools-list.json`
- `/Users/kjaylee/.openclaw/workspace/eastsea-blog/tools/gumroad-net-revenue-calculator/index.html`
- `/Users/kjaylee/.openclaw/workspace/eastsea-blog/tools/gumroad-net-revenue-calculator/calculator.js`
- `/Users/kjaylee/.openclaw/workspace/eastsea-blog/tools/gumroad-net-revenue-calculator/calculator.test.js`
- `/Users/kjaylee/.openclaw/workspace/eastsea-blog/tools/merchant-of-record-vs-direct-billing-profit-calculator/tool.config.json`
- `/Users/kjaylee/.openclaw/workspace/eastsea-blog/tools/merchant-of-record-vs-direct-billing-profit-calculator/tests/behavior.test.js`
- `/Users/kjaylee/.openclaw/workspace/eastsea-blog/tools/merchant-of-record-vs-direct-billing-profit-calculator/tests/catalog.test.js`
- `/Users/kjaylee/.openclaw/workspace/specs/kickstarter-net-proceeds-calculator-20260312/spec.md`
- `/Users/kjaylee/.openclaw/workspace/specs/kickstarter-net-proceeds-calculator-20260312/plan.md`

### External sources consulted
- Lemon Squeezy help docs: `https://docs.lemonsqueezy.com/help/getting-started/fees`
- Lemon Squeezy pricing page: `https://www.lemonsqueezy.com/pricing`

## Verified product gap
Observed from repo inspection:
- `tools/index.html` already links to Gumroad, Patreon, PayPal, Itch.io, Substack, Shopify App Store, and MoR-vs-direct calculators.
- No existing directory or catalog entry for `lemon-squeezy-fee-calculator` was found before implementation.
- This keeps the tool distinct from:
  - `gumroad-net-revenue-calculator` (direct vs Discover split)
  - `merchant-of-record-vs-direct-billing-profit-calculator` (platform choice / ops stack comparison)
  - `paypal-fee-calculator` (payment processor reverse-fee math)

## Fee model distilled from Lemon Squeezy docs
Public docs currently state:
- base platform fee applies to total order value
- additional fees may apply:
  - `+1.5%` for international transactions
  - `+1.5%` for PayPal transactions
  - `+0.5%` for subscription payments
- example math uses tax-inclusive total order value when computing platform fees
- payout fees depend on payout method and region:
  - Stripe / US bank: free
  - Stripe / non-US bank: `1%` per payout
  - PayPal / US: `$0.50` per payout
  - PayPal / non-US: `3%` capped at `$30` per payout`
- marketing features can add fees such as abandoned cart recovery or affiliate referrals, so an optional extra fee rate is reasonable.

## Product decision
Build:
- `eastsea-blog/tools/lemon-squeezy-fee-calculator/`

Core promise:
- estimate customer total, platform fees, payout fees, creator take-home, effective take-home rate, and target list price required to net a desired amount after payout.

## Formula strategy
Use deterministic static formulas only.

### Forward calculation
Let:
- `n = orderCount`
- `p = listPrice`
- `t = taxRate / 100`
- `r = combinedPlatformRate / 100`
- `f = platformFixedFee`

Then:
- `taxAmountPerOrder = p * t`
- `customerTotalPerOrder = p + taxAmountPerOrder`
- `platformFeePerOrder = customerTotalPerOrder * r + f`
- `netBeforePayoutPerOrder = customerTotalPerOrder - taxAmountPerOrder - platformFeePerOrder`
- `periodCustomerBillings = customerTotalPerOrder * n`
- `periodTaxCollected = taxAmountPerOrder * n`
- `periodPlatformFees = platformFeePerOrder * n`
- `periodNetBeforePayout = netBeforePayoutPerOrder * n`

### Payout fee handling
- Stripe / US: `0`
- Stripe / intl: `periodNetBeforePayout * 0.01`
- PayPal / US: `payoutCount * 0.50`
- PayPal / intl: `payoutCount * min((periodNetBeforePayout / payoutCount) * 0.03, 30)`

### Reverse pricing
Tool will solve for the list price needed to reach a desired net amount **after payout** per order under the current assumptions. Because payout rules are piecewise-linear, this can be solved deterministically without iterative search.

## UX requirements derived from research
- bilingual copy (English default, Korean toggle)
- strong note that taxes are not creator revenue and defaults can change
- one-click summary copy
- responsive static page following existing EastSea calculator pattern
- testable pure calculator API exported for Node tests and browser initialization

## Verification requirements
Planned verification commands:
- `node --check` on calculator JS
- `node --test` on the tool test file
- local HTTP serve + `curl` smoke check
- deterministic JSON/catalog assertions for `tools/index.html`, `tools/index.md`, `tools/manifest.json`, `_data/tools-list.json`
