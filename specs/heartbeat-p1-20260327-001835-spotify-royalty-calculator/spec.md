# Spec: Spotify Royalty Calculator

## Goal

Ship one new exact-match monetization tool with low local overlap and clear search intent:
- slug: `spotify-royalty-calculator`
- canonical intent: estimate Spotify royalties and artist take-home from stream volume assumptions

## User

Search-driven musicians, indie artists, managers, and music marketers who want a quick browser calculator for Spotify income planning.

## Jobs to be done

- Estimate gross royalties from monthly streams.
- Translate gross royalties into actual artist take-home after splits and fees.
- See annualized revenue quickly.
- Reverse-calculate streams needed to hit an income target.
- Check whether the catalog pace clears Spotify’s 1,000 annual-stream threshold.

## Non-goals

- No claim of an official Spotify per-stream payout.
- No tax/accounting advice.
- No distributor-by-distributor settlement replication.
- No unrelated discovery or UI refactors.

## Inputs

- Monthly streams
- Estimated payout per stream (USD)
- Artist share (%)
- Distributor fee (%)
- Collaborator split (%)
- Fixed monthly costs (USD)
- Annual distribution cost (USD)
- Target monthly take-home (USD)

## Outputs

- Gross monthly royalties
- Artist gross after share
- Distributor fee drag
- Collaborator payout
- Monthly take-home before fixed costs
- Monthly take-home after fixed costs
- Annual take-home after fixed costs
- Effective take-home per 1,000 streams
- Estimated annual streams
- Gap to 1,000 annual streams
- Streams needed for target monthly take-home

## Formula

1. `grossMonthlyRoyalties = monthlyStreams * payoutPerStream`
2. `artistGrossAfterShare = grossMonthlyRoyalties * artistSharePct`
3. `distributorFee = artistGrossAfterShare * distributorFeePct`
4. `afterDistributor = artistGrossAfterShare - distributorFee`
5. `collaboratorPayout = afterDistributor * collaboratorSplitPct`
6. `takeHomeBeforeFixed = afterDistributor - collaboratorPayout`
7. `monthlyFixedCostLoad = fixedMonthlyCosts + (annualDistributionCost / 12)`
8. `takeHomeAfterFixed = takeHomeBeforeFixed - monthlyFixedCostLoad`
9. `annualTakeHomeAfterFixed = takeHomeAfterFixed * 12`
10. `effectiveTakeHomePer1k = (takeHomeBeforeFixed / monthlyStreams) * 1000` when streams > 0
11. `estimatedAnnualStreams = monthlyStreams * 12`
12. `gapToAnnualThreshold = max(1000 - estimatedAnnualStreams, 0)`
13. `streamsNeededForTargetTakeHome = (targetMonthlyTakeHome + monthlyFixedCostLoad) / variableTakeHomePerStream`

Where:
- percentage inputs are converted to decimals
- `variableTakeHomePerStream = payoutPerStream * artistShare * (1 - distributorFee) * (1 - collaboratorSplit)`

## UX requirements

- Single-page calculator
- Mobile-safe layout
- Immediate recompute on input
- Clear disclaimer about no fixed per-stream Spotify rate
- Copyable plain-text summary
- FAQ section explaining assumptions

## Repo requirements

- Tool directory: `tools/spotify-royalty-calculator/`
- Required files:
  - `index.html`
  - `calculator.js`
  - `calculator.test.js`

## Discovery updates

Update only:
- `_data/tools-list.json`
- `tools/index.html`
- `tools/index.md`
- `tools/manifest.json`
