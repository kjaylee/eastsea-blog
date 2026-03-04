# Test Cases — battle-pass-attach-rate-roi-calculator

1. Validation rejects target attach rate below current attach rate.
2. Validation rejects non-finite input.
3. Higher target attach rate increases incremental buyers and monthly net lift.
4. Higher reward cost per buyer lowers net contribution and net lift.
5. Higher monthly ops cost lowers monthly net lift and ROI.
6. Break-even target attach rate becomes non-finite when net per buyer is non-positive.
7. Summary output includes monthly net lift, ROI, payback, break-even, status.
