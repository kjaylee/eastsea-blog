# Spec — YouTube Super Chat Revenue Calculator

## Objective
Create one new static tool at:

- `tools/youtube-super-chat-revenue-calculator/`

The tool must estimate creator take-home from YouTube Super Chat activity using editable live-stream and payout assumptions.

## Non-duplication requirement
This tool must remain clearly distinct from:

- `youtube-ad-revenue-estimator`
- `youtube-membership-break-even-calculator`
- `twitch-revenue-calculator`

It is specifically for one-off YouTube live paid-message revenue, not ad RPM math, recurring memberships, or all-platform streaming revenue.

## Deliverables
Create:

- `tools/youtube-super-chat-revenue-calculator/index.html`
- `tools/youtube-super-chat-revenue-calculator/calculator.js`
- `tools/youtube-super-chat-revenue-calculator/calculator.test.js`

Create required spec artifacts:

- `specs/heartbeat-p1-20260327-003323-youtube-super-chat-revenue-calculator/research.md`
- `specs/heartbeat-p1-20260327-003323-youtube-super-chat-revenue-calculator/spec.md`
- `specs/heartbeat-p1-20260327-003323-youtube-super-chat-revenue-calculator/plan.md`
- `specs/heartbeat-p1-20260327-003323-youtube-super-chat-revenue-calculator/red-team.md`
- `specs/heartbeat-p1-20260327-003323-youtube-super-chat-revenue-calculator/test-cases.md`
- `specs/heartbeat-p1-20260327-003323-youtube-super-chat-revenue-calculator/verification.md`
- `specs/heartbeat-p1-20260327-003323-youtube-super-chat-revenue-calculator/gap-analysis.md`
- `specs/heartbeat-p1-20260327-003323-youtube-super-chat-revenue-calculator/quality-loop.md`

Update only these discovery files:

- `_data/tools-list.json`
- `tools/index.html`
- `tools/index.md`
- `tools/manifest.json`

## UX requirements
- single static page
- English default with Korean toggle
- utility-first, mobile-friendly layout
- prominent KPI block plus detailed breakdown
- summary textarea with copy action
- related links to adjacent YouTube/Twitch monetization tools
- no backend, no API dependency, existing analytics script only

## Input contract
Required inputs:

- `streamsPerMonth` integer, `>= 1`
- `averageViewersPerStream` number, `>= 0`
- `payingViewerRatePct` percent, `0..100`
- `messagesPerPayingViewer` number, `>= 0`
- `averageSuperChatAmount` number, `>= 0`
- `creatorSharePct` percent, `> 0` and `<= 100`
- `refundRatePct` percent, `0..100`
- `withholdingTaxPct` percent, `0..100`
- `otherMonthlyCost` number, `>= 0`
- `targetMonthlyNet` number, `>= 0`
- `currency` string

## Output contract
The calculator must return:

- `monthlyLiveViews`
- `monthlyPayingViewers`
- `monthlyPaidMessages`
- `grossFanSpend`
- `platformShareLoss`
- `creatorShareBeforeAdjustments`
- `refundLoss`
- `withholdingTax`
- `takeHomeBeforeCosts`
- `monthlyNet`
- `takeHomePerStream`
- `takeHomePerThousandViews`
- `effectiveTakeHomeRatePct`
- `breakEvenPaidMessages`
- `breakEvenPayingViewerRatePct`
- `targetAverageSuperChatAmount`
- `targetPayingViewerRatePct`
- `summary`
- `status`

## Formula contract
Let:

- `streams = streamsPerMonth`
- `views = averageViewersPerStream`
- `viewerRate = payingViewerRatePct / 100`
- `messages = messagesPerPayingViewer`
- `amount = averageSuperChatAmount`
- `share = creatorSharePct / 100`
- `refund = refundRatePct / 100`
- `tax = withholdingTaxPct / 100`

Then:

- `monthlyLiveViews = streams * views`
- `monthlyPayingViewers = monthlyLiveViews * viewerRate`
- `monthlyPaidMessages = monthlyPayingViewers * messages`
- `grossFanSpend = monthlyPaidMessages * amount`
- `creatorShareBeforeAdjustments = grossFanSpend * share`
- `platformShareLoss = grossFanSpend - creatorShareBeforeAdjustments`
- `refundLoss = creatorShareBeforeAdjustments * refund`
- `takeHomeBeforeTax = creatorShareBeforeAdjustments - refundLoss`
- `withholdingTax = takeHomeBeforeTax * tax`
- `takeHomeBeforeCosts = takeHomeBeforeTax - withholdingTax`
- `monthlyNet = takeHomeBeforeCosts - otherMonthlyCost`
- `takeHomePerStream = monthlyNet / streams`
- `takeHomePerThousandViews = monthlyNet / (monthlyLiveViews / 1000)` when `monthlyLiveViews > 0`
- `effectiveTakeHomeRatePct = takeHomeBeforeCosts / grossFanSpend * 100` when `grossFanSpend > 0`

Supporting factor:

- `netFactor = share * (1 - refund) * (1 - tax)`

Then:

- `breakEvenPaidMessages = otherMonthlyCost / (amount * netFactor)` when denominator `> 0`
- `breakEvenPayingViewerRatePct = breakEvenPaidMessages / (monthlyLiveViews * messages) * 100` when denominator `> 0`
- `targetAverageSuperChatAmount = (targetMonthlyNet + otherMonthlyCost) / (monthlyPaidMessages * netFactor)` when denominator `> 0`
- `targetPayingViewerRatePct = (targetMonthlyNet + otherMonthlyCost) / (monthlyLiveViews * messages * amount * netFactor) * 100` when denominator `> 0`

Null-return rules:

- if any reverse-math denominator is `<= 0`, return `null` for that metric

## Validation rules
- invalid inputs return `{ result: null, error: string }`
- percent fields must remain below `100` unless explicitly bounded at `100`
- `streamsPerMonth` must be integer

## Discovery requirements
- each of the four required discovery files must contain the new slug exactly once
- do not edit any other discovery/catalog files

## Done definition
Done means:

1. the page exists and renders over local HTTP if the environment permits
2. `node --check` passes for the calculator module
3. `node --test` passes for the new test file
4. exact-once discovery assertions pass
5. verification evidence is recorded
