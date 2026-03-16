# Etsy Shipping Calculator - Implementation Plan

## Files to Create
1. `tools/etsy-shipping-calculator/calculator.js` - Core logic with module.exports
2. `tools/etsy-shipping-calculator/calculator.test.js` - 12 deterministic tests
3. `tools/etsy-shipping-calculator/index.html` - Standalone bilingual dark-theme UI

## Implementation Steps
1. Define carrier rate tables as constants
2. Implement dimensional weight calculation
3. Implement rate lookup by carrier, zone, billable weight
4. Implement Etsy fee calculation (6.5% on shipping)
5. Implement free-shipping vs charged-shipping comparison
6. Build summary output
7. Wire browser UI with KPI cards
8. Add to manifest.json and tools-list.json

## Architecture
- UMD pattern matching etsy-fee-profit-calculator
- `calculate(input, options)` returns `{ result, error }`
- Rate tables are simplified estimates (not live API calls)
- All calculations deterministic and testable
