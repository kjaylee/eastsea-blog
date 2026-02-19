# Test Cases — P1 Monetization Tools Trio (2026-02-19 08:52)

## 1) Structural / Delivery
- [ ] Each slug has `tools/<slug>/index.html` only (single-file tool).
- [ ] Each page renders without console errors.
- [ ] Mobile viewport (≤900px) stacks content to single-column.

## 2) CPQ Discount Guardrail ROI Calculator
### Default scenario regression
Input defaults:
- Quotes 180, Deal 24,000, Win 27%, Win delta -1%p, Current discount 18%, Target discount 12%, Gross margin 72%, Monthly costs 2,400 + 1,600, One-time 22,000

Expected (±1% tolerance):
- [ ] Monthly gross profit lift ≈ 23,016.96
- [ ] Monthly net impact ≈ 19,016.96
- [ ] Annual net impact ≈ 206,203.52
- [ ] ROI ≈ 294.58%
- [ ] Payback ≈ 1.16 months

### Validation behavior
- [ ] Discount/Win rate/Gross margin outside 0–100 triggers validation error.
- [ ] Payback shows `N/A` when monthly net impact ≤ 0.

## 3) Contract Redline Cycle ROI Calculator
### Default scenario regression
Input defaults:
- Contracts 42, ACV 38,000, Base win 29%, Cycle 42→26 days, Win lift 1.8%p per 10 days, Gross margin 68%, Legal save 3.8h/contract @95, Costs: tool 2,200 + owner 18h@85, One-time 18,000

Expected (±1% tolerance):
- [ ] Additional won contracts ≈ 1.21 / month
- [ ] Incremental gross profit ≈ 31,256.06
- [ ] Legal cost savings ≈ 15,162.00
- [ ] Monthly net impact ≈ 42,688.06
- [ ] ROI ≈ 787.53%

### Validation behavior
- [ ] Target cycle days >= current cycle days allowed but shows lower/negative impact.
- [ ] New win rate is capped at 100% (never exceeds 1.0).

## 4) Onboarding Time-to-Value ROI Calculator
### Default scenario regression
Input defaults:
- 240 new customers, ARPA 420, Gross margin 79%, Activation 56→68%, Retention 74→82%, CSM save 1.4h @52, Platform 3,600, One-time 26,000

Expected (±1% tolerance):
- [ ] Baseline qualified MRR ≈ 41,771.52
- [ ] Improved qualified MRR ≈ 56,206.08
- [ ] Incremental gross profit ≈ 11,403.30
- [ ] CSM savings ≈ 11,880.96
- [ ] Monthly net impact ≈ 19,684.26
- [ ] ROI ≈ 303.77%

### Validation behavior
- [ ] Activation/Retention/Gross margin outside 0–100 rejected.
- [ ] Payback displays `N/A` when monthly net ≤ 0.

## 5) Discovery Artifacts
- [ ] `tools/index.html` includes 3 new cards/links.
- [ ] `tools/manifest.json` includes 3 new slugs.
- [ ] `_data/tools-list.json` includes 3 new URLs with title/description.

## 6) URL Verification
- [ ] Local server returns HTTP 200 for all 3 tool URLs.
- [ ] Live `https://eastsea.monster/tools/<slug>/` returns HTTP 200 for all 3 URLs.
