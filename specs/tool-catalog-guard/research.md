# Research — tool-catalog-guard

## Source reading
- `scripts/tool-catalog-guard.py`
- `tools/manifest.json`
- `_data/tools-list.json`
- `tools/index.html`
- `../.state/tool-catalog-guard/v1-2026-03-09/verification.json` (verification contract recovery)

## Repo facts
- `eastsea-blog` has a large `tools/` corpus; the guard must treat the filesystem as source of truth by enumerating `tools/*/index.html` directories.
- Catalog truth is split across three public surfaces:
  1. `tools/manifest.json`
  2. `_data/tools-list.json`
  3. `tools/index.html`
- The guard must stay read-only. It may emit optional JSON/Markdown reports, but it must not mutate catalog files or auto-fix drift.

## Recovered verification contract
- The requested `specs/tool-catalog-guard/spec.md`, `plan.md`, and `test-cases.md` are not present in the working tree.
- The task contract is recoverable from the existing implementation target plus `.state/tool-catalog-guard/v1-2026-03-09/verification.json`.
- Required behaviors inferred from that contract:
  - `python3 -m py_compile scripts/tool-catalog-guard.py` must pass.
  - Baseline repo run with `--fail-on error` must exit `1` because the current catalog intentionally contains real drift.
  - Baseline repo run with `--fail-on none` must exit `0` while still producing reports.
  - A clean fixture run with `--fail-on error` must exit `0`.
  - Quality loop target is >= 90; recovered iteration scores are 88 then 96 after widening landing-count phrase detection.

## Implementation notes
- Guard checks should be deterministic, filesystem-only, and fast.
- Landing page count validation must inspect both metadata fields and visible body copy.
- Korean count phrases without `개` must still be recognized to avoid under-reporting stale landing copy.
- Fixture needs only the minimum catalog surface needed for a clean pass:
  - `tools/index.html`
  - `tools/manifest.json`
  - `_data/tools-list.json`
  - one tool page with title, meta description, and analytics include

## Verification plan
1. Compile check with `python3 -m py_compile`.
2. Baseline audit on repo root with `--fail-on error` and report outputs in `tmp/`.
3. Baseline audit on repo root with `--fail-on none` and report outputs in `tmp/`.
4. Clean fixture audit with `--fail-on error` and report outputs in `tmp/`.
5. Record exit codes, counts, and quality-loop scores in `tmp/` artifacts.
