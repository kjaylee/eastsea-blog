# Gap Analysis — eBay vs Poshmark Profit Calculator

## Remaining gaps
1. No multilingual copy toggle in v1.
2. No portfolio / monthly sales roll-up; this is per-item decision support only.
3. Poshmark shipping is simplified to seller shipping discount exposure, not every shipping-label edge case.
4. eBay store subscription discounts and region-specific fee overrides remain out of scope.

## Why acceptable for this cycle
- The core seller decision — “which platform leaves more money for this item?” — is answered now.
- The tool is static, deterministic, tested, and fits EastSea's existing monetization cluster.
- Any next iteration can layer on monthly rollups or multilingual UX without rewriting the fee core.
