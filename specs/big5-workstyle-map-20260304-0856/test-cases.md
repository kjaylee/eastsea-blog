# Test Cases — big5-workstyle-map

## Functional
- TC-F001: Intro screen renders and starts assessment flow.
- TC-F002: Question progress increments correctly across 15 items.
- TC-F003: Completion renders archetype name, tier label, bars, and summary text.
- TC-F004: Summary copy/share actions are available on result screen.
- TC-F005: Result includes monetization offer title, description, and CTA link.

## Logic / Unit
- TC-L001: Validation rejects wrong response length.
- TC-L002: Validation rejects non-integer values.
- TC-L003: Tie scenario resolves using deterministic dominant trait order.
- TC-L004: Reverse-coded question changes trait score direction correctly.
- TC-L005: Conscientiousness-heavy profile resolves to `precision-architect`.
- TC-L006: Summary contains key reporting fields including premium offer line.

## Quality
- TC-Q001: `node --check` passes for `logic.mjs` and `app.mjs`.
- TC-Q002: Unit test file passes under `node --test`.
- TC-Q003: `tests/unit/test-manifest.mjs` passes after manifest refresh.

