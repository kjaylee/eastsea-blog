# Verification — big5-workstyle-map

## Required command chain
```bash
node --check tools/big5-workstyle-map/logic.mjs && node --check tools/big5-workstyle-map/app.mjs && node --test tests/unit/big5-workstyle-map.test.mjs && node --test tests/unit/test-manifest.mjs
```

Result:
- `logic.mjs`: syntax OK
- `app.mjs`: syntax OK
- `tests/unit/big5-workstyle-map.test.mjs`: 6 passed, 0 failed
- `tests/unit/test-manifest.mjs`: 6 passed, 0 failed

## Manifest refresh
```bash
bash scripts/build-manifests.sh
```

Result:
- `games/manifest.json: 345개`
- `tools/manifest.json: 525개`

## Evidence summary
- Required verification chain executed exactly as requested and completed with zero failures.
- Tool manifest reflects updated `big5-workstyle-map` directory size after modular split.
