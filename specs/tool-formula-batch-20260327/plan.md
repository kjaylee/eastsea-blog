# Plan — tool-formula-batch-20260327

1. Load the existing scaffold module from `scripts/tool-formula-scaffold.py` with `importlib`.
2. Implement repo scan + slug filtering + dry-run reporting in `scripts/tool-formula-batch.py`.
3. Add safe partial-write behavior:
   - write only missing files in `--write-missing`
   - overwrite only when `--force` is set
4. Add JSON/Markdown report emitters.
5. Add focused unit tests covering:
   - discovery and dry-run summary
   - safe partial backfill of only missing files
   - `--force` overwrite behavior
6. Update `scripts/README.md` with one example dry-run and one example write command.
7. Run verification commands and capture results.
8. Write gap analysis and quality-loop score.
