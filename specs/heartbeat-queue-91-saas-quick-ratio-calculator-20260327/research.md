# Research — SaaS Quick Ratio Calculator

## Goal
Discover one exact-match monetization tool gap for `eastsea-blog` on 2026-03-27 and document the opportunity without implementing anything.

## Chosen gap
`saas-quick-ratio-calculator`

Secondary phrase worth supporting later:
- `SaaS quick ratio`

## Why this fits the brief
- It is a clean exact-match calculator query, not a broad content topic.
- It avoids the recent heartbeat lanes called out for exclusion:
  - `goat-fee-calculator`
  - `whop-fee-calculator`
  - `msp-pricing-calculator`
- It also avoids nearby resale, creator-fee, and service-pricing clusters already present in the repo.
- It has direct commercial relevance for SaaS founders, finance operators, and investors evaluating growth efficiency.

## Repo-local verification
Commands used from `/Users/kjaylee/.openclaw/workspace/eastsea-blog`:

```bash
python3 - <<'PY'
from pathlib import Path
root = Path('.')
slug = 'saas-quick-ratio-calculator'
for rel in ['tools/index.html', 'tools/index.md', 'tools/manifest.json', '_data/tools-list.json']:
    text = (root / rel).read_text(errors='ignore')
    print(rel, text.count(slug))
print('tool_dir_exists', (root / 'tools' / slug).exists())
print('spec_dirs', [p.name for p in (root / 'specs').iterdir() if p.is_dir() and slug in p.name])
PY

rg -n "saas quick ratio|quick ratio calculator|rule of 40|burn multiple|magic number" \
  tools specs _data/tools-list.json tools/manifest.json

find specs -maxdepth 1 -type d | sort | rg \
  "goat-fee-calculator|whop-fee-calculator|msp-pricing-calculator|skool-fee-calculator|thinkific-fee-calculator|upwork-fee-calculator|grailed-fee-profit-calculator"
```

Observed evidence:
- `tools/index.html` count for `saas-quick-ratio-calculator`: `0`
- `tools/index.md` count for `saas-quick-ratio-calculator`: `0`
- `tools/manifest.json` count for `saas-quick-ratio-calculator`: `0`
- `_data/tools-list.json` count for `saas-quick-ratio-calculator`: `0`
- `tools/saas-quick-ratio-calculator/` does not exist
- No existing `specs/` folder matches the slug
- Repo search returned no current `rule of 40`, `burn multiple`, `magic number`, or `quick ratio` tool pages, which confirms this sub-cluster is still open

## Nearby repo coverage reviewed
Existing EastSea tools that are adjacent but not duplicates:
- `saas-nrr-calculator`
- `saas-unit-economics-calculator`
- `saas-expansion-mrr-waterfall-calculator`
- `saas-trial-conversion-revenue-forecast`
- `cac-payback-period-calculator`
- `subscription-gross-net-retention-calculator`
- `cohort-retention-revenue-estimator`

Why they do not close this gap:
- They cover retention, payback, unit economics, or forecast math.
- None land on the exact-match query `saas quick ratio calculator`.
- None reduce the founder question, “How efficiently is new and expansion recurring revenue offsetting churn and contraction right now?”

## External sanity check
Current search results and reference pages reviewed on 2026-03-27:
- Stripe explainer: `https://stripe.com/en-mx/resources/more/the-saas-quick-ratio`
- Wall Street Prep calculator/explainer: `https://www.wallstreetprep.com/knowledge/saas-quick-ratio/`
- Rows calculator: `https://rows.com/calculators/saas-quick-ratio-calculator`
- MRRLab calculator: `https://www.mrrlab.com/tools/quick-ratio-calculator`

What these sources support:
- The formula is stable across sources:
  - `quick ratio = (new MRR + expansion MRR) / (churned MRR + contraction MRR)`
- The metric is usually framed around MRR, though the same logic can be applied to ARR.
- A benchmark around `4.0` is commonly cited as healthy.
- There are live calculators in market, which validates search intent rather than inventing a query category.

## Conservative opportunity reasoning
- Search intent is commercial, not informational-only. The likely user is a founder, RevOps lead, finance lead, or investor checking whether growth quality is strong enough to support pricing, hiring, or fundraising decisions.
- The tool can monetize via SEO capture into adjacent high-value SaaS pages already present in the repo.
- The query is narrower than generic “SaaS metrics” content, which helps exact-match relevance.
- The opportunity case is conservative:
  - I am not claiming specific search volume.
  - I am not claiming EastSea can outrank established finance sites quickly.
  - I am only claiming this is a real, unshipped, exact-match gap with credible commercial intent and cluster fit.

## Why this beats nearby options
Rejected or deprioritized for this task:
- `rule-of-40-calculator`
  - Strong term, but it overlaps more with growth-vs-profit thought leadership content and is less operationally specific than quick ratio.
- `burn-multiple-calculator`
  - Useful, but it sits closer to finance/investor reporting than to EastSea's existing recurring-revenue calculator cluster.
- Another creator or marketplace fee calculator
  - Excluded because the repo already has heavy recent heartbeat traffic in creator, resale, and seller-fee lanes.

## Recommended future product shape
Future implementation should stay narrow:
- exact-match page name: `SaaS Quick Ratio Calculator`
- primary inputs:
  - new MRR
  - expansion MRR
  - churned MRR
  - contraction MRR
  - target quick ratio
- primary outputs:
  - quick ratio
  - gross MRR gained
  - gross MRR lost
  - net new MRR
  - health band
  - required additional MRR gain to hit target
  - maximum allowable MRR loss at current gains

This keeps the page:
- exact-match searchable,
- operationally useful,
- and distinct from broader SaaS KPI dashboards.

## Risks
- The phrase “quick ratio” is overloaded; some users may confuse the SaaS metric with the traditional liquidity ratio.
- Some competitor pages mix MRR and ARR labels loosely, which can create user confusion.
- A weak implementation would hide denominator-zero edge cases and overstate precision.

Mitigations for a future build:
- Use `SaaS Quick Ratio Calculator` consistently in title, H1, and FAQ.
- Keep the page MRR-first and explicitly say the same formula can be used with ARR if inputs use one consistent basis.
- Handle zero-loss and zero-activity states explicitly.

## Decision
`saas-quick-ratio-calculator` is the strongest fit for heartbeat queue task `#91`:
- absent from the current repo,
- distinct from recent heartbeat topics,
- commercially useful,
- and well aligned with EastSea's existing SaaS monetization cluster.
