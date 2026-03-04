# Spec — battle-pass-attach-rate-roi-calculator

## Functional requirements
1. Create new tool directory under `tools/battle-pass-attach-rate-roi-calculator/`.
2. Provide ROI calculator inputs for battle pass attach-rate uplift.
3. Calculate and render:
   - incremental buyers
   - net contribution per buyer
   - retention value (monthly)
   - monthly net lift
   - period net benefit
   - ROI (%), payback months
   - break-even target attach rate (%)
4. Provide concise explanatory copy and summary textarea with copy button.
5. Ensure mobile-friendly UI with responsive layout.
6. Wire tool discovery in:
   - `tools/index.html` (tool card)
   - `tools/index.md` (bullet entry)
   - `tools/manifest.json` (via manifest build)

## Non-functional requirements
- Pure client-side (no backend).
- Deterministic calculations.
- Graceful handling of invalid inputs.
- localStorage persistence for assumptions.

## Validation rules
- Percent inputs within 0–100 where appropriate.
- Target attach rate >= current attach rate.
- Finite numeric bounds for all fields.

## Verification targets
- `node --check` on `logic.mjs` and `app.mjs`.
- Local HTTP server `curl` returns `200` for tool URL.
