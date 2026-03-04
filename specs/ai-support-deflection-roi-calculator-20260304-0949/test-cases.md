# Test Cases — ai-support-deflection-roi-calculator

## Validation
1. Reject when `targetDeflectionPct < currentDeflectionPct`.
2. Reject non-finite inputs (e.g., NaN for ticket volume).

## Economic behavior
3. Higher target deflection should increase incremental deflected tickets and labor hours saved.
4. Higher monthly ticket volume should increase gross labor savings (all else constant).
5. Higher AI cost per deflected ticket should increase total program cost and reduce net benefit.

## Edge behavior
6. When AI variable cost per ticket exceeds labor value per deflected ticket, break-even target should be non-finite.

## Output quality
7. Summary text should include net monthly benefit, payback, and status fields.
