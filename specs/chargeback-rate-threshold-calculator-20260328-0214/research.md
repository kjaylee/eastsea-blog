# Research — Chargeback Rate Threshold Calculator

Date: 2026-03-28 (Asia/Seoul)
Slug candidate: `chargeback-rate-threshold-calculator`

## Decision target
Ship one new static monetizable tool in `eastsea-blog/tools/` that:
- is not already in the catalog
- does not depend on external APIs
- has decision-ready B2B / merchant search intent
- diversifies the current over-concentrated fee-calculator cluster

## Files reviewed before deciding
- `/Users/kjaylee/.openclaw/workspace/AGENTS.md`
- `/Users/kjaylee/.openclaw/workspace/SOUL.md`
- `/Users/kjaylee/.openclaw/workspace/eastsea-blog/tools/index.html`
- `/Users/kjaylee/.openclaw/workspace/eastsea-blog/tools/index.md`
- `/Users/kjaylee/.openclaw/workspace/eastsea-blog/_data/tools-list.json`
- `/Users/kjaylee/.openclaw/workspace/eastsea-blog/tools/chargeback-loss-impact-calculator/index.html`
- `/Users/kjaylee/.openclaw/workspace/eastsea-blog/tools/chargeback-representment-roi-calculator/index.html`
- `/Users/kjaylee/.openclaw/workspace/eastsea-blog/tools/rolling-reserve-cashflow-calculator/index.html`
- `/Users/kjaylee/.openclaw/workspace/eastsea-blog/tools/google-play-net-revenue-calculator/calculator.js`
- `/Users/kjaylee/.openclaw/workspace/eastsea-blog/tests/unit/fractional-cmo-pricing-calculator.test.mjs`
- `/Users/kjaylee/.openclaw/workspace/eastsea-blog/scripts/build-manifests.sh`
- `/Users/kjaylee/.openclaw/workspace/eastsea-blog/scripts/tool-catalog-guard.py`

## Duplicate / overlap check
Repo scan performed in this cycle:
- `tools/*/index.html` slug scan for `chargeback`, `reserve`, `dispute`, `fraud`, `ratio`, `threshold`
- `specs/**` scan for the exact slug candidate

Observed state:
- Existing adjacent tools: `chargeback-loss-impact-calculator`, `chargeback-representment-roi-calculator`, `fraud-prevention-roi-calculator`, `rolling-reserve-cashflow-calculator`
- No exact tool exists for **chargeback rate threshold headroom** math
- No spec folder or shipped page already claims the slug `chargeback-rate-threshold-calculator`

Conclusion: this is adjacent to an existing payments-risk cluster, but still net-new and not a duplicate.

## Why this tool is commercially useful
The user behind this query is not browsing casually. They are usually a merchant, operator, or payments consultant asking one practical question:
> “How close am I to breach, and how much dispute volume can I survive before my processor or network flags me?”

That is strong bottom-of-funnel intent because the next action is often operational: improve fraud tooling, dispute ops, or payment stack.

## Source evidence used in this cycle
Because Brave search quota is exhausted, research used direct fetch plus fallback search.

### Source 1 — Chargebacks911: chargeback rate basics
URL: `https://chargebacks911.com/chargeback-rate/`
Key usable points extracted:
- “A chargeback rate is the ratio between the total number of transactions a merchant processes and the total number of chargebacks the merchant receives.”
- High chargeback rate can trigger monitoring programs and stricter rules.
- Public threshold references include **1%** and **1.5%** program bands in common merchant guidance.

### Source 2 — Chargebacks911: Visa VAMP / threshold update context
URL: `https://chargebacks911.com/visa-chargeback-threshold/`
Key usable points extracted:
- Visa consolidated prior monitoring regimes into **VAMP**.
- Count-based monitoring still matters operationally; merchants can be penalized if dispute activity breaches program thresholds.
- Public guidance is changing, so pretending one universal ratio formula is “the” official answer is unsafe.

### Source 3 — Chargeflow: ratio formula and threshold bands
URL: `https://www.chargeflow.io/blog/chargeback-ratio-calculate`
Key usable points extracted:
- Merchants explicitly use the terms **chargeback ratio**, **chargeback rate**, and **chargeback-to-transaction ratio** interchangeably.
- Public merchant guidance commonly references **1% monitored** and **1.5% excessive** bands plus count thresholds like **100 chargebacks/month**.
- Different networks / processors may use different denominator timing conventions.

## Research insight that changes product scope
Public web guides conflict on whether a given network uses current-month or prior-month transaction denominators.

That means the dangerous implementation would be:
- pretending one public blog has the final official formula
- hard-coding network-specific claims that may already be stale

So v1 should instead compute **both** of the merchant-facing views that operators actually need:
1. **Same-month ratio** = current chargebacks / current-month transactions
2. **Lagged ratio** = current chargebacks / previous-month transactions

This turns a source-conflict into product value: the tool becomes a safer operator dashboard instead of a brittle compliance claim.

## Chosen product thesis
Build a static calculator that shows:
- same-month ratio
- lagged ratio
- headroom to 1.0% and 1.5% thresholds under both denominator views
- max disputes allowed before breach
- transactions required to get back under threshold
- current monthly fee / revenue exposure from the dispute volume

## Narrow v1 scope
Inputs:
- current-month chargebacks
- current-month card transactions
- previous-month card transactions
- average order value
- average chargeback fee
- recovery / representment win rate
- monitored threshold % (default 1.0)
- excessive threshold % (default 1.5)
- monitored threshold dispute count (default 100)

Outputs:
- same-month chargeback ratio
- lagged-denominator chargeback ratio
- max disputes allowed at monitored / excessive threshold
- dispute headroom / overage under both denominator views
- transactions needed to get back under 1.0%
- gross disputed volume
- unrecovered disputed revenue
- fee burn
- total monthly exposure
- annualized exposure
- summary text for operator handoff

## Explicitly out of scope for v1
- official legal or scheme-compliance advice
- brand-specific promise that Visa/Mastercard use one exact formula forever
- fraud-report-only programs beyond simple reference notes
- processor-specific penalty schedules
- multi-network blended routing

## Verification posture locked up front
Planned commands:
```bash
node --check tools/chargeback-rate-threshold-calculator/calculator.js
node --check tools/chargeback-rate-threshold-calculator/app.js
node --test tests/unit/chargeback-rate-threshold-calculator.test.mjs
bash scripts/build-manifests.sh
python3 scripts/tool-catalog-guard.py --root . --fail-on none
python3 -m http.server 4173 -d .
curl -I http://127.0.0.1:4173/tools/chargeback-rate-threshold-calculator/
```

## Decision
Proceed with **Chargeback Rate Threshold Calculator**.

Why this beats another generic fee calculator right now:
- still monetizable and operator-grade
- complements an emerging payments-risk cluster already present in the repo
- diversifies away from over-produced platform-fee calculators
- can be shipped safely as deterministic client-side math in one cycle
