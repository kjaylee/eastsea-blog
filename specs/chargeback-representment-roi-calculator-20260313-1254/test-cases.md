# Test Cases — chargeback-representment-roi-calculator

## Logic unit tests
- TC-L-01: reject projected win rate below current win rate.
- TC-L-02: reject impossible fee stack where vendor + platform fee >= 100%.
- TC-L-03: increasing projected win rate increases incremental recovered revenue.
- TC-L-04: increasing software cost decreases net lift and ROI.
- TC-L-05: increasing average order value increases gross value per win and net lift.
- TC-L-06: default scenario yields finite positive projected recovered revenue and total program cost.
- TC-L-07: summary contains net lift, ROI, and break-even win rate fields.

## Functional checks
- TC-F-01: page loads with populated default KPI values.
- TC-F-02: changing any input recomputes values without reload.
- TC-F-03: reset restores `DEFAULT_INPUT` values.
- TC-F-04: copy summary produces non-empty multiline output.
- TC-F-05: invalid input renders explicit error state.

## Manifest checks
- TC-M-01: new slug appears in `tools/manifest.json` after rebuild.
- TC-M-02: `tests/unit/test-manifest.mjs` passes after rebuild.
