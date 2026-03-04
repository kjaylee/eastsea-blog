# Test Cases — premium-support-attach-rate-roi-calculator

## Validation
1. Reject when target attach rate is lower than current attach rate.
2. Reject non-finite numeric input.

## Economic behavior
3. Increasing target attach rate increases incremental attached accounts and add-on gross profit.
4. Increasing monthly fixed program cost lowers net monthly benefit.
5. Increasing churn reduction increases retention gross profit and net monthly benefit.

## Edge behavior
6. Break-even attach rate is non-finite when unit economics denominator is non-positive.

## Output quality
7. Summary text includes ROI snapshot title, net monthly benefit, break-even attach rate, and status.
