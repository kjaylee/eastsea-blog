# Research — Whop Fee Calculator

## Goal
Find one net-new, exact-match monetization tool gap for `eastsea-blog`, keep it distinct from current repo coverage, and document it without implementation.

Chosen slug: `whop-fee-calculator`

## Repo-local verification
### Current gap check
Commands run:

```bash
rg -n "whop-fee-calculator|Whop Fee Calculator|whop fee calculator" \
  tools tools/index.html tools/index.md _data/tools-list.json tools/manifest.json specs tests
```

Result:
- No matches. `rg` exited with code `1`, which is the expected "no matches" signal.

```bash
node - <<'NODE'
const manifest=require('./tools/manifest.json').tools;
const toolsList=require('./_data/tools-list.json');
const slug='whop-fee-calculator';
const url=`/tools/${slug}/`;
console.log(JSON.stringify({
  manifestMatches: manifest.filter(x=>x.slug===slug||x.url===url).length,
  toolsListMatches: toolsList.filter(x=>x.slug===slug||x.url===url).length
}, null, 2));
NODE
```

Result:

```json
{
  "manifestMatches": 0,
  "toolsListMatches": 0
}
```

### Recent-heartbeat exclusion check
Commands run:

```bash
find specs -maxdepth 1 -type d | sort | rg \
  "goat|thinkific|skool|amazon-handmade|marketplace-fee-profit|gumroad-net-revenue|merchant-of-record|payhip|app-store-vs-web-checkout"
```

Observed recent / nearby topics:
- `specs/goat-fee-calculator-20260327`
- `specs/heartbeat-p1-20260325-app-store-vs-web-checkout-profit-calculator`
- `specs/heartbeat-p1-20260325-gumroad-net-revenue-calculator`
- `specs/heartbeat-p1-20260325-merchant-of-record-vs-direct-billing-profit-calculator`
- `specs/heartbeat-p1-20260325-payhip-fee-calculator`
- `specs/heartbeat-p1-20260326-marketplace-fee-profit-calculator`
- `specs/heartbeat-p1-20260326-next-tool-amazon-handmade-fee-calculator`
- `specs/heartbeat-p1-20260327-skool-fee-calculator`
- `specs/thinkific-fee-calculator-20260327`

Conclusion:
- `whop-fee-calculator` is not part of the current repo surface.
- It also avoids the very recent GOAT / resale / nearby marketplace heartbeat cluster.

## Nearby repo coverage
EastSea already covers adjacent creator- and seller-monetization tools, including:
- `kajabi-fee-calculator`
- `podia-fee-calculator`
- `teachable-fee-calculator`
- `memberful-fee-calculator`
- `sellfy-pricing-calculator`
- `stan-store-fee-calculator`
- `skool-fee-calculator`
- `substack-fee-calculator`
- `ghost-vs-substack-profit-calculator`

That cluster proves monetization tools fit the repo, but there is still no Whop-specific page.

## Why `whop-fee-calculator` beats nearby options
### 1. Exact-match search intent is clear
- The query family is direct and transactional: `whop fee calculator`, `whop payout calculator`, `how much does whop take`.
- Searchers are usually deciding whether to launch on Whop, comparing net take-home, or pricing a membership / community / digital product offer.

### 2. The fee model is public enough to model conservatively
Official Whop sources reviewed:
- `https://docs.whop.com/fees`
- `https://help.whop.com/en/articles/10336276-what-are-our-fees`
- `https://help.whop.com/en/articles/10760877-whop-creator-payments-faq`

Useful public fee components currently documented include:
- domestic card payments: `2.7% + $0.30`
- international card surcharge: `+1.5%`
- currency-conversion surcharge: `+1%`
- billing automation: `0.5%`
- tax/remittance: `0.5%`
- affiliate processing: `1.25%`
- payout fees that vary by method

That is enough for a narrow first-pass calculator if the implementation stays explicit about assumptions and optional fees.

### 3. Competitive evidence exists, but the SERP does not look crowded by dominant brands
Observed external competitor:
- `https://creatordia.com/tools/whop-fee-calculator`

Conservative read:
- there is at least one exact-match calculator already live, which validates search intent,
- but this does not look like an impossibly saturated term from repo-local evidence alone.

### 4. It is distinct from the recent resale wave
- GOAT, Mercari, Depop, Grailed, Whatnot, Facebook Marketplace, and Reverb all serve resale-marketplace seller economics.
- Whop is a creator / membership / digital-product platform with a different buyer journey and fee stack.
- That makes it a cleaner monetization gap than another resale payout tool.

## Candidate screening notes
Rejected or deprioritized for this task:
- `thinkific-fee-calculator`: already spec'd in `specs/thinkific-fee-calculator-20260327/`
- `circle-so-fee-calculator`: weaker public fee-model clarity from quick review, which raises implementation-risk
- `uscreen-fee-calculator`: likely useful, but public pricing / transaction-fee framing appears less deterministic than Whop

## Recommended scope
Ship a future static calculator at `tools/whop-fee-calculator/` focused on:
- gross sales
- transaction count
- domestic vs international share
- currency conversion share
- optional billing automation toggle
- optional tax/remittance toggle
- optional affiliate payout fee
- payout method assumption
- seller-side cost inputs

Core outputs:
- processor fees
- platform / optimization fees
- payout fees
- take-home before cost
- net profit after seller costs
- effective take rate
- break-even sale price or member count

## Conservative opportunity call
This is a solid but not overclaimed opportunity.
- High confidence that `whop-fee-calculator` is an unshipped EastSea gap.
- Medium confidence that the keyword is commercially valuable enough to justify implementation.
- High confidence that it fits the existing creator-monetization cluster better than another resale calculator right now.

## Sources
- Whop docs: `https://docs.whop.com/fees`
- Whop help: `https://help.whop.com/en/articles/10336276-what-are-our-fees`
- Whop help: `https://help.whop.com/en/articles/10760877-whop-creator-payments-faq`
- Competitor example: `https://creatordia.com/tools/whop-fee-calculator`
