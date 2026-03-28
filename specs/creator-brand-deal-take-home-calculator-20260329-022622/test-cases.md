# Test Cases — Creator Brand Deal Take-home Calculator

## Logic
1. `tc_cbd_01` validation rejects negative or non-finite money inputs.
2. `tc_cbd_02` validation rejects combined percentage deductions at or above 100%.
3. `tc_cbd_03` baseline scenario returns positive quote, net take-home, and rights subtotal.
4. `tc_cbd_04` increasing rights months increases quote and rights subtotal.
5. `tc_cbd_05` higher target net requires a higher reverse-solved quote.
6. `tc_cbd_06` zero target net returns zero required quote.
7. `tc_cbd_07` summary contains quote, net, target gap, and required quote language.

## Page structure
8. `tc_cbd_08` page contains canonical URL, JSON-LD `WebApplication`, analytics include, and `aria-live="polite"`.
9. `tc_cbd_09` page copy clearly states that it is deal take-home math rather than audience rate estimation.

## Catalog wiring
10. `tc_cbd_10` entry appears exactly once in:
    - `tools/index.html`
    - `tools/index.md`
    - `_data/tools-list.json`
    - `tools/manifest.json`
