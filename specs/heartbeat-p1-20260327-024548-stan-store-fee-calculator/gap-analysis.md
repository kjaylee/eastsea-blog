# Gap Analysis — Stan Store Fee Calculator

## Current gap
The repo has a dense creator monetization cluster but no Stan-specific exact-match tool.

## Evidence
- Discovery surfaces already include multiple creator-platform fee calculators.
- Current adjacent tools cover:
  - Substack
  - Payhip
  - Kajabi
  - Podia
  - Teachable
  - Gumroad
  - Ko-fi
  - Buy Me a Coffee
  - creator membership comparisons
- Current discovery surfaces do **not** expose `stan-store-fee-calculator`.

## Why this is a good next gap
1. High-intent platform query
2. Minimal factual ambiguity relative to more complex marketplaces
3. Clear monetization value
4. Low overlap with already-shipped exact pages

## Remaining risks after implementation
- Processor assumptions still need editable defaults
- Pro uplift framing can drift into speculation if not labeled clearly
- Discovery updates must remain exact-once

## Acceptance threshold
The gap is closed only if:
- the tool directory exists,
- the four required discovery files include the slug exactly once,
- logic tests pass,
- and the page explains that processor assumptions are editable planning inputs.
