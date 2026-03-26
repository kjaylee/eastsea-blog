# Research — tool-opportunity-ranker-20260326

## Objective
Advance P1 tool mass production by turning the existing `eastsea-blog` tool corpus into a deterministic next-action backlog instead of choosing the next tool ad hoc.

## Files reviewed
- `scripts/tool-catalog-guard.py`
- `scripts/tool-formula-scaffold.py`
- `scripts/README.md`
- `tools/manifest.json`
- `_data/tools-list.json`
- `specs/heartbeat-p1-20260325-payhip-fee-calculator/research.md`
- `specs/heartbeat-p1-20260325-merchant-of-record-vs-direct-billing-profit-calculator/research.md`
- Generated baseline audit: `specs/tool-opportunity-ranker-20260326/artifacts/catalog-guard.md`

## Inventory findings
Current first-party inventory is already far beyond the original “102 tools” threshold, so the real bottleneck is not raw page count.

Baseline counts from `tool-catalog-guard.py` and repo scan:
- Filesystem tool pages: **681**
- `tools/manifest.json` entries: **681**
- `_data/tools-list.json` entries: **498**
- Missing `_data/tools-list.json` entries: **190**
- Tools lacking external logic modules: **585**
- Tools lacking deterministic automated tests: **601**

This means the highest-leverage missing slice is **selection + prioritization automation**: the repo already contains hundreds of partially shipped tools, but it lacks a deterministic way to choose the next shippable repair.

## Why a ranker beats shipping one more random tool
A single additional calculator would move the count by +1, but it would not reduce the main operational bottleneck:
1. too many partially shipped pages,
2. too many missing discovery entries,
3. too many pages with inline logic but no reusable/testable module.

A ranker converts those latent pages into a reproducible backlog so future heartbeat runs can choose the best next slice in seconds.

## Candidate evidence from the generated report
`tool-opportunity-ranker.py` ranked these as the strongest next opportunities:
1. `marketplace-fee-profit-calculator` — score **124**
2. `checkout-express-payment-conversion-roi-calculator` — score **108**
3. `micro-saas-launch-profit-calculator` — score **107**
4. `mobile-game-iap-ad-mix-revenue-calculator` — score **107**
5. `saas-trial-conversion-revenue-forecast` — score **107**

Top recommendation rationale for `marketplace-fee-profit-calculator`:
- already present in `tools/manifest.json`
- already present in `_data/tools-list.json`
- has **6447 inline script chars**, so extraction is likely surgical rather than a rewrite
- missing external JS/MJS logic module
- missing deterministic automated tests
- strong monetization-intent slug tokens: `fee`, `profit`, `marketplace`

## Decision
Implement a new repo utility: **`scripts/tool-opportunity-ranker.py`**.

This is the smallest real slice that:
- materially advances the mass-production pipeline,
- identifies the highest-leverage missing/shippable opportunity with evidence,
- is verifiable in one cycle,
- creates an artifact future subagents can consume without re-researching the corpus.

## Red Team
- Attack 1: “This is just another report; it does not ship a tool.”
  - Defense: the current bottleneck is backlog selection, not page creation. The repo already has 681 tool pages and 630 ranked gaps.
- Attack 2: “Heuristic scoring could pick the wrong candidate.”
  - Defense: the script emits transparent sub-scores and reasons, so the heuristic is inspectable and adjustable rather than hidden.
- Attack 3: “The ranker may duplicate what `tool-catalog-guard.py` already does.”
  - Defense: `tool-catalog-guard.py` finds integrity problems; it does not rank which one to fix next. The new script fills that missing decision layer.
- 합의: 🟢극복
