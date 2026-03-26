# Red Team — SubscribeStar Fee Calculator

## Attack 1
This is too close to Patreon/Memberful/Ko-fi and adds little net-new value.

## Response
- Query intent is exact-match platform-specific.
- Repo has no SubscribeStar slug today.
- Official fee mechanics differ in useful ways:
  - creator vs subscriber processing model
  - fee variability range
  - international surcharge
  - rolling reserve cash hold

## Attack 2
SubscribeStar fee variability means any default math could mislead users.

## Response
- Defaults are explicitly labeled as public baselines.
- Every sensitive fee is editable.
- The UI exposes multiple presets plus custom override.
- Payout drag is never hard-coded as one official fee.

## Attack 3
Reserve hold is not a true expense, so including it in “net” could confuse users.

## Response
- The tool will separate `cash available now` from `economic net after reserve release`.
- Copy will state that reserve is timing drag, not permanent loss.

## Attack 4
Break-even math can fail when average charge amount changes with scale.

## Response
- The tool will state the constant-average-charge assumption explicitly.
- Break-even outputs return `null` when contribution math becomes invalid.

## Decision
Ship.
