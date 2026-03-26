# Red Team — shopify-app-store-revenue-share-calculator

## Primary risks
1. Overlap risk
   - Existing `shopify-fee-calculator` might look similar at first glance.
   - Mitigation: this tool is explicitly developer-side App Store revenue-share modeling, not merchant plan economics.

2. Formula ambiguity
   - The 0% band is based on prior recognized revenue, so modeling with monthly gross alone could overstate or understate fees.
   - Mitigation: require YTD recognized revenue before the month and split the month across the threshold.

3. Break-even math risk
   - A single linear formula would be wrong when the month partially crosses the threshold.
   - Mitigation: use piecewise contribution math and cover both sides in tests.

4. Discovery inconsistency risk
   - `_data/tools-list.json` already contains the slug while other discovery files do not.
   - Mitigation: patch only the missing surfaces and verify exact-once slug counts.

5. Manifest churn risk
   - Rebuilding manifests wholesale could create unrelated changes.
   - Mitigation: patch `tools/manifest.json` surgically with one new entry and updated count/timestamp only.
