# Red Team — LaunchPass Fee Calculator

- [공격 1]: A generic “creator fee” page would overlap too much with existing Patreon/Ko-fi/Memberful tools and waste this heartbeat cycle.
- [공격 2]: Refund handling is easy to model incorrectly. LaunchPass docs say refunds still lose both the Stripe fee and the LaunchPass fee.
- [공격 3]: Rebuilding discovery files wholesale risks noisy diffs and duplicate slugs.
- [공격 4]: Break-even math can become misleading if flat processor fees are not converted into a unit-rate assumption using the current average charge amount.

- [방어/완화]:
  - Use the exact slug `launchpass-fee-calculator` and keep the page tightly platform-specific.
  - Encode refund behavior explicitly in formulas and tests.
  - Patch the four required discovery files surgically instead of regenerating them.
  - Return `null` for break-even and target outputs when contribution margin is non-positive.

- [합의]: 🟢극복

## Failure scenarios to watch
1. If the exact-match query already existed locally, abort and pick a different slug. Repo scan confirmed it does not.
2. If manifest edits become messy, patch only the single alphabetical insertion point.
3. If localhost smoke is blocked, record the blocker in `verification.md` instead of hand-waving.
