# Test Cases — tool-formula-batch-20260327

## Static checks
```bash
python3 -m py_compile eastsea-blog/scripts/tool-formula-scaffold.py eastsea-blog/scripts/tool-formula-batch.py eastsea-blog/tests/test_tool_formula_scaffold.py eastsea-blog/tests/test_tool_formula_batch.py
```
Expectation: pass.

## Unit tests
```bash
python3 eastsea-blog/tests/test_tool_formula_batch.py
```
Expectation: pass.

Coverage target:
1. Dry-run scan discovers fixture configs and reports missing files without writing.
2. `--write-missing` backfills only missing generated files for a partially scaffolded tool.
3. Existing generated file contents remain unchanged during non-force backfill.
4. `--force` can overwrite generated outputs when explicitly requested.

## Repo-level smoke
```bash
python3 eastsea-blog/scripts/tool-formula-batch.py \
  --root eastsea-blog \
  --json-out eastsea-blog/specs/tool-formula-batch-20260327/artifacts/report.json \
  --md-out eastsea-blog/specs/tool-formula-batch-20260327/artifacts/report.md
```
Expectation: pass with a dry-run report over real config-driven tools.
