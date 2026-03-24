# Implementation Notes — Merchant of Record vs Direct Billing Profit Calculator

## Surgical edit strategy
This is the main implementation constraint:

### Create only these new files
- `/Users/kjaylee/.openclaw/workspace/eastsea-blog/tools/merchant-of-record-vs-direct-billing-profit-calculator/index.html`
- `/Users/kjaylee/.openclaw/workspace/eastsea-blog/tools/merchant-of-record-vs-direct-billing-profit-calculator/calculator.js`
- `/Users/kjaylee/.openclaw/workspace/eastsea-blog/tools/merchant-of-record-vs-direct-billing-profit-calculator/calculator.test.js`

### Edit only this existing file
- `/Users/kjaylee/.openclaw/workspace/eastsea-blog/tools/manifest.json`

### Do not edit unless verification forces it
- `/Users/kjaylee/.openclaw/workspace/eastsea-blog/tools/index.html`
- `/Users/kjaylee/.openclaw/workspace/eastsea-blog/tools/index.md`
- `/Users/kjaylee/.openclaw/workspace/eastsea-blog/_data/tools-list.json`

The discovery surfaces already reference the slug exactly once. Rewriting them is the most likely mistake.

## Recommended file shape
### `calculator.js`
Use the `app-store-vs-web-checkout-profit-calculator` pattern:
- defaults object
- field metadata map
- `toFiniteNumber()`
- `validateInputs()`
- `calculate()` pure function
- small helper to build a human-readable summary sentence
- UMD or Node-friendly export so `node --test` works without browser setup

### `calculator.test.js`
Blend two existing styles:
- numeric golden fixtures like `tools/app-store-vs-web-checkout-profit-calculator/calculator.test.js`
- exact-once catalog checks like `tools/lemon-squeezy-fee-calculator/calculator.test.js`

Suggested test sections:
1. `golden baseline scenario`
2. `lean direct-billing scenario`
3. `break-even threshold behavior`
4. `invalid inputs`
5. `catalog integration exact-once`
6. `html contains title analytics and related links`

### `index.html`
Recommended sections:
- hero
- assumption note
- three input groups
- result cards
- comparison table
- summary paragraph
- related-tool chips

Keep it static, dependency-light, and visually consistent with neighboring payment tools.

## Copy notes
Recommended title:
- `Merchant of Record vs Direct Billing Profit Calculator | MoR vs 직접 결제 손익 계산기`

Recommended meta description direction:
- compare direct processor fees, tax burden, chargebacks, compliance overhead, and Merchant of Record fees to estimate monthly take-home, annual delta, and break-even MoR fee rate

Recommended caution copy:
- “Editable planning model — provider policies, tax treatment, and dispute rules vary by country and platform.”

## Suggested related links
- `/tools/app-store-vs-web-checkout-profit-calculator/`
- `/tools/vat-gst-margin-calculator/`
- `/tools/stripe-fee-calculator/`
- `/tools/lemon-squeezy-fee-calculator/`

## Implementation sequencing
1. scaffold folder and files
2. finish pure calculator first
3. write tests against the golden fixtures
4. wire UI to the tested calculator
5. add the manifest entry
6. run verification
7. stop — do not drift into broader catalog cleanup

## Safe handoff note
This spec package is ready for a follow-up implementation subagent. The smallest high-confidence implementation is one tool page + one manifest entry, nothing more.