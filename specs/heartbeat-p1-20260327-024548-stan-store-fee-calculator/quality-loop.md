# Quality Loop — Stan Store Fee Calculator

## Pass 1 — Opportunity filter
- Does the slug have exact-match intent? Yes.
- Is there a Stan-specific page already? No.
- Is overlap with adjacent tools acceptable? Yes.

## Pass 2 — Formula sanity
- Keep Stan fee at `0%`
- Separate plan fee from processor fee
- Model Pro-only uplift explicitly, not implicitly
- Keep refund handling upstream of take-home outputs

## Pass 3 — UX clarity
- Explain what Creator and Creator Pro change
- Keep advanced assumptions editable but secondary
- Show winner, delta, and break-even above the fold

## Pass 4 — QA bar
- Deterministic baseline fixture
- Deterministic break-even fixture
- Validation coverage
- Exact-once discovery coverage
- Manual page smoke

## Ship rule
Do not claim completion until:
- logic exists,
- tests pass,
- discovery counts are exact-once,
- and any localhost or git blockers are recorded explicitly.
