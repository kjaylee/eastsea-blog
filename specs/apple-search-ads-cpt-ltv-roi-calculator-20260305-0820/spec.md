# Spec — apple-search-ads-cpt-ltv-roi-calculator

## Functional requirements
1. Create a unique tool directory under `tools/apple-search-ads-cpt-ltv-roi-calculator/`.
2. Implement a practical ROI/profit calculator for Apple Search Ads.
3. Inputs must include CPT, funnel rates, subscription LTV factors, and operating costs.
4. Render outputs:
   - monthly paid conversions
   - net LTV per paid user
   - monthly net profit
   - period net effect
   - ROI (%)
   - payback months
   - break-even CPT
   - break-even trial→paid conversion rate
5. Provide concise copy and summary textarea with copy action.
6. Ensure mobile-friendly responsive UI.
7. Wire discovery in `tools/index.html`, `tools/index.md`, and `tools/manifest.json`.

## Verification targets
- `node --check tools/apple-search-ads-cpt-ltv-roi-calculator/script.js`
- local HTTP 200 proof via curl
- manifest rebuild confirms new slug
