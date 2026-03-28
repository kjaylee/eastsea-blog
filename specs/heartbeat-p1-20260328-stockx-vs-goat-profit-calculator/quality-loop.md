# Quality Loop — StockX vs GOAT Profit Calculator

## Iteration 1
Score: 84/100

### Observed gap
- Initial implementation treated `goatApi.getPreset()` like a string-based lookup, but the shipped GOAT module expects an object with `feePreset`.
- Result: validation incorrectly failed with `goatFeePreset is unsupported.`

### Auto-fix applied
- Switched preset resolution to prefer `goatApi.PRESET_MAP[input.goatFeePreset]` and fall back to `goatApi.getPreset({ feePreset: input.goatFeePreset })`.
- Re-ran deterministic checks and full test file.

## Iteration 2
Score: 96/100

### Pass reasons
- Core math is deterministic and composes tested sibling calculators.
- Exact-once discovery checks pass across all required artifacts.
- Localhost smoke confirms the page renders expected anchor copy.
- Remaining gaps are deliberate v1 scope cuts, not correctness defects.

## Final status
Pass — stopped after iteration 2 because score >= 90.
