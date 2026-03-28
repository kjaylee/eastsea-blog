# Verification — Memberstack Fee Calculator

## 1) Unit tests
Command:
```bash
cd /Users/kjaylee/.openclaw/workspace/eastsea-blog
node --test tools/memberstack-fee-calculator/calculator.test.js
```

Result:
- **PASS**
- 12 / 12 tests passed

Verified areas:
- public plan constants
- baseline math
- yearly billing discount logic
- custom processor override
- member-cap eligibility and recommendation gating
- upgrade thresholds
- invalid input handling
- HTML anchors / SEO copy
- discovery exact-once wiring

## 2) Manifest rebuild
Command:
```bash
cd /Users/kjaylee/.openclaw/workspace/eastsea-blog
bash scripts/build-manifests.sh
```

Result:
- **PASS**
- `tools/manifest.json` regenerated successfully
- structured manifest check confirms exactly one matching entry for `memberstack-fee-calculator`

Structured check:
```text
manifest structured exact-once 1
```

## 3) Local HTTP verification
Command:
```bash
cd /Users/kjaylee/.openclaw/workspace/eastsea-blog
python3 -m http.server 4176
curl -I http://127.0.0.1:4176/tools/memberstack-fee-calculator/
```

Result:
- **PASS**
- HTTP `200 OK`

Observed headers:
```text
HTTP/1.0 200 OK
Content-type: text/html
```

## 4) Content/SEO anchor verification
Command:
```bash
curl -s http://127.0.0.1:4176/tools/memberstack-fee-calculator/ | \
  egrep 'Memberstack Fee Calculator|Basic \$29 / 4%|Professional \$49 / 2%|Business \$99 / 0.9%|Established \$499 / 0%|Yearly 20% OFF|Stripe domestic 2.9% \+ \$0.30'
```

Result:
- **PASS**
- confirmed visible/static copy for:
  - Memberstack Fee Calculator
  - Basic $29 / 4%
  - Professional $49 / 2%
  - Business $99 / 0.9%
  - Established $499 / 0%
  - Yearly 20% OFF
  - Stripe domestic 2.9% + $0.30

## 5) Browser verification
Tool:
- OpenClaw browser snapshot on `http://127.0.0.1:4176/tools/memberstack-fee-calculator/`

Result:
- **PASS**
- Browser snapshot confirmed:
  - page title renders correctly
  - default controls load with defaults
  - KPI values render
  - comparison table renders
  - baseline recommendation shows `Business`
  - current-plan cap status shows `Eligible · 5,000`

## 6) Discovery verification
Checks:
- `tools/index.html`
- `tools/index.md`
- `_data/tools-list.json`
- `tools/manifest.json`

Result:
- **PASS** for exact-once structured discovery wiring
- Note: raw text count in `tools/manifest.json` can be `2` because the slug appears in both `slug` and `url`; structured JSON filtering is the correct validation and passed.

## 7) Catalog guard
Command:
```bash
cd /Users/kjaylee/.openclaw/workspace/eastsea-blog
python3 scripts/tool-catalog-guard.py --root . --fail-on error --max-examples 5
```

Result:
- **RED / repo-wide existing debt**
- Guard reports many pre-existing catalog errors unrelated to this tool, especially `tools_list_missing_entries` across other slugs.
- This new slice did **not** introduce a Memberstack-specific failure; the tool’s own exact-once discovery test passed.

## Verification conclusion
- Tool implementation: **verified**
- Local page availability: **verified**
- Discovery wiring: **verified**
- Repo-wide catalog hygiene: **not clean globally**, but failure is pre-existing and not specific to `memberstack-fee-calculator`
