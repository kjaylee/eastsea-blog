# Plan — Mortgage Extra Payment / BMI+BFP / CAGR Trio

## Build steps
1. Create research/spec/plan/test-case artifacts before code changes.
2. Implement `mortgage-extra-payment-calculator` as a standalone page with pure amortization logic and extra-payment comparison.
3. Implement `bmi-bfp-calculator` as a standalone page with metric/imperial conversion, BMI, US Navy body-fat %, composition metrics, and interpretation.
4. Refresh existing `cagr-calculator` page to a stronger single-file implementation instead of creating a duplicate slug.
5. Wire catalog entries into `_data/tools-list.json`, `tools/index.md`, and `tools/index.html`.
6. Rebuild `tools/manifest.json` via `bash scripts/build-manifests.sh`.
7. Run verification: HTML/script parse checks, deterministic numeric spot checks, manifest rebuild, exact-once catalog checks, and local HTTP 200 smoke tests.
8. Score against checklist; fix gaps if score < 90.

## Verification commands
- `python3 - <<'PY' ... inline-script parse / catalog exact-once / numeric spot checks ... PY`
- `bash scripts/build-manifests.sh`
- `python3 -m http.server 4173` + `curl -I` for all three pages

## 🔴 Red Team
- 공격 1: `cagr-calculator` already exists, so blindly adding a third new directory would violate the explicit anti-duplication rule.
- 공격 2: mortgage extra-payment math is easy to get subtly wrong if extra principal is applied before interest or if the final payment is not capped to balance.
- 공격 3: BMI + body-fat tools can overstate medical certainty and confuse users when BMI and BFP disagree.
- 방어/완화:
  - Refresh the existing CAGR slug instead of creating a duplicate.
  - Use month-by-month amortization with explicit order: interest → scheduled principal → extra principal → cap final balance.
  - Frame outputs as screening guidance only, add disclaimers, and include interpretation text that explains disagreement between BMI and BFP.
- 합의: 🟢극복
