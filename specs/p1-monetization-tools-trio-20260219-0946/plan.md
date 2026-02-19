# Plan — P1 Monetization Tools Trio (20260219-0946)

## Delivery Strategy
1. **Spec lock**: freeze formulas, UX rules, and integration targets.
2. **TDD design**: define deterministic test scenarios per tool (normal + edge).
3. **Task slicing**: implement each tool independently to minimize coupling.
4. **Integration pass**: update portal card list and metadata files.
5. **Validation pass**: local HTTP 200 checks + deploy/live 200 checks.

---

## Implementation Sequence

### Phase A — Documentation (SDD/TDD)
- Create `spec.md` (done)
- Create `plan.md` (this file)
- Create `test-cases.md`
- Create `tasks.md`

### Phase B — Tool Build
- Build `tools/saas-expansion-mrr-waterfall-calculator/index.html`
- Build `tools/ecommerce-contribution-margin-stack-calculator/index.html`
- Build `tools/revenue-based-financing-cost-calculator/index.html`

### Phase C — Discovery Integration
- Add 3 cards in `tools/index.html`
- Add 3 objects in `tools/manifest.json`
- Add 3 objects in `_data/tools-list.json`

### Phase D — Verification
- `python3 -m http.server` from repo root
- `curl -I` each new local URL and confirm `200`

### Phase E — Git + Deploy Verification
- commit with: `feat(tools): add 3 monetization calculators`
- push to `origin master`
- poll public URLs until `HTTP 200`

---

## Risk Controls
- Avoid slug collision by checking manifest before implementation.
- Keep formulas explicit and independent from external APIs.
- Clamp invalid numeric ranges (percent 0~100, positive monetary values).
- Guard divide-by-zero and non-finite outputs.
- Keep portal link strictly `href="/"` in all three tools.

---

## Definition of Done
- 3 tools implemented, responsive, bilingual, and calculator logic validated.
- SDD/TDD docs complete in required order.
- Checkpoint artifacts saved under `.state/p1-monetization-tools-trio/20260219-0946/`.
- Local and live URL checks show `200`.
- Commit hash and live URLs recorded for reporting.
