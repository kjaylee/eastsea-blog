# Red Team — Buy Me a Coffee Fee Calculator

🔴 Red Team:
- [공격 1]: The official help text is simple, but payout and processor behavior can vary by country and policy updates. A rigid calculator could become wrong fast and damage trust.
- [공격 2]: The “supporter covers card fee” path can be modeled incorrectly if we treat the extra supporter charge like normal creator revenue instead of a reverse-priced processor pass-through.
- [공격 3]: If we try to model memberships, commissions, shop products, taxes, or payout calendars in the same slice, scope will sprawl and the page will stop being a clean static P1 ship.
- [공격 4]: The slug already exists in `tools/index.html`, `tools/index.md`, and `_data/tools-list.json`. A careless implementation pass can easily duplicate those entries and pollute discovery surfaces.
- [방어/완화]:
  - Keep every fee input editable and label defaults as official baseline assumptions, not permanent truths.
  - Explicitly model the pass-through case as reverse pricing to preserve the creator’s intended support amount after processor fees.
  - Keep scope to one monthly support calculator with optional reward cost and fixed cost only; defer taxes, subscriptions, and payout scheduling.
  - Treat catalog wiring as a preservation task: verify existing index/list entries remain exact-once and only add the real tool files plus a manifest entry.
- [합의]: 🟢극복

## What would make this turn red
- If official Buy Me a Coffee documentation becomes contradictory on whether the 0.5% payout fee applies to gross volume vs net payout amount.
- If the repo already contains a hidden shipped variant under another slug that materially duplicates this angle.
- If the future implementation run cannot preserve exact-once discovery wiring.

## Conservative posture
- Use editable defaults.
- Phrase payout timing as informational only.
- Prefer under-claiming over pretending the math is universally exact.
- Stop at spec package if any source ambiguity becomes material during implementation.