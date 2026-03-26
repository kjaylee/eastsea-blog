# Red Team

## Main failure modes
- Shipping a Ghost page that is functionally just a Substack clone.
- Baking in stale Ghost(Pro) pricing without telling the user it is editable.
- Forgetting that Ghost(Pro) Starter cannot run paid subscriptions.
- Overstating precision on annual-member cash timing.
- Breaking catalog exact-once wiring.

## Mitigations
- Add Ghost-specific plan presets and Starter rejection logic.
- Keep all fees and plan costs editable.
- Explicitly disclose monthly-equivalent smoothing for annual members.
- Include discovery exact-once assertions in the tool test file.
- Limit edits to the required discovery files only.
