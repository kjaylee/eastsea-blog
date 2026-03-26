# Gap Analysis — SubscribeStar Fee Calculator

## Pre-implementation gaps
- No exact-match SubscribeStar monetization tool in the repo.
- No discovery entry in the four required catalog surfaces.
- No platform-specific calculator covering creator-vs-subscriber processing and rolling reserve in one place.

## Risks to watch
- Fee variability can create false precision.
- Reserve semantics are not identical to permanent costs.
- Payout fees are method-dependent and must remain editable.

## Acceptance bar
- Exact-match slug shipped once across all discovery surfaces.
- Public assumptions disclosed clearly.
- Math is deterministic and covered by tests.
- Local smoke attempted and blockers documented if any.
