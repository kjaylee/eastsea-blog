# Test Cases — YouTube Super Chat Revenue Calculator

## Formula tests
- `TC-SC-01` baseline scenario returns expected live views, paid messages, gross fan spend, take-home, and reverse-math outputs.
- `TC-SC-02` adding withholding tax lowers take-home and raises target thresholds.
- `TC-SC-03` increasing monthly cost reduces net profit linearly.
- `TC-SC-04` zero audience returns safe nulls for reverse-target metrics.
- `TC-SC-05` invalid inputs return errors.
- `TC-SC-06` near-zero net factor returns null break-even and target outputs.
- `TC-SC-07` summary includes decision-ready fields.

## Integration tests
- `TC-SC-08` HTML scaffold contains required anchors and script references.
- `TC-SC-09` discovery surfaces contain the slug exactly once.
