# CPM Calculator — Test Cases

## TC1: Solve CPM
- Input: Cost=$500, Impressions=200,000
- Expected CPM: $2.50

## TC2: Solve Cost
- Input: CPM=$5, Impressions=100,000
- Expected Cost: $500

## TC3: Solve Impressions
- Input: CPM=$10, Cost=$250
- Expected Impressions: 25,000

## TC4: Zero/empty handling
- Missing input → no result shown, no NaN/Infinity

## TC5: File structure
- File exists at tools/cpm-calculator/index.html
- Contains analytics.js script tag
- Valid HTML (no unclosed tags)

## TC6: Catalog wiring
- tools-list.json includes cpm-calculator entry
- manifest.json includes cpm-calculator entry
