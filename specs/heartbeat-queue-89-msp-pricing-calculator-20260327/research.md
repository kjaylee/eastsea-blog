# Research — MSP Pricing Calculator

## Goal
Identify one exact-match monetization tool gap for `eastsea-blog` and capture artifact docs only.

Chosen slug: `msp-pricing-calculator`

Secondary exact-match phrase to target later: `managed service pricing calculator`

## Why this tool
- The repo already covers many creator, resale, and platform-fee calculators.
- On 2026-03-27, recent heartbeat work already touched `goat-fee-calculator`, `whop-fee-calculator`, and `thinkific-fee-calculator`, so another nearby fee tool would be low-signal duplication.
- EastSea has adjacent service-pricing tools, but not an MSP-specific pricing page with MSP-native cost drivers.
- `MSP pricing calculator` is commercial intent, not curiosity intent. The user is usually near quoting, packaging, or repricing a managed service agreement.
- Opportunity reasoning is conservative: this is not a claim of massive search volume, only that the query shape is exact-match, monetizable, and meaningfully different from EastSea's current tool set.

## Repo-local overlap check
Verification commands used for repo inspection:

```bash
cd /Users/kjaylee/.openclaw/workspace/eastsea-blog

python3 - <<'PY'
from pathlib import Path
root = Path('.')
for slug in ['msp-pricing-calculator', 'managed-service-pricing-calculator']:
    print('SLUG', slug)
    print('dir_exists', (root / 'tools' / slug).exists())
    for rel in ['tools/index.html', 'tools/index.md', 'tools/manifest.json', '_data/tools-list.json']:
        text = (root / rel).read_text(errors='ignore')
        print(rel, text.count(slug))
    print('spec_dirs', [p.name for p in (root / 'specs').iterdir() if p.is_dir() and slug in p.name])
PY

rg -n "msp-pricing-calculator|managed service pricing|MSP pricing" \
  tools specs _posts tests _data
```

Observed evidence before writing this spec set:
- `tools/msp-pricing-calculator/` does not exist.
- `tools/index.html` count for `msp-pricing-calculator`: `0`
- `tools/index.md` count for `msp-pricing-calculator`: `0`
- `tools/manifest.json` count for `msp-pricing-calculator`: `0`
- `_data/tools-list.json` count for `msp-pricing-calculator`: `0`
- No existing spec folder matched `msp-pricing-calculator`.
- Repo search returned no prior MSP-specific monetization tool or heartbeat artifact.

## Nearby tools reviewed
Adjacent shipped tools that could create overlap if the scope is too broad:
- `white-label-agency-margin-calculator`
- `professional-services-utilization-margin-calculator`
- `ai-retainer-profit-planner`
- `fractional-cmo-pricing-calculator`

Why they do not close this gap:
- They price agencies, consultants, or broad services.
- None model MSP-native variables like per-user stack cost, per-endpoint tooling, included support load, after-hours burden, onsite time, or one-time onboarding.
- None land on the exact-match query `MSP pricing calculator`.

## Office-hours framing
1. Who has the problem?
   - MSP owners, operators, and sales leads pricing a monthly managed IT agreement.
2. Concrete situation
   - An MSP is quoting a new client and needs to know whether a per-user or hybrid monthly price actually covers support labor, security/tool stack cost, onsite work, and onboarding.
3. Current workaround
   - Most teams use spreadsheets, rough "price per seat" rules, or generic agency calculators that miss MSP-specific cost drivers.
4. Ideal outcome
   - A quick page that returns recommended monthly MRR, onboarding fee, price per user, and break-even user count from a few operational assumptions.
5. Constraints
   - Docs only in this task.
   - No repo discovery edits.
   - Future v1 should avoid pretending to be a universal MSP quoting engine.
6. Success metric
   - Future implementation should let an MSP produce a defensible first-pass quote faster than a custom spreadsheet and expose margin compression clearly.

## Why `msp-pricing-calculator` beats nearby options
- It stays outside the saturated resale and creator-fee cluster already present in the repo.
- It is narrower than a generic `consulting-retainer-calculator`, which would overlap heavily with existing service tools.
- It has clearer buyer intent than a broad SaaS-finance page because the searcher is usually trying to price a live service offer.
- It can monetize via SEO capture plus adjacent B2B software/consulting lead generation without needing speculative market data.

## Proposed calculator model
Future implementation should help operators price an MSP agreement using:
- managed users
- managed endpoints
- servers or critical infrastructure count
- included support hours
- reactive support hours
- onsite hours
- vCIO or account-management hours
- technician loaded cost per hour
- senior strategy cost per hour
- per-user tool stack cost
- per-endpoint tool stack cost
- fixed vendor/platform cost per month
- after-hours multiplier
- travel or onsite expense
- payment fee rate
- target operating margin
- onboarding hours and implementation cost

Expected outputs:
- monthly delivery cost
- break-even monthly MRR
- recommended monthly MRR
- effective price per user
- gross margin at current quote
- onboarding fee
- 12-month contract value
- break-even managed user count

## Scope guardrails
- Do not turn it into a full PSA/RMM quoting system.
- Do not model taxes, financing, or procurement markups in v1.
- Do not claim market benchmark pricing by geography unless implementation later adds sourced reference data.
- Keep it as a planning calculator for internal pricing decisions.

## Conclusion
`msp-pricing-calculator` is a clean repo-local gap on 2026-03-27:
- no current tool slug collision,
- no current discovery collision,
- no recent heartbeat collision in the crowded creator/resale fee lane,
- and clear monetization fit with conservative reasoning.
