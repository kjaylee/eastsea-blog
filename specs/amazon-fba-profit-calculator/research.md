# Research — amazon-fba-profit-calculator

## Goal
Ship one new static calculator at `/tools/amazon-fba-profit-calculator/` for Amazon FBA sellers who need a quick view of per-unit economics, monthly profit, break-even ACoS, break-even unit volume, and launch payback.

## Existing repo patterns reviewed
1. `tools/marketplace-promoted-listing-roi-calculator/index.html`
   - Pattern: single-file responsive calculator with bilingual framing, KPI cards, summary textarea, and optional language toggle.
   - Reuse: compact KPI layout + breakdown table for commerce metrics.
2. `tools/wholesale-margin-pricing-calculator/index.html`
   - Pattern: marketplace/e-commerce economics modeled with explicit per-order cost layers, break-even price, and concise status pill.
   - Reuse: per-unit contribution math and target-margin price handling.
3. `tools/llm-api-margin-calculator/{index.html,app.mjs,logic.mjs}` and `tests/unit/llm-api-margin-calculator.test.mjs`
   - Pattern: deterministic `logic.mjs`, thin `app.mjs`, browser-only `index.html`, and Node built-in tests.
   - Reuse: modular structure for explicit `node --check` and `node --test` verification.
4. `tools/index.html`, `tools/index.md`, `_data/tools-list.json`, `scripts/build-manifests.sh`
   - Repo fact: tool discovery is spread across landing/index surfaces plus generated `tools/manifest.json`.
   - Reuse: add one card + one markdown bullet + one tools-list entry, then regenerate manifest.
5. `specs/tool-catalog-guard/research.md`
   - Repo fact: public tool catalog truth spans `tools/index.html`, `_data/tools-list.json`, and `tools/manifest.json`.
   - Implication: all three must stay in sync for this slice.

## Product definition for this slice
- Target slug: `amazon-fba-profit-calculator`
- File structure:
  - `tools/amazon-fba-profit-calculator/index.html`
  - `tools/amazon-fba-profit-calculator/app.mjs`
  - `tools/amazon-fba-profit-calculator/logic.mjs`
  - `tests/unit/amazon-fba-profit-calculator.test.mjs`
- Required catalog wiring:
  - `tools/index.html`
  - `tools/index.md`
  - `_data/tools-list.json`
  - `tools/manifest.json` via `bash scripts/build-manifests.sh`

## Chosen formula design
Inputs model the core FBA profit stack:
- monthly units sold
- sale price per unit
- landed cost per unit
- Amazon referral fee %
- FBA fulfillment fee per unit
- prep/label cost per unit
- return rate %
- loss per return
- ad cost of sales (ACoS) %
- monthly storage cost
- monthly overhead
- one-time launch/setup cost
- analysis months
- target net margin %

Derived metrics:
- gross revenue
- referral fee total
- ad spend total
- landed product cost total
- FBA fulfillment total
- prep/label total
- return reserve total
- monthly net profit
- net margin %
- profit per unit
- period net profit after launch cost
- ROI over analysis period
- payback months
- break-even units at current pricing
- break-even ACoS at current pricing
- required sale price for target net margin

Core equations:
- `grossRevenue = units * price`
- `referralFees = grossRevenue * referralFeeRate`
- `adSpend = grossRevenue * acosRate`
- `returnReserve = units * returnRate * lossPerReturn`
- `monthlyNetProfit = grossRevenue - (referralFees + adSpend + landed + fulfillment + prep + returnReserve) - (storage + overhead)`
- `unitContribution = price * (1 - referralFeeRate - acosRate) - landedCostPerUnit - fulfillmentFeePerUnit - prepCostPerUnit - (returnRate * lossPerReturn)`
- `breakEvenUnits = fixedMonthlyCost / unitContribution` when `unitContribution > 0`
- `breakEvenAcos = (grossRevenue - referralFees - landed - fulfillment - prep - returnReserve - fixedMonthlyCost) / grossRevenue`
- `requiredPriceForTargetMargin = totalNonPriceCosts / (units * (1 - referralFeeRate - acosRate - targetMarginRate))`

## UX / implementation expectations
- Korean-first UI with concise English title metadata.
- Two-column desktop layout collapsing to one column on mobile.
- Live recalculation on input/change.
- Status pill with three states: profitable / near break-even / loss-making.
- Summary textarea + copy button.
- localStorage persistence for user inputs.

## Risks and mitigations
- **Risk:** invalid fee combinations can make denominator <= 0.
  - **Mitigation:** explicit validation for `referralFeePct + acosPct < 100` and `targetNetMarginPct < 100 - referralFeePct - acosPct`.
- **Risk:** negative or infinite break-even outputs.
  - **Mitigation:** return `Infinity` for impossible break-even states and render `N/A` in UI.
- **Risk:** catalog drift after adding the page.
  - **Mitigation:** update `tools/index.html`, `tools/index.md`, `_data/tools-list.json`, then regenerate `tools/manifest.json`.

## Verification contract
- `node --check tools/amazon-fba-profit-calculator/logic.mjs`
- `node --check tools/amazon-fba-profit-calculator/app.mjs`
- `node --test tests/unit/amazon-fba-profit-calculator.test.mjs`
- `bash scripts/build-manifests.sh`
- `node -e "const m=require('./tools/manifest.json'); ..."` manifest entry check
- local HTTP smoke using `python3 -m http.server` + `curl -I http://127.0.0.1:<port>/tools/amazon-fba-profit-calculator/`
- write command outputs to `tmp/amazon-fba-profit-calculator-*`
