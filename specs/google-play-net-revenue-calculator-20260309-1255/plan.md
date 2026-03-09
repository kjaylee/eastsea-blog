# Plan — google-play-net-revenue-calculator

## 1. Preflight
- Confirm approved batch spec package is present
- Confirm slug route exists only in this tool path
- Review `app-store-net-revenue-calculator` for UI pattern reuse

## 2. Implementation approach
- Keep the current single-file static page architecture
- Preserve the pure `compute(v)` block and exact spec keys
- Keep bilingual copy and disclaimer
- Avoid unrelated refactors or catalog-wide cleanup

## 3. Catalog touch
- Ensure `tools/manifest.json` contains the slug with the correct final file size
- Ensure `_data/tools-list.json` contains the tool title/description/url row

## 4. Verification commands
```bash
python3 -m http.server 4173 -d eastsea-blog > eastsea-blog/tmp/google-play-net-revenue-calculator-http.log 2>&1 &
SERVER_PID=$!
sleep 1
curl -fsS http://127.0.0.1:4173/tools/google-play-net-revenue-calculator/ > eastsea-blog/tmp/google-play-net-revenue-calculator-curl.html
kill $SERVER_PID

node - <<'NODE' > eastsea-blog/tmp/google-play-net-revenue-calculator-verify.txt
// extract TESTABLE_COMPUTE block and assert deterministic outputs
NODE
```

## 5. Gap analysis gate
- Compare the shipped page against the batch spec and the targeted task spec
- If any item fails, fix before commit
