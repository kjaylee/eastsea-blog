# Plan — P1 Monetization Tools Trio (2026-02-19 05:01 KST)

1. Create spec artifacts in required order (spec → plan → test-cases → tasks) before coding.
2. Implement `tools/breakeven-roas-calculator/index.html`:
   - Inputs: AOV, gross margin %, conversion rate %, ad spend, clicks.
   - Outputs: break-even ROAS, max CPA, max CPC, current ROAS, projected profit/loss.
3. Implement `tools/subscription-price-increase-impact-calculator/index.html`:
   - Inputs: current subscribers, current monthly price, proposed increase %, baseline churn %, churn delta, variable cost ratio %.
   - Outputs: before/after subscribers, MRR, gross profit, net monthly impact.
4. Implement `tools/conversion-funnel-revenue-forecast/index.html`:
   - Inputs: monthly visitors, opt-in %, sales-call %, close %, AOV, repeat purchases per buyer, ad spend.
   - Outputs: stage counts, orders, revenue, CAC, ROAS, traffic needed for target revenue.
5. Add robust validation and error states for invalid ranges (negative values, >100 rates, zero divisors).
6. Confirm each page contains `Back to Portal` link with `href='/'`.
7. Regenerate `tools/manifest.json` via `scripts/build-manifests.sh`.
8. Update `_data/tools-list.json` with 3 new URL entries.
9. Run local checks (JSON validity + grep for link + quick headless HTTP checks).
10. Commit and push on `master` in `eastsea-blog` only.
11. Verify production URLs return HTTP 200.
