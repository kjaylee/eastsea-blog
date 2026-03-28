# Research — SaaS Magic Number Calculator

## Goal
Discover one distinct exact-match monetization tool gap for `eastsea-blog` and document it without implementation.

## Chosen gap
`saas-magic-number-calculator`

Secondary phrase worth supporting later:
- `SaaS magic number`

## Why this fits the brief
- It is an exact-match calculator query, not a broad content theme.
- It stays out of the recent creator/course heartbeat lane already crowded by:
  - `udemy-instructor-revenue-calculator`
  - `thinkific-fee-calculator`
  - `skool-fee-calculator`
  - `teachable-fee-calculator`
  - `kajabi-fee-calculator`
  - `memberstack-fee-calculator`
  - `whop-fee-calculator`
- It is commercially useful for SaaS founders, finance operators, RevOps leads, and investors evaluating go-to-market efficiency.
- It fits EastSea's monetization cluster without duplicating shipped pages.

## Repo-local verification
Commands used from `/Users/kjaylee/.openclaw/workspace/eastsea-blog`:

```bash
python3 - <<'PY'
from pathlib import Path
root = Path('.')
slug = 'saas-magic-number-calculator'
for rel in ['tools/index.html', 'tools/index.md', 'tools/manifest.json', '_data/tools-list.json']:
    text = (root / rel).read_text(errors='ignore')
    print(rel, text.count(slug))
print('tool_dir_exists', (root / 'tools' / slug).exists())
print('spec_dirs', [p.name for p in (root / 'specs').iterdir() if p.is_dir() and slug in p.name])
PY

rg -n "saas magic number|magic number calculator|magic number|sales efficiency" \
  tools specs _data/tools-list.json

find specs -maxdepth 1 -type d | sort | rg \
  "udemy|thinkific|skool|memberstack|whop|upwork|goat|saas-quick-ratio|msp-pricing"
```

Observed evidence:
- `tools/index.html` count for `saas-magic-number-calculator`: `0`
- `tools/index.md` count for `saas-magic-number-calculator`: `0`
- `tools/manifest.json` count for `saas-magic-number-calculator`: `0`
- `_data/tools-list.json` count for `saas-magic-number-calculator`: `0`
- `tools/saas-magic-number-calculator/` does not exist
- No existing `specs/` folder matches the slug
- Repo search only surfaced the term `magic number` inside prior research notes, not in a shipped page or existing spec for this slug

## Nearby repo coverage reviewed
Existing EastSea tools that are adjacent but not duplicates:
- `saas-quick-ratio-calculator`
- `saas-ltv-cac-analyzer`
- `saas-unit-economics-calculator`
- `cac-payback-period-calculator`
- `pricing-tier-mix-revenue-simulator`
- `subscription-gross-net-retention-calculator`
- `saas-expansion-mrr-waterfall-calculator`

Why they do not close this gap:
- They answer retention, unit-economics, pricing-mix, or growth-quality questions.
- None land on the exact-match query `saas magic number calculator`.
- None reduce the specific operator question: "How much annualized recurring revenue did last quarter's sales and marketing spend create?"

## Opportunity reasoning
- Search intent is commercial and decision-oriented. The likely user is evaluating whether sales and marketing spend is efficient enough to support hiring, pricing, fundraising, or channel expansion.
- The page can monetize through SEO capture into adjacent SaaS operator tools already in the repo.
- The keyword shape is narrow enough for exact-match relevance while still sitting inside a valuable SaaS monetization cluster.
- Reasoning is intentionally conservative:
  - I am not claiming a specific search-volume number.
  - I am not claiming EastSea will outrank established finance publishers quickly.
  - I am only claiming this is a real, unshipped, exact-match gap with credible commercial intent and cluster fit.

## Why this beats nearby options
Rejected or deprioritized for this task:
- `rule-of-40-calculator`
  - Strong term, but it blends growth and profitability in a broader board-level metric and is less tightly tied to the specific S&M-efficiency question.
- `burn-multiple-calculator`
  - Useful, but more finance and cash-efficiency oriented than monetization planning.
- Another creator or course fee calculator
  - Excluded explicitly because the recent heartbeat queue already leaned heavily into Udemy and adjacent creator/course monetization tools.

## Office-hours framing
1. Who has the problem?
   - SaaS founders, finance leads, RevOps, and GTM operators.
2. Concrete situation
   - A team wants to know whether prior-quarter sales and marketing spend produced enough recurring revenue growth to justify current acquisition strategy.
3. Current workaround
   - Spreadsheet math, investor decks, or generic finance templates.
4. Ideal outcome
   - A simple page that converts quarter-over-quarter recurring revenue change into an interpretable efficiency ratio with target-gap planning outputs.
5. Constraints
   - Docs only in this task.
   - Future v1 should avoid ambiguous variants and stay explicit about formula assumptions.
6. Success metric
   - Future implementation should let an operator calculate the metric in under a minute and understand whether they are below, around, or above a reasonable efficiency band.

## Recommended future product shape
Future implementation should stay narrow:
- Exact-match page name: `SaaS Magic Number Calculator`
- Core inputs:
  - previous quarter recurring revenue
  - current quarter recurring revenue
  - previous quarter sales and marketing spend
  - target magic number
- Core outputs:
  - magic number
  - recurring revenue delta
  - annualized recurring revenue added
  - ARR created per $1 of prior-quarter S&M spend
  - efficiency band
  - required current-quarter recurring revenue to hit target
  - maximum prior-quarter S&M spend allowed to hit target

## Risks
- The phrase is niche enough that some users may know the metric but not the exact formula details.
- Different explainers sometimes frame the revenue input loosely, which can create confusion between quarterly recurring revenue and ARR-style framing.
- A shallow implementation could feel too thin because the base formula is short.

Mitigations for a future build:
- Keep the page title and H1 explicitly `SaaS Magic Number Calculator`.
- Use quarter-based recurring revenue inputs and explain that the quarter-over-quarter delta is annualized inside the formula.
- Add target-gap outputs and a short interpretation band so the tool supports decisions, not just arithmetic.

## Decision
`saas-magic-number-calculator` is the strongest fit for stale heartbeat queue task `#95`:
- absent from the current repo,
- distinct from recent heartbeat topics,
- commercially useful,
- and well aligned with EastSea's SaaS monetization cluster without drifting back into creator/course overlap.
