# Research — GOAT Fee Calculator

## Goal
Identify one distinct exact-match monetization tool gap for EastSea that:
- is absent from the current repo,
- does not overlap recent heartbeat topics,
- has clear commercial search intent,
- and can be verified with local repo inspection only.

## Chosen gap
`goat-fee-calculator`

## Non-overlap verification
Local repo checks run from `/Users/kjaylee/.openclaw/workspace/eastsea-blog`:

```bash
rg -n "goat-fee-calculator|GOAT fee|GOAT seller|goat seller" \
  tools specs _data/tools-list.json tools/index.md tools/index.html tools/manifest.json

python3 - <<'PY'
import pathlib
root = pathlib.Path('.')
print('tools_dir_exists', (root/'tools'/'goat-fee-calculator').exists())
for path in [root/'tools'/'index.html', root/'tools'/'index.md', root/'tools'/'manifest.json', root/'_data'/'tools-list.json']:
    print(path.as_posix(), path.read_text(errors='ignore').count('goat-fee-calculator'))
print('spec_dirs', [p.name for p in (root/'specs').iterdir() if p.is_dir() and 'goat-fee-calculator' in p.name])
PY

rg -n "heartbeat-p1|next-tool|skool-fee-calculator|amazon-handmade-fee-calculator|payhip-fee-calculator|gumroad-net-revenue-calculator|merchant-of-record-vs-direct-billing-profit-calculator|app-store-vs-web-checkout-profit-calculator|marketplace-fee-profit-calculator" specs
```

Observed results:
- `rg` returned no GOAT matches in the inspected discovery and spec surfaces.
- `tools/goat-fee-calculator/` does not exist.
- `tools/index.html` count for `goat-fee-calculator`: `0`
- `tools/index.md` count for `goat-fee-calculator`: `0`
- `tools/manifest.json` count for `goat-fee-calculator`: `0`
- `_data/tools-list.json` count for `goat-fee-calculator`: `0`
- `spec_dirs`: `[]`
- Recent heartbeat work is concentrated on other slugs, including:
  - `heartbeat-p1-20260325-app-store-vs-web-checkout-profit-calculator`
  - `heartbeat-p1-20260325-gumroad-net-revenue-calculator`
  - `heartbeat-p1-20260325-merchant-of-record-vs-direct-billing-profit-calculator`
  - `heartbeat-p1-20260325-payhip-fee-calculator`
  - `heartbeat-p1-20260326-marketplace-fee-profit-calculator`
  - `heartbeat-p1-20260326-next-tool-amazon-handmade-fee-calculator`
  - `heartbeat-p1-20260327-skool-fee-calculator`

Conclusion: `goat-fee-calculator` is a clean repo-local gap and does not collide with the latest heartbeat topics.

## Adjacent catalog coverage reviewed
EastSea already ships adjacent seller-economics tools for other resale marketplaces:
- `mercari-fee-calculator`
- `poshmark-fee-profit-calculator`
- `stockx-fee-profit-calculator`
- `grailed-fee-profit-calculator`
- `depop-fee-profit-calculator`
- `whatnot-seller-fee-calculator`
- `discogs-fee-profit-calculator`
- `reverb-fee-profit-calculator`

This matters because:
- the site already has a proven monetization-tool cluster around seller fees and payout math,
- GOAT fits the same user journey,
- and the proposed page would extend an existing exact-match marketplace pattern instead of inventing a new category.

## Conservative opportunity reasoning
Why this gap is commercially useful:
- Query intent is transactional. People searching `goat fee calculator` or `GOAT seller fee calculator` are usually evaluating whether a sale is worth listing or accepting.
- The user is close to revenue. This is stronger monetization intent than generic sneaker-content queries.
- EastSea already wins similar intent on adjacent marketplaces, so internal linking and catalog coherence are strong.
- GOAT is distinct from `stockx-fee-profit-calculator`; sneaker sellers often cross-list and compare payout platform by platform.

Why the opportunity case is conservative, not inflated:
- I am not claiming search volume from external tools.
- I am not assuming GOAT queries are bigger than StockX or Grailed queries.
- I am only claiming this is a plausible exact-match gap with clear seller-intent and good cluster fit inside the current repo.

## Product shape recommendation
Recommended v1 shape:
- calculator, not a broad marketplace guide
- direct payout / take-home framing
- break-even listing price and target profit reverse solver
- baseline preset plus custom fee override

This keeps the page:
- exact-match searchable,
- commercially aligned,
- and resilient even if GOAT adjusts some fee details later.

## Risk notes
- GOAT fee rules may vary by seller tier, region, or fulfillment path.
- A bad v1 would overstate precision by pretending every seller has the same fee stack.
- Therefore the future implementation should anchor to one explicitly named public baseline, expose custom override inputs, and label non-modeled flows as out of scope.

## Repo hygiene notes
- `git status --short` shows many unrelated modified and untracked files already present in the working tree.
- This task should touch only a new docs folder under `specs/`.
