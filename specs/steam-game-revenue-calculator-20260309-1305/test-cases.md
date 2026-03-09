# Test Cases — steam-game-revenue-calculator

## A) Baseline
Inputs:
- unitsSold = 5000
- listPriceInclTax = 19.99
- discountRate = 15
- vatRate = 10
- refundRate = 8
- steamFeeRate = 30
- supportCostPerCopy = 0.4
- launchCost = 12000

Expected:
- gross sales, Steam net proceeds, total cost, and net profit are finite
- break-even copies are finite
- net margin is finite

## B) Invalid range
Inputs:
- listPriceInclTax <= 0
- any rate < 0 or >= 100
- supportCostPerCopy < 0
- launchCost < 0

Expected:
- validation error shown
- KPI outputs reset to `-`
- summary textarea cleared

## C) Impossible break-even
Inputs:
- unitsSold = 100
- listPriceInclTax = 5
- discountRate = 50
- vatRate = 20
- refundRate = 30
- steamFeeRate = 30
- supportCostPerCopy = 5
- launchCost = 5000

Expected:
- contribution per copy <= 0
- break-even copies display `달성 불가 / Not achievable`

## D) Zero fixed cost
Inputs:
- launchCost = 0 with otherwise valid positive contribution economics

Expected:
- break-even copies = 0

## E) Integration checks
1. `tools/index.html` contains `steam-game-revenue-calculator/`
2. `_data/tools-list.json` contains `/tools/steam-game-revenue-calculator/`
3. `tools/manifest.json` contains slug `steam-game-revenue-calculator`
4. Local HTTP `200`:
   - `/tools/steam-game-revenue-calculator/`
   - `/tools/index.html`
