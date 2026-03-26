# Test Cases

## Math
1. Baseline mixed-membership scenario returns expected monthly-equivalent gross, fees, net, and target-member outputs.
2. Annual-heavy scenario reduces fixed-fee drag on a monthly-equivalent basis and keeps annual contribution positive.
3. Invalid input set rejects negatives, non-integer member counts, and out-of-range percentages.
4. Impossible contribution case returns `null` for break-even / target-member outputs.

## UI / HTML
5. HTML contains Ghost-specific title, summary output, copy button, language toggle, analytics include, and calculator script include.

## Discovery
6. Slug appears exactly once in:
   - `tools/index.html`
   - `tools/index.md`
   - `_data/tools-list.json`
   - `tools/manifest.json`
