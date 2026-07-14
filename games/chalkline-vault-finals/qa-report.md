# Chalkline Vault Finals QA Report — 2026-07-15

## Passed

- Inline JavaScript parse: PASS (`new Function` parse).
- Catalog JSON parse and new ID count exactly one: PASS.
- Local static HTTP: 200, 25,316 bytes, expected title and QA hook present.
- Built-in deterministic `?qa=1` logic executed in a Node VM DOM harness: PASS.
  - title-start
  - routine-call
  - springboard-perfect
  - living-tuck
  - three-vault-result
  - localStorage
  - restart-control
  - pageerror collector empty
  - five wow factors reported
- Actual pointer listener chain executed in the same harness: pointerdown → pointermove 120px → pointerup produced flight and Perfect Board; airborne pointer Y changed angular velocity from 6.014 to 5.923.
- `render_game_to_text` returned flight and final game-over state with finite numeric values.
- Forbidden `#0a0a1a` and `neon-` patterns absent.
- `git diff --check`: PASS.

## Browser limitation

MiniPC browser QA was attempted first but the node was disconnected. Three SSH attempts to `100.80.169.94:22`, ICMP, and the NAS jump path all timed out. The Mac Studio browser was not used by policy. Therefore screenshots, real Chromium pageerror/overflow inspection, and browser-rendered visual review remain unverified. The skill-approved fallback of local static checks plus executable smoke traces was used.

## Runtime smoke output

```text
QA PASS
title-start ok
routine-call ok
springboard-perfect ok
living-tuck ok
three-vault-result ok
localStorage ok
restart-control ok
pageerror ok

REAL_POINTER_FLOW_OK mode=flight power=120 perfect=true fastOmega=6.014 slowOmega=5.923
```

## Release verdict

PASS with a documented visual-QA gap. Core state flow, real registered pointer handlers, save contract, syntax, catalog integrity, and static serving all passed; no known functional error remains.
