# Gap Analysis — Memberstack Fee Calculator

## What is complete
- Research artifact written before code
- Design doc / spec / plan / red team / test cases recorded
- New static tool created at `tools/memberstack-fee-calculator/`
- Math engine implemented for Memberstack public plans
- EN/KR UI shipped
- Discovery surfaces wired
- Manifest rebuilt
- Unit tests passing
- Browser and local HTTP verification captured

## Remaining gaps
1. **Yearly-mode nuance is still planning-only**
   - We model the public “Yearly 20% OFF” as a monthly equivalent, not real annual cash timing.
   - Acceptable for v1, but a future version could add annual cashflow framing.

2. **Processor modeling is intentionally narrow**
   - v1 uses Stripe domestic baseline + custom override only.
   - No international/multi-method matrix yet.

3. **Business / Established member-cap semantics are simplified**
   - Public pricing says `10,000+ Members`; v1 treats these tiers as effectively open for recommendation purposes.
   - Good enough for planning, but a future version could annotate this more explicitly in comparison rows.

4. **Repo-wide catalog guard remains noisy**
   - The repository has existing catalog debt unrelated to this tool.
   - This lane did not resolve global guard errors.

## Risk review
- User-facing math risk: **low-to-moderate**
  - Core formulas are deterministic and tested.
  - Assumption copy is explicit.
- SEO/content risk: **low**
  - Exact-match title, description, canonical, and pricing anchors are present.
- Integration risk: **low**
  - Discovery exact-once test passes.

## Best next move
If this lane continues, the highest-value next slice is:
- add one compact scenario explainer block for **"When should I upgrade from Professional to Business?"** using the computed threshold and current gross delta.

## 🔴 Red Team
- [공격 1]: The tool may still be too close to existing fee calculators if traffic does not materialize for the exact-match term.
- [공격 2]: Memberstack pricing could change, making thresholds stale.
- [방어/완화]:
  - This fills a real catalog gap in an already validated platform-fee cluster.
  - Public pricing anchors are centralized in code and tests, so changes are easy to update.
- [합의]: 🟢극복
