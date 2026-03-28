# Gap Analysis — tool-formula-batch-20260327

Date: 2026-03-27

## Spec requirements vs implementation

| # | Requirement | Status | Notes |
|---|---|---|---|
| 1 | Discover `tool.config.json` under `tools/` | ✅ | `scan_tools()` uses `glob("*/tool.config.json")` |
| 2 | Reuse scaffold validation/rendering via import | ✅ | `load_scaffold_module()` uses `importlib.util` |
| 3 | Report presence/missing for `index.html`, `app.js`, `app.test.js` | ✅ | `compute_status()` + `audit_tool()` |
| 4 | Default mode is dry-run audit | ✅ | no writes unless `--write-missing` or `--force` |
| 5 | `--write-missing` writes only missing files | ✅ | partial backfill implemented in `write_missing_files(force=False)` |
| 6 | `--force` overwrites generated files | ✅ | `write_missing_files(force=True)` |
| 7 | `--slug` filters execution (repeatable) | ✅ | `argparse action="append"` |
| 8 | `--json-out` writes machine-readable report | ✅ | JSON written with `indent=2` |
| 9 | `--md-out` writes Markdown report | ✅ | `render_md_report()` |
| 10 | Terminal output includes required counts and per-tool action summary | ✅ | `print_summary()` prints counts plus `missing`, `complete`, or `wrote` lines |
| 11 | Exit `0` on clean success, `1` on usage/validation/write failure | ✅ | invalid config, missing slug, and write errors all return `1` |
| S1 | Dry-run must not modify files | ✅ | covered by unit tests and repo smoke |
| S2 | `--write-missing` without force preserves existing files | ✅ | explicitly tested |
| S3 | Python stdlib only | ✅ | no third-party imports |

## Test-case coverage

| Test case | Covered | Evidence |
|---|---|---|
| Dry-run scan discovers configs and writes nothing | ✅ | `TestDryRun.test_dry_run_does_not_write_files` |
| `--write-missing` backfills only missing files | ✅ | `TestWriteMissing.test_write_missing_fills_only_missing_files` |
| Existing file remains unchanged without force | ✅ | `TestWriteMissing.test_existing_file_unchanged_without_force` |
| `--force` overwrites generated outputs | ✅ | `TestForceOverwrite.test_force_replaces_existing_content` |
| Invalid config returns non-zero and still reports | ✅ | `TestInvalidConfig.test_invalid_config_returns_exit_1_and_report` |

## Match rate

**17 / 17 requirement checks met = 100%**

## Remaining gaps

No blocking implementation gaps.

Minor accepted risk:
- `--slug` + `--write-missing` is not covered by one dedicated combined-path test, but both paths are independently covered and the composition is mechanically simple.
