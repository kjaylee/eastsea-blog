# Test Cases — Sellfy Pricing Calculator

## TC-01 Baseline under cap, annual billing
- Plan: Starter annual
- Gross sales: 8,000
- Orders: 200
- Processor: Stripe 2.9% + 0.30
- Refund rate: 5%
- Delivery cost/order: 1.00
- Other annual cost: 500
- Expect:
  - no overage fee
  - positive take-home and net profit
  - average order value = 40

## TC-02 Overage triggers above Starter cap
- Same baseline but gross sales = 15,000
- Expect:
  - overage = 100.00
  - cap headroom negative
  - cost-based recommendation may move to Business depending on billing cycle

## TC-03 Monthly billing is more expensive than annual
- Same inputs, compare Starter monthly vs annual
- Expect monthly subscription cost higher and net profit lower.

## TC-04 PayPal Intl increases processor drag
- Same gross/orders as baseline
- Processor preset = PayPal Intl 3.4% + 0.30
- Expect processor fees > Stripe and net profit < Stripe baseline.

## TC-05 Custom processor override works
- Processor = Custom 4.2% + 0.45
- Expect exact processor fee math and lower take-home than Stripe.

## TC-06 Break-even gross sales is deterministic
- Use baseline inputs
- Expect break-even gross sales > 0 and below Starter cap.

## TC-07 Next-plan break-even revenue is correct
- Starter annual should produce 32,200.00 gross sales as the point where Business annual becomes cheaper than Starter annual + 2% overage.
- Business annual should produce 86,000.00 gross sales as the point where Premium annual becomes cheaper than Business annual + 2% overage.
- Premium should return null.

## TC-08 Validation rejects invalid inputs
- Negative gross sales
- Orders <= 0
- Refund > 100
- Unsupported plan
- Unsupported processor preset
- Custom processor >= 100

## TC-09 Summary contains decision-ready metrics
- Summary includes plan, billing, gross sales, subscription cost, processor fees, overage, take-home, net profit, and recommended plan.

## TC-10 Discovery exact-once wiring
- Slug exists exactly once in:
  - `_data/tools-list.json`
  - `tools/manifest.json`
  - `tools/index.html`
  - `tools/index.md`
  - actual `tools/sellfy-pricing-calculator/` directory
