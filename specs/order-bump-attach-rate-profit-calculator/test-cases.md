# Test Cases — Order Bump Attach Rate Profit Calculator

## Validation
1. Reject non-finite input (NaN, empty) → error message and empty outputs.
2. targetAttachRatePct < currentAttachRatePct → error.
3. Negative costs or rates outside bounds → error.

## Calculation sanity
4. Zero setup cost + positive incremental monthly net → ROI = ∞, payback = 0 or finite.
5. Incremental monthly net <= 0 → payback “No payback”, status risky.
6. refundRatePct = 0 → refund loss = 0.
7. monthlyToolCost > 0 applied only to target scenario (difference visible in incremental net).

## UX
8. Copy Summary button copies populated summary text.
9. Reset Defaults restores initial inputs and re-renders.
10. Mobile width (<940px) stacks inputs in one column.
