# Spec — big5-workstyle-map

## Scope
- Update `tools/big5-workstyle-map/index.html` to a module-driven layout.
- Add `tools/big5-workstyle-map/logic.mjs` (pure scoring logic).
- Add `tools/big5-workstyle-map/app.mjs` (DOM controller).
- Add unit tests in `tests/unit/big5-workstyle-map.test.mjs`.

## Functional Requirements
1. 15-question Big Five workstyle assessment with 1–5 Likert responses.
2. Weighted scoring by trait (O/C/E/A/N) including reverse-coded items.
3. Result output includes:
   - dominant and secondary trait
   - archetype (name, tagline, practical focus)
   - normalized trait bars (0–100)
   - readiness tier + composite indexes
4. Shareable/copyable summary text.
5. Last result preview shown on intro via localStorage.

## Monetization Requirements
- Each archetype maps to a premium offer title/description/price.
- Result screen displays the premium offer block and CTA link.

## Non-Functional Requirements
- `logic.mjs` has no DOM access.
- `app.mjs` imports and uses logic functions.
- Node syntax checks and unit tests pass.

