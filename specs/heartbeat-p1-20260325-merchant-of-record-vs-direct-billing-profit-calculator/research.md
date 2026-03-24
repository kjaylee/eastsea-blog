# Research — Merchant of Record vs Direct Billing Profit Calculator

## Goal
Pick one deterministic, high-opportunity discovery gap in `eastsea-blog`, then leave an implementation-ready spec package without pretending the page is already shipped.

## Files and sources reviewed
### Repo files
- `/Users/kjaylee/.openclaw/workspace/eastsea-blog/tools/index.html`
- `/Users/kjaylee/.openclaw/workspace/eastsea-blog/tools/index.md`
- `/Users/kjaylee/.openclaw/workspace/eastsea-blog/_data/tools-list.json`
- `/Users/kjaylee/.openclaw/workspace/eastsea-blog/tools/manifest.json`
- `/Users/kjaylee/.openclaw/workspace/eastsea-blog/tools/app-store-vs-web-checkout-profit-calculator/index.html`
- `/Users/kjaylee/.openclaw/workspace/eastsea-blog/specs/heartbeat-p1-20260325-app-store-vs-web-checkout-profit-calculator/gap-analysis.md`
- `/Users/kjaylee/.openclaw/workspace/eastsea-blog/specs/lemon-squeezy-fee-calculator-20260312/research.md`
- `/Users/kjaylee/.openclaw/workspace/eastsea-blog/tmp/tool-catalog-guard-audit.md`

### External reference anchors
- Stripe — What Is a Merchant of Record? `https://stripe.com/resources/more/merchant-of-record`
- Paddle pricing page `https://www.paddle.com/pricing`
- Lemon Squeezy pricing page `https://www.lemonsqueezy.com/pricing`
- Stripe — Chargebacks 101 `https://stripe.com/resources/more/chargebacks-101`

## Deterministic gap evidence
Chosen slug:
- `merchant-of-record-vs-direct-billing-profit-calculator`

Current repo state:
- `tools/index.html`: **1** exact card link to `merchant-of-record-vs-direct-billing-profit-calculator/`
- `tools/index.md`: **1** exact markdown link to `./merchant-of-record-vs-direct-billing-profit-calculator/`
- `_data/tools-list.json`: **1** exact URL entry for `/tools/merchant-of-record-vs-direct-billing-profit-calculator/`
- `tools/app-store-vs-web-checkout-profit-calculator/index.html`: **1** exact sibling chip link to `/tools/merchant-of-record-vs-direct-billing-profit-calculator/`
- `tools/manifest.json`: **0** exact entries
- `tools/merchant-of-record-vs-direct-billing-profit-calculator/`: **missing**
- `tools/merchant-of-record-vs-direct-billing-profit-calculator/index.html`: **missing**

This is the cleanest kind of backlog gap: multiple public discovery surfaces already promise the tool, but the page itself does not exist yet.

## Catalog-audit evidence
`python3 scripts/tool-catalog-guard.py --root . --fail-on none ...` reports:
- `warn tools_list_extra_entries count=21`
- examples include `merchant-of-record-vs-direct-billing-profit-calculator`

That means the slug is already discoverable from `_data/tools-list.json`, but still absent from the actual filesystem tool corpus.

## Why this slug won
### 1) Strongest first-party discovery evidence in the payment cluster
This slug is not just in one stale JSON file.
It is already promised in:
- the HTML tools landing page
- the markdown tools index
- the tools list JSON
- an adjacent shipped payment/comparison tool (`app-store-vs-web-checkout-profit-calculator`)

That makes it a better next slice than a purely speculative new calculator.

### 2) It matches the current monetization bias exactly
The queue asks to prefer creator/payment/marketplace monetization gaps when close.
This page is a direct payments / global checkout / SaaS monetization decision tool.
It answers a high-intent question: “Should I stay on direct billing, or pay a Merchant of Record to offload tax/compliance/chargeback burden?”

### 3) Low overlap with the current shipped corpus
Adjacent existing tools include:
- `app-store-vs-web-checkout-profit-calculator`
- `vat-gst-margin-calculator`
- `stripe-fee-calculator`
- `paypal-fee-calculator`
- `lemon-squeezy-fee-calculator`

But none of those compute the all-in operating tradeoff between:
- direct processor + tax burden + chargeback exposure + compliance/ops cost
- versus an MoR all-in fee stack

So this slug extends the cluster without cannibalizing an already-shipped exact page.

### 4) Smallest safe implementation surface
Because discovery wiring already exists in `tools/index.html`, `tools/index.md`, and `_data/tools-list.json`, the implementation can stay surgical:
- create one new tool directory
- add one manifest entry
- do **not** touch existing discovery pages unless an exact-once check fails

This is heartbeat-safe and minimizes duplicate wiring risk.

## Relevant external facts to model
### Stripe MoR definition and responsibility split
Stripe’s MoR explainer says a Merchant of Record is the entity legally responsible for processing payments and handling:
- refunds and chargebacks
- regulatory compliance
- tax collection/remittance
- fraud management

This validates the core comparison angle: direct billing should carry explicit tax/compliance/chargeback cost inputs, while the MoR side can collapse those into an all-in fee + optional fixed fee.

### Paddle pricing page
Paddle’s pricing page states its pricing is all-inclusive with no monthly fee and that it handles tax collection/remittance.
Useful implication for the tool spec:
- MoR fee assumptions must be editable
- default copy should explain that some MoRs bundle tax/remittance/support into the headline fee
- the calculator should not hardcode a single provider’s policy as universal truth

### Lemon Squeezy pricing page
Lemon Squeezy’s pricing copy explicitly says it is the merchant of record and handles sales tax/VAT liability.
Useful implication:
- sibling-link the new tool to `lemon-squeezy-fee-calculator`
- frame the new tool as “business model choice,” not “provider quote simulator”

### Stripe chargebacks explainer
Stripe’s chargeback article confirms disputes are a meaningful cost driver and mentions broad business impact.
Useful implication:
- include both chargeback revenue loss and per-case dispute fee on the direct-billing side
- keep the input editable because processor/network policies vary

## Product shape recommendation
Build a static bilingual calculator that compares two monthly take-home stacks:
1. **Direct billing** — processor fees, tax burden, chargebacks, compliance overhead, billing-ops overhead
2. **Merchant of Record** — all-in MoR rate, optional fixed fee per order, optional monthly platform cost

Primary outputs:
- direct billing monthly net take-home
- MoR monthly net take-home
- monthly delta
- annual delta
- break-even MoR fee rate
- annual ROI of switching to MoR (secondary metric)
- line-item cost breakdown for both models

## Implementation leverage inside the repo
Best internal references:
- `tools/app-store-vs-web-checkout-profit-calculator/` — same audience and comparison-style result framing
- `tools/vat-gst-margin-calculator/` — tax-aware margin breakdown pattern
- `tools/lemon-squeezy-fee-calculator/` — MoR-adjacent fee assumptions and exact-once catalog test shape

## Decision
Chosen gap: `merchant-of-record-vs-direct-billing-profit-calculator`

It won because it is already promised across multiple discovery surfaces, sits in the highest-priority monetization cluster, has low exact-page overlap, and can be implemented without risky catalog rewiring.