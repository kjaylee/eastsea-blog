# Test Cases — Shipping Protection Attach Rate ROI Calculator

1. **Happy path**
   - Inputs: monthlyOrders=12000, currentAttach=2.2, targetAttach=5.5, price=2.4, claimRate=0.8, avgPayout=18, paymentFee=3, supportCost=1.2, platformFeePerOrder=0.2, monthlyPlatformFee=500, setup=6000, months=12.
   - Expect: positive incremental monthly net, finite payback months, status strong or watch.

2. **Unprofitable scenario**
   - Inputs: claimRate=6, avgPayout=40, price=1.5, targetAttach=3.
   - Expect: periodNetBenefit <= 0, status risky, payback = No payback.

3. **Zero setup cost**
   - Inputs: oneTimeSetupCost=0.
   - Expect: ROI shows ∞ when periodNetBenefit > 0, payback months = 0 or No payback depending on incremental net.

4. **Break-even unreachable**
   - Inputs: very high claim rate and payout with low price so even 100% attach rate is negative.
   - Expect: break-even target attach rate shows “Not reachable”.
