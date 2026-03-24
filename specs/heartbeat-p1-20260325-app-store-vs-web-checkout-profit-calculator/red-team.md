# 🔴 Red Team — App Store vs Web Checkout Profit Calculator

- [공격 1]: Web checkout economics are easy to overstate if capture-rate math is fuzzy. A pretty UI could ship with misleading business advice.
- [공격 2]: Rebuilding `tools/manifest.json` from disk would drag in many unrelated tool directories and create a noisy, unsafe diff.
- [공격 3]: The page could become a generic fee toy instead of a true channel-decision calculator if it omits break-even outputs.
- [방어/완화]:
  - Use a pure logic module with explicit formulas and Node golden tests.
  - Keep web capture, MoR fee, processor fee, fixed fee, and fixed monthly cost as editable inputs.
  - Compute break-even web capture and required web price explicitly.
  - Avoid bulk manifest rebuild; if manifest is updated, patch only this one slug.
- [합의]: 🟢극복

## Failure scenarios to watch
1. If unit tests reveal break-even math instability, cut scope before shipping and keep only proven outputs.
2. If surgical manifest patch becomes messy due to concurrent edits, ship the tool page without manifest change and note that catalog/index discovery already exists.
