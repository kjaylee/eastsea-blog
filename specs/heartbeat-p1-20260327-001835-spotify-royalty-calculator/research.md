# Research: Spotify Royalty Calculator

Date: 2026-03-27
Slug candidate selected: `spotify-royalty-calculator`

## Discovery surfaces reviewed

1. Local eastsea discovery files
   - `_data/tools-list.json`
   - `tools/index.html`
   - `tools/index.md`
   - `tools/manifest.json`
2. Local tool inventory grep for monetization overlap
   - Query families checked: `spotify`, `royalty`, `stream revenue`, `creator monetization`, `music`.
3. Public web search
   - Exact-match search terms checked:
     - `spotify royalty calculator`
     - `spotify stream revenue calculator`

## Findings

### Existing eastsea overlap

- No current eastsea tool matches Spotify stream monetization intent.
- Current nearby tools are adjacent, not duplicates:
  - `redbubble-royalty-margin-calculator`
  - `steam-game-revenue-calculator`
  - creator/newsletter/platform fee calculators
- Repo-wide local scan on 2026-03-27 found zero discovery entries for `spotify`.

### Query intent

- `spotify royalty calculator` has direct, calculator-shaped intent.
- `spotify stream revenue calculator` also has direct intent, but the `royalty` phrasing maps better to Spotify’s own documentation language.
- Compared alternatives considered during discovery:
  - `youtube-shorts-revenue-calculator`
    - Rejected: higher overlap with existing YouTube monetization utilities.
  - `medium-partner-program-calculator`
    - Rejected: weaker exact-match visibility and murkier public payout mechanics.
  - `spotify-stream-revenue-calculator`
    - Rejected in favor of `spotify-royalty-calculator` because `royalty` better matches official Spotify terminology and artist search intent.

## Source-backed product constraints

### Spotify does not publish a fixed per-stream rate

Spotify Loud & Clear explicitly states there is no fixed amount paid per stream. “Per-stream rate” examples are back-calculated after total payouts and total streams, not a contractual platform constant.

Implication for implementation:
- Do not hard-code a fake “official Spotify payout rate.”
- Use editable payout assumptions.
- Explain that the calculator is a planning model, not a settlement statement.

### Spotify royalties flow to rights holders, not directly as a simple per-play fee

Spotify describes royalties as flowing to rights holders under a streamshare model. That means artist take-home depends on distributor/label/split structure after platform-side economics.

Implication for implementation:
- Include share and fee inputs after gross royalty estimation.
- Output both gross royalties and artist take-home.

### Spotify’s 1,000 annual-stream threshold is a useful utility KPI

Spotify’s Loud & Clear FAQ explains the annual minimum stream threshold for recording royalties is 1,000 streams in the previous 12 months.

Implication for implementation:
- Add an annualized-stream KPI and “gap to 1,000 streams” output.

## Decision

Ship `spotify-royalty-calculator` as an exact-match monetization tool with:
- editable monthly streams
- editable payout-per-stream assumption
- artist share %
- distributor fee %
- collaborator split %
- fixed monthly + annual distribution costs
- target-income reverse calculation
- 1,000 annual-stream threshold helper

## Sources

- Spotify Loud & Clear FAQ: https://loudandclear.byspotify.com/faqs/how-do-you-know-spotify-listeners-stream-more-music-than-listeners-on-other-services-and-why-does-that-matter/
- Spotify Loud & Clear FAQ on annual stream threshold: https://loudandclear.byspotify.com/faqs/why-did-spotify-decide-to-manage-under-1-000-streams-differently/
