# Test Cases — eBay vs Poshmark Profit Calculator

## TC-01 baseline deterministic comparison
Given default inputs, the calculator should return a non-empty result, pick one winner, and expose both platform payout / net-profit fields.

## TC-02 eBay can win under low-ad-rate / buyer-shipping support
A scenario with buyer-paid eBay shipping and modest promoted rate should leave eBay ahead of Poshmark.

## TC-03 Poshmark can win when eBay promoted rate is heavy
A scenario with higher eBay promoted rate and seller shipping discount on Poshmark should allow Poshmark to win deterministically.

## TC-04 tie detection
A tuned scenario should report `winnerPlatform = tie` when profit delta falls within epsilon.

## TC-05 reverse solver parity
The price needed on eBay to match Poshmark and the price needed on Poshmark to match eBay should be deterministic and non-null for sane profitable scenarios.

## TC-06 invalid input validation
Negative money fields, bad percentages, or zero/negative realized sale price must return a human-readable error and `result = null`.

## TC-07 HTML scaffold coverage
`index.html` must contain the canonical URL, sibling calculator scripts, required result anchors, summary textarea, and related links.

## TC-08 discovery exact-once
The new slug must appear exactly once in:
- `tools/index.html`
- `tools/index.md`
- `_data/tools-list.json`
- `tools/manifest.json`
