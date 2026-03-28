# Verification — Amazon KDP Royalty Calculator

## Commands run
```bash
cd /Users/kjaylee/.openclaw/workspace/eastsea-blog
bash scripts/build-manifests.sh
node --test tests/unit/amazon-kdp-royalty-calculator.test.mjs tests/unit/test-manifest.mjs
node --check tools/amazon-kdp-royalty-calculator/app.mjs
node --check tools/amazon-kdp-royalty-calculator/logic.mjs
python3 -m http.server 4173 >/tmp/eastsea-kdp-http.log 2>&1 &
curl -I http://127.0.0.1:4173/tools/amazon-kdp-royalty-calculator/
curl -s http://127.0.0.1:4173/tools/amazon-kdp-royalty-calculator/ | grep -E 'Amazon KDP Royalty Calculator|35%|70%|60%|Expanded Distribution'
```

## Results
- `bash scripts/build-manifests.sh` succeeded.
  - `tools/manifest.json: 727개`
- `node --test tests/unit/amazon-kdp-royalty-calculator.test.mjs tests/unit/test-manifest.mjs`
  - **15/15 tests passed**
- `node --check` passed for:
  - `tools/amazon-kdp-royalty-calculator/app.mjs`
  - `tools/amazon-kdp-royalty-calculator/logic.mjs`
- Local HTTP probe returned `HTTP/1.0 200 OK` for `/tools/amazon-kdp-royalty-calculator/`
- HTML probe confirmed expected copy exists:
  - `Amazon KDP Royalty Calculator`
  - `35% / 70% eBook math`
  - `50% / 60% / 40% paperback math`
  - `Expanded Distribution`

## Additional note
A broader run of `tests/integration/manifest-integrity.test.mjs` exposed one **pre-existing unrelated repo issue**:
- Missing novel episode file: `novels/_data/카페사장님은전생자입니다-010.md`

This failure is outside the KDP tool slice and does not block the new calculator itself.
