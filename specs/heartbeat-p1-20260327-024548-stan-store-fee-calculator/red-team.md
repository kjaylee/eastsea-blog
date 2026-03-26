# Red Team — Stan Store Fee Calculator

## Attack 1
“Stan has 0% transaction fee, so this is too thin to justify a dedicated tool.”

### Response
The user intent is still exact and tool-shaped:
- plan fee comparison
- processor fee drag
- upgrade break-even
- Pro-only uplift threshold

That is enough for a focused calculator page.

## Attack 2
“Processor pricing varies too much by country to model safely.”

### Response
Use editable presets plus a planning note.
Do not present any preset as universal truth.

## Attack 3
“Pro-only feature value is too subjective to quantify.”

### Response
Treat uplift as optional and user-entered.
The calculator should show sensitivity, not claim guaranteed gains.

## Attack 4
“This overlaps with Payhip/Kajabi/Podia/Teachable fee calculators.”

### Response
Those pages answer different exact-match platform queries.
No Stan-specific page exists in the repo today.

## Risk posture
- Source ambiguity risk: low
- Overlap risk: low
- Formula risk: medium
- UX clarity risk: medium

## Mitigation
- Keep formulas transparent
- Keep fee fields editable
- Add deterministic tests for baseline and edge cases
- Include disclaimer copy tied to the 2025 Stan help-center articles
