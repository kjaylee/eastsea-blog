# Test Cases — relay-merge-raiders

- TC-F001: Initial state boots in dock phase with zero economy.
- TC-F002: Start wave transitions to active phase with timer and shield reset.
- TC-F003: Lane movement clamps at left/right bounds.
- TC-F004: Salvage collision increases run value and carries into inventory after settlement.
- TC-F005: Triple mine collision forces crash settlement and returns to dock.
- TC-F006: Merge action upgrades highest available pair (`Tn -> Tn+1`).
- TC-F007: Sponsor + premium actions increase settled revenue over control scenario.

## Manual QA checks
- TC-U001: 390x844 layout remains playable (buttons visible, canvas responsive).
- TC-P001: No JS syntax errors (`node --check`).
- TC-R001: Route loads with expected title via local HTTP server.
- TC-D001: Progress persists through localStorage key reload.
