# Test Cases — llm-api-margin-calculator

## Functional
- TC-F001: tool page renders title and all core input fields.
- TC-F002: changing price per user updates revenue and profit KPIs.
- TC-F003: summary textarea is populated with multiline business summary.
- TC-F004: copy summary action is available and reset restores defaults.
- TC-F005: invalid percentage (>100) triggers visible validation error.

## Logic / Unit
- TC-L001: validation rejects out-of-range percent values.
- TC-L002: higher subscription price increases operating profit (all else constant).
- TC-L003: higher cache-hit rate reduces input token cost.
- TC-L004: zero payment-fee rate makes net revenue equal gross revenue.
- TC-L005: break-even price per user stays positive under valid scenario.

## Quality / UX
- TC-U001: mobile viewport (390x844) keeps layout readable with no horizontal overflow.
- TC-U002: no runtime syntax errors in app and logic modules.
- TC-U003: tool route is served from local static server and title can be fetched via curl.
