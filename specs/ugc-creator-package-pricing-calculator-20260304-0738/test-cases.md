# Test Cases — ugc-creator-package-pricing-calculator

- TC-F001: title + input panel render without missing labels.
- TC-F002: changing any core input recomputes quote instantly.
- TC-F003: recommended quote and creator take-home are both displayed in KRW.
- TC-F004: copy summary button generates non-empty multiline proposal summary.
- TC-F005: reset defaults restores baseline scenario.
- TC-F006: validation blocks negative values and impossible percentages.
- TC-U001: 390x844 viewport keeps inputs and KPI cards readable without horizontal scroll.
- TC-P001: no JavaScript runtime errors on initial load.
- TC-D001: localStorage persistence restores last valid inputs on reload.
- TC-L001: unit test confirms quote increases with higher target margin.
- TC-L002: unit test confirms zero agency fee makes quote equal take-home.
