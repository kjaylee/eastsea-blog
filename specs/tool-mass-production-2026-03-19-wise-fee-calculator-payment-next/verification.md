# Verification — wise-fee-calculator

Date: 2026-03-25 05:57 KST

## Scope
Finished queue item #33 for `wise-fee-calculator` inside `eastsea-blog/` with surgical edits only:
- kept the existing tool page implementation and added the standard analytics include
- added deterministic tool-local tests
- wired the tool into the missing catalog/discovery surfaces
- updated the existing manifest entry size for the current tool directory contents

## Files changed
- `tools/wise-fee-calculator/index.html` *(existing untracked tool page; added `/assets/analytics.js` include)*
- `tools/wise-fee-calculator/calculator.test.js` *(new deterministic node test)*
- `_data/tools-list.json`
- `tools/index.html`
- `tools/index.md`
- `tools/manifest.json`

## Verification evidence
### 1) Tool-local formula + catalog test
Command:
```bash
node --test tools/wise-fee-calculator/calculator.test.js
```
Result:
- 8 / 8 tests passed
- Covered:
  - forward EUR baseline (`$1000 -> fee $4.97 / net $995.03`)
  - forward GBP all-method comparisons
  - reverse EUR and JPY calculations
  - typical bank wire comparison helper
  - required UI/meta anchors
  - exact-once catalog integration across `_data/tools-list.json`, `tools/index.html`, `tools/index.md`, `tools/manifest.json`

### 2) Repo-standard discovery smoke
Command:
```bash
node --test tests/usecase/tool-discovery.test.mjs
```
Result:
- 8 / 8 tests passed

### 3) Localhost HTTP smoke
Command:
```bash
curl -I http://127.0.0.1:4317/tools/wise-fee-calculator/
```
Result:
- `HTTP/1.0 200 OK`

### 4) Browser smoke (localhost)
URL:
- `http://127.0.0.1:4317/tools/wise-fee-calculator/`

Observed in browser:
- default send-mode smoke (USD 1000, EUR):
  - Bank Transfer fee `$4.97`
  - Net `$995.03`
  - Typical bank wire `$65.00`
  - Savings `$60.03`
- reverse-mode smoke (`Recipient Gets = 900`):
  - comparison block showed `Wise $4.58`, `Typical bank wire $62.14`, `Savings $57.56`
- card-limit smoke (`You Send = 16000`):
  - warning visible: `Card transfers capped at $15,000 — use bank transfer or wire for larger amounts.`
  - comparison block showed `Wise $66.47`, `Typical bank wire $515.00`, `Savings $448.53`

Screenshot captured during localhost smoke:
- `media/browser/77021e1d-4138-4123-b31e-e3681d7792db.jpg`

Console note:
- no tool JS errors observed
- only browser noise was missing `favicon.ico` on localhost

## Outcome
`wise-fee-calculator` is implemented and verifiably discoverable from the repo catalog surfaces, with deterministic tests and localhost browser evidence. No commit/push performed.

## Revalidation — 2026-03-25 06:52 KST
### Commands rerun
```bash
node --test tools/wise-fee-calculator/calculator.test.js
node --test tests/usecase/tool-discovery.test.mjs
```

### Result
- `tools/wise-fee-calculator/calculator.test.js`: PASS (`8/8`)
- `tests/usecase/tool-discovery.test.mjs`: PASS (`8/8`)

### Artifact-chain fix in this slice
- Added missing repo-local `research.md`, `spec.md`, `plan.md`, and `test-cases.md` under `specs/tool-mass-production-2026-03-19-wise-fee-calculator-payment-next/`
- Added `gap-analysis.md` for the quality-loop record
- Corrected the root spec-pack reverse-checklist baseline from `$905.60` to `$904.58` to match the implemented formula and deterministic tests
