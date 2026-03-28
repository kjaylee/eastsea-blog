# Research — Heartbeat Queue #103

## Goal
Discover one distinct exact-match monetization tool gap for `eastsea-blog` and document it without implementation.

## Chosen gap
`ecpm-calculator`

Exact-match target:
- `eCPM calculator`

Secondary support phrases:
- `effective cpm calculator`
- `ad monetization ecpm calculator`
- `publisher ecpm calculator`

## Why this fits the brief
- It is an exact-match calculator query, not a broad content theme.
- It is commercially useful for publisher ops, ad monetization managers, app operators, and media founders who need to convert revenue and impressions into a comparable monetization metric.
- It avoids the banned and crowded heartbeat lanes from March 25-27, 2026:
  - `bandcamp-fee-calculator`
  - `beehiiv-vs-substack-profit-calculator`
  - `fanfix`
  - `udemy-instructor-revenue-calculator`
  - `goat-fee-calculator`
  - `whop-fee-calculator`
  - `msp-pricing-calculator`
  - `upwork-fee-calculator`
  - `stan-store-fee-calculator`
  - `amazon-handmade-fee-calculator`
  - `onlyfans-earnings-calculator`
  - `saas-quick-ratio-calculator`
  - `saas-magic-number-calculator`
  - `thinkific-fee-calculator`
  - `quickbooks-payments-fee-calculator`
- It also stays out of the nearby creator/course/payment-fee cluster already dense in the repo.

## Repo-local verification
Commands used from `/Users/kjaylee/.openclaw/workspace/eastsea-blog`:

```bash
python3 - <<'PY'
from pathlib import Path
root = Path('.')
slug = 'ecpm-calculator'
for rel in ['tools/index.html', 'tools/index.md', 'tools/manifest.json', '_data/tools-list.json']:
    text = (root / rel).read_text(errors='ignore')
    print(rel, text.count(slug))
print('tool_dir_exists', (root / 'tools' / slug).exists())
print('spec_dirs', [p.name for p in (root / 'specs').iterdir() if p.is_dir() and slug in p.name])
PY

rg -n "ecpm-calculator|eCPM calculator|ecpm calculator" \
  tools specs _data/tools-list.json tools/manifest.json

find specs -maxdepth 1 -type d | sort | rg \
  "bandcamp|beehiiv|fanfix|udemy|goat|whop|msp-pricing|upwork|stan-store|amazon-handmade|onlyfans|saas-quick-ratio|saas-magic-number|thinkific|quickbooks-payments"
```

Observed evidence:
- `tools/index.html` count for `ecpm-calculator`: `0`
- `tools/index.md` count for `ecpm-calculator`: `0`
- `tools/manifest.json` count for `ecpm-calculator`: `0`
- `_data/tools-list.json` count for `ecpm-calculator`: `0`
- `tools/ecpm-calculator/` does not exist
- No existing `specs/` folder matches the slug
- Repo search only surfaced `eCPM` as an input inside broader calculators, not as a shipped exact-match page

## Nearby repo coverage reviewed
Existing EastSea tools that are adjacent but not duplicates:
- `cpm-calculator`
- `ad-rpm-optimizer`
- `mobile-ad-frequency-cap-roi-calculator`
- `podcast-dynamic-ad-insertion-roi-calculator`
- `mobile-game-iap-ad-mix-revenue-calculator`

Why they do not close this gap:
- `cpm-calculator` is advertiser-side cost math, not publisher-side monetization math.
- `ad-rpm-optimizer` is a broader pageview-slot optimization model. It does not answer the exact-match `eCPM calculator` intent.
- The other tools use eCPM as one input inside narrower scenarios, not as the primary query target.

## Conservative opportunity reasoning
- The intent is commercially close to revenue. People searching `eCPM calculator` usually need to benchmark ad monetization yield, forecast payout, or compare channels/networks.
- EastSea already has an ad monetization cluster, so this page would have strong internal-link fit without drifting back into creator fee pages or SaaS metrics.
- Reasoning here is intentionally conservative:
  - no claim about exact search volume,
  - no claim of fast rankings,
  - only the narrower claim that this is a real, repo-local exact-match gap with monetization intent.

## Why this beats nearby options
Rejected or deprioritized:
- `arpdau-calculator`
  - commercially useful, but narrower to mobile apps and more jargon-heavy.
- `ad-refresh-revenue-calculator`
  - useful, but more strategy-specific and less obviously exact-match.
- another marketplace or creator fee calculator
  - explicitly excluded by the task and already overrepresented in the repo.

## Office-hours framing
1. Who has the problem?
   - Publisher operators, monetization managers, app growth teams, indie media owners.
2. Concrete situation
   - They know impressions and revenue, but need a normalized yield metric to compare channels, dates, or ad partners.
3. Current workaround
   - Spreadsheet math, ad-network dashboards, or manual calculator reuse.
4. Ideal outcome
   - A fast exact-match page that calculates gross and net eCPM, then turns the metric into target-gap planning outputs.
5. Constraints
   - This heartbeat task is docs only.
   - Future v1 should stay narrow and avoid turning into a full RPM optimization suite.
6. Success metric
   - Future users can calculate or reverse-solve eCPM in under a minute and immediately see monetization implications.

## Recommended future product shape
Future implementation should stay narrow:
- Page name: `eCPM Calculator`
- Core modes:
  - solve `eCPM` from revenue + impressions
  - solve revenue from eCPM + impressions
  - solve impressions from revenue + eCPM
- Monetization-specific additions:
  - gross vs net eCPM
  - optional revenue-share / mediation fee drag
  - revenue at 10k / 100k / 1M impressions
  - required revenue to hit a target net eCPM

## Decision
`ecpm-calculator` is the strongest fit for heartbeat queue task `#103`:
- absent from the current repo,
- distinct from recent heartbeat topics,
- commercially useful,
- and aligned with EastSea's monetization cluster without returning to creator/course/payment-fee overlap.
