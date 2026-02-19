# Tasks — p1-monetization-tools-trio-20260219-0905

## 1) Prep
- [ ] Verify slugs do not already exist in `tools/`.
- [ ] Create tool directories.

## 2) Implement calculators
- [ ] Build `enterprise-seat-expansion-roi-calculator` single-file page.
- [ ] Build `partner-mdf-roi-calculator` single-file page.
- [ ] Build `professional-services-utilization-margin-calculator` single-file page.

## 3) Discovery updates
- [ ] Add 3 cards to `tools/index.html`.
- [ ] Append entries to `_data/tools-list.json`.
- [ ] Regenerate `tools/manifest.json` via `scripts/build-manifests.sh`.

## 4) Validation
- [ ] Run local HTTP 200 checks for each new tool.
- [ ] Quick manual calculation spot-check vs test cases.

## 5) Release
- [ ] `git add` only relevant files.
- [ ] Commit + push to `eastsea-blog` master.
- [ ] Wait 1–2 minutes, verify live URLs return HTTP 200.
- [ ] Record commit hash + verification results.
