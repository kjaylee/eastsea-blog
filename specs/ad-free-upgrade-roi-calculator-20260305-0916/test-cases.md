# Test Cases — ad-free-upgrade-roi-calculator

## Input validation
- Reject non-numeric or negative MAU, costs, or analysis months.
- Reject percent inputs outside 0–100.

## Model behavior
- Increasing attach rate increases ad-free subscribers and net monthly benefit (when contribution > 0).
- Increasing platform fee decreases net contribution per subscriber.
- Setting ad-free price equal to lost ad ARPU + service cost yields near-zero contribution per subscriber.

## Edge cases
- If net contribution per subscriber <= 0, break-even attach rate should show as not reachable.
- If net monthly benefit <= 0, payback should show as “No payback”.

## UI/UX
- Mobile width renders single column layout with readable inputs.
- Copy summary button copies populated summary text.
