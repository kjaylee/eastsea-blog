# Red Team — Merchant of Record vs Direct Billing Profit Calculator

## Attack 1 — Duplicate discovery wiring creates catalog debt
If the implementation mindlessly appends the slug again to `tools/index.html`, `tools/index.md`, or `_data/tools-list.json`, the page will ship with doubled discovery references and noisy exact-once failures.

### Defense
- treat existing discovery surfaces as source evidence, not as required edits
- preflight-count the slug before coding
- allow only `tools/manifest.json` as the planned discovery-related edit
- keep an exact-once test in `calculator.test.js`

### Agreement
🟢 Overcome if the implementation adds only the tool directory plus one manifest entry.

---

## Attack 2 — The calculator lies by implying one “correct” MoR fee model
MoR providers differ on headline rates, fixed fees, tax handling, dispute responsibility, support, and payout behavior. A fake-universal calculator would look precise but mislead operators.

### Defense
- position v1 as an editable planning calculator, not a provider quote engine
- expose all fee rates and monthly costs as user-editable inputs
- keep copy explicit that policies vary by provider and region
- do not hardcode a provider name as the default scenario

### Agreement
🟢 Overcome if the page defaults remain editable and disclaim provider variance.

---

## Attack 3 — Over-modeling makes the tool too heavy to ship safely
Trying to model reverse charge, tax-inclusive pricing, regional processor tables, refund fee clawbacks, subscription proration, and cross-border FX in v1 will bloat both UI and tests.

### Defense
- narrow v1 to monthly planning economics
- keep one shared revenue base and two cost stacks
- defer jurisdiction-specific tax logic and payout timing to later versions
- make the most decision-critical output the monthly/annual delta and break-even MoR fee rate

### Agreement
🟡 Risk accepted. v1 is intentionally approximate but decision-useful.

---

## Attack 4 — Internal-link promise raises user expectations beyond the page’s real scope
Because `app-store-vs-web-checkout-profit-calculator` already links to this slug, users may expect a polished adjacent tool, not a rough internal prototype.

### Defense
- require title/meta/analytics/related-link markers in tests
- include a polished summary block and line-item breakdown
- avoid placeholder copy and incomplete sections

### Agreement
🟢 Overcome if the implementation meets the same finish level as neighboring payment tools.

## Final call
Proceed.

Why: the gap is real, monetization-aligned, and low-risk **if** the implementation stays narrow and avoids duplicate discovery edits. The only meaningful yellow risk is modeling simplification, which is acceptable for a planning calculator.