# Test Cases — SubscribeStar Fee Calculator

## Functional math
1. Baseline creator-covers-average preset returns expected platform fee, processing fee, reserve hold, payout drag, and cash-now output.
2. Subscriber-covers preset zeroes creator-side processing fees.
3. International surcharge increases creator-side percentage fees by 3.5 points.
4. Reserve disabled sets reserve hold to zero and makes cash-now equal economic net minus payout drag and other costs.
5. Break-even gross is positive for a healthy margin scenario.
6. Target gross is above current gross when desired cash exceeds current cash.

## Validation
1. Negative money inputs fail.
2. Negative rates fail.
3. Refund rate at or above 100% fails.
4. Charges count must be a non-negative integer.
5. If gross is positive and charges are zero, break-even and target outputs are null.

## Discovery wiring
1. `tools/index.html` contains the slug exactly once.
2. `tools/index.md` contains the slug exactly once.
3. `_data/tools-list.json` contains the tool URL exactly once.
4. `tools/manifest.json` contains the slug exactly once.

## Smoke
1. Local HTTP request to `/tools/subscribestar-fee-calculator/` returns 200 if localhost smoke is available.
