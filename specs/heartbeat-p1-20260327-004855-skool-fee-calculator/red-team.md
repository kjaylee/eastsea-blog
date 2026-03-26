# Red Team

## Risk: overlap is too high

- Concern: this could look like “another creator fee calculator”.
- Mitigation: center the tool on the exact `skool fee calculator` query and make the output plan-comparison-specific, not a generic payout form.

## Risk: fee threshold ambiguity at $900

- Concern: official wording is inconsistent between `up to $899` and `above $900`.
- Mitigation: document the inference, apply one deterministic rule (`>= $900` uses the higher Pro rate), and note it in research + UI copy.

## Risk: overclaiming payout/tax behavior

- Concern: Skool handles VAT/sales tax and pays out locally, but the tool should not imply official accounting treatment.
- Mitigation: keep the scope to billed gross, plan fees, transaction fees, and optional refund/dispute drag only.

## Risk: discovery wiring duplicates slug references

- Concern: the repo has exact-once expectations in discovery surfaces.
- Mitigation: add one dedicated deterministic test that checks exact-once presence in `tools/index.html`, `tools/index.md`, `_data/tools-list.json`, and `tools/manifest.json`.
