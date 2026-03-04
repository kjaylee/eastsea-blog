# Plan — white-label-agency-margin-calculator

1. Implement core pricing logic in `logic.mjs`
   - defaults
   - validation
   - deterministic pricing + margin outputs
   - copy-summary formatter

2. Implement static UI in `index.html` + controller `app.mjs`
   - assumption inputs
   - KPI snapshot
   - driver breakdown table
   - copy/reset interactions
   - localStorage persistence

3. Add unit tests in `tests/unit/white-label-agency-margin-calculator.test.mjs`
   - validation failures
   - monotonic economics checks
   - finite break-even
   - summary field presence

4. Regenerate manifests
   - run `bash scripts/build-manifests.sh`

5. Verify required commands
   - `node --test tests/unit/white-label-agency-margin-calculator.test.mjs`
   - `node --test tests/unit/test-manifest.mjs`
   - add results and sample logic numbers to `verification.md`
