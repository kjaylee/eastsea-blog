# Plan — ai-support-deflection-roi-calculator

1. Build `logic.mjs`
   - Define defaults, input validation, ROI + payback + break-even equations.
   - Export summary builder for copy/share workflow.

2. Build `index.html`
   - Responsive two-panel UI (assumptions + ROI snapshot/drivers).
   - Add analytics include and module script wiring.

3. Build `app.mjs`
   - Wire DOM refs, parse/render loop, localStorage persistence.
   - Add reset/copy interactions and status messaging.

4. Add tests
   - Create `tests/unit/ai-support-deflection-roi-calculator.test.mjs`.
   - Cover validation errors, monotonic behavior, and summary fields.

5. Integrate + verify
   - Add tool card to `tools/index.html`.
   - Rebuild manifests and run target test commands.
   - Record exact evidence in verification artifact.
