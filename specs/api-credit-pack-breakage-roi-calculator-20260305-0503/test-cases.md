# Test Cases — api-credit-pack-breakage-roi-calculator

## Validation
1. Reject when target adoption is lower than current adoption.
2. Reject non-finite numeric input.

## Economic behavior
3. Higher target adoption increases incremental buyers and incremental contribution.
4. Higher breakage (with fixed price/cost) increases net contribution per buyer.
5. Higher monthly program cost lowers net monthly benefit.

## Edge behavior
6. Break-even adoption should be non-finite when per-buyer contribution is non-positive.

## Output quality
7. Summary includes snapshot header, net monthly benefit, break-even adoption, and status.
